# 8. Hardware Requirements

## 8.1 Development machine

| Component | Minimum | Recommended |
|---|---|---|
| Processor | Dual-core 2.0 GHz (Intel i3 / AMD Ryzen 3) | Quad-core 2.5 GHz or faster (i5 / Ryzen 5 / Apple M1) |
| RAM | 4 GB | 8 GB or more |
| Free disk space | 10 GB | 20 GB (SSD) |
| Display | 1366 × 768 | 1920 × 1080 |
| Network | Required once, to download Maven dependencies | Broadband |

**Why 8 GB is the realistic figure.** A typical session runs the IDE (~1.5 GB),
the Spring Boot JVM (~500 MB), MySQL Server (~400 MB), MySQL Workbench
(~300 MB) and a browser with several tabs (~1 GB). On a 4 GB machine this
works but swaps heavily; on 8 GB it is comfortable.

## 8.2 Deployment server (if hosted)

| Component | Minimum | Recommended |
|---|---|---|
| Processor | 2 vCPU | 4 vCPU |
| RAM | 2 GB | 4 GB |
| Storage | 20 GB SSD | 40 GB SSD |
| Bandwidth | 1 TB / month | 2 TB / month |
| OS | Ubuntu Server 22.04 LTS | Ubuntu Server 22.04 LTS |

A 2 GB instance is enough because the application is stateless and the
database is small; most of the memory goes to the JVM heap (`-Xmx1g`) and
MySQL's InnoDB buffer pool.

## 8.3 Client devices

The interface is designed to be used, not merely to load, at these sizes.

| Device class | Screen width | Layout behaviour |
|---|---|---|
| Mobile phone | 320–620 px | Single-column grids; navigation collapses behind the ☰ button; the dashboard side-nav becomes a horizontal scroller; tables scroll inside their own container |
| Tablet | 621–960 px | Two-column product grid; search bar drops to its own row |
| Laptop | 961–1440 px | Three- to four-column grid; full horizontal navigation |
| Desktop | 1441 px and above | Content capped at a maximum container width so lines stay readable |

Client requirements are otherwise minimal: any device able to run a current
browser with JavaScript enabled. No plug-ins, no installation.

## 8.4 Peripherals used during development and demonstration

| Item | Purpose |
|---|---|
| Keyboard and mouse | Development |
| Projector or external display (HDMI) | Demonstrating the project to the evaluation panel |
| Smartphone | Verifying the responsive layout on real hardware rather than emulation |
