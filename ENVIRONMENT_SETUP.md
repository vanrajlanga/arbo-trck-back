# Environment Variables Setup

## Required Environment Variables

Create a `.env` file in the backend root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=arobo_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Razorpay Configuration (Required for payments)
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET

# Firebase Configuration (if using)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# File Upload Configuration
UPLOAD_PATH=./storage
MAX_FILE_SIZE=5242880
```

## Getting Razorpay Keys

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to Settings → API Keys
3. Generate a new key pair
4. Use test keys for development:
    - Key ID: `rzp_test_...`
    - Key Secret: `...`

## Testing Without Razorpay

If you want to test the application without setting up Razorpay:

1. The application will show warnings but continue to work
2. Payment endpoints will return configuration errors
3. You can still test other features

## Security Notes

-   Never commit `.env` files to version control
-   Use different keys for development and production
-   Keep your secret keys secure
