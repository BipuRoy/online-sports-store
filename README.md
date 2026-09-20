# SPORTX — Online Sports Store

A complete full-stack e-commerce application for sports equipment, built
as a B.Tech CSE final-year project.

**Stack:** HTML5 · CSS3 · vanilla JavaScript (ES6 modules) frontend ·
Java 17 + Spring Boot 3.2.5 REST API · MySQL 8 · JWT authentication with
CUSTOMER / ADMIN roles.

---

## 1. Quick start

```bash
# 1. Database
mysql -u root -p < database/schema.sql
mysql -u root -p < database/sample-data.sql

# 2. Backend (also serves the frontend)
cd backend
mvn spring-boot:run

# 3. Open the site
#    http://localhost:8080
```

---

## 2. Prerequisites

| Software | Version | Notes |
|---|---|---|
| JDK | 17 or later | `java -version` |
| Maven | 3.8 or later | `mvn -v`. Or use the bundled wrapper if present. |
| MySQL | 8.0 or later | Server must be running on port 3306 |
| Browser | Any modern browser | Chrome, Firefox or Edge |
| IDE (optional) | IntelliJ IDEA / Eclipse / VS Code | |

An internet connection is required **only the first time**, so Maven can
download the dependencies. After that the project runs fully offline —
the stylesheet is self-contained and all product artwork is local SVG.

---

## 3. Database setup

### Option A — run the SQL scripts (recommended)

```bash
mysql -u root -p < database/schema.sql        # creates sportx_db + 9 tables
mysql -u root -p < database/sample-data.sql   # 4 users, 7 categories, 26 products, 3 coupons, reviews, orders
```

`schema.sql` drops and recreates `sportx_db`, so run it on a fresh
database only.

### Option B — let the application create everything

If you skip the scripts, Spring Boot will create the schema from the JPA
entities (`ddl-auto=update`) and `DataSeeder` will insert the categories,
26 products, coupons and the two demo accounts on first start. This is
controlled by `sportx.seed.enabled=true` in `application.properties`.

### Change the database credentials

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sportx_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root
```

---

## 4. Backend setup

```bash
cd backend
mvn clean install       # builds and packages
mvn spring-boot:run     # starts on http://localhost:8080
```

Or run the packaged jar:

```bash
java -jar target/sportx-0.0.1-SNAPSHOT.jar
```

Or, in an IDE, run `com.sportx.SportxApplication`.

You should see `Started SportxApplication in ... seconds` in the console.

---

## 5. Frontend setup

**There is nothing to install.** Spring Boot serves the frontend from
`backend/src/main/resources/static/`, so the whole site is live at
`http://localhost:8080` as soon as the backend starts. Same origin means
no CORS configuration and no separate dev server.

`frontend/src/` contains the same code arranged in the folder structure
required by the specification (`components/`, `pages/`, `services/`,
`styles/`, `utils/`, `assets/`). Edit the copy under
`backend/src/main/resources/static/` — that is the one the browser
receives.

### Pages

| URL | Page |
|---|---|
| `/` | Home |
| `/shop` | Product listing with search, filters, sort, pagination |
| `/product?id=1` | Product details |
| `/cart` | Shopping cart |
| `/checkout` | Checkout |
| `/login`, `/register` | Authentication |
| `/dashboard` | Customer dashboard |
| `/wishlist` | Wishlist |
| `/admin` | Admin panel (ADMIN role only) |
| `/about`, `/contact`, `/faq` | Static pages |
| anything else | 404 page |

---

## 6. Default login credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@sportx.com` | `admin123` |
| Customer | `customer@sportx.com` | `customer123` |
| Customer | `rahul@example.com` | `user123` |
| Customer | `ananya@example.com` | `user123` |

Logging in as the admin account redirects straight to `/admin`.
These are also shown on the login page for convenience during the demo —
remove that block before any real deployment.

### Coupon codes

| Code | Discount | Minimum order |
|---|---|---|
| `SPORTX10` | 10% | ₹999 |
| `PLAY20` | 20% | ₹2,999 |
| `NEW5` | 5% | ₹499 |

Delivery is ₹49, free on orders of ₹999 or more.

---

## 7. Project structure

```
sportx/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/sportx/
│       │   ├── SportxApplication.java
│       │   ├── config/         SecurityConfig, WebConfig, DataSeeder
│       │   ├── controller/     13 REST + page controllers
│       │   ├── service/        10 business-logic services
│       │   ├── repository/     8 Spring Data JPA repositories
│       │   ├── entity/         9 entities + Role, OrderStatus enums
│       │   ├── dto/            12 request/response objects
│       │   ├── security/       JwtUtil, JwtAuthenticationFilter, UserDetailsService
│       │   └── exception/      GlobalExceptionHandler + 2 custom exceptions
│       └── resources/
│           ├── application.properties
│           └── static/         index.html, pages/, css/, js/, assets/
├── frontend/src/               same frontend in the required folder layout
│   ├── components/  pages/  services/  styles/  utils/  assets/
├── database/
│   ├── schema.sql              9 tables with keys, constraints, indexes
│   └── sample-data.sql         realistic seed data
├── docs/                       the 20 project documents (see below)
└── README.md
```

---

## 8. API reference

Base URL `http://localhost:8080`. Protected routes need the header
`Authorization: Bearer <token>`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create an account, returns a JWT |
| POST | `/api/auth/login` | Public | Log in, returns a JWT |
| POST | `/api/auth/logout` | Auth | Acknowledgement; the client discards the token |
| GET | `/api/auth/me` | Auth | Current user profile |
| POST | `/api/auth/change-password` | Auth | Change password |
| GET | `/api/products` | Public | List with `search`, `categoryId`, `minPrice`, `maxPrice`, `sort`, `page`, `size` |
| GET | `/api/products/{id}` | Public | Single product |
| GET | `/api/products/featured` · `/best-sellers` · `/new-arrivals` | Public | Home-page sections |
| GET | `/api/products/{id}/related` | Public | Related products |
| POST · PUT · DELETE | `/api/products` · `/api/products/{id}` | **Admin** | Product CRUD |
| GET | `/api/categories` | Public | All categories |
| POST · PUT · DELETE | `/api/categories` · `/{id}` | **Admin** | Category CRUD |
| GET · POST · PUT · DELETE | `/api/cart` … | Auth | Cart operations |
| GET | `/api/cart/summary?coupon=CODE` | Auth | Subtotal, discount, delivery, total |
| GET · POST · DELETE | `/api/wishlist` … | Auth | Wishlist operations |
| POST | `/api/orders` | Auth | Place an order |
| GET | `/api/orders` · `/api/orders/{id}` | Auth | Order history and details |
| PUT | `/api/orders/{id}/cancel` | Auth | Cancel before dispatch |
| PUT | `/api/orders/{id}/status` | **Admin** | Update order status |
| GET | `/api/users` | **Admin** | All users |
| GET · PUT | `/api/users/profile` | Auth | View and edit own profile |
| GET · POST | `/api/reviews` | Public / Auth | Read and write reviews |
| GET | `/api/admin/stats` | **Admin** | Dashboard figures |
| POST | `/api/coupons/validate` | Public | Validate a coupon code |
| POST | `/api/upload` | **Admin** | Product image upload |
| POST | `/api/contact` | Public | Contact form |

Full request and response bodies are in `docs/17-api-documentation.md`.

---

## 9. Testing the API

### curl

```bash
# Log in as the admin and capture the token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sportx.com","password":"admin123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Public: browse the catalogue
curl "http://localhost:8080/api/products?search=cricket&sort=priceAsc&page=0&size=6"

# Protected: admin dashboard statistics
curl http://localhost:8080/api/admin/stats -H "Authorization: Bearer $TOKEN"

# Register a new customer
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"9876543210","password":"test123"}'

# Add a product to the cart (use a customer token)
curl -X POST http://localhost:8080/api/cart \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"productId":1,"quantity":2,"size":"SH"}'
```

### Postman

1. `POST /api/auth/login` with the admin credentials.
2. Copy `token` from the response.
3. In the collection settings choose Authorization type **Bearer Token**
   and paste it, so every request inherits it.
4. Exercise the endpoints in the table above.

Expected status codes: `200` success, `400` validation or business-rule
failure, `401` missing or invalid token, `403` wrong role, `404` not
found.

---

## 10. Project documentation

The twenty documents required for the report are in `docs/`:

| File | Document |
|---|---|
| `01-project-abstract.md` | Project Abstract |
| `02-problem-statement.md` | Problem Statement |
| `03-objectives.md` | Objectives |
| `04-scope.md` | Scope |
| `05-functional-requirements.md` | Functional Requirements |
| `06-non-functional-requirements.md` | Non-Functional Requirements |
| `07-software-requirements.md` | Software Requirements |
| `08-hardware-requirements.md` | Hardware Requirements |
| `09-er-diagram.md` | ER Diagram |
| `10-use-case-diagram.md` | Use Case Diagram |
| `11-class-diagram.md` | Class Diagram |
| `12-activity-diagram.md` | Activity Diagram |
| `13-sequence-diagram.md` | Sequence Diagram |
| `14-dfd-level-0.md` | DFD Level 0 |
| `15-dfd-level-1.md` | DFD Level 1 |
| `16-database-schema.md` | Database Schema |
| `17-api-documentation.md` | API Documentation |
| `18-testing.md` | Testing (98 test cases) |
| `19-future-scope.md` | Future Scope |
| `20-conclusion.md` | Conclusion |

The diagrams are written in Mermaid. They render automatically on GitHub
and in VS Code with the Markdown Preview Mermaid extension; for the
printed report, paste the code into <https://mermaid.live> and export
PNG or SVG.

---

## 11. Notes and known limitations

- **Online payment is a mock.** Choosing it marks the order as paid
  immediately. No gateway is contacted and no card details are collected.
- **Forgot password is a user-interface placeholder.** It validates the
  email and confirms, but sends no email; real reset needs a mail server.
- **Logout is client-side.** The JWT is discarded by the browser; there
  is no server-side token blacklist. Tokens expire after 24 hours.
- **The stylesheet is hand-written** rather than Tailwind or Bootstrap, so
  the site renders with no internet connection. If your submission
  requires one of those frameworks, add its CDN link in the `<head>` of
  the pages and migrate the class names gradually — the markup is plain
  semantic HTML.
- **Product images are generated SVG files** under
  `static/assets/products/`. Replace them with photographs at the same
  paths, or upload new images through the admin panel.
- **The Java code has not been compiled in this environment** because the
  build machine had no network access for Maven to fetch dependencies.
  Run `mvn clean install` once on your own machine; if the compiler
  reports anything, the most likely place is the JPQL filter query in
  `ProductRepository.search`.
- Uploaded images are written to `backend/uploads/` and served from
  `/uploads/**`. Create that folder if the first upload fails.

---

## 12. Troubleshooting

| Problem | Cause and fix |
|---|---|
| `Communications link failure` | MySQL is not running, or the port is not 3306 |
| `Access denied for user 'root'` | Update the username and password in `application.properties` |
| `Port 8080 was already in use` | Stop the other process, or set `server.port=8081` |
| Page loads but no products | The database is empty — run `sample-data.sql`, or set `sportx.seed.enabled=true` and restart |
| Login always fails | The `users` table holds plain-text passwords; re-run `sample-data.sql`, which contains genuine BCrypt hashes |
| 403 on every admin action | You are logged in as a customer; log in as `admin@sportx.com` |
| Stylesheet missing | Open through `http://localhost:8080`, not by double-clicking the HTML file |
| Maven build fails on first run | No internet connection; dependencies must be downloaded once |
