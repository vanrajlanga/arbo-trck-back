# Firebase Setup for Arobo Trekking Platform

## Overview

The Arobo Trekking Platform now uses Firebase Authentication for phone-based OTP verification. This document provides setup instructions for Firebase integration.

## Prerequisites

1. Firebase project with Authentication enabled
2. Phone authentication provider enabled in Firebase Console
3. Firebase Admin SDK service account key

## Firebase Console Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Google Analytics (optional)

### 2. Enable Authentication

1. Go to Authentication > Sign-in method
2. Enable "Phone" provider
3. Configure authorized domains if needed

### 3. Generate Service Account Key

1. Go to Project Settings > Service accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Keep this file secure - never commit to version control

## Environment Variables Setup

Add the following environment variables to your `.env` file:

```bash
# Firebase Configuration (Required for Authentication)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
```

## API Endpoint Changes

### Old OTP Flow (Removed)

-   `POST /api/v1/customer/auth/request-otp`
-   `POST /api/v1/customer/auth/verify-otp`

### New Firebase Flow

-   `POST /api/v1/customer/auth/firebase-verify`

## Testing Firebase Integration

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Server

```bash
npm start
```

The new authentication flow:

1. **Client Side (Android App)**:

    - Use Firebase SDK to send OTP to phone
    - Verify OTP with Firebase
    - Get Firebase ID Token

2. **Backend API**:
    - Send Firebase ID Token to `/api/v1/customer/auth/firebase-verify`
    - Backend verifies token with Firebase Admin SDK
    - Returns JWT token for subsequent API calls
