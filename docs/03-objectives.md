# 3. Objectives

## Primary objective

To design, build and document a complete three-tier e-commerce web application
for a sports retailer, using Java Spring Boot for the application tier, MySQL
for the data tier and HTML/CSS/JavaScript for the presentation tier, with
secure token-based authentication and role-based authorisation throughout.

## Specific objectives

### A. Database design

1. Design a normalised relational schema (third normal form) covering users,
   categories, products, cart, wishlist, orders, order items, reviews and
   coupons.
2. Enforce integrity with primary keys, foreign keys, `NOT NULL`, `UNIQUE` and
   `CHECK` constraints rather than relying on application code alone.
3. Add indexes on the columns actually used in `WHERE` and `JOIN` clauses, so
   catalogue queries stay fast as the product table grows.
4. Choose deletion semantics deliberately — `CASCADE` where child rows are
   meaningless without the parent, `RESTRICT` where deletion would destroy
   history.

### B. Backend development

5. Expose a REST API that follows HTTP conventions: nouns in the path, the verb
   in the method, and meaningful status codes.
6. Separate the code into clear layers — controller, service, repository,
   entity, DTO, configuration, exception — so that each has one responsibility.
7. Validate every incoming request with Bean Validation and return field-level
   error messages a human can act on.
8. Handle every exception in one place so the API never leaks a stack trace to
   the client.

### C. Security

9. Store passwords only as BCrypt hashes.
10. Authenticate with stateless JSON Web Tokens so the server holds no session
    state.
11. Implement two roles, `CUSTOMER` and `ADMIN`, and enforce the boundary on
    the server for every administrative endpoint.
12. Prevent duplicate registration on the same email address, at both the
    application and database levels.

### D. Frontend development

13. Build a responsive interface that is usable on phone, tablet and desktop
    from a single codebase, with no horizontal scrolling at any width.
14. Apply a consistent, sports-themed visual language: dark navy, white, light
    grey and an orange accent.
15. Give the user feedback for every action — loading skeletons while data
    arrives, toasts on success, readable messages on failure, and a designed
    empty state wherever a list can be empty.
16. Keep the interface accessible: semantic HTML, labelled form controls,
    visible focus outlines, and honouring `prefers-reduced-motion`.

### E. Functional coverage

17. Implement the complete purchase journey: browse → search → filter → sort →
    view details → add to cart → apply coupon → checkout → place order → track.
18. Implement the wishlist, product reviews with star ratings, and a coupon
    system with a minimum order value and an expiry date.
19. Implement an administrative panel covering statistics, product and category
    CRUD, stock updates, image upload, order status control and user management.
20. Guarantee that a customer can never order more units than are in stock,
    checked on the server at both add-to-cart and checkout.

### F. Documentation

21. Produce the full set of project documents — requirement specifications, ER,
    use case, class, activity, sequence and data-flow diagrams, API reference
    and a test report — to the standard expected of a B.Tech project.
