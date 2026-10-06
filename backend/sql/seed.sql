-- Seed demo. Chay sau schema.sql: mysql -u root -p tour_booking < seed.sql
USE tour_booking;

INSERT IGNORE INTO roles (id, name, description) VALUES
  (1, 'CUSTOMER', 'Khach hang'),
  (2, 'STAFF', 'Nhan vien van hanh'),
  (3, 'ADMIN', 'Quan tri vien');

-- admin@gmail.com / Admin123! (bcrypt cua "Admin123!")
-- staff@gmail.com / Staff123! (STAFF van hanh) | customer@gmail.com / Customer123! (khach demo)
INSERT IGNORE INTO users (id, full_name, email, phone, password_hash, role_id, status) VALUES
  (1, 'Administrator', 'admin@gmail.com', '0900000001', '$2a$10$O7Vknnrb0UHCpXcJCMVt1.X.LoCx7GYPMttIlcvAHlGAlp.HDgfVK', 3, 'ACTIVE'),
  (2, 'Nhan Vien Van Hanh', 'staff@gmail.com', '0900000002', '$2a$10$iYg/r.NktBka5pvwpiM5u.80qzUxWgJGGfipCRvLOdgCdAsjDpHHy', 2, 'ACTIVE'),
  (3, 'Khach Hang Demo', 'customer@gmail.com', '0900000003', '$2a$10$.NtuE1Lrt9sBKJwM7z7VcOMcyHcnJiIYUySHYHSvCmZrGuaj72JXO', 1, 'ACTIVE');

INSERT IGNORE INTO destinations (id, name, province, region, description, climate, best_time_to_visit, thumbnail, status) VALUES
  (1, 'Da Nang', 'Da Nang', 'Mien Trung', 'Thanh pho bien nang dong voi Ba Na Hills, bien My Khe, cau Rong.', 'Nhiet doi gio mua', 'Thang 3 - thang 9', '/images/tours/danang.jpg', 'VISIBLE'),
  (2, 'Hoi An', 'Quang Nam', 'Mien Trung', 'Pho co Hoi An di san UNESCO voi den long va kien truc co.', 'Nhiet doi gio mua', 'Thang 2 - thang 8', '/images/tours/hoian.jpg', 'VISIBLE'),
  (3, 'Da Lat', 'Lam Dong', 'Tay Nguyen', 'Thanh pho ngan hoa, khi hau mat me quanh nam.', 'On doi mat me', 'Quanh nam', '/images/tours/dalat.jpg', 'VISIBLE');

INSERT IGNORE INTO attractions (destination_id, name, address, description, status) VALUES
  (1, 'Ba Na Hills', 'Hoa Ninh, Hoa Vang, Da Nang', 'Khu du lich noi tieng voi Cau Vang va lang Phap.', 'VISIBLE'),
  (1, 'Bien My Khe', 'Vo Nguyen Giap, Da Nang', 'Bai bien dep top the gioi.', 'VISIBLE'),
  (2, 'Pho co Hoi An', 'Hoi An, Quang Nam', 'Pho co voi den long ruc ro ve dem.', 'VISIBLE'),
  (3, 'Ho Xuan Huong', 'Trung tam Da Lat', 'Ho nuoc bieu tuong cua Da Lat.', 'VISIBLE');

INSERT IGNORE INTO article_categories (id, name, description, status) VALUES
  (1, 'Kinh nghiem du lich', 'Chia se kinh nghiem', 'VISIBLE'),
  (2, 'Cam nang', 'Cam nang diem den', 'VISIBLE');

INSERT IGNORE INTO articles (category_id, destination_id, author_id, title, slug, thumbnail, content, status, published_at) VALUES
  (1, 1, 1, 'Kinh nghiem du lich Da Nang 3N2D', 'kinh-nghiem-du-lich-da-nang-3n2d', '/images/tours/danang.jpg', 'Lich trinh goi y: Ngay 1 Son Tra - My Khe, Ngay 2 Ba Na Hills - Hoi An, Ngay 3 Ngu Hanh Son - mua sam.', 'PUBLISHED', NOW()),
  (2, 3, 1, 'Cam nang Da Lat cho nguoi moi', 'cam-nang-da-lat', '/images/tours/dalat.jpg', 'Thoi tiet se lanh buoi sang toi, nen mang ao am. Cac diem nen di: Ho Xuan Huong, Langbiang, Thung lung Tinh Yeu.', 'PUBLISHED', NOW());

INSERT IGNORE INTO tour_categories (id, name, description, status) VALUES
  (1, 'Tour bien', 'Tour kham pha bien dao', 'VISIBLE'),
  (2, 'Tour nghi duong', 'Tour nghi duong cao cap', 'VISIBLE');

INSERT IGNORE INTO tours (id, category_id, code, name, departure_location, duration_days, duration_nights, transport, description, adult_price, child_price, infant_price, included_services, minimum_guests, thumbnail, status) VALUES
  (1, 1, 'TOUR-DN-HA-3N2D', 'Da Nang - Hoi An 3N2D', 'Ha Noi', 3, 2, 'May bay + Oto', 'Kham pha Da Nang - Hoi An: Ba Na Hills, pho co, bien My Khe.', 5000000, 3500000, 1000000, 'Ve may bay khu hoi, khach san 4 sao, an theo chuong trinh, ve tham quan, HDV.', 10, '/images/tours/danang.jpg', 'OPEN'),
  (2, 2, 'TOUR-DL-4N3D', 'Da Lat nghi duong 4N3D', 'TP. Ho Chi Minh', 4, 3, 'Oto', 'Nghi duong Da Lat: ho Xuan Huong, Langbiang, thung lung hoa.', 4500000, 3000000, 800000, 'Xe du lich, khach san 4 sao, an theo chuong trinh, ve tham quan, HDV.', 10, '/images/tours/dalat.jpg', 'OPEN');

INSERT IGNORE INTO tour_images (tour_id, image_url, sort_order, is_thumbnail) VALUES
  (1, '/images/tours/danang.jpg', 1, 1),
  (1, '/images/tours/hoian.jpg', 2, 0),
  (1, '/images/tours/bien.jpg', 3, 0),
  (2, '/images/tours/dalat.jpg', 1, 1),
  (2, '/images/tours/phuquoc.jpg', 2, 0);

INSERT IGNORE INTO tour_destinations (tour_id, destination_id, sort_order) VALUES
  (1, 1, 1), (1, 2, 2), (2, 3, 1);

INSERT IGNORE INTO tour_itineraries (tour_id, day_number, title, description, meals, accommodation, sort_order) VALUES
  (1, 1, 'Ngay 1: Den Da Nang - Son Tra', 'Don khach, tham quan ban dao Son Tra, tam bien My Khe.', 'Trua, Toi', 'Khach san 4 sao Da Nang', 1),
  (1, 2, 'Ngay 2: Ba Na Hills - Hoi An', 'Cap treo Ba Na, Cau Vang, chieu di pho co Hoi An.', 'Sang, Trua, Toi', 'Khach san 4 sao Da Nang', 2),
  (1, 3, 'Ngay 3: Ngu Hanh Son - Ve', 'Ngu Hanh Son, mua sam dac san, tien san bay.', 'Sang, Trua', NULL, 3),
  (2, 1, 'Ngay 1: TP.HCM - Da Lat', 'Khoi hanh di Da Lat, nhan phong, dao ho Xuan Huong.', 'Trua, Toi', 'Khach san 4 sao Da Lat', 1),
  (2, 2, 'Ngay 2: Langbiang - Thung lung hoa', 'Chinh phuc Langbiang, tham thung lung hoa.', 'Sang, Trua, Toi', 'Khach san 4 sao Da Lat', 2);

-- Moi tour 2 departures: 1 dang nhan khach (tuong lai), 1 da hoan thanh (qua khu)
INSERT IGNORE INTO departures (id, tour_id, departure_date, return_date, capacity, held_seats, confirmed_seats, adult_price, child_price, infant_price, minimum_guests, status) VALUES
  (1, 1, DATE_ADD(CURDATE(), INTERVAL 30 DAY), DATE_ADD(CURDATE(), INTERVAL 32 DAY), 30, 0, 0, 5000000, 3500000, 1000000, 10, 'OPEN'),
  (2, 1, DATE_SUB(CURDATE(), INTERVAL 60 DAY), DATE_SUB(CURDATE(), INTERVAL 58 DAY), 30, 0, 25, 5000000, 3500000, 1000000, 10, 'COMPLETED'),
  (3, 2, DATE_ADD(CURDATE(), INTERVAL 45 DAY), DATE_ADD(CURDATE(), INTERVAL 48 DAY), 25, 0, 0, 4500000, 3000000, 800000, 10, 'OPEN'),
  (4, 2, DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 27 DAY), 25, 0, 20, 4500000, 3000000, 800000, 10, 'COMPLETED');

-- Promotion CHAOMUNG10 giam 10% (tran 500k), hieu luc hien tai
INSERT IGNORE INTO promotions (code, name, description, discount_type, discount_value, minimum_order_value, maximum_discount, start_date, end_date, usage_limit, used_count, limit_per_user, status) VALUES
  ('CHAOMUNG10', 'Chao mung thanh vien moi', 'Giam 10% toi da 500.000d cho don tu 2.000.000d', 'PERCENT', 10, 2000000, 500000, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), 500, 0, 1, 'ACTIVE');
