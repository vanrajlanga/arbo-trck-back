# Database Seeders

This directory contains seeder files for populating the database with initial data.

## Available Seeders

### 1. Roles Seeder (`roles.js`)

-   **Purpose**: Creates basic user roles (admin, vendor, user)
-   **Usage**: `node seeders/roles.js`

### 2. Admin Seeder (`admin.js`)

-   **Purpose**: Creates default admin user
-   **Dependencies**: Requires roles to be seeded first
-   **Usage**: `node seeders/admin.js`

### 3. States Seeder (`states.js`)

-   **Purpose**: Populates the `states` table with all Indian states
-   **Records**: 32 states including all major trekking states
-   **Fields**: `name`, `status`
-   **Usage**: `node seeders/states.js`

### 4. Cities Seeder (`cities.js`)

-   **Purpose**: Populates the `cities` table with popular trekking cities
-   **Records**: 31 cities across major trekking states
-   **Fields**: `cityName`, `isPopular`, `stateId`
-   **Dependencies**: Requires states to be seeded first
-   **Usage**: `node seeders/cities.js`

### 5. Destinations Seeder (`destinations.js`)

-   **Purpose**: Populates the `destinations` table with popular trekking destinations
-   **Records**: 42 destinations across different states
-   **Fields**: `name`, `state`, `isPopular`, `status`
-   **Usage**: `node seeders/destinations.js`

### 6. Vendors Seeder (`vendors.js`)

-   **Purpose**: Creates sample vendor accounts with user associations
-   **Records**: 5 vendors with complete business details
-   **Dependencies**: Requires roles to be seeded first
-   **Usage**: `node seeders/vendors.js`

### 7. Customers Seeder (`customers.js`)

-   **Purpose**: Creates sample customer accounts with user associations
-   **Records**: 10 customers with complete profiles
-   **Dependencies**: Requires roles and cities to be seeded first
-   **Usage**: `node seeders/customers.js`

### 8. Travelers Seeder (`travelers.js`)

-   **Purpose**: Creates sample travelers for customers
-   **Records**: 15 travelers across 5 customers
-   **Dependencies**: Requires customers to be seeded first
-   **Usage**: `node seeders/travelers.js`

### 9. Treks Seeder (`treks.js`)

-   **Purpose**: Populates the `treks` table with comprehensive trekking packages
-   **Records**: 11 diverse treks across different regions and difficulty levels
-   **Fields**: `title`, `description`, `vendor_id`, `destination_id`, `city_id`, `duration`, `difficulty`, `trek_type`, `base_price`, etc.
-   **Dependencies**: Requires vendors, destinations, and cities to be seeded first
-   **Usage**: `node seeders/treks.js`

### 10. Trek Stages Seeder (`trekStages.js`)

-   **Purpose**: Creates detailed trek stages for each trek with transport and timing information
-   **Records**: 73 trek stages across 11 treks
-   **Fields**: `trek_id`, `stage_name`, `means_of_transport`, `date_time`
-   **Dependencies**: Requires treks to be seeded first
-   **Usage**: `node seeders/trekStages.js`

### 11. Batches Seeder (`batches.js`)

-   **Purpose**: Creates sample batches for treks
-   **Records**: Multiple batches per trek with different dates and capacities
-   **Dependencies**: Requires treks to be seeded first
-   **Usage**: `node seeders/batches.js`

### 12. Bookings Seeder (`bookings.js`)

-   **Purpose**: Creates sample bookings with traveler associations
-   **Records**: 5 bookings with different statuses and payment states
-   **Dependencies**: Requires customers, treks, batches, and travelers to be seeded first
-   **Usage**: `node seeders/bookings.js`

### 13. Rating Categories Seeder (`ratingCategories.js`)

-   **Purpose**: Creates rating categories for reviews
-   **Records**: 6 categories (Overall Experience, Guide Quality, Accommodation, Food Quality, Safety, Value for Money)
-   **Usage**: `node seeders/ratingCategories.js`

### 14. Reviews Seeder (`reviews.js`)

-   **Purpose**: Creates sample reviews (text feedback)
-   **Records**: 6 reviews for different treks
-   **Dependencies**: Requires customers and treks to be seeded first
-   **Usage**: `node seeders/reviews.js`

### 15. Ratings Seeder (`ratings.js`)

-   **Purpose**: Creates comprehensive ratings for all treks and customers
-   **Records**: Multiple ratings per customer-trek-category combination
-   **Fields**: `trek_id`, `customer_id`, `category_id`, `rating_value`, `comment`, `is_verified`
-   **Dependencies**: Requires customers, treks, and rating categories to be seeded first
-   **Usage**: `node seeders/ratings.js`

### 16. Coupons Seeder (`coupons.js`)

-   **Purpose**: Creates sample discount coupons
-   **Records**: 8 different types of coupons (percentage and fixed discounts)
-   **Usage**: `node seeders/coupons.js`

### 17. Pickup Points Seeder (`pickupPoints.js`)

-   **Purpose**: Creates sample pickup points for cities
-   **Records**: Multiple pickup points per major city
-   **Dependencies**: Requires cities to be seeded first
-   **Usage**: `node seeders/pickupPoints.js`

### 18. Master Seeder (`runAll.js`)

-   **Purpose**: Runs all seeders in the correct dependency order
-   **Usage**: `node seeders/runAll.js`

## Running Seeders

### Method 1: Using Master Seeder (Recommended)

```bash
# Run all seeders in the correct order
node seeders/runAll.js
```

### Method 2: Using Individual Seeders

```bash
# Run individual seeders in dependency order
node seeders/roles.js
node seeders/admin.js
node seeders/states.js
node seeders/cities.js
node seeders/destinations.js
node seeders/vendors.js
node seeders/customers.js
node seeders/travelers.js
node seeders/treks.js
node seeders/trekStages.js
node seeders/batches.js
node seeders/bookings.js
node seeders/ratingCategories.js
node seeders/reviews.js
node seeders/ratings.js
node seeders/coupons.js
node seeders/pickupPoints.js
```

### Method 3: Using Sequelize CLI

```bash
# Note: These seeders are optimized for Node.js execution
# Sequelize CLI may require traditional migration format
# Recommended to use Node.js method for better control and error handling
```

### Undoing Seeders

```bash
# For Node.js seeders, you can manually delete data from the database
# or use Sequelize CLI undo commands if using traditional format
```

## Data Overview

### Users & Authentication

-   **Roles**: admin, vendor, user
-   **Admin**: 1 admin user (admin@aorbo.com)
-   **Vendors**: 5 vendors with complete business profiles
-   **Customers**: 10 customers with complete profiles

### Location Data

-   **States**: 32 Indian states
-   **Cities**: 31 major trekking cities
-   **Destinations**: 42 trekking destinations
-   **Pickup Points**: Multiple pickup points per major city

### Trekking Data

-   **Treks**: 11 diverse trekking packages
-   **Trek Stages**: 73 detailed trek stages with transport and timing
-   **Batches**: Multiple batches per trek with different dates
-   **Travelers**: 15 travelers across 5 customers
-   **Bookings**: 5 sample bookings with different statuses

### Reviews & Ratings

-   **Rating Categories**: 6 categories (Overall Experience, Guide Quality, Accommodation, Food Quality, Safety, Value for Money)
-   **Reviews**: 6 sample reviews (text feedback)
-   **Ratings**: Comprehensive ratings for all treks and customers

### Business Data

-   **Coupons**: 8 different discount coupons (percentage and fixed)
-   **Trek Types**: Mountain, Forest, Desert, Coastal, Hill-station, Adventure
-   **Difficulty Levels**: Easy, Moderate, Difficult, Extreme
-   **Price Range**: ₹4,999 - ₹29,999
-   **Duration**: 2-8 days

### Trek Categories

-   Flower Valley, Pilgrimage, Adventure, Valley, Mountain, High Altitude, Extreme, Cultural, Tea Garden, Cave Trek

## Features

### ✅ Smart Seeding

-   **Duplicate Prevention**: Seeders check for existing data and skip if already present
-   **Proper Dependencies**: All relationships maintained correctly
-   **Error Handling**: Comprehensive error handling with informative messages
-   **Master Seeder**: Run all seeders with one command

### ✅ Flexible Usage

-   **Node.js Direct**: Run with `node seeders/filename.js`
-   **Master Seeder**: Run all with `node seeders/runAll.js`
-   **Optimized Design**: Built specifically for Node.js execution with better error handling
-   **Production Ready**: Designed to work on completely empty databases

### ✅ Production Ready

-   **Fresh Database**: Designed to work on completely empty databases
-   **Realistic Data**: Focused on trekking and adventure tourism
-   **Proper Relationships**: Foreign key relationships maintained correctly
-   **Comprehensive Content**: Includes detailed descriptions, inclusions, exclusions, pricing
-   **Complete User System**: Admin, vendors, customers with proper authentication

### ✅ Complete Data Set

-   **User Management**: Admin, vendors, customers with login credentials
-   **Location System**: States, cities, destinations, pickup points
-   **Trekking System**: Treks, batches, bookings, travelers
-   **Review System**: Reviews with category-wise ratings
-   **Business System**: Coupons, payment tracking

## Login Credentials

### 🔑 Admin Access

-   **Email**: admin@aorbo.com
-   **Password**: admin123

### 🏢 Vendor Access

-   **Email**: himalayan@aorbo.com
-   **Password**: vendor123
-   **Other Vendors**: mountain@aorbo.com, adventure@aorbo.com, ladakh@aorbo.com, sikkim@aorbo.com

### 👤 Customer Access

-   **Email**: rahul@example.com
-   **Password**: customer123
-   **Other Customers**: priya@example.com, amit@example.com, neha@example.com, vikram@example.com

## Trek Categories Included

### 🏔️ Mountain Treks

-   Valley of Flowers Trek (Uttarakhand)
-   Kedarnath Temple Trek (Uttarakhand)
-   Triund Trek (Himachal Pradesh)
-   Pangong Lake Trek (Ladakh)
-   Khardungla Pass Trek (Ladakh)
-   Yumthang Valley Trek (Sikkim)

### 🏕️ Adventure Treks

-   Rishikesh Adventure Trek (Uttarakhand)
-   Solang Valley Trek (Himachal Pradesh)

### 🏛️ Cultural Treks

-   Mysore Palace Trek (Karnataka)
-   Lonavala Caves Trek (Maharashtra)

### 🌿 Nature Treks

-   Munnar Tea Gardens Trek (Kerala)

## Notes

-   Seeders are designed to work on a fresh database
-   Cities seeder automatically references states by name
-   Treks seeder references vendors, destinations, and cities properly
-   All seeders include proper timestamps and status fields
-   Data is realistic and focused on trekking/adventure tourism
-   Foreign key relationships are properly maintained
-   Node.js method provides better error messages and control
-   Trek seeder includes comprehensive details like inclusions, exclusions, meeting points, and pricing
-   All seeders can be run individually or in sequence
-   Smart seeding prevents duplicate data insertion
