const express = require("express");
const router = express.Router();
const authController = require("../../controllers/authController");

// Vendor authentication routes
router.post("/login", authController.login);
router.post("/register", authController.register);

// Placeholder routes for future implementation
router.post("/logout", (req, res) => {
    res.json({ message: "Logout endpoint - to be implemented" });
});

router.get("/profile", (req, res) => {
    res.json({ message: "Profile endpoint - to be implemented" });
});

router.put("/profile", (req, res) => {
    res.json({ message: "Update profile endpoint - to be implemented" });
});

router.post("/change-password", (req, res) => {
    res.json({ message: "Change password endpoint - to be implemented" });
});

module.exports = router;
