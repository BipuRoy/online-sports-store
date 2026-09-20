# 18. Testing

Testing was carried out at four levels: unit, integration, system
(black-box, done manually through the browser) and security. Every test
case below was executed against the running application with the seed
data loaded.

## 18.1 Test environment

| Item | Value |
|---|---|
| Server | Spring Boot 3.2.5 on embedded Tomcat, port 8080 |
| Database | MySQL 8.0, schema `sportx_db`, seeded by `schema.sql` + `sample-data.sql` |
| Browsers | Chrome 124, Firefox 125, Edge 124 |
| Screen sizes | 1920×1080, 1366×768, 768×1024 (tablet), 390×844 (mobile) |
| API client | Postman 10 / curl |
| Accounts | `admin@sportx.com` / `admin123`, `customer@sportx.com` / `customer123` |

## 18.2 Testing strategy

| Level | What is checked | Method |
|---|---|---|
| Unit | Single service methods — price after discount, coupon rules, stock guard | Manual method-level checks and API calls with crafted inputs |
| Integration | Controller → service → repository → MySQL round trip | Postman collection hitting each endpoint in sequence |
| System | Complete user journeys from browser | Manual black-box testing against the test cases below |
| Security | Authentication, authorisation, injection, tampering | Deliberate misuse: missing tokens, wrong roles, edited request bodies |
| Compatibility | Rendering and behaviour across browsers and widths | Browser dev-tools device emulation plus real mobile device |

## 18.3 Unit test cases

| ID | Module | Test case | Input | Expected | Actual | Result |
|---|---|---|---|---|---|---|
| UT-01 | Product | Final price after discount | price 4499, discount 20 | 3599.20 | 3599.20 | Pass |
| UT-02 | Product | Zero discount leaves price unchanged | price 999, discount 0 | 999.00 | 999.00 | Pass |
| UT-03 | Cart | Delivery charge applied below threshold | subtotal 499 | 49 added | 49 added | Pass |
| UT-04 | Cart | Free delivery at or above threshold | subtotal 1200 | 0 added | 0 added | Pass |
| UT-05 | Coupon | Valid coupon reduces total | SPORTX10 on 2000 | 200 off | 200 off | Pass |
| UT-06 | Coupon | Coupon below minimum order rejected | PLAY20 on 1500 | Error message | "Minimum order ₹2999 required" | Pass |
| UT-07 | Coupon | Unknown code rejected | ABCD | Error message | "Invalid coupon code" | Pass |
| UT-08 | Cart | Quantity above stock rejected | qty 99, stock 12 | Error message | "Only 12 left in stock" | Pass |
| UT-09 | Auth | BCrypt hash verifies correct password | admin123 | true | true | Pass |
| UT-10 | Auth | BCrypt hash rejects wrong password | Admin123 | false | false | Pass |
| UT-11 | Review | Average rating recalculated after new review | 4, 5 → add 3 | 4.0 | 4.0 | Pass |
| UT-12 | Order | Stock decremented on order placement | stock 10, qty 2 | stock 8 | stock 8 | Pass |
| UT-13 | Order | Stock restored on cancellation | stock 8, qty 2 | stock 10 | stock 10 | Pass |

## 18.4 Integration / API test cases

| ID | Endpoint | Test case | Expected | Actual | Result |
|---|---|---|---|---|---|
| IT-01 | POST /api/auth/register | New email registers | 200 + JWT | 200 + JWT | Pass |
| IT-02 | POST /api/auth/register | Duplicate email | 400 "Email already registered" | as expected | Pass |
| IT-03 | POST /api/auth/register | Password shorter than 6 chars | 400 validation error | as expected | Pass |
| IT-04 | POST /api/auth/login | Correct credentials | 200 + JWT + role | as expected | Pass |
| IT-05 | POST /api/auth/login | Wrong password | 401 "Invalid email or password" | as expected | Pass |
| IT-06 | GET /api/auth/me | Valid token | 200 + profile | as expected | Pass |
| IT-07 | GET /api/products | No filters | 200 + page of 12 | as expected | Pass |
| IT-08 | GET /api/products?search=bat | Keyword filter | only matching rows | 3 rows | Pass |
| IT-09 | GET /api/products?categoryId=1&minPrice=1000 | Combined filters | filtered rows only | as expected | Pass |
| IT-10 | GET /api/products?sort=priceAsc | Sorting | ascending by final price | as expected | Pass |
| IT-11 | GET /api/products/999999 | Missing id | 404 | as expected | Pass |
| IT-12 | POST /api/cart | Add item with token | 200 + updated cart | as expected | Pass |
| IT-13 | POST /api/cart | Add item without token | 401 | as expected | Pass |
| IT-14 | PUT /api/cart/{id} | Update quantity | 200 + new totals | as expected | Pass |
| IT-15 | DELETE /api/cart/{id} | Remove item | 200 + item gone | as expected | Pass |
| IT-16 | GET /api/cart/summary?coupon=SPORTX10 | Totals with coupon | discount applied | as expected | Pass |
| IT-17 | POST /api/wishlist | Add product | 200 | as expected | Pass |
| IT-18 | POST /api/wishlist | Add same product twice | no duplicate row | single row | Pass |
| IT-19 | POST /api/orders | COD order | 200 + PENDING order | as expected | Pass |
| IT-20 | POST /api/orders | Online (mock) payment | paymentStatus PAID | as expected | Pass |
| IT-21 | POST /api/orders | Empty cart | 400 "Your cart is empty" | as expected | Pass |
| IT-22 | GET /api/orders | Customer sees only own orders | own rows only | as expected | Pass |
| IT-23 | PUT /api/orders/{id}/status | Admin updates status | 200 + new status | as expected | Pass |
| IT-24 | PUT /api/orders/{id}/status | Customer attempts same | 403 | as expected | Pass |
| IT-25 | PUT /api/orders/{id}/cancel | Cancel a PENDING order | 200 + CANCELLED | as expected | Pass |
| IT-26 | PUT /api/orders/{id}/cancel | Cancel a SHIPPED order | 400 refusal | as expected | Pass |
| IT-27 | POST /api/reviews | First review by user | 200 | as expected | Pass |
| IT-28 | POST /api/reviews | Second review, same product | 400 "already reviewed" | as expected | Pass |
| IT-29 | POST /api/products | Admin creates product | 200 | as expected | Pass |
| IT-30 | POST /api/products | Customer creates product | 403 | as expected | Pass |
| IT-31 | DELETE /api/categories/{id} | Category with products | 400 / FK refusal | as expected | Pass |
| IT-32 | GET /api/admin/stats | Admin dashboard figures | counts match DB | as expected | Pass |
| IT-33 | POST /api/upload | Image upload as admin | 200 + /uploads path | as expected | Pass |
| IT-34 | POST /api/contact | Contact form | 200 acknowledgement | as expected | Pass |

## 18.5 System / UI test cases

| ID | Page | Test case | Expected | Result |
|---|---|---|---|---|
| ST-01 | Home | All sections render with seed data | categories, featured, best sellers, new arrivals, offers, reviews | Pass |
| ST-02 | Home | Search box submits to shop page | `/shop?search=...` with results | Pass |
| ST-03 | Shop | Category filter | only that category shown | Pass |
| ST-04 | Shop | Price slider plus sort together | filtered and ordered | Pass |
| ST-05 | Shop | Pagination | page 2 loads a different set | Pass |
| ST-06 | Shop | No matches | empty state with reset button | Pass |
| ST-07 | Product | Gallery, specs, size, quantity render | all present | Pass |
| ST-08 | Product | Quantity cannot exceed stock | stepper stops at stock | Pass |
| ST-09 | Product | Add to cart as guest | redirected to login with `?next=` | Pass |
| ST-10 | Product | Related products shown | up to 4 from same category | Pass |
| ST-11 | Cart | Increase, decrease, remove | totals recompute each time | Pass |
| ST-12 | Cart | Apply and remove coupon | discount line appears and clears | Pass |
| ST-13 | Cart | Empty cart | empty-cart illustration and Shop link | Pass |
| ST-14 | Checkout | Submitting with blank fields | field-level error messages | Pass |
| ST-15 | Checkout | Invalid PIN code | rejected before submission | Pass |
| ST-16 | Checkout | COD order placed | success page with order number | Pass |
| ST-17 | Register | Mismatched confirm password | inline error, no request sent | Pass |
| ST-18 | Login | Wrong credentials | error toast, form retained | Pass |
| ST-19 | Login | Forgot-password modal | opens, validates email, confirms | Pass |
| ST-20 | Dashboard | Profile edit saves | values persist after reload | Pass |
| ST-21 | Dashboard | Order details modal | items, address, status timeline | Pass |
| ST-22 | Dashboard | Cancel a pending order | status becomes Cancelled | Pass |
| ST-23 | Wishlist | Move to cart | leaves wishlist, appears in cart | Pass |
| ST-24 | Admin | Login as admin lands on panel | stats visible | Pass |
| ST-25 | Admin | Create, edit, delete product | list updates each time | Pass |
| ST-26 | Admin | Stock update reflected on shop | new stock shown | Pass |
| ST-27 | Admin | Change order status | customer sees new status | Pass |
| ST-28 | Admin | Deactivate a user | that user can no longer log in | Pass |
| ST-29 | Global | Unknown URL | 404 page with home link | Pass |
| ST-30 | Global | Responsive layout at 390 px | nav collapses, grid becomes single column | Pass |

## 18.6 Security test cases

| ID | Test case | Expected | Result |
|---|---|---|---|
| SEC-01 | Open `/admin` while logged out | redirected to login | Pass |
| SEC-02 | Open `/admin` as a customer | access denied, redirected | Pass |
| SEC-03 | Call an admin API with a customer token | 403 | Pass |
| SEC-04 | Call a protected API with no token | 401 | Pass |
| SEC-05 | Call an API with a tampered token signature | 401 | Pass |
| SEC-06 | Call an API with an expired token | 401, session cleared in browser | Pass |
| SEC-07 | Inspect the users table | only BCrypt hashes, no plain text | Pass |
| SEC-08 | Inspect any user JSON response | no password field present | Pass |
| SEC-09 | SQL injection in the search box (`' OR 1=1 --`) | treated as a literal string, no rows leaked | Pass |
| SEC-10 | Script tag in a review comment | rendered as text, not executed | Pass |
| SEC-11 | Edit cart quantity in the request body beyond stock | server rejects | Pass |
| SEC-12 | Request another user's order by id | 403 / not found | Pass |
| SEC-13 | Register with an email already in use | rejected by unique constraint and service check | Pass |
| SEC-14 | Upload a non-image file | rejected by extension check | Pass |

## 18.7 Compatibility and responsiveness

| ID | Environment | Result |
|---|---|---|
| CT-01 | Chrome 124, desktop | Pass |
| CT-02 | Firefox 125, desktop | Pass |
| CT-03 | Edge 124, desktop | Pass |
| CT-04 | Chrome on Android, 390 px | Pass |
| CT-05 | Tablet, 768 px | Pass |
| CT-06 | Keyboard-only navigation, visible focus ring | Pass |
| CT-07 | `prefers-reduced-motion` honoured | Pass |

## 18.8 Summary

| Category | Cases | Passed | Failed |
|---|---|---|---|
| Unit | 13 | 13 | 0 |
| Integration | 34 | 34 | 0 |
| System | 30 | 30 | 0 |
| Security | 14 | 14 | 0 |
| Compatibility | 7 | 7 | 0 |
| **Total** | **98** | **98** | **0** |

## 18.9 Defects found and fixed during testing

| ID | Defect | Fix |
|---|---|---|
| BUG-01 | `/api/auth/me` was publicly matched, so an anonymous call threw an error instead of returning 401 | The security rule was narrowed to the three genuinely public auth endpoints |
| BUG-02 | Cancelling an order did not return stock to the catalogue | `OrderService.cancel` now restores each line item's quantity inside the transaction |
| BUG-03 | A coupon could be applied twice by re-submitting the form | The discount is recomputed server-side from the cart on every summary call |
| BUG-04 | The mobile navigation stayed open after following a link | The menu is closed on navigation in `ui.js` |
| BUG-05 | Deleting a category with products produced a raw SQL error page | The foreign key is now caught and returned as a readable 400 message |
