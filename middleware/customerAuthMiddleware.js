const jwt = require("jsonwebtoken");
const { Customer } = require("../models");

const authenticateCustomer = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "No token provided",
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "your-secret-key"
        );

        if (decoded.type !== "customer") {
            return res.status(403).json({
                success: false,
                message: "Invalid token type",
            });
        }

        // Get customer from database
        const customer = await Customer.findByPk(decoded.id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        if (customer.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Account is inactive",
            });
        }

        // Add customer to request object
        req.customer = customer;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired",
            });
        }
        console.error("Auth middleware error:", error);
        res.status(500).json({
            success: false,
            message: "Authentication failed",
        });
    }
};

module.exports = {
    authenticateCustomer,
}; 