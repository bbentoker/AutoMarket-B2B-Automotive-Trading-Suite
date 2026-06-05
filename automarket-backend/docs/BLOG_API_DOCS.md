# SECURITY-SANITIZED: Production brand and infrastructure details were redacted for public showcase.

# Blog API Documentation

## Base URL

```
/api/blogs
```

## Table of Contents

- [Get All Blogs](#get-all-blogs)
- [Get Blog Categories](#get-blog-categories)
- [Get Featured Blogs](#get-featured-blogs)
- [Get Single Blog](#get-single-blog)
- [Create Blog](#create-blog)
- [Create Blog with Image](#create-blog-with-image)
- [Update Blog](#update-blog)
- [Delete Blog](#delete-blog)
- [Toggle Featured Status](#toggle-featured-status)
- [Toggle Published Status](#toggle-published-status)
- [Data Models](#data-models)
- [Error Responses](#error-responses)

---

## Get All Blogs

Retrieve a paginated list of blogs with optional filtering and search capabilities.

**Endpoint:** `GET /api/blogs`

### Query Parameters

| Parameter   | Type    | Default | Description                                    |
| ----------- | ------- | ------- | ---------------------------------------------- |
| `page`      | integer | 1       | Page number for pagination                     |
| `limit`     | integer | 10      | Number of items per page                       |
| `category`  | string  | null    | Filter by blog category                        |
| `featured`  | boolean | null    | Filter by featured status (`true` or `false`)  |
| `search`    | string  | null    | Search in title, excerpt, and content          |
| `published` | boolean | true    | Filter by published status (`true` or `false`) |

### Example Request

```bash
GET /api/blogs?page=1&limit=5&category=Market%20Trends&featured=true&search=europe
```

### Example Response

```json
{
  "blogs": [
    {
      "id": 1,
      "title": "The Future of Cross-Border Car Trading in Europe",
      "excerpt": "Exploring how digital platforms are revolutionizing the way dealerships source vehicles across European markets.",
      "category": "Market Trends",
      "date": "2024-01-15",
      "read_time": "5 min read",
      "image": "/premium-sports-cars-showroom.jpeg",
      "slug": "future-cross-border-car-trading-europe",
      "featured": true,
      "content": "Full blog content here...",
      "author_id": 1,
      "is_published": true,
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z",
      "author": {
        "id": 1,
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 12,
    "itemsPerPage": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Get Blog Categories

Retrieve a list of all unique blog categories.

**Endpoint:** `GET /api/blogs/categories`

### Example Request

```bash
GET /api/blogs/categories
```

### Example Response

```json
{
  "categories": [
    "Market Trends",
    "Industry News",
    "Car Reviews",
    "Technology",
    "Business Tips"
  ]
}
```

---

## Get Featured Blogs

Retrieve a list of featured blogs.

**Endpoint:** `GET /api/blogs/featured`

### Query Parameters

| Parameter | Type    | Default | Description                                |
| --------- | ------- | ------- | ------------------------------------------ |
| `limit`   | integer | 5       | Maximum number of featured blogs to return |

### Example Request

```bash
GET /api/blogs/featured?limit=3
```

### Example Response

```json
{
  "blogs": [
    {
      "id": 1,
      "title": "The Future of Cross-Border Car Trading in Europe",
      "excerpt": "Exploring how digital platforms are revolutionizing...",
      "category": "Market Trends",
      "date": "2024-01-15",
      "read_time": "5 min read",
      "image": "/premium-sports-cars-showroom.jpeg",
      "slug": "future-cross-border-car-trading-europe",
      "featured": true,
      "content": "Full blog content...",
      "author_id": 1,
      "is_published": true,
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z",
      "author": {
        "id": 1,
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe"
      }
    }
  ]
}
```

---

## Get Single Blog

Retrieve a single blog by ID or slug.

**Endpoint:** `GET /api/blogs/:id`

### Path Parameters

| Parameter | Type           | Description                       |
| --------- | -------------- | --------------------------------- |
| `id`      | integer/string | Blog ID (number) or slug (string) |

### Example Requests

```bash
# Get by ID
GET /api/blogs/1

# Get by slug
GET /api/blogs/future-cross-border-car-trading-europe
```

### Example Response

```json
{
  "id": 1,
  "title": "The Future of Cross-Border Car Trading in Europe",
  "excerpt": "Exploring how digital platforms are revolutionizing the way dealerships source vehicles across European markets.",
  "category": "Market Trends",
  "date": "2024-01-15",
  "read_time": "5 min read",
  "image": "/premium-sports-cars-showroom.jpeg",
  "slug": "future-cross-border-car-trading-europe",
  "featured": true,
  "content": "Full blog content here...",
  "author_id": 1,
  "is_published": true,
  "created_at": "2024-01-15T10:00:00.000Z",
  "updated_at": "2024-01-15T10:00:00.000Z",
  "author": {
    "id": 1,
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

---

## Create Blog

Create a new blog post.

**Endpoint:** `POST /api/blogs`

### Request Body

| Field          | Type    | Required | Description                                 |
| -------------- | ------- | -------- | ------------------------------------------- |
| `title`        | string  | ✅       | Blog title                                  |
| `excerpt`      | string  | ✅       | Short description/summary                   |
| `category`     | string  | ✅       | Blog category                               |
| `date`         | string  | ✅       | Publication date (YYYY-MM-DD format)        |
| `read_time`    | string  | ✅       | Estimated reading time (e.g., "5 min read") |
| `image`        | string  | ❌       | Featured image URL/path                     |
| `content`      | string  | ❌       | Full blog content                           |
| `featured`     | boolean | ❌       | Whether blog is featured (default: false)   |
| `author_id`    | integer | ❌       | Author's user ID                            |
| `is_published` | boolean | ❌       | Publication status (default: true)          |

### Example Request

```bash
POST /api/blogs
Content-Type: application/json

{
  "title": "Electric Vehicles in the European Market",
  "excerpt": "An analysis of the growing electric vehicle market across Europe and its impact on traditional car dealerships.",
  "category": "Industry News",
  "date": "2024-01-20",
  "read_time": "7 min read",
  "image": "/electric-cars-charging.jpg",
  "content": "The electric vehicle market in Europe has seen unprecedented growth...",
  "featured": false,
  "author_id": 2,
  "is_published": true
}
```

### Example Response

```json
{
  "message": "Blog created successfully",
  "data": {
    "id": 2,
    "title": "Electric Vehicles in the European Market",
    "excerpt": "An analysis of the growing electric vehicle market across Europe...",
    "category": "Industry News",
    "date": "2024-01-20",
    "read_time": "7 min read",
    "image": "/electric-cars-charging.jpg",
    "slug": "electric-vehicles-in-the-european-market",
    "featured": false,
    "content": "The electric vehicle market in Europe has seen unprecedented growth...",
    "author_id": 2,
    "is_published": true,
    "created_at": "2024-01-20T14:30:00.000Z",
    "updated_at": "2024-01-20T14:30:00.000Z",
    "author": {
      "id": 2,
      "email": "jane@example.com",
      "first_name": "Jane",
      "last_name": "Smith"
    }
  }
}
```

---

## Create Blog with Image

Create a new blog post with image upload using multipart/form-data.

**Endpoint:** `POST /api/blogs/create-with-image`

### Content Type

`multipart/form-data`

### Form Fields

| Field          | Type   | Required | Description                                 |
| -------------- | ------ | -------- | ------------------------------------------- |
| `title`        | string | ✅       | Blog title                                  |
| `excerpt`      | string | ✅       | Short description/summary                   |
| `category`     | string | ✅       | Blog category                               |
| `date`         | string | ✅       | Publication date (YYYY-MM-DD format)        |
| `read_time`    | string | ✅       | Estimated reading time (e.g., "5 min read") |
| `image`        | file   | ❌       | Image file (JPG, PNG, etc.)                 |
| `content`      | string | ❌       | Full blog content                           |
| `featured`     | string | ❌       | "true" or "false" (default: false)          |
| `author_id`    | string | ❌       | Author's user ID                            |
| `is_published` | string | ❌       | "true" or "false" (default: true)           |

### Example Request

```bash
curl -X POST "http://localhost:3000/api/blogs/create-with-image" \
  -H "Content-Type: multipart/form-data" \
  -F "title=Car Market Analysis 2024" \
  -F "excerpt=Deep dive into the European car market trends" \
  -F "category=Market Analysis" \
  -F "date=2024-01-20" \
  -F "read_time=8 min read" \
  -F "content=The European car market has seen significant changes..." \
  -F "featured=true" \
  -F "is_published=true" \
  -F "author_id=1" \
  -F "image=@/path/to/your/image.jpg"
```

### Example Response

```json
{
  "message": "Blog created successfully with image",
  "data": {
    "id": 3,
    "title": "Car Market Analysis 2024",
    "excerpt": "Deep dive into the European car market trends",
    "category": "Market Analysis",
    "date": "2024-01-20",
    "read_time": "8 min read",
    "image": "[Base64 Image - 45678 characters]",
    "slug": "car-market-analysis-2024",
    "featured": true,
    "content": "The European car market has seen significant changes...",
    "author_id": 1,
    "is_published": true,
    "created_at": "2024-01-20T15:30:00.000Z",
    "updated_at": "2024-01-20T15:30:00.000Z",
    "author": {
      "id": 1,
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

### Image Storage

- Images are converted to base64 and stored in the database
- Supported formats: JPG, PNG, GIF, WebP, etc.
- Maximum file size: 20MB
- The response shows image info instead of the full base64 for performance

### Form Data Notes

- Boolean fields (`featured`, `is_published`) should be sent as strings: "true" or "false"
- Numeric fields (`author_id`) should be sent as strings and will be parsed
- The `image` field accepts any image file type
- All text fields are handled as strings from form data

---

## Update Blog

Update an existing blog post.

**Endpoint:** `PUT /api/blogs/:id`

### Path Parameters

| Parameter | Type    | Description       |
| --------- | ------- | ----------------- |
| `id`      | integer | Blog ID to update |

### Request Body

Same fields as [Create Blog](#create-blog), all fields are optional.

### Example Request

```bash
PUT /api/blogs/2
Content-Type: application/json

{
  "title": "Electric Vehicles: The Future of European Markets",
  "featured": true,
  "content": "Updated content with more recent statistics..."
}
```

### Example Response

```json
{
  "message": "Blog updated successfully",
  "data": {
    "id": 2,
    "title": "Electric Vehicles: The Future of European Markets",
    "excerpt": "An analysis of the growing electric vehicle market across Europe...",
    "category": "Industry News",
    "date": "2024-01-20",
    "read_time": "7 min read",
    "image": "/electric-cars-charging.jpg",
    "slug": "electric-vehicles-the-future-of-european-markets",
    "featured": true,
    "content": "Updated content with more recent statistics...",
    "author_id": 2,
    "is_published": true,
    "created_at": "2024-01-20T14:30:00.000Z",
    "updated_at": "2024-01-20T16:45:00.000Z",
    "author": {
      "id": 2,
      "email": "jane@example.com",
      "first_name": "Jane",
      "last_name": "Smith"
    }
  }
}
```

---

## Delete Blog

Delete a blog post.

**Endpoint:** `DELETE /api/blogs/:id`

### Path Parameters

| Parameter | Type    | Description       |
| --------- | ------- | ----------------- |
| `id`      | integer | Blog ID to delete |

### Example Request

```bash
DELETE /api/blogs/2
```

### Example Response

```json
{
  "message": "Blog deleted successfully"
}
```

---

## Toggle Featured Status

Toggle the featured status of a blog post.

**Endpoint:** `PATCH /api/blogs/:id/toggle-featured`

### Path Parameters

| Parameter | Type    | Description |
| --------- | ------- | ----------- |
| `id`      | integer | Blog ID     |

### Example Request

```bash
PATCH /api/blogs/1/toggle-featured
```

### Example Response

```json
{
  "message": "Blog featured successfully",
  "data": {
    "id": 1,
    "title": "The Future of Cross-Border Car Trading in Europe",
    "featured": true,
    "// ... other fields"
  }
}
```

---

## Toggle Published Status

Toggle the published status of a blog post.

**Endpoint:** `PATCH /api/blogs/:id/toggle-published`

### Path Parameters

| Parameter | Type    | Description |
| --------- | ------- | ----------- |
| `id`      | integer | Blog ID     |

### Example Request

```bash
PATCH /api/blogs/1/toggle-published
```

### Example Response

```json
{
  "message": "Blog unpublished successfully",
  "data": {
    "id": 1,
    "title": "The Future of Cross-Border Car Trading in Europe",
    "is_published": false,
    "// ... other fields"
  }
}
```

---

## Data Models

### Blog Object

```typescript
interface Blog {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string; // YYYY-MM-DD format
  read_time: string; // e.g., "5 min read"
  image: string | null;
  slug: string; // URL-friendly version of title
  featured: boolean;
  content: string | null;
  author_id: number | null;
  is_published: boolean;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  author?: Author; // Included when fetching with author info
}
```

### Author Object

```typescript
interface Author {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}
```

### Pagination Object

```typescript
interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Missing required fields",
  "details": "title, excerpt, category, date, and read_time are required"
}
```

### 404 Not Found

```json
{
  "message": "Blog not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Failed to create blog",
  "details": "Detailed error message"
}
```

---

## Notes

1. **Slug Generation**: Slugs are automatically generated from the title and ensured to be unique.
2. **Author Association**: When `author_id` is provided, the author's information is included in responses.
3. **Search**: The search functionality looks through title, excerpt, and content fields.
4. **Filtering**: Multiple filters can be combined (e.g., category + featured + published).
5. **Case Sensitivity**: Search is case-insensitive.
6. **Pagination**: Default pagination is 10 items per page, maximum recommended is 100.

---

## Examples

### Create a Featured Blog Post

```bash
curl -X POST http://localhost:3000/api/blogs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Top 10 Luxury Cars for 2024",
    "excerpt": "Discover the most luxurious vehicles hitting the European market this year.",
    "category": "Car Reviews",
    "date": "2024-01-25",
    "read_time": "8 min read",
    "image": "/luxury-cars-2024.jpg",
    "content": "The luxury car market continues to evolve...",
    "featured": true,
    "author_id": 1
  }'
```

### Search for Blogs

```bash
curl "http://localhost:3000/api/blogs?search=electric&category=Industry%20News&limit=5"
```

### Get Featured Blogs Only

```bash
curl "http://localhost:3000/api/blogs/featured?limit=3"
```

### Create Blog with Image Upload

```bash
curl -X POST "http://localhost:3000/api/blogs/create-with-image" \
  -H "Content-Type: multipart/form-data" \
  -F "title=Car Market Analysis 2024" \
  -F "excerpt=Deep dive into the European car market trends" \
  -F "category=Market Analysis" \
  -F "date=2024-01-20" \
  -F "read_time=8 min read" \
  -F "content=The European car market has seen significant changes..." \
  -F "featured=true" \
  -F "is_published=true" \
  -F "author_id=1" \
  -F "image=@C:\Users\YourName\Pictures\car-market-chart.jpg"
```
