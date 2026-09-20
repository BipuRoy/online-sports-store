-- =====================================================================
--  SPORTX - Online Sports Store
--  File: database/sample-data.sql
--  Purpose: Inserts demo accounts, categories, products and coupons.
--  Run AFTER schema.sql:   mysql -u root -p sportx_db < sample-data.sql
--
--  Demo logins (passwords are stored as BCrypt hashes):
--    Admin     admin@sportx.com     / admin123
--    Customer  customer@sportx.com  / customer123
-- =====================================================================

USE sportx_db;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE reviews;
TRUNCATE TABLE cart;
TRUNCATE TABLE wishlist;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE coupons;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- Users  (BCrypt hashes - never store plain passwords)
-- ---------------------------------------------------------------------
INSERT INTO users (id, name, email, phone, password, role, active, address) VALUES
(1, 'SPORTX Admin', 'admin@sportx.com', '9876543210',
 '$2b$10$392zxWGqORS95vLFL0TwneqZikuHJE0v8inymNCbdULviZ7CXnTQ6', 'ADMIN', 1, NULL),
(2, 'Demo Customer', 'customer@sportx.com', '9123456780',
 '$2b$10$cvrQfpyiVbLBVNg.9uK/k.ShvwU8.uCT0bUI6fTtqHgTeheUJVpuu', 'CUSTOMER', 1,
 '12 MG Road, Bharuch, Gujarat, India, 392001'),
(3, 'Rahul Mehta', 'rahul@example.com', '9812345678',
 '$2b$10$1QsAU9//IIZ83QPYeYtWjOo1yI1yVbeEh4x7b62uoiJNlzbLagUlO', 'CUSTOMER', 1,
 '5 Station Road, Surat, Gujarat, India, 395003'),
(4, 'Ananya Sharma', 'ananya@example.com', '9798765432',
 '$2b$10$1QsAU9//IIZ83QPYeYtWjOo1yI1yVbeEh4x7b62uoiJNlzbLagUlO', 'CUSTOMER', 1,
 '88 Ring Road, Vadodara, Gujarat, India, 390001');

-- Passwords for the demo accounts (stored above as real BCrypt hashes):
--   admin@sportx.com     -> admin123
--   customer@sportx.com  -> customer123
--   rahul@example.com    -> user123
--   ananya@example.com   -> user123

-- ---------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------
INSERT INTO categories (id, name, description, image) VALUES
(1, 'Cricket',    'Bats, balls, pads and protective gear for every format of the game.', '/assets/categories/cricket.svg'),
(2, 'Football',   'Match balls, boots, jerseys and keeper gloves for the pitch.',        '/assets/categories/football.svg'),
(3, 'Badminton',  'Rackets, shuttles, court shoes and nets for indoor play.',            '/assets/categories/badminton.svg'),
(4, 'Basketball', 'Indoor and outdoor balls, court shoes and team jerseys.',             '/assets/categories/basketball.svg'),
(5, 'Fitness',    'Home gym essentials from dumbbells to mats and bands.',               '/assets/categories/fitness.svg'),
(6, 'Running',    'Shoes, apparel and watches built for distance.',                      '/assets/categories/running.svg'),
(7, 'Tennis',     'Rackets, balls and accessories for hard and clay courts.',            '/assets/categories/tennis.svg');

-- ---------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------
INSERT INTO products
(id, name, category_id, brand, description, price, discount, stock, rating, rating_count,
 image, image2, image3, sizes, color, specifications, featured, best_seller) VALUES
(1, 'English Willow Cricket Bat', 1, 'SS', 'Grade 3 English willow blade with a mid-blade sweet spot, semi-oval handle and a pre-knocked face ready for match use.', 4499.00, 20, 25, 4.6, 48,
 '/assets/products/cricket-bat.svg', '/assets/products/cricket-bat.svg', '/assets/categories/cricket.svg', 'SH,LB,Harrow', 'Natural', 'Blade: English Willow|Weight: 1180-1220 g|Handle: Cane, semi-oval|Grains: 6-8 straight|Finish: Pre-knocked', 1, 1),
(2, 'Leather Cricket Ball (4 Pc)', 1, 'SG', 'Four-piece alum-tanned leather ball with a hand-stitched seam that holds shape through a full 50-over innings.', 899.00, 10, 60, 4.3, 31,
 '/assets/products/cricket-ball.svg', '/assets/products/cricket-ball.svg', '/assets/categories/cricket.svg', '', 'Red', 'Weight: 156 g|Cover: Alum-tanned leather|Seam: Hand stitched|Suited to: Turf wickets', 0, 1),
(3, 'Pro Batting Gloves', 1, 'SS', 'Split-finger gloves with high-density foam across the thumb and a cotton towelling back that stays dry through long innings.', 1299.00, 15, 40, 4.2, 22,
 '/assets/products/batting-gloves.svg', '/assets/products/batting-gloves.svg', '/assets/categories/cricket.svg', 'S,M,L', 'White/Blue', 'Palm: Sheep leather|Protection: HD foam|Fit: Split finger|Wash: Hand wash only', 0, 0),
(4, 'Steel Grille Cricket Helmet', 1, 'Shrey', 'ABS shell with an adjustable stainless steel grille that meets the current neck-protection guidance for junior and senior play.', 2799.00, 18, 22, 4.7, 37,
 '/assets/products/cricket-helmet.svg', '/assets/products/cricket-helmet.svg', '/assets/categories/cricket.svg', 'M,L', 'Navy', 'Shell: High-impact ABS|Grille: Stainless steel|Padding: Moisture-wicking|Adjustable: Yes', 1, 0),
(5, 'Batting Leg Pads', 1, 'SG', 'Lightweight cane-reinforced pads with bolster padding at the knee roll and quick-release straps.', 1999.00, 12, 30, 4.1, 18,
 '/assets/products/cricket-pads.svg', '/assets/products/cricket-pads.svg', '/assets/categories/cricket.svg', 'Youth,Men', 'White', 'Reinforcement: Cane rods|Weight: 1.6 kg pair|Straps: Quick release|Cover: PVC', 0, 0),
(6, 'Match Football Size 5', 2, 'Nivia', 'Thermo-bonded 32-panel ball with a butyl bladder that keeps pressure through a full season of training.', 1199.00, 20, 55, 4.5, 64,
 '/assets/products/football.svg', '/assets/products/football.svg', '/assets/categories/football.svg', '5', 'White/Black', 'Size: 5|Panels: 32, thermo-bonded|Bladder: Butyl|Circumference: 68-70 cm', 1, 1),
(7, 'Firm Ground Football Boots', 2, 'Nivia', 'Moulded firm-ground studs under a textured synthetic upper that improves first touch in wet conditions.', 2499.00, 25, 35, 4.4, 41,
 '/assets/products/football-shoes.svg', '/assets/products/football-shoes.svg', '/assets/categories/football.svg', '6,7,8,9,10,11', 'Orange', 'Surface: Firm ground|Upper: Textured synthetic|Studs: Moulded TPU|Closure: Lace-up', 1, 0),
(8, 'Goalkeeper Gloves', 2, 'Vector X', '4 mm latex palm with finger spines and a wrap-around wrist strap for a locked-in fit.', 1099.00, 15, 28, 4.0, 15,
 '/assets/products/goalkeeper-gloves.svg', '/assets/products/goalkeeper-gloves.svg', '/assets/categories/football.svg', '8,9,10', 'Purple', 'Palm: 4 mm latex|Protection: Finger spines|Cut: Roll finger|Closure: Wrist strap', 0, 0),
(9, 'Team Football Jersey', 2, 'SPORTX', 'Breathable polyester mesh jersey with a relaxed athletic cut and colour that holds through repeated washes.', 799.00, 30, 70, 4.2, 26,
 '/assets/products/football-jersey.svg', '/assets/products/football-jersey.svg', '/assets/categories/football.svg', 'S,M,L,XL,XXL', 'Green', 'Fabric: 100% polyester|Fit: Regular|Feature: Moisture wicking|Care: Machine wash cold', 0, 1),
(10, 'Carbon Badminton Racket', 3, 'Yonex', 'Full carbon-graphite frame at 85 g, strung at 24 lbs, balanced slightly head-light for quick defensive play.', 2199.00, 22, 45, 4.6, 58,
 '/assets/products/badminton-racket.svg', '/assets/products/badminton-racket.svg', '/assets/categories/badminton.svg', 'G4,G5', 'Teal', 'Frame: Carbon graphite|Weight: 85 g (4U)|Tension: up to 30 lbs|Balance: Head light', 1, 1),
(11, 'Feather Shuttlecock (Tube of 6)', 3, 'Yonex', 'Grade A duck-feather shuttles with a cork base, sorted for consistent speed across the tube.', 699.00, 10, 90, 4.3, 33,
 '/assets/products/shuttlecock.svg', '/assets/products/shuttlecock.svg', '/assets/categories/badminton.svg', '', 'White', 'Feather: Grade A duck|Base: Natural cork|Speed: 77 (medium)|Quantity: 6', 0, 0),
(12, 'Court Badminton Shoes', 3, 'Yonex', 'Non-marking gum rubber sole with a reinforced toe cap for lunges and a cushioned midsole for long rallies.', 2999.00, 20, 26, 4.5, 29,
 '/assets/products/badminton-shoes.svg', '/assets/products/badminton-shoes.svg', '/assets/categories/badminton.svg', '6,7,8,9,10', 'Cyan', 'Sole: Non-marking gum rubber|Midsole: EVA cushion|Toe: Reinforced cap|Weight: 310 g', 0, 0),
(13, 'Nylon Badminton Net', 3, 'Vector X', 'Full-width nylon net with a doubled tape header and side ropes, sized for standard doubles courts.', 899.00, 10, 18, 3.9, 11,
 '/assets/products/badminton-net.svg', '/assets/products/badminton-net.svg', '/assets/categories/badminton.svg', '', 'Black', 'Length: 6.1 m|Depth: 0.76 m|Material: Nylon|Header: Doubled tape', 0, 0),
(14, 'Indoor/Outdoor Basketball', 4, 'Spalding', 'Composite leather cover with deep channels that grip well on both wooden courts and outdoor concrete.', 1599.00, 18, 42, 4.5, 47,
 '/assets/products/basketball.svg', '/assets/products/basketball.svg', '/assets/categories/basketball.svg', '7', 'Orange', 'Size: 7|Cover: Composite leather|Bladder: Butyl|Use: Indoor and outdoor', 1, 1),
(15, 'High-Top Basketball Shoes', 4, 'Nivia', 'High-top collar with a herringbone outsole and a cushioned heel unit that absorbs repeated landings.', 3199.00, 25, 24, 4.4, 30,
 '/assets/products/basketball-shoes.svg', '/assets/products/basketball-shoes.svg', '/assets/categories/basketball.svg', '7,8,9,10,11', 'Purple', 'Collar: High top|Outsole: Herringbone rubber|Cushion: EVA heel unit|Surface: Court', 0, 0),
(16, 'Reversible Basketball Jersey', 4, 'SPORTX', 'Reversible mesh jersey with taped side seams so one kit covers both halves of a scrimmage.', 999.00, 20, 50, 4.1, 17,
 '/assets/products/basketball-jersey.svg', '/assets/products/basketball-jersey.svg', '/assets/categories/basketball.svg', 'S,M,L,XL', 'Pink/Navy', 'Fabric: Poly mesh|Feature: Reversible|Fit: Athletic|Care: Machine wash', 0, 0),
(17, 'Adjustable Dumbbell Set 20 kg', 5, 'Kore', 'Pair of spinlock handles with PVC plates that adjust from 2.5 kg to 10 kg each side for a full home routine.', 2899.00, 22, 33, 4.6, 72,
 '/assets/products/dumbbells.svg', '/assets/products/dumbbells.svg', '/assets/categories/fitness.svg', '20kg', 'Black', 'Total weight: 20 kg|Plates: PVC coated|Handles: Spinlock|Includes: 2 handles, 4 collars', 1, 1),
(18, 'Resistance Band Set (5 Levels)', 5, 'Boldfit', 'Five latex loops from light to extra heavy, useful for warm-ups, mobility work and assisted pull-ups.', 699.00, 30, 80, 4.3, 55,
 '/assets/products/resistance-bands.svg', '/assets/products/resistance-bands.svg', '/assets/categories/fitness.svg', '', 'Multi', 'Levels: 5|Material: Natural latex|Length: 60 cm loop|Includes: Carry pouch', 0, 1),
(19, 'Anti-Slip Yoga Mat 6 mm', 5, 'Boldfit', '6 mm TPE mat with a textured underside that stays put on tile and a closed-cell top that wipes clean.', 899.00, 20, 65, 4.4, 61,
 '/assets/products/yoga-mat.svg', '/assets/products/yoga-mat.svg', '/assets/categories/fitness.svg', '6mm', 'Teal', 'Thickness: 6 mm|Material: TPE|Size: 183 x 61 cm|Feature: Anti-slip, carry strap', 0, 0),
(20, 'Speed Skipping Rope', 5, 'Kore', 'Ball-bearing handles and an adjustable steel cable that holds a steady arc at high turnover.', 399.00, 15, 100, 4.2, 38,
 '/assets/products/skipping-rope.svg', '/assets/products/skipping-rope.svg', '/assets/categories/fitness.svg', '', 'Amber', 'Cable: Coated steel|Length: Adjustable to 3 m|Handles: Ball bearing|Use: Speed and double-unders', 0, 0),
(21, 'Cushioned Running Shoes', 6, 'Asics', 'Neutral daily trainer with a compressed-EVA midsole and an engineered mesh upper that vents well in heat.', 3499.00, 25, 38, 4.7, 89,
 '/assets/products/running-shoes.svg', '/assets/products/running-shoes.svg', '/assets/categories/running.svg', '6,7,8,9,10,11', 'Red', 'Drop: 10 mm|Midsole: Compressed EVA|Upper: Engineered mesh|Weight: 255 g', 1, 1),
(22, 'Dry-Fit Sports T-Shirt', 6, 'SPORTX', 'Lightweight knit that pulls sweat to the surface, with flatlock seams that avoid chafing on long runs.', 599.00, 30, 120, 4.2, 44,
 '/assets/products/sports-tshirt.svg', '/assets/products/sports-tshirt.svg', '/assets/categories/running.svg', 'S,M,L,XL,XXL', 'Blue', 'Fabric: Poly dry-fit|Seams: Flatlock|Fit: Regular|Care: Machine wash cold', 0, 0),
(23, 'Training Sports Shorts', 6, 'SPORTX', 'Four-way stretch shorts with a zip pocket and an inner drawcord that stays tied through a session.', 499.00, 25, 95, 4.0, 21,
 '/assets/products/sports-shorts.svg', '/assets/products/sports-shorts.svg', '/assets/categories/running.svg', 'S,M,L,XL', 'Grey', 'Fabric: 4-way stretch|Inseam: 7 inch|Pockets: 1 zip, 2 side|Waist: Elastic with drawcord', 0, 0),
(24, 'GPS Running Watch', 6, 'Amazfit', 'Built-in GPS with wrist heart-rate, 14-day battery in smart mode and pace alerts you can set per kilometre.', 6999.00, 20, 15, 4.5, 52,
 '/assets/products/running-watch.svg', '/assets/products/running-watch.svg', '/assets/categories/running.svg', '', 'Teal', 'GPS: Built-in|Battery: 14 days|Sensors: HR, SpO2|Water rating: 5 ATM', 1, 0),
(25, 'Graphite Tennis Racket', 7, 'Head', 'Graphite composite frame, 280 g strung, with a 100 sq in head that forgives off-centre contact.', 3299.00, 20, 20, 4.4, 27,
 '/assets/products/tennis-racket.svg', '/assets/products/tennis-racket.svg', '/assets/categories/tennis.svg', 'G2,G3,G4', 'Lime', 'Head size: 100 sq in|Weight: 280 g strung|Balance: Even|String pattern: 16x19', 0, 0),
(26, 'Tennis Balls (Can of 3)', 7, 'Head', 'Pressurised felt balls in a sealed can, consistent on hard courts for several sets of club play.', 499.00, 10, 75, 4.1, 19,
 '/assets/products/tennis-balls.svg', '/assets/products/tennis-balls.svg', '/assets/categories/tennis.svg', '', 'Yellow', 'Quantity: 3|Type: Pressurised|Felt: Woven wool blend|Surface: Hard court', 0, 0);

-- ---------------------------------------------------------------------
-- Coupons
-- ---------------------------------------------------------------------
INSERT INTO coupons (id, code, discount, min_order_amount, expiry_date, status) VALUES
(1, 'SPORTX10', 10,  999.00, '2027-12-31', 1),
(2, 'PLAY20',   20, 2999.00, '2027-06-30', 1),
(3, 'NEW5',      5,  499.00, '2027-12-31', 1);

-- ---------------------------------------------------------------------
-- Sample reviews (these also justify the ratings above)
-- ---------------------------------------------------------------------
INSERT INTO reviews (user_id, product_id, rating, comment) VALUES
(2, 1, 5, 'Excellent pickup straight out of the cover. Needed only a light knock-in.'),
(3, 1, 4, 'Good willow for the price, slightly heavier than listed.'),
(2, 6, 5, 'Holds shape and pressure after a month of daily training.'),
(4, 14, 4, 'Great grip on outdoor concrete, still round after heavy use.'),
(3, 21, 5, 'Very comfortable for 10 km runs, no break-in needed.'),
(4, 17, 4, 'Plates fit securely, collars could be a little tighter.');

-- ---------------------------------------------------------------------
-- Sample order so the admin dashboard shows real numbers on first load
-- ---------------------------------------------------------------------
INSERT INTO orders
(id, user_id, sub_total, discount_amount, delivery_charge, total_amount, coupon_code,
 payment_method, payment_status, order_status, shipping_address,
 customer_name, customer_email, customer_phone) VALUES
(1, 2, 4558.20, 455.82, 0.00, 4102.38, 'SPORTX10', 'COD', 'PENDING', 'CONFIRMED',
 '12 MG Road, Bharuch, Gujarat, India, 392001', 'Demo Customer', 'customer@sportx.com', '9123456780'),
(2, 3, 2624.25, 0.00, 0.00, 2624.25, NULL, 'ONLINE', 'PAID', 'DELIVERED',
 '5 Station Road, Surat, Gujarat, India, 395003', 'Rahul Mehta', 'rahul@example.com', '9812345678');

INSERT INTO order_items (order_id, product_id, product_name, quantity, price, size) VALUES
(1, 1, 'English Willow Cricket Bat', 1, 3599.20, 'SH'),
(1, 2, 'Leather Cricket Ball (4 Pc)', 1,  809.10, NULL),
(2, 21, 'Cushioned Running Shoes',   1, 2624.25, '9');

SELECT 'SPORTX sample data loaded' AS status;