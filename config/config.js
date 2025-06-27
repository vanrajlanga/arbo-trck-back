require("dotenv").config();

module.exports = {
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
        database: process.env.DB_NAME_PROD,
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
