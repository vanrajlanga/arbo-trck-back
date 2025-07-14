const { sequelize } = require("./models");

async function migrateCouponAssignmentsToCustomer() {
    try {
        console.log(
            "Migrating coupon_assignments from user_id to customer_id..."
        );

        // First, check if the customer_id column already exists
        const [customerColumns] = await sequelize.query(`
            SHOW COLUMNS FROM coupon_assignments LIKE 'customer_id'
        `);

        // Check if user_id column exists
        const [userColumns] = await sequelize.query(`
            SHOW COLUMNS FROM coupon_assignments LIKE 'user_id'
        `);

        if (customerColumns.length === 0) {
            // Add customer_id column
            await sequelize.query(`
                ALTER TABLE coupon_assignments 
                ADD COLUMN customer_id INT NULL 
                AFTER coupon_id
            `);
            console.log("✓ Added customer_id column");

            // Copy data from user_id to customer_id if user_id exists
            if (userColumns.length > 0) {
                await sequelize.query(`
                    UPDATE coupon_assignments 
                    SET customer_id = user_id 
                    WHERE user_id IS NOT NULL
                `);
                console.log("✓ Copied data from user_id to customer_id");

                // Drop the old user_id column
                await sequelize.query(`
                    ALTER TABLE coupon_assignments 
                    DROP FOREIGN KEY IF EXISTS fk_coupon_assignment_user
                `);
                console.log("✓ Dropped old foreign key constraint");

                await sequelize.query(`
                    ALTER TABLE coupon_assignments 
                    DROP COLUMN user_id
                `);
                console.log("✓ Dropped user_id column");
            } else {
                console.log("✓ No user_id column found to migrate");
            }

            // Make customer_id NOT NULL
            await sequelize.query(`
                ALTER TABLE coupon_assignments 
                MODIFY COLUMN customer_id INT NOT NULL
            `);
            console.log("✓ Made customer_id NOT NULL");

            // Add foreign key constraint
            await sequelize.query(`
                ALTER TABLE coupon_assignments 
                ADD CONSTRAINT fk_coupon_assignment_customer 
                FOREIGN KEY (customer_id) REFERENCES customers(id) 
                ON DELETE CASCADE
            `);
            console.log("✓ Added foreign key constraint for customer_id");
        } else {
            console.log("✓ customer_id column already exists");
        }

        console.log("\n✅ Migration completed successfully!");
    } catch (error) {
        console.error("Error migrating coupon assignments:", error);
    } finally {
        await sequelize.close();
    }
}

migrateCouponAssignmentsToCustomer();
