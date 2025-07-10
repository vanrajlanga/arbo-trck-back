require('dotenv').config();

console.log('=== Environment Variables Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]');
console.log('PORT:', process.env.PORT);

// Test database config
const config = require('./config/config');
console.log('\n=== Database Configuration ===');
console.log('Current environment:', process.env.NODE_ENV);
console.log('Config for current env:', JSON.stringify(config[process.env.NODE_ENV || 'development'], null, 2)); 