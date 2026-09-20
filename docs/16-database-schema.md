# 16. Database Schema

Database: **`sportx_db`** · Engine: **InnoDB** · Charset: **utf8mb4** ·
Collation: **utf8mb4_unicode_ci**

InnoDB is used throughout because the project needs foreign keys and
transactions; MyISAM supports neither. `utf8mb4` is used rather than `utf8`
because MySQL's `utf8` is a three-byte subset that cannot store emoji or some
Indic characters — a customer review containing either would be silently
truncated.

The full DDL is in `database/schema.sql`; seed data is in
`database/sample-data.sql`.

---

## 16.1 `users`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(100) | NOT NULL | |
| `email` | VARCHAR(120) | NOT NULL, **UNIQUE** | The database-level guarantee against duplicate registration |
| `phone` | VARCHAR(20) | | Stored as text: leading zeros and `+` prefixes matter, and no arithmetic is ever done on a phone number |
| `password` | VARCHAR(255) | NOT NULL | BCrypt hash. 60 characters today; the column is oversized so a future move to Argon2 needs no migration |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT `'CUSTOMER'` | `CUSTOMER` or `ADMIN` |
| `active` | TINYINT(1) | NOT NULL, DEFAULT 1 | Deactivation instead of deletion, so order history survives |
| `address` | VARCHAR(500) | | Saved address, used to prefill checkout |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | |

**Indexes:** `uk_users_email (email)` UNIQUE · `idx_users_role (role)`

---

## 16.2 `categories`

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT |
| `name` | VARCHAR(80) | NOT NULL, **UNIQUE** |
| `description` | VARCHAR(400) | |
| `image` | VARCHAR(255) | |

**Seeded rows:** Cricket, Football, Badminton, Basketball, Fitness, Running, Tennis

---

## 16.3 `products`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(150) | NOT NULL | |
| `category_id` | BIGINT | NOT NULL, **FK → categories(id)** ON DELETE RESTRICT | |
| `brand` | VARCHAR(80) | | |
| `description` | VARCHAR(2000) | | |
| `price` | DECIMAL(10,2) | NOT NULL, CHECK > 0 | **Never FLOAT.** Binary floating point cannot represent 0.01 exactly, so money in a FLOAT column drifts by fractions of a paisa that accumulate across an order |
| `discount` | INT | NOT NULL, DEFAULT 0, CHECK 0–90 | Percentage, not an amount — so the discounted price is always consistent with the price |
| `stock` | INT | NOT NULL, DEFAULT 0, CHECK ≥ 0 | |
| `rating` | DOUBLE | NOT NULL, DEFAULT 0 | Cached average of `reviews.rating` |
| `rating_count` | INT | NOT NULL, DEFAULT 0 | Cached count |
| `image`, `image2`, `image3` | VARCHAR(500) | | Up to three images |
| `sizes` | VARCHAR(120) | | Comma-separated, e.g. `S,M,L,XL`. Blank for unsized goods |
| `color` | VARCHAR(120) | | |
| `specifications` | VARCHAR(1500) | | One `Key: value` per line |
| `featured` | TINYINT(1) | NOT NULL, DEFAULT 0 | |
| `best_seller` | TINYINT(1) | NOT NULL, DEFAULT 0 | |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Drives "New arrivals" |

**Indexes:** `idx_products_category (category_id)` · `idx_products_price (price)` ·
`idx_products_rating (rating)` · `idx_products_created (created_at)` ·
`idx_products_name (name)`

`ON DELETE RESTRICT` on `category_id` is deliberate: deleting "Cricket" must
not silently delete five cricket products. The administrator has to move or
remove them first.

---

## 16.4 `cart`

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT |
| `user_id` | BIGINT | NOT NULL, **FK → users(id)** ON DELETE CASCADE |
| `product_id` | BIGINT | NOT NULL, **FK → products(id)** ON DELETE CASCADE |
| `quantity` | INT | NOT NULL, DEFAULT 1, CHECK > 0 |
| `size` | VARCHAR(20) | |

**Indexes:** `uk_cart_user_product_size (user_id, product_id, size)` UNIQUE ·
`idx_cart_user (user_id)`

The unique key includes `size`, so a medium and a large of the same jersey are
two rows, while pressing "add" twice on the same size updates one row.

---

## 16.5 `wishlist`

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT |
| `user_id` | BIGINT | NOT NULL, **FK → users(id)** ON DELETE CASCADE |
| `product_id` | BIGINT | NOT NULL, **FK → products(id)** ON DELETE CASCADE |

**Indexes:** `uk_wishlist_user_product (user_id, product_id)` UNIQUE ·
`idx_wishlist_user (user_id)`

---

## 16.6 `orders`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `user_id` | BIGINT | NOT NULL, **FK → users(id)** ON DELETE RESTRICT | A user with orders cannot be deleted — deactivate instead |
| `sub_total` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | |
| `discount_amount` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Product discount plus coupon |
| `delivery_charge` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | ₹49, or 0 above ₹999 |
| `total_amount` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | |
| `coupon_code` | VARCHAR(40) | | Text, not a foreign key — see the ER notes |
| `payment_method` | VARCHAR(30) | NOT NULL, DEFAULT `'COD'` | `COD` or `ONLINE` |
| `payment_status` | VARCHAR(20) | NOT NULL, DEFAULT `'PENDING'` | `PENDING` or `PAID` |
| `order_status` | VARCHAR(20) | NOT NULL, DEFAULT `'PENDING'` | Six states |
| `shipping_address` | VARCHAR(600) | NOT NULL | The assembled address at order time |
| `customer_name`, `customer_email`, `customer_phone` | VARCHAR | | Snapshot: the details given for *this* delivery, which may differ from the profile |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | |

**Indexes:** `idx_orders_user (user_id)` · `idx_orders_status (order_status)` ·
`idx_orders_created (created_at)`

---

## 16.7 `order_items`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `order_id` | BIGINT | NOT NULL, **FK → orders(id)** ON DELETE CASCADE | Items die with their order |
| `product_id` | BIGINT | NOT NULL, **FK → products(id)** ON DELETE RESTRICT | A sold product cannot be erased |
| `product_name` | VARCHAR(150) | NOT NULL | **Snapshot** — survives a later rename |
| `quantity` | INT | NOT NULL, CHECK > 0 | |
| `price` | DECIMAL(10,2) | NOT NULL | **Snapshot** of the unit price charged |
| `size` | VARCHAR(20) | | |

**Indexes:** `idx_order_items_order (order_id)` · `idx_order_items_product (product_id)`

---

## 16.8 `reviews`

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT |
| `user_id` | BIGINT | NOT NULL, **FK → users(id)** ON DELETE CASCADE |
| `product_id` | BIGINT | NOT NULL, **FK → products(id)** ON DELETE CASCADE |
| `rating` | INT | NOT NULL, CHECK BETWEEN 1 AND 5 |
| `comment` | VARCHAR(1000) | |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

**Indexes:** `uk_reviews_user_product (user_id, product_id)` UNIQUE ·
`idx_reviews_product (product_id)`

---

## 16.9 `coupons`

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT |
| `code` | VARCHAR(40) | NOT NULL, **UNIQUE** |
| `discount` | INT | NOT NULL, CHECK 1–90 |
| `min_order_amount` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 |
| `expiry_date` | DATE | |
| `status` | TINYINT(1) | NOT NULL, DEFAULT 1 |

**Seeded coupons**

| Code | Discount | Minimum order |
|---|---|---|
| `SPORTX10` | 10% | ₹999 |
| `PLAY20` | 20% | ₹2,999 |
| `NEW5` | 5% | ₹499 |

---

## 16.10 Normalisation

The schema is in **third normal form**.

- **1NF** — every column holds a single atomic value; there are no repeating
  groups. *The one apparent exception, `products.sizes`, is discussed below.*
- **2NF** — every table has a single-column surrogate primary key, so no
  non-key column can depend on part of a composite key.
- **3NF** — no transitive dependencies. A product's category name lives in
  `categories`, not repeated on every product row; a customer's name lives in
  `users`, not copied onto every cart row.

**Two deliberate departures, and the reasoning for each:**

1. **`order_items.product_name` and `order_items.price` duplicate `products`.**
   This is not a normalisation failure but a different requirement: an order is
   an immutable financial record. Normalising it away would mean that raising a
   product's price next month silently rewrites every past invoice.

2. **`products.sizes` is a comma-separated string.** Strictly this breaks 1NF
   and the correct design is a `product_sizes` child table. It is kept flat
   because sizes are only ever read as a whole list to render a selector, never
   filtered or joined on. The cost of the extra table — an extra join on every
   product read — buys nothing this application needs. If per-size stock were
   ever required, the child table becomes necessary and is listed in
   *Future Scope*.

`products.rating` and `rating_count` are a third, intentional denormalisation
(a materialised aggregate), recalculated on every review insert.
