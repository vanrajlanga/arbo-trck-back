# Database Seeders

This directory contains seeder files for populating the database with initial data.

## Available Seeders

### 1. States Seeder (`states.js`)

-   **Purpose**: Populates the `states` table with all Indian states
-   **Records**: 32 states including all major trekking states
-   **Fields**: `name`, `status`
-   **Usage**: `node seeders/states.js`

### 2. Cities Seeder (`cities.js`)

-   **Purpose**: Populates the `cities` table with popular trekking cities
-   **Records**: 31 cities across major trekking states
-   **Fields**: `cityName`, `isPopular`, `stateId`
-   **Dependencies**: Requires states to be seeded first
-   **Usage**: `node seeders/cities.js`

### 3. Destinations Seeder (`destinations.js`)

-   **Purpose**: Populates the `destinations` table with popular trekking destinations
-   **Records**: 42 destinations across different states
-   **Fields**: `name`, `state`, `isPopular`, `status`
-   **Usage**: `node seeders/destinations.js`

### 4. Treks Seeder (`20250706114505-treks.js`)

-   **Purpose**: Populates the `treks` table with comprehensive trekking packages
-   **Records**: 11 diverse treks across different regions and difficulty levels
-   **Fields**: `title`, `description`, `vendor_id`, `destination_id`, `city_id`, `duration`, `difficulty`, `trek_type`, `base_price`, etc.
-   **Dependencies**: Requires vendors, destinations, and cities to be seeded first
-   **Usage**: `node seeders/20250706114505-treks.js`

### 5. Roles Seeder (`roles.js`)

-   **Purpose**: Creates basic user roles (admin, vendor, user)
-   **Usage**: `node seeders/roles.js`

### 6. Admin Seeder (`admin.js`)

-   **Purpose**: Creates default admin user
-   **Dependencies**: Requires roles to be seeded first
-   **Usage**: `node seeders/admin.js`

## Running Seeders

### Method 1: Using Node.js (Recommended)

```bash
# Run individual seeders in order
node seeders/roles.js
node seeders/admin.js
node seeders/states.js
node seeders/cities.js
node seeders/destinations.js
node seeders/20250706114505-treks.js
```

### Method 2: Using Sequelize CLI

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

### States (32 records)

-   **North India**: Uttarakhand, Himachal Pradesh, Jammu & Kashmir, Ladakh, etc.
-   **North-East India**: Sikkim, Arunachal Pradesh, Assam, etc.
-   **South India**: Karnataka, Kerala, Tamil Nadu, etc.
-   **West India**: Maharashtra, Gujarat, Goa
-   **Central India**: Madhya Pradesh, Chhattisgarh
-   **East India**: Jharkhand, Bihar, West Bengal, Odisha

### Cities (31 records)

-   **Popular Cities**: Major trekking hubs like Dehradun, Manali, Rishikesh, etc.
-   **Regular Cities**: Secondary trekking destinations
-   **Distribution**: Focused on major trekking states

### Destinations (42 records)

-   **Popular Destinations**: Valley of Flowers, Kedarnath, Solang Valley, etc.
-   **Categories**: Temples, Lakes, Passes, Adventure spots, Heritage sites
-   **States**: Distributed across all major trekking states

### Treks (11 records)

-   **Difficulty Levels**: Easy, Moderate, Difficult, Extreme
-   **Trek Types**: Mountain, Forest, Desert, Coastal, Hill-station, Adventure
-   **Price Range**: ₹4,999 - ₹29,999
-   **Duration**: 2-8 days
-   **Categories**: Flower Valley, Pilgrimage, Adventure, Valley, Mountain, High Altitude, Extreme, Cultural, Tea Garden, Cave Trek

## Features

### ✅ Smart Seeding

-   **Duplicate Prevention**: Seeders check for existing data and skip if already present
-   **Proper Dependencies**: Cities seeder automatically references states by name
-   **Error Handling**: Comprehensive error handling with informative messages

### ✅ Flexible Usage

-   **Node.js Direct**: Run with `node seeders/filename.js`
-   **Optimized Design**: Built specifically for Node.js execution with better error handling
-   **Production Ready**: Designed to work on completely empty databases

### ✅ Production Ready

-   **Fresh Database**: Designed to work on completely empty databases
-   **Realistic Data**: Focused on trekking and adventure tourism
-   **Proper Relationships**: Foreign key relationships maintained correctly
-   **Comprehensive Content**: Includes detailed descriptions, inclusions, exclusions, pricing

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
