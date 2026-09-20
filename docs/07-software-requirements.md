# 7. Software Requirements

## 7.1 Development environment

| Software | Version | Purpose |
|---|---|---|
| JDK (Temurin / Oracle / OpenJDK) | 17 or later (LTS) | Compiles and runs the Spring Boot application |
| Apache Maven | 3.8 or later | Dependency management and build |
| MySQL Server | 8.0 or later | Relational database |
| MySQL Workbench | 8.0 | Visual schema design, query console, ER export |
| IntelliJ IDEA Community / Eclipse IDE for Enterprise Java / VS Code | current | Java development |
| Git | 2.30 or later | Version control |
| Postman | current | Manual API testing |
| Google Chrome (or Firefox) | current | Running and debugging the frontend |
| Operating system | Windows 10/11, Ubuntu 20.04+, or macOS 12+ | Any of these is sufficient |

## 7.2 Backend dependencies

Declared in `backend/pom.xml`.

| Dependency | Version | Role |
|---|---|---|
| `spring-boot-starter-web` | 3.2.5 | Embedded Tomcat, Spring MVC, Jackson JSON |
| `spring-boot-starter-data-jpa` | 3.2.5 | Hibernate ORM, repository abstraction, transactions |
| `spring-boot-starter-security` | 3.2.5 | Authentication filter chain, `BCryptPasswordEncoder`, method security |
| `spring-boot-starter-validation` | 3.2.5 | Jakarta Bean Validation (Hibernate Validator) |
| `mysql-connector-j` | runtime | JDBC driver for MySQL 8 |
| `jjwt-api`, `jjwt-impl`, `jjwt-jackson` | 0.12.5 | Creating and verifying JSON Web Tokens |
| `spring-boot-starter-test` | 3.2.5 | JUnit 5, Mockito, AssertJ |
| `spring-security-test` | 3.2.5 | Authentication helpers for controller tests |
| `h2` | test | In-memory database for repository tests |

## 7.3 Frontend technologies

| Technology | Role |
|---|---|
| HTML5 | Semantic page structure |
| CSS3 | Custom properties, Flexbox, Grid, media queries, transitions |
| JavaScript (ES2020) | Page logic, `fetch`, async/await, template literals, modules by convention |
| SVG | All product and category artwork, generated locally so it works offline |
| Web Storage API | `localStorage` for the JWT and cached profile; `sessionStorage` for the applied coupon |

> **On Bootstrap and Tailwind.** The specification allows either. This project
> ships a self-contained stylesheet instead, for one practical reason: the
> demonstration has to work on a college machine with no internet, and a CDN
> link fails silently in that situation, leaving an unstyled page in front of
> the examiner. Either framework can be added by placing its CDN tag in each
> page's `<head>`; its utility classes coexist with the `sx-` component classes
> without conflict.

## 7.4 Runtime requirements (deployment)

| Requirement | Detail |
|---|---|
| Java Runtime | JRE 17 or later |
| Database | MySQL 8.0, reachable on port 3306 |
| Application port | 8080 (configurable via `server.port`) |
| Disk | ~200 MB for the JAR, dependencies and uploaded images |
| Browser | Any modern browser with JavaScript enabled |

## 7.5 Architecture summary

```
Browser  ──HTTP/JSON──▶  Spring Boot (Tomcat, port 8080)  ──JDBC──▶  MySQL 8
  │                        │                                          │
  │ HTML, CSS, JS, SVG     │ Controllers → Services → Repositories    │ 9 tables
  │ served from            │ JWT filter, BCrypt, Bean Validation      │ FKs, indexes
  └─ /static               └─ Hibernate ORM                           └─ sportx_db
```
