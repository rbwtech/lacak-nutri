-- users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- allergens master data
CREATE TABLE allergens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- user allergies
CREATE TABLE user_allergies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    allergen_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_allergen (user_id, allergen_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (allergen_id) REFERENCES allergens(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- scan history OCR
CREATE TABLE scan_history_ocr (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    session_id VARCHAR(100) NOT NULL,
    product_name VARCHAR(255),
    image_url TEXT,
    ocr_raw_data JSON COMMENT 'Hasil OCR: kalori, lemak, gula, protein, dll',
    ai_analysis TEXT COMMENT 'Output analisis Gemini AI',
    detected_allergens JSON COMMENT 'Array allergen yang terdeteksi',
    health_score TINYINT COMMENT 'Skor kesehatan 1-10',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- scan history BPOM
CREATE TABLE scan_history_bpom (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    session_id VARCHAR(100) NOT NULL,
    bpom_number VARCHAR(50) NOT NULL,
    product_id VARCHAR(100) COMMENT 'PRODUCT_ID dari BPOM',
    class_id VARCHAR(20) COMMENT 'CLASS_ID: 01=Obat, 10=OT, 13=Pangan, dll',
    product_type VARCHAR(100) COMMENT 'APPLICATION: e-Registration Pangan Olahan, dll',
    product_name VARCHAR(255),
    brand VARCHAR(255) COMMENT 'PRODUCT_BRANDS',
    manufacturer VARCHAR(255) COMMENT 'MANUFACTURER_NAME',
    manufacturer_address TEXT COMMENT 'MANUFACTURER_ADDRESS',
    manufacturer_district VARCHAR(100) COMMENT 'MANUFACTURER_DISTRICT_DETAIL',
    manufacturer_province VARCHAR(100) COMMENT 'MANUFACTURER_PROVINCE_DETAIL',
    manufacturer_country VARCHAR(100) COMMENT 'MANUFACTURER_COUNTRY_DETAIL',
    registrar VARCHAR(255) COMMENT 'REGISTRAR (Pendaftar)',
    registrar_address TEXT COMMENT 'REGISTRAR_ADD',
    issued_date DATE COMMENT 'PRODUCT_DATE (Tanggal Terbit)',
    expired_date DATE COMMENT 'PRODUCT_EXPIRED',
    composition TEXT COMMENT 'INGREDIENTS',
    packaging TEXT COMMENT 'PRODUCT_PACKAGE',
    status VARCHAR(50) COMMENT 'STATUS: Berlaku, Dicabut, dll',
    qr_code VARCHAR(100) COMMENT 'PRODUCT_QR',
    raw_response JSON COMMENT 'Full JSON response dari BPOM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_bpom_number (bpom_number),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- bpom cache (TTL 30 hari)
CREATE TABLE bpom_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bpom_number VARCHAR(50) UNIQUE NOT NULL,
    data JSON NOT NULL COMMENT 'Full data produk dari BPOM API',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_bpom_number (bpom_number),
    INDEX idx_last_updated (last_updated)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- nutrition info master
CREATE TABLE nutrition_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category ENUM('makro', 'mikro') NOT NULL,
    unit VARCHAR(20) COMMENT 'gram, mg, mcg',
    daily_value DECIMAL(10,2) COMMENT 'AKG standar',
    description TEXT,
    benefits TEXT,
    sources TEXT COMMENT 'Sumber makanan',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- additives master
CREATE TABLE additives (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) COMMENT 'E621, E102, dll',
    category ENUM('pemanis', 'pengawet', 'pewarna', 'perisa', 'lainnya') NOT NULL,
    safety_level ENUM('safe', 'moderate', 'avoid') DEFAULT 'safe',
    description TEXT,
    health_risks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_code (code),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- diseases master
CREATE TABLE diseases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    dietary_recommendations TEXT,
    foods_to_avoid TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- education articles
CREATE TABLE education_articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category ENUM('gizi', 'aditif', 'penyakit', 'label', 'tips') NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100),
    thumbnail_url TEXT,
    view_count INT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_category (category),
    INDEX idx_is_published (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;