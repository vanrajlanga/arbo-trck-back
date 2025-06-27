"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            // 1. Migrate users with role 'user' to customers
            await queryInterface.sequelize.query(
                `
        INSERT INTO customers (phone, name, email, status, verification_status, profile_completed, created_at, updated_at)
        SELECT 
          COALESCE(u.phone, CONCAT('temp_', u.id)) as phone,
          u.name,
          u.email,
          CASE 
            WHEN u.status = 'active' THEN 'active'
            WHEN u.status = 'inactive' THEN 'inactive'
            ELSE 'blocked'
          END as status,
          'verified' as verification_status,
          true as profile_completed,
          u.created_at,
          u.updated_at
        FROM users u
        INNER JOIN roles r ON u.role_id = r.id
        WHERE r.name = 'user'
      `,
                { transaction }
            );

            // 2. Update bookings to reference customers
            await queryInterface.sequelize.query(
                `
        UPDATE bookings b
        INNER JOIN users u ON b.user_id = u.id
        INNER JOIN roles r ON u.role_id = r.id
        INNER JOIN customers c ON c.email = u.email OR c.phone = u.phone
        SET b.customer_id = c.id
        WHERE r.name = 'user'
      `,
                { transaction }
            );

            // 3. Create travelers from booking participants
            await queryInterface.sequelize.query(
                `
        INSERT INTO travelers (customer_id, name, age, gender, phone, emergency_contact_name, emergency_contact_phone, medical_conditions, created_at, updated_at)
        SELECT DISTINCT
          b.customer_id,
          bp.name,
          bp.age,
          bp.gender,
          bp.phone,
          'Emergency Contact' as emergency_contact_name,
          bp.emergency_contact as emergency_contact_phone,
          bp.medical_conditions,
          bp.created_at,
          bp.updated_at
        FROM booking_participants bp
        INNER JOIN bookings b ON bp.booking_id = b.id
        WHERE b.customer_id IS NOT NULL
      `,
                { transaction }
            );

            // 4. Create booking_travelers relationships
            await queryInterface.sequelize.query(
                `
        INSERT INTO booking_travelers (booking_id, traveler_id, is_primary, status, created_at, updated_at)
        SELECT 
          bp.booking_id,
          t.id as traveler_id,
          true as is_primary,
          'confirmed' as status,
          NOW() as created_at,
          NOW() as updated_at
        FROM booking_participants bp
        INNER JOIN bookings b ON bp.booking_id = b.id
        INNER JOIN travelers t ON t.customer_id = b.customer_id 
          AND t.name = bp.name 
          AND t.age = bp.age 
          AND t.gender = bp.gender
        WHERE b.customer_id IS NOT NULL
      `,
                { transaction }
            );

            // 5. Set primary contact for bookings
            await queryInterface.sequelize.query(
                `
        UPDATE bookings b
        SET primary_contact_traveler_id = (
          SELECT bt.traveler_id
          FROM booking_travelers bt
          WHERE bt.booking_id = b.id
          AND bt.is_primary = true
          LIMIT 1
        )
        WHERE b.customer_id IS NOT NULL
      `,
                { transaction }
            );

            // 6. Make customer_id NOT NULL after migration
            await queryInterface.changeColumn(
                "bookings",
                "customer_id",
                {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: { model: "customers", key: "id" },
                },
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            // Make customer_id nullable again
            await queryInterface.changeColumn(
                "bookings",
                "customer_id",
                {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    references: { model: "customers", key: "id" },
                },
                { transaction }
            );

            // Clear customer_id from bookings
            await queryInterface.sequelize.query(
                `
        UPDATE bookings SET customer_id = NULL, primary_contact_traveler_id = NULL
      `,
                { transaction }
            );

            // Remove booking_travelers data
            await queryInterface.sequelize.query(
                `
        DELETE FROM booking_travelers
      `,
                { transaction }
            );

            // Remove travelers data
            await queryInterface.sequelize.query(
                `
        DELETE FROM travelers
      `,
                { transaction }
            );

            // Remove customers data
            await queryInterface.sequelize.query(
                `
        DELETE FROM customers
      `,
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};
