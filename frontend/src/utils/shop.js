/* SPORTX - static/js/shop.js : search, filter, sort and paginate the catalogue. */

document.addEventListener("DOMContentLoaded", async () => {
  UI.mount("Shop");

  const grid = document.getElementById("productGrid");
  const pagination = document.getElementById("pagination");
  UI.bindCardActions(grid);

  const PAGE_SIZE = 12;
  const params = new URLSearchParams(location.search);

  const state = {
    search:     params.get("search") || "",
    categoryId: params.get("categoryId") || "",
    minPrice:   params.get("minPrice") || "",
    maxPrice:   params.get("maxPrice") || "",
    minRating:  params.get("minRating") || "",
    sort:       params.get("sort") || "newest",
    page:       Number(params.get("page") || 0)
  };

  let wishlistIds = [];
  if (API.isLoggedIn()) {
    try { wishlistIds = (await API.wishlist()).map(w => w.product.id); } catch { /* optional */ }
  }

  // ---------- filters ----------
  let categories = [];
  try {
    categories = await API.categories();
    document.getElementById("categoryFilters").innerHTML =
      `<label class="sx-check"><input type="radio" name="category" value=""
         ${!state.categoryId ? "checked" : ""}> All sports</label>` +
      categories.map(c => `<label class="sx-check">
         <input type="radio" name="category" value="${c.id}"
           ${String(c.id) === String(state.categoryId) ? "checked" : ""}> ${UI.escape(c.name)}</label>`).join("");
  } catch (err) {
    document.getElementById("categoryFilters").innerHTML =
      `<p class="sx-small sx-muted">${UI.escape(err.message)}</p>`;
  }

  document.getElementById("minPrice").value = state.minPrice;
  document.getElementById("maxPrice").value = state.maxPrice;
  document.getElementById("sortSelect").value = state.sort;
  document.querySelectorAll('input[name="rating"]').forEach(r => {
    r.checked = r.value === state.minRating;
  });

  // ---------- rendering ----------
  function syncUrl() {
    const q = new URLSearchParams();
    Object.entries(state).forEach(([k, v]) => { if (v !== "" && !(k === "page" && v === 0)) q.set(k, v); });
    history.replaceState(null, "", "/shop" + (q.toString() ? "?" + q : ""));
  }

  function renderPagination(pageData) {
    const total = pageData.totalPages;
    if (total <= 1) { pagination.innerHTML = ""; return; }

    const current = pageData.number;
    const buttons = [`<button ${current === 0 ? "disabled" : ""} data-page="${current - 1}">‹</button>`];

    for (let i = 0; i < total; i++) {
      if (i === 0 || i === total - 1 || Math.abs(i - current) <= 1) {
        buttons.push(`<button class="${i === current ? "active" : ""}" data-page="${i}">${i + 1}</button>`);
      } else if (Math.abs(i - current) === 2) {
        buttons.push(`<button disabled>…</button>`);
      }
    }
    buttons.push(`<button ${current >= total - 1 ? "disabled" : ""} data-page="${current + 1}">›</button>`);
    pagination.innerHTML = buttons.join("");
  }

  async function load() {
    grid.innerHTML = `<div class="sx-skeleton"></div>`.repeat(8);
    syncUrl();

    try {
      const data = await API.products({ ...state, size: PAGE_SIZE });

      const categoryName = state.categoryId
        ? (categories.find(c => String(c.id) === String(state.categoryId)) || {}).name
        : null;
      const title = state.search ? `Results for “${state.search}”`
                  : categoryName ? categoryName
                  : "All products";
      document.getElementById("resultsTitle").textContent = title;
      document.getElementById("crumb").textContent = title;
      document.getElementById("resultsCount").textContent =
        data.totalElements === 0 ? "No products matched"
        : `${data.totalElements} product${data.totalElements === 1 ? "" : "s"} · page ${data.number + 1} of ${data.totalPages}`;

      grid.innerHTML = data.content.length
        ? data.content.map(p => UI.productCard(p, wishlistIds)).join("")
        : UI.empty("🔍", "No products matched",
            "Try a different search term, or clear the filters to see everything.",
            `<button class="sx-btn sx-btn-primary" onclick="location.href='/shop'">Clear filters</button>`);

      renderPagination(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      grid.innerHTML = UI.empty("⚠️", "Could not load products", err.message);
      pagination.innerHTML = "";
    }
  }

  // ---------- events ----------
  document.getElementById("categoryFilters").addEventListener("change", (e) => {
    state.categoryId = e.target.value; state.page = 0; load();
  });
  document.getElementById("applyPrice").addEventListener("click", () => {
    state.minPrice = document.getElementById("minPrice").value;
    state.maxPrice = document.getElementById("maxPrice").value;
    state.page = 0; load();
  });
  document.querySelectorAll('input[name="rating"]').forEach(radio =>
    radio.addEventListener("change", () => { state.minRating = radio.value; state.page = 0; load(); }));
  document.getElementById("sortSelect").addEventListener("change", (e) => {
    state.sort = e.target.value; state.page = 0; load();
  });
  document.getElementById("clearFilters").addEventListener("click", () => location.href = "/shop");
  pagination.addEventListener("click", (e) => {
    const button = e.target.closest("[data-page]");
    if (!button || button.disabled) return;
    state.page = Number(button.dataset.page); load();
  });

  load();
});
