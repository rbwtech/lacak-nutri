SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users & Auth
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    -- Profil Fisik
    age INT NULL,
    weight FLOAT NULL, -- kg
    height FLOAT NULL, -- cm
    gender ENUM('male', 'female') NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Master Data: Allergens
DROP TABLE IF EXISTS allergens;
CREATE TABLE allergens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. User Preferences: Allergies (Many-to-Many)
DROP TABLE IF EXISTS user_allergies;
CREATE TABLE user_allergies (
    user_id INT NOT NULL,
    allergen_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, allergen_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (allergen_id) REFERENCES allergens(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Master Data: Nutrition Info (Kamus Gizi)
DROP TABLE IF EXISTS nutrition_info;
CREATE TABLE nutrition_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category ENUM('makro', 'mikro') NOT NULL,
    unit VARCHAR(20) COMMENT 'kkal, g, mg, mcg',
    daily_value DECIMAL(10,2) COMMENT 'AKG Standar Dewasa (2150 kkal)',
    description TEXT,
    benefits TEXT,
    sources TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Master Data: Additives (Bahan Tambahan Pangan)
DROP TABLE IF EXISTS additives;
CREATE TABLE additives (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) COMMENT 'Kode E-Number',
    category ENUM('pemanis', 'pengawet', 'pewarna', 'perisa', 'pengemulsi', 'lainnya') NOT NULL,
    safety_level ENUM('safe', 'moderate', 'avoid') DEFAULT 'safe',
    description TEXT,
    health_risks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Master Data: Diseases (Penyakit & Diet)
DROP TABLE IF EXISTS diseases;
CREATE TABLE diseases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    dietary_recommendations TEXT,
    foods_to_avoid TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Education Articles
DROP TABLE IF EXISTS education_articles;
CREATE TABLE education_articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category ENUM('gizi', 'aditif', 'penyakit', 'label', 'tips') NOT NULL,
    content LONGTEXT NOT NULL, -- Menggunakan LONGTEXT untuk artikel panjang
    author VARCHAR(100) DEFAULT 'Tim LacakNutri',
    thumbnail_url TEXT,
    read_time VARCHAR(20) DEFAULT '5 min',
    view_count INT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Scan History: BPOM
DROP TABLE IF EXISTS scan_history_bpom;
CREATE TABLE scan_history_bpom (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    session_id VARCHAR(100) NOT NULL,
    bpom_number VARCHAR(50) NOT NULL,
    product_name VARCHAR(255),
    brand VARCHAR(255),
    manufacturer VARCHAR(255),
    status VARCHAR(50),
    raw_response JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Scan History: OCR (AI Analysis)
DROP TABLE IF EXISTS scan_history_ocr;
CREATE TABLE scan_history_ocr (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    session_id VARCHAR(100) NOT NULL,
    image_url TEXT,
    ocr_raw_data JSON,
    ai_analysis TEXT,
    health_score TINYINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. BPOM Cache (Untuk performa)
DROP TABLE IF EXISTS bpom_cache;
CREATE TABLE bpom_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bpom_number VARCHAR(50) UNIQUE NOT NULL,
    data JSON NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;