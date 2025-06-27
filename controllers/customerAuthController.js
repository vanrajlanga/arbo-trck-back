const { Customer, Traveler } = require("../models");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// In-memory store for OTP (in production, use Redis)
const otpStore = new Map();

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

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Store OTP
        otpStore.set(phone, {
            otp,
            expiresAt,
            attempts: 0,
        });

        // Send OTP
        await sendOTP(phone, otp);

        res.json({
            success: true,
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

        const storedOTP = otpStore.get(phone);

        if (!storedOTP) {
            return res.status(400).json({
                success: false,
                message: "OTP not found or expired",
            });
        }

        if (new Date() > storedOTP.expiresAt) {
            otpStore.delete(phone);
            return res.status(400).json({
                success: false,
                message: "OTP expired",
            });
        }

        if (storedOTP.attempts >= 3) {
            otpStore.delete(phone);
            return res.status(400).json({
                success: false,
                message: "Too many failed attempts",
            });
        }

        if (storedOTP.otp !== otp) {
            storedOTP.attempts++;
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
                attemptsLeft: 3 - storedOTP.attempts,
            });
        }

        // OTP verified successfully
        otpStore.delete(phone);

        // Find or create customer
        let customer = await Customer.findOne({ where: { phone } });
        let isNewCustomer = false;

        if (!customer) {
            customer = await Customer.create({
                phone,
                verification_status: "verified",
            });
            isNewCustomer = true;
        } else {
            // Update last login
            await customer.update({
                last_login: new Date(),
                verification_status: "verified",
            });
        }

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
            message: isNewCustomer
                ? "Account created successfully"
                : "Login successful",
            customer: {
                id: customer.id,
                phone: customer.phone,
                name: customer.name,
                email: customer.email,
                profileCompleted: customer.profile_completed,
                isNewCustomer,
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
        console.error("Error completing profile:", error);
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
                status: customer.status,
                profileCompleted: customer.profile_completed,
                travelers: customer.travelers || [],
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
