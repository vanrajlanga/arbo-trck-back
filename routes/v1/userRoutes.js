const express = require("express");
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserProfile,
    updateUserProfile,
} = require("../../controllers/userController");
const authMiddleware = require("../../middleware/authMiddleware");
// TODO: implement role-based admin middleware

const router = express.Router();

// User profile routes (authenticated users)
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);

// Admin routes (protected; ideally only admin access)
router.get("/", authMiddleware, getAllUsers);
router.get("/:id", authMiddleware, getUserById);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);

module.exports = router;
