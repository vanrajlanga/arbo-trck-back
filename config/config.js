require("dotenv").config();

// Helper function to validate database configuration
const validateConfig = (config, env) => {
    const required = ['username', 'database', 'host'];
    const missing = required.filter(key => !config[key]);
    
    if (missing.length > 0) {
        console.error(`Missing required database configuration for ${env}:`, missing);
        console.error('Current config:', config);
        throw new Error(`Missing required database configuration: ${missing.join(', ')}`);
    }
    
    return config;
};

const baseConfig = {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
};

module.exports = {
    development: validateConfig({
        ...baseConfig,
        database: process.env.DB_NAME || "aorbo_trekking",
        host: process.env.DB_HOST || "127.0.0.1",
        username: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
    }, 'development'),
    
    test: validateConfig({
        ...baseConfig,
        database: process.env.DB_NAME_TEST || "arobo_test",
        host: process.env.DB_HOST || "127.0.0.1",
        username: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
    }, 'test'),
    
    production: validateConfig({
        ...baseConfig,
        database: process.env.DB_NAME || process.env.DB_NAME_PROD,
        host: process.env.DB_HOST,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        logging: false, // Disable logging in production
    }, 'production'),
};
