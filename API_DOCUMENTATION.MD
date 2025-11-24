## API Documentation

**Base URL:** `https://lacaknutri.rbwtech.io/api`

**API Version:** v1

**Authentication:** JWT Bearer Token (7 days expiration)

**Content-Type:** `application/json` (except file uploads)

---

### Table of Contents

1. [Authentication & Security](#authentication--security)
2. [Rate Limiting](#rate-limiting)
3. [Error Handling](#error-handling)
4. [Authentication Module](#authentication-module)
5. [Scan Module](#scan-module)
6. [User Module](#user-module)
7. [Education Module](#education-module)
8. [Food Catalog Module](#food-catalog-module)
9. [Favorites Module](#favorites-module)
10. [Admin Module](#admin-module)

---

## Authentication & Security

### JWT Token Structure

**Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Payload:**
```json
{
  "sub": "user@example.com",
  "exp": 1640000000,
  "iat": 1639395200
}
```

**Token Lifetime:** 7 days (10080 minutes)

**Algorithm:** HS256

### Guest Access

Endpoints marked with `(Optional Auth)` can be accessed without token:
- OCR scan (with 10 scans/day limit via X-Session-ID)
- BPOM validation
- Education articles
- Food catalog search

Guest requests should include:
```
X-Session-ID: unique-session-identifier
```

### reCAPTCHA Protection

Public endpoints require reCAPTCHA v3 token:
- `/auth/register`
- `/auth/login`
- `/auth/forgot-password-request`

**Request Field:**
```json
{
  "recaptcha_token": "03AGdBq24..."
}
```

**Minimum Score:** 0.5

---

## Rate Limiting

### OCR Analysis Rate Limits

**Guest Users:**
- 10 scans per day per X-Session-ID
- Reset: Daily at 00:00 UTC

**Authenticated Users:**
- 10 scans per day per user_id
- Reset: Daily at 00:00 UTC

**Admin Users:**
- Unlimited

### Rate Limit Response (HTTP 429)

```json
{
  "detail": "Anda telah mencapai batas maksimal 10x Analisis AI per hari. Silakan coba lagi besok."
}
```

### Other Endpoints

No strict rate limiting, but abuse detection in place:
- Automated blocking after 1000+ requests/minute
- BPOM cache prevents excessive scraping

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Common Error Codes

```
AUTH_INVALID_CREDENTIALS
AUTH_TOKEN_EXPIRED
AUTH_EMAIL_EXISTS
VALIDATION_FAILED
RATE_LIMIT_EXCEEDED
RESOURCE_NOT_FOUND
PERMISSION_DENIED
BPOM_NOT_FOUND
OCR_ANALYSIS_FAILED
FILE_TOO_LARGE
INVALID_FILE_TYPE
```

---

## Authentication Module

**Base Path:** `/api/auth`

### POST `/auth/register`

Register new user account.

**Public:** Yes (reCAPTCHA required)

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePass123!",
  "recaptcha_token": "03AGdBq24..."
}
```

**Validation Rules:**
- Email: Valid format, unique
- Name: 2-100 characters
- Password: Minimum 8 characters

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "created_at": "2025-11-24T10:30:00Z"
  }
}
```

**Error (400):**
```json
{
  "detail": "Email sudah terdaftar."
}
```

---

### POST `/auth/login`

Authenticate user and get JWT token.

**Public:** Yes (reCAPTCHA required)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "recaptcha_token": "03AGdBq24..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "locale": "id-ID",
    "timezone": "Asia/Jakarta"
  }
}
```

**Error (400):**
```json
{
  "detail": "Email atau password salah."
}
```

---

### POST `/auth/forgot-password-request`

Request password reset email.

**Public:** Yes (reCAPTCHA required)

**Request:**
```json
{
  "email": "user@example.com",
  "recaptcha_token": "03AGdBq24..."
}
```

**Response (200):**
```json
{
  "message": "Jika email terdaftar, instruksi reset password telah dikirim."
}
```

**Email Content:**
- Professional HTML template
- Reset link valid for 30 minutes
- Format: `https://lacaknutri.rbwtech.io/reset-password?token=<jwt>`

**SMTP Configuration:**
- Provider: Brevo (smtp-relay.brevo.com)
- Port: 587 (STARTTLS)
- From: noreply@lacaknutri.rbwtech.io

---

### POST `/auth/reset-password`

Reset password using token from email.

**Public:** Yes

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "new_password": "NewSecurePass123!"
}
```

**Token Validation:**
- Checks `type: "reset"` in payload
- Must not be expired (30 min lifetime)

**Response (200):**
```json
{
  "message": "Kata sandi berhasil diatur ulang."
}
```

**Error (400):**
```json
{
  "detail": "Tautan reset tidak valid atau sudah kedaluwarsa."
}
```

---

### PUT `/auth/profile`

Update user profile information.

**Auth Required:** Yes

**Request:**
```json
{
  "name": "John Smith",
  "age": 26,
  "weight": 72.5,
  "height": 175,
  "gender": "male"
}
```

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Smith",
  "age": 26,
  "weight": 72.5,
  "height": 175,
  "gender": "male",
  "bmi": 23.67,
  "updated_at": "2025-11-24T11:00:00Z"
}
```

---

### POST `/auth/change-password`

Change current password.

**Auth Required:** Yes

**Request:**
```json
{
  "current_password": "OldPass123!",
  "new_password": "NewPass456!"
}
```

**Response (200):**
```json
{
  "message": "Password berhasil diubah"
}
```

**Error (400):**
```json
{
  "detail": "Password lama salah."
}
```

---

## Scan Module

**Base Path:** `/api/scan`

### POST `/scan/bpom`

Validate BPOM registration number.

**Auth Required:** Optional

**Headers:**
```
Authorization: Bearer <token>  (Optional)
X-Session-ID: <session_id>    (For guests)
Content-Type: application/json
```

**Request:**
```json
{
  "bpom_number": "MD 272831023097"
}
```

**BPOM Number Formats:**
- MD (Makanan Dalam Negeri)
- ML (Makanan Luar Negeri)
- SI (Suplemen Dalam Negeri)
- SL (Suplemen Luar Negeri)
- DBL (Obat Bebas Luar Negeri)
- TR (Obat Tradisional)

**Response (200 - Found):**
```json
{
  "found": true,
  "message": "Data ditemukan",
  "data": {
    "id": 123,
    "bpom_number": "MD 272831023097",
    "product_name": "Mi Instan Goreng Rasa Ayam Bawang",
    "brand": "Indomie",
    "manufacturer": "PT Indofood CBP Sukses Makmur Tbk",
    "address": "Sudirman Plaza Indofood Tower Lt. 23",
    "issued_date": "2024-08-02",
    "expired_date": "2029-04-02",
    "composition": "Tepung Terigu, Minyak Sawit, ...",
    "packaging": "Plastik Laminat (72g)",
    "status": "Berlaku",
    "qr_code": "(90)MD272831023097"
  }
}
```

**Response (200 - Not Found):**
```json
{
  "found": false,
  "message": "Produk dengan kode MD 999999999999 tidak ditemukan.",
  "data": null
}
```

**Cache Behavior:**
- Valid cache: 30 days
- Cache key: bpom_number
- Returns cached data if available
- Scrapes cekbpom.pom.go.id if cache miss

**Scraping Flow:**
1. Check `bpom_cache` table
2. If expired/missing, GET cekbpom.pom.go.id (extract CSRF)
3. POST to /produk-dt/all with CSRF + search query
4. Parse JSON response
5. Save to cache + history
6. Return result

---

### POST `/scan/analyze`

Analyze nutrition label using OCR + AI.

**Auth Required:** Optional

**Rate Limited:** Yes (10/day)

**Headers:**
```
Authorization: Bearer <token>  (Optional)
X-Session-ID: <session_id>    (For guests)
Content-Type: application/json
```

**Request:**
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "product_name": "Indomie Goreng",
  "language": "id"
}
```

**Fields:**
- `image_base64`: Base64-encoded image (max 2MB)
- `product_name`: Product name (optional)
- `language`: `id` (Bahasa) or `en` (English), defaults to user locale

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "nutrition": {
      "calories": 390,
      "protein": 9.0,
      "fat": 14.0,
      "carbohydrates": 58.0,
      "sugar": 7.0,
      "fiber": 2.0,
      "sodium_mg": 1140
    },
    "summary": "Produk ini merupakan sumber karbohidrat cepat dengan kandungan protein moderate. Tinggi sodium (47% AKG) yang perlu diperhatikan bagi penderita hipertensi.",
    "ingredients": "Tepung Terigu, Minyak Sawit, Garam, Monosodium Glutamat (MSG), Pewarna Tartrazin (E102), Natrium Benzoat (E211)",
    "pros": [
      "Sumber karbohidrat untuk energi cepat",
      "Mengandung protein nabati",
      "Praktis dan tahan lama"
    ],
    "cons": [
      "Tinggi sodium (1140mg / 47% AKG)",
      "Mengandung MSG dan pewarna sintetis",
      "Rendah serat dan mikronutrien"
    ],
    "warnings": [
      "Gluten",
      "MSG"
    ],
    "health_score": 6,
    "grade": "C",
    "created_at": "2025-11-24T12:00:00Z"
  }
}
```

**Health Score Calculation:**
```
Scale: 1-10 (10 = Excellent, 1 = Poor)

Factors:
+ High protein (>10g)
+ High fiber (>3g)
+ Low sugar (<5g)
+ Low sodium (<400mg)
- High saturated fat
- Artificial additives
- High sugar
- High sodium
```

**Grade Mapping:**
```
A: 9-10 (Excellent)
B: 7-8  (Good)
C: 5-6  (Fair)
D: 3-4  (Poor)
F: 1-2  (Very Poor)
```

**Allergen Detection:**
- Cross-references detected ingredients with user allergies
- Returns warnings array if matches found
- Ingredient matching: case-insensitive, fuzzy

**AI Prompt Engineering:**
```python
System: "Kamu adalah ahli nutrisi Indonesia yang ramah dan membantu."

User: "Analisis produk ini: [nutrition_data]. Berikan:
1. Summary singkat (2-3 kalimat)
2. Detected ingredients dengan nama lengkap + E-number
3. Health score 1-10
4. Grade A-F
5. Pros (3 poin)
6. Cons (3 poin)

Format JSON only."
```

**Error (429):**
```json
{
  "detail": "Anda telah mencapai batas maksimal 10x Analisis AI per hari. Silakan coba lagi besok."
}
```

---

### POST `/scan/ocr-text`

Extract raw text from image using Tesseract OCR.

**Auth Required:** Optional

**Request:**
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response (200):**
```json
{
  "success": true,
  "text": "INFORMASI NILAI GIZI\nTakaran Saji 1 bungkus (75g)\nJumlah Per Sajian\nEnergi Total 390 kkal\nLemak Total 14g\nProtein 9g\n..."
}
```

**OCR Configuration:**
- Language: `ind+eng` (Indonesian + English)
- Engine: Tesseract 5.0
- Preprocessing: Grayscale + threshold

---

### POST `/scan/chat`

Chat about product using AI.

**Auth Required:** Optional

**Request:**
```json
{
  "product_context": {
    "product_name": "Indomie Goreng",
    "nutrition": {...},
    "ingredients": "Tepung Terigu, ..."
  },
  "question": "Apakah aman untuk penderita diabetes?",
  "language": "id"
}
```

**Response (200):**
```json
{
  "answer": "Untuk penderita diabetes, konsumsi Indomie Goreng sebaiknya dibatasi karena:\n\n1. Tinggi karbohidrat sederhana (58g) yang cepat menaikkan gula darah\n2. Rendah serat (2g) sehingga tidak membantu kontrol glikemik\n3. Tinggi sodium yang dapat memperburuk komplikasi diabetes\n\nRekomendasi:\n- Konsumsi maksimal 1x seminggu\n- Kombinasi dengan sayuran dan protein\n- Minum air putih cukup\n- Cek gula darah setelah konsumsi"
}
```

**AI Context:**
- Previous product analysis
- User allergies (if authenticated)
- Medical knowledge base

---

### GET `/scan/bpom/{scan_id}`

Get BPOM scan detail from history.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "type": "bpom",
    "bpom_number": "MD 272831023097",
    "product_name": "Indomie Goreng",
    "brand": "Indomie",
    "manufacturer": "PT Indofood CBP",
    "status": "Berlaku",
    "raw_response": {...},
    "is_favorited": false,
    "created_at": "2025-11-24T10:30:00Z"
  }
}
```

---

### GET `/scan/ocr/{scan_id}`

Get OCR scan detail from history.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "type": "ocr",
    "product_name": "Indomie Goreng",
    "image_data": "data:image/jpeg;base64,...",
    "ocr_raw_data": "{...}",
    "ai_analysis": "Sumber karbohidrat...",
    "pros": ["...", "...", "..."],
    "cons": ["...", "...", "..."],
    "ingredients": "Tepung Terigu, ...",
    "warnings": ["Gluten", "MSG"],
    "health_score": 6,
    "grade": "C",
    "is_favorited": true,
    "created_at": "2025-11-24T12:00:00Z"
  }
}
```

---

## User Module

**Base Path:** `/api/users`

### GET `/users/allergens`

Get all available allergens.

**Auth Required:** Yes

**Response (200):**
```json
[
  {
    "id": 2,
    "name": "Kacang Tanah",
    "description": "Dapat menyebabkan reaksi anafilaksis berat."
  },
  {
    "id": 4,
    "name": "Susu Sapi",
    "description": "Mengandung laktosa dan protein kasein/whey."
  },
  {
    "id": 8,
    "name": "Gandum (Gluten)",
    "description": "Protein gluten yang sulit dicerna penderita Celiac."
  }
]
```

**Allergen Categories:**
- System allergens (created_by: NULL) - Cannot be deleted
- User custom allergens (created_by: user_id) - Can be deleted by owner

---

### GET `/users/my-allergies`

Get current user's allergen preferences.

**Auth Required:** Yes

**Response (200):**
```json
[
  {
    "id": 2,
    "name": "Kacang Tanah",
    "description": "Dapat menyebabkan reaksi anafilaksis berat."
  },
  {
    "id": 8,
    "name": "Gandum (Gluten)",
    "description": "Protein gluten yang sulit dicerna penderita Celiac."
  }
]
```

---

### PUT `/users/allergies`

Update user allergen preferences.

**Auth Required:** Yes

**Request:**
```json
{
  "allergen_ids": [2, 4, 8, 10]
}
```

**Response (200):**
```json
{
  "message": "Preferensi alergi berhasil disimpan",
  "total": 4
}
```

**Behavior:**
- Replaces entire allergen list
- Validates allergen IDs exist
- Updates user_allergies association table

---

### POST `/users/allergies/custom`

Add custom allergen.

**Auth Required:** Yes

**Request:**
```json
{
  "name": "Jamur Kuping"
}
```

**Validation:**
- Name: 3-50 characters
- Allowed: Letters, spaces, hyphens, parentheses
- Auto-capitalizes first letter

**Response (200):**
```json
{
  "message": "Alergi berhasil ditambahkan",
  "allergen": {
    "id": 60,
    "name": "Jamur Kuping",
    "description": "Custom user input"
  }
}
```

**Behavior:**
- Creates new allergen if not exists
- Automatically adds to user's allergy list
- Sets created_by to user_id

---

### DELETE `/users/allergens/{allergen_id}`

Remove allergen from preferences or delete custom allergen.

**Auth Required:** Yes

**Response (200 - System Allergen):**
```json
{
  "message": "Alergi dihapus dari preferensi Anda"
}
```

**Response (200 - Custom Allergen):**
```json
{
  "message": "Alergi kustom berhasil dihapus permanen"
}
```

**Error (403):**
```json
{
  "detail": "Anda tidak dapat menghapus alergi sistem permanen"
}
```

---

### GET `/users/localization-settings`

Get available localization settings.

**Auth Required:** No

**Query Params:**
```
region: string (optional) - Filter by region (Asia, Europe, etc.)
```

**Response (200):**
```json
{
  "data": {
    "Asia": [
      {
        "id": 60,
        "timezone": "Asia/Jakarta",
        "timezone_offset": "+07:00",
        "timezone_label": "WIB - Jakarta, Indonesia",
        "locale": "id-ID",
        "locale_label": "Bahasa Indonesia",
        "country_code": "ID",
        "region": "Asia"
      },
      {
        "id": 4,
        "timezone": "Asia/Singapore",
        "timezone_offset": "+08:00",
        "timezone_label": "SGT - Singapore Time",
        "locale": "en-SG",
        "locale_label": "English (Singapore)",
        "country_code": "SG",
        "region": "Asia"
      }
    ],
    "Europe": [...]
  }
}
```

**Supported Locales:**
- `id-ID` (Bahasa Indonesia)
- `en-US` (English)

**Timezone Coverage:**
- 40+ timezones worldwide
- Grouped by region
- Includes UTC offset

---

### PUT `/users/profile`

Update user profile with photo upload.

**Auth Required:** Yes

**Content-Type:** `multipart/form-data`

**Request:**
```
name: "John Doe"
age: 26
weight: 72.5
height: 175
gender: "male"
timezone: "Asia/Jakarta"
locale: "id-ID"
photo: <file>
```

**File Upload:**
- Allowed: JPEG, PNG, WebP
- Max size: 2MB
- Saved to: `/uploads/profiles/user_{id}_{random}.{ext}`

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user",
    "age": 26,
    "weight": 72.5,
    "height": 175,
    "gender": "male",
    "timezone": "Asia/Jakarta",
    "locale": "id-ID",
    "photo_url": "/api/uploads/profiles/user_1_a3b4c5.jpg"
  }
}
```

---

### PATCH `/users/update-locale`

Update user language preference only.

**Auth Required:** Yes

**Request:**
```json
{
  "locale": "en-US"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Bahasa berhasil diubah",
  "user": {
    "id": 1,
    "locale": "en-US",
    ...
  }
}
```

**Validation:**
- Must be `id-ID` or `en-US`

---

### GET `/users/history`

Get user scan history with timezone conversion.

**Auth Required:** Yes

**Query Params:**
```
type: string (optional) - Filter: "bpom" or "ocr"
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 123,
      "type": "bpom",
      "title": "Indomie Goreng",
      "subtitle": "MD 272831023097",
      "date": "2025-11-24T17:30:00+07:00",
      "is_favorited": false
    },
    {
      "id": 456,
      "type": "ocr",
      "title": "Analisis Nutrisi AI",
      "subtitle": "Scan pada 24 Nov 2025",
      "score": 6,
      "date": "2025-11-24T12:00:00+07:00",
      "is_favorited": true
    }
  ]
}
```

**Timezone Handling:**
- Converts UTC timestamps to user timezone
- Format: ISO 8601 with timezone offset
- Defaults to Asia/Jakarta if timezone not set

---

### GET `/users/history/{type}/{id}`

Get detailed history item.

**Auth Required:** Yes

**Path Params:**
- `type`: "bpom" or "ocr"
- `id`: Scan history ID

**Response (200 - BPOM):**
```json
{
  "success": true,
  "data": {
    "product_name": "Indomie Goreng",
    "bpom_number": "MD 272831023097",
    "brand": "Indomie",
    "manufacturer": "PT Indofood CBP",
    "status": "Berlaku",
    "is_favorited": false,
    "scanned_at": "2025-11-24T17:30:00+07:00"
  }
}
```

**Response (200 - OCR):**
```json
{
  "success": true,
  "data": {
    "health_score": 6,
    "ocr_raw_data": "{...}",
    "ai_analysis": "Sumber karbohidrat...",
    "is_favorited": true,
    "scanned_at": "2025-11-24T12:00:00+07:00"
  }
}
```

---

### GET `/users/dashboard-stats`

Get user statistics summary.

**Auth Required:** Yes

**Response (200):**
```json
{
  "favorites": 5,
  "scans": 42,
  "allergies": 3
}
```

---

### GET `/users/dashboard`

Get dashboard data with recent scans.

**Auth Required:** Yes

**Response (200):**
```json
{
  "stats": {
    "scans": 42,
    "favorites": 5,
    "history": 42,
    "recommendations": 28
  },
  "recent": [
    {
      "id": 456,
      "type": "ocr",
      "title": "Scan Label Gizi",
      "subtitle": "Analisis AI",
      "date": "2025-11-24T12:00:00+07:00",
      "score": 6,
      "is_favorited": true
    },
    {
      "id": 123,
      "type": "bpom",
      "title": "Indomie Goreng",
      "subtitle": "MD 272831023097",
      "date": "2025-11-24T10:30:00+07:00",
      "score": null,
      "is_favorited": false
    }
  ]
}
```

**Recent Scans:**
- Combined BPOM + OCR history
- Sorted by created_at DESC
- Limited to 5 items

---

## Education Module

**Base Path:** `/api/education`

### GET `/education/articles`

Get articles with search and pagination.

**Auth Required:** No

**Query Params:**
```
category: string (default: "all") - Filter: "gizi", "aditif", "penyakit", "label", "tips", "all"
q: string (optional) - Search query
page: int (default: 1, min: 1)
size: int (default: 9, min: 1, max: 50)
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Memahami AKG% pada Label Gizi",
      "slug": "memahami-akg-persen",
      "category": "label",
      "content_preview": "AKG atau Angka Kecukupan Gizi adalah...",
      "author": "Tim LacakNutri",
      "thumbnail_url": "/images/articles/akg.jpg",
      "read_time": "5 min",
      "view_count": 1234,
      "created_at": "2025-11-01T00:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "size": 9,
  "total_pages": 6
}
```

**Categories:**
```
gizi    - Zat Gizi Makro & Mikro
aditif  - Bahan Tambahan Pangan
penyakit - Panduan Diet untuk Penyakit
label   - Cara Membaca Label
tips    - Tips Hidup Sehat
```

---

### GET `/education/articles/{slug}`

Get article detail by slug.

**Auth Required:** No

**Path Example:** `/education/articles/memahami-akg-persen`

**Response (200):**
```json
{
  "id": 1,
  "title": "Memahami AKG% pada Label Gizi",
  "slug": "memahami-akg-persen",
  "category": "label",
  "content": "# Apa itu AKG%?\n\nAKG (Angka Kecukupan Gizi) adalah...",
  "author": "Tim LacakNutri",
  "thumbnail_url": "/images/articles/akg.jpg",
  "read_time": "5 min",
  "view_count": 1235,
  "created_at": "2025-11-01T00:00:00Z",
  "updated_at": "2025-11-10T15:00:00Z"
}
```

**Behavior:**
- Increments view_count on each request
- Content in Markdown format
- Supports images via URL

---

### GET `/education/nutrition-info`

Get nutrition dictionary.

**Auth Required:** No

**Response (200):**
```json
[
  {
    "id": 2,
    "name": "Energi Total",
    "category": "makro",
    "unit": "kkal",
    "daily_value": 2150.00,
    "description": "Jumlah energi yang dihasilkan dari makanan.",
    "benefits": "Bahan bakar utama aktivitas tubuh.",
    "sources": "Karbohidrat, Lemak, Protein"
  },
  {
    "id": 4,
    "name": "Karbohidrat Total",
    "category": "makro",
    "unit": "g",
    "daily_value": 325.00,
    "description": "Sumber energi utama tubuh.",
    "benefits": "Memberikan energi cepat untuk otak dan otot.",
    "sources": "Nasi, roti, kentang, oat"
  }
]
```

**Categories:**
- `makro`: Macronutrients
- `mikro`: Micronutrients (vitamins, minerals)

---

### GET `/education/additives`

Get food additives dictionary.

**Auth Required:** No

**Response (200):**
```json
[
  {
    "id": 2,
    "name": "Monosodium Glutamat",
    "code": "E621",
    "category": "perisa",
    "safety_level": "moderate",
    "description": "Penguat rasa gurih (umami).",
    "health_risks": "Dapat memicu sakit kepala atau mual pada orang sensitif."
  },
  {
    "id": 8,
    "name": "Tartrazin",
    "code": "E102",
    "category": "pewarna",
    "safety_level": "avoid",
    "description": "Pewarna kuning sintetis (Lemon Yellow).",
    "health_risks": "Dapat memicu hiperaktivitas pada anak (ADHD) dan reaksi alergi."
  }
]
```

**Safety Levels:**
- `safe`: Generally safe
- `moderate`: Use with caution
- `avoid`: Recommended to avoid

**Categories:**
```
pemanis    - Sweeteners
pengawet   - Preservatives
pewarna    - Food coloring
perisa     - Flavor enhancers
pengemulsi - Emulsifiers
lainnya    - Others
```

---

### GET `/education/diseases`

Get disease-specific dietary guidelines.

**Auth Required:** No

**Response (200):**
```json
[
  {
    "id": 2,
    "name": "Diabetes Melitus Tipe 2",
    "description": "Kadar gula darah tinggi akibat resistensi insulin.",
    "dietary_recommendations": "Fokus pada Karbohidrat Kompleks, Serat Tinggi, Indeks Glikemik Rendah.",
    "foods_to_avoid": "Gula pasir, minuman manis, roti putih, nasi putih berlebih, sirup."
  },
  {
    "id": 4,
    "name": "Hipertensi (Darah Tinggi)",
    "description": "Tekanan darah arteri yang persisten tinggi.",
    "dietary_recommendations": "Diet DASH: Tinggi Kalium, Kalsium, Magnesium. Perbanyak sayur & buah.",
    "foods_to_avoid": "Garam (Natrium), makanan kaleng, ikan asin, keripik asin, MSG berlebih."
  }
]
```

**Covered Diseases:**
- Diabetes Melitus
- Hipertensi
- Dislipidemia (Kolesterol)
- Gagal Ginjal Kronis
- Asam Urat (Gout)
- GERD (Asam Lambung)
- Celiac Disease
- Intoleransi Laktosa
- Anemia Defisiensi Besi
- Obesitas

---

## Food Catalog Module

**Base Path:** `/api/food`

### GET `/food/search`

Search food ingredient database.

**Auth Required:** No

**Query Params:**
```
q: string (default: "") - Search query
page: int (default: 1, min: 1)
size: int (default: 20, min: 1, max: 100)
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "original_code": "01001",
      "name": "Beras Putih (100g)",
      "weight_g": 100.0,
      "calories": 130.0,
      "protein": 2.7,
      "fat": 0.3,
      "carbs": 28.2,
      "sugar": 0.1,
      "fiber": 0.4,
      "sodium_mg": 1.0,
      "potassium_mg": 35.0,
      "calcium_mg": 10.0,
      "iron_mg": 0.8,
      "cholesterol_mg": 0.0,
      "image_url": "/images/food/rice.jpg"
    }
  ],
  "total": 150,
  "page": 1,
  "size": 20,
  "total_pages": 8
}
```

**Search Behavior:**
- Fuzzy match on name field
- Case-insensitive
- Returns nutritional data per 100g

**Use Case:**
- Ingredient lookup for recipes
- Nutritional comparison
- Diet planning

---

## Favorites Module

**Base Path:** `/api/favorites`

### POST `/favorites/{scan_type}/{scan_id}/toggle`

Toggle favorite status.

**Auth Required:** Yes

**Path Params:**
- `scan_type`: "bpom" or "ocr"
- `scan_id`: ID of scan history

**Response (200):**
```json
{
  "is_favorited": true
}
```

**Behavior:**
- Toggles boolean flag
- Only owner can favorite their scans

---

### GET `/favorites/list`

Get all favorited items.

**Auth Required:** Yes

**Query Params:**
```
skip: int (default: 0)
limit: int (default: 100)
```

**Response (200):**
```json
[
  {
    "id": 123,
    "product_type": "bpom",
    "product_name": "Indomie Goreng",
    "bpom_number": "MD 272831023097",
    "product_data": {}
  },
  {
    "id": 456,
    "product_type": "ocr",
    "product_name": "Analisis Nutrisi AI",
    "bpom_number": null,
    "product_data": {
      "health_score": 6,
      "grade": "C"
    }
  }
]
```

**Combined Response:**
- Merges BPOM + OCR favorites
- Sorted by created_at DESC

---

## Admin Module

**Base Path:** `/api/admin`

**Auth Required:** Admin role

### Authorization Levels

**Regular Admin:**
- Read access to all endpoints
- Limited write access

**Owner Admin (id=1):**
- Full CRUD access
- Requires 2FA via WhatsApp authorization code

### POST `/admin/upload-image`

Upload image for articles/products.

**Auth Required:** Admin

**Content-Type:** `multipart/form-data`

**Request:**
```
file: <image file>
type: "general" | "article" | "product" | "profile"
```

**File Validation:**
- Content-Type: Must be image/*
- Max size: 2MB

**Response (200):**
```json
{
  "success": true,
  "url": "/api/uploads/articles/article_a3b4c5d6.jpg"
}
```

**Storage:**
- Path: `/uploads/{type}s/{filename}`
- Filename: `{type}_{random}.{ext}`

---

### GET `/admin/auth-code`

Request Owner authorization code (for Owner only).

**Auth Required:** Owner (id=1)

**Response (200):**
```json
{
  "wa_link": "https://wa.me/6281234567890?text=Saya%20memerlukan%20Kode%20Otorisasi%20Owner%20Admin.%20lacaknutri.rbwtech.io",
  "code_expires_in": "120 minutes"
}
```

**Workflow:**
1. Owner requests code via GET /auth-code
2. Opens WhatsApp link to contact admin phone
3. Receives 8-digit alphanumeric code
4. Uses code in X-Authorization-Code header for write operations

**Code Properties:**
- Length: 8 characters (uppercase alphanumeric)
- Lifetime: 120 minutes
- Single-use: Deleted after use
- Stored in: `authorization_codes` table

**Usage Example:**
```
POST /admin/users/5/role
Headers:
  Authorization: Bearer <owner_token>
  X-Authorization-Code: A3B4C5D6
Body:
  { "role": "admin" }
```

---

### GET `/admin/stats`

Get dashboard statistics.

**Auth Required:** Admin

**Response (200):**
```json
{
  "users": 1234,
  "scans": 5678,
  "articles": 42,
  "products": 150,
  "allergens": 20,
  "additives": 24,
  "diseases": 10,
  "localization": 40
}
```

---

### GET `/admin/users`

List all users with search and pagination.

**Auth Required:** Admin

**Query Params:**
```
skip: int (default: 0)
limit: int (default: 50, max: 100)
search: string (optional) - Search name/email
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "created_at": "2025-11-01T10:00:00Z",
      "age": 26,
      "weight": 72.5,
      "height": 175,
      "timezone": "Asia/Jakarta",
      "locale": "id-ID",
      "allergies": ["Kacang Tanah", "Gluten"]
    }
  ],
  "total": 1234
}
```

---

### PATCH `/admin/users/{user_id}/role`

Update user role (Owner only).

**Auth Required:** Owner + Auth Code

**Headers:**
```
Authorization: Bearer <owner_token>
X-Authorization-Code: A3B4C5D6
```

**Request:**
```json
{
  "role": "admin"
}
```

**Allowed Roles:**
- `user`
- `admin`

**Response (200):**
```json
{
  "success": true,
  "message": "Role updated to admin"
}
```

---

### PATCH `/admin/users/{user_id}/email`

Update user email (Owner only).

**Auth Required:** Owner + Auth Code

**Request:**
```json
{
  "email": "newemail@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email updated"
}
```

**Error (400):**
```json
{
  "detail": "Email already in use"
}
```

---

### POST `/admin/users/{user_id}/reset-password`

Generate password reset link (Owner only).

**Auth Required:** Owner + Auth Code

**Response (200):**
```json
{
  "success": true,
  "message": "Reset link generated",
  "reset_link": "https://lacaknutri.rbwtech.io/reset-password?token=eyJ...",
  "user_email": "user@example.com"
}
```

**Note:** Link must be manually sent to user

---

### GET `/admin/history/bpom`

Get all BPOM scan history.

**Auth Required:** Admin

**Query Params:**
```
skip: int (default: 0)
limit: int (default: 50)
search: string (optional) - Search product/BPOM number
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 123,
      "user_id": 5,
      "user_name": "John Doe",
      "product_name": "Indomie Goreng",
      "bpom_number": "MD 272831023097",
      "manufacturer": "PT Indofood CBP",
      "status": "Berlaku",
      "created_at": "2025-11-24T10:30:00Z"
    }
  ],
  "total": 5678
}
```

---

### GET `/admin/history/ocr`

Get all OCR scan history.

**Auth Required:** Admin

**Query Params:**
```
skip: int (default: 0)
limit: int (default: 50)
search: string (optional) - Search product name
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 456,
      "user_id": 5,
      "user_name": "John Doe",
      "product_name": "Analisis Nutrisi AI",
      "health_score": 6,
      "created_at": "2025-11-24T12:00:00Z"
    }
  ],
  "total": 2890
}
```

---

### Allergen Management

#### GET `/admin/allergens`

List all allergens.

**Auth Required:** Admin

**Query Params:**
```
skip: int (default: 0)
limit: int (default: 50)
search: string (optional)
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 2,
      "name": "Kacang Tanah",
      "description": "Dapat menyebabkan reaksi anafilaksis berat.",
      "created_by": null
    }
  ],
  "total": 20
}
```

---

#### POST `/admin/allergens`

Create new allergen (Owner only).

**Auth Required:** Owner + Auth Code

**Request:**
```json
{
  "name": "Wijen",
  "description": "Alergen umum dalam makanan Asia"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 25,
    "name": "Wijen"
  }
}
```

---

#### PUT `/admin/allergens/{allergen_id}`

Update allergen (Owner only).

**Auth Required:** Owner + Auth Code

---

#### DELETE `/admin/allergens/{allergen_id}`

Delete allergen (Owner only).

**Auth Required:** Owner + Auth Code

---

### Additive Management

#### GET `/admin/additives`

List food additives.

**Auth Required:** Admin

**Response (200):**
```json
{
  "data": [
    {
      "id": 2,
      "name": "Monosodium Glutamat",
      "code": "E621",
      "category": "perisa",
      "safety_level": "moderate",
      "description": "Penguat rasa gurih (umami).",
      "health_risks": "Dapat memicu sakit kepala..."
    }
  ],
  "total": 24
}
```

---

#### POST `/admin/additives`

Create additive (Owner only).

**Auth Required:** Owner + Auth Code

**Request:**
```json
{
  "name": "Aspartam",
  "code": "E951",
  "category": "pemanis",
  "safety_level": "moderate",
  "description": "Pemanis buatan rendah kalori.",
  "health_risks": "Berbahaya bagi penderita fenilketonuria."
}
```

---

#### PUT `/admin/additives/{additive_id}`

Update additive (Owner only).

---

#### DELETE `/admin/additives/{additive_id}`

Delete additive (Owner only).

---

### Disease Management

#### GET `/admin/diseases`

List diseases.

**Auth Required:** Admin

**Response (200):**
```json
{
  "data": [
    {
      "id": 2,
      "name": "Diabetes Melitus Tipe 2",
      "description": "Kadar gula darah tinggi...",
      "dietary_recommendations": "Fokus pada Karbohidrat Kompleks...",
      "foods_to_avoid": "Gula pasir, minuman manis..."
    }
  ],
  "total": 10
}
```

---

#### POST `/admin/diseases`

Create disease entry (Owner only).

**Auth Required:** Owner + Auth Code

**Request:**
```json
{
  "name": "Kolesterol Tinggi",
  "description": "Kadar lemak darah tidak normal.",
  "dietary_recommendations": "Tingkatkan omega-3, kurangi lemak jenuh.",
  "foods_to_avoid": "Gorengan, jeroan, santan kental."
}
```

---

#### PUT `/admin/diseases/{disease_id}`

Update disease (Owner only).

---

#### DELETE `/admin/diseases/{disease_id}`

Delete disease (Owner only).

---

### Localization Management

#### GET `/admin/localization`

List localization settings.

**Auth Required:** Admin

**Response (200):**
```json
{
  "data": [
    {
      "id": 60,
      "timezone": "Asia/Jakarta",
      "timezone_offset": "+07:00",
      "timezone_label": "WIB - Jakarta, Indonesia",
      "locale": "id-ID",
      "locale_label": "Bahasa Indonesia",
      "country_code": "ID",
      "region": "Asia",
      "is_active": true
    }
  ],
  "total": 40
}
```

---

#### POST `/admin/localization`

Create localization setting (Owner only).

**Auth Required:** Owner + Auth Code

**Request:**
```json
{
  "timezone": "Asia/Singapore",
  "timezone_offset": "+08:00",
  "timezone_label": "SGT - Singapore Time",
  "locale": "en-SG",
  "locale_label": "English (Singapore)",
  "country_code": "SG",
  "region": "Asia",
  "is_active": true
}
```

---

#### PUT `/admin/localization/{setting_id}`

Update localization (Owner only).

---

#### DELETE `/admin/localization/{setting_id}`

Delete localization (Owner only).

---

### Article Management

#### GET `/admin/articles`

List all articles (admin view).

**Auth Required:** Admin

**Query Params:**
```
skip: int (default: 0)
limit: int (default: 50)
search: string (optional)
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Memahami AKG%",
      "slug": "memahami-akg-persen",
      "category": "label",
      "author": "Tim LacakNutri",
      "thumbnail_url": "/images/articles/akg.jpg",
      "read_time": "5 min",
      "view_count": 1234,
      "created_at": "2025-11-01T00:00:00Z",
      "updated_at": "2025-11-10T15:00:00Z"
    }
  ],
  "total": 42
}
```

---

#### POST `/admin/articles`

Create new article (Owner only).

**Auth Required:** Owner + Auth Code

**Request:**
```json
{
  "title": "Bahaya Gula Berlebih",
  "slug": "bahaya-gula-berlebih",
  "content": "# Bahaya Gula Berlebih\n\nKonsumsi gula berlebih...",
  "category": "tips",
  "author": "Dr. Nutrisi",
  "thumbnail_url": "/images/articles/sugar.jpg"
}
```

**Slug Validation:**
- Must be URL-safe
- Must be unique
- Auto-generated from title if not provided

---

#### PUT `/admin/articles/{article_id}`

Update article (Owner only).

---

#### DELETE `/admin/articles/{article_id}`

Delete article (Owner only).

---

### Food Catalog Management

#### GET `/admin/food-catalog`

List food products.

**Auth Required:** Admin

**Query Params:**
```
skip: int (default: 0)
limit: int (default: 50)
search: string (optional) - Search name/code
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "original_code": "01001",
      "name": "Beras Putih",
      "weight_g": 100.0,
      "calories": 130.0,
      "protein": 2.7,
      "fat": 0.3,
      "carbs": 28.2,
      "sugar": 0.1,
      "fiber": 0.4,
      "sodium_mg": 1.0,
      "image_url": "/images/food/rice.jpg"
    }
  ],
  "total": 150
}
```

---

#### POST `/admin/food-catalog`

Add food product (Owner only).

**Auth Required:** Owner + Auth Code

**Request:**
```json
{
  "original_code": "01002",
  "name": "Nasi Merah",
  "weight_g": 100.0,
  "calories": 111.0,
  "protein": 2.6,
  "fat": 0.9,
  "carbs": 23.5,
  "sugar": 0.4,
  "fiber": 1.8,
  "sodium_mg": 1.0,
  "potassium_mg": 86.0,
  "calcium_mg": 10.0,
  "iron_mg": 0.8,
  "cholesterol_mg": 0.0,
  "image_url": "/images/food/brown-rice.jpg"
}
```

---

#### PUT `/admin/food-catalog/{product_id}`

Update food product (Owner only).

---

#### DELETE `/admin/food-catalog/{product_id}`

Delete food product (Owner only).

-----
