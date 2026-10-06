-- Schema MySQL 8: he thong gioi thieu du lich va dat tour (README muc 58).
-- InnoDB + utf8mb4. Chay: mysql -u root -p < schema.sql
CREATE DATABASE IF NOT EXISTS tour_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tour_booking;

-- Vai tro: CUSTOMER / STAFF / ADMIN
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE,
  description VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  phone VARCHAR(20) NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  date_of_birth DATE NULL,
  gender ENUM('MALE','FEMALE','OTHER') NULL,
  address VARCHAR(255) NULL,
  avatar VARCHAR(500) NULL,
  role_id INT NOT NULL,
  status ENUM('ACTIVE','LOCKED') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id),
  INDEX idx_users_email (email),
  INDEX idx_users_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS destinations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  province VARCHAR(120) NULL,
  region VARCHAR(120) NULL,
  description TEXT NULL,
  highlights TEXT NULL,
  climate VARCHAR(255) NULL,
  best_time_to_visit VARCHAR(255) NULL,
  thumbnail VARCHAR(500) NULL,
  status ENUM('VISIBLE','HIDDEN') NOT NULL DEFAULT 'VISIBLE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_destinations_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attractions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  destination_id INT NOT NULL,
  name VARCHAR(180) NOT NULL,
  address VARCHAR(255) NULL,
  description TEXT NULL,
  opening_hours VARCHAR(255) NULL,
  ticket_price DECIMAL(12,0) NULL DEFAULT 0,
  recommended_duration VARCHAR(120) NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  thumbnail VARCHAR(500) NULL,
  status ENUM('VISIBLE','HIDDEN') NOT NULL DEFAULT 'VISIBLE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_attr_dest FOREIGN KEY (destination_id) REFERENCES destinations(id),
  INDEX idx_attr_dest (destination_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS article_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(255) NULL,
  status ENUM('VISIBLE','HIDDEN') NOT NULL DEFAULT 'VISIBLE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NULL,
  destination_id INT NULL,
  author_id INT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  thumbnail VARCHAR(500) NULL,
  content MEDIUMTEXT NULL,
  status ENUM('DRAFT','PUBLISHED','HIDDEN') NOT NULL DEFAULT 'DRAFT',
  published_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_art_cat FOREIGN KEY (category_id) REFERENCES article_categories(id),
  CONSTRAINT fk_art_dest FOREIGN KEY (destination_id) REFERENCES destinations(id),
  CONSTRAINT fk_art_author FOREIGN KEY (author_id) REFERENCES users(id),
  INDEX idx_articles_slug (slug),
  INDEX idx_articles_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tour_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(255) NULL,
  status ENUM('VISIBLE','HIDDEN') NOT NULL DEFAULT 'VISIBLE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NULL,
  code VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  departure_location VARCHAR(160) NULL,
  duration_days INT NOT NULL DEFAULT 1,
  duration_nights INT NOT NULL DEFAULT 0,
  transport VARCHAR(160) NULL,
  description TEXT NULL,
  adult_price DECIMAL(12,0) NOT NULL DEFAULT 0,
  child_price DECIMAL(12,0) NOT NULL DEFAULT 0,
  infant_price DECIMAL(12,0) NOT NULL DEFAULT 0,
  included_services TEXT NULL,
  excluded_services TEXT NULL,
  policy TEXT NULL,
  cancellation_policy TEXT NULL,
  minimum_guests INT NOT NULL DEFAULT 1,
  thumbnail VARCHAR(500) NULL,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('DRAFT','OPEN','PAUSED','CLOSED') NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tours_cat FOREIGN KEY (category_id) REFERENCES tour_categories(id),
  INDEX idx_tours_code (code),
  INDEX idx_tours_status (status),
  FULLTEXT INDEX ft_tours_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tour_destinations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tour_id INT NOT NULL,
  destination_id INT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_tour_dest (tour_id, destination_id),
  CONSTRAINT fk_td_tour FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
  CONSTRAINT fk_td_dest FOREIGN KEY (destination_id) REFERENCES destinations(id),
  INDEX idx_td_dest (destination_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tour_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tour_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_thumbnail TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_ti_tour FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
  INDEX idx_ti_tour (tour_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tour_itineraries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tour_id INT NOT NULL,
  day_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  start_time TIME NULL,
  end_time TIME NULL,
  meals VARCHAR(255) NULL,
  accommodation VARCHAR(255) NULL,
  note VARCHAR(500) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_it_tour FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
  INDEX idx_it_tour (tour_id, day_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Departure: gia snapshot theo dot khoi hanh (muc 75)
CREATE TABLE IF NOT EXISTS departures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tour_id INT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE NULL,
  capacity INT NOT NULL DEFAULT 30,
  held_seats INT NOT NULL DEFAULT 0,
  confirmed_seats INT NOT NULL DEFAULT 0,
  adult_price DECIMAL(12,0) NOT NULL DEFAULT 0,
  child_price DECIMAL(12,0) NOT NULL DEFAULT 0,
  infant_price DECIMAL(12,0) NOT NULL DEFAULT 0,
  minimum_guests INT NOT NULL DEFAULT 1,
  meeting_point VARCHAR(255) NULL,
  status ENUM('NOT_OPEN','OPEN','ALMOST_FULL','FULL','CLOSED','ONGOING','COMPLETED','CANCELLED') NOT NULL DEFAULT 'NOT_OPEN',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_dep_tour FOREIGN KEY (tour_id) REFERENCES tours(id),
  INDEX idx_dep_tour (tour_id),
  INDEX idx_dep_date (departure_date),
  INDEX idx_dep_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Booking: snapshot gia + booking_status / payment_status tach rieng (muc 24-25)
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_code VARCHAR(20) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  departure_id INT NOT NULL,
  contact_name VARCHAR(120) NOT NULL,
  contact_email VARCHAR(160) NULL,
  contact_phone VARCHAR(20) NOT NULL,
  contact_address VARCHAR(255) NULL,
  adult_count INT NOT NULL DEFAULT 1,
  child_count INT NOT NULL DEFAULT 0,
  infant_count INT NOT NULL DEFAULT 0,
  adult_price DECIMAL(12,0) NOT NULL DEFAULT 0,
  child_price DECIMAL(12,0) NOT NULL DEFAULT 0,
  infant_price DECIMAL(12,0) NOT NULL DEFAULT 0,
  subtotal DECIMAL(12,0) NOT NULL DEFAULT 0,
  surcharge DECIMAL(12,0) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,0) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,0) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(12,0) NOT NULL DEFAULT 0,
  remaining_amount DECIMAL(12,0) NOT NULL DEFAULT 0,
  booking_status ENUM('PENDING','DEPOSIT_PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','EXPIRED') NOT NULL DEFAULT 'PENDING',
  payment_status ENUM('UNPAID','PENDING','DEPOSITED','PARTIAL','PAID','FAILED','REFUNDED_PARTIAL','REFUNDED_FULL') NOT NULL DEFAULT 'UNPAID',
  promotion_id INT NULL,
  note TEXT NULL,
  hold_expires_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bk_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_bk_dep FOREIGN KEY (departure_id) REFERENCES departures(id),
  INDEX idx_bk_code (booking_code),
  INDEX idx_bk_user (user_id),
  INDEX idx_bk_dep (departure_id),
  INDEX idx_bk_status (booking_status),
  INDEX idx_bk_pay_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS booking_passengers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  date_of_birth DATE NULL,
  gender ENUM('MALE','FEMALE','OTHER') NULL,
  passenger_type ENUM('ADULT','CHILD','INFANT') NOT NULL DEFAULT 'ADULT',
  identity_number VARCHAR(30) NULL,
  passport_number VARCHAR(30) NULL,
  nationality VARCHAR(60) NULL,
  note VARCHAR(255) NULL,
  CONSTRAINT fk_bp_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_bp_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment 1-N (muc 31), transaction_code unique (BR18/BR39)
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  transaction_code VARCHAR(40) NOT NULL UNIQUE,
  provider_transaction_id VARCHAR(100) NULL,
  amount DECIMAL(12,0) NOT NULL,
  payment_method ENUM('CASH','BANK_TRANSFER','VNPAY','MOMO','EWALLET','ONLINE') NOT NULL DEFAULT 'BANK_TRANSFER',
  status ENUM('PENDING','SUCCESS','FAILED') NOT NULL DEFAULT 'PENDING',
  paid_at DATETIME NULL,
  content VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pay_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
  INDEX idx_pay_booking (booking_id),
  INDEX idx_pay_txn (transaction_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS promotions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  description TEXT NULL,
  discount_type ENUM('PERCENT','FIXED') NOT NULL DEFAULT 'PERCENT',
  discount_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  minimum_order_value DECIMAL(12,0) NOT NULL DEFAULT 0,
  maximum_discount DECIMAL(12,0) NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  usage_limit INT NULL,
  used_count INT NOT NULL DEFAULT 0,
  limit_per_user INT NOT NULL DEFAULT 1,
  applicable_tour_ids TEXT NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_promo_code (code),
  INDEX idx_promo_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS promotion_usages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  promotion_id INT NOT NULL,
  user_id INT NOT NULL,
  booking_id INT NULL,
  used_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pu_promo FOREIGN KEY (promotion_id) REFERENCES promotions(id),
  CONSTRAINT fk_pu_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_pu_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
  INDEX idx_pu_promo_user (promotion_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tour_id INT NOT NULL,
  booking_id INT NOT NULL UNIQUE,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT NULL,
  status ENUM('VISIBLE','HIDDEN') NOT NULL DEFAULT 'VISIBLE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_rev_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_rev_tour FOREIGN KEY (tour_id) REFERENCES tours(id),
  CONSTRAINT fk_rev_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
  INDEX idx_rev_tour (tour_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tour_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_fav (user_id, tour_id),
  CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_fav_tour FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refunds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  payment_id INT NULL,
  refund_code VARCHAR(40) NOT NULL UNIQUE,
  amount DECIMAL(12,0) NOT NULL,
  reason VARCHAR(255) NULL,
  status ENUM('PENDING','PROCESSING','SUCCESS','FAILED') NOT NULL DEFAULT 'PENDING',
  processed_by INT NULL,
  processed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ref_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
  CONSTRAINT fk_ref_pay FOREIGN KEY (payment_id) REFERENCES payments(id),
  INDEX idx_ref_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS support_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_code VARCHAR(20) NOT NULL UNIQUE,
  user_id INT NULL,
  booking_id INT NULL,
  contact_name VARCHAR(120) NOT NULL,
  contact_email VARCHAR(160) NULL,
  contact_phone VARCHAR(20) NULL,
  type ENUM('BOOKING','PAYMENT','TOUR_INFO','COMPLAINT','OTHER') NOT NULL DEFAULT 'OTHER',
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status ENUM('OPEN','IN_PROGRESS','RESOLVED','CLOSED') NOT NULL DEFAULT 'OPEN',
  priority ENUM('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'MEDIUM',
  assigned_to INT NULL,
  admin_reply TEXT NULL,
  resolved_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_st_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_st_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
  CONSTRAINT fk_st_assignee FOREIGN KEY (assigned_to) REFERENCES users(id),
  INDEX idx_st_code (ticket_code),
  INDEX idx_st_status (status),
  INDEX idx_st_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NULL,
  type VARCHAR(40) NOT NULL DEFAULT 'GENERAL',
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(60) NULL,
  entity_id INT NULL,
  old_value TEXT NULL,
  new_value TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_audit_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed demo mirror theo CSDL mau quanlydulich (tour/loaitour/diadiem/lichtrinh/lichkhoihanh/anhtour/tintuc/voucher/booking/...).
USE tour_booking;

INSERT IGNORE INTO roles (id, name, description) VALUES
  (1, 'CUSTOMER', 'Khach hang'),
  (2, 'STAFF', 'Nhan vien van hanh'),
  (3, 'ADMIN', 'Quan tri vien');

-- admin@gmail.com / Admin123! | staff@gmail.com / Staff123! | khach / Customer123!
INSERT IGNORE INTO users (id, full_name, email, phone, password_hash, role_id, status) VALUES
  (1, 'Administrator', 'admin@gmail.com', '0900000001', '$2a$10$O7Vknnrb0UHCpXcJCMVt1.X.LoCx7GYPMttIlcvAHlGAlp.HDgfVK', 3, 'ACTIVE'),
  (2, 'Nhan Vien Van Hanh', 'staff@gmail.com', '0900000002', '$2a$10$iYg/r.NktBka5pvwpiM5u.80qzUxWgJGGfipCRvLOdgCdAsjDpHHy', 2, 'ACTIVE'),
  (3, 'Nguyen Thi Lan', 'lan.nguyen@gmail.com', '0901000002', '$2a$10$.NtuE1Lrt9sBKJwM7z7VcOMcyHcnJiIYUySHYHSvCmZrGuaj72JXO', 1, 'ACTIVE'),
  (4, 'Tran Van Minh', 'minh.tran@gmail.com', '0901000003', '$2a$10$.NtuE1Lrt9sBKJwM7z7VcOMcyHcnJiIYUySHYHSvCmZrGuaj72JXO', 1, 'ACTIVE'),
  (5, 'Le Thu Ha', 'ha.le@gmail.com', '0901000004', '$2a$10$.NtuE1Lrt9sBKJwM7z7VcOMcyHcnJiIYUySHYHSvCmZrGuaj72JXO', 1, 'ACTIVE'),
  (6, 'Pham Duc Quang', 'quang.pham@gmail.com', '0901000005', '$2a$10$.NtuE1Lrt9sBKJwM7z7VcOMcyHcnJiIYUySHYHSvCmZrGuaj72JXO', 1, 'ACTIVE'),
  (7, 'Khach Hang Demo', 'customer@gmail.com', '0900000003', '$2a$10$.NtuE1Lrt9sBKJwM7z7VcOMcyHcnJiIYUySHYHSvCmZrGuaj72JXO', 1, 'ACTIVE');

-- Loai tour (mau: Nghi duong / Kham pha / Gia dinh / Cao cap / Quoc te)
INSERT IGNORE INTO tour_categories (id, name, description, status) VALUES
  (1, 'Nghi duong', 'Cac tour nghi duong bien, resort, thu gian.', 'VISIBLE'),
  (2, 'Kham pha', 'Cac tour thien ve trai nghiem va kham pha dia diem moi.', 'VISIBLE'),
  (3, 'Gia dinh', 'Cac tour phu hop cho gia dinh co tre nho.', 'VISIBLE'),
  (4, 'Cao cap', 'Cac tour chat luong cao, khach san va dich vu cao cap.', 'VISIBLE'),
  (5, 'Quoc te', 'Cac tour di nuoc ngoai.', 'VISIBLE');

-- Diem den (mau: Ha Noi / Da Nang / Phu Quoc / Nha Trang / Singapore)
INSERT IGNORE INTO destinations (id, name, province, region, description, climate, best_time_to_visit, thumbnail, status) VALUES
  (1, 'Ha Noi', 'Ha Noi', 'Mien Bac', 'Thu do cua Viet Nam.', 'Nhiet doi gio mua', 'Thang 9 - thang 11', '/images/tours/hanoi.jpg', 'VISIBLE'),
  (2, 'Da Nang', 'Da Nang', 'Mien Trung', 'Thanh pho bien noi tieng mien Trung.', 'Nhiet doi gio mua', 'Thang 3 - thang 9', '/images/tours/danang.jpg', 'VISIBLE'),
  (3, 'Phu Quoc', 'Kien Giang', 'Mien Nam', 'Dao ngoc noi tieng voi bien dep.', 'Nhiet doi gio mua', 'Thang 11 - thang 4', '/images/tours/phuquoc.jpg', 'VISIBLE'),
  (4, 'Nha Trang', 'Khanh Hoa', 'Mien Trung', 'Diem du lich bien hap dan.', 'Nhiet doi gio mua', 'Thang 1 - thang 8', '/images/tours/nhatrang.jpg', 'VISIBLE'),
  (5, 'Singapore', 'Singapore', 'Quoc te', 'Quoc dao hien dai va sach dep.', 'Nhiet doi am quanh nam', 'Quanh nam', '/images/tours/singapore.jpg', 'VISIBLE');

-- Dia diem tham quan
INSERT IGNORE INTO attractions (id, destination_id, name, address, description, opening_hours, ticket_price, status) VALUES
  (1, 2, 'Ba Na Hills', 'Hoa Ninh, Hoa Vang, Da Nang', 'Khu du lich noi tieng voi Cau Vang.', '7:00 - 22:00', 950000, 'VISIBLE'),
  (2, 2, 'Bien My Khe', 'Vo Nguyen Giap, Da Nang', 'Bai bien dep top the gioi.', 'Ca ngay', 0, 'VISIBLE'),
  (3, 4, 'VinWonders Nha Trang', 'Dao Hon Tre, Nha Trang', 'Cong vien giai tri bien dao.', '8:00 - 21:00', 800000, 'VISIBLE'),
  (4, 5, 'Marina Bay Sands', 'Marina Bay, Singapore', 'To hop nghi duong bieu tuong Singapore.', '9:00 - 22:00', 600000, 'VISIBLE'),
  (5, 1, 'Ho Guom', 'Hoan Kiem, Ha Noi', 'Ho nuoc lich su giua long thu do.', 'Ca ngay', 0, 'VISIBLE'),
  (6, 3, 'Bai Dai Phu Quoc', 'Phu Quoc, Kien Giang', 'Bai bien hoang so dep nhat dao ngoc.', 'Ca ngay', 0, 'VISIBLE');

INSERT IGNORE INTO article_categories (id, name, description, status) VALUES
  (1, 'Kinh nghiem du lich', 'Chia se kinh nghiem', 'VISIBLE'),
  (2, 'Cam nang', 'Cam nang diem den', 'VISIBLE');

-- Bai viet (mau: tintuc 5 bai)
INSERT IGNORE INTO articles (id, category_id, destination_id, author_id, title, slug, thumbnail, content, status, published_at) VALUES
  (1, 2, 2, 1, 'Khai truong tour he 2026', 'khai-truong-tour-he-2026', '/images/tours/danang.jpg', 'Nhieu tour moi voi gia uu dai dac biet danh cho khach hang dat som.', 'PUBLISHED', '2026-03-10 08:00:00'),
  (2, 2, NULL, 1, 'Uu dai dat tour som', 'uu-dai-dat-tour-som', '/images/tours/phuquoc.jpg', 'Khach hang dat tour truoc 30 ngay se nhan duoc nhieu uu dai.', 'PUBLISHED', '2026-03-12 09:00:00'),
  (3, 1, 3, 1, 'Kinh nghiem di Phu Quoc', 'kinh-nghiem-di-phu-quoc', '/images/tours/bien.jpg', 'Chuan bi do dung, lich trinh, thoi tiet va cac dia diem nen ghe.', 'PUBLISHED', '2026-03-14 10:00:00'),
  (4, 2, 5, 1, 'Luu y khi di Singapore', 'luu-y-khi-di-singapore', '/images/tours/singapore.jpg', 'Khach can chuan bi ho chieu va tuan thu quy dinh nhap canh Singapore.', 'PUBLISHED', '2026-03-16 11:00:00'),
  (5, 2, 4, 1, 'Top diem den mien Trung', 'top-diem-den-mien-trung', '/images/tours/nhatrang.jpg', 'Da Nang, Hoi An, Hue, Nha Trang la cac diem den noi bat.', 'PUBLISHED', '2026-03-18 14:00:00');

-- Tour (mau: TOUR001-005)
INSERT IGNORE INTO tours (id, category_id, code, name, departure_location, duration_days, duration_nights, transport, description, adult_price, child_price, infant_price, included_services, policy, minimum_guests, thumbnail, is_featured, status) VALUES
  (1, 2, 'TOUR001', 'Kham pha Da Nang 3N2D', 'Ha Noi', 3, 2, 'May bay', 'Tham quan Ba Na Hills, bien My Khe, cau Rong.', 3500000, 2500000, 500000, 'Ve may bay khu hoi, khach san, an theo chuong trinh, ve tham quan, HDV.', 'Mang theo giay to tuy than hop le.', 1, '/images/tours/danang.jpg', 1, 'OPEN'),
  (2, 1, 'TOUR002', 'Nghi duong Phu Quoc 4N3D', 'Ha Noi', 4, 3, 'May bay', 'Nghi duong tai resort, tham quan Sunset Town va Grand World.', 6200000, 4500000, 1000000, 'Ve may bay khu hoi, resort, an theo chuong trinh, ve tham quan, HDV.', 'Khong hoan huy sat ngay khoi hanh.', 1, '/images/tours/phuquoc.jpg', 1, 'OPEN'),
  (3, 3, 'TOUR003', 'Gia dinh Nha Trang 3N2D', 'Da Nang', 3, 2, 'Xe + May bay', 'Tham quan VinWonders, bien Tran Phu, cho dem.', 4200000, 2800000, 500000, 'Ve tham quan, khach san, an theo chuong trinh, HDV.', 'Tre em can co nguoi lon di cung.', 1, '/images/tours/nhatrang.jpg', 0, 'OPEN'),
  (4, 5, 'TOUR004', 'Singapore Cao Cap 5N4D', 'Ha Noi', 5, 4, 'May bay', 'Tham quan Marina Bay Sands, Sentosa, Garden by the Bay.', 12900000, 9000000, 1000000, 'Ve may bay khu hoi, khach san 5 sao, an theo chuong trinh, ve tham quan, HDV.', 'Yeu cau ho chieu con han it nhat 6 thang.', 1, '/images/tours/singapore.jpg', 1, 'OPEN'),
  (5, 2, 'TOUR005', 'Ha Noi City Tour 2N1D', 'Ha Noi', 2, 1, 'O to', 'Tham quan Ho Guom, Van Mieu, Lang Bac, pho co.', 1500000, 1000000, 0, 'Xe du lich, an theo chuong trinh, ve tham quan, HDV.', 'Trang phuc lich su khi vao khu di tich.', 1, '/images/tours/hanoi.jpg', 0, 'OPEN');

INSERT IGNORE INTO tour_destinations (tour_id, destination_id, sort_order) VALUES
  (1, 2, 1), (2, 3, 1), (3, 4, 1), (4, 5, 1), (5, 1, 1);

-- Album anh tour
INSERT IGNORE INTO tour_images (tour_id, image_url, sort_order, is_thumbnail) VALUES
  (1, '/images/tours/danang.jpg', 1, 1),
  (1, '/images/tours/hoian.jpg', 2, 0),
  (1, '/images/tours/bien.jpg', 3, 0),
  (2, '/images/tours/phuquoc.jpg', 1, 1),
  (2, '/images/tours/bien.jpg', 2, 0),
  (3, '/images/tours/nhatrang.jpg', 1, 1),
  (3, '/images/tours/bien.jpg', 2, 0),
  (4, '/images/tours/singapore.jpg', 1, 1),
  (5, '/images/tours/hanoi.jpg', 1, 1),
  (5, '/images/tours/banner.jpg', 2, 0);

-- Lich trinh kem thoi diem bat dau/ket thuc (mau: lichtrinh)
INSERT IGNORE INTO tour_itineraries (id, tour_id, day_number, title, description, start_time, end_time, meals, accommodation, sort_order) VALUES
  (1, 1, 1, 'Bay den Da Nang', 'Don khach tai san bay va nhan phong khach san.', '08:00:00', '11:30:00', 'Trua, Toi', 'Khach san Da Nang', 1),
  (2, 2, 1, 'Khoi hanh di Phu Quoc', 'Bay tu Ha Noi vao Phu Quoc, xe dua ve resort.', '07:00:00', '12:00:00', 'Trua, Toi', 'Resort Phu Quoc', 1),
  (3, 3, 1, 'Tham quan VinWonders', 'Khach tham quan va vui choi tai VinWonders.', '08:30:00', '10:30:00', 'Sang, Trua', 'Khach san Nha Trang', 1),
  (4, 4, 1, 'Den Singapore', 'Lam thu tuc nhap canh va ve khach san nghi ngoi.', '09:00:00', '14:00:00', 'Trua, Toi', 'Khach san 5 sao Singapore', 1),
  (5, 5, 1, 'Tham quan trung tam Ha Noi', 'Tham quan Ho Guom, Van Mieu va pho co.', '08:00:00', '17:00:00', 'Sang, Trua', NULL, 1);

-- Lich khoi hanh (mau: DOT001-005, ngay day ve tuong lai de demo dat tour)
INSERT IGNORE INTO departures (id, tour_id, departure_date, return_date, capacity, held_seats, confirmed_seats, adult_price, child_price, infant_price, minimum_guests, meeting_point, status) VALUES
  (1, 1, DATE_ADD(CURDATE(), INTERVAL 30 DAY), DATE_ADD(CURDATE(), INTERVAL 32 DAY), 30, 0, 3, 3500000, 2500000, 500000, 1, 'San bay Noi Bai', 'OPEN'),
  (2, 2, DATE_ADD(CURDATE(), INTERVAL 45 DAY), DATE_ADD(CURDATE(), INTERVAL 48 DAY), 25, 3, 0, 6200000, 4500000, 1000000, 1, 'San bay Noi Bai', 'OPEN'),
  (3, 3, DATE_ADD(CURDATE(), INTERVAL 60 DAY), DATE_ADD(CURDATE(), INTERVAL 62 DAY), 35, 2, 0, 4200000, 2800000, 500000, 1, 'San bay Da Nang', 'OPEN'),
  (4, 4, DATE_ADD(CURDATE(), INTERVAL 75 DAY), DATE_ADD(CURDATE(), INTERVAL 79 DAY), 20, 0, 0, 12900000, 9000000, 1000000, 1, 'San bay Noi Bai', 'OPEN'),
  (5, 5, DATE_ADD(CURDATE(), INTERVAL 20 DAY), DATE_ADD(CURDATE(), INTERVAL 21 DAY), 40, 0, 3, 1500000, 1000000, 0, 1, 'Nha hat lon Ha Noi', 'OPEN');

-- Khuyen mai (mau: SALE10 / PQ500 / NT15 / SG1000 / HN5)
INSERT IGNORE INTO promotions (code, name, description, discount_type, discount_value, minimum_order_value, maximum_discount, start_date, end_date, usage_limit, used_count, limit_per_user, applicable_tour_ids, status) VALUES
  ('SALE10', 'Giam 10% toan he thong', 'Ap dung toan he thong.', 'PERCENT', 10, 2000000, 500000, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 300 DAY), 100, 5, 1, NULL, 'ACTIVE'),
  ('PQ500', 'Giam 500K tour Phu Quoc', 'Ap dung rieng tour Phu Quoc.', 'FIXED', 500000, 5000000, NULL, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 200 DAY), 50, 3, 1, '[2]', 'ACTIVE'),
  ('NT15', 'Giam 15% tour Nha Trang', 'Ap dung tour Nha Trang.', 'PERCENT', 15, 3000000, 800000, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 150 DAY), 40, 2, 1, '[3]', 'ACTIVE'),
  ('SG1000', 'Giam 1 trieu tour Singapore', 'Ap dung tour Singapore.', 'FIXED', 1000000, 10000000, NULL, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 250 DAY), 20, 1, 1, '[4]', 'ACTIVE'),
  ('HN5', 'Giam 5% Ha Noi City Tour', 'Ap dung city tour Ha Noi.', 'PERCENT', 5, 1000000, 200000, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 100 DAY), 80, 4, 1, '[5]', 'ACTIVE');

-- Booking (mau: BK001-005)
INSERT IGNORE INTO bookings (id, booking_code, user_id, departure_id, contact_name, contact_email, contact_phone, contact_address, adult_count, child_count, infant_count, adult_price, child_price, infant_price, subtotal, surcharge, discount_amount, total_amount, paid_amount, remaining_amount, booking_status, payment_status, promotion_id, note) VALUES
  (1, 'BK001', 3, 1, 'Nguyen Thi Lan', 'lan.nguyen@gmail.com', '0901000002', 'Cau Giay, Ha Noi', 2, 1, 0, 3500000, 2500000, 500000, 9500000, 0, 500000, 9000000, 9000000, 0, 'CONFIRMED', 'PAID', 1, NULL),
  (2, 'BK002', 4, 2, 'Tran Van Minh', 'minh.tran@gmail.com', '0901000003', 'Hai Chau, Da Nang', 2, 0, 1, 6200000, 4500000, 1000000, 13500000, 0, 500000, 13000000, 4000000, 9000000, 'DEPOSIT_PENDING', 'PARTIAL', 2, NULL),
  (3, 'BK003', 5, 3, 'Le Thu Ha', 'ha.le@gmail.com', '0901000004', 'Nha Trang, Khanh Hoa', 1, 1, 0, 4200000, 2800000, 500000, 7000000, 0, 1050000, 5950000, 0, 5950000, 'PENDING', 'UNPAID', 3, NULL),
  (4, 'BK004', 6, 4, 'Pham Duc Quang', 'quang.pham@gmail.com', '0901000005', 'Thu Duc, TP.HCM', 1, 0, 0, 12900000, 9000000, 1000000, 12900000, 0, 1000000, 11900000, 3000000, 8900000, 'CANCELLED', 'REFUNDED_PARTIAL', 4, 'Booking bi huy, da hoan tien coc sau tru phi.'),
  (5, 'BK005', 3, 5, 'Nguyen Thi Lan', 'lan.nguyen@gmail.com', '0901000002', 'Cau Giay, Ha Noi', 3, 0, 0, 1500000, 1000000, 0, 4500000, 0, 225000, 4275000, 4275000, 0, 'COMPLETED', 'PAID', 5, NULL);

-- Hanh khach (mau: hanhkhach)
INSERT IGNORE INTO booking_passengers (booking_id, full_name, date_of_birth, gender, passenger_type, identity_number, nationality, note) VALUES
  (1, 'Nguyen Thi Lan', '1995-05-10', 'FEMALE', 'ADULT', '012345678901', 'Viet Nam', 'Truong doan booking BK001'),
  (2, 'Tran Van Minh', '1990-07-18', 'MALE', 'ADULT', '012345678902', 'Viet Nam', 'Khach chinh booking BK002'),
  (3, 'Le Thu Ha', '1993-11-21', 'FEMALE', 'ADULT', '012345678903', 'Viet Nam', 'Khach chinh booking BK003'),
  (4, 'Pham Duc Quang', '1988-03-15', 'MALE', 'ADULT', '012345678904', 'Viet Nam', 'Khach chinh booking BK004'),
  (5, 'Nguyen Thi Lan', '1995-05-10', 'FEMALE', 'ADULT', '012345678905', 'Viet Nam', 'Khach chinh booking BK005');

-- Thanh toan (mau: thanhtoan NB001-005)
INSERT IGNORE INTO payments (booking_id, transaction_code, provider_transaction_id, amount, payment_method, status, paid_at, content) VALUES
  (1, 'NB001', 'VCB001', 9000000, 'BANK_TRANSFER', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 20 DAY), 'Thanh toan du booking BK001.'),
  (2, 'NB002', 'VNP002', 4000000, 'VNPAY', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 19 DAY), 'Dat coc booking BK002.'),
  (3, 'NB003', 'MOMO003', 5950000, 'MOMO', 'FAILED', DATE_SUB(NOW(), INTERVAL 18 DAY), 'Thanh toan that bai cho booking BK003.'),
  (4, 'NB004', 'VNP004', 3000000, 'VNPAY', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 18 DAY), 'Coc booking BK004 (da hoan sau nay).'),
  (5, 'NB005', 'CASH005', 4275000, 'CASH', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 17 DAY), 'Khach thanh toan tien mat booking BK005.');

-- Hoan tien (mau: huybooking da xu ly)
INSERT IGNORE INTO refunds (booking_id, payment_id, refund_code, amount, reason, status, processed_by, processed_at) VALUES
  (4, 4, 'RF000004', 2500000, 'Khach khong the tham gia tour quoc te.', 'SUCCESS', 1, DATE_SUB(NOW(), INTERVAL 17 DAY)),
  (2, 2, 'RF000002', 3500000, 'Khach ban viec dot xuat.', 'PENDING', NULL, NULL);

-- Danh gia (mau: danhgiatour)
INSERT IGNORE INTO reviews (user_id, tour_id, booking_id, rating, content, status) VALUES
  (3, 1, 1, 5, 'Tour Da Nang rat tuyet, huong dan vien nhiet tinh.', 'VISIBLE'),
  (4, 2, 2, 4, 'Resort dep, lich trinh hop ly.', 'VISIBLE'),
  (5, 3, 3, 5, 'Phu hop cho gia dinh co tre nho.', 'VISIBLE'),
  (6, 4, 4, 3, 'Tour on nhung thu tuc hoi lau.', 'HIDDEN'),
  (3, 5, 5, 5, 'City tour Ha Noi rat dang trai nghiem.', 'VISIBLE');

-- Yeu thich mau
INSERT IGNORE INTO favorites (user_id, tour_id) VALUES (3, 1), (3, 2), (4, 2);

-- Ho tro khach hang (mau: hotrokhachhang HT001-004)
INSERT IGNORE INTO support_tickets (ticket_code, user_id, booking_id, contact_name, contact_email, contact_phone, type, title, content, status, priority, assigned_to, admin_reply, resolved_at) VALUES
  ('HT001', 3, 1, 'Nguyen Thi Lan', 'lan.nguyen@gmail.com', '0901000002', 'BOOKING', 'Can xuat hoa don VAT', 'Toi muon xuat hoa don VAT cho booking BK001.', 'RESOLVED', 'MEDIUM', 1, 'Da gui hoa don qua email cho khach.', DATE_SUB(NOW(), INTERVAL 20 DAY)),
  ('HT002', 4, 2, 'Tran Van Minh', 'minh.tran@gmail.com', '0901000003', 'PAYMENT', 'Kiem tra thanh toan coc', 'Toi da thanh toan coc nhung chua thay cap nhat.', 'RESOLVED', 'HIGH', 1, 'He thong da cap nhat thanh toan coc thanh cong.', DATE_SUB(NOW(), INTERVAL 19 DAY)),
  ('HT003', 5, 3, 'Le Thu Ha', 'ha.le@gmail.com', '0901000004', 'TOUR_INFO', 'Tu van tour cho gia dinh', 'Toi muon duoc tu van tour phu hop cho gia dinh 4 nguoi.', 'OPEN', 'MEDIUM', 1, NULL, NULL),
  ('HT004', 6, 4, 'Pham Duc Quang', 'quang.pham@gmail.com', '0901000005', 'COMPLAINT', 'Yeu cau ho tro hoan tien', 'Toi muon hoi ve tien do hoan tien booking BK004.', 'RESOLVED', 'HIGH', 1, 'Chung toi da hoan tien theo chinh sach.', DATE_SUB(NOW(), INTERVAL 17 DAY));

-- Thong bao mau
INSERT IGNORE INTO notifications (user_id, title, content, type, is_read) VALUES
  (3, 'Dat tour thanh cong', 'Booking BK001 da duoc xac nhan.', 'BOOKING', 1),
  (3, 'Thanh toan thanh cong', 'Booking BK001 da nhan 9.000.000d.', 'PAYMENT', 1),
  (4, 'Dat coc thanh cong', 'Booking BK002 da nhan coc 4.000.000d.', 'PAYMENT', 0),
  (5, 'Thanh toan that bai', 'Giao dich MoMo cho BK003 that bai, vui long thu lai.', 'PAYMENT', 0),
  (6, 'Hoan tien thanh cong', 'Booking BK004 da duoc hoan 2.500.000d.', 'REFUND', 0);
