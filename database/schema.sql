-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 24, 2025 at 06:28 AM
-- Server version: 11.4.4-MariaDB-log
-- PHP Version: 8.3.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+07:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lacak_nutri_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `additives`
--

CREATE TABLE `additives` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) DEFAULT NULL COMMENT 'Kode E-Number',
  `category` enum('pemanis','pengawet','pewarna','perisa','pengemulsi','lainnya') NOT NULL,
  `safety_level` enum('safe','moderate','avoid') DEFAULT 'safe',
  `description` text DEFAULT NULL,
  `health_risks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `allergens`
--

CREATE TABLE `allergens` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bpom_cache`
--

CREATE TABLE `bpom_cache` (
  `id` int(11) NOT NULL,
  `bpom_number` varchar(50) NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`data`)),
  `last_updated` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `diseases`
--

CREATE TABLE `diseases` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `dietary_recommendations` text DEFAULT NULL,
  `foods_to_avoid` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `education_articles`
--

CREATE TABLE `education_articles` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `category` enum('gizi','aditif','penyakit','label','tips') NOT NULL,
  `content` longtext NOT NULL,
  `author` varchar(100) DEFAULT 'Tim LacakNutri',
  `thumbnail_url` text DEFAULT NULL,
  `read_time` varchar(20) DEFAULT '5 min',
  `view_count` int(11) DEFAULT 0,
  `is_published` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `food_catalog`
--

CREATE TABLE `food_catalog` (
  `id` int(11) NOT NULL,
  `original_code` varchar(20) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `weight_g` decimal(10,2) DEFAULT 100.00,
  `calories` decimal(10,2) DEFAULT 0.00,
  `protein` decimal(10,2) DEFAULT 0.00,
  `fat` decimal(10,2) DEFAULT 0.00,
  `carbs` decimal(10,2) DEFAULT 0.00,
  `sugar` decimal(10,2) DEFAULT 0.00,
  `fiber` decimal(10,2) DEFAULT 0.00,
  `sodium_mg` decimal(10,2) DEFAULT 0.00,
  `potassium_mg` decimal(10,2) DEFAULT 0.00,
  `calcium_mg` decimal(10,2) DEFAULT 0.00,
  `iron_mg` decimal(10,2) DEFAULT 0.00,
  `cholesterol_mg` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `image_url` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `localization_settings`
--

CREATE TABLE `localization_settings` (
  `id` int(11) NOT NULL,
  `timezone` varchar(50) NOT NULL,
  `timezone_offset` varchar(10) NOT NULL,
  `timezone_label` varchar(100) NOT NULL,
  `locale` varchar(10) NOT NULL,
  `locale_label` varchar(50) NOT NULL,
  `country_code` varchar(5) NOT NULL,
  `region` varchar(50) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nutrition_info`
--

CREATE TABLE `nutrition_info` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` enum('makro','mikro') NOT NULL,
  `unit` varchar(20) DEFAULT NULL COMMENT 'kkal, g, mg, mcg',
  `daily_value` decimal(10,2) DEFAULT NULL COMMENT 'AKG Standar Dewasa (2150 kkal)',
  `description` text DEFAULT NULL,
  `benefits` text DEFAULT NULL,
  `sources` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `owner_auth_codes`
--

CREATE TABLE `owner_auth_codes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `code` varchar(8) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL,
  `is_used` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `scan_history_bpom`
--

CREATE TABLE `scan_history_bpom` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `session_id` varchar(100) NOT NULL,
  `bpom_number` varchar(50) NOT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `manufacturer` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `raw_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`raw_response`)),
  `is_favorited` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `scan_history_ocr`
--

CREATE TABLE `scan_history_ocr` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `session_id` varchar(100) NOT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `image_data` longtext DEFAULT NULL,
  `ocr_raw_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Hasil OCR: kalori, lemak, gula, protein, dll' CHECK (json_valid(`ocr_raw_data`)),
  `ai_analysis` text DEFAULT NULL COMMENT 'Output analisis Gemini AI',
  `pros` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`pros`)),
  `cons` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`cons`)),
  `ingredients` text DEFAULT NULL,
  `warnings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`warnings`)),
  `health_score` tinyint(4) DEFAULT NULL COMMENT 'Skor kesehatan 1-100',
  `grade` varchar(2) DEFAULT NULL,
  `is_favorited` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `age` int(11) DEFAULT NULL,
  `weight` float DEFAULT NULL,
  `height` float DEFAULT NULL,
  `gender` enum('male','female') DEFAULT NULL,
  `timezone` varchar(50) DEFAULT 'Asia/Jakarta',
  `locale` varchar(10) DEFAULT 'id-ID',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `photo_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_allergies`
--

CREATE TABLE `user_allergies` (
  `user_id` int(11) NOT NULL,
  `allergen_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `additives`
--
ALTER TABLE `additives`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `allergens`
--
ALTER TABLE `allergens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `fk_allergen_creator` (`created_by`);

--
-- Indexes for table `bpom_cache`
--
ALTER TABLE `bpom_cache`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bpom_number` (`bpom_number`);

--
-- Indexes for table `diseases`
--
ALTER TABLE `diseases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `education_articles`
--
ALTER TABLE `education_articles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `food_catalog`
--
ALTER TABLE `food_catalog`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `localization_settings`
--
ALTER TABLE `localization_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `timezone` (`timezone`);

--
-- Indexes for table `nutrition_info`
--
ALTER TABLE `nutrition_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `owner_auth_codes`
--
ALTER TABLE `owner_auth_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `scan_history_bpom`
--
ALTER TABLE `scan_history_bpom`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_is_favorited_bpom` (`user_id`,`is_favorited`),
  ADD KEY `idx_bpom_favorited` (`is_favorited`),
  ADD KEY `idx_bpom_user_favorited` (`user_id`,`is_favorited`);

--
-- Indexes for table `scan_history_ocr`
--
ALTER TABLE `scan_history_ocr`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_is_favorited_ocr` (`user_id`,`is_favorited`),
  ADD KEY `idx_ocr_favorited` (`is_favorited`),
  ADD KEY `idx_ocr_user_favorited` (`user_id`,`is_favorited`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `user_allergies`
--
ALTER TABLE `user_allergies`
  ADD PRIMARY KEY (`user_id`,`allergen_id`),
  ADD KEY `allergen_id` (`allergen_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `additives`
--
ALTER TABLE `additives`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `allergens`
--
ALTER TABLE `allergens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bpom_cache`
--
ALTER TABLE `bpom_cache`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `diseases`
--
ALTER TABLE `diseases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `education_articles`
--
ALTER TABLE `education_articles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `food_catalog`
--
ALTER TABLE `food_catalog`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `localization_settings`
--
ALTER TABLE `localization_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nutrition_info`
--
ALTER TABLE `nutrition_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `owner_auth_codes`
--
ALTER TABLE `owner_auth_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `scan_history_bpom`
--
ALTER TABLE `scan_history_bpom`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `scan_history_ocr`
--
ALTER TABLE `scan_history_ocr`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `allergens`
--
ALTER TABLE `allergens`
  ADD CONSTRAINT `fk_allergen_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `owner_auth_codes`
--
ALTER TABLE `owner_auth_codes`
  ADD CONSTRAINT `owner_auth_codes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `scan_history_bpom`
--
ALTER TABLE `scan_history_bpom`
  ADD CONSTRAINT `scan_history_bpom_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_allergies`
--
ALTER TABLE `user_allergies`
  ADD CONSTRAINT `user_allergies_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_allergies_ibfk_2` FOREIGN KEY (`allergen_id`) REFERENCES `allergens` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
