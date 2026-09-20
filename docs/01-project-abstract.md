# 1. Project Abstract

**Project title:** SPORTX — Online Sports Store
**Discipline:** B.Tech, Computer Science & Engineering
**Category:** Web application / E-commerce

## Abstract

Sports equipment is still bought largely from small neighbourhood shops whose
stock is limited to whatever the owner could fit on a shelf. A customer who
wants a size-6 cricket bat of a particular weight, or a shuttlecock of a
specific grade, usually has to visit several shops, has no reliable way to
compare prices, and has no record of what they bought or when.

SPORTX is a full-stack web application that moves that whole transaction
online. It is a sports e-commerce platform where a visitor can browse a
catalogue organised into seven categories — cricket, football, badminton,
basketball, fitness, running and tennis — search and filter it, read reviews
left by other buyers, save products to a wishlist, add them to a cart, apply a
discount coupon, and place an order paying either by cash on delivery or
through a simulated online payment gateway. Every order can then be tracked
through six states, from *Pending* to *Delivered*.

The system is built as a three-tier application. The presentation tier is
written in HTML5, CSS3 and vanilla JavaScript, and talks to the server only
through REST calls, so the interface never contains business logic. The
application tier is a Java **Spring Boot** service that exposes a REST API,
validates every request, enforces authentication and authorisation, and
contains the rules that matter — stock can never go negative, a coupon cannot
be used below its minimum order value, a shipped order cannot be cancelled.
The data tier is a **MySQL** relational database of nine normalised tables
joined by foreign keys.

Security is handled with **JSON Web Tokens**. Passwords are never stored in
readable form; they are hashed with **BCrypt**, a deliberately slow adaptive
hash. Two roles exist — `CUSTOMER` and `ADMIN` — and every administrative
endpoint is guarded on the server, so an ordinary customer cannot reach the
admin panel even by typing its URL directly.

Alongside the storefront, the project includes a complete administrative
back-office: a dashboard of live statistics, full create-read-update-delete
management of products and categories, inline stock editing, order status
control, customer activation and deactivation, and coupon management.

The result is a working, demonstrable system that exercises the full range of
skills expected of a CSE project — relational database design, REST API
design, server-side security, responsive front-end development and software
documentation — while remaining small enough to be understood, explained and
defended in a viva.

**Keywords:** E-commerce, Spring Boot, REST API, MySQL, JWT, BCrypt,
role-based access control, responsive web design, three-tier architecture.
