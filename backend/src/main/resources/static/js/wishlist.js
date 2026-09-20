/* =====================================================================
   SPORTX - static/js/wishlist.js
   Saved products: view, remove, or move straight into the cart.
   ===================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  UI.mount("");

  const root = document.getElementById("wishRoot");

  if (!API.isLoggedIn()) {
    root.innerHTML = UI.empty("🔒", "Sign in to see your wishlist",
      "Your saved products are tied to your account.",
      `<a class="sx-btn sx-btn-primary" href="/login?next=/wishlist">Sign in</a>`);
    return;
  }

  async function load() {
    root.innerHTML = `<div class="sx-spinner"></div>`;

    let items;
    try {
      items = await API.wishlist();
    } catch (err) {
      root.innerHTML = UI.empty("⚠️", "Could not load your wishlist", err.message);
      return;
    }

    UI.setBadge("sxWishCount", items.length);

    if (!items.length) {
      root.innerHTML = UI.empty("♡", "Nothing saved yet",
        "Tap the heart on any product to keep it here for later.",
        `<a class="sx-btn sx-btn-primary" href="/shop">Browse products</a>`);
      return;
    }

    root.innerHTML = `
      <div class="sx-toolbar">
        <p class="sx-muted sx-small" style="margin:0">
          ${items.length} saved item${items.length === 1 ? "" : "s"}</p>
      </div>
      <div class="sx-grid sx-grid-4">
        ${items.map(entry => {
          const p = entry.product;
          const price = UI.finalPrice(p);
          const out = (p.stock || 0) === 0;
          return `
          <article class="sx-card" data-wish-row="${p.id}">
            <div class="sx-card-media">
              <a href="/product?id=${p.id}">
                <img src="${UI.escape(p.image || "")}" alt="${UI.escape(p.name)}" loading="lazy">
              </a>
              ${p.discount ? `<span class="sx-tag">${p.discount}% off</span>` : ""}
              ${out ? `<span class="sx-tag sx-tag-out">Sold out</span>` : ""}
            </div>
            <div class="sx-card-body">
              <div class="sx-card-cat">${UI.escape(p.category ? p.category.name : "")}</div>
              <h3 class="sx-card-title">
                <a href="/product?id=${p.id}">${UI.escape(p.name)}</a></h3>
              <div class="sx-card-brand">${UI.escape(p.brand || "SPORTX")}</div>
              <div class="sx-price">
                <b>${UI.money(price)}</b>
                ${p.discount ? `<s>${UI.money(p.price)}</s>` : ""}
              </div>
              <div class="sx-rating">
                <span class="sx-stars">${UI.stars(p.rating)}</span>
                <span>${(p.rating || 0).toFixed(1)}</span>
              </div>
              <div class="sx-stock ${out ? "out" : (p.stock <= 5 ? "low" : "in")}">
                ${out ? "Out of stock" : (p.stock <= 5 ? `Only ${p.stock} left` : "In stock")}
              </div>
              <div class="sx-card-actions">
                <button class="sx-btn sx-btn-primary" data-move="${p.id}" ${out ? "disabled" : ""}>
                  Move to cart</button>
                <button class="sx-btn sx-btn-ghost" data-drop="${p.id}">Remove</button>
              </div>
            </div>
          </article>`;
        }).join("")}
      </div>`;
  }

  root.addEventListener("click", async (event) => {
    const move = event.target.closest("[data-move]");
    const drop = event.target.closest("[data-drop]");
    if (!move && !drop) return;

    const button = move || drop;
    const id = Number(button.dataset.move || button.dataset.drop);
    button.disabled = true;

    try {
      if (move) {
        // Add to the cart first, then unsave it — if the stock check fails
        // the product stays on the wishlist.
        await API.addToCart(id, 1);
        await API.removeFromWishlist(id);
        UI.success("Moved to your cart");
      } else {
        await API.removeFromWishlist(id);
        UI.success("Removed from wishlist");
      }
      await UI.refreshCounts();
      await load();
    } catch (err) {
      UI.error(err.message);
      button.disabled = false;
    }
  });

  load();
});
