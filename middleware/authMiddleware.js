const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

const authMiddleware = (req, res, next) => {
    logger.info("auth", "=== AUTH MIDDLEWARE STARTED ===");
    logger.info("auth", "Request details:", {
        method: req.method,
        url: req.url,
        headers: {
            authorization: req.headers.authorization
                ? "Bearer [HIDDEN]"
                : "No auth header",
            "user-agent": req.headers["user-agent"],
        },
    });

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        logger.warn("auth", "No valid authorization header found");
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    logger.info("auth", "Token extracted (length):", {
        tokenLength: token.length,
    });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        logger.info("auth", "JWT token decoded successfully:", {
            id: decoded.id,
            roleId: decoded.roleId,
            role: decoded.role,
            vendorId: decoded.vendorId,
            hasVendorId: !!decoded.vendorId,
        });

        req.user = decoded;
        logger.info("auth", "=== AUTH MIDDLEWARE COMPLETED ===");
        next();
    } catch (err) {
        logger.error("auth", "JWT verification failed:", {
            error: err.message,
            name: err.name,
            tokenLength: token.length,
        });
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;
