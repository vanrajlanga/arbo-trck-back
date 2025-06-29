const { 
  Booking, 
  Customer, 
  Traveler, 
  BookingTraveler, 
  Trek, 
  Vendor, 
  Batch, 
  PickupPoint,
  Coupon 
} = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../models").sequelize;

// Create a new booking with travelers
const createBooking = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      trek_id,
      batch_id,
      pickup_point_id,
      coupon_id,
      travelers, // Array of traveler objects
      special_requests,
      booking_source = 'mobile'
    } = req.body;

    const customerId = req.customer.id;

    // Validate trek exists and is available
    const trek = await Trek.findByPk(trek_id, {
      include: [{ model: Vendor, as: 'vendor' }]
    });

    if (!trek) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Trek not found"
      });
    }

    if (trek.status !== 'published') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Trek is not available for booking"
      });
    }

    // Validate batch if provided
    let batch = null;
    if (batch_id) {
      batch = await Batch.findOne({
        where: { 
          id: batch_id, 
          trek_id: trek_id,
          status: 'active',
          start_date: { [Op.gte]: new Date() }
        }
      });

      if (!batch) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Batch not found or not available"
        });
      }
    }

    // Validate travelers data
    if (!travelers || !Array.isArray(travelers) || travelers.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "At least one traveler is required"
      });
    }

    // Process travelers - create or update existing ones
    const travelerIds = [];
    const processedTravelers = [];

    for (const travelerData of travelers) {
      let traveler;

      if (travelerData.id) {
        // Existing traveler - verify ownership
        traveler = await Traveler.findOne({
          where: { 
            id: travelerData.id, 
            customer_id: customerId,
            is_active: true
          }
        });

        if (!traveler) {
          await transaction.rollback();
          return res.status(404).json({
            success: false,
            message: `Traveler with ID ${travelerData.id} not found`
          });
        }

        // Update traveler if needed
        await traveler.update({
          name: travelerData.name || traveler.name,
          age: travelerData.age || traveler.age,
          gender: travelerData.gender || traveler.gender,
          phone: travelerData.phone || traveler.phone,
          email: travelerData.email || traveler.email,
          emergency_contact_name: travelerData.emergency_contact_name || traveler.emergency_contact_name,
          emergency_contact_phone: travelerData.emergency_contact_phone || traveler.emergency_contact_phone,
          emergency_contact_relation: travelerData.emergency_contact_relation || traveler.emergency_contact_relation,
          medical_conditions: travelerData.medical_conditions || traveler.medical_conditions,
          dietary_restrictions: travelerData.dietary_restrictions || traveler.dietary_restrictions,
        }, { transaction });
      } else {
        // New traveler
        traveler = await Traveler.create({
          customer_id: customerId,
          name: travelerData.name,
          age: travelerData.age,
          gender: travelerData.gender,
          phone: travelerData.phone,
          email: travelerData.email,
          emergency_contact_name: travelerData.emergency_contact_name,
          emergency_contact_phone: travelerData.emergency_contact_phone,
          emergency_contact_relation: travelerData.emergency_contact_relation,
          medical_conditions: travelerData.medical_conditions,
          dietary_restrictions: travelerData.dietary_restrictions,
          id_proof_type: travelerData.id_proof_type,
          id_proof_number: travelerData.id_proof_number,
        }, { transaction });
      }

      travelerIds.push(traveler.id);
      processedTravelers.push({
        traveler,
        is_primary: travelerData.is_primary || false,
        special_requirements: travelerData.special_requirements,
        accommodation_preference: travelerData.accommodation_preference || 'any',
        meal_preference: travelerData.meal_preference || 'veg'
      });
    }

    // Ensure at least one primary traveler
    const hasPrimary = processedTravelers.some(t => t.is_primary);
    if (!hasPrimary) {
      processedTravelers[0].is_primary = true;
    }

    // Calculate pricing
    const totalTravelers = travelers.length;
    const basePrice = trek.price_per_person;
    let totalAmount = basePrice * totalTravelers;
    let discountAmount = 0;

    // Apply coupon if provided
    if (coupon_id) {
      const coupon = await Coupon.findOne({
        where: {
          id: coupon_id,
          status: 'active',
          valid_from: { [Op.lte]: new Date() },
          valid_until: { [Op.gte]: new Date() }
        }
      });

      if (coupon) {
        if (coupon.discount_type === 'percentage') {
          discountAmount = (totalAmount * coupon.discount_value) / 100;
        } else {
          discountAmount = coupon.discount_value;
        }

        // Apply max discount limit
        if (coupon.max_discount && discountAmount > coupon.max_discount) {
          discountAmount = coupon.max_discount;
        }
      }
    }

    const finalAmount = totalAmount - discountAmount;

    // Create booking
    const booking = await Booking.create({
      customer_id: customerId,
      trek_id: trek_id,
      vendor_id: trek.vendor.id,
      batch_id: batch_id,
      pickup_point_id: pickup_point_id,
      coupon_id: coupon_id,
      total_travelers: totalTravelers,
      total_amount: totalAmount,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      special_requests: special_requests,
      booking_source: booking_source,
      status: 'pending',
      payment_status: 'pending'
    }, { transaction });

    // Create booking-traveler relationships
    const primaryTraveler = processedTravelers.find(t => t.is_primary);
    
    for (const travelerInfo of processedTravelers) {
      await BookingTraveler.create({
        booking_id: booking.id,
        traveler_id: travelerInfo.traveler.id,
        is_primary: travelerInfo.is_primary,
        special_requirements: travelerInfo.special_requirements,
        accommodation_preference: travelerInfo.accommodation_preference,
        meal_preference: travelerInfo.meal_preference
      }, { transaction });
    }

    // Set primary contact
    await booking.update({
      primary_contact_traveler_id: primaryTraveler.traveler.id
    }, { transaction });

    await transaction.commit();

    // Fetch complete booking data
    const completeBooking = await Booking.findByPk(booking.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: Trek, as: 'trek' },
        { model: Vendor, as: 'vendor' },
        { model: Batch, as: 'batch' },
        { model: PickupPoint, as: 'pickupPoint' },
        { 
          model: BookingTraveler, 
          as: 'travelers',
          include: [{ model: Traveler, as: 'traveler' }]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: completeBooking
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking"
    });
  }
};

// Get customer's bookings
const getCustomerBookings = async (req, res) => {
  try {
    const customerId = req.customer.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { customer_id: customerId };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: bookings } = await Booking.findAndCountAll({
      where: whereClause,
      include: [
        { model: Trek, as: 'trek' },
        { model: Vendor, as: 'vendor' },
        { model: Batch, as: 'batch' },
        { model: PickupPoint, as: 'pickupPoint' },
        { 
          model: BookingTraveler, 
          as: 'travelers',
          include: [{ model: Traveler, as: 'traveler' }]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalBookings: count,
          hasNext: offset + bookings.length < count,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Error fetching customer bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings"
    });
  }
};

// Get booking details
const getBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.customer.id;

    const booking = await Booking.findOne({
      where: { 
        id: id, 
        customer_id: customerId 
      },
      include: [
        { model: Customer, as: 'customer' },
        { model: Trek, as: 'trek' },
        { model: Vendor, as: 'vendor' },
        { model: Batch, as: 'batch' },
        { model: PickupPoint, as: 'pickupPoint' },
        { model: Coupon, as: 'coupon' },
        { 
          model: BookingTraveler, 
          as: 'travelers',
          include: [{ model: Traveler, as: 'traveler' }]
        },
        { model: Traveler, as: 'primaryContact' }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error("Error fetching booking details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking details"
    });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { reason } = req.body;
    const customerId = req.customer.id;

    const booking = await Booking.findOne({
      where: { 
        id: id, 
        customer_id: customerId,
        status: { [Op.in]: ['pending', 'confirmed'] }
      }
    });

    if (!booking) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Booking not found or cannot be cancelled"
      });
    }

    // Update booking status
    await booking.update({
      status: 'cancelled'
    }, { transaction });

    // Update all travelers status
    await BookingTraveler.update(
      { status: 'cancelled' },
      { 
        where: { booking_id: booking.id },
        transaction 
      }
    );

    // TODO: Process refund based on cancellation policy
    // TODO: Send cancellation notification

    await transaction.commit();

    res.json({
      success: true,
      message: "Booking cancelled successfully"
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking"
    });
  }
};

module.exports = {
  createBooking,
  getCustomerBookings,
  getBookingDetails,
  cancelBooking
};

 