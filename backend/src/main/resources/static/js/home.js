/* SPORTX - static/js/home.js : builds the homepage sections from the API. */

document.addEventListener("DOMContentLoaded", async () => {
  UI.mount("Home");

  const grids = {
    categories: document.getElementById("categoryGrid"),
    featured:   document.getElementById("featuredGrid"),
    best:       document.getElementById("bestGrid"),
    fresh:      document.getElementById("newGrid")
  };

  [grids.featured, grids.best, grids.fresh].forEach(g => g.innerHTML = UI.skeletons(4));
  [grids.featured, grids.best, grids.fresh].forEach(g => UI.bindCardActions(g));

  // Wishlist ids let the heart icons render in the right state on first paint.
  let wishlistIds = [];
  if (API.isLoggedIn()) {
    try { wishlistIds = (await API.wishlist()).map(w => w.product.id); } catch { /* not critical */ }
  }

  const render = (grid, products, emptyText) => {
    grid.innerHTML = products.length
      ? products.map(p => UI.productCard(p, wishlistIds)).join("")
      : UI.empty("📦", "Nothing here yet", emptyText);
  };

  try {
    const [categories, featured, best, fresh, all] = await Promise.all([
      API.categories(), API.featured(), API.bestSellers(), API.newArrivals(),
      API.products({ size: 1 })
    ]);

    grids.categories.innerHTML = categories.map(c => `
      <a class="sx-cat" href="/shop?categoryId=${c.id}">
        <img src="${UI.escape(c.image || "")}" alt="${UI.escape(c.name)}" loading="lazy">
        <div class="sx-cat-label"><span>${UI.escape(c.name)}</span><small>Shop →</small></div>
      </a>`).join("");

    render(grids.featured, featured, "Featured products will appear once an admin marks some.");
    render(grids.best, best.slice(0, 4), "No best sellers recorded yet.");
    render(grids.fresh, fresh.slice(0, 4), "No new arrivals yet.");

    document.getElementById("statProducts").textContent = all.totalElements + "+";
  } catch (err) {
    UI.error(err.message);
    Object.values(grids).forEach(g =>
      g.innerHTML = UI.empty("⚠️", "Could not load products", err.message));
  }

  document.getElementById("newsletterForm").addEventListener("submit", (e) => {
    e.preventDefault();
    UI.success("Subscribed — check your inbox for a welcome email");
    e.target.reset();
  });
});
