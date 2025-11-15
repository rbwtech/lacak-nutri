# LacakNutri - Setup Scripts

## Prerequisites

- Node.js 18+ & npm
- Python 3.11+
- MariaDB 11.4.4
- Git

## Quick Start

### 1. Initial Setup

```bash
setup-project.bat
```

Script ini akan:

- Create folder structure
- Initialize React + Vite frontend
- Setup Python virtual environment
- Install semua dependencies
- Copy database schema

### 2. Configure Environment

**Frontend** (.env di folder frontend/):

```
VITE_API_URL=http://localhost:8000/api
VITE_GEMINI_API_KEY=your_key
```

**Backend** (.env di folder backend/):

```
DB_HOST=localhost
DB_NAME=lacak_nutri
DB_USER=root
DB_PASSWORD=your_password
GEMINI_API_KEY=your_key
SECRET_KEY=S@DZYLbbTfLaZDi0U?qe0zsU
```

### 3. Setup Database

- Create database `lacak_nutri` di MariaDB
- Import `database/schema.sql`
- Import `database/seed.sql`

### 4. Run Development

**Frontend:**

```bash
run-frontend.bat
```

Akses: http://localhost:5173

**Backend:**

```bash
run-backend.bat
```

Akses: http://localhost:8000
API Docs: http://localhost:8000/docs

## File Structure

```
lacaknutri/
├── frontend/          # React + Vite
├── backend/           # FastAPI
├── database/          # SQL schema & seeds
└── uploads/           # User uploaded images
```

## Tech Stack

### Frontend

- React 18 + Vite 5
- Tailwind CSS 3
- React Router v6
- TanStack Query
- Axios
- html5-qrcode
- Tesseract.js

### Backend

- FastAPI
- SQLAlchemy 2.0
- PyMySQL
- Pydantic v2
- JWT Auth
- Gemini AI
- BPOM Scraper

### Database

- MariaDB 11.4.4

## Deployment

- Domain: lacaknutri.rbwtech.io
- VPS: 153.92.5.156
- Frontend: Nginx
- Backend: Railway/Render
- Database: aaPanel MariaDB
