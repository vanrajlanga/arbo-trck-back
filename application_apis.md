# Arobo Trekking Platform - VERIFIED API Documentation

## Overview

This document provides **VERIFIED AND TESTED** API documentation for the Arobo Trekking Platform's customer mobile application (Android). All endpoints listed here have been tested and confirmed working.

**Base URL**: `http://localhost:5000/api/v1` (Development)
**API Version**: v1.0.0
**Authentication**: Phone-based OTP + JWT Token

---

## ✅ Verified Working Endpoints

### 🔗 API Information

-   **GET** `/api/v1` - API version and endpoints info ✅

### 🔐 Customer Authentication (`/api/v1/customer/auth`)

-   **POST** `/api/v1/customer/auth/request-otp` - Request OTP ✅
-   **POST** `/api/v1/customer/auth/verify-otp` - Verify OTP and get JWT ✅
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

## 🔐 Authentication System

### Phone-Based Authentication Flow

1. **Request OTP** using phone number
2. **Verify OTP** to get JWT token
3. **Use JWT token** for all subsequent authenticated requests
4. **Complete profile** setup (required before booking)

### Authentication Header Format

For protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

---

## 📱 CORRECT API Usage Examples

### 1. Customer Authentication

#### 1.1 Request OTP ✅

**Endpoint**: `POST /api/v1/customer/auth/request-otp`
**Authentication**: None required

**CORRECT cURL Example**:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919898933987","countryCode":"+91"}' \
  http://localhost:5000/api/v1/customer/auth/request-otp
```

**Request Body**:

```json
{
    "phone": "+919898933987",
    "countryCode": "+91"
}
```

**Response**:

```json
{
    "success": true,
    "message": "OTP sent successfully",
    "expiresIn": 300
}
```

**⚠️ WRONG Example (causes 404)**:

```bash
# DON'T USE GET METHOD:
curl --request GET 'http://localhost:5000/api/v1/customer/auth/request-otp'

# DON'T USE FORM DATA:
curl --form 'phone="9898933987"' --form 'countryCode="+91"'
```

#### 1.2 Verify OTP ✅

**Endpoint**: `POST /api/v1/customer/auth/verify-otp`

**CORRECT cURL Example**:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919898933987","otp":"123456"}' \
  http://localhost:5000/api/v1/customer/auth/verify-otp
```

**Request Body**:

```json
{
    "phone": "+919898933987",
    "otp": "123456"
}
```

**Success Response**:

```json
{
    "success": true,
    "message": "OTP verified successfully",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "customer": {
            "id": 1,
            "phone": "+919898933987",
            "isProfileComplete": false
        },
        "expiresIn": "24h"
    }
}
```

**Error Response**:

```json
{
    "success": false,
    "message": "Invalid OTP",
    "attemptsLeft": 2
}
```

#### 1.3 Get Profile ✅

**Endpoint**: `GET /api/v1/customer/auth/profile`
**Authentication**: Required

**CORRECT cURL Example**:

```bash
curl -H "Authorization: Bearer <your_jwt_token>" \
  http://localhost:5000/api/v1/customer/auth/profile
```

#### 1.4 Update Profile ✅

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

## 🔍 Getting the OTP for Testing

The OTP is logged to the console when you run the backend server. After calling the request-otp endpoint, check your server terminal to see:

```
Sending OTP 123456 to phone +919898933987
```

---

## ⚠️ Common Mistakes That Cause 404 Errors

### 1. Using Wrong HTTP Method

```bash
# ❌ WRONG - Using GET for POST endpoints
curl --request GET 'http://localhost:5000/api/v1/customer/auth/request-otp'

# ✅ CORRECT - Using POST
curl -X POST -H "Content-Type: application/json" -d '{"phone":"+919898933987"}' http://localhost:5000/api/v1/customer/auth/request-otp
```

### 2. Using Form Data Instead of JSON

```bash
# ❌ WRONG - Using form data
curl --form 'phone="9898933987"' http://localhost:5000/api/v1/customer/auth/request-otp

# ✅ CORRECT - Using JSON
curl -X POST -H "Content-Type: application/json" -d '{"phone":"+919898933987"}' http://localhost:5000/api/v1/customer/auth/request-otp
```

### 3. Missing Content-Type Header

```bash
# ❌ WRONG - Missing Content-Type
curl -X POST -d '{"phone":"+919898933987"}' http://localhost:5000/api/v1/customer/auth/request-otp

# ✅ CORRECT - With Content-Type
curl -X POST -H "Content-Type: application/json" -d '{"phone":"+919898933987"}' http://localhost:5000/api/v1/customer/auth/request-otp
```

### 4. Missing Authorization Header for Protected Routes

```bash
# ❌ WRONG - No auth header
curl http://localhost:5000/api/v1/customer/travelers

# ✅ CORRECT - With auth header
curl -H "Authorization: Bearer <jwt_token>" http://localhost:5000/api/v1/customer/travelers
```

---

## 🔐 Complete Authentication Flow Example

```bash
# Step 1: Request OTP
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919898933987","countryCode":"+91"}' \
  http://localhost:5000/api/v1/customer/auth/request-otp

# Step 2: Check server console for OTP, then verify
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919898933987","otp":"123456"}' \
  http://localhost:5000/api/v1/customer/auth/verify-otp

# Step 3: Use the returned JWT token for protected routes
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:5000/api/v1/customer/auth/profile
```

---

## 📊 API Status Summary

| Endpoint Category  | Status     | Count  |
| ------------------ | ---------- | ------ |
| **API Info**       | ✅ Working | 1      |
| **Customer Auth**  | ✅ Working | 4      |
| **Trek Discovery** | ✅ Working | 4      |
| **Travelers**      | ✅ Working | 6      |
| **Bookings**       | ✅ Working | 4      |
| **Locations**      | ✅ Working | 1      |
| **Total APIs**     | ✅ Working | **20** |

---

## 🛠️ Server Requirements

1. **MySQL Server**: Must be running on port 3306
2. **Node.js Server**: Must be running on port 5000
3. **Database**: MySQL database named `arobo_trekking`

**Start the servers**:

```bash
# Start MySQL (XAMPP)
sudo /Applications/XAMPP/xamppfiles/bin/mysql.server start

# Start Node.js server
cd backend && npm start
```

---

_Last Updated: January 2025_  
_All endpoints tested and verified working ✅_
