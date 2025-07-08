"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("customers", "city_id", {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: "cities",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        });

        await queryInterface.addColumn("customers", "state_id", {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: "states",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("customers", "city_id");
        await queryInterface.removeColumn("customers", "state_id");
    },
};
