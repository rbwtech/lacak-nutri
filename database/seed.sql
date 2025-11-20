-- A. User Admin Default
INSERT INTO users (email, password_hash, name, role) VALUES 
('radipta111@gmail.com', '$2b$12$soCu3k1tMVfxfkFM5Ofygui28US2u6Gm.5NVwcBlIR26gn8l31Q1G', 'RBW-Tech', 'admin'),
('radipta291@gmail.com', '$2b$12$W1lYkCXuZiQr4zfeGEy.ROT43EzpvxtUw2NvXfPloIej17lZGucPe', 'Radipta Basri Wijaya', 'user');
-- B. Allergens (Alergen Umum)
INSERT INTO allergens (name, description) VALUES 
('Kacang Tanah', 'Dapat menyebabkan reaksi anafilaksis berat.'),
('Susu Sapi', 'Mengandung laktosa dan protein kasein/whey.'),
('Telur', 'Terutama putih telur, umum pada anak-anak.'),
('Gandum (Gluten)', 'Protein gluten yang sulit dicerna penderita Celiac.'),
('Kedelai', 'Umum dalam kecap, tahu, tempe, dan pengemulsi.'),
('Ikan', 'Alergi seumur hidup, berbeda dengan seafood kerang.'),
('Kerang (Shellfish)', 'Udang, kepiting, lobster, tiram.'),
('Kacang Pohon', 'Almond, mete, kenari, pistachio.'),
('Wijen', 'Sering tersembunyi dalam bumbu dan roti.'),
('Sulf it', 'Pengawet pada buah kering dan wine.');

-- C. Nutrition Info (Kamus Gizi - Data AKG Umum Dewasa 2150 kkal)
INSERT INTO nutrition_info (name, category, unit, daily_value, description, benefits, sources) VALUES
('Energi Total', 'makro', 'kkal', 2150.00, 'Jumlah energi yang dihasilkan dari makanan.', 'Bahan bakar utama aktivitas tubuh.', 'Karbohidrat, Lemak, Protein'),
('Karbohidrat Total', 'makro', 'g', 325.00, 'Sumber energi utama tubuh.', 'Memberikan energi cepat untuk otak dan otot.', 'Nasi, roti, kentang, oat'),
('Lemak Total', 'makro', 'g', 67.00, 'Makronutrien padat energi.', 'Cadangan energi, pelindung organ, pelarut vitamin.', 'Minyak, alpukat, kacang, daging'),
('Protein', 'makro', 'g', 60.00, 'Zat pembangun sel tubuh.', 'Memperbaiki jaringan, membentuk enzim dan hormon.', 'Daging, telur, tahu, tempe, ikan'),
('Gula', 'makro', 'g', 50.00, 'Karbohidrat sederhana.', 'Energi instan, namun berisiko jika berlebih.', 'Buah, madu, minuman manis'),
('Serat Pangan', 'makro', 'g', 30.00, 'Karbohidrat tak tecerne.', 'Melancarkan pencernaan, mengontrol gula darah.', 'Sayuran, buah, biji-bijian'),
('Natrium (Garam)', 'mikro', 'mg', 2000.00, 'Mineral elektrolit utama.', 'Keseimbangan cairan, fungsi saraf.', 'Garam dapur, makanan olahan'),
('Lemak Jenuh', 'makro', 'g', 20.00, 'Lemak padat pada suhu ruang.', 'Stabilitas sel, namun berisiko kolesterol.', 'Minyak kelapa, lemak daging, mentega'),
('Vitamin C', 'mikro', 'mg', 90.00, 'Antioksidan larut air.', 'Meningkatkan imun, pembentukan kolagen.', 'Jeruk, jambu, brokoli, cabai'),
('Kalsium', 'mikro', 'mg', 1000.00, 'Mineral pembentuk tulang.', 'Kesehatan tulang dan gigi, kontraksi otot.', 'Susu, keju, ikan teri, bayam'),
('Zat Besi', 'mikro', 'mg', 18.00, 'Komponen hemoglobin.', 'Mengangkut oksigen dalam darah, cegah anemia.', 'Daging merah, hati, bayam'),
('Kalium', 'mikro', 'mg', 4700.00, 'Elektrolit penyeimbang natrium.', 'Menurunkan tekanan darah, kesehatan jantung.', 'Pisang, kentang, air kelapa');

-- D. Additives (Bahan Tambahan Pangan & Kode E)
INSERT INTO additives (name, code, category, safety_level, description, health_risks) VALUES
('Monosodium Glutamat', 'E621', 'perisa', 'moderate', 'Penguat rasa gurih (umami).', 'Dapat memicu sakit kepala atau mual pada orang sensitif (Chinese Restaurant Syndrome).'),
('Aspartam', 'E951', 'pemanis', 'moderate', 'Pemanis buatan rendah kalori, 200x lebih manis dari gula.', 'Berbahaya bagi penderita fenilketonuria (PKU). Kontroversial terkait efek saraf.'),
('Natrium Benzoat', 'E211', 'pengawet', 'safe', 'Mencegah jamur pada makanan asam (minuman soda, saus).', 'Bisa membentuk benzena (karsinogen) jika bereaksi dengan Vitamin C.'),
('Tartrazin', 'E102', 'pewarna', 'avoid', 'Pewarna kuning sintetis (Lemon Yellow).', 'Dapat memicu hiperaktivitas pada anak (ADHD) dan reaksi alergi.'),
('Sukralosa', 'E955', 'pemanis', 'safe', 'Pemanis buatan dari gula yang diklorinasi.', 'Umumnya aman, tidak menaikkan gula darah, stabil pada suhu panas.'),
('BHA (Butylated Hydroxyanisole)', 'E320', 'pengawet', 'avoid', 'Antioksidan sintetis untuk mencegah lemak tengik.', 'Diklasifikasikan sebagai kemungkinan karsinogen (penyebab kanker) pada manusia.'),
('BHT (Butylated Hydroxytoluene)', 'E321', 'pengawet', 'avoid', 'Sering dipakai bersama BHA.', 'Terkait dengan gangguan hormon dan potensi karsinogenik.'),
('Karagenan', 'E407', 'lainnya', 'moderate', 'Pengental dari rumput laut.', 'Dapat memicu peradangan usus atau gangguan pencernaan pada sebagian orang.'),
('Sirup Jagung Tinggi Fruktosa (HFCS)', '-', 'pemanis', 'avoid', 'Pemanis cair dari pati jagung.', 'Kontributor utama obesitas, diabetes, dan perlemakan hati.'),
('Nitrit & Nitrat', 'E249-252', 'pengawet', 'avoid', 'Pengawet daging olahan (sosis, kornet) agar tetap merah.', 'Dapat berubah menjadi nitrosamin yang bersifat karsinogenik.'),
('Merah Allura', 'E129', 'pewarna', 'moderate', 'Pewarna merah sintetis.', 'Dilarang di beberapa negara Eropa, terkait dengan hiperaktivitas.'),
('Asam Askorbat', 'E300', 'pengawet', 'safe', 'Vitamin C sintetis.', 'Sangat aman, berfungsi sebagai antioksidan.');

-- E. Diseases (Penyakit & Rekomendasi Diet)
INSERT INTO diseases (name, description, dietary_recommendations, foods_to_avoid) VALUES
('Diabetes Melitus Tipe 2', 'Kadar gula darah tinggi akibat resistensi insulin.', 'Fokus pada Karbohidrat Kompleks, Serat Tinggi, Indeks Glikemik Rendah.', 'Gula pasir, minuman manis, roti putih, nasi putih berlebih, sirup.'),
('Hipertensi (Darah Tinggi)', 'Tekanan darah arteri yang persisten tinggi.', 'Diet DASH: Tinggi Kalium, Kalsium, Magnesium. Perbanyak sayur & buah.', 'Garam (Natrium), makanan kaleng, ikan asin, keripik asin, MSG berlebih.'),
('Dislipidemia (Kolesterol)', 'Kadar lemak darah (LDL/Trigliserida) tidak normal.', 'Tingkatkan lemak tak jenuh (Omega-3), serat larut (Oat).', 'Lemak trans (margarin, gorengan), lemak jenuh (kulit ayam, santan kental), jeroan.'),
('Gagal Ginjal Kronis', 'Penurunan fungsi ginjal bertahap.', 'Batasi Protein, Natrium, Kalium, dan Fosfor sesuai stadium.', 'Buah tinggi kalium (pisang, alpukat), produk susu, makanan olahan.'),
('Asam Urat (Gout)', 'Penumpukan kristal asam urat di sendi.', 'Diet rendah purin, banyak minum air putih, konsumsi Vitamin C.', 'Jeroan (hati, usus), daging merah, seafood (udang, kerang), emping, alkohol.'),
('GERD (Asam Lambung)', 'Naiknya asam lambung ke kerongkongan.', 'Makan porsi kecil tapi sering, hindari pemicu iritasi.', 'Makanan pedas, asam, berlemak tinggi, kafein, cokelat, mint.'),
('Celiac Disease', 'Reaksi imun terhadap gluten.', 'Wajib Diet Bebas Gluten (Gluten-Free) seumur hidup.', 'Gandum, barley, rye, pasta biasa, roti biasa, kecap (yang mengandung gandum).'),
('Intoleransi Laktosa', 'Ketidakmampuan mencerna gula susu.', 'Gunakan produk bebas laktosa atau susu nabati (Almond, Soy).', 'Susu sapi murni, krim, es krim, keju lunak.'),
('Anemia Defisiensi Besi', 'Kekurangan sel darah merah akibat kurang zat besi.', 'Tingkatkan asupan Zat Besi Heme dan Vitamin C (untuk penyerapan).', 'Teh/Kopi saat makan (menghambat penyerapan), kalsium berlebih saat makan.'),
('Obesitas', 'Akumulasi lemak tubuh berlebih.', 'Defisit Kalori, tingkatkan protein dan serat, hindari gula cair.', 'Makanan cepat saji, minuman bergula, camilan tinggi kalori, gorengan.');

-- F. Education Articles (Konten Edukasi)
INSERT INTO education_articles (title, slug, category, content, author, is_published, thumbnail_url) VALUES
('Panduan Membaca Label Informasi Nilai Gizi', 'panduan-membaca-label', 'label', '<p>Membaca label gizi adalah kunci pola makan sehat. Perhatikan <strong>Takaran Saji</strong> terlebih dahulu. Angka kalori yang tertera adalah per sajian, bukan per kemasan. Jika Anda makan 2 bungkus, kalikan kalorinya dengan dua.</p><p>Cek %AKG (Angka Kecukupan Gizi). Jika di bawah 5% berarti rendah, jika di atas 20% berarti tinggi. Pilih produk dengan %AKG rendah untuk lemak jenuh, gula, dan garam.</p>', 'Ahli Gizi LacakNutri', 1, 'https://placehold.co/600x400/FF9966/white?text=Label+Gizi'),
('Bahaya Gula Tersembunyi: HFCS', 'bahaya-gula-tersembunyi', 'aditif', '<p>Sirup Jagung Tinggi Fruktosa (HFCS) adalah pemanis murah yang sering dipakai di industri. Berbeda dengan glukosa, fruktosa hanya bisa dimetabolisme di hati.</p><p>Konsumsi berlebih memicu perlemakan hati (Fatty Liver), resistensi insulin, dan obesitas sentral (perut buncit). Cek label: sering disebut "Fructose Syrup" atau "Gula Jagung".</p>', 'Dr. Nutrisi', 1, 'https://placehold.co/600x400/FFC107/333?text=Gula+Tersembunyi'),
('MSG: Kawan atau Lawan?', 'msg-kawan-atau-lawan', 'aditif', '<p>Monosodium Glutamat (MSG) mengandung natrium dan glutamat, asam amino alami. FDA dan BPOM menggolongkannya aman (GRAS).</p><p>Isu "Chinese Restaurant Syndrome" tidak terbukti secara ilmiah pada mayoritas orang. Namun, MSG mengandung natrium (meski lebih sedikit dari garam). Masalah utamanya seringkali bukan MSG-nya, tapi makanan yang ditambahkan MSG biasanya rendah nutrisi.</p>', 'Tim Riset', 1, 'https://placehold.co/600x400/6B8E23/white?text=Fakta+MSG'),
('Protein Hewani vs Nabati: Mana Lebih Baik?', 'protein-hewani-vs-nabati', 'gizi', '<p>Protein hewani (daging, telur) adalah protein lengkap dengan semua asam amino esensial dan zat besi heme yang mudah diserap.</p><p>Protein nabati (tahu, tempe) kaya serat dan fitonutrien, serta rendah lemak jenuh. Kombinasi keduanya adalah yang terbaik untuk kesehatan jangka panjang.</p>', 'Tim LacakNutri', 1, 'https://placehold.co/600x400/A1D2D5/333?text=Protein'),
('5 Tips Diet Hipertensi (DASH Diet)', 'tips-diet-hipertensi', 'penyakit', '<p>Diet DASH terbukti menurunkan tekanan darah. Prinsipnya: 1) Batasi garam < 1 sdt/hari. 2) Perbanyak Kalium dari pisang dan kentang. 3) Hindari makanan kaleng dan daging olahan. 4) Pilih susu rendah lemak. 5) Perbanyak sayuran hijau.</p>', 'Kemenkes RI', 1, 'https://placehold.co/600x400/EF5350/white?text=Hipertensi'),
('Mengenal Lemak Trans: Musuh Jantung', 'mengenal-lemak-trans', 'gizi', '<p>Lemak trans terbentuk dari hidrogenasi minyak sayur (margarin keras). Ini meningkatkan kolesterol jahat (LDL) DAN menurunkan kolesterol baik (HDL).</p><p>Hindari produk dengan komposisi "Minyak Terhidrogenasi Parsial". Sering ada di krimer, biskuit murah, dan gorengan deep-fry.</p>', 'Tim LacakNutri', 1, 'https://placehold.co/600x400/333/white?text=Lemak+Trans'),
('Cara Memilih Camilan untuk Diabetes', 'camilan-diabetes', 'tips', '<p>Penderita diabetes tetap boleh ngemil. Kuncinya: Serat & Protein. Hindari camilan tepung murni.</p><p>Pilihan baik: Kacang almond (tanpa garam), Yoghurt plain, Apel dengan selai kacang, atau Telur rebus. Ini menjaga gula darah tetap stabil.</p>', 'Persadia', 1, 'https://placehold.co/600x400/FF9966/white?text=Diabetes+Snack'),
('Apa Itu Celiac Disease?', 'apa-itu-celiac', 'penyakit', '<p>Celiac bukan alergi, tapi penyakit autoimun. Saat penderita makan gluten (protein gandum), imun tubuh menyerang usus halus.</p><p>Gejala: Diare kronis, kembung, lelah. Solusi satu-satunya adalah menghindari gandum, rye, dan barley seumur hidup.</p>', 'Tim Medis', 1, 'https://placehold.co/600x400/A1D2D5/white?text=Celiac'),
('Zat Besi: Cegah Anemia pada Remaja', 'zat-besi-cegah-anemia', 'gizi', '<p>Remaja putri rentan anemia. Gejala 5L (Lemah, Letih, Lesu, Lelah, Lalai). Konsumsi hati ayam, daging merah, atau bayam.</p><p>Tip: Minum jus jeruk saat makan daging untuk meningkatkan penyerapan zat besi hingga 3x lipat. Hindari minum teh saat makan.</p>', 'Kemenkes', 1, 'https://placehold.co/600x400/EF5350/white?text=Cegah+Anemia'),
('Pewarna Makanan: Alami vs Sintetis', 'pewarna-alami-sintetis', 'aditif', '<p>Pewarna alami (kunyit, pandan, buah naga) aman dan sehat. Pewarna sintetis (Tartrazin, Karmoisin) harus dibatasi.</p><p>Studi Southampton menunjukkan kaitan pewarna sintetis tertentu dengan hiperaktivitas anak. Cek kode E pada label kemasan.</p>', 'Tim Riset', 1, 'https://placehold.co/600x400/FFC107/333?text=Pewarna');