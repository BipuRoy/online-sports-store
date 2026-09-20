-- =====================================================================
--  SPORTX - Online Sports Store
--  File: database/schema.sql
--  Purpose: Creates the database and all relational tables.
--  Run with:  mysql -u root -p < schema.sql
-- =====================================================================

DROP DATABASE IF EXISTS sportx_db;
CREATE DATABASE sportx_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE sportx_db;

-- ---------------------------------------------------------------------
-- 1. users
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(120) NOT NULL,
    phone       VARCHAR(20),
    password    VARCHAR(255) NOT NULL,          -- BCrypt hash, never plain text
    role        VARCHAR(20)  NOT NULL DEFAULT 'CUSTOMER',
    active      TINYINT(1)   NOT NULL DEFAULT 1,
    address     VARCHAR(500),
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT chk_users_role CHECK (role IN ('CUSTOMER','ADMIN'))
) ENGINE=InnoDB;

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- ---------------------------------------------------------------------
-- 2. categories
-- ---------------------------------------------------------------------
CREATE TABLE categories (
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    name        VARCHAR(80) NOT NULL,
    description VARCHAR(400),
    image       VARCHAR(255),
    PRIMARY KEY (id),
    CONSTRAINT uk_categories_name UNIQUE (name)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. products
-- ---------------------------------------------------------------------
CREATE TABLE products (
    id             BIGINT        NOT NULL AUTO_INCREMENT,
    name           VARCHAR(150)  NOT NULL,
    category_id    BIGINT        NOT NULL,
    brand          VARCHAR(80),
    description    VARCHAR(2000),
    price          DECIMAL(10,2) NOT NULL,
    discount       INT           NOT NULL DEFAULT 0,   -- percentage 0-90
    stock          INT           NOT NULL DEFAULT 0,
    rating         DOUBLE        NOT NULL DEFAULT 0,
    rating_count   INT           NOT NULL DEFAULT 0,
    image          VARCHAR(500),
    image2         VARCHAR(500),
    image3         VARCHAR(500),
    sizes          VARCHAR(120),
    color          VARCHAR(120),
    specifications VARCHAR(1500),
    featured       TINYINT(1)    NOT NULL DEFAULT 0,
    best_seller    TINYINT(1)    NOT NULL DEFAULT 0,
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id)
        REFERENCES categories(id) ON DELETE RESTRICT,
    CONSTRAINT chk_products_price    CHECK (price >= 0),
    CONSTRAINT chk_products_discount CHECK (discount BETWEEN 0 AND 90),
    CONSTRAINT chk_products_stock    CHECK (stock >= 0),
    CONSTRAINT chk_products_rating   CHECK (rating BETWEEN 0 AND 5)
) ENGINE=InnoDB;

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name     ON products(name);
CREATE INDEX idx_products_price    ON products(price);

-- ---------------------------------------------------------------------
-- 4. cart
-- ---------------------------------------------------------------------
CREATE TABLE cart (
    id         BIGINT NOT NULL AUTO_INCREMENT,
    user_id    BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity   INT    NOT NULL DEFAULT 1,
    size       VARCHAR(20),
    PRIMARY KEY (id),
    CONSTRAINT uk_cart_user_product UNIQUE (user_id, product_id),
    CONSTRAINT fk_cart_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT chk_cart_quantity CHECK (quantity > 0)
) ENGINE=InnoDB;

CREATE INDEX idx_cart_user ON cart(user_id);

-- ---------------------------------------------------------------------
-- 5. wishlist
-- ---------------------------------------------------------------------
CREATE TABLE wishlist (
    id         BIGINT NOT NULL AUTO_INCREMENT,
    user_id    BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_wishlist_user_product UNIQUE (user_id, product_id),
    CONSTRAINT fk_wishlist_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_wishlist_user ON wishlist(user_id);

-- ---------------------------------------------------------------------
-- 6. orders
-- ---------------------------------------------------------------------
CREATE TABLE orders (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    user_id          BIGINT        NOT NULL,
    sub_total        DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount  DECIMAL(10,2) NOT NULL DEFAULT 0,
    delivery_charge  DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount     DECIMAL(10,2) NOT NULL DEFAULT 0,
    coupon_code      VARCHAR(40),
    payment_method   VARCHAR(30)   NOT NULL DEFAULT 'COD',
    payment_status   VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    order_status     VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    shipping_address VARCHAR(600)  NOT NULL,
    customer_name    VARCHAR(120),
    customer_email   VARCHAR(120),
    customer_phone   VARCHAR(20),
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_orders_status CHECK (order_status IN
        ('PENDING','CONFIRMED','PACKED','SHIPPED','DELIVERED','CANCELLED')),
    CONSTRAINT chk_orders_payment CHECK (payment_method IN ('COD','ONLINE'))
) ENGINE=InnoDB;

CREATE INDEX idx_orders_user   ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(order_status);

-- ---------------------------------------------------------------------
-- 7. order_items
-- ---------------------------------------------------------------------
CREATE TABLE order_items (
    id           BIGINT        NOT NULL AUTO_INCREMENT,
    order_id     BIGINT        NOT NULL,
    product_id   BIGINT        NOT NULL,
    product_name VARCHAR(150)  NOT NULL,   -- snapshot, survives a later product rename
    quantity     INT           NOT NULL,
    price        DECIMAL(10,2) NOT NULL,   -- unit price charged at order time
    size         VARCHAR(20),
    PRIMARY KEY (id),
    CONSTRAINT fk_order_items_order   FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    CONSTRAINT chk_order_items_qty CHECK (quantity > 0)
) ENGINE=InnoDB;

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ---------------------------------------------------------------------
-- 8. reviews
-- ---------------------------------------------------------------------
CREATE TABLE reviews (
    id         BIGINT        NOT NULL AUTO_INCREMENT,
    user_id    BIGINT        NOT NULL,
    product_id BIGINT        NOT NULL,
    rating     INT           NOT NULL,
    comment    VARCHAR(1000),
    created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_reviews_user_product UNIQUE (user_id, product_id),
    CONSTRAINT fk_reviews_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB;

CREATE INDEX idx_reviews_product ON reviews(product_id);

-- ---------------------------------------------------------------------
-- 9. coupons
-- ---------------------------------------------------------------------
CREATE TABLE coupons (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    code             VARCHAR(40)   NOT NULL,
    discount         INT           NOT NULL,
    min_order_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    expiry_date      DATE,
    status           TINYINT(1)    NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    CONSTRAINT uk_coupons_code UNIQUE (code),
    CONSTRAINT chk_coupons_discount CHECK (discount BETWEEN 1 AND 90)
) ENGINE=InnoDB;

SELECT 'SPORTX schema created successfully' AS status;
