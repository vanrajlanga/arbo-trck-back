const { User, Role } = require("../models");
const bcrypt = require("bcrypt");

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.findAll({
            include: [{ model: Role, as: "role" }],
        });
        res.json(users);
    } catch (err) {
        next(err);
    }
};

exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [{ model: Role, as: "role" }],
        });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        next(err);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const [updated] = await User.update(req.body, {
            where: { id: req.params.id },
        });
        if (!updated)
            return res.status(404).json({ message: "User not found" });
        const user = await User.findByPk(req.params.id);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const deleted = await User.destroy({ where: { id: req.params.id } });
        if (!deleted)
            return res.status(404).json({ message: "User not found" });
        res.status(204).end();
    } catch (err) {
        next(err);
    }
};

// Profile methods for mobile app users
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findByPk(userId, {
            include: [{ model: Role, as: "role" }],
            attributes: { exclude: ["password"] }, // Don't send password
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                createdAt: user.created_at,
                updatedAt: user.updated_at,
            },
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
        });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone, currentPassword, newPassword } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const updateData = {};

        // Update basic info
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;

        // Handle password change
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Current password is required to change password",
                });
            }

            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(
                currentPassword,
                user.password
            );
            if (!isCurrentPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: "Current password is incorrect",
                });
            }

            // Hash new password
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(newPassword, saltRounds);
        }

        // Update user
        await user.update(updateData);

        // Fetch updated user data (excluding password)
        const updatedUser = await User.findByPk(userId, {
            include: [{ model: Role, as: "role" }],
            attributes: { exclude: ["password"] },
        });

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                updatedAt: updatedUser.updated_at,
            },
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update profile",
        });
    }
};
