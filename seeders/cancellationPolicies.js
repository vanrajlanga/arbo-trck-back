console.log("Seeder file loaded successfully!");

const { CancellationPolicy } = require("../models");

const defaultPolicies = [
    {
        title: "Flexible Policy",
        description:
            "Most flexible cancellation policy with minimal deductions",
        rules: [
            {
                rule: "Advance Payment (₹999) Non-refundable",
                deduction: 999,
                deduction_type: "fixed",
            },
            {
                rule: "Full Payment Made ₹999 held, refund processed",
                deduction: 999,
                deduction_type: "fixed",
            },
            {
                rule: "Cancellation Notice 1 day before trek",
                deduction: 0,
                deduction_type: "percentage",
            },
        ],
        descriptionPoints: [
            "Advance payment is non-refundable under any circumstances",
            "Full refund minus advance payment if cancelled 24+ hours before",
            "No refund for same-day cancellations",
            "Refunds processed within 3-5 business days",
        ],
        is_active: true,
        sort_order: 1,
    },
    {
        title: "Standard Policy",
        description: "Standard cancellation policy with time-based deductions",
        rules: [
            {
                rule: "Cancellation 30+ days before",
                deduction: 10,
                deduction_type: "percentage",
            },
            {
                rule: "Cancellation 15-29 days before",
                deduction: 25,
                deduction_type: "percentage",
            },
            {
                rule: "Cancellation 7-14 days before",
                deduction: 50,
                deduction_type: "percentage",
            },
            {
                rule: "Cancellation less than 7 days",
                deduction: 100,
                deduction_type: "percentage",
            },
        ],
        descriptionPoints: [
            "Cancellation must be made in writing",
            "Refunds processed within 5-7 business days",
            "Force majeure events may affect cancellation terms",
            "Partial refunds based on time of cancellation",
        ],
        is_active: true,
        sort_order: 2,
    },
    {
        title: "Strict Policy",
        description: "Strict cancellation policy with high deductions",
        rules: [
            {
                rule: "48 hours before",
                deduction: 30,
                deduction_type: "percentage",
            },
            {
                rule: "24 hours before",
                deduction: 60,
                deduction_type: "percentage",
            },
            {
                rule: "Same day",
                deduction: 100,
                deduction_type: "percentage",
            },
        ],
        descriptionPoints: [
            "Very limited refund options",
            "No refunds for same-day cancellations",
            "Emergency situations handled case-by-case",
            "Refunds processed within 7-10 business days",
        ],
        is_active: true,
        sort_order: 3,
    },
];

async function seedCancellationPolicies() {
    try {
        console.log("Seeding cancellation policies...");
        console.log("Total policies to seed:", defaultPolicies.length);

        for (const policyData of defaultPolicies) {
            console.log(`Processing policy: ${policyData.title}`);
            console.log("Policy data:", JSON.stringify(policyData, null, 2));

            const existingPolicy = await CancellationPolicy.findOne({
                where: { title: policyData.title },
            });

            if (!existingPolicy) {
                console.log(`Creating new policy: ${policyData.title}`);
                const createdPolicy = await CancellationPolicy.create(
                    policyData
                );
                console.log(
                    `Successfully created cancellation policy: ${policyData.title} with ID: ${createdPolicy.id}`
                );
            } else {
                console.log(
                    `Cancellation policy already exists: ${policyData.title}`
                );
            }
        }

        // Verify creation
        const allPolicies = await CancellationPolicy.findAll();
        console.log(`Total policies in database: ${allPolicies.length}`);
        allPolicies.forEach((policy) => {
            console.log(`- ${policy.title} (ID: ${policy.id})`);
        });

        console.log("Cancellation policies seeding completed!");
    } catch (error) {
        console.error("Error seeding cancellation policies:", error);
        console.error("Error details:", error.message);
        if (error.errors) {
            error.errors.forEach((err) => {
                console.error(
                    `Validation error: ${err.message} for field ${err.path}`
                );
            });
        }
        throw error;
    }
}

if (require.main === module) {
    seedCancellationPolicies();
}

module.exports = seedCancellationPolicies;
