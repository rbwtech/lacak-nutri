<div align="center">

```
██╗      █████╗  ██████╗ █████╗ ██╗  ██╗    ███╗   ██╗██╗   ██╗████████╗██████╗ ██╗
██║     ██╔══██╗██╔════╝██╔══██╗██║ ██╔╝    ████╗  ██║██║   ██║╚══██╔══╝██╔══██╗██║
██║     ███████║██║     ███████║█████╔╝     ██╔██╗ ██║██║   ██║   ██║   ██████╔╝██║
██║     ██╔══██║██║     ██╔══██║██╔═██╗     ██║╚██╗██║██║   ██║   ██║   ██╔══██╗██║
███████╗██║  ██║╚██████╗██║  ██║██║  ██╗    ██║ ╚████║╚██████╔╝   ██║   ██║  ██║██║
╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝    ╚═╝  ╚═══╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚═╝
```

### Smart Nutrition Tracking & BPOM Validation Platform

**Transparansi Instan, Keputusan Terinformasi**

[![Live Demo](https://img.shields.io/badge/demo-lacaknutri.rbwtech.io-FF9966?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4=)](https://lacaknutri.rbwtech.io)
[![GitHub](https://img.shields.io/badge/github-rbwtech%2Flacak--nutri-333333?style=for-the-badge&logo=github)](https://github.com/rbwtech/lacak-nutri)
[![License](https://img.shields.io/badge/license-MIT-6B8E23?style=for-the-badge)](LICENSE)

[Demo](#-demo-access) • [Features](#-core-features) • [Tech Stack](#-technology-stack) • [Installation](#-quick-start) • [API Docs](#-api-documentation) • [Team](#-team)

</div>

---

## Overview

LacakNutri adalah aplikasi web berbasis Full Stack dan AI yang dirancang untuk memberikan analisis nutrisi instan dan validasi keamanan pangan untuk produk makanan/minuman kemasan. Aplikasi ini menggunakan Vision Language Model (VLM) dari Google Gemini untuk memproses label nutrisi dan komposisi dari gambar, serta mekanisme web scraping untuk memverifikasi status registrasi produk ke database resmi BPOM.

**Problem Statement:** Minimnya transparansi informasi nilai gizi dan kesulitan memverifikasi keamanan produk BPOM.

**Solution:** Platform end-to-end yang mengubah label fisik menjadi data terstruktur dengan insight kesehatan personal dalam hitungan detik.

### Core Value

```
Capture Image → AI Analysis (VLM) → Personalized Health Insights
QR Code → BPOM Validation (Scraping) → BPOM Result
```

**Target Users:**

- Konsumen sadar kesehatan
- Keluarga dengan kondisi alergi/diet khusus
- Individu dengan penyakit metabolik (diabetes, hipertensi)
- Masyarakat umum yang peduli keamanan pangan

---

## DEMO ACCESS

### Live Instance

**URL:** https://lacaknutri.rbwtech.io

### Admin Dashboard (Demo)

```
Email: lacaknutri@rbwtech.io
Password: UINIC7.0
```

**Capabilities:**

- Full CRUD operations
- Real-time analytics dashboard
- User management
- Content moderation (GiziPedia)
- Scan history monitoring

### Test Credentials (Regular User)

```
Email: demo@lacaknutri.com
Password: demo123
```

---

## CORE FEATURES

```
Disclaimer:
Fungsi utama /api/scan/analyze menggunakan Gemini AI (VLM) untuk membaca dan menganalisis label dari gambar secara langsung. Ini lebih dari sekadar OCR; ini adalah analisis gambar terstruktur. Tesseract hanya digunakan untuk raw text extraction di endpoint terpisah (/api/scan/ocr-text).
```

### 1\. Vision-Powered Nutrition Analysis (VLM & AI)

**Engine:** Google Gemini 2.5 Flash

**AI Analysis Pipeline (`/api/scan/analyze`)**:

```mermaid
graph TD
A[User Uploads Image] --> B["GeminiService analyze_nutrition_image"]
B -- Prompt + Image --> C(Gemini VLM Analysis)
C -- Structured JSON --> D[Backend Service]
D -- Extract Ingredients --> E{Check User Allergies}
E -- Detected Allergens --> F(Create ScanHistoryOCR)
F --> G[Display Scan Result]

%% Style blocks
style C fill:#222d3d,stroke:#333,stroke-width:2px
style B fill:#222d3d,stroke:#333,stroke-width:1px
```

**Hasil Structured JSON yang Dikelola oleh AI Service:**

| Field | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| **`nutrition`** | JSON Object | Data nutrisi terstruktur (kalori, protein, lemak, gula, sodium, dll.). |
| **`health_score`** | Integer (0-100) | Penilaian kesehatan objektif oleh AI. |
| **`grade`** | String (A-E) | Kategori nilai kesehatan berdasarkan `health_score`. |
| **`summary`** | String | Ringkasan analisis nutrisi (2-3 kalimat). |
| **`pros`, `cons`** | List of Strings | Keunggulan dan kelemahan nutrisi yang terdeteksi. |
| **`ingredients`** | String | Daftar bahan yang diekstraksi. |
| **`warnings`** | List of Strings | Daftar potensi peringatan (misalnya, Tinggi Gula, Aditif) **ditambah alergen yang terdeteksi dari profil pengguna**. |

#### Rate Limiting (Keterbatasan Penggunaan)

Untuk menjaga *resource* AI, *endpoint* `/api/scan/analyze` memiliki batasan penggunaan harian:

  - **Pengguna Tamu (Guest)** atau **Pengguna Terdaftar Biasa**: Maksimal **10x Analisis AI per hari**.
  - **Administrator**: Tidak memiliki batasan.

### 2\. BPOM Validation

Fitur ini memvalidasi produk menggunakan nomor registrasi BPOM yang diinput (MD/ML/SI/DBL) atau dipindai QR-nya.

**Mekanisme:** **Web Scraping** (menggunakan `httpx` dan `BeautifulSoup4`) dari situs resmi BPOM (`https://cekbpom.pom.go.id`).

**Alur Validasi BPOM (`/api/scan/bpom`)**:

```mermaid
sequenceDiagram
    User->>+API: POST /scan/bpom (Nomor BPOM)
    API->>+CRUD: Check cache (ScanHistoryBPOM)
    alt Data Cached
        CRUD-->>API: Return cached data
        API->>CRUD: Create Scan History (No new scraping)
    else Cache Miss
        API->>+BPOMScraper: Search BPOM (Scraping)
        BPOMScraper->>BPOMScraper: Handle CSRF Token & POST Request
        BPOMScraper-->>API: Product details (or None)
        API->>CRUD: Create BPOM Cache
        API->>CRUD: Create Scan History
    end
    API-->>-User: Validation result
```

**Benefit Caching:** Hasil *scraping* disimpan dalam *database* (`bpom_cache`) untuk menghemat *resource* dan memberikan respons cepat.

**Sample Response:**

```json
{
  "success": true,
  "data": {
    "registration_number": "MD 272831023097",
    "product_name": "Indomie Goreng",
    "brand": "PT Indofood CBP Sukses Makmur Tbk",
    "status": "TERDAFTAR",
    "expiry_date": "2028-12-31",
    "cached": false
  }
}
```

### 3\. Allergen Cross-Reference (Personalisasi)

*Endpoint* `/api/scan/analyze` secara otomatis memeriksa bahan-bahan yang diidentifikasi oleh AI terhadap daftar alergi yang tersimpan di profil pengguna.

  * Daftar alergi pengguna diambil dari *database* (`current_user.allergies`).
  * Daftar bahan (`ingredients`) dari hasil AI diubah menjadi huruf kecil dan diperiksa keberadaan alergen yang telah diatur oleh pengguna.
  * Alergen yang terdeteksi ditambahkan ke dalam *field* `warnings` sebelum disimpan ke `ScanHistoryOCR` dan ditampilkan kepada pengguna.

### 4\. Food Catalog (Database Makanan)

Akses cepat ke database internal yang berisi **4.122 data produk** makanan dan minuman yang telah terkurasi.

**Fitur Utama:**

  * **Pencarian Cepat (`/api/food/search`):** Mencari produk berdasarkan nama atau merek.
  * **Detail Nutrisi:** Menampilkan informasi nilai gizi (AKG), komposisi, dan takaran saji tanpa perlu melakukan scan ulang.
  * **Pagination:** Mendukung *infinite scroll* atau *pagination* untuk menjelajahi katalog.

**Data Point:**

  * 4.122 entri produk unik.
  * Mencakup kategori: Makanan Ringan, Minuman, Produk Susu, Makanan Instan, dll.

### 5\. Favorites Management

Pengguna dapat menyimpan produk hasil scan atau pencarian ke dalam daftar favorit untuk akses cepat di kemudian hari.

  * **Endpoint:** `/api/favorites`
  * **Fungsi:** Simpan (`POST`), Hapus (`DELETE`), dan Lihat Daftar (`GET`) produk favorit.
  * **Integrasi:** Terhubung langsung dengan *Food Catalog* dan *Scan History*.

### 6\. GiziPedia (Education Hub)

**Content Structure:**

  - **Categories:** Zat Gizi Makro, Zat Gizi Mikro, Aditif Makanan, Label & Istilah
  - **Articles:** 100 artikel edukasi
  - **Format:** Markdown-based dengan images
  - **Search:** Full-text search dengan relevance ranking

**Features:**

  - Rich text editor (admin)
  - Category filtering
  - Bookmark system
  - Reading time estimate
  - Related articles

### 7\. Allergen Management System

Manajemen data alergen yang dinamis.

**Allergen Database:**
Admin dapat mengelola master data alergen (cth: Kacang, Susu, Gluten, Seafood) yang nantinya dipilih oleh user di profil mereka.

**Detection Logic (Actual Implementation):**

```python
# app/routers/scan.py
user_allergies = [allergy.name.lower() for allergy in current_user.allergies]
ingredients_text = result.get('ingredients', '').lower()

detected_allergens = [
    allergy.capitalize() 
    for allergy in user_allergies 
    if allergy in ingredients_text
]
# Result: ["Kacang Tanah", "Gluten"]
```

### 8\. Scan History & Analytics

Setiap aktivitas scan (OCR maupun BPOM) disimpan untuk referensi pengguna.

  - **Riwayat Terpisah:** Tab khusus untuk Riwayat OCR dan Riwayat BPOM.
  - **Detail View:** Pengguna dapat melihat kembali detail nutrisi dan hasil analisis AI dari produk yang pernah discan sebelumnya.
  - **Admin Analytics:** Admin dapat memantau jumlah scan harian untuk mengevaluasi penggunaan sistem.

-----

## TECHNOLOGY STACK

### Frontend Architecture

```
React 18 (Vite 6)
├── Routing: React Router v7
├── State: TanStack Query v5 + Context API
├── UI: Tailwind CSS 3 + Framer Motion (Animation) + Lucide React (Icons)
├── Forms: React Hook Form + Zod validation
├── HTTP: Axios
├── Scanner: html5-qrcode
├── Charts: Chart.js + react-chartjs-2
└── Build: Vite 6 (ES modules)
```

**Key Dependencies (`package.json`):**

```json
{
  "react": "^18.3.1",
  "vite": "^6.0.5",
  "react-router-dom": "^7.1.1",
  "@tanstack/react-query": "^5.64.1",
  "tailwindcss": "^3.4.17",
  "axios": "^1.7.9",
  "html5-qrcode": "^2.3.8",
  "chart.js": "^4.4.7",
  "react-chartjs-2": "^5.3.0",
  "react-hook-form": "^7.54.2",
  "zod": "^3.24.1",
  "framer-motion": "^11.16.0",
  "lucide-react": "^0.471.0"
}
```

**Folder Structure:**

```
frontend/
├── src/
│   ├── components/        # UI Components
│   │   ├── layout/        # Header, Footer, MainLayout
│   │   ├── ui/            # Reusable (Button, Card, Modal, Input, Toast)
│   │   └── features/      # NutritionLabel
│   ├── pages/             # Page Components (Home, Scanner, History, Admin...)
│   │   └── admin/         # Admin Specific Pages (Dashboard, Products, Users)
│   ├── hooks/             # Custom hooks (useAuth, useCommon, useOwnerAuth)
│   ├── context/           # Global State (AuthContext)
│   ├── config/            # API Configuration (api.js)
│   ├── routes/            # Route Definitions (AdminRoute, ProtectedRoute)
│   ├── i18n/              # Localization (id/en)
│   ├── utils/             # Helper functions (helpers.js)
│   └── assets/            # Static Assets
├── public/
└── vite.config.js
```

### Backend Architecture

```
FastAPI + Python 3.11
├── ORM: SQLAlchemy 2.0
├── Database: PyMySQL (MariaDB connector)
├── Validation: Pydantic v2
├── Auth: JWT (python-jose) + Passlib (bcrypt)
├── AI: google-genai (Google DeepMind SDK terbaru)
├── OCR: Pytesseract (Tesseract OCR Wrapper)
├── Scraping: HTTPX + BeautifulSoup4
├── Image Processing: Pillow
└── Server: Uvicorn (ASGI)
```

**Key Dependencies (`requirements.txt`):**

```python
fastapi>=0.100.0
uvicorn>=0.20.0
sqlalchemy>=2.0.0
pymysql>=1.0.0
pydantic>=2.0.0
python-jose[cryptography]>=3.3.0
passlib>=1.7.4
python-multipart>=0.0.6
google-genai>=0.1.0       
beautifulsoup4>=4.12.0
httpx>=0.24.0
pillow>=10.0.0
pytesseract
```

**Project Structure:**

```
backend/
├── app/
│   ├── routers/           # API Endpoints (Routes)
│   │   ├── auth.py        # Authentication
│   │   ├── admin.py       # Admin Operations
│   │   ├── scan.py        # OCR & AI Analysis
│   │   ├── food.py        # Food Catalog Operations
│   │   ├── favorites.py   # User Favorites
│   │   ├── education.py   # Articles & GiziPedia
│   │   └── users.py       # User Profile Management
│   ├── crud/              # Database Operations (Create, Read, Update, Delete)
│   ├── models/            # SQLAlchemy Database Models
│   ├── schemas/           # Pydantic Response/Request Models
│   ├── services/          # External Logics
│   │   ├── ai_service.py     # Gemini AI Integration
│   │   └── bpom_endpoint.py  # BPOM Scraping Logic
│   ├── core/              # Config, Database, Security
│   └── main.py            # FastAPI Entry Point
├── uploads/               # Local Storage for Images
└── requirements.txt
```

### Database Schema

**Technology:** MariaDB 11.4.4 (via PyMySQL)

**Schema Design:**

```sql
-- Users & Authentication
users (14 columns)
├── id (PK)
├── email (UNIQUE), password_hash, full_name
├── role (enum: user, admin, owner)
├── gender, age, height, weight
├── activity_level (enum: sedentary, light, moderate, active, very_active)
├── reset_token, reset_token_expires
└── created_at, updated_at

-- Reference Data
allergens (
  id, name, code, category, description, 
  severity_level, created_by, timestamps
)
additives (
  id, name, code, category, safety_level, 
  description, health_risks, timestamps
)

-- User Relations
user_allergies (id, user_id, allergen_id, notes)
favorites (
  id, user_id, 
  food_id (FK -> foods), 
  scan_ocr_id (FK -> scan_history_ocr), 
  scan_bpom_id (FK -> scan_history_bpom), 
  created_at
)

-- Core Data: Scan History
scan_history_ocr (14 columns)
├── id (PK), user_id (FK)
├── image_data (LONGTEXT/Base64)
├── product_name
├── ocr_raw_data (JSON)      -- Stores calories, protein, etc.
├── ai_analysis (TEXT)       -- AI Summary
├── pros (JSON), cons (JSON)
├── ingredients (TEXT)
├── warnings (JSON)          -- Includes allergen warnings
├── health_score (INT), grade (VARCHAR)
└── is_favorited (BOOL), created_at

scan_history_bpom (10 columns)
├── id (PK), user_id (FK)
├── bpom_number, product_name, brand, manufacturer
├── status (TERDAFTAR, dll)
├── raw_response (JSON)      -- Full scraped data
└── is_favorited (BOOL), created_at

-- Core Data: Food Catalog
foods (18 columns)
├── id (PK)
├── name, brand, barcode
├── serving_size, calories, proteins, fats, carbs
├── fiber, sugar, sodium
├── ingredients, image_url
├── external_id, data_source
└── timestamps

-- Caching & Content
bpom_cache (id, bpom_number, data (JSON), timestamps)
articles (id, title, slug, content, category_id, status, views, timestamps)
article_categories (id, name, slug, description)
```

**ERD Logic (Simplified):**

```
      [foods] <───────┐
                      │
  [scan_history_ocr] ─┼──► [favorites] ◄── [users] ──► [user_allergies] ──► [allergens]
                      │
 [scan_history_bpom] ─┘
```

### Infrastructure & Deployment

**Frontend Hosting:**

```yaml
Platform: VPS (Dedicated Server)
Web Server: Nginx 1.24
SSL: Let's Encrypt
Deployment: Manual Build (dist/) -> Nginx Serve
```

**Backend Hosting:**

```yaml
Platform: Railway / Render (Containerized)
Runtime: Python 3.11
Server: Uvicorn
Environment: Production
Base URL: https://backend-url.railway.app
```

**Database:**

```yaml
Server: VPS (aaPanel Managed)
DBMS: MariaDB 11.4.4
Connection: Remote (PyMySQL) via Host IP
```

-----

## QUICK START (INSTALLATION)

### Prerequisites

```bash
Node.js 18+
Python 3.11+
MariaDB 11.4.4
Git
```

### 1\. Clone Repository

```bash
git clone https://github.com/rbwtech/lacak-nutri.git
cd lacak-nutri
```

### 2\. Database Setup

**Create Database:**

```sql
CREATE DATABASE lacak_nutri CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Import Schema:**

Pastikan Anda berada di *root directory* project (`lacak-nutri/`).

```bash
mysql -u root -p lacak_nutri < database/schema.sql
mysql -u root -p lacak_nutri < database/seed.sql
```

### 3\. Backend Configuration

**Install Dependencies:**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Environment Variables (.env):**

Buat file `.env` di dalam folder `backend/` dan isi sesuai konfigurasi berikut:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=lacak_nutri
DB_USER=root
DB_PASSWORD=your_password

SECRET_KEY=generate_your_secure_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200

GEMINI_API_KEY=your_google_gemini_api_key

UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=10485760

CORS_ORIGINS=http://localhost:5173

DEBUG=True
HOST=0.0.0.0
PORT=8000

RECAPTCHA_SECRET_KEY=your_recaptcha_server_secret
EMAIL_SENDER_NAME="Lacak Nutri Admin"
EMAIL_SENDER_ADDRESS=admin@lacaknutri.com

SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

**Run Server:**

Pastikan *virtual environment* aktif dan Anda berada di folder `backend/`.

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### 4\. Frontend Configuration

**Install Dependencies:**

Buka terminal baru dan masuk ke folder frontend.

```bash
cd frontend
npm install
```

**Environment Variables (.env):**

Buat file `.env` di dalam folder `frontend/`.

```env
VITE_API_URL=http://localhost:8000/api
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_client_site_key
```

**Run Development Server:**

```bash
npm run dev
```

Frontend: `http://localhost:5173`

### 5\. Production Build

**Frontend:**

```bash
npm run build
# Output akan berada di folder: dist/
```

**Backend:**

```bash
# Menggunakan Gunicorn (Linux/Mac)
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Atau Uvicorn langsung (Windows/Simple Deploy)
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

-----

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

## DESIGN SYSTEM

Sistem desain LacakNutri menggunakan tema kustom Tailwind CSS dengan dukungan penuh untuk **Light Mode** dan **Dark Mode**.

### Color Palette

Warna dikelola menggunakan CSS Variables untuk mendukung pergantian tema yang mulus.

| Color Token | Light Mode (Hex) | Dark Mode (Hex) | Penggunaan Utama |
| :--- | :--- | :--- | :--- |
| **Primary** | `#FF9966` | `#FF9966` | Brand identity, CTA buttons, links |
| **Primary Hover** | `#FF7A4D` | `#FF7A4D` | Hover states |
| **Secondary** | `#6B8E23` | `#8ABE53` | Status sehat, verifikasi (adjusted for contrast) |
| **Accent** | `#A1D2D5` | `#5D8A8D` | Dekorasi, info cards, highlights |
| **Background Base** | `#FDFDF5` | `#121212` | Latar belakang utama aplikasi |
| **Background Surface** | `#FFFFF7` | `#1E1E1E` | Kartu (Cards), Modal, Sidebar |
| **Text Primary** | `#333333` | `#E0E0E0` | Judul, konten utama |
| **Text Secondary** | `#8C8C8C` | `#A0A0A0` | Label, metadata, deskripsi singkat |
| **Border** | `#EBE3D5` | `#333333` | Garis pemisah, border input |

**Status Colors (Hardcoded):**

  - Success: `#4CAF50`
  - Warning: `#FFC107`
  - Error: `#EF5350`

### Typography

**Font Family:**
Menggunakan **Manrope** dari Google Fonts sebagai font utama, dengan fallback ke Inter dan sans-serif.

```css
font-family: "Manrope", "Inter", "sans-serif";
```

**Weights:** 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold).

### UI Components Styling

Konfigurasi Tailwind (`tailwind.config.js`) mencakup kustomisasi berikut:

**Border Radius:**

  - `rounded-xl`: 12px
  - `rounded-2xl`: 16px
  - `rounded-3xl`: 24px

**Box Shadow:**

  - `shadow-soft`: `0 8px 24px rgba(0, 0, 0, 0.05)`

**Animations:**

  - **Blob:** Animasi background fluid (`blob 7s infinite`).
  - **Fade In:** Transisi masuk elemen (`fadeIn 0.5s ease-out`).

-----

## LICENSE

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Trio WakwaW Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## TEAM

**Trio WakwaW Team** - UINIC 7.0 Web Development Competition

```
┌─────────────────────────────────────────────────────┐
│  Made with ❤️ by Trio WakwaW Team
│
│  • Radipta Basri Wijaya
│  • Agung Nugraha
│  • Bayu Wicaksono
│
└─────────────────────────────────────────────────────┘
```

---

## ACKNOWLEDGEMENT

**Technologies:**

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [React](https://react.dev/) - UI library
- [Gemini AI](https://ai.google.dev/) - Generative AI analysis
- [BPOM](https://cekbpom.pom.go.id/) - Public product registration database

**Inspiration:**

- MyFitnessPal - Nutrition tracking
- Open Food Facts - Open food database
- BPOM Mobile - Product verification

**Competition:**

- UINIC 7.0 Web Development - Universitas Islam Negeri Sunan Kalijaga Yogyakarta

---

## SUPPORT

**Issues & Bugs:**  
Report via [GitHub Issues](https://github.com/rbwtech/lacak-nutri/issues)

**Feature Requests:**  
Submit via [GitHub Discussions](https://github.com/rbwtech/lacak-nutri/discussions)

**General Inquiries:**  
WhatsApp: wa.me/6285182381003

---

<div align="center">

**⭐ Star us on GitHub if you find this project useful!**

**LacakNutri** © 2025 Trio WakwaW Team

</div>
