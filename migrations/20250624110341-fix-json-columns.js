"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Ensure inclusions and exclusions columns in treks table are proper JSON
        await queryInterface.changeColumn("treks", "inclusions", {
            type: Sequelize.JSON,
            allowNull: true,
        });

        await queryInterface.changeColumn("treks", "exclusions", {
            type: Sequelize.JSON,
            allowNull: true,
        });

        // Ensure activities column in itinerary_items table is proper JSON
        await queryInterface.changeColumn("itinerary_items", "activities", {
            type: Sequelize.JSON,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        // Revert changes if needed
        await queryInterface.changeColumn("treks", "inclusions", {
            type: Sequelize.TEXT,
            allowNull: true,
        });

        await queryInterface.changeColumn("treks", "exclusions", {
            type: Sequelize.TEXT,
            allowNull: true,
        });

        await queryInterface.changeColumn("itinerary_items", "activities", {
            type: Sequelize.TEXT,
            allowNull: true,
        });
    },
};
