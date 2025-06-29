'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('customers', 'otp', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'phone'
    });

    await queryInterface.addColumn('customers', 'otp_expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'otp'
    });

    await queryInterface.addColumn('customers', 'otp_attempts', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      after: 'otp_expires_at'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('customers', 'otp');
    await queryInterface.removeColumn('customers', 'otp_expires_at');
    await queryInterface.removeColumn('customers', 'otp_attempts');
  }
}; 