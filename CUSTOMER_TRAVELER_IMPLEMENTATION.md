# Customer-Traveler Paradigm Implementation Guide

## Overview

This document outlines the implementation of the new booking paradigm where customers (bookers) are separated from travelers (participants). The system now supports phone-only registration and allows customers to book treks for other people.

## Key Changes

### 1. Database Schema Changes

#### New Tables

-   **customers**: Phone-based customer accounts
-   **travelers**: People who participate in treks
-   **booking_travelers**: Links bookings to travelers (replaces booking_participants)

#### Modified Tables

-   **bookings**: Now references customers instead of users
-   Added `customer_id`, `booking_source`, `primary_contact_traveler_id`
-   Renamed `total_participants` to `total_travelers`

### 2. Authentication System

#### Customer Authentication (Mobile App)

-   **Phone-only registration**: No email or password required
-   **OTP-based verification**: 6-digit OTP sent via SMS
-   **JWT tokens**: Separate token type for customers
-   **Profile completion**: Optional name/email after registration

#### Endpoints

```
POST /api/v1/customer/auth/request-otp
POST /api/v1/customer/auth/verify-otp
PUT /api/v1/customer/auth/profile
GET /api/v1/customer/auth/profile
```

### 3. Booking Flow

#### New Booking Process

1. Customer authenticates with phone/OTP
2. Customer creates/selects travelers
3. Customer books trek for selected travelers
4. System creates booking with customer as owner
5. Travelers are linked to booking via booking_travelers table

#### Key Features

-   **Multiple travelers per booking**: Customer can book for family/friends
-   **Traveler reuse**: Save traveler profiles for future bookings
-   **Primary contact**: Designate main contact person for the trek
-   **Flexible pricing**: Per-traveler pricing with group discounts

### 4. API Structure

#### Customer-Centric Endpoints (Mobile - /api/v1/customer/\*)

```
/api/v1/customer/auth/*          - Phone-based authentication
/api/v1/customer/bookings/*      - Customer booking management
/api/v1/customer/travelers/*     - Traveler profile management
```

#### Admin/Vendor Endpoints (Web - /api/v1/\*)

```
/api/v1/auth/*                   - Email/password authentication
/api/v1/bookings/*               - Admin booking management
/api/v1/customers/*              - Customer analytics for vendors
```

## Implementation Steps

### Phase 1: Database Migration

```bash
# Run migrations to create new tables
npx sequelize-cli db:migrate

# The migration will:
# 1. Create customers, travelers, booking_travelers tables
# 2. Add customer_id to bookings table
# 3. Migrate existing users to customers
# 4. Convert booking_participants to travelers
```

### Phase 2: Model Updates

-   Update Sequelize models with new associations
-   Ensure proper foreign key relationships
-   Add validation rules for phone numbers

### Phase 3: Controller Implementation

-   Customer authentication controller with OTP
-   Traveler management controller
-   Updated booking controller for new paradigm

### Phase 4: Frontend Updates

-   Update vendor dashboard to show customer data
-   Modify booking forms for traveler selection
-   Add customer management interfaces

## Data Migration Strategy

### Existing Data Handling

1. **Users → Customers**: Users with role 'user' become customers
2. **Booking Participants → Travelers**: Convert participant data to traveler profiles
3. **Bookings**: Update to reference customers instead of users
4. **Preserve History**: All existing bookings remain intact

### Migration Script

```sql
-- 1. Create customers from users
INSERT INTO customers (phone, name, email, ...)
SELECT phone, name, email, ... FROM users WHERE role = 'user';

-- 2. Update bookings to reference customers
UPDATE bookings SET customer_id = (
  SELECT c.id FROM customers c, users u
  WHERE bookings.user_id = u.id AND c.email = u.email
);

-- 3. Create travelers from booking participants
INSERT INTO travelers (customer_id, name, age, ...)
SELECT b.customer_id, bp.name, bp.age, ...
FROM booking_participants bp, bookings b
WHERE bp.booking_id = b.id;
```

## API Examples

### Customer Registration

```javascript
// Request OTP
POST /api/v1/customer/auth/request-otp
{
  "phone": "+919876543210"
}

// Verify OTP
POST /api/v1/customer/auth/verify-otp
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

### Create Booking with Travelers

```javascript
POST /api/v1/customer/bookings
{
  "trek_id": 1,
  "batch_id": 1,
  "travelers": [
    {
      "name": "John Doe",
      "age": 30,
      "gender": "male",
      "phone": "+919876543210",
      "emergency_contact_name": "Jane Doe",
      "emergency_contact_phone": "+919876543211",
      "is_primary": true
    },
    {
      "id": 5, // Existing traveler
      "is_primary": false,
      "special_requirements": "Vegetarian meals"
    }
  ]
}
```

### Manage Travelers

```javascript
// Get customer's travelers
GET /api/v1/customer/travelers

// Create new traveler
POST /api/v1/customer/travelers
{
  "name": "Alice Smith",
  "age": 25,
  "gender": "female",
  "emergency_contact_name": "Bob Smith",
  "emergency_contact_phone": "+919876543212"
}
```

## Security Considerations

### OTP Security

-   5-minute expiration
-   Maximum 3 attempts per phone number
-   Rate limiting on OTP requests
-   SMS service integration required

### Data Privacy

-   Travelers belong to specific customers
-   Cross-customer data access prevented
-   Soft delete for traveler profiles
-   GDPR compliance for customer data

### Token Management

-   Separate JWT tokens for customers vs admin users
-   30-day expiration for customer tokens
-   Refresh token mechanism recommended

## Testing Strategy

### Unit Tests

-   Customer authentication flow
-   Traveler CRUD operations
-   Booking creation with multiple travelers
-   Data migration scripts

### Integration Tests

-   End-to-end booking flow
-   OTP verification process
-   Customer-traveler relationship integrity
-   Payment processing with new structure

### Load Testing

-   OTP generation and verification
-   Concurrent booking creation
-   Database performance with new schema

## Deployment Checklist

### Pre-deployment

-   [ ] Run database migrations
-   [ ] Test data migration on staging
-   [ ] Verify all model associations
-   [ ] Test OTP SMS integration
-   [ ] Update API documentation

### Post-deployment

-   [ ] Monitor OTP delivery rates
-   [ ] Verify customer registration flow
-   [ ] Check booking creation success rates
-   [ ] Monitor database performance
-   [ ] Validate vendor dashboard updates

## Future Enhancements

### Planned Features

1. **Group Bookings**: Enhanced support for large groups
2. **Family Accounts**: Link related customers/travelers
3. **Social Features**: Share trips with friends
4. **Loyalty Program**: Customer-based rewards
5. **Advanced Analytics**: Customer behavior insights

### Technical Improvements

1. **Redis for OTP Storage**: Replace in-memory storage
2. **SMS Service Integration**: Twilio/AWS SNS
3. **Push Notifications**: Real-time booking updates
4. **Offline Support**: Mobile app offline capabilities
5. **Data Sync**: Multi-device customer accounts

## Support and Maintenance

### Monitoring

-   OTP delivery success rates
-   Customer registration conversion
-   Booking completion rates
-   Database query performance

### Common Issues

-   OTP not received: Check SMS service status
-   Booking creation fails: Verify traveler data
-   Customer login issues: Check token expiration
-   Data migration problems: Rollback procedures

### Maintenance Tasks

-   Clean up expired OTPs
-   Archive old booking data
-   Update customer profiles
-   Monitor storage usage

---

This implementation provides a robust foundation for the new customer-traveler paradigm while maintaining backward compatibility and ensuring smooth migration from the existing system.
