'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // 1. Roles and Permissions
      await queryInterface.bulkInsert('roles', [
        { id: 1, name: 'admin', description: 'System Administrator', created_at: new Date(), updated_at: new Date() },
        { id: 2, name: 'vendor', description: 'Trek Vendor', created_at: new Date(), updated_at: new Date() },
        { id: 3, name: 'staff', description: 'Staff Member', created_at: new Date(), updated_at: new Date() }
      ]);

      await queryInterface.bulkInsert('permissions', [
        { id: 1, name: 'manage_users', description: 'Can manage users', created_at: new Date(), updated_at: new Date() },
        { id: 2, name: 'manage_treks', description: 'Can manage treks', created_at: new Date(), updated_at: new Date() },
        { id: 3, name: 'manage_bookings', description: 'Can manage bookings', created_at: new Date(), updated_at: new Date() }
      ]);

      // Assign permissions to roles
      await queryInterface.bulkInsert('role_permissions', [
        { role_id: 1, permission_id: 1 },
        { role_id: 1, permission_id: 2 },
        { role_id: 1, permission_id: 3 },
        { role_id: 2, permission_id: 2 },
        { role_id: 2, permission_id: 3 }
      ]);

      // 2. Users (Admin and Vendors)
      const hashedPassword = await bcrypt.hash('password123', 10);
      await queryInterface.bulkInsert('users', [
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@example.com',
          password_hash: hashedPassword,
          role_id: 1,
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          name: 'Vendor User',
          email: 'vendor@example.com',
          password_hash: hashedPassword,
          role_id: 2,
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);

      // 3. Vendors
      await queryInterface.bulkInsert('vendors', [
        {
          id: 1,
          user_id: 2,
          company_info: JSON.stringify({
            company_name: 'Adventure Trek Co.',
            contact_person: 'John Doe',
            phone: '+1234567890',
            email: 'contact@adventuretrek.com'
          }),
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);

      // 4. Cities and Locations
      await queryInterface.bulkInsert('cities', [
        {
          id: 1,
          city_name: 'Manali',
          state_name: 'Himachal Pradesh',
          region: 'North',
          status: 'active',
          launch_date: new Date('2024-01-01'),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          city_name: 'Leh',
          state_name: 'Ladakh',
          region: 'North',
          status: 'active',
          launch_date: new Date('2024-01-01'),
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);

      // 5. Treks
      await queryInterface.bulkInsert('treks', [
        {
          id: 1,
          title: 'Hampta Pass Trek',
          description: 'Beautiful crossover trek from Manali to Spiti Valley',
          vendor_id: 1,
          destination: 'Manali',
          duration: '5 days',
          duration_days: 5,
          duration_nights: 4,
          difficulty: 'moderate',
          trek_type: 'mountain',
          category: 'Himalayan Trek',
          base_price: 15000.00,
          max_participants: 20,
          status: 'published',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          title: 'Markha Valley Trek',
          description: 'Classic trek in Ladakh region',
          vendor_id: 1,
          destination: 'Leh',
          duration: '7 days',
          duration_days: 7,
          duration_nights: 6,
          difficulty: 'difficult',
          trek_type: 'mountain',
          category: 'Himalayan Trek',
          base_price: 25000.00,
          max_participants: 15,
          status: 'published',
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);

      // 6. Trek Stages
      await queryInterface.bulkInsert('trek_stages', [
        {
          id: 1,
          trek_id: 1,
          stage_number: 1,
          name: 'Day 1: Manali to Jobra',
          description: 'Drive to Jobra and trek to Chika',
          distance: '3 km',
          duration: '4-5 hours',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          trek_id: 1,
          stage_number: 2,
          name: 'Day 2: Chika to Balu Ka Ghera',
          description: 'Trek through meadows',
          distance: '5 km',
          duration: '5-6 hours',
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);

      // 7. Batches
      await queryInterface.bulkInsert('batches', [
        {
          id: 1,
          trek_id: 1,
          start_date: new Date('2024-06-01'),
          end_date: new Date('2024-06-05'),
          capacity: 20,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          trek_id: 2,
          start_date: new Date('2024-07-01'),
          end_date: new Date('2024-07-07'),
          capacity: 15,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);

      // 8. Pickup Points
      await queryInterface.bulkInsert('pickup_points', [
        {
          id: 1,
          city_id: 1,
          name: 'Manali Bus Stand',
          address: 'Main Bus Stand, Manali',
          coordinates: JSON.stringify({ lat: 32.2396, lng: 77.1887 }),
          contact_person: 'Bus Stand Manager',
          contact_phone: '+1234567890',
          operating_hours: '24/7',
          status: 'active',
          is_default: true,
          capacity: 50,
          facilities: JSON.stringify(['parking', 'restroom', 'waiting_area']),
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);

      // 9. Customers
      await queryInterface.bulkInsert('customers', [
        {
          id: 1,
          name: 'Alice Johnson',
          email: 'alice@example.com',
          phone: '+9876543210',
          status: 'active',
          verification_status: 'verified',
          profile_completed: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);

      // 10. Travelers
      await queryInterface.bulkInsert('travelers', [
        {
          id: 1,
          customer_id: 1,
          name: 'Alice Johnson',
          age: 28,
          gender: 'female',
          phone: '+9876543210',
          email: 'alice@example.com',
          emergency_contact_name: 'Bob Johnson',
          emergency_contact_phone: '+9876543211',
          emergency_contact_relation: 'spouse',
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);

      // 11. Bookings
      await queryInterface.bulkInsert('bookings', [
        {
          id: 1,
          customer_id: 1,
          trek_id: 1,
          vendor_id: 1,
          batch_id: 1,
          pickup_point_id: 1,
          total_travelers: 1,
          total_amount: 15000.00,
          discount_amount: 0,
          final_amount: 15000.00,
          payment_status: 'completed',
          status: 'confirmed',
          booking_source: 'web',
          primary_contact_traveler_id: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);

      // 12. Booking Travelers
      await queryInterface.bulkInsert('booking_travelers', [
        {
          id: 1,
          booking_id: 1,
          traveler_id: 1,
          is_primary: true,
          accommodation_preference: 'any',
          meal_preference: 'veg',
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);

      // 13. Coupons
      await queryInterface.bulkInsert('coupons', [
        {
          id: 1,
          code: 'WELCOME2024',
          discount_type: 'percentage',
          discount_value: 10,
          min_amount: 10000,
          max_uses: 100,
          current_uses: 0,
          valid_from: new Date('2024-01-01'),
          valid_until: new Date('2024-12-31'),
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);

      // 14. Safety Guidelines
      await queryInterface.bulkInsert('safety_guidelines', [
        {
          id: 1,
          trek_id: 1,
          guideline: 'Altitude Sickness Prevention: Guidelines for preventing altitude sickness. Make sure to acclimatize properly, stay hydrated, and avoid overexertion.',
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);

      // 15. Itinerary Items
      await queryInterface.bulkInsert('itinerary_items', [
        {
          id: 1,
          trek_id: 1,
          day_number: 1,
          description: 'Day 1: Arrival and Acclimatization - Arrive at base camp and acclimatize',
          activities: JSON.stringify(['Check-in', 'Safety briefing', 'Short acclimatization walk']),
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);

    } catch (error) {
      console.error('Seeding error:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Delete in reverse order of creation
      await queryInterface.bulkDelete('itinerary_items', null, {});
      await queryInterface.bulkDelete('safety_guidelines', null, {});
      await queryInterface.bulkDelete('coupons', null, {});
      await queryInterface.bulkDelete('booking_travelers', null, {});
      await queryInterface.bulkDelete('bookings', null, {});
      await queryInterface.bulkDelete('travelers', null, {});
      await queryInterface.bulkDelete('customers', null, {});
      await queryInterface.bulkDelete('pickup_points', null, {});
      await queryInterface.bulkDelete('batches', null, {});
      await queryInterface.bulkDelete('trek_stages', null, {});
      await queryInterface.bulkDelete('treks', null, {});
      await queryInterface.bulkDelete('cities', null, {});
      await queryInterface.bulkDelete('vendors', null, {});
      await queryInterface.bulkDelete('users', null, {});
      await queryInterface.bulkDelete('role_permissions', null, {});
      await queryInterface.bulkDelete('permissions', null, {});
      await queryInterface.bulkDelete('roles', null, {});
    } catch (error) {
      console.error('Rollback error:', error);
      throw error;
    }
  }
}; 