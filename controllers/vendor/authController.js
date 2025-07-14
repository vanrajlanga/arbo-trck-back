const { Vendor, User } = require("../../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "vendor_jwt_secret";

// Vendor registration
exports.register = async (req, res) => {
    try {
        const { email, password, name, company_info } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res
                .status(400)
                .json({ message: "Email already registered" });
        }

        // Check if user is already a vendor
        if (existingUser) {
            const existingVendor = await Vendor.findOne({
                where: { user_id: existingUser.id },
            });
            if (existingVendor) {
                return res
                    .status(400)
                    .json({ message: "User is already a vendor" });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user first
        const user = await User.create({
            name,
            email,
            passwordHash: hashedPassword,
            roleId: 2, // Assuming 2 is vendor role
            status: "active",
        });

        // Create vendor record
        const vendor = await Vendor.create({
            user_id: user.id,
            company_info: company_info || {},
            status: "active",
        });

        return res.status(201).json({
            message: "Vendor registered successfully",
            vendor: {
                id: vendor.id,
                user_id: user.id,
                email: user.email,
                name: user.name,
                company_info: vendor.company_info,
                status: vendor.status,
            },
        });
    } catch (err) {
        console.error("Vendor register error", err);
        res.status(500).json({ message: "Registration failed" });
    }
};

// Vendor login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password required" });
        }

        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check if user is a vendor
        const vendor = await Vendor.findOne({
            where: { user_id: user.id },
            include: [{ model: User, as: "user" }],
        });

        if (!vendor) {
            return res.status(401).json({ message: "User is not a vendor" });
        }

        // Verify password
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check if vendor is active
        if (vendor.status !== "active") {
            return res
                .status(401)
                .json({ message: "Vendor account is not active" });
        }

        const token = jwt.sign(
            {
                id: vendor.id,
                user_id: user.id,
                email: user.email,
                role: "vendor",
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            vendor: {
                id: vendor.id,
                user_id: user.id,
                email: user.email,
                name: user.name,
                company_info: vendor.company_info,
                status: vendor.status,
            },
        });
    } catch (err) {
        console.error("Vendor login error", err);
        res.status(500).json({ message: "Login failed" });
    }
};
