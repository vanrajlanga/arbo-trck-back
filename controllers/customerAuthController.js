const { Customer, Traveler } = require("../models");
const jwt = require("jsonwebtoken");
const { verifyFirebaseToken } = require("../config/firebase");

// Verify Firebase ID Token and login/register customer
const firebaseVerify = async (req, res) => {
    try {
        const { firebaseIdToken } = req.body;
        console.log("firebaseIdToken", firebaseIdToken);
        return;
    } catch (error) {
        console.error("Error verifying Firebase token:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify Firebase token",
        });
    }
};

// Update customer profile
const updateProfile = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            name,
            email,
            dateOfBirth,
            emergencyContact,
        } = req.body;
        const customerId = req.customer.id;

        const updateData = {};

        // Handle name fields
        if (firstName && lastName) {
            updateData.name = `${firstName} ${lastName}`;
        } else if (name) {
            updateData.name = name;
        }

        if (email) updateData.email = email;
        if (dateOfBirth) updateData.date_of_birth = dateOfBirth;
        if (emergencyContact) updateData.emergency_contact = emergencyContact;

        updateData.profile_completed = true;

        const customer = await Customer.findByPk(customerId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        await customer.update(updateData);

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: {
                customer: {
                    id: customer.id,
                    phone: customer.phone,
                    name: customer.name,
                    email: customer.email,
                    dateOfBirth: customer.date_of_birth,
                    emergencyContact: customer.emergency_contact,
                    profileCompleted: customer.profile_completed,
                },
            },
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update profile",
        });
    }
};

// Get customer profile
const getProfile = async (req, res) => {
    try {
        const customerId = req.customer.id;

        const customer = await Customer.findByPk(customerId, {
            include: [
                {
                    model: Traveler,
                    as: "travelers",
                    where: { is_active: true },
                    required: false,
                },
            ],
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        res.json({
            success: true,
            data: {
                customer: {
                    id: customer.id,
                    phone: customer.phone,
                    name: customer.name,
                    email: customer.email,
                    dateOfBirth: customer.date_of_birth,
                    emergencyContact: customer.emergency_contact,
                    profileCompleted: customer.profile_completed,
                    travelers: customer.travelers,
                },
            },
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
        });
    }
};

module.exports = {
    firebaseVerify,
    updateProfile,
    getProfile,
};
