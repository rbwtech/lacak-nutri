-- Insert sample admin user (password: L4c4kNutr1Adm1n)
INSERT INTO users (email, password_hash, name, role) VALUES 
('admin@lacaknutri.com', '8a9778e1af274d3169fb3cdeab9e914e3a15c690413291e31505f774a8760204', 'Admin LacakNutri', 'admin');

-- Insert sample allergens
INSERT INTO allergens (name, description) VALUES 
('Kacang', 'Alergen kacang tanah dan kacang-kacangan lainnya'),
('Susu', 'Produk susu dan turunannya (laktosa, kasein)'),
('Gluten', 'Protein dalam gandum, barley, rye'),
('Telur', 'Telur ayam dan produk turunannya'),
('Ikan', 'Ikan dan produk seafood'),
('Kedelai', 'Kedelai dan produk turunannya'),
('Kerang', 'Kerang, udang, dan crustacean lainnya'),
('Wijen', 'Biji wijen dan minyak wijen');

-- Insert sample nutrition info
INSERT INTO nutrition_info (name, category, unit, daily_value, description, benefits, sources) VALUES
('Protein', 'makro', 'gram', 50.00, 'Zat pembangun tubuh', 'Membangun otot, memperbaiki sel', 'Daging, ikan, telur, kacang'),
('Karbohidrat', 'makro', 'gram', 275.00, 'Sumber energi utama', 'Energi untuk aktivitas', 'Nasi, roti, kentang, pasta'),
('Lemak Total', 'makro', 'gram', 67.00, 'Sumber energi dan vitamin', 'Energi cadangan, penyerapan vitamin', 'Minyak, daging, kacang'),
('Gula', 'makro', 'gram', 50.00, 'Karbohidrat sederhana', 'Energi cepat', 'Buah, gula, madu'),
('Serat', 'makro', 'gram', 25.00, 'Serat makanan', 'Pencernaan sehat', 'Sayur, buah, gandum'),
('Natrium', 'mikro', 'mg', 2300.00, 'Mineral elektrolit', 'Keseimbangan cairan', 'Garam, makanan olahan'),
('Vitamin A', 'mikro', 'mcg', 900.00, 'Vitamin larut lemak', 'Kesehatan mata', 'Wortel, hati, susu'),
('Vitamin C', 'mikro', 'mg', 90.00, 'Vitamin antioksidan', 'Imunitas, kulit sehat', 'Jeruk, tomat, paprika'),
('Kalsium', 'mikro', 'mg', 1000.00, 'Mineral untuk tulang', 'Tulang dan gigi kuat', 'Susu, keju, sayur hijau'),
('Zat Besi', 'mikro', 'mg', 18.00, 'Mineral pembentuk darah', 'Mencegah anemia', 'Daging merah, bayam, kacang');

-- Insert sample additives
INSERT INTO additives (name, code, category, safety_level, description, health_risks) VALUES
('MSG (Monosodium Glutamat)', 'E621', 'perisa', 'moderate', 'Penguat rasa umami', 'Reaksi sensitif pada beberapa orang'),
('Aspartam', 'E951', 'pemanis', 'moderate', 'Pemanis buatan rendah kalori', 'Harus dihindari penderita PKU'),
('Natrium Benzoat', 'E211', 'pengawet', 'safe', 'Pengawet makanan asam', 'Aman dalam batas wajar'),
('Tartrazin', 'E102', 'pewarna', 'avoid', 'Pewarna kuning sintetis', 'Dapat memicu hiperaktif pada anak'),
('Sukralosa', 'E955', 'pemanis', 'safe', 'Pemanis buatan rendah kalori', 'Aman untuk diabetes'),
('BHA (Butylated Hydroxyanisole)', 'E320', 'pengawet', 'avoid', 'Antioksidan sintetis', 'Potensi karsinogenik'),
('Karamel', 'E150', 'pewarna', 'safe', 'Pewarna coklat alami', 'Aman dalam jumlah normal');

-- Insert sample diseases
INSERT INTO diseases (name, description, dietary_recommendations, foods_to_avoid) VALUES
('Diabetes Mellitus', 'Gangguan metabolisme gula darah', 'Konsumsi serat tinggi, protein seimbang, karbohidrat kompleks', 'Gula murni, makanan tinggi GI, minuman manis'),
('Hipertensi', 'Tekanan darah tinggi', 'Rendah natrium, tinggi kalium, DASH diet', 'Garam berlebih, makanan olahan, MSG'),
('Kolesterol Tinggi', 'Kadar lemak darah tinggi', 'Serat larut, lemak tak jenuh, omega-3', 'Lemak jenuh, lemak trans, kolesterol tinggi'),
('Celiac Disease', 'Intoleransi gluten', 'Diet bebas gluten 100%', 'Gandum, barley, rye, produk gluten'),
('Asam Urat', 'Penumpukan asam urat', 'Rendah purin, banyak air', 'Jeroan, seafood, alkohol, kacang merah');

-- Insert sample education articles
INSERT INTO education_articles (title, slug, category, content, author) VALUES
('Apa itu AKG dan Cara Membacanya', 'apa-itu-akg', 'label', 'AKG (Angka Kecukupan Gizi) adalah...<content lengkap>', 'Tim LacakNutri'),
('Mengenal Pemanis Buatan', 'mengenal-pemanis-buatan', 'aditif', 'Pemanis buatan adalah...<content lengkap>', 'Tim LacakNutri'),
('Protein: Fungsi dan Sumber', 'protein-fungsi-dan-sumber', 'gizi', 'Protein merupakan...<content lengkap>', 'Tim LacakNutri');