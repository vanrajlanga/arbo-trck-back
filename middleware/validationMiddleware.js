const { validationResult } = require("express-validator");

// Enhanced validation middleware with better error formatting
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Format validation errors to match frontend expectations
        const formattedErrors = errors.array().reduce((acc, error) => {
            const field = error.path || error.param;
            if (!acc[field]) {
                acc[field] = [];
            }
            acc[field].push(error.msg);
            return acc;
        }, {});

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: formattedErrors,
            validationErrors: errors.array(),
        });
    }
    next();
};

// Middleware to handle Sequelize validation errors
const handleSequelizeErrors = (error, req, res, next) => {
    if (error.name === "SequelizeValidationError") {
        const validationErrors = {};
        error.errors.forEach((err) => {
            if (!validationErrors[err.path]) {
                validationErrors[err.path] = [];
            }
            validationErrors[err.path].push(err.message);
        });

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: validationErrors,
        });
    }

    if (error.name === "SequelizeForeignKeyConstraintError") {
        return res.status(400).json({
            success: false,
            message: "Invalid reference data provided",
            errors: {
                [error.fields[0]]: ["Referenced data does not exist"],
            },
        });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
        const field = error.fields[0];
        return res.status(400).json({
            success: false,
            message: "Duplicate entry",
            errors: {
                [field]: [`${field} already exists`],
            },
        });
    }

    // Pass other errors to the default error handler
    next(error);
};

// Middleware to validate required fields
const validateRequiredFields = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = [];

        requiredFields.forEach((field) => {
            if (
                !req.body[field] ||
                (typeof req.body[field] === "string" && !req.body[field].trim())
            ) {
                missingFields.push(field);
            }
        });

        if (missingFields.length > 0) {
            const errors = {};
            missingFields.forEach((field) => {
                errors[field] = [`${field} is required`];
            });

            return res.status(400).json({
                success: false,
                message: "Required fields missing",
                errors: errors,
            });
        }

        next();
    };
};

// Middleware to validate array fields
const validateArrayFields = (arrayFields) => {
    return (req, res, next) => {
        const errors = {};

        arrayFields.forEach((field) => {
            const value = req.body[field];
            if (value && !Array.isArray(value)) {
                errors[field] = [`${field} must be an array`];
            }
        });

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid array fields",
                errors: errors,
            });
        }

        next();
    };
};

// Middleware to sanitize input data
const sanitizeInput = (req, res, next) => {
    // Trim string fields
    Object.keys(req.body).forEach((key) => {
        if (typeof req.body[key] === "string") {
            req.body[key] = req.body[key].trim();
        }
    });

    next();
};

// Badge validation middleware
const validateBadge = (req, res, next) => {
    const errors = {};

    // Validate name
    if (!req.body.name || !req.body.name.trim()) {
        errors.name = ["Badge name is required"];
    } else if (req.body.name.length > 100) {
        errors.name = ["Badge name must be less than 100 characters"];
    }

    // Validate description
    if (req.body.description && req.body.description.length > 500) {
        errors.description = ["Description must be less than 500 characters"];
    }

    // Validate color (hex color format)
    if (req.body.color && !/^#[0-9A-F]{6}$/i.test(req.body.color)) {
        errors.color = ["Color must be a valid hex color (e.g., #3B82F6)"];
    }

    // Validate category
    const validCategories = [
        "achievement",
        "difficulty",
        "special",
        "seasonal",
        "certification",
    ];
    if (req.body.category && !validCategories.includes(req.body.category)) {
        errors.category = ["Invalid category selected"];
    }

    // Validate sort_order
    if (req.body.sort_order !== undefined) {
        const sortOrder = parseInt(req.body.sort_order);
        if (isNaN(sortOrder) || sortOrder < 0) {
            errors.sort_order = ["Sort order must be a positive number"];
        }
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors,
        });
    }

    next();
};

module.exports = {
    validateRequest,
    handleSequelizeErrors,
    validateRequiredFields,
    validateArrayFields,
    sanitizeInput,
    validateBadge,
};
