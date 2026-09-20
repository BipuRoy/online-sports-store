# 13. Sequence Diagrams

## 13.1 Registration

```mermaid
sequenceDiagram
    actor U as Visitor
    participant B as Browser (auth.js)
    participant C as AuthController
    participant S as AuthService
    participant R as UserRepository
    participant E as BCryptPasswordEncoder
    participant J as JwtUtil
    participant DB as MySQL

    U->>B: Fills the registration form
    B->>B: Validate name, email, phone,<br/>password, confirmation
    alt Client-side validation fails
        B-->>U: Field-level errors; nothing is sent
    else Valid
        B->>C: POST /api/auth/register
        C->>C: @Valid — Bean Validation
        C->>S: register(request)
        S->>R: existsByEmail(email)
        R->>DB: SELECT COUNT(*) FROM users WHERE email = ?
        DB-->>R: 0
        R-->>S: false
        S->>S: Check password == confirmPassword
        S->>E: encode(rawPassword)
        E-->>S: $2a$10$... (60-char hash)
        S->>R: save(user with role CUSTOMER)
        R->>DB: INSERT INTO users ...
        DB-->>R: id = 5
        R-->>S: User
        S->>J: generateToken(email, "CUSTOMER")
        J-->>S: eyJhbGciOiJIUzI1NiJ9...
        S-->>C: AuthResponse
        C-->>B: 200 OK
        B->>B: localStorage.setItem("sportx_token", ...)
        B-->>U: "Account created" → dashboard
    end

    Note over S,DB: If the email already exists, the service throws<br/>BadRequestException. GlobalExceptionHandler turns it<br/>into 400 with "An account with this email already exists."<br/>The UNIQUE index on users.email is the second line of defence.
```

## 13.2 Add to cart, with the stock check

```mermaid
sequenceDiagram
    actor U as Customer
    participant B as Browser (ui.js)
    participant F as JwtAuthenticationFilter
    participant C as CartController
    participant S as CartService
    participant PR as ProductRepository
    participant CR as CartItemRepository
    participant DB as MySQL

    U->>B: Presses "Add to cart"
    B->>C: POST /api/cart {productId, quantity, size}<br/>Authorization: Bearer ...
    C->>F: (filter runs first)
    F->>F: Verify signature and expiry
    F->>F: Populate the SecurityContext
    C->>S: add(email, request)
    S->>PR: findById(productId)
    PR->>DB: SELECT * FROM products WHERE id = ?
    DB-->>PR: Product (stock = 3)
    PR-->>S: Product
    S->>CR: findByUserIdAndProductIdAndSize(...)
    CR-->>S: existing line, quantity = 2

    S->>S: desired = 2 + 2 = 4
    alt desired > stock
        S-->>C: BadRequestException("Only 3 left in stock")
        C-->>B: 400 Bad Request
        B-->>U: Error toast — nothing was saved
    else desired <= stock
        S->>CR: save(line with quantity 4)
        CR->>DB: UPDATE cart SET quantity = 4 WHERE id = ?
        DB-->>CR: ok
        CR-->>S: CartItem
        S-->>C: CartItem
        C-->>B: 200 OK
        B->>B: refreshCounts() updates the badge
        B-->>U: "Added to cart"
    end
```

## 13.3 Placing an order (the transactional path)

```mermaid
sequenceDiagram
    actor U as Customer
    participant B as Browser (checkout.js)
    participant C as OrderController
    participant OS as OrderService
    participant CS as CartService
    participant KS as CouponService
    participant PR as ProductRepository
    participant OR as OrderRepository
    participant DB as MySQL

    U->>B: Presses "Place order"
    B->>C: POST /api/orders {shipping details, paymentMethod, couponCode}
    C->>OS: placeOrder(email, request)

    rect rgb(240, 245, 255)
        Note over OS,DB: @Transactional — everything below commits or rolls back together
        OS->>CS: itemsFor(email)
        CS->>DB: SELECT * FROM cart WHERE user_id = ?
        DB-->>CS: 3 cart lines
        CS-->>OS: List<CartItem>

        alt Cart is empty
            OS-->>C: BadRequestException("Your cart is empty")
        end

        loop For each cart line
            OS->>OS: Verify quantity <= product.stock
        end

        alt Any line exceeds stock
            OS-->>C: BadRequestException naming the product
            Note over OS,DB: ROLLBACK — no order, no stock change, cart intact
        end

        OS->>OS: Recompute subtotal and product discount from the DB
        opt A coupon was supplied
            OS->>KS: validate(code, subTotal)
            KS->>DB: SELECT * FROM coupons WHERE code = ?
            KS-->>OS: discount %, or an exception with the reason
        end
        OS->>OS: delivery = (total > 999) ? 0 : 49

        OS->>OR: save(order)
        OR->>DB: INSERT INTO orders ...
        DB-->>OR: order id = 12

        loop For each cart line
            OS->>DB: INSERT INTO order_items (snapshot name and price)
            OS->>PR: product.stock -= quantity
            PR->>DB: UPDATE products SET stock = ? WHERE id = ?
        end

        OS->>DB: DELETE FROM cart WHERE user_id = ?
        Note over OS,DB: COMMIT
    end

    OS-->>C: Order
    C-->>B: 200 OK
    B-->>U: Redirect to /order-success?id=12
```

## 13.4 An unauthorised attempt to reach an admin endpoint

```mermaid
sequenceDiagram
    actor M as Customer (curious)
    participant T as Terminal / curl
    participant F as JwtAuthenticationFilter
    participant A as Spring Security authorisation
    participant C as ProductController

    Note over M: The customer noticed that /admin exists<br/>and tries to create a product directly.

    M->>T: curl -X POST /api/products -H "Bearer <customer token>"
    T->>F: Request with a valid customer token
    F->>F: Signature valid, not expired
    F->>F: Authorities = [ROLE_CUSTOMER]
    F->>A: Continue the chain
    A->>A: Matcher: POST /api/products requires hasRole("ADMIN")
    A-->>T: 403 Forbidden
    Note over C: The controller method never executes.

    Note over M,A: This is why authorisation lives on the server.<br/>Hiding the button in the UI would have stopped nothing.
```
