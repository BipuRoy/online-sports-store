# 4. Scope of the Project

## 4.1 In scope

### Customer-facing

| Area | What is included |
|---|---|
| Catalogue | 26 seeded products across 7 categories, each with images, brand, price, discount, stock, rating, specifications, sizes and colour |
| Discovery | Keyword search, category filter, price-range filter, minimum-rating filter, sorting by price, rating and newest, and pagination |
| Product page | Multiple images with a thumbnail strip, full description, specification table, size selection, quantity selector, live stock indicator, related products and customer reviews |
| Cart | Add, remove, increase, decrease, clear; live subtotal, product discount, coupon discount, delivery charge and final total; server-side stock ceiling on every change |
| Wishlist | Add, remove, move to cart, view |
| Checkout | Full shipping form with validation, order summary, cash on delivery or simulated online payment |
| Orders | Order history, itemised order details, six-state visual tracker, and customer-initiated cancellation while the order is still `PENDING`, `CONFIRMED` or `PACKED` |
| Account | Register, sign in, sign out, forgot-password interface, edit profile, saved address, change password |
| Reviews | One 1–5 star review with a comment per customer per product; the product's average rating and review count are recalculated on each submission |
| Coupons | Percentage discount codes with a minimum order value and an expiry date, validated on the server |
| Content | About Us, Contact with a working form, FAQ, and a designed 404 page |

### Administrator-facing

| Area | What is included |
|---|---|
| Dashboard | Total users, products, orders and revenue; pending, delivered and cancelled order counts; low-stock warning count |
| Products | Create, read, update, delete; inline stock editing; image upload to the server; featured and best-seller flags |
| Categories | Create, read, update, delete, with deletion blocked while products still reference the category |
| Orders | View every order, open full details, change status through the six states, cancel an order and return its stock |
| Users | View all registered users and activate or deactivate any customer account |
| Coupons | Create, list and delete discount codes |

### Technical

- Stateless JWT authentication with a 24-hour token lifetime.
- BCrypt password hashing.
- Role-based authorisation enforced in `SecurityConfig` and with
  `@PreAuthorize`.
- Bean Validation on every request body, with a single global exception handler.
- A fully responsive interface, from 320 px phones to wide desktops.
- A database seeder so the application is populated and demonstrable on first
  run, plus equivalent `schema.sql` and `sample-data.sql` scripts.

## 4.2 Out of scope

These were deliberately excluded. They are listed here because knowing what a
system does *not* do is part of specifying it, and because most of them appear
again in *Future Scope*.

| Excluded | Reason |
|---|---|
| Real payment processing (Razorpay, Stripe, UPI) | Requires a registered merchant account, a business entity and PCI-DSS obligations. The online option is a clearly-labelled mock that marks the order paid. |
| Real password-reset email | Requires an SMTP account and a domain. The forgot-password interface is built and validated, but the email step is simulated. |
| Courier / logistics integration | No courier API is available to a student project. Status changes are made by the administrator. |
| Refunds and returns processing | Financial workflow that depends on real payments existing first. |
| Multi-vendor marketplace | The system models one store with one administrator. |
| Product recommendation engine | "Related products" uses same-category matching, not collaborative filtering. |
| Mobile applications | The web interface is responsive; no native Android or iOS app is built. |
| Real-time chat support | The contact form is asynchronous. |
| GST invoicing and accounting export | Outside the scope of a demonstration system. |
| Horizontal scaling, load balancing, CDN | The project targets a single-instance deployment. |

## 4.3 Assumptions

1. A single administrator manages the store; there is no approval hierarchy.
2. Prices are in Indian Rupees and inclusive of tax.
3. Delivery is charged at a flat ₹49, waived on orders above ₹999.
4. One shipping address is used per order, entered at checkout.
5. Product images are supplied by the administrator, either as a path or an
   upload.
6. The application runs on a single machine with MySQL reachable on
   `localhost:3306`.
