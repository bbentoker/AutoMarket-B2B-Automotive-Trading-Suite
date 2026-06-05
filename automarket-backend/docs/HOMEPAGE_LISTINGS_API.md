# SECURITY-SANITIZED: Production brand and infrastructure details were redacted for public showcase.

# all-listings Listings API Documentation

## Endpoint: Get All Listings for all-listings

**URL:** `/api/listings/all-listings`  
**Method:** `GET`  
**Authentication:** Not required (public endpoint)

## Overview

This endpoint retrieves paginated listings with comprehensive filtering capabilities. It only returns active listings (status_id 1 or 3) that are not deleted.

---

## Pagination Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Integer | 1 | Current page number (must be ≥ 1) |
| `limit` | Integer | 10 | Number of listings per page (1-100 recommended) |

### Pagination Examples

**Basic Pagination:**
```bash
GET /api/listings/all-listings?page=1&limit=10
```

**Get First 20 Listings:**
```bash
GET /api/listings/all-listings?limit=20
```

**Get Page 3 with 15 Items:**
```bash
GET /api/listings/all-listings?page=3&limit=15
```

---

## Response Structure

### Success Response (200 OK)

```json
{
  "listings": [
    {
      "id": 123,
      "reference_no": "ABC123",
      "brand_name": "BMW",
      "model": "X5",
      "year": 2020,
      "listing_price": 45000,
      "currency": "EUR",
      "km_stand": 50000,
      "fuel_type": "Diesel",
      "transmission_type": "Automatic",
      "color": "Black",
      "vin_number": "WBA5A5C50ED123456",
      "remaining_time": "48h 30m",
      "photos": [
        {
          "id": 1,
          "url": "https://s3.amazonaws.com/..."
        }
      ],
      "damagedParts": [],
      "Is_Available": true,
      "Reference_Number": "ABC123",
      "Listing_URL": "https://automarket.example.com/listing/ABC123",
      "VIN_Number": "WBA5A5C50ED123456",
      "Vehicle_Location": "Sweden",
      "First_Registration": "2020-03-15",
      "Year": 2020,
      "Brand": "BMW",
      "Model": "X5",
      "Price": 45000,
      "Currency": "EUR",
      "Max_Discount": 500,
      "Transport_Cost": 530,
      "Additional_Fees": 29,
      "Odometer": 50000,
      "Transmission": "Automatic",
      "Fuel_Type": "Diesel",
      "Exterior_Color": "Black",
      "Condition_Report": "No damages reported",
      "Deposit_Amount": 500,
      "VAT_Status": "Excl. VAT",
      "Excl_VAT": true,
      "Incl_VAT": false
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 15,
    "totalListings": 145,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response (500)

```json
{
  "error": "Error message describing what went wrong"
}
```

---

## Filtering Parameters

All filters are **optional** and can be combined. Filters are case-insensitive.

### Brand and Model Filters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `brand` | String | Filter by car brand (partial match) | `brand=BMW` |
| `model` | String | Filter by car model (partial match) | `model=X5` |

**Example:**
```bash
GET /api/listings/all-listings?brand=BMW&model=3%20Series
```

### Reference Number Filter

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `referenceNumber` | String | Filter by reference number (partial match, case-insensitive) | `referenceNumber=ABC` |

**Example:**
```bash
GET /api/listings/all-listings?referenceNumber=ABC123
```

### Price Filter

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `price` | JSON Object | Filter by price range (min and max) | `price={"min":20000,"max":50000}` |

**Example:**
```bash
# URL Encoded
GET /api/listings/all-listings?price=%7B%22min%22%3A20000%2C%22max%22%3A50000%7D

# Decoded for readability
GET /api/listings/all-listings?price={"min":20000,"max":50000}
```

**Note:** When making requests from JavaScript/frontend:
```javascript
const params = new URLSearchParams({
  price: JSON.stringify({ min: 20000, max: 50000 })
});
```

### Mileage Filter

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `mileage` | String | Filter by mileage range (format: "min-max") | `mileage=0-100000` |

**Example:**
```bash
GET /api/listings/all-listings?mileage=50000-150000
```

### Seats Filter

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `seats` | String | Filter by number of seats (format: "min-max") | `seats=4-7` |

**Example:**
```bash
GET /api/listings/all-listings?seats=5-7
```

### String-Based Filters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `plateNumber` | String | Filter by registration/plate number | `plateNumber=ABC123` |
| `bodyType` | String | Filter by body type (searches in features) | `bodyType=SUV` |
| `fuelType` | String | Filter by fuel type | `fuelType=Diesel` |
| `transmission` | String | Filter by transmission type | `transmission=Automatic` |
| `driveType` | String | Filter by drive type (searches in features) | `driveType=AWD` |
| `color` | String | Filter by exterior color | `color=Black` |

**Examples:**
```bash
# Fuel Type
GET /api/listings/all-listings?fuelType=Diesel

# Transmission
GET /api/listings/all-listings?transmission=Automatic

# Color
GET /api/listings/all-listings?color=red
```

---

## Combined Filtering Examples

### Example 1: BMW X5, Diesel, Price Range with Pagination
```bash
GET /api/listings/all-listings?brand=BMW&model=X5&fuelType=Diesel&price={"min":30000,"max":60000}&page=1&limit=20
```

### Example 2: Automatic Transmission, Low Mileage, Black Color
```bash
GET /api/listings/all-listings?transmission=Automatic&mileage=0-50000&color=Black&limit=15
```

### Example 3: Search by Reference Number
```bash
GET /api/listings/all-listings?referenceNumber=ABC&page=1&limit=10
```

### Example 4: All Filters Combined
```bash
GET /api/listings/all-listings?brand=Mercedes&model=E-Class&fuelType=Diesel&transmission=Automatic&price={"min":25000,"max":45000}&mileage=30000-80000&color=Silver&seats=4-5&page=2&limit=20
```

---

## Frontend Implementation Examples

### JavaScript/Fetch

```javascript
// Basic pagination
async function getListings(page = 1, limit = 10) {
  const response = await fetch(
    `/api/listings/all-listings?page=${page}&limit=${limit}`
  );
  const data = await response.json();
  return data;
}

// With filters
async function getFilteredListings(filters) {
  const params = new URLSearchParams();
  
  // Add pagination
  params.append('page', filters.page || 1);
  params.append('limit', filters.limit || 10);
  
  // Add brand/model filters
  if (filters.brand) params.append('brand', filters.brand);
  if (filters.model) params.append('model', filters.model);
  
  // Add price filter (JSON object)
  if (filters.minPrice && filters.maxPrice) {
    params.append('price', JSON.stringify({
      min: filters.minPrice,
      max: filters.maxPrice
    }));
  }
  
  // Add mileage filter (range string)
  if (filters.minMileage && filters.maxMileage) {
    params.append('mileage', `${filters.minMileage}-${filters.maxMileage}`);
  }
  
  // Add other filters
  if (filters.fuelType) params.append('fuelType', filters.fuelType);
  if (filters.transmission) params.append('transmission', filters.transmission);
  if (filters.color) params.append('color', filters.color);
  
  const response = await fetch(`/api/listings/all-listings?${params.toString()}`);
  const data = await response.json();
  return data;
}

// Usage
const listings = await getFilteredListings({
  page: 1,
  limit: 20,
  brand: 'BMW',
  fuelType: 'Diesel',
  minPrice: 30000,
  maxPrice: 60000
});

console.log(listings.listings); // Array of listings
console.log(listings.pagination); // Pagination info
```

### React Example

```javascript
import { useState, useEffect } from 'react';

function ListingsPage() {
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    brand: '',
    model: '',
    fuelType: '',
    transmission: ''
  });

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const fetchListings = async () => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const response = await fetch(`/api/listings/all-listings?${params}`);
    const data = await response.json();
    
    setListings(data.listings);
    setPagination(data.pagination);
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  return (
    <div>
      {/* Filter controls */}
      <input 
        placeholder="Brand"
        value={filters.brand}
        onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
      />
      
      {/* Listings grid */}
      {listings.map(listing => (
        <div key={listing.id}>
          <h3>{listing.Brand} {listing.Model}</h3>
          <p>Price: {listing.Price} {listing.Currency}</p>
        </div>
      ))}
      
      {/* Pagination controls */}
      <div>
        <button 
          disabled={!pagination.hasPrevPage}
          onClick={() => handlePageChange(filters.page - 1)}
        >
          Previous
        </button>
        <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
        <button 
          disabled={!pagination.hasNextPage}
          onClick={() => handlePageChange(filters.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### Axios Example

```javascript
import axios from 'axios';

async function getListings(page = 1, limit = 10, filters = {}) {
  try {
    const response = await axios.get('/api/listings/all-listings', {
      params: {
        page,
        limit,
        ...filters,
        // Price needs to be stringified
        ...(filters.minPrice && filters.maxPrice && {
          price: JSON.stringify({
            min: filters.minPrice,
            max: filters.maxPrice
          })
        })
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
}

// Usage
const data = await getListings(1, 20, {
  brand: 'BMW',
  fuelType: 'Diesel',
  transmission: 'Automatic'
});
```

---

## Response Fields Explanation

### Core Listing Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Unique listing ID |
| `reference_no` | String | Human-readable reference number (e.g., "ABC123") |
| `brand_name` | String | Car brand |
| `model` | String | Car model |
| `listing_price` | Decimal | Price of the vehicle |
| `currency` | String | Currency code (e.g., "EUR", "USD") |
| `km_stand` | Integer | Odometer reading in kilometers |
| `fuel_type` | String | Fuel type (Diesel, Petrol, Electric, etc.) |
| `transmission_type` | String | Transmission type (Automatic, Manual) |
| `color` | String | Exterior color |
| `vin_number` | String | Vehicle Identification Number |
| `remaining_time` | String | Time remaining before listing expires (e.g., "48h 30m") |
| `photos` | Array | Array of photo objects with `id` and `url` |
| `damagedParts` | Array | Array of damaged part objects |

### Structured Data Fields

These fields are formatted specifically for easy integration:

| Field | Type | Description |
|-------|------|-------------|
| `Reference_Number` | String | Same as `reference_no` |
| `Listing_URL` | String | Full URL to the listing page |
| `VIN_Number` | String | Same as `vin_number` |
| `Year` | Integer | Year extracted from `first_registration` |
| `Brand` | String | Same as `brand_name` |
| `Model` | String | Same as `model` |
| `Price` | Decimal | Same as `listing_price` |
| `Currency` | String | Same as `currency` |
| `Max_Discount` | Integer | Maximum discount available (€500) |
| `Transport_Cost` | Integer | Transport cost (default: €530) |
| `Additional_Fees` | Integer | Additional fees for documents (€29) |
| `Odometer` | Integer | Same as `km_stand` |
| `Transmission` | String | Same as `transmission_type` |
| `Fuel_Type` | String | Same as `fuel_type` |
| `Exterior_Color` | String | Same as `color` |
| `Condition_Report` | String | Summary of damaged parts or "No damages reported" |
| `Is_Available` | Boolean | Whether the car is available (status 1 or 3) |
| `Deposit_Amount` | Integer | Required deposit amount (€500) |
| `VAT_Status` | String | VAT status ("Excl. VAT", "Incl. VAT", "Margin") |
| `Excl_VAT` | Boolean | Whether price excludes VAT |
| `Incl_VAT` | Boolean | Whether price includes VAT |
| `Photos_of_Car` | Array | Same as `photos` array |

---

## Pagination Best Practices

### 1. Start with Reasonable Limits
```javascript
// Good: Start with 10-20 items per page
GET /api/listings/all-listings?limit=20

// Avoid: Very large limits can impact performance
GET /api/listings/all-listings?limit=1000
```

### 2. Show Pagination Controls
Always display:
- Current page number
- Total pages
- Next/Previous buttons
- Total listings count

### 3. Handle Empty Results
```javascript
if (data.listings.length === 0) {
  // Show "No listings found" message
  // Suggest clearing filters
}
```

### 4. Preserve Filters Across Pages
```javascript
// Keep filter state when navigating pages
const handlePageChange = (newPage) => {
  // Maintain all existing filters
  setFilters({ ...filters, page: newPage });
};
```

### 5. Show Loading States
```javascript
const [loading, setLoading] = useState(false);

const fetchListings = async () => {
  setLoading(true);
  try {
    const data = await getListings();
    setListings(data.listings);
  } finally {
    setLoading(false);
  }
};
```

---

## Performance Considerations

1. **Default Limit:** The default limit is 10 items. Adjust based on your UI needs.
2. **Filtering Performance:** All filters use database indexes for optimal performance.
3. **Photo Loading:** Photos are loaded with listings but may benefit from lazy loading on the frontend.
4. **Caching:** Consider caching results on the frontend for frequently accessed pages.

---

## Common Use Cases

### Use Case 1: all-listings Vehicle Grid
Display a grid of available vehicles with basic pagination:
```bash
GET /api/listings/all-listings?page=1&limit=12
```

### Use Case 2: Filtered Search Results
User searches for specific criteria:
```bash
GET /api/listings/all-listings?brand=BMW&fuelType=Diesel&price={"min":30000,"max":50000}&page=1&limit=20
```

### Use Case 3: Browse by Brand
Show all vehicles of a specific brand:
```bash
GET /api/listings/all-listings?brand=Mercedes&page=1&limit=15
```

### Use Case 4: Quick Reference Lookup
Find a vehicle by its reference number:
```bash
GET /api/listings/all-listings?referenceNumber=ABC123
```

---

## Notes

- **Status Filtering:** Only listings with `status_id` 1 (Cars for Sale) or 3 (Offers) are returned
- **Deleted Listings:** Listings marked as deleted (`is_deleted: true`) are automatically excluded
- **Case Sensitivity:** All text filters are case-insensitive
- **Partial Matching:** Brand, model, and string filters support partial matching
- **Time Remaining:** The `remaining_time` field shows how long before the listing expires
- **Photos:** Photos are ordered by ID to preserve the original upload order
- **Condition Report:** Automatically generated from damaged parts data

---

## Error Handling

### Client-Side Error Handling

```javascript
async function getListings() {
  try {
    const response = await fetch('/api/listings/all-listings?page=1&limit=10');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch listings:', error);
    // Show user-friendly error message
    return { listings: [], pagination: {} };
  }
}
```

---

## Support

For questions or issues with this API, please contact the development team or refer to the main API documentation.

