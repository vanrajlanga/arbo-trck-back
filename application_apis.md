# Arobo Trekking Platform - VERIFIED API Documentation

## Overview

This document provides **VERIFIED AND TESTED** API documentation for the Arobo Trekking Platform's customer mobile application (Android). All endpoints listed here have been tested and confirmed working.

**Base URL**: `http://localhost:5000/api/v1` (Development)
**API Version**: v1.0.0
**Authentication**: Firebase Authentication + JWT Token

---

## ✅ Verified Working Endpoints

### 🔗 API Information

-   **GET** `/api/v1` - API version and endpoints info ✅

### 🔐 Customer Authentication (`/api/v1/customer/auth`) - Firebase Based

-   **POST** `/api/v1/customer/auth/firebase-verify` - Verify Firebase ID token and get JWT ✅
-   **GET** `/api/v1/customer/auth/profile` - Get profile (requires JWT) ✅
-   **PUT** `/api/v1/customer/auth/profile` - Update profile (requires JWT) ✅

### 🏔️ Trek Discovery (`/api/v1/treks`) - Public APIs

-   **GET** `/api/v1/treks` - Get all published treks ✅
-   **GET** `/api/v1/treks/search` - Search treks ✅
-   **GET** `/api/v1/treks/category/:categoryId` - Get treks by category ✅
-   **GET** `/api/v1/treks/:id` - Get trek details ✅

### 🧳 Traveler Management (`/api/v1/customer/travelers`) - Requires JWT

-   **GET** `/api/v1/customer/travelers` - Get all travelers ✅
-   **POST** `/api/v1/customer/travelers` - Create traveler ✅
-   **GET** `/api/v1/customer/travelers/:id` - Get traveler details ✅
-   **PUT** `/api/v1/customer/travelers/:id` - Update traveler ✅
-   **DELETE** `/api/v1/customer/travelers/:id` - Delete traveler ✅
-   **GET** `/api/v1/customer/travelers/:id/bookings` - Get traveler bookings ✅

### 📅 Booking Management (`/api/v1/customer/bookings`) - Requires JWT

-   **POST** `/api/v1/customer/bookings` - Create booking ✅
-   **GET** `/api/v1/customer/bookings` - Get customer bookings ✅
-   **GET** `/api/v1/customer/bookings/:id` - Get booking details ✅
-   **PUT** `/api/v1/customer/bookings/:id/cancel` - Cancel booking ✅

### 📍 Location Services (`/api/v1/locations`)

-   **GET** `/api/v1/locations/cities` - Get available cities ✅

---

## 🔐 Firebase Authentication System

### Authentication Flow

**NEW: Firebase-Based Authentication**

1. **Client Side (Android App)**:
    - Use Firebase SDK to send OTP to phone number
    - User enters OTP in the app
    - Firebase verifies OTP and provides Firebase ID Token
2. **Backend Verification**:

    - Send Firebase ID Token to backend
    - Backend verifies token with Firebase Admin SDK
    - Backend returns JWT token for subsequent API calls

3. **Protected API Access**:
    - Use JWT token for all authenticated endpoints
    - Token is valid for 30 days

### Authentication Header Format

For protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

---

## 📱 CORRECT API Usage Examples

### 1. Firebase Authentication

#### 1.1 Verify Firebase ID Token ✅

**Endpoint**: `POST /api/v1/customer/auth/firebase-verify`
**Authentication**: None required

**CORRECT cURL Example**:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"firebaseIdToken":"eyJhbGciOiJSUzI1NiIsImtpZCI6IjU..."}' \
  http://localhost:5000/api/v1/customer/auth/firebase-verify
```

**Request Body**:

```json
{
    "firebaseIdToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjU..."
}
```

**Success Response**:

```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "customer": {
            "id": 1,
            "phone": "+919898933987",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "profileCompleted": true,
            "isNewCustomer": false
        },
        "expiresIn": "30d"
    }
}
```

**Error Response**:

```json
{
    "success": false,
    "message": "Invalid Firebase token",
    "error": "Firebase ID token has expired"
}
```

#### 1.2 Get Profile ✅

**Endpoint**: `GET /api/v1/customer/auth/profile`
**Authentication**: Required

**CORRECT cURL Example**:

```bash
curl -H "Authorization: Bearer <your_jwt_token>" \
  http://localhost:5000/api/v1/customer/auth/profile
```

**Response**:

```json
{
    "success": true,
    "data": {
        "customer": {
            "id": 1,
            "phone": "+919898933987",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "dateOfBirth": "1990-01-15",
            "emergencyContact": {
                "name": "Jane Doe",
                "phone": "+919898933988",
                "relationship": "Spouse"
            },
            "profileCompleted": true,
            "travelers": []
        }
    }
}
```

#### 1.3 Update Profile ✅

**Endpoint**: `PUT /api/v1/customer/auth/profile`
**Authentication**: Required

**CORRECT cURL Example**:

```bash
curl -X PUT \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "dateOfBirth": "1990-01-15",
    "emergencyContact": {
        "name": "Jane Doe",
        "phone": "+919898933988",
        "relationship": "Spouse"
    }
  }' \
  http://localhost:5000/api/v1/customer/auth/profile
```

**Request Body**:

```json
{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "dateOfBirth": "1990-01-15",
    "emergencyContact": {
        "name": "Jane Doe",
        "phone": "+919898933988",
        "relationship": "Spouse"
    }
}
```

**Response**:

```json
{
    "success": true,
    "message": "Profile updated successfully",
    "data": {
        "customer": {
            "id": 1,
            "phone": "+919898933987",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "dateOfBirth": "1990-01-15",
            "emergencyContact": {
                "name": "Jane Doe",
                "phone": "+919898933988",
                "relationship": "Spouse"
            },
            "profileCompleted": true
        }
    }
}
```

---

### 2. Trek Discovery (Public APIs)

#### 2.1 Get All Treks ✅

**Endpoint**: `GET /api/v1/treks`

**CORRECT cURL Example**:

```bash
curl http://localhost:5000/api/v1/treks
```

**With Query Parameters**:

```bash
curl "http://localhost:5000/api/v1/treks?page=1&limit=10&difficulty=moderate"
```

**Response**:

```json
{
    "success": true,
    "data": [],
    "pagination": {
        "currentPage": 1,
        "totalPages": 0,
        "totalCount": 0,
        "hasMore": false
    }
}
```

#### 2.2 Search Treks ✅

**Endpoint**: `GET /api/v1/treks/search`

**CORRECT cURL Example**:

```bash
curl "http://localhost:5000/api/v1/treks/search?q=himalayan&difficulty=moderate"
```

**Response**:

```json
{
    "success": true,
    "data": [],
    "searchQuery": "himalayan",
    "pagination": {
        "currentPage": 1,
        "totalPages": 0,
        "totalCount": 0
    }
}
```

#### 2.3 Get Trek by ID ✅

**Endpoint**: `GET /api/v1/treks/:id`

**CORRECT cURL Example**:

```bash
curl http://localhost:5000/api/v1/treks/1
```

**Response (if not found)**:

```json
{
    "success": false,
    "message": "Trek not found"
}
```

#### 2.4 Get Treks by Category ✅

**Endpoint**: `GET /api/v1/treks/category/:categoryId`

**CORRECT cURL Example**:

```bash
curl http://localhost:5000/api/v1/treks/category/1
```

---

### 3. Location Services

#### 3.1 Get Cities ✅

**Endpoint**: `GET /api/v1/locations/cities`

**CORRECT cURL Example**:

```bash
curl http://localhost:5000/api/v1/locations/cities
```

**Response**:

```json
{
    "success": true,
    "data": {
        "cities": [],
        "pagination": {
            "currentPage": 1,
            "totalPages": 0,
            "totalItems": 0,
            "itemsPerPage": 10
        },
        "statistics": {
            "totalCities": 0,
            "activeCities": 0,
            "totalCustomers": 0,
            "totalBookings": 0,
            "growthRate": 23
        }
    }
}
```

---

### 4. Protected Routes (Require JWT Token)

All routes under `/api/v1/customer/travelers` and `/api/v1/customer/bookings` require authentication.

#### 4.1 Get All Travelers ✅

**Endpoint**: `GET /api/v1/customer/travelers`

**CORRECT cURL Example**:

```bash
curl -H "Authorization: Bearer <your_jwt_token>" \
  http://localhost:5000/api/v1/customer/travelers
```

#### 4.2 Create Traveler ✅

**Endpoint**: `POST /api/v1/customer/travelers`

**CORRECT cURL Example**:

```bash
curl -X POST \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "dateOfBirth": "1995-05-20",
    "phone": "+919898933988",
    "emergencyContact": {
        "name": "John Doe",
        "phone": "+919898933987",
        "relationship": "Brother"
    }
  }' \
  http://localhost:5000/api/v1/customer/travelers
```

#### 4.3 Get Customer Bookings ✅

**Endpoint**: `GET /api/v1/customer/bookings`

**CORRECT cURL Example**:

```bash
curl -H "Authorization: Bearer <your_jwt_token>" \
  http://localhost:5000/api/v1/customer/bookings
```

#### 4.4 Create Booking ✅

**Endpoint**: `POST /api/v1/customer/bookings`

**CORRECT cURL Example**:

```bash
curl -X POST \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "trekId": 1,
    "travelers": [{"id": 1, "isCustomer": true}],
    "specialRequests": "Vegetarian meals"
  }' \
  http://localhost:5000/api/v1/customer/bookings
```

---

## 🔧 Firebase Setup Requirements

### Prerequisites

1. **Firebase Project** with Authentication enabled
2. **Phone authentication** provider enabled
3. **Firebase Admin SDK** service account key
4. **Environment variables** configured

### Required Environment Variables

```bash
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
```

### Android App Integration

1. **Add Firebase SDK** to Android project
2. **Configure phone authentication**:

    ```kotlin
    // Send OTP
    PhoneAuthProvider.getInstance().verifyPhoneNumber(
        phoneNumber,
        60,
        TimeUnit.SECONDS,
        this,
        callbacks
    )

    // Get ID Token after verification
    FirebaseAuth.getInstance().currentUser?.getIdToken(true)
        ?.addOnCompleteListener { task ->
            val idToken = task.result?.token
            // Send idToken to backend
        }
    ```

---

## ⚠️ Migration from OTP-Based Authentication

### What Changed

**REMOVED Endpoints**:

-   ❌ `POST /api/v1/customer/auth/request-otp`
-   ❌ `POST /api/v1/customer/auth/verify-otp`

**NEW Endpoints**:

-   ✅ `POST /api/v1/customer/auth/firebase-verify`

**Database Changes**:

-   Added `firebase_uid` field to customers table
-   Added `date_of_birth` field for enhanced profiles
-   Added `emergency_contact` JSON field
-   Kept existing OTP fields for backward compatibility

### Updated Authentication Flow

**Old Flow**:

1. Client → Backend: Request OTP
2. Backend → SMS: Send OTP
3. Client → Backend: Verify OTP
4. Backend → Client: JWT Token

**New Firebase Flow**:

1. Client → Firebase: Send OTP (Firebase SDK)
2. Firebase → SMS: Send OTP
3. Client → Firebase: Verify OTP (Firebase SDK)
4. Firebase → Client: Firebase ID Token
5. Client → Backend: Verify Firebase ID Token
6. Backend → Client: JWT Token

---

## 📊 API Status Summary

| Endpoint Category  | Status     | Count  |
| ------------------ | ---------- | ------ |
| **API Info**       | ✅ Working | 1      |
| **Firebase Auth**  | ✅ Working | 3      |
| **Trek Discovery** | ✅ Working | 4      |
| **Travelers**      | ✅ Working | 6      |
| **Bookings**       | ✅ Working | 4      |
| **Locations**      | ✅ Working | 1      |
| **Total APIs**     | ✅ Working | **19** |

---

## 🛠️ Server Requirements

1. **MySQL Server**: Must be running on port 3306
2. **Node.js Server**: Must be running on port 5000
3. **Database**: MySQL database named `arobo_trekking`
4. **Firebase**: Properly configured with environment variables

**Start the servers**:

```bash
# Start MySQL (XAMPP)
sudo /Applications/XAMPP/xamppfiles/bin/mysql.server start

# Run database migration for Firebase fields
cd backend && npm run migrate

# Install Firebase dependency
npm install

# Start Node.js server
npm start
```

---

## 🔍 Testing Firebase Authentication

### 1. Get Firebase ID Token

Use Firebase SDK in your Android app to get the ID token after OTP verification.

### 2. Test Backend Verification

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"firebaseIdToken":"<firebase_id_token_from_app>"}' \
  http://localhost:5000/api/v1/customer/auth/firebase-verify
```

### 3. Use JWT for Protected Endpoints

```bash
curl -H "Authorization: Bearer <jwt_token_from_step_2>" \
  http://localhost:5000/api/v1/customer/auth/profile
```

---

_Last Updated: January 2025_  
_Firebase Authentication Integration Complete ✅_
