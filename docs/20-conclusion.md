# 20. Conclusion

SPORTX – Online Sports Store was undertaken to build, from an empty
folder to a running application, a complete online retail system for
sports equipment, and to do so with the same layering and discipline
that a production system would use.

The finished system delivers everything set out in the objectives. A
visitor can browse a catalogue of realistic products across cricket,
football, badminton, basketball, fitness, running and tennis; search,
filter by category and price, sort and page through the results; open a
product and read its specifications, ratings and reviews; register and
log in; build a cart that refuses to exceed available stock; apply a
coupon; check out with cash on delivery or a simulated online payment;
maintain a wishlist and saved addresses; and follow each order through
the statuses Pending, Confirmed, Packed, Shipped, Delivered and
Cancelled. An administrator, entering through the same login but landing
in a separate panel, sees live figures for users, products, orders,
revenue and pending deliveries, and manages products, categories,
stock, orders, users and coupons.

Behind the interface, a Spring Boot REST API is arranged in the
conventional layers — controller, service, repository, entity, DTO,
configuration and exception handling — so that each class has a single
responsibility and the reasoning behind any behaviour can be traced
through one path. A normalised MySQL schema of nine related tables
carries the data, with primary keys, foreign keys, unique constraints,
check constraints and indexes placed where the queries actually need
them. Security is handled where it belongs: passwords are stored only as
BCrypt hashes, authentication is a signed JWT, authorisation is enforced
by the server on every protected route rather than by hiding buttons,
and every request body is validated before it reaches a service.

Just as instructive as the features were the decisions taken along the
way. Serving the frontend from the backend's static directory removed
an entire class of cross-origin problems. Writing the stylesheet by hand
rather than pulling in a framework kept the page weight small and meant
the site renders correctly with no internet connection — a practical
concern for a college demonstration. Computing filtering, sorting and
paging in SQL rather than in JavaScript keeps the catalogue fast as it
grows. Guarding stock inside a database transaction, rather than in the
browser, is what makes the stock rule trustworthy.

The project also gave practical experience of the fuller software
lifecycle: gathering and numbering requirements, modelling the system
with ER, use case, class, activity, sequence and data-flow diagrams,
implementing in layers, testing at unit, integration, system and
security levels, recording the defects that testing uncovered, and
documenting the result. Ninety-eight test cases were executed and five
defects found and fixed, which is a reminder that code that appears to
work and code that has been verified are not the same thing.

Several worthwhile things remain outside the current version — a real
payment gateway, genuine email-based password reset, a component-based
frontend, automated test suites and cloud deployment — and these are set
out in the Future Scope. Their absence is a matter of scope rather than
of design: the REST contract, the schema and the layered structure were
all built so that these additions can be made without rewriting what
already exists.

In summary, SPORTX meets its stated objectives as a functional,
secure and responsive full-stack e-commerce application, and the process
of building it turned the separate subjects of the curriculum — database
design, web technologies, object-oriented programming, software
engineering and network security — into a single working system.
