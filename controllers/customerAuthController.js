const { Customer, Traveler } = require("../models");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP (mock implementation - integrate with SMS service)
const sendOTP = async (phone, otp) => {
    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
    console.log(`Sending OTP ${otp} to phone ${phone}`);
    return true;
};

// Request OTP for phone number
const requestOTP = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            });
        }

        // Validate phone number format
        const phoneRegex = /^[+]?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number format",
            });
        }

        // Find or initialize customer
        let customer = await Customer.findOne({ where: { phone } });

        if (!customer) {
            customer = await Customer.create({
                phone,
                verification_status: "pending",
            });
        }

        // Check if previous OTP is still valid and attempts are within limit
        if (
            customer.otp_expires_at &&
            new Date() < customer.otp_expires_at &&
            customer.otp_attempts >= 3
        ) {
            const waitTime = Math.ceil(
                (customer.otp_expires_at - new Date()) / 1000 / 60
            );
            return res.status(429).json({
                success: false,
                message: `Too many attempts. Please wait ${waitTime} minutes before requesting a new OTP`,
            });
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Update customer with new OTP
        await customer.update({
            otp: otp,
            otp_expires_at: expiresAt,
            otp_attempts: 0,
        });

        // Send OTP
        await sendOTP(phone, otp);

        res.json({
            success: true,
            otp: otp,
            message: "OTP sent successfully",
            expiresIn: 300, // 5 minutes in seconds
        });
    } catch (error) {
        console.error("Error requesting OTP:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send OTP",
        });
    }
};

// Verify OTP and login/register customer
const verifyOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({
                success: false,
                message: "Phone number and OTP are required",
            });
        }

        const customer = await Customer.findOne({ where: { phone } });

        if (!customer || !customer.otp) {
            return res.status(400).json({
                success: false,
                message: "OTP not found or expired",
            });
        }

        if (new Date() > customer.otp_expires_at) {
            await customer.update({
                otp: null,
                otp_expires_at: null,
                otp_attempts: 0,
            });
            return res.status(400).json({
                success: false,
                message: "OTP expired",
            });
        }

        if (customer.otp_attempts >= 3) {
            return res.status(400).json({
                success: false,
                message: "Too many failed attempts",
            });
        }

        if (customer.otp !== otp) {
            await customer.increment("otp_attempts");
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
                attemptsLeft: 3 - (customer.otp_attempts + 1),
            });
        }

        // OTP verified successfully
        await customer.update({
            otp: null,
            otp_expires_at: null,
            otp_attempts: 0,
            verification_status: "verified",
            last_login: new Date(),
        });

        // Generate JWT token
        const token = jwt.sign(
            {
                id: customer.id,
                phone: customer.phone,
                type: "customer",
            },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "30d" }
        );

        res.json({
            success: true,
            message: customer.profile_completed
                ? "Login successful"
                : "Account created successfully",
            customer: {
                id: customer.id,
                phone: customer.phone,
                name: customer.name,
                email: customer.email,
                profileCompleted: customer.profile_completed,
                isNewCustomer: !customer.profile_completed,
            },
            token,
        });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify OTP",
        });
    }
};

// Complete customer profile
const completeProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const customerId = req.customer.id;

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
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
            customer: {
                id: customer.id,
                phone: customer.phone,
                name: customer.name,
                email: customer.email,
                profileCompleted: customer.profile_completed,
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
                id: customer.id,
                phone: customer.phone,
                name: customer.name,
                email: customer.email,
                profileCompleted: customer.profile_completed,
                travelers: customer.travelers,
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
    requestOTP,
    verifyOTP,
    completeProfile,
    getProfile,
};
