# 6. Non-Functional Requirements

## NFR-1 Performance

| ID | Requirement | How it is met |
|---|---|---|
| NFR-1.1 | A catalogue page shall return within 2 seconds on the development machine | Pagination limits each query to 12 rows; indexes on `category_id`, `price`, `rating` and `created_at` |
| NFR-1.2 | Queries shall not degrade linearly as the catalogue grows | Filtering, sorting and paging are done in SQL by `ProductRepository.search`, never in JavaScript |
| NFR-1.3 | The interface shall show visible feedback within 100 ms of any action | Skeleton loaders and spinners render before the request is issued |
| NFR-1.4 | Page weight shall stay small enough to load on a slow connection | No frameworks, no web fonts; product artwork is vector SVG, typically 1–3 KB |
| NFR-1.5 | The system shall support at least 50 concurrent users | Stateless JWT means no server-side session memory; the embedded Tomcat default of 200 threads is ample |

## NFR-2 Security

| ID | Requirement | How it is met |
|---|---|---|
| NFR-2.1 | Passwords shall never be stored or transmitted in recoverable form | BCrypt with a per-password salt; the hash column is nulled before any user object is serialised |
| NFR-2.2 | Authentication shall be stateless and token-based | JWT signed with HMAC-SHA256 and a 256-bit secret, 24-hour expiry |
| NFR-2.3 | Authorisation shall be enforced on the server, not the client | `SecurityConfig` matchers plus `@PreAuthorize("hasRole('ADMIN')")`; hiding UI elements is treated as cosmetic only |
| NFR-2.4 | All input shall be validated server-side | Jakarta Bean Validation on every DTO; `@Valid` on every controller method that takes a body |
| NFR-2.5 | The system shall be immune to SQL injection | All data access goes through JPA/Hibernate with bound parameters; no string-concatenated SQL exists in the codebase |
| NFR-2.6 | The system shall resist stored XSS | Every value interpolated into the DOM passes through `UI.escape()` |
| NFR-2.7 | Error responses shall not leak internals | A single `@RestControllerAdvice` converts every exception into a clean JSON body; stack traces stay in the server log |
| NFR-2.8 | Uploaded files shall be restricted | Extension allow-list, 5 MB cap, and a server-generated UUID filename so the client cannot control the path |

## NFR-3 Usability

| ID | Requirement | How it is met |
|---|---|---|
| NFR-3.1 | A new user shall complete a purchase without instruction | Conventional e-commerce layout: header search, category tiles, card grid, cart, checkout |
| NFR-3.2 | Any action shall be reachable in three clicks from the home page | Persistent header with search, cart, wishlist and account |
| NFR-3.3 | Every error message shall say what to do next | Messages are written as sentences, e.g. "Only 3 left in stock" rather than "Constraint violation" |
| NFR-3.4 | No list shall ever render as a blank area | Designed empty states with an icon, an explanation and an action button |
| NFR-3.5 | Destructive actions shall require confirmation | Deleting a product, category or coupon and cancelling an order all confirm first |

## NFR-4 Reliability and integrity

| ID | Requirement | How it is met |
|---|---|---|
| NFR-4.1 | Order placement shall be atomic | `OrderService.placeOrder` is `@Transactional`; any failure rolls back the order, the items, the stock decrement and the cart clear together |
| NFR-4.2 | Stock shall never be negative | Checked in `CartService.assertStock` on every cart change and re-checked at checkout; the database also carries `CHECK (stock >= 0)` |
| NFR-4.3 | Order history shall be immutable | `product_name` and `price` are snapshotted onto `order_items`; `ON DELETE RESTRICT` prevents a product that has been ordered from being erased |
| NFR-4.4 | Orphan rows shall not accumulate | `ON DELETE CASCADE` on cart, wishlist and review rows tied to a user or product |
| NFR-4.5 | A failed request shall leave the system unchanged | Service methods validate before they mutate |

## NFR-5 Maintainability

| ID | Requirement | How it is met |
|---|---|---|
| NFR-5.1 | Layers shall have one responsibility each | controller → service → repository → entity, with DTOs at the boundary |
| NFR-5.2 | Entities shall not be exposed as request bodies | Dedicated request DTOs carry validation annotations |
| NFR-5.3 | Configuration shall not be hard-coded | Database credentials, JWT secret and expiry, upload directory and seeding flag all live in `application.properties` |
| NFR-5.4 | The frontend shall have one place that talks to the API | `api.js` is the only module containing a `fetch` call |
| NFR-5.5 | Styling shall be centralised | Design tokens as CSS custom properties in `:root`; no colour literal appears in any HTML file |

## NFR-6 Portability and compatibility

| ID | Requirement | How it is met |
|---|---|---|
| NFR-6.1 | The system shall run on Windows, Linux and macOS | Java 17 and MySQL 8 are cross-platform; no OS-specific paths |
| NFR-6.2 | The frontend shall work in current Chrome, Firefox, Edge and Safari | Standard ES2020; no browser-specific APIs |
| NFR-6.3 | The interface shall be usable from 320 px to 1920 px | Fluid grids with breakpoints at 620, 800, 880, 900 and 960 px |
| NFR-6.4 | The demonstration shall not require internet access | Self-contained CSS, locally generated SVG artwork, no CDN dependency at runtime |

## NFR-7 Accessibility

| ID | Requirement | How it is met |
|---|---|---|
| NFR-7.1 | Interactive elements shall be keyboard reachable | Native `button`, `a` and form controls throughout |
| NFR-7.2 | Focus shall be visible | A global `:focus-visible` outline in the accent colour |
| NFR-7.3 | Controls shall be labelled | `<label for>` on every input; `aria-label` on icon-only buttons |
| NFR-7.4 | Motion shall be reducible | All transitions disabled under `@media (prefers-reduced-motion: reduce)` |
| NFR-7.5 | Text shall meet contrast guidance | Navy `#071324` and ink `#101828` on white exceed WCAG AA |

## NFR-8 Scalability (design headroom)

| ID | Requirement | How it is met |
|---|---|---|
| NFR-8.1 | Adding an application instance shall require no session replication | Authentication state lives entirely in the token |
| NFR-8.2 | The catalogue shall tolerate growth to tens of thousands of rows | Indexed, paginated, server-side querying |
| NFR-8.3 | The database shall be replaceable | Only JPA and standard SQL are used; no MySQL-specific feature is relied upon |
