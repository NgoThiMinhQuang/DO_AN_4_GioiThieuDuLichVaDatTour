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
