# Mobile Payment Flow Documentation

## Overview

This document describes the complete payment flow for mobile applications (Flutter/React Native) using Razorpay integration.

## Flow Diagram

```
User selects trek → fills details → taps Pay
↓
Flutter → POST /api/v1/bookings/create-trek-order
↓
Node.js → creates Razorpay order → sends orderId
↓
Flutter opens Razorpay checkout with orderId
↓
Payment successful → Flutter sends paymentId, orderId, signature
↓
Node.js backend verifies Razorpay signature
↓
If valid → marks booking as confirmed → sends confirmation
```

## API Endpoints

### 1. Create Trek Order

**Endpoint:** `POST /api/v1/bookings/create-trek-order`  
**Authentication:** Required (Customer token)

**Request Body:**

```json
{
    "trekId": 123,
    "travelers": [
        {
            "name": "John Doe",
            "age": 25,
            "gender": "male",
            "phone": "9876543210",
            "email": "john@example.com",
            "emergency_contact_name": "Jane Doe",
            "emergency_contact_phone": "9876543211",
            "emergency_contact_relation": "Spouse",
            "medical_conditions": "",
            "dietary_restrictions": "Vegetarian"
        }
    ],
    "pickupPointId": 1,
    "couponCode": "SAVE10",
    "specialRequests": "Early morning pickup preferred"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": "order_ABC123",
    "amount": 50000,
    "currency": "INR",
    "receipt": "trek_123_1640995200000"
  },
  "bookingData": {
    "trekId": 123,
    "customerId": 1,
    "travelers": [...],
    "pickupPointId": 1,
    "couponCode": "SAVE10",
    "specialRequests": "Early morning pickup preferred",
    "totalAmount": 1000,
    "discountAmount": 100,
    "finalAmount": 900
  }
}
```

### 2. Verify Payment

**Endpoint:** `POST /api/v1/bookings/verify-payment`  
**Authentication:** Required (Customer token)

**Request Body:**

```json
{
    "orderId": "order_ABC123",
    "paymentId": "pay_XYZ789",
    "signature": "abc123def456...",
    "trekId": 123,
    "travelers": [
        {
            "name": "John Doe",
            "age": 25,
            "gender": "male",
            "phone": "9876543210",
            "email": "john@example.com",
            "emergency_contact_name": "Jane Doe",
            "emergency_contact_phone": "9876543211",
            "emergency_contact_relation": "Spouse",
            "medical_conditions": "",
            "dietary_restrictions": "Vegetarian"
        }
    ],
    "pickupPointId": 1,
    "couponCode": "SAVE10",
    "specialRequests": "Early morning pickup preferred"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Booking created successfully with payment",
    "booking": {
        "id": 456,
        "customer_id": 1,
        "trek_id": 123,
        "vendor_id": 1,
        "total_travelers": 1,
        "total_amount": 1000,
        "discount_amount": 100,
        "final_amount": 900,
        "status": "confirmed",
        "payment_status": "completed",
        "booking_date": "2025-07-08T19:30:00.000Z",
        "special_requests": "Early morning pickup preferred",
        "booking_source": "mobile",
        "trek": {
            "id": 123,
            "title": "Himalayan Trek",
            "description": "Amazing trek in the Himalayas",
            "base_price": 1000,
            "duration": "5 days",
            "difficulty": "moderate",
            "meeting_point": "Delhi Airport",
            "meeting_time": "06:00"
        },
        "customer": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "9876543210"
        },
        "travelers": [
            {
                "id": 1,
                "is_primary": true,
                "status": "confirmed",
                "traveler": {
                    "id": 1,
                    "name": "John Doe",
                    "age": 25,
                    "gender": "male",
                    "phone": "9876543210",
                    "emergency_contact_name": "Jane Doe",
                    "emergency_contact_phone": "9876543211"
                }
            }
        ],
        "payments": [
            {
                "amount": 900,
                "payment_method": "razorpay",
                "transaction_id": "pay_XYZ789",
                "status": "success"
            }
        ]
    },
    "payment": {
        "orderId": "order_ABC123",
        "paymentId": "pay_XYZ789",
        "amount": 90000,
        "status": "captured"
    }
}
```

## Flutter Implementation Example

### 1. Create Order

```dart
Future<Map<String, dynamic>> createTrekOrder({
  required int trekId,
  required List<Map<String, dynamic>> travelers,
  int? pickupPointId,
  String? couponCode,
  String? specialRequests,
}) async {
  try {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/bookings/create-trek-order'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'trekId': trekId,
        'travelers': travelers,
        'pickupPointId': pickupPointId,
        'couponCode': couponCode,
        'specialRequests': specialRequests,
      }),
    );

    final data = jsonDecode(response.body);
    return data;
  } catch (e) {
    throw Exception('Failed to create order: $e');
  }
}
```

### 2. Initialize Razorpay

```dart
void initializeRazorpay() {
  _razorpay = Razorpay();
  _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
  _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
  _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
}

void _handlePaymentSuccess(PaymentSuccessResponse response) async {
  // Verify payment with backend
  await verifyPayment(
    orderId: response.data?['razorpay_order_id'],
    paymentId: response.data?['razorpay_payment_id'],
    signature: response.data?['razorpay_signature'],
  );
}
```

### 3. Verify Payment

```dart
Future<void> verifyPayment({
  required String orderId,
  required String paymentId,
  required String signature,
}) async {
  try {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/bookings/verify-payment'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'orderId': orderId,
        'paymentId': paymentId,
        'signature': signature,
        'trekId': selectedTrek.id,
        'travelers': travelers,
        'pickupPointId': selectedPickupPoint?.id,
        'couponCode': appliedCoupon?.code,
        'specialRequests': specialRequests,
      }),
    );

    final data = jsonDecode(response.body);
    if (data['success']) {
      // Show success message
      showSuccessDialog(data['booking']);
    } else {
      // Show error message
      showErrorDialog(data['message']);
    }
  } catch (e) {
    showErrorDialog('Payment verification failed: $e');
  }
}
```

### 4. Complete Payment Flow

```dart
Future<void> initiatePayment() async {
  try {
    // Step 1: Create order
    final orderResponse = await createTrekOrder(
      trekId: selectedTrek.id,
      travelers: travelers,
      pickupPointId: selectedPickupPoint?.id,
      couponCode: appliedCoupon?.code,
      specialRequests: specialRequests,
    );

    if (!orderResponse['success']) {
      throw Exception(orderResponse['message']);
    }

    // Step 2: Initialize Razorpay options
    var options = {
      'key': 'rzp_test_YOUR_KEY_ID',
      'amount': orderResponse['order']['amount'],
      'currency': orderResponse['order']['currency'],
      'name': 'Arobo Trekking',
      'description': 'Booking for ${selectedTrek.title}',
      'order_id': orderResponse['order']['id'],
      'prefill': {
        'name': userProfile.name,
        'email': userProfile.email,
        'contact': userProfile.phone,
      },
      'theme': {
        'color': '#10b981',
      },
    };

    // Step 3: Open Razorpay checkout
    _razorpay.open(options);
  } catch (e) {
    showErrorDialog('Failed to initiate payment: $e');
  }
}
```

## Error Handling

### Common Error Responses

**400 Bad Request:**

```json
{
    "success": false,
    "message": "Trek ID and travelers are required"
}
```

**401 Unauthorized:**

```json
{
    "success": false,
    "message": "Authentication required"
}
```

**404 Not Found:**

```json
{
    "success": false,
    "message": "Trek not found"
}
```

**500 Internal Server Error:**

```json
{
    "success": false,
    "message": "Failed to create order"
}
```

## Security Considerations

1. **Signature Verification**: Always verify Razorpay signature on the backend
2. **Amount Validation**: Verify payment amount matches expected amount
3. **Authentication**: All endpoints require valid customer token
4. **Input Validation**: Validate all traveler data before processing
5. **Error Handling**: Implement proper error handling for failed payments

## Testing

### Test Data

```json
{
    "trekId": 1,
    "travelers": [
        {
            "name": "Test User",
            "age": 25,
            "gender": "male",
            "phone": "9876543210",
            "emergency_contact_phone": "9876543211"
        }
    ]
}
```

### Test Environment

-   Use Razorpay test keys for development
-   Test with various payment methods (UPI, cards, wallets)
-   Test error scenarios (insufficient funds, network issues)
-   Test with different traveler counts and amounts

## Notes

1. **Booking Source**: All mobile bookings are marked with `booking_source: "mobile"`
2. **Traveler Management**: Existing travelers are reused if found by phone number
3. **Coupon Support**: Full coupon validation and application
4. **Payment Logging**: All payments are logged with transaction details
5. **Mobile Optimization**: Response data is optimized for mobile consumption
