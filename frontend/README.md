# SPORTX — frontend

The live frontend is the copy Spring Boot serves from
`backend/src/main/resources/static/`. Opening `http://localhost:8080`
after starting the backend loads it, so there is no separate dev server,
no build step and no CORS configuration to worry about.

This `frontend/src/` tree is the same code arranged in the folder layout
the project specification asks for, so the structure is easy to show and
explain:

```
frontend/src/
  components/   ui.js          shared header, footer, product card, toasts
  pages/        *.html         every page of the site
  services/     api.js         the single REST client for the Spring Boot API
  styles/       styles.css     design tokens and all component styles
  utils/        *.js           the per-page controllers
  assets/       products/, categories/   product and category artwork (SVG)
```

## Editing

Edit the files under `backend/src/main/resources/static/`. Those are the
ones the server actually sends to the browser. After changing a file,
refresh the page — Spring Boot serves static resources straight from disk
when the app is started with `mvn spring-boot:run`.

If you prefer to serve the frontend on its own (for example with the
VS Code Live Server extension on port 5500):

1. Open `services/api.js` and set `const BASE = "http://localhost:8080";`
2. Start the backend as usual. `SecurityConfig` already allows cross-origin
   requests from any origin for development.

## Styling

`styles/styles.css` is self-contained so the site renders correctly with no
internet connection — useful when demonstrating the project on a college
machine. If you would rather use Tailwind or Bootstrap, add their CDN
`<link>`/`<script>` in each page's `<head>`; their utility classes can sit
alongside the `sx-` component classes without conflicting.
