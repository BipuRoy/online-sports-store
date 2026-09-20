# 17. API Documentation

**Base URL:** `http://localhost:8080`
**Content type:** `application/json` (except the image upload, which is
`multipart/form-data`)
**Authentication:** `Authorization: Bearer <JWT>`

## 17.1 Conventions

| Status | Meaning |
|---|---|
| 200 | Success |
| 400 | Validation failed, or a business rule was broken (out of stock, expired coupon, duplicate email) |
| 401 | No token, an invalid token, or an expired token |
| 403 | Authenticated, but the role is insufficient |
| 404 | The requested resource does not exist |
| 500 | Unexpected server error |

**Error body** — every failure returns the same shape:

```json
{
  "timestamp": "2026-09-20T11:42:03.118",
  "status": 400,
  "success": false,
  "message": "Only 3 left in stock",
  "errors": { "quantity": "Quantity must be at least 1" }
}
```

`errors` is present only for field-level validation failures.

---

## 17.2 Authentication

### POST /api/auth/register — public

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "9876543210",
  "password": "user123",
  "confirmPassword": "user123"
}
```

**200**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": 5,
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "role": "CUSTOMER"
}
```

**400** — duplicate email, mismatched confirmation, or a field that fails validation.

### POST /api/auth/login — public

```json
{ "email": "admin@sportx.com", "password": "admin123" }
```

Returns the same `AuthResponse`. **400** on bad credentials or a deactivated account.

### POST /api/auth/logout — public
Returns a confirmation. Tokens are stateless, so the browser simply discards
the token; the endpoint exists so the frontend has one place to call.

### GET /api/auth/me — authenticated
Returns the full user record behind the current token, with the password hash
nulled. Used to restore the session on page load.

### POST /api/auth/change-password — authenticated

```json
{ "currentPassword": "user123", "newPassword": "newPass456" }
```

---

## 17.3 Products

### GET /api/products — public

| Parameter | Type | Default | Meaning |
|---|---|---|---|
| `search` | string | — | Matches name, brand or description |
| `categoryId` | long | — | Restrict to one category |
| `minPrice`, `maxPrice` | decimal | — | Price range |
| `minRating` | double | — | Minimum average rating |
| `sort` | string | `newest` | `priceAsc`, `priceDesc`, `rating`, `newest` |
| `page` | int | 0 | Zero-based |
| `size` | int | 12 | Page size |

Example: `GET /api/products?search=bat&categoryId=1&maxPrice=5000&sort=priceAsc&page=0&size=12`

**200** — a Spring `Page`:

```json
{
  "content": [
    {
      "id": 1,
      "name": "SG Players Edition English Willow Cricket Bat",
      "category": { "id": 1, "name": "Cricket" },
      "brand": "SG",
      "price": 8999.00,
      "discount": 20,
      "finalPrice": 7199.20,
      "stock": 12,
      "rating": 4.6,
      "ratingCount": 18,
      "image": "/assets/products/cricket-bat.svg",
      "sizes": "SH,H",
      "featured": true
    }
  ],
  "totalElements": 26,
  "totalPages": 3,
  "number": 0,
  "size": 12
}
```

### Other product endpoints

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/products/{id}` | public | One product |
| GET | `/api/products/featured` | public | Home page featured strip |
| GET | `/api/products/best-sellers` | public | Best sellers |
| GET | `/api/products/new-arrivals` | public | Eight most recent |
| GET | `/api/products/{id}/related` | public | Four more from the same category |
| GET | `/api/products/{id}/reviews` | public | All reviews for a product |
| POST | `/api/products` | **ADMIN** | Create |
| PUT | `/api/products/{id}` | **ADMIN** | Update |
| PUT | `/api/products/{id}/stock` | **ADMIN** | `{ "stock": 25 }` |
| DELETE | `/api/products/{id}` | **ADMIN** | Delete |

**Create / update body**

```json
{
  "name": "Yonex Astrox 88D Pro",
  "categoryId": 3,
  "brand": "Yonex",
  "description": "Head-heavy racket built for attacking doubles play.",
  "price": 15990.00,
  "discount": 15,
  "stock": 8,
  "image": "/assets/products/badminton-racket.svg",
  "sizes": "3U,4U",
  "color": "Ruby Red",
  "specifications": "Weight: 83g\nBalance: Head heavy\nFlex: Stiff",
  "featured": true,
  "bestSeller": false
}
```

---

## 17.4 Categories

| Method | Path | Access |
|---|---|---|
| GET | `/api/categories` | public |
| POST | `/api/categories` | **ADMIN** |
| PUT | `/api/categories/{id}` | **ADMIN** |
| DELETE | `/api/categories/{id}` | **ADMIN** |

Deleting a category that still has products returns **400** with an
explanation, not a foreign-key stack trace.

---

## 17.5 Cart — all endpoints authenticated

| Method | Path | Body | Purpose |
|---|---|---|---|
| GET | `/api/cart` | — | Raw cart lines |
| GET | `/api/cart/summary?coupon=SPORTX10` | — | Lines plus all computed totals |
| POST | `/api/cart` | `{ "productId": 1, "quantity": 2, "size": "SH" }` | Add or merge |
| PUT | `/api/cart/{id}` | `{ "quantity": 3 }` | Set quantity |
| DELETE | `/api/cart/{id}` | — | Remove a line |
| DELETE | `/api/cart` | — | Empty the cart |

**Summary response**

```json
{
  "items": [ /* cart lines, each with the full product */ ],
  "totalQuantity": 3,
  "subTotal": 12998.00,
  "productDiscount": 2599.60,
  "couponDiscount": 1039.84,
  "deliveryCharge": 0.00,
  "total": 9358.56,
  "couponCode": "SPORTX10"
}
```

> Every figure here is computed on the server from current database values.
> The browser never sends a price or a total, so a tampered request cannot
> change what is charged.

**The stock rule.** `POST` and `PUT` both return **400** with a message such as
`"Only 3 left in stock"` if the requested quantity exceeds availability. This
is checked in `CartService`, so it applies identically to the cart page, the
product page, the wishlist's *move to cart*, and checkout.

---

## 17.6 Wishlist — authenticated

| Method | Path | Body |
|---|---|---|
| GET | `/api/wishlist` | — |
| POST | `/api/wishlist` | `{ "productId": 7 }` |
| DELETE | `/api/wishlist/{productId}` | — |

Adding a product that is already saved is idempotent, not an error.

---

## 17.7 Orders

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/orders` | authenticated | Place an order from the cart |
| GET | `/api/orders` | authenticated | Own orders; **an admin receives every order** |
| GET | `/api/orders/{id}` | authenticated | One order — a customer may only read their own |
| PUT | `/api/orders/{id}/status` | **ADMIN** | `{ "status": "SHIPPED" }` |
| PUT | `/api/orders/{id}/cancel` | authenticated | Customer cancels their own; admin cancels any |

**Place order body**

```json
{
  "fullName": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "9876543210",
  "address": "12 Station Road, Near GEB Colony",
  "city": "Bharuch",
  "state": "Gujarat",
  "country": "India",
  "pincode": "392001",
  "paymentMethod": "COD",
  "couponCode": "SPORTX10"
}
```

`paymentMethod` is `COD` or `ONLINE`. `ONLINE` sets `paymentStatus` to `PAID`
immediately — **a simulation; no payment provider is contacted.**

**400** is returned, with the whole transaction rolled back, if the cart is
empty or any item is no longer in stock.

A customer cancelling an order that has already reached `SHIPPED` receives
**400**.

---

## 17.8 Users

| Method | Path | Access |
|---|---|---|
| GET | `/api/users/me` | authenticated |
| GET | `/api/users` | **ADMIN** |
| GET | `/api/users/{id}` | **ADMIN**, or the user themselves |
| PUT | `/api/users/{id}` | the user themselves, or **ADMIN** |

`PUT` body: `{ "name": "...", "phone": "...", "address": "..." }`.
Role and email cannot be changed through this endpoint — a customer cannot
promote themselves to administrator.

---

## 17.9 Reviews, coupons, upload, contact

| Method | Path | Access | Body |
|---|---|---|---|
| POST | `/api/reviews` | authenticated | `{ "productId": 1, "rating": 5, "comment": "Great pickup." }` |
| GET | `/api/products/{id}/reviews` | public | — |
| POST | `/api/coupons/validate` | public | `{ "code": "SPORTX10", "subTotal": "12998.00" }` |
| GET | `/api/admin/coupons` | **ADMIN** | — |
| POST | `/api/admin/coupons` | **ADMIN** | `{ "code": "MONSOON15", "discount": 15, "minOrderAmount": 1500, "expiryDate": "2027-03-31", "status": true }` |
| DELETE | `/api/admin/coupons/{id}` | **ADMIN** | — |
| POST | `/api/upload` | **ADMIN** | `multipart/form-data`, field `file` |
| POST | `/api/contact` | public | `{ "name": "...", "email": "...", "subject": "...", "message": "..." }` |

The upload returns the public path to store on the product:

```json
{ "success": true, "message": "Image uploaded", "data": "/uploads/8c2f...c1.png" }
```

---

## 17.10 Admin

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/admin/stats` | Dashboard figures |
| GET | `/api/admin/users` | Every user |
| PUT | `/api/admin/users/{id}/status` | `{ "active": false }` |

**Stats response**

```json
{
  "totalUsers": 4,
  "totalProducts": 26,
  "totalOrders": 2,
  "totalRevenue": 14847.20,
  "pendingOrders": 1,
  "deliveredOrders": 1,
  "cancelledOrders": 0,
  "lowStockProducts": 3
}
```

---

## 17.11 Access control summary

| Path pattern | Who may call it |
|---|---|
| `/`, `/css/**`, `/js/**`, `/assets/**`, `/uploads/**`, all page URLs | Everyone |
| `POST /api/auth/register`, `/login`, `/logout` | Everyone |
| `GET /api/products/**`, `GET /api/categories` | Everyone |
| `POST /api/contact`, `POST /api/coupons/validate` | Everyone |
| `/api/cart/**`, `/api/wishlist/**`, `/api/orders/**`, `/api/reviews`, `/api/users/me` | Any authenticated user |
| `/api/admin/**`, `/api/upload`, `POST PUT DELETE` on products and categories, `GET /api/users`, `PUT /api/orders/{id}/status` | **ADMIN only** |
