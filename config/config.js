require("dotenv").config();

// Debug logging for database configuration
const logger = require("../utils/logger");

const config = {
    development: {
        username: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "aorbo_trekking",
        host: process.env.DB_HOST || "127.0.0.1",
        dialect: "mysql",
    },
    test: {
        username: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME_TEST || "arobo_test",
        host: process.env.DB_HOST || "127.0.0.1",
        dialect: "mysql",
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || process.env.DB_NAME_PROD, // Use DB_NAME as fallback
        host: process.env.DB_HOST,
        dialect: "mysql",
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    },
};

// Log database configuration (without sensitive data)
const env = process.env.NODE_ENV || "development";
logger.database(
    "info",
    `Database configuration loaded for environment: ${env}`,
    {
        host: config[env].host,
        database: config[env].database,
        dialect: config[env].dialect,
        hasUsername: !!config[env].username,
        hasPassword: !!config[env].password,
    }
);

module.exports = config;
