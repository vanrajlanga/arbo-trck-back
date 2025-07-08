# Mobile App API Integration Guide

## Overview

This document provides comprehensive documentation for all API endpoints under `/api/v1` designed for mobile application integration. The API supports both customer-facing features (mobile app) and admin/vendor features (web interface).

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

### Customer Authentication (Mobile App)

-   **Type**: Firebase ID Token + JWT
-   **Header**: `Authorization: Bearer <jwt_token>`
-   **Token Expiry**: 30 days

### Admin/Vendor Authentication (Web Interface)

-   **Type**: Email/Password + JWT
-   **Header**: `Authorization: Bearer <jwt_token>`
-   **Token Expiry**: 24 hours

---

## 1. Customer Authentication APIs

### 1.1 Firebase Token Verification & Login

**Endpoint**: `POST /customer/auth/firebase-verify`

**Description**: Verify Firebase ID token and login/register customer

**Request Body**:

```json
{
    "firebaseIdToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**:

```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "customer": {
            "id": 1,
            "phone": "+919876543210",
            "name": "John Doe",
            "email": "john@example.com",
            "profileCompleted": true,
            "isNewCustomer": false
        },
        "expiresIn": "30d"
    }
}
```

### 1.2 Update Customer Profile

**Endpoint**: `PUT /customer/auth/profile`

**Headers**: `Authorization: Bearer <jwt_token>`

**Request Body**:

```json
{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "dateOfBirth": "1990-01-01",
    "emergencyContact": "+919876543211",
    "city_id": 1,
    "state_id": 1
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
            "phone": "+919876543210",
            "name": "John Doe",
            "email": "john@example.com",
            "dateOfBirth": "1990-01-01",
            "emergencyContact": "+919876543211",
            "profileCompleted": true
        }
    }
}
```

### 1.3 Get Customer Profile

**Endpoint**: `GET /customer/auth/profile`

**Headers**: `Authorization: Bearer <jwt_token>`

**Response**:

```json
{
    "success": true,
    "data": {
        "customer": {
            "id": 1,
            "phone": "+919876543210",
            "name": "John Doe",
            "email": "john@example.com",
            "dateOfBirth": "1990-01-01",
            "emergencyContact": "+919876543211",
            "profileCompleted": true,
            "city_id": 1,
            "state_id": 1,
            "city": {
                "id": 1,
                "name": "Dehradun"
            },
            "state": {
                "id": 1,
                "name": "Uttarakhand"
            },
            "travelers": [
                {
                    "id": 1,
                    "name": "John Doe",
                    "age": 30,
                    "gender": "male",
                    "phone": "+919876543210",
                    "emergency_contact_name": "Jane Doe",
                    "emergency_contact_phone": "+919876543211",
                    "emergency_contact_relation": "Spouse",
                    "medical_conditions": "None",
                    "dietary_restrictions": "Vegetarian",
                    "id_proof_type": "Aadhar",
                    "id_proof_number": "123456789012",
                    "is_active": true,
                    "created_at": "2025-01-15T10:30:00.000Z"
                }
            ]
        }
    }
}
```

---

## 2. Location APIs

### 2.1 Get All States

**Endpoint**: `GET /states`

**Description**: Get all states with optional filtering

**Query Parameters**:

-   `status` (optional): Filter by status (active, inactive)
-   `isPopular` (optional): Filter popular states (true, false)

**Response**:

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Uttarakhand",
            "status": "active",
            "created_at": "2025-01-15T10:30:00.000Z",
            "updated_at": "2025-01-15T10:30:00.000Z"
        },
        {
            "id": 2,
            "name": "Himachal Pradesh",
            "status": "active",
            "created_at": "2025-01-15T10:30:00.000Z",
            "updated_at": "2025-01-15T10:30:00.000Z"
        }
    ]
}
```

### 2.2 Get State by ID

**Endpoint**: `GET /states/:id`

**Description**: Get specific state details

**Response**:

```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Uttarakhand",
        "status": "active",
        "created_at": "2025-01-15T10:30:00.000Z",
        "updated_at": "2025-01-15T10:30:00.000Z"
    }
}
```

### 2.3 Get Popular States

**Endpoint**: `GET /states/popular`

**Description**: Get all popular states

**Response**:

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Uttarakhand",
            "status": "active",
            "is_popular": true,
            "cities": [
                {
                    "id": 1,
                    "name": "Dehradun",
                    "status": "active",
                    "is_popular": true
                }
            ],
            "created_at": "2025-01-15T10:30:00.000Z",
            "updated_at": "2025-01-15T10:30:00.000Z"
        }
    ]
}
```

### 2.4 Get Cities

**Endpoint**: `GET /cities`

**Description**: Get all cities with optional filtering

**Query Parameters**:

-   `search` (optional): Search cities by name
-   `stateId` (optional): Filter cities by state ID

**Response**:

```json
{
    "success": true,
    "data": {
        "cities": [
            {
                "id": 1,
                "cityName": "Dehradun",
                "isPopular": true,
                "stateId": 1,
                "state": {
                    "id": 1,
                    "name": "Uttarakhand"
                },
                "created_at": "2025-01-15T10:30:00.000Z",
                "updated_at": "2025-01-15T10:30:00.000Z"
            },
            {
                "id": 2,
                "cityName": "Shimla",
                "isPopular": true,
                "stateId": 2,
                "state": {
                    "id": 2,
                    "name": "Himachal Pradesh"
                },
                "created_at": "2025-01-15T10:30:00.000Z",
                "updated_at": "2025-01-15T10:30:00.000Z"
            }
        ]
    }
}
```

### 2.5 Get City by ID

**Endpoint**: `GET /cities/:id`

**Description**: Get specific city details

**Response**:

```json
{
    "success": true,
    "data": {
        "id": 1,
        "cityName": "Dehradun",
        "isPopular": true,
        "stateId": 1,
        "state": {
            "id": 1,
            "name": "Uttarakhand"
        },
        "created_at": "2025-01-15T10:30:00.000Z",
        "updated_at": "2025-01-15T10:30:00.000Z"
    }
}
```

---

## 3. Trek APIs

### 2.1 Get All Public Treks

**Endpoint**: `GET /treks`

**Query Parameters**:

-   `page` (optional): Page number (default: 1)
-   `limit` (optional): Items per page (default: 10)
-   `difficulty` (optional): Filter by difficulty (easy, moderate, difficult, extreme)
-   `minPrice` (optional): Minimum price filter
-   `maxPrice` (optional): Maximum price filter
-   `category` (optional): Filter by category

**Response**:

```json
{
    "success": true,
    "data": [
        {
            "id": 15,
            "name": "Valley of Flowers Trek",
            "description": "Experience the magical Valley of Flowers...",
            "destination": "Valley of Flowers",
            "duration": "6 Days / 5 Nights",
            "durationDays": 6,
            "durationNights": 5,
            "price": 15999.0,
            "difficulty": "moderate",
            "category": "Flower Valley Trek",
            "availableSlots": 15,
            "startDate": "2025-08-15",
            "endDate": "2025-08-20",
            "images": [
                "/storage/trek_1_image1.jpg",
                "/storage/trek_1_image2.jpg"
            ],
            "rating": 4.5,
            "hasDiscount": true,
            "discountValue": 10.0,
            "discountType": "percentage",
            "discountText": "10% OFF",
            "vendor": {
                "id": 1,
                "name": "Himalayan Adventures",
                "rating": 4.0
            },
            "createdAt": "2025-01-15T10:30:00.000Z"
        }
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalCount": 50,
        "hasMore": true
    }
}
```

### 2.2 Get Trek Details

**Endpoint**: `GET /treks/:id`

**Response**:

```json
{
    "success": true,
    "data": {
        "id": 15,
        "name": "Valley of Flowers Trek",
        "description": "Experience the magical Valley of Flowers...",
        "destination": "Valley of Flowers",
        "destination_id": 1,
        "city_id": 5,
        "city": {
            "id": 5,
            "cityName": "Dehradun",
            "state": {
                "id": 1,
                "name": "Uttarakhand"
            }
        },
        "duration": "6 Days / 5 Nights",
        "durationDays": 6,
        "durationNights": 5,
        "price": 15999.0,
        "difficulty": "moderate",
        "category": "Flower Valley Trek",
        "trekType": "mountain",
        "maxParticipants": 15,
        "availableSlots": 15,
        "startDate": "2025-08-15",
        "endDate": "2025-08-20",
        "meetingPoint": "Dehradun Railway Station",
        "meetingTime": "08:00 AM",
        "images": ["/storage/trek_1_image1.jpg", "/storage/trek_1_image2.jpg"],
        "itinerary": [
            {
                "day": 1,
                "activities": ["Arrival at Dehradun", "Transfer to base camp"]
            }
        ],
        "accommodations": [
            {
                "night": 1,
                "type": "tent",
                "details": {
                    "name": "Base Camp Tents",
                    "location": "Valley Base Camp",
                    "description": "Comfortable camping tents"
                }
            }
        ],
        "trekStages": [
            {
                "id": 1,
                "name": "Base to Valley",
                "description": "Trek from base camp to valley",
                "distance": "8 km",
                "duration": "4 hours"
            }
        ],
        "inclusions": ["Accommodation", "Meals", "Guide"],
        "exclusions": ["Personal expenses", "Travel insurance"],
        "rating": 4.5,
        "hasDiscount": true,
        "discountValue": 10.0,
        "discountType": "percentage",
        "discountText": "10% OFF",
        "vendor": {
            "id": 1,
            "name": "Himalayan Adventures",
            "email": "info@himalayanadventures.com",
            "phone": "+919876543210",
            "rating": 4.0,
            "status": "active"
        },
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-15T10:30:00.000Z"
    }
}
```

### 2.3 Search Treks

**Endpoint**: `GET /treks/search`

**Query Parameters**:

-   `q` (required): Search query
-   `page` (optional): Page number (default: 1)
-   `limit` (optional): Items per page (default: 10)
-   `difficulty` (optional): Filter by difficulty
-   `minPrice` (optional): Minimum price filter
-   `maxPrice` (optional): Maximum price filter
-   `startDate` (optional): Filter by start date
-   `destination_id` (optional): Filter by destination
-   `city_id` (optional): Filter by city

**Response**:

```json
{
    "success": true,
    "data": [
        {
            "id": 15,
            "name": "Valley of Flowers Trek",
            "description": "Experience the magical Valley of Flowers...",
            "destination": "Valley of Flowers",
            "destination_id": 1,
            "city_id": 5,
            "city": "Dehradun",
            "duration": "6 Days / 5 Nights",
            "durationDays": 6,
            "durationNights": 5,
            "price": 15999.0,
            "difficulty": "moderate",
            "trekType": "mountain",
            "category": "Flower Valley Trek",
            "maxParticipants": 15,
            "availableSlots": 15,
            "startDate": "2025-08-15",
            "endDate": "2025-08-20",
            "meetingPoint": "Dehradun Railway Station",
            "meetingTime": "08:00 AM",
            "status": "published",
            "images": ["/storage/trek_1_image1.jpg"],
            "rating": 4.5,
            "hasDiscount": true,
            "discountValue": 10.0,
            "discountType": "percentage",
            "discountText": "10% OFF",
            "vendor": {
                "id": 1,
                "name": "Himalayan Adventures",
                "email": "info@himalayanadventures.com",
                "phone": "+919876543210",
                "rating": 4.0,
                "status": "active"
            },
            "createdAt": "2025-01-15T10:30:00.000Z",
            "updatedAt": "2025-01-15T10:30:00.000Z"
        }
    ],
    "searchQuery": "valley flowers",
    "filters": {
        "destination_id": null,
        "city_id": null,
        "startDate": null,
        "difficulty": null,
        "priceRange": {
            "min": null,
            "max": null
        }
    },
    "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalCount": 1
    }
}
```

### 2.4 Get Treks by Category

**Endpoint**: `GET /treks/category/:categoryId`

**Query Parameters**:

-   `page` (optional): Page number (default: 1)
-   `limit` (optional): Items per page (default: 10)

**Response**:

```json
{
    "success": true,
    "data": [
        {
            "id": 15,
            "name": "Valley of Flowers Trek",
            "description": "Experience the magical Valley of Flowers...",
            "destination": "Valley of Flowers",
            "duration": "6 Days / 5 Nights",
            "price": 15999.0,
            "difficulty": "moderate",
            "availableSlots": 15,
            "images": ["/storage/trek_1_image1.jpg"],
            "rating": 4.5,
            "hasDiscount": true,
            "discountValue": 10.0,
            "discountType": "percentage",
            "discountText": "10% OFF",
            "vendor": {
                "id": 1,
                "name": "Himalayan Adventures",
                "rating": 4.0
            }
        }
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalCount": 1
    }
}
```

---

## 3. Destination APIs

### 3.1 Get All Destinations

**Endpoint**: `GET /destinations`

**Query Parameters**:

-   `state` (optional): Filter by state
-   `isPopular` (optional): Filter popular destinations (true/false)
-   `status` (optional): Filter by status (default: active)
-   `limit` (optional): Items per page (default: 100)
-   `offset` (optional): Offset for pagination (default: 0)

**Response**:

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Valley of Flowers",
            "state": "Uttarakhand",
            "isPopular": true,
            "status": "active",
            "created_at": "2025-01-15T10:30:00.000Z",
            "updated_at": "2025-01-15T10:30:00.000Z"
        }
    ],
    "pagination": {
        "total": 42,
        "limit": 100,
        "offset": 0,
        "hasMore": false
    }
}
```

### 3.2 Get Popular Destinations

**Endpoint**: `GET /destinations/popular`

**Query Parameters**:

-   `limit` (optional): Number of destinations (default: 10)

**Response**:

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Valley of Flowers",
            "state": "Uttarakhand",
            "isPopular": true,
            "status": "active",
            "created_at": "2025-01-15T10:30:00.000Z",
            "updated_at": "2025-01-15T10:30:00.000Z"
        }
    ],
    "count": 1
}
```

### 3.3 Search Destinations

**Endpoint**: `GET /destinations/search`

**Query Parameters**:

-   `q` (required): Search query
-   `region` (optional): Filter by region
-   `difficulty` (optional): Filter by difficulty
-   `trekType` (optional): Filter by trek type
-   `isPopular` (optional): Filter popular destinations
-   `status` (optional): Filter by status (default: active)
-   `limit` (optional): Items per page (default: 20)
-   `offset` (optional): Offset for pagination (default: 0)

**Response**:

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Valley of Flowers",
            "state": "Uttarakhand",
            "isPopular": true,
            "status": "active",
            "created_at": "2025-01-15T10:30:00.000Z",
            "updated_at": "2025-01-15T10:30:00.000Z"
        }
    ],
    "pagination": {
        "total": 1,
        "limit": 20,
        "offset": 0,
        "hasMore": false
    },
    "search": {
        "query": "valley",
        "results": 1
    }
}
```

### 3.4 Get Destinations by Region

**Endpoint**: `GET /destinations/region/:region`

**Query Parameters**:

-   `limit` (optional): Items per page (default: 50)
-   `offset` (optional): Offset for pagination (default: 0)

**Response**:

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Valley of Flowers",
            "state": "Uttarakhand",
            "isPopular": true,
            "status": "active",
            "created_at": "2025-01-15T10:30:00.000Z",
            "updated_at": "2025-01-15T10:30:00.000Z"
        }
    ],
    "region": "north",
    "pagination": {
        "total": 1,
        "limit": 50,
        "offset": 0,
        "hasMore": false
    }
}
```

### 3.5 Get Destination by ID

**Endpoint**: `GET /destinations/:id`

**Response**:

```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Valley of Flowers",
        "state": "Uttarakhand",
        "isPopular": true,
        "status": "active",
        "created_at": "2025-01-15T10:30:00.000Z",
        "updated_at": "2025-01-15T10:30:00.000Z"
    }
}
```

---

## 4. Location APIs

### 4.1 Get Cities

**Endpoint**: `GET /locations/cities`

**Response**:

```json
{
    "success": true,
    "data": {
        "cities": [
            {
                "id": 1,
                "cityName": "Dehradun",
                "state": {
                    "id": 1,
                    "name": "Uttarakhand"
                }
            }
        ]
    }
}
```

---

## 5. State APIs

### 5.1 Get All States

**Endpoint**: `GET /states`

**Response**:

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Uttarakhand",
            "region": "north",
            "isPopular": true
        }
    ]
}
```

### 5.2 Get Popular States

**Endpoint**: `GET /states/popular`

**Response**:

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Uttarakhand",
            "region": "north",
            "isPopular": true
        }
    ]
}
```

### 5.3 Get States by Region

**Endpoint**: `GET /states/region/:region`

**Response**:

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Uttarakhand",
            "region": "north",
            "isPopular": true
        }
    ]
}
```

### 5.4 Get State by ID

**Endpoint**: `GET /states/:id`

**Response**:

```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Uttarakhand",
        "region": "north",
        "isPopular": true
    }
}
```

---

## 6. Coupon APIs

### 6.1 Get All Coupons

**Endpoint**: `GET /coupons`

**Query Parameters**:

-   `limit` (optional): Items per page (default: 50)
-   `offset` (optional): Offset for pagination (default: 0)

**Response**:

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "code": "WELCOME10",
            "description": "Welcome discount for new customers",
            "discount_type": "percentage",
            "discount_value": 10.0,
            "min_order_amount": 1000.0,
            "max_discount_amount": 500.0,
            "usage_limit": 100,
            "used_count": 25,
            "valid_from": "2025-01-01T00:00:00.000Z",
            "valid_until": "2025-12-31T23:59:59.000Z",
            "is_active": true,
            "status": "active",
            "created_at": "2025-01-01T00:00:00.000Z",
            "updated_at": "2025-01-01T00:00:00.000Z"
        }
    ],
    "pagination": {
        "total": 1,
        "limit": 50,
        "offset": 0,
        "hasMore": false
    }
}
```

### 6.2 Get Coupon by Code

**Endpoint**: `GET /coupons/code/:code`

**Response**:

```json
{
    "success": true,
    "data": {
        "id": 1,
        "code": "WELCOME10",
        "description": "Welcome discount for new customers",
        "discount_type": "percentage",
        "discount_value": 10.0,
        "min_order_amount": 1000.0,
        "max_discount_amount": 500.0,
        "usage_limit": 100,
        "used_count": 25,
        "valid_from": "2025-01-01T00:00:00.000Z",
        "valid_until": "2025-12-31T23:59:59.000Z",
        "is_active": true,
        "status": "active",
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z"
    }
}
```

### 6.3 Validate Coupon

**Endpoint**: `POST /coupons/validate`

**Request Body**:

```json
{
    "code": "WELCOME10",
    "amount": 5000.0
}
```

**Response**:

```json
{
    "success": true,
    "data": {
        "coupon": {
            "id": 1,
            "code": "WELCOME10",
            "description": "Welcome discount for new customers",
            "discount_type": "percentage",
            "discount_value": 10.0,
            "min_order_amount": 1000.0,
            "max_discount_amount": 500.0,
            "usage_limit": 100,
            "used_count": 25,
            "valid_from": "2025-01-01T00:00:00.000Z",
            "valid_until": "2025-12-31T23:59:59.000Z",
            "is_active": true,
            "status": "active"
        },
        "originalAmount": 5000.0,
        "discountAmount": 500.0,
        "finalAmount": 4500.0,
        "savings": 500.0
    }
}
```

---

## 7. Customer Booking APIs

### 7.1 Create Booking

**Endpoint**: `POST /customer/bookings`

**Headers**: `Authorization: Bearer <jwt_token>`

**Request Body**:

```json
{
    "trek_id": 15,
    "batch_id": 1,
    "pickup_point_id": 1,
    "coupon_id": 1,
    "travelers": [
        {
            "id": 1,
            "name": "John Doe",
            "age": 30,
            "gender": "male",
            "phone": "+919876543210",
            "email": "john@example.com",
            "emergency_contact_name": "Jane Doe",
            "emergency_contact_phone": "+919876543211",
            "emergency_contact_relation": "Spouse",
            "medical_conditions": "None",
            "dietary_restrictions": "Vegetarian",
            "is_primary": true,
            "special_requirements": "None",
            "accommodation_preference": "shared",
            "meal_preference": "veg"
        }
    ],
    "special_requests": "Early morning pickup preferred"
}
```

**Note**:

-   Use existing traveler `id` if the traveler already exists in the customer's profile
-   Omit `id` to create a new traveler
-   At least one traveler must be marked as `is_primary: true`
-   If no primary traveler is specified, the first traveler becomes primary

**Response**:

```json
{
    "success": true,
    "message": "Booking created successfully",
    "data": {
        "booking": {
            "id": 1,
            "bookingNumber": "BK20250115001",
            "trek_id": 15,
            "trekName": "Valley of Flowers Trek",
            "customer_id": 1,
            "totalAmount": 15999.0,
            "discountAmount": 1599.9,
            "finalAmount": 14399.1,
            "status": "pending",
            "travelers": [
                {
                    "id": 1,
                    "name": "John Doe",
                    "age": 30,
                    "gender": "male",
                    "phone": "+919876543210",
                    "email": "john@example.com",
                    "emergency_contact_name": "Jane Doe",
                    "emergency_contact_phone": "+919876543211",
                    "emergency_contact_relation": "Spouse",
                    "medical_conditions": "None",
                    "dietary_restrictions": "Vegetarian",
                    "is_primary": true,
                    "status": "confirmed"
                }
            ],
            "createdAt": "2025-01-15T10:30:00.000Z"
        }
    }
}
```

### 7.2 Get Customer Bookings

**Endpoint**: `GET /customer/bookings`

**Headers**: `Authorization: Bearer <jwt_token>`

**Response**:

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "bookingNumber": "BK20250115001",
            "trekId": 15,
            "trekName": "Valley of Flowers Trek",
            "trekImage": "/storage/trek_1_image1.jpg",
            "startDate": "2025-08-15",
            "endDate": "2025-08-20",
            "totalAmount": 15999.0,
            "finalAmount": 14399.1,
            "status": "confirmed",
            "travelers": [
                {
                    "id": 1,
                    "name": "John Doe",
                    "age": 30,
                    "gender": "male",
                    "is_primary": true
                }
            ],
            "createdAt": "2025-01-15T10:30:00.000Z"
        }
    ]
}
```

### 7.3 Get Booking Details

**Endpoint**: `GET /customer/bookings/:id`

**Headers**: `Authorization: Bearer <jwt_token>`

**Response**:

```json
{
    "success": true,
    "data": {
        "id": 1,
        "bookingNumber": "BK20250115001",
        "trekId": 15,
        "trekName": "Valley of Flowers Trek",
        "trekImage": "/storage/trek_1_image1.jpg",
        "startDate": "2025-08-15",
        "endDate": "2025-08-20",
        "meetingPoint": "Dehradun Railway Station",
        "meetingTime": "08:00 AM",
        "totalAmount": 15999.0,
        "discountAmount": 1599.9,
        "finalAmount": 14399.1,
        "status": "confirmed",
        "travelers": [
            {
                "id": 1,
                "name": "John Doe",
                "age": 30,
                "gender": "male",
                "phone": "+919876543210",
                "email": "john@example.com",
                "emergency_contact_name": "Jane Doe",
                "emergency_contact_phone": "+919876543211",
                "emergency_contact_relation": "Spouse",
                "medical_conditions": "None",
                "dietary_restrictions": "Vegetarian",
                "is_primary": true,
                "status": "confirmed"
            }
        ],
        "vendor": {
            "id": 1,
            "name": "Himalayan Adventures",
            "phone": "+919876543210",
            "email": "info@himalayanadventures.com"
        },
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-15T10:30:00.000Z"
    }
}
```

### 7.4 Cancel Booking

**Endpoint**: `PUT /customer/bookings/:id/cancel`

**Headers**: `Authorization: Bearer <jwt_token>`

**Response**:

```json
{
    "success": true,
    "message": "Booking cancelled successfully",
    "data": {
        "booking": {
            "id": 1,
            "status": "cancelled",
            "cancelledAt": "2025-01-15T11:30:00.000Z"
        }
    }
}
```

---

## 8. Traveler Management APIs

### 8.1 Get All Travelers

**Endpoint**: `GET /customer/travelers`

**Headers**: `Authorization: Bearer <jwt_token>`

**Query Parameters**:

-   `active_only` (optional): Filter active travelers only (default: true)

**Response**:

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "John Doe",
            "age": 30,
            "gender": "male",
            "phone": "+919876543210",
            "email": "john@example.com",
            "emergency_contact_name": "Jane Doe",
            "emergency_contact_phone": "+919876543211",
            "emergency_contact_relation": "Spouse",
            "medical_conditions": "None",
            "dietary_restrictions": "Vegetarian",
            "id_proof_type": "Aadhar",
            "id_proof_number": "123456789012",
            "is_active": true,
            "created_at": "2025-01-15T10:30:00.000Z",
            "updated_at": "2025-01-15T10:30:00.000Z"
        }
    ]
}
```

### 8.2 Create Traveler

**Endpoint**: `POST /customer/travelers`

**Headers**: `Authorization: Bearer <jwt_token>`

**Request Body**:

```json
{
    "name": "Jane Doe",
    "age": 28,
    "gender": "female",
    "phone": "+919876543212",
    "email": "jane@example.com",
    "emergency_contact_name": "John Doe",
    "emergency_contact_phone": "+919876543213",
    "emergency_contact_relation": "Spouse",
    "medical_conditions": "None",
    "dietary_restrictions": "Vegetarian",
    "id_proof_type": "Aadhar",
    "id_proof_number": "987654321098"
}
```

**Required Fields**: `name`, `age`, `gender`, `emergency_contact_name`, `emergency_contact_phone`

**Response**:

```json
{
    "success": true,
    "message": "Traveler created successfully",
    "data": {
        "id": 2,
        "name": "Jane Doe",
        "age": 28,
        "gender": "female",
        "phone": "+919876543212",
        "email": "jane@example.com",
        "emergency_contact_name": "John Doe",
        "emergency_contact_phone": "+919876543213",
        "emergency_contact_relation": "Spouse",
        "medical_conditions": "None",
        "dietary_restrictions": "Vegetarian",
        "id_proof_type": "Aadhar",
        "id_proof_number": "987654321098",
        "is_active": true,
        "created_at": "2025-01-15T10:30:00.000Z",
        "updated_at": "2025-01-15T10:30:00.000Z"
    }
}
```

### 8.3 Get Traveler Details

**Endpoint**: `GET /customer/travelers/:id`

**Headers**: `Authorization: Bearer <jwt_token>`

**Response**:

```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "John Doe",
        "age": 30,
        "gender": "male",
        "phone": "+919876543210",
        "email": "john@example.com",
        "emergency_contact_name": "Jane Doe",
        "emergency_contact_phone": "+919876543211",
        "emergency_contact_relation": "Spouse",
        "medical_conditions": "None",
        "dietary_restrictions": "Vegetarian",
        "id_proof_type": "Aadhar",
        "id_proof_number": "123456789012",
        "is_active": true,
        "created_at": "2025-01-15T10:30:00.000Z",
        "updated_at": "2025-01-15T10:30:00.000Z",
        "bookingTravelers": [
            {
                "id": 1,
                "booking": {
                    "id": 1,
                    "status": "confirmed",
                    "booking_date": "2025-01-15T10:30:00.000Z",
                    "final_amount": 15999.0
                }
            }
        ]
    }
}
```

### 8.4 Update Traveler

**Endpoint**: `PUT /customer/travelers/:id`

**Headers**: `Authorization: Bearer <jwt_token>`

**Request Body**:

```json
{
    "name": "John Smith",
    "age": 31,
    "email": "johnsmith@example.com",
    "emergency_contact_name": "Jane Smith",
    "emergency_contact_phone": "+919876543214",
    "emergency_contact_relation": "Spouse",
    "medical_conditions": "None",
    "dietary_restrictions": "Vegetarian",
    "id_proof_type": "Aadhar",
    "id_proof_number": "123456789012"
}
```

**Note**: Name, age, and gender cannot be updated if the traveler has active bookings.

**Response**:

```json
{
    "success": true,
    "message": "Traveler updated successfully",
    "data": {
        "id": 1,
        "name": "John Smith",
        "age": 31,
        "gender": "male",
        "phone": "+919876543210",
        "email": "johnsmith@example.com",
        "emergency_contact_name": "Jane Smith",
        "emergency_contact_phone": "+919876543214",
        "emergency_contact_relation": "Spouse",
        "medical_conditions": "None",
        "dietary_restrictions": "Vegetarian",
        "id_proof_type": "Aadhar",
        "id_proof_number": "123456789012",
        "is_active": true,
        "updated_at": "2025-01-15T11:30:00.000Z"
    }
}
```

### 8.5 Delete Traveler

**Endpoint**: `DELETE /customer/travelers/:id`

**Headers**: `Authorization: Bearer <jwt_token>`

**Note**: Travelers with active bookings cannot be deleted. They will be soft-deleted (marked as inactive).

**Response**:

```json
{
    "success": true,
    "message": "Traveler deleted successfully"
}
```

### 8.6 Get Traveler Bookings

**Endpoint**: `GET /customer/travelers/:id/bookings`

**Headers**: `Authorization: Bearer <jwt_token>`

**Response**:

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "bookingNumber": "BK20250115001",
            "trekName": "Valley of Flowers Trek",
            "trekImage": "/storage/trek_1_image1.jpg",
            "startDate": "2025-08-15",
            "endDate": "2025-08-20",
            "status": "confirmed",
            "finalAmount": 15999.0,
            "bookingDate": "2025-01-15T10:30:00.000Z",
            "vendor": {
                "id": 1,
                "name": "Himalayan Adventures",
                "phone": "+919876543210",
                "email": "info@himalayanadventures.com"
            }
        }
    ]
}
```

---

## Error Responses

### Standard Error Format

```json
{
    "success": false,
    "message": "Error description",
    "error": "Detailed error message (optional)"
}
```

### Common HTTP Status Codes

-   `200`: Success
-   `201`: Created
-   `400`: Bad Request (validation errors)
-   `401`: Unauthorized (authentication required)
-   `403`: Forbidden (insufficient permissions)
-   `404`: Not Found
-   `500`: Internal Server Error

### Validation Error Example

```json
{
    "success": false,
    "message": "Validation errors",
    "errors": [
        {
            "field": "phone",
            "message": "Valid phone number is required"
        }
    ]
}
```

---

## Rate Limiting

-   **Public APIs**: 100 requests per minute per IP
-   **Authenticated APIs**: 1000 requests per minute per user
-   **Booking APIs**: 10 requests per minute per user

---

## Versioning

-   Current version: `v1`
-   API version is included in the URL: `/api/v1/`
-   Breaking changes will be introduced in new versions
-   Deprecated endpoints will be announced 6 months in advance

---

## Support

For API support and questions:

-   Email: api-support@arobo.com
-   Documentation: https://docs.arobo.com/api
-   Status Page: https://status.arobo.com
