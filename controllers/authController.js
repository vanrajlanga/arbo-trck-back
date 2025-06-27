const { User, Role, Vendor } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res, next) => {
    try {
        const { name, email, phone, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ message: "Name, email, and password are required" });
        }

        const existing = await User.findOne({ where: { email } });
        if (existing)
            return res
                .status(400)
                .json({ message: "Email already registered" });

        const passwordHash = await bcrypt.hash(password, 10);

        // Assign default 'vendor' role for registrations (since the form says "Create your vendor account")
        let userRole = await Role.findOne({ where: { name: "vendor" } });
        if (!userRole) {
            // Fallback to user role if vendor doesn't exist
            userRole = await Role.findOne({ where: { name: "user" } });
        }
        const roleId = userRole ? userRole.id : 2;

        const user = await User.create({
            name,
            email,
            phone: phone || null,
            passwordHash,
            roleId,
        });

        // Create vendor record if user has vendor role
        let vendor = null;
        if (userRole && userRole.name === "vendor") {
            vendor = await Vendor.create({
                user_id: user.id,
                status: "active",
            });
        }

        // Fetch user with role information
        const userWithRole = await User.findByPk(user.id, {
            include: [{ model: Role, as: "role" }],
        });

        const token = jwt.sign(
            {
                id: user.id,
                roleId: user.roleId,
                role: userWithRole.role?.name,
                vendorId: vendor ? vendor.id : null,
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.status(201).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: userWithRole.role?.name || "user",
                roleId: user.roleId,
            },
            token,
        });
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }

        const user = await User.findOne({
            where: { email },
            include: [{ model: Role, as: "role" }],
        });

        if (!user)
            return res.status(401).json({ message: "Invalid credentials" });

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid)
            return res.status(401).json({ message: "Invalid credentials" });

        // Get vendor record if user is a vendor
        let vendor = null;
        if (user.role?.name === "vendor") {
            vendor = await Vendor.findOne({ where: { user_id: user.id } });
        }

        const token = jwt.sign(
            {
                id: user.id,
                roleId: user.roleId,
                role: user.role?.name,
                vendorId: vendor ? vendor.id : null,
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role?.name || "user",
                roleId: user.roleId,
            },
            token,
        });
    } catch (err) {
        next(err);
    }
};
