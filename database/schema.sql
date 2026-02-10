-- ============================================
-- BerbagiPath Crowdfunding Database Schema
-- Database: db_tolongmenolong
-- ============================================

-- Create database (run this first if database doesn't exist)
CREATE DATABASE IF NOT EXISTS db_tolongmenolong
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE db_tolongmenolong;

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(100),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: campaigns
-- ============================================
CREATE TABLE IF NOT EXISTS campaigns (
  id VARCHAR(36) PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  story LONGTEXT,
  category_id VARCHAR(36),
  organizer_id VARCHAR(36),
  image_url VARCHAR(500),
  target_amount DECIMAL(15, 2) NOT NULL,
  current_amount DECIMAL(15, 2) DEFAULT 0,
  donor_count INT DEFAULT 0,
  start_date DATE,
  end_date DATE,
  days_left INT GENERATED ALWAYS AS (DATEDIFF(end_date, CURDATE())) STORED,
  is_verified BOOLEAN DEFAULT FALSE,
  is_urgent BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  status ENUM('draft', 'pending', 'active', 'completed', 'cancelled') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_campaigns_slug (slug),
  INDEX idx_campaigns_category (category_id),
  INDEX idx_campaigns_status (status),
  INDEX idx_campaigns_urgent (is_urgent),
  INDEX idx_campaigns_end_date (end_date),
  FULLTEXT INDEX idx_campaigns_search (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: donations
-- ============================================
CREATE TABLE IF NOT EXISTS donations (
  id VARCHAR(36) PRIMARY KEY,
  campaign_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36),
  donor_name VARCHAR(255) NOT NULL,
  donor_email VARCHAR(255),
  donor_phone VARCHAR(20),
  amount DECIMAL(15, 2) NOT NULL,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  status ENUM('pending', 'paid', 'failed', 'expired', 'refunded') DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_channel VARCHAR(50),
  xendit_payment_id VARCHAR(100),
  xendit_invoice_id VARCHAR(100),
  xendit_external_id VARCHAR(100),
  payment_code VARCHAR(100),
  payment_url VARCHAR(500),
  paid_at TIMESTAMP NULL,
  expired_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_donations_campaign (campaign_id),
  INDEX idx_donations_user (user_id),
  INDEX idx_donations_status (status),
  INDEX idx_donations_xendit (xendit_payment_id),
  INDEX idx_donations_external (xendit_external_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: campaign_updates
-- ============================================
CREATE TABLE IF NOT EXISTS campaign_updates (
  id VARCHAR(36) PRIMARY KEY,
  campaign_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT NOT NULL,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  INDEX idx_updates_campaign (campaign_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: notifications
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('donation', 'update', 'thankyou', 'promo', 'system') DEFAULT 'system',
  title VARCHAR(255) NOT NULL,
  message TEXT,
  reference_id VARCHAR(36),
  reference_type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_read (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: webhook_logs
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_logs (
  id VARCHAR(36) PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  payload JSON,
  headers JSON,
  status ENUM('received', 'processed', 'failed') DEFAULT 'received',
  error_message TEXT,
  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_webhook_event (event_type),
  INDEX idx_webhook_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: processed_webhooks (for idempotency)
-- ============================================
CREATE TABLE IF NOT EXISTS processed_webhooks (
  payment_id VARCHAR(100) PRIMARY KEY,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_processed_date (processed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Insert Default Categories
-- ============================================
INSERT INTO categories (id, slug, name, icon, color, sort_order) VALUES
  (UUID(), 'medical', 'Kesehatan', 'Heart', 'bg-red-100 text-red-600', 1),
  (UUID(), 'education', 'Pendidikan', 'GraduationCap', 'bg-blue-100 text-blue-600', 2),
  (UUID(), 'zakat', 'Zakat', 'HandHeart', 'bg-emerald-100 text-emerald-600', 3),
  (UUID(), 'disaster', 'Bencana Alam', 'Home', 'bg-orange-100 text-orange-600', 4),
  (UUID(), 'social', 'Sosial', 'Users', 'bg-purple-100 text-purple-600', 5),
  (UUID(), 'environment', 'Lingkungan', 'TreePine', 'bg-green-100 text-green-600', 6),
  (UUID(), 'animal', 'Hewan', 'PawPrint', 'bg-yellow-100 text-yellow-600', 7),
  (UUID(), 'infrastructure', 'Infrastruktur', 'Building2', 'bg-gray-100 text-gray-600', 8)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ============================================
-- Sample Data: Users
-- ============================================
INSERT INTO users (id, email, name, phone, is_verified) VALUES
  ('user-001', 'yayasan.cahaya@email.com', 'Yayasan Cahaya Harapan', '08123456789', TRUE),
  ('user-002', 'keluarga.raffa@email.com', 'Keluarga Raffa', '08234567890', TRUE),
  ('user-003', 'relawan.peduli@email.com', 'Tim Relawan Peduli', '08345678901', TRUE),
  ('user-004', 'dkm.sukamaju@email.com', 'DKM Desa Suka Maju', '08456789012', TRUE),
  ('user-005', 'beasiswa.id@email.com', 'Yayasan Beasiswa Indonesia', '08567890123', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ============================================
-- Sample Data: Campaigns
-- ============================================
INSERT INTO campaigns (id, slug, title, description, story, category_id, organizer_id, image_url, target_amount, current_amount, donor_count, start_date, end_date, is_verified, is_urgent, status) VALUES
(
  'campaign-001',
  'bantu-anak-yatim-pendidikan',
  'Bantu Anak Yatim Mendapat Pendidikan Layak',
  'Mari bersama-sama membantu anak-anak yatim untuk mendapatkan pendidikan yang layak. Dana yang terkumpul akan digunakan untuk biaya sekolah, buku, dan perlengkapan belajar.',
  '<p>Assalamualaikum warahmatullahi wabarakatuh,</p><p>Perkenalkan, saya Ahmad dari Yayasan Cahaya Harapan. Kami mengelola panti asuhan yang saat ini menampung 45 anak yatim piatu dari berbagai latar belakang.</p><p>Anak-anak ini memiliki semangat belajar yang tinggi, namun keterbatasan biaya membuat mereka kesulitan untuk melanjutkan pendidikan.</p><p><strong>Dana yang terkumpul akan digunakan untuk:</strong></p><ul><li>Biaya pendidikan selama 1 tahun</li><li>Buku pelajaran dan alat tulis</li><li>Seragam sekolah</li><li>Les tambahan</li></ul>',
  (SELECT id FROM categories WHERE slug = 'education' LIMIT 1),
  'user-001',
  'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&auto=format&fit=crop',
  150000000,
  87500000,
  342,
  CURDATE(),
  DATE_ADD(CURDATE(), INTERVAL 23 DAY),
  TRUE,
  TRUE,
  'active'
),
(
  'campaign-002',
  'operasi-jantung-bayi-raffa',
  'Operasi Jantung untuk Bayi Raffa',
  'Bayi Raffa membutuhkan operasi jantung segera. Mari bantu keluarga ini untuk mendapatkan pengobatan yang layak.',
  '<p>Halo para dermawan,</p><p>Bayi Raffa (8 bulan) didiagnosis mengalami kelainan jantung bawaan sejak lahir. Dokter menyarankan untuk segera dilakukan operasi.</p><p>Keluarga Raffa adalah keluarga sederhana. Ayahnya bekerja sebagai buruh harian dengan penghasilan tidak menentu.</p><p>Biaya operasi yang dibutuhkan sangat besar dan tidak mampu ditanggung sendiri oleh keluarga.</p>',
  (SELECT id FROM categories WHERE slug = 'medical' LIMIT 1),
  'user-002',
  'https://images.unsplash.com/photo-1620841713108-18ad2b52d15c?w=800&auto=format&fit=crop',
  250000000,
  198750000,
  1203,
  CURDATE(),
  DATE_ADD(CURDATE(), INTERVAL 7 DAY),
  TRUE,
  TRUE,
  'active'
),
(
  'campaign-003',
  'bantuan-korban-banjir-kalimantan',
  'Bantuan Korban Banjir Kalimantan',
  'Ribuan warga terdampak banjir di Kalimantan Selatan membutuhkan bantuan mendesak berupa makanan, pakaian, dan obat-obatan.',
  '<p>Banjir besar melanda wilayah Kalimantan Selatan sejak minggu lalu. Ribuan rumah terendam dan warga harus mengungsi.</p><p>Bantuan yang dibutuhkan:</p><ul><li>Makanan siap saji dan air bersih</li><li>Pakaian dan selimut</li><li>Obat-obatan</li><li>Perlengkapan bayi</li></ul>',
  (SELECT id FROM categories WHERE slug = 'disaster' LIMIT 1),
  'user-003',
  'https://images.unsplash.com/photo-1728320771441-17a19df0fe4c?w=800&auto=format&fit=crop',
  500000000,
  325000000,
  2891,
  CURDATE(),
  DATE_ADD(CURDATE(), INTERVAL 14 DAY),
  TRUE,
  TRUE,
  'active'
),
(
  'campaign-004',
  'pembangunan-masjid-desa',
  'Pembangunan Masjid Desa Terpencil',
  'Warga desa terpencil di Sulawesi membutuhkan masjid sebagai pusat ibadah dan kegiatan sosial.',
  '<p>Desa Suka Maju di pedalaman Sulawesi belum memiliki masjid yang layak. Warga selama ini beribadah di mushola kecil yang sudah tidak mampu menampung jamaah.</p>',
  (SELECT id FROM categories WHERE slug = 'zakat' LIMIT 1),
  'user-004',
  'https://images.unsplash.com/photo-1591197172062-c718f82aba20?w=800&auto=format&fit=crop',
  300000000,
  156000000,
  567,
  CURDATE(),
  DATE_ADD(CURDATE(), INTERVAL 45 DAY),
  TRUE,
  FALSE,
  'active'
),
(
  'campaign-005',
  'beasiswa-mahasiswa-kurang-mampu',
  'Beasiswa untuk Mahasiswa Kurang Mampu',
  'Program beasiswa untuk membantu mahasiswa berprestasi dari keluarga kurang mampu menyelesaikan pendidikan.',
  '<p>Banyak mahasiswa berprestasi yang terpaksa putus kuliah karena keterbatasan biaya. Program ini bertujuan membantu mereka melanjutkan pendidikan.</p>',
  (SELECT id FROM categories WHERE slug = 'education' LIMIT 1),
  'user-005',
  'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=800&auto=format&fit=crop',
  200000000,
  45000000,
  189,
  CURDATE(),
  DATE_ADD(CURDATE(), INTERVAL 60 DAY),
  TRUE,
  FALSE,
  'active'
)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ============================================
-- Useful Views
-- ============================================

-- View: Campaign Summary with Category
CREATE OR REPLACE VIEW v_campaign_summary AS
SELECT 
  c.id,
  c.slug,
  c.title,
  c.description,
  c.image_url,
  c.target_amount,
  c.current_amount,
  c.donor_count,
  c.days_left,
  c.is_verified,
  c.is_urgent,
  c.status,
  ROUND((c.current_amount / c.target_amount) * 100, 1) AS progress_percentage,
  cat.name AS category_name,
  cat.slug AS category_slug,
  u.name AS organizer_name,
  u.is_verified AS organizer_verified,
  c.created_at
FROM campaigns c
LEFT JOIN categories cat ON c.category_id = cat.id
LEFT JOIN users u ON c.organizer_id = u.id
WHERE c.is_active = TRUE;

-- View: Recent Donations
CREATE OR REPLACE VIEW v_recent_donations AS
SELECT 
  d.id,
  d.campaign_id,
  c.title AS campaign_title,
  d.donor_name,
  d.amount,
  d.message,
  d.is_anonymous,
  d.status,
  d.created_at,
  TIMESTAMPDIFF(MINUTE, d.created_at, NOW()) AS minutes_ago
FROM donations d
JOIN campaigns c ON d.campaign_id = c.id
WHERE d.status = 'paid'
ORDER BY d.created_at DESC;

-- ============================================
-- Stored Procedures
-- ============================================

-- Procedure: Update campaign amount after donation
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_update_campaign_amount(
  IN p_campaign_id VARCHAR(36),
  IN p_amount DECIMAL(15, 2)
)
BEGIN
  UPDATE campaigns
  SET 
    current_amount = current_amount + p_amount,
    donor_count = donor_count + 1,
    updated_at = NOW()
  WHERE id = p_campaign_id;
END //
DELIMITER ;

-- Procedure: Process successful payment
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_process_payment(
  IN p_donation_id VARCHAR(36),
  IN p_xendit_payment_id VARCHAR(100)
)
BEGIN
  DECLARE v_campaign_id VARCHAR(36);
  DECLARE v_amount DECIMAL(15, 2);
  
  -- Get donation details
  SELECT campaign_id, amount INTO v_campaign_id, v_amount
  FROM donations
  WHERE id = p_donation_id;
  
  -- Update donation status
  UPDATE donations
  SET 
    status = 'paid',
    xendit_payment_id = p_xendit_payment_id,
    paid_at = NOW(),
    updated_at = NOW()
  WHERE id = p_donation_id;
  
  -- Update campaign amount
  CALL sp_update_campaign_amount(v_campaign_id, v_amount);
END //
DELIMITER ;

-- ============================================
-- Indexes for Performance
-- ============================================

-- Additional composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_campaigns_active_urgent 
  ON campaigns(is_active, is_urgent, status);

CREATE INDEX IF NOT EXISTS idx_donations_campaign_status 
  ON donations(campaign_id, status, created_at);

-- ============================================
-- Triggers
-- ============================================

-- Trigger: Auto-complete campaign when target reached
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_check_campaign_target
AFTER UPDATE ON campaigns
FOR EACH ROW
BEGIN
  IF NEW.current_amount >= NEW.target_amount AND NEW.status = 'active' THEN
    UPDATE campaigns SET status = 'completed' WHERE id = NEW.id;
  END IF;
END //
DELIMITER ;

-- ============================================
-- Cleanup: Remove old processed webhooks (run periodically)
-- ============================================
-- DELETE FROM processed_webhooks WHERE processed_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
