const { sequelize } = require("../models");

async function removeBookingParticipants() {
    try {
        console.log("Starting migration to remove BookingParticipant table...");

        // Drop the booking_participants table
        await sequelize.query(
            "DROP TABLE IF EXISTS booking_participants CASCADE;"
        );
        console.log("✅ Dropped booking_participants table");

        // Remove any foreign key constraints that might reference booking_participants
        // This is handled by CASCADE in the DROP TABLE above

        console.log("✅ Migration completed successfully!");
        console.log(
            "📝 Note: All booking participant data has been permanently removed."
        );
        console.log(
            "📝 The system now uses the Traveler + BookingTraveler approach exclusively."
        );
    } catch (error) {
        console.error("❌ Migration failed:", error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// Run the migration if this script is executed directly
if (require.main === module) {
    removeBookingParticipants()
        .then(() => {
            console.log("Migration completed successfully!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("Migration failed:", error);
            process.exit(1);
        });
}

module.exports = removeBookingParticipants;
