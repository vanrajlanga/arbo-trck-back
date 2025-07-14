const { Activity } = require("../../models");
const { Op } = require("sequelize");

// Get all active activities for vendor use
exports.getAllActivities = async (req, res) => {
    try {
        const { search, category } = req.query;

        let whereClause = { is_active: true };

        // Search by name
        if (search) {
            whereClause.name = {
                [Op.like]: `%${search}%`,
            };
        }

        // Filter by category
        if (category) {
            whereClause.category_name = category;
        }

        const activities = await Activity.findAll({
            where: whereClause,
            attributes: ["id", "name", "category_name"],
            order: [["name", "ASC"]],
        });

        res.json({
            success: true,
            data: activities,
        });
    } catch (err) {
        console.error("Error fetching activities:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch activities",
        });
    }
};

// Get activity categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Activity.findAll({
            where: { is_active: true },
            attributes: ["category_name"],
            group: ["category_name"],
            order: [["category_name", "ASC"]],
        });

        const categoryList = categories.map((cat) => cat.category_name);

        res.json({
            success: true,
            data: categoryList,
        });
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch categories",
        });
    }
};
