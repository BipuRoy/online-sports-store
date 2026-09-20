# 19. Future Scope

The present version of SPORTX is a complete and working e-commerce
system, but it was deliberately kept within the boundaries of a single
academic semester. The following enhancements are the natural next
steps, listed roughly in the order in which they would be attempted.

## 19.1 Payments

| Enhancement | Description |
|---|---|
| Real payment gateway | Replace the mock online-payment step with Razorpay or Stripe: create an order on the gateway, verify the signature server-side, and only then mark the order paid. |
| UPI and wallets | Add UPI intent links and wallet options, which dominate Indian online retail. |
| EMI and pay-later | Integrate instalment options for higher-value equipment such as bats and treadmills. |
| Refunds | An automated refund pipeline tied to the cancellation and return flows. |

## 19.2 Search and discovery

| Enhancement | Description |
|---|---|
| Full-text and fuzzy search | Move from `LIKE` matching to MySQL full-text indexes or Elasticsearch so that misspellings still return results. |
| Autocomplete | A type-ahead dropdown in the navbar backed by a lightweight suggestions endpoint. |
| Faceted filters | Brand, size, colour and rating facets with live counts beside each option. |
| Recommendations | "Customers who bought this also bought" using order-history co-occurrence, and later a collaborative-filtering model. |

## 19.3 Customer features

| Enhancement | Description |
|---|---|
| Email verification and real password reset | Send a signed, time-limited token by email; the current forgot-password screen is a user-interface placeholder. |
| Social login | Google and Facebook sign-in through OAuth 2.0. |
| Returns and exchanges | A request flow with approval, pickup scheduling and refund status. |
| Product comparison | Side-by-side comparison of up to four products in the same category. |
| Reviews with photos | Image uploads on reviews, plus a verified-purchase badge and helpfulness voting. |
| Notifications | Email and SMS updates at each order status change, and optional web push. |
| Loyalty points | Points earned per order and redeemable against future purchases. |
| Multi-language | Bengali, Hindi and English interfaces through resource bundles. |

## 19.4 Administration and operations

| Enhancement | Description |
|---|---|
| Analytics dashboard | Revenue trends, best-selling categories, conversion funnel and repeat-customer rate, drawn as charts. |
| Bulk operations | CSV import and export for products, and bulk price or stock updates. |
| Inventory alerts | Automatic low-stock email alerts and supplier reorder suggestions. |
| Role granularity | Additional roles such as Inventory Manager and Support Agent, each with its own permissions. |
| Audit log | An immutable record of every administrative action with actor, timestamp and previous value. |
| Shipping integration | Live tracking through a courier API instead of manually updated statuses. |

## 19.5 Technical evolution

| Enhancement | Description |
|---|---|
| React or Angular frontend | Rebuild the interface as a component-based single-page application while keeping the same REST contract. |
| Mobile application | An Android application in Kotlin, or a cross-platform Flutter client, reusing the existing API. |
| Refresh tokens | Short-lived access tokens with rotating refresh tokens, and server-side revocation on logout. |
| Caching | Redis in front of the catalogue and category queries to cut database load. |
| Cloud object storage | Move product images to Amazon S3 or Cloudinary with a CDN, instead of the local `uploads` directory. |
| Containerisation | Docker images for the application and the database, orchestrated with Docker Compose for one-command setup. |
| CI/CD | GitHub Actions running the test suite on every push and deploying automatically on merge to the main branch. |
| Automated tests | JUnit 5 and Mockito unit tests, Testcontainers integration tests, and Cypress end-to-end tests to replace the manual suite documented in section 18. |
| Observability | Spring Boot Actuator with Prometheus metrics and Grafana dashboards, plus structured logging. |
| Progressive Web App | A service worker for offline catalogue browsing and an installable home-screen icon. |
