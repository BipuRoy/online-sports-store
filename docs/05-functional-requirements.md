# 5. Functional Requirements

Each requirement has an identifier, a priority and a description. Priorities
are **H** (must have), **M** (should have) and **L** (nice to have).

## FR-1 User management

| ID | Pri | Requirement |
|---|---|---|
| FR-1.1 | H | The system shall allow a visitor to register with name, email, phone, password and password confirmation. |
| FR-1.2 | H | The system shall reject a registration whose email already exists, and report this clearly. |
| FR-1.3 | H | The system shall validate name (≥ 3 characters), email (valid format), phone (10 digits beginning 6–9) and password (≥ 6 characters) on both client and server. |
| FR-1.4 | H | The system shall reject a registration where password and confirmation differ. |
| FR-1.5 | H | The system shall store passwords only as BCrypt hashes and shall never return a password hash in any API response. |
| FR-1.6 | H | The system shall authenticate a user by email and password and issue a JWT valid for 24 hours. |
| FR-1.7 | H | The system shall refuse authentication to a deactivated account. |
| FR-1.8 | H | The system shall allow a signed-in user to sign out, discarding the token. |
| FR-1.9 | M | The system shall provide a forgot-password interface that validates the email address and confirms that a reset link has been sent. |
| FR-1.10 | M | The system shall allow a signed-in user to change their password after re-entering the current one. |
| FR-1.11 | M | The system shall allow a signed-in user to edit their name, phone and saved address. |

## FR-2 Catalogue

| ID | Pri | Requirement |
|---|---|---|
| FR-2.1 | H | The system shall display all active products in a paginated listing, 12 per page by default. |
| FR-2.2 | H | The system shall allow a keyword search across product name, brand and description. |
| FR-2.3 | H | The system shall allow filtering by category. |
| FR-2.4 | H | The system shall allow filtering by minimum and maximum price. |
| FR-2.5 | M | The system shall allow filtering by minimum star rating. |
| FR-2.6 | H | The system shall allow sorting by price ascending, price descending, rating and newest. |
| FR-2.7 | H | The system shall show, for each product, its image, name, category, brand, price, discounted price, rating and stock status. |
| FR-2.8 | H | The system shall present a detail page showing multiple images, full description, specification table, available sizes, colour, stock count, related products and reviews. |
| FR-2.9 | M | The system shall mark products as Featured, Best Seller or New Arrival and display each group on the home page. |

## FR-3 Cart

| ID | Pri | Requirement |
|---|---|---|
| FR-3.1 | H | The system shall allow a signed-in customer to add a product, with an optional size, to their cart. |
| FR-3.2 | H | The system shall increase the quantity of an existing cart line rather than creating a duplicate line for the same product and size. |
| FR-3.3 | H | **The system shall refuse any cart operation that would make the quantity exceed the product's available stock, and shall state the remaining quantity.** |
| FR-3.4 | H | The system shall allow a customer to increase, decrease or remove a cart line, and to empty the cart. |
| FR-3.5 | H | The system shall compute and display total quantity, subtotal, product discount, coupon discount, delivery charge and final total. |
| FR-3.6 | H | The system shall charge ₹49 delivery and shall waive it on orders whose value exceeds ₹999. |
| FR-3.7 | H | The system shall persist the cart against the user account so that it survives sign-out and a change of device. |

## FR-4 Wishlist

| ID | Pri | Requirement |
|---|---|---|
| FR-4.1 | H | The system shall allow a signed-in customer to save a product to a wishlist. |
| FR-4.2 | H | The system shall prevent the same product being saved twice. |
| FR-4.3 | H | The system shall allow removal from the wishlist. |
| FR-4.4 | M | The system shall allow a saved product to be moved into the cart in one action, removing it from the wishlist only if the cart addition succeeded. |

## FR-5 Coupons

| ID | Pri | Requirement |
|---|---|---|
| FR-5.1 | M | The system shall allow a coupon code to be applied to the cart. |
| FR-5.2 | H | The system shall reject a coupon that does not exist, is disabled, has expired, or whose minimum order value is not met, giving the reason. |
| FR-5.3 | H | The system shall recompute the coupon discount on the server at checkout rather than trusting a value sent by the browser. |

## FR-6 Checkout and orders

| ID | Pri | Requirement |
|---|---|---|
| FR-6.1 | H | The system shall collect full name, email, phone, address, city, state, country and PIN code, and validate each. |
| FR-6.2 | H | The system shall display an order summary before the order is placed. |
| FR-6.3 | H | The system shall offer Cash on Delivery and a clearly-labelled simulated online payment. |
| FR-6.4 | H | The system shall, within a single database transaction, create the order, copy the cart into order items, decrement product stock and empty the cart. |
| FR-6.5 | H | The system shall re-verify stock at checkout and abort the whole order if any line is no longer available. |
| FR-6.6 | H | The system shall store the product name and unit price on each order item as a snapshot, so later catalogue edits do not alter order history. |
| FR-6.7 | H | The system shall list a customer's orders with ID, date, item count, total, payment method and status. |
| FR-6.8 | H | The system shall track order status through PENDING, CONFIRMED, PACKED, SHIPPED, DELIVERED and CANCELLED. |
| FR-6.9 | H | The system shall allow a customer to cancel their own order only while it is PENDING, CONFIRMED or PACKED, and shall return the stock on cancellation. |
| FR-6.10 | H | The system shall not allow a customer to read another customer's order. |

## FR-7 Reviews

| ID | Pri | Requirement |
|---|---|---|
| FR-7.1 | M | The system shall allow a signed-in customer to leave a 1–5 star rating with a comment on a product. |
| FR-7.2 | M | The system shall allow only one review per customer per product. |
| FR-7.3 | M | The system shall recalculate the product's average rating and review count whenever a review is added. |
| FR-7.4 | H | The system shall display all reviews for a product with the reviewer's name, rating, comment and date. |

## FR-8 Administration

| ID | Pri | Requirement |
|---|---|---|
| FR-8.1 | H | The system shall restrict every administrative endpoint to users holding the ADMIN role, enforced on the server. |
| FR-8.2 | H | The system shall present a dashboard of total users, products, orders and revenue, plus pending, delivered and cancelled counts and a low-stock count. |
| FR-8.3 | H | The system shall allow an administrator to create, edit and delete products, setting every catalogue field. |
| FR-8.4 | H | The system shall allow inline editing of a product's stock. |
| FR-8.5 | M | The system shall allow an administrator to upload a product image file, accepting JPG, PNG, WEBP and GIF up to 5 MB. |
| FR-8.6 | H | The system shall allow an administrator to create, edit and delete categories, and shall refuse deletion while products reference the category. |
| FR-8.7 | H | The system shall allow an administrator to view all orders, filter them by status and change an order's status. |
| FR-8.8 | H | The system shall allow an administrator to view all users and activate or deactivate a customer account. |
| FR-8.9 | M | The system shall allow an administrator to create and delete coupons. |

## FR-9 Supporting content

| ID | Pri | Requirement |
|---|---|---|
| FR-9.1 | L | The system shall provide About Us, Contact and FAQ pages. |
| FR-9.2 | M | The system shall provide a contact form that validates its input and confirms submission. |
| FR-9.3 | M | The system shall provide a designed 404 page for unknown URLs. |
| FR-9.4 | M | The system shall show a loading indicator while data is being fetched, a success toast after a successful action, a readable message on failure, and a designed empty state wherever a list can be empty. |
