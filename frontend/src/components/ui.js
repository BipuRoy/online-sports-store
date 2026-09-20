/* =====================================================================
   SPORTX - static/js/ui.js
   Shared interface pieces: header, footer, toasts, formatting and the
   product card used on the home, shop and wishlist pages.
   ===================================================================== */

const UI = (() => {

  /* ---------------- formatting ---------------- */

  const money = (value) =>
    "₹" + Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

  const finalPrice = (p) =>
    Math.round(Number(p.price) * (100 - (p.discount || 0))) / 100;

  const stars = (rating) => {
    const full = Math.floor(rating || 0);
    const half = (rating || 0) - full >= 0.5;
    return "★".repeat(full) + (half ? "⯪" : "") + "☆".repeat(Math.max(0, 5 - full - (half ? 1 : 0)));
  };

  const date = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const escape = (text) => String(text ?? "").replace(/[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const query = (key) => new URLSearchParams(location.search).get(key);

  /* ---------------- toasts ---------------- */

  function toast(message, type = "info") {
    let host = document.querySelector(".sx-toasts");
    if (!host) {
      host = document.createElement("div");
      host.className = "sx-toasts";
      document.body.appendChild(host);
    }
    const el = document.createElement("div");
    el.className = "sx-toast " + type;
    el.setAttribute("role", "status");
    el.textContent = message;
    host.appendChild(el);
    setTimeout(() => el.remove(), 3600);
  }

  const success = (m) => toast(m, "success");
  const error   = (m) => toast(m, "error");

  /* ---------------- header & footer ---------------- */

  function header(active = "") {
    const user = API.getUser();
    const links = [
      ["Home", "/"], ["Shop", "/shop"], ["Categories", "/shop#categories"],
      ["Offers", "/shop?sort=priceAsc"], ["About Us", "/about"], ["Contact", "/contact"]
    ];

    const accountArea = user
      ? `<a class="sx-icon-btn" href="${user.role === "ADMIN" ? "/admin" : "/dashboard"}"
            title="${escape(user.name)}" aria-label="Your account">👤</a>
         <button class="sx-btn sx-btn-sm sx-btn-primary" id="sxLogout">Sign out</button>`
      : `<a class="sx-btn sx-btn-sm sx-btn-primary" href="/login">Sign in</a>`;

    return `
    <header class="sx-header">
      <div class="sx-container">
        <nav class="sx-nav">
          <a class="sx-logo" href="/">
            <span class="sx-logo-mark">⚡</span>SPORT<span>X</span>
          </a>

          <button class="sx-icon-btn sx-nav-toggle" id="sxNavToggle"
                  aria-label="Open menu" aria-expanded="false">☰</button>

          <div class="sx-nav-links" id="sxNavLinks">
            ${links.map(([label, href]) =>
              `<a href="${href}" class="${active === label ? "active" : ""}">${label}</a>`).join("")}
          </div>

          <form class="sx-search" id="sxSearchForm" role="search">
            <input type="search" name="search" placeholder="Search bats, shoes, rackets…"
                   aria-label="Search products" value="${escape(query("search") || "")}">
            <button type="submit" aria-label="Search">🔍</button>
          </form>

          <div class="sx-nav-actions">
            <a class="sx-icon-btn" href="/wishlist" aria-label="Wishlist">♡
              <span class="sx-badge" id="sxWishCount" hidden>0</span></a>
            <a class="sx-icon-btn" href="/cart" aria-label="Cart">🛒
              <span class="sx-badge" id="sxCartCount" hidden>0</span></a>
            ${accountArea}
          </div>
        </nav>
      </div>
    </header>`;
  }

  function footer() {
    return `
    <footer class="sx-footer">
      <div class="sx-container">
        <div class="sx-footer-grid">
          <div>
            <a class="sx-logo" href="/" style="margin-bottom:.7rem"><span class="sx-logo-mark">⚡</span>SPORT<span>X</span></a>
            <p style="max-width:38ch">Equipment for cricket, football, badminton, basketball,
               fitness, running and tennis — picked for people who actually play.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <a href="/shop?categoryId=1">Cricket</a>
            <a href="/shop?categoryId=2">Football</a>
            <a href="/shop?categoryId=3">Badminton</a>
            <a href="/shop?categoryId=5">Fitness</a>
          </div>
          <div>
            <h4>Help</h4>
            <a href="/faq">FAQ</a>
            <a href="/contact">Contact us</a>
            <a href="/dashboard">Track an order</a>
            <a href="/about">About SPORTX</a>
          </div>
          <div>
            <h4>Account</h4>
            <a href="/login">Sign in</a>
            <a href="/register">Create account</a>
            <a href="/wishlist">Wishlist</a>
            <a href="/cart">Cart</a>
          </div>
        </div>
        <div class="sx-footer-bottom">
          <span>© ${new Date().getFullYear()} SPORTX. Built as a B.Tech CSE project.</span>
          <span>Cash on delivery · 7-day returns · Free shipping over ₹999</span>
        </div>
      </div>
    </footer>`;
  }

  /* ---------------- product card ---------------- */

  function productCard(p, wishlistIds = []) {
    const price = finalPrice(p);
    const wished = wishlistIds.includes(p.id);
    const stock = p.stock || 0;
    const stockClass = stock === 0 ? "out" : stock <= 5 ? "low" : "in";
    const stockText = stock === 0 ? "Out of stock"
                    : stock <= 5 ? `Only ${stock} left` : "In stock";

    return `
    <article class="sx-card" data-product="${p.id}">
      <div class="sx-card-media">
        <a href="/product?id=${p.id}">
          <img src="${escape(p.image || "/assets/products/football.svg")}"
               alt="${escape(p.name)}" loading="lazy">
        </a>
        ${p.discount ? `<span class="sx-tag">${p.discount}% off</span>` : ""}
        ${stock === 0 ? `<span class="sx-tag sx-tag-out">Sold out</span>` : ""}
        <button class="sx-wish ${wished ? "active" : ""}" data-wish="${p.id}"
                aria-label="${wished ? "Remove from" : "Add to"} wishlist"
                aria-pressed="${wished}">♥</button>
      </div>
      <div class="sx-card-body">
        <div class="sx-card-cat">${escape(p.category ? p.category.name : "")}</div>
        <h3 class="sx-card-title"><a href="/product?id=${p.id}">${escape(p.name)}</a></h3>
        <div class="sx-card-brand">${escape(p.brand || "SPORTX")}</div>
        <div class="sx-price">
          <b>${money(price)}</b>
          ${p.discount ? `<s>${money(p.price)}</s><em>Save ${money(p.price - price)}</em>` : ""}
        </div>
        <div class="sx-rating">
          <span class="sx-stars">${stars(p.rating)}</span>
          <span>${(p.rating || 0).toFixed(1)} (${p.ratingCount || 0})</span>
        </div>
        <div class="sx-stock ${stockClass}">${stockText}</div>
        <div class="sx-card-actions">
          <button class="sx-btn sx-btn-outline" data-add="${p.id}" ${stock === 0 ? "disabled" : ""}>Add to cart</button>
          <button class="sx-btn sx-btn-primary" data-buy="${p.id}" ${stock === 0 ? "disabled" : ""}>Buy now</button>
        </div>
      </div>
    </article>`;
  }

  function skeletons(count = 4) {
    return Array.from({ length: count }, () => `<div class="sx-skeleton"></div>`).join("");
  }

  function empty(icon, title, text, action = "") {
    return `<div class="sx-empty">
      <div class="sx-empty-icon">${icon}</div>
      <h3>${escape(title)}</h3>
      <p>${escape(text)}</p>${action}
    </div>`;
  }

  /* ---------------- cart & wishlist badge counts ---------------- */

  async function refreshCounts() {
    if (!API.isLoggedIn()) return;
    try {
      const [cart, wish] = await Promise.all([API.cart(), API.wishlist()]);
      setBadge("sxCartCount", cart.reduce((n, i) => n + i.quantity, 0));
      setBadge("sxWishCount", wish.length);
    } catch { /* silently ignore — badges are decorative */ }
  }

  function setBadge(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value;
    el.hidden = !value;
  }

  /* ---------------- shared card actions ---------------- */

  function requireLogin(next) {
    if (API.isLoggedIn()) return true;
    error("Sign in first to continue");
    setTimeout(() => location.href = "/login?next=" + encodeURIComponent(next || location.pathname + location.search), 900);
    return false;
  }

  /** Wires add-to-cart, buy-now and wishlist buttons inside a container. */
  function bindCardActions(container) {
    container.addEventListener("click", async (event) => {
      const add  = event.target.closest("[data-add]");
      const buy  = event.target.closest("[data-buy]");
      const wish = event.target.closest("[data-wish]");
      if (!add && !buy && !wish) return;

      event.preventDefault();
      const button = add || buy || wish;
      const id = Number(button.dataset.add || button.dataset.buy || button.dataset.wish);
      if (!requireLogin()) return;

      button.disabled = true;
      try {
        if (add || buy) {
          await API.addToCart(id, 1);
          success(buy ? "Added — taking you to checkout" : "Added to cart");
          await refreshCounts();
          if (buy) location.href = "/cart";
        } else {
          const active = wish.classList.contains("active");
          if (active) {
            await API.removeFromWishlist(id);
            wish.classList.remove("active");
            wish.setAttribute("aria-pressed", "false");
            success("Removed from wishlist");
          } else {
            await API.addToWishlist(id);
            wish.classList.add("active");
            wish.setAttribute("aria-pressed", "true");
            success("Saved to wishlist");
          }
          await refreshCounts();
        }
      } catch (err) {
        error(err.message);
      } finally {
        button.disabled = false;
      }
    });
  }

  /* ---------------- page bootstrap ---------------- */

  function mount(activeLink) {
    const head = document.getElementById("sxHeader");
    const foot = document.getElementById("sxFooter");
    if (head) head.innerHTML = header(activeLink);
    if (foot) foot.innerHTML = footer();

    const toggle = document.getElementById("sxNavToggle");
    const links = document.getElementById("sxNavLinks");
    if (toggle && links) {
      toggle.addEventListener("click", () => {
        const open = links.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }

    const searchForm = document.getElementById("sxSearchForm");
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const term = new FormData(searchForm).get("search");
        location.href = "/shop?search=" + encodeURIComponent(term || "");
      });
    }

    const logout = document.getElementById("sxLogout");
    if (logout) {
      logout.addEventListener("click", () => {
        API.clearSession();
        success("Signed out");
        setTimeout(() => location.href = "/", 500);
      });
    }

    refreshCounts();
  }

  return {
    money, finalPrice, stars, date, escape, query,
    toast, success, error,
    header, footer, productCard, skeletons, empty,
    refreshCounts, setBadge, requireLogin, bindCardActions, mount
  };
})();
