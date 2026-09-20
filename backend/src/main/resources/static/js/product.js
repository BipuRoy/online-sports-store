/* SPORTX - static/js/product.js : product details, gallery, reviews, related items. */

document.addEventListener("DOMContentLoaded", async () => {
  UI.mount("Shop");

  const root = document.getElementById("pdpRoot");
  const id = UI.query("id");

  if (!id) { location.href = "/shop"; return; }

  let product, reviews = [], related = [], wished = false;

  try {
    [product, reviews, related] = await Promise.all([
      API.product(id), API.productReviews(id), API.related(id)
    ]);
    if (API.isLoggedIn()) {
      try { wished = (await API.wishlist()).some(w => w.product.id === product.id); } catch { /* optional */ }
    }
  } catch (err) {
    root.innerHTML = UI.empty("⚠️", "Product not found", err.message,
      `<a class="sx-btn sx-btn-primary" href="/shop">Back to shop</a>`);
    return;
  }

  const price = UI.finalPrice(product);
  const sizes = (product.sizes || "").split(",").map(s => s.trim()).filter(Boolean);
  const images = [product.image, product.image2, product.image3].filter(Boolean);
  const stock = product.stock || 0;
  const specs = (product.specifications || "").split("|").map(s => s.trim()).filter(Boolean);

  root.innerHTML = `
    <nav class="sx-breadcrumb">
      <a href="/">Home</a> / <a href="/shop">Shop</a> /
      <a href="/shop?categoryId=${product.category.id}">${UI.escape(product.category.name)}</a> /
      ${UI.escape(product.name)}
    </nav>

    <section class="sx-pdp" style="padding-bottom:2rem">
      <div>
        <div class="sx-gallery-main">
          <img id="mainImage" src="${UI.escape(images[0] || "")}" alt="${UI.escape(product.name)}">
        </div>
        <div class="sx-thumbs">
          ${images.map((src, i) => `<img src="${UI.escape(src)}" class="${i === 0 ? "active" : ""}"
             data-src="${UI.escape(src)}" alt="View ${i + 1} of ${UI.escape(product.name)}">`).join("")}
        </div>
      </div>

      <div>
        <div class="sx-card-cat">${UI.escape(product.category.name)}</div>
        <h1 style="font-size:1.7rem">${UI.escape(product.name)}</h1>
        <p class="sx-muted" style="margin:.1rem 0 .6rem">by ${UI.escape(product.brand || "SPORTX")}</p>

        <div class="sx-rating" style="margin-bottom:.6rem">
          <span class="sx-stars">${UI.stars(product.rating)}</span>
          <span>${(product.rating || 0).toFixed(1)} · ${product.ratingCount || 0} ratings ·
            ${reviews.length} review${reviews.length === 1 ? "" : "s"}</span>
        </div>

        <div class="sx-price" style="font-size:1.2rem">
          <b style="font-size:1.7rem">${UI.money(price)}</b>
          ${product.discount ? `<s>${UI.money(product.price)}</s>
            <em>${product.discount}% off — save ${UI.money(product.price - price)}</em>` : ""}
        </div>
        <p class="sx-small sx-muted">Inclusive of all taxes. Free delivery over ₹999.</p>

        <div class="sx-stock ${stock === 0 ? "out" : stock <= 5 ? "low" : "in"}" style="font-size:.92rem">
          ${stock === 0 ? "Out of stock" : stock <= 5 ? `Hurry — only ${stock} left` : `In stock (${stock} available)`}
        </div>

        <p style="margin-top:.9rem">${UI.escape(product.description || "")}</p>

        ${sizes.length ? `
          <div style="margin:1rem 0">
            <label style="font-weight:600;font-size:.88rem;display:block;margin-bottom:.4rem">Size</label>
            <div class="sx-sizes" id="sizeList">
              ${sizes.map((s, i) => `<button class="sx-size ${i === 0 ? "active" : ""}"
                 data-size="${UI.escape(s)}">${UI.escape(s)}</button>`).join("")}
            </div>
          </div>` : ""}

        <div style="display:flex;align-items:center;gap:1rem;margin:1.1rem 0">
          <div class="sx-qty">
            <button id="qtyMinus" aria-label="Decrease quantity">−</button>
            <input id="qtyInput" value="1" inputmode="numeric" aria-label="Quantity">
            <button id="qtyPlus" aria-label="Increase quantity">+</button>
          </div>
          <span class="sx-small sx-muted" id="qtyHint">Max ${Math.max(stock, 0)} per order</span>
        </div>

        <div style="display:flex;gap:.6rem;flex-wrap:wrap">
          <button class="sx-btn sx-btn-outline" id="addCart" ${stock === 0 ? "disabled" : ""}>Add to cart</button>
          <button class="sx-btn sx-btn-primary" id="buyNow" ${stock === 0 ? "disabled" : ""}>Buy now</button>
          <button class="sx-btn sx-btn-ghost" id="wishBtn">${wished ? "♥ In wishlist" : "♡ Add to wishlist"}</button>
        </div>

        ${specs.length ? `
          <h3 style="margin-top:1.6rem">Specifications</h3>
          <table class="sx-specs">
            ${specs.map(line => {
              const [key, ...rest] = line.split(":");
              return `<tr><td>${UI.escape(key)}</td><td>${UI.escape(rest.join(":").trim())}</td></tr>`;
            }).join("")}
            ${product.color ? `<tr><td>Colour</td><td>${UI.escape(product.color)}</td></tr>` : ""}
          </table>` : ""}
      </div>
    </section>

    <section class="sx-section" style="padding-top:1rem">
      <div class="sx-section-head"><div><h2>Customer reviews</h2>
        <p>${reviews.length} review${reviews.length === 1 ? "" : "s"} for this product</p></div></div>

      <div class="sx-cart-layout">
        <div id="reviewList">
          ${reviews.length ? reviews.map(r => `
            <div class="sx-review" style="margin-bottom:.8rem">
              <div class="sx-review-head">
                <div class="sx-avatar">${UI.escape((r.user.name || "?")[0].toUpperCase())}</div>
                <div><strong>${UI.escape(r.user.name)}</strong>
                  <div class="sx-stars sx-small">${UI.stars(r.rating)}
                    <span class="sx-muted">· ${UI.date(r.createdAt)}</span></div></div>
              </div>
              <p class="sx-muted" style="margin:0">${UI.escape(r.comment || "")}</p>
            </div>`).join("")
            : UI.empty("💬", "No reviews yet", "Be the first to review this product.")}
        </div>

        <aside class="sx-panel">
          <h3>Write a review</h3>
          <div class="sx-field"><label for="reviewRating">Your rating</label>
            <select id="reviewRating">
              <option value="5">5 — Excellent</option><option value="4">4 — Good</option>
              <option value="3">3 — Average</option><option value="2">2 — Poor</option>
              <option value="1">1 — Very poor</option>
            </select></div>
          <div class="sx-field"><label for="reviewComment">Your review</label>
            <textarea id="reviewComment" placeholder="How did it perform?"></textarea></div>
          <button class="sx-btn sx-btn-primary sx-btn-block" id="postReview">Post review</button>
        </aside>
      </div>
    </section>

    ${related.length ? `
    <section class="sx-section" style="padding-top:0">
      <div class="sx-section-head"><div><h2>Related products</h2>
        <p>More from ${UI.escape(product.category.name)}</p></div></div>
      <div class="sx-grid sx-grid-4" id="relatedGrid">
        ${related.map(p => UI.productCard(p)).join("")}
      </div>
    </section>` : ""}
  `;

  // ---------- gallery ----------
  root.querySelectorAll(".sx-thumbs img").forEach(thumb => {
    thumb.addEventListener("click", () => {
      document.getElementById("mainImage").src = thumb.dataset.src;
      root.querySelectorAll(".sx-thumbs img").forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  // ---------- size ----------
  let selectedSize = sizes[0] || null;
  const sizeList = document.getElementById("sizeList");
  if (sizeList) {
    sizeList.addEventListener("click", (e) => {
      const button = e.target.closest(".sx-size");
      if (!button) return;
      sizeList.querySelectorAll(".sx-size").forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      selectedSize = button.dataset.size;
    });
  }

  // ---------- quantity, capped at available stock ----------
  const qtyInput = document.getElementById("qtyInput");
  const setQty = (value) => {
    const next = Math.min(Math.max(1, value || 1), Math.max(stock, 1));
    qtyInput.value = next;
    document.getElementById("qtyHint").textContent =
      next >= stock ? `That is all we have in stock` : `Max ${stock} per order`;
  };
  document.getElementById("qtyMinus").addEventListener("click", () => setQty(Number(qtyInput.value) - 1));
  document.getElementById("qtyPlus").addEventListener("click", () => setQty(Number(qtyInput.value) + 1));
  qtyInput.addEventListener("change", () => setQty(Number(qtyInput.value)));

  // ---------- cart / wishlist / review ----------
  async function addToCart(redirect) {
    if (!UI.requireLogin()) return;
    try {
      await API.addToCart(product.id, Number(qtyInput.value), selectedSize);
      UI.success(redirect ? "Added — taking you to your cart" : "Added to cart");
      await UI.refreshCounts();
      if (redirect) location.href = "/cart";
    } catch (err) { UI.error(err.message); }
  }

  document.getElementById("addCart").addEventListener("click", () => addToCart(false));
  document.getElementById("buyNow").addEventListener("click", () => addToCart(true));

  document.getElementById("wishBtn").addEventListener("click", async (e) => {
    if (!UI.requireLogin()) return;
    try {
      if (wished) { await API.removeFromWishlist(product.id); wished = false; UI.success("Removed from wishlist"); }
      else { await API.addToWishlist(product.id); wished = true; UI.success("Saved to wishlist"); }
      e.target.textContent = wished ? "♥ In wishlist" : "♡ Add to wishlist";
      await UI.refreshCounts();
    } catch (err) { UI.error(err.message); }
  });

  document.getElementById("postReview").addEventListener("click", async (e) => {
    if (!UI.requireLogin()) return;
    const rating = Number(document.getElementById("reviewRating").value);
    const comment = document.getElementById("reviewComment").value.trim();
    e.target.disabled = true;
    try {
      await API.postReview({ productId: product.id, rating, comment });
      UI.success("Thanks — your review is live");
      setTimeout(() => location.reload(), 800);
    } catch (err) { UI.error(err.message); e.target.disabled = false; }
  });

  const relatedGrid = document.getElementById("relatedGrid");
  if (relatedGrid) UI.bindCardActions(relatedGrid);
});
