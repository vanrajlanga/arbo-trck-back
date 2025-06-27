'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('treks', 'duration_days', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    
    await queryInterface.addColumn('treks', 'duration_nights', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('treks', 'duration_days');
    await queryInterface.removeColumn('treks', 'duration_nights');
  }
};
