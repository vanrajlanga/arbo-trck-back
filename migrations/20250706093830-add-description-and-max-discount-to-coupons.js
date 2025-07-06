"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("coupons", "description", {
            type: Sequelize.STRING,
            allowNull: true,
        });
        await queryInterface.addColumn("coupons", "max_discount_amount", {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("coupons", "description");
        await queryInterface.removeColumn("coupons", "max_discount_amount");
    },
};
