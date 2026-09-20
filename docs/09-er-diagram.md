# 9. ER Diagram

The database holds nine entities. `USERS` and `PRODUCTS` are the two hubs;
everything else records a relationship between them or a transaction derived
from one.

```mermaid
erDiagram
    USERS ||--o{ CART          : "fills"
    USERS ||--o{ WISHLIST      : "saves"
    USERS ||--o{ ORDERS        : "places"
    USERS ||--o{ REVIEWS       : "writes"

    CATEGORIES ||--o{ PRODUCTS : "groups"

    PRODUCTS ||--o{ CART        : "appears in"
    PRODUCTS ||--o{ WISHLIST    : "appears in"
    PRODUCTS ||--o{ ORDER_ITEMS : "is sold as"
    PRODUCTS ||--o{ REVIEWS     : "receives"

    ORDERS ||--|{ ORDER_ITEMS : "contains"
    COUPONS ||..o{ ORDERS     : "discounts"

    USERS {
        bigint   id PK
        varchar  name
        varchar  email UK
        varchar  phone
        varchar  password "BCrypt hash"
        varchar  role "CUSTOMER or ADMIN"
        tinyint  active
        varchar  address
        datetime created_at
    }

    CATEGORIES {
        bigint  id PK
        varchar name UK
        varchar description
        varchar image
    }

    PRODUCTS {
        bigint   id PK
        varchar  name
        bigint   category_id FK
        varchar  brand
        varchar  description
        decimal  price
        int      discount "percent 0-90"
        int      stock
        double   rating
        int      rating_count
        varchar  image
        varchar  image2
        varchar  image3
        varchar  sizes
        varchar  color
        varchar  specifications
        tinyint  featured
        tinyint  best_seller
        datetime created_at
    }

    CART {
        bigint  id PK
        bigint  user_id FK
        bigint  product_id FK
        int     quantity
        varchar size
    }

    WISHLIST {
        bigint id PK
        bigint user_id FK
        bigint product_id FK
    }

    ORDERS {
        bigint   id PK
        bigint   user_id FK
        decimal  sub_total
        decimal  discount_amount
        decimal  delivery_charge
        decimal  total_amount
        varchar  coupon_code
        varchar  payment_method "COD or ONLINE"
        varchar  payment_status
        varchar  order_status
        varchar  shipping_address
        varchar  customer_name
        varchar  customer_email
        varchar  customer_phone
        datetime created_at
    }

    ORDER_ITEMS {
        bigint  id PK
        bigint  order_id FK
        bigint  product_id FK
        varchar product_name "snapshot"
        int     quantity
        decimal price "snapshot"
        varchar size
    }

    REVIEWS {
        bigint   id PK
        bigint   user_id FK
        bigint   product_id FK
        int      rating "1-5"
        varchar  comment
        datetime created_at
    }

    COUPONS {
        bigint  id PK
        varchar code UK
        int     discount "percent"
        decimal min_order_amount
        date    expiry_date
        tinyint status
    }
```

## Cardinality, stated in words

| Relationship | Reading |
|---|---|
| USERS → CART | One user has zero or many cart lines; each line belongs to exactly one user |
| USERS → WISHLIST | One user saves zero or many products; each saved row belongs to one user |
| USERS → ORDERS | One user places zero or many orders; each order belongs to exactly one user |
| USERS → REVIEWS | One user writes zero or many reviews, but at most one per product |
| CATEGORIES → PRODUCTS | One category groups zero or many products; each product sits in exactly one category |
| PRODUCTS → CART / WISHLIST / REVIEWS | One product may appear in many carts, wishlists and reviews |
| ORDERS → ORDER_ITEMS | One order contains **one or many** items — an order with no items is not permitted |
| PRODUCTS → ORDER_ITEMS | One product may be sold in many order items |
| COUPONS → ORDERS | A coupon may be used on zero or many orders; an order may have no coupon. Recorded as a code string, not a foreign key, so deleting a coupon cannot corrupt order history |

## Design decisions worth defending in a viva

1. **`COUPONS` is deliberately not a foreign key on `ORDERS`.** The coupon code
   is copied onto the order as text. If the administrator later deletes
   `SPORTX10`, every past order still shows which code was applied and how much
   it saved. A foreign key would have forced either a cascade (destroying
   history) or a restriction (making coupons undeletable).

2. **`ORDER_ITEMS` duplicates `product_name` and `price`.** This is intentional
   denormalisation. An order is a legal record of what was sold at what price;
   if the administrator renames a product or changes its price next month, the
   old invoice must not change with it.

3. **`CART` carries `size`, `WISHLIST` does not.** A cart line is a specific
   purchasable thing — a size-M jersey. A wishlist entry is an expression of
   interest in the product, before the size decision is made.

4. **`rating` and `rating_count` are stored on `PRODUCTS`.** They could be
   derived with `AVG()` over `REVIEWS` on every read. They are cached instead,
   and recalculated whenever a review is inserted, because the catalogue page
   displays the rating for every product on every page load and the aggregate
   would otherwise be computed dozens of times per request.

5. **`UNIQUE (user_id, product_id)`** is enforced on `WISHLIST` and on
   `REVIEWS`. On `CART` the uniqueness is `(user_id, product_id, size)`, so the
   same shirt in two sizes is two lines.
