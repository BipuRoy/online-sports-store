/* =====================================================================
   SPORTX - static/js/admin.js
   Admin panel: dashboard statistics, product CRUD with image upload,
   category CRUD, order management, user activation and coupons.
   Only users whose token carries ROLE_ADMIN can reach this page; the
   backend enforces it as well, this check is only for a friendlier UI.
   ===================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  UI.mount("");

  if (!API.isLoggedIn()) { location.replace("/login?next=/admin"); return; }
  if (!API.isAdmin()) {
    document.querySelector(".sx-container.sx-section").innerHTML = UI.empty(
      "⛔", "Admins only",
      "This area is restricted to store administrators.",
      `<a class="sx-btn sx-btn-primary" href="/dashboard">Go to my account</a>`);
    return;
  }

  const STATUSES = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];

  let categories = [];
  let products = [];
  let orders = [];
  let users = [];
  let coupons = [];

  /* ---------------- shared modal ---------------- */

  const modal = document.getElementById("adminModal");
  const modalTitle = document.getElementById("adminModalTitle");
  const modalBody = document.getElementById("adminModalBody");
  const modalSave = document.getElementById("adminModalSave");
  let onSave = null;

  function closeModal() { modal.classList.remove("open"); onSave = null; }

  modal.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", closeModal));
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  modalSave.addEventListener("click", async () => {
    if (!onSave) return;
    modalSave.disabled = true;
    modalSave.textContent = "Saving…";
    try {
      await onSave();
      closeModal();
    } catch (err) {
      UI.error(err.message);
    } finally {
      modalSave.disabled = false;
      modalSave.textContent = "Save";
    }
  });

  /**
   * Opens the shared dialog. Pass a handler to get a Save button, or omit it
   * for a read-only view such as the order details sheet.
   */
  function openModal(title, html, handler) {
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    onSave = handler || null;
    modalSave.hidden = !handler;
    modal.classList.add("open");
  }

  /* ---------------- tabs ---------------- */

  const nav = document.getElementById("adminNav");
  const loaders = {
    stats: loadStats, products: loadProducts, categories: loadCategories,
    orders: loadOrders, users: loadUsers, coupons: loadCoupons
  };

  nav.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-tab]");
    if (!button) return;
    const name = button.dataset.tab;
    document.querySelectorAll(".sx-tabpane").forEach(p =>
      p.classList.toggle("active", p.id === "tab-" + name));
    nav.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === button));
    history.replaceState(null, "", "#" + name);
    loaders[name]();
  });

  /* ---------------- dashboard ---------------- */

  async function loadStats() {
    const grid = document.getElementById("statsGrid");
    grid.innerHTML = `<div class="sx-spinner"></div>`;
    try {
      const s = await API.adminStats();
      const tiles = [
        ["Total users", s.totalUsers, "Registered customers and admins", false],
        ["Total products", s.totalProducts, "Live in the catalogue", false],
        ["Total orders", s.totalOrders, "All time", false],
        ["Total revenue", UI.money(s.totalRevenue), "Excluding cancelled orders", true],
        ["Pending orders", s.pendingOrders, "Waiting to be confirmed", false],
        ["Delivered orders", s.deliveredOrders, "Completed successfully", false],
        ["Cancelled orders", s.cancelledOrders, "Stock returned to the store", false],
        ["Low stock", s.lowStockProducts, "Fewer than 5 units left", true]
      ];
      grid.innerHTML = tiles.map(([label, value, note, accent]) => `
        <div class="sx-stat ${accent ? "accent" : ""}">
          <div class="sx-stat-label">${label}</div>
          <div class="sx-stat-value">${value}</div>
          <div class="sx-stat-note">${note}</div>
        </div>`).join("");
    } catch (err) {
      grid.innerHTML = UI.empty("⚠️", "Could not load statistics", err.message);
    }
  }

  /* ---------------- categories ---------------- */

  async function ensureCategories() {
    if (!categories.length) categories = await API.categories();
    return categories;
  }

  async function loadCategories() {
    const rows = document.getElementById("categoryRows");
    rows.innerHTML = `<tr><td colspan="4"><div class="sx-spinner"></div></td></tr>`;
    try {
      categories = await API.categories();
    } catch (err) {
      rows.innerHTML = `<tr><td colspan="4">${UI.escape(err.message)}</td></tr>`;
      return;
    }
    rows.innerHTML = categories.map(c => `
      <tr>
        <td>${c.id}</td>
        <td><img class="sx-thumb" src="${UI.escape(c.image || "")}" alt="">
            <strong>${UI.escape(c.name)}</strong></td>
        <td class="sx-small sx-muted">${UI.escape(c.description || "")}</td>
        <td class="sx-right">
          <button class="sx-btn sx-btn-ghost sx-btn-sm" data-cat-edit="${c.id}">Edit</button>
          <button class="sx-btn sx-btn-ghost sx-btn-sm" style="color:var(--red)"
                  data-cat-del="${c.id}">Delete</button>
        </td>
      </tr>`).join("");
  }

  function categoryForm(c = {}) {
    return `
      <div class="sx-field"><label for="cfName">Name</label>
        <input id="cfName" value="${UI.escape(c.name || "")}"></div>
      <div class="sx-field"><label for="cfDesc">Description</label>
        <textarea id="cfDesc">${UI.escape(c.description || "")}</textarea></div>
      <div class="sx-field"><label for="cfImage">Image path</label>
        <input id="cfImage" value="${UI.escape(c.image || "")}"
               placeholder="/assets/categories/cricket.svg"></div>`;
  }

  function categoryPayload() {
    const name = document.getElementById("cfName").value.trim();
    if (name.length < 2) throw new Error("Category name is required");
    return {
      name,
      description: document.getElementById("cfDesc").value.trim(),
      image: document.getElementById("cfImage").value.trim()
    };
  }

  document.getElementById("newCategory").addEventListener("click", () => {
    openModal("Add category", categoryForm(), async () => {
      await API.createCategory(categoryPayload());
      UI.success("Category added");
      await loadCategories();
    });
  });

  document.getElementById("categoryRows").addEventListener("click", async (event) => {
    const edit = event.target.closest("[data-cat-edit]");
    const del = event.target.closest("[data-cat-del]");

    if (edit) {
      const c = categories.find(x => x.id === Number(edit.dataset.catEdit));
      openModal("Edit category", categoryForm(c), async () => {
        await API.updateCategory(c.id, categoryPayload());
        UI.success("Category updated");
        await loadCategories();
      });
    }

    if (del) {
      if (!confirm("Delete this category? Products inside it must be removed first.")) return;
      try {
        await API.deleteCategory(Number(del.dataset.catDel));
        UI.success("Category deleted");
        await loadCategories();
      } catch (err) { UI.error(err.message); }
    }
  });

  /* ---------------- products ---------------- */

  async function loadProducts() {
    const rows = document.getElementById("productRows");
    rows.innerHTML = `<tr><td colspan="9"><div class="sx-spinner"></div></td></tr>`;
    try {
      await ensureCategories();
      const page = await API.products({ size: 200, sort: "newest" });
      products = page.content || page;
    } catch (err) {
      rows.innerHTML = `<tr><td colspan="9">${UI.escape(err.message)}</td></tr>`;
      return;
    }

    rows.innerHTML = products.map(p => `
      <tr>
        <td>${p.id}</td>
        <td><img class="sx-thumb" src="${UI.escape(p.image || "")}" alt="">
            <strong>${UI.escape(p.name)}</strong></td>
        <td>${UI.escape(p.category ? p.category.name : "—")}</td>
        <td>${UI.escape(p.brand || "")}</td>
        <td>${UI.money(p.price)}</td>
        <td>${p.discount || 0}%</td>
        <td>
          <input type="number" min="0" value="${p.stock}" data-stock="${p.id}"
                 style="width:78px" aria-label="Stock for ${UI.escape(p.name)}">
        </td>
        <td>${(p.rating || 0).toFixed(1)}</td>
        <td class="sx-right">
          <button class="sx-btn sx-btn-ghost sx-btn-sm" data-prod-edit="${p.id}">Edit</button>
          <button class="sx-btn sx-btn-ghost sx-btn-sm" style="color:var(--red)"
                  data-prod-del="${p.id}">Delete</button>
        </td>
      </tr>`).join("");
  }

  function productForm(p = {}) {
    const selected = p.category ? p.category.id : null;
    return `
      <div class="sx-form-row">
        <div class="sx-field"><label for="pfName">Name</label>
          <input id="pfName" value="${UI.escape(p.name || "")}"></div>
        <div class="sx-field"><label for="pfBrand">Brand</label>
          <input id="pfBrand" value="${UI.escape(p.brand || "")}"></div>
      </div>
      <div class="sx-field"><label for="pfCategory">Category</label>
        <select id="pfCategory">
          ${categories.map(c => `<option value="${c.id}" ${c.id === selected ? "selected" : ""}>
            ${UI.escape(c.name)}</option>`).join("")}
        </select></div>
      <div class="sx-field"><label for="pfDesc">Description</label>
        <textarea id="pfDesc">${UI.escape(p.description || "")}</textarea></div>
      <div class="sx-form-row">
        <div class="sx-field"><label for="pfPrice">Price (₹)</label>
          <input id="pfPrice" type="number" min="1" step="0.01" value="${p.price || ""}"></div>
        <div class="sx-field"><label for="pfDiscount">Discount (%)</label>
          <input id="pfDiscount" type="number" min="0" max="90" value="${p.discount || 0}"></div>
      </div>
      <div class="sx-form-row">
        <div class="sx-field"><label for="pfStock">Stock</label>
          <input id="pfStock" type="number" min="0" value="${p.stock ?? 0}"></div>
        <div class="sx-field"><label for="pfColor">Colour</label>
          <input id="pfColor" value="${UI.escape(p.color || "")}"></div>
      </div>
      <div class="sx-field"><label for="pfSizes">Sizes (comma separated, leave blank if not sized)</label>
        <input id="pfSizes" value="${UI.escape(p.sizes || "")}" placeholder="S, M, L, XL"></div>
      <div class="sx-field"><label for="pfSpecs">Specifications (one per line, Key: value)</label>
        <textarea id="pfSpecs">${UI.escape(p.specifications || "")}</textarea></div>
      <div class="sx-field"><label for="pfImage">Main image path</label>
        <input id="pfImage" value="${UI.escape(p.image || "")}"
               placeholder="/assets/products/football.svg"></div>
      <div class="sx-field"><label for="pfUpload">…or upload an image file</label>
        <input id="pfUpload" type="file" accept="image/*">
        <div class="sx-small sx-muted" id="pfUploadNote"></div></div>
      <div class="sx-form-row">
        <div class="sx-field"><label for="pfImage2">Second image</label>
          <input id="pfImage2" value="${UI.escape(p.image2 || "")}"></div>
        <div class="sx-field"><label for="pfImage3">Third image</label>
          <input id="pfImage3" value="${UI.escape(p.image3 || "")}"></div>
      </div>
      <div class="sx-field">
        <label><input type="checkbox" id="pfFeatured" ${p.featured ? "checked" : ""}>
          Show in Featured products</label>
        <label><input type="checkbox" id="pfBest" ${p.bestSeller ? "checked" : ""}>
          Show in Best sellers</label>
      </div>`;
  }

  /** Uploads the chosen file (if any) and returns the product payload. */
  async function productPayload() {
    const name = document.getElementById("pfName").value.trim();
    const price = Number(document.getElementById("pfPrice").value);
    const discount = Number(document.getElementById("pfDiscount").value || 0);
    const stock = Number(document.getElementById("pfStock").value || 0);

    if (name.length < 2) throw new Error("Product name is required");
    if (!(price > 0)) throw new Error("Price must be greater than zero");
    if (discount < 0 || discount > 90) throw new Error("Discount must be between 0 and 90");
    if (stock < 0) throw new Error("Stock cannot be negative");

    let image = document.getElementById("pfImage").value.trim();
    const file = document.getElementById("pfUpload").files[0];
    if (file) {
      document.getElementById("pfUploadNote").textContent = "Uploading image…";
      const result = await API.uploadImage(file);
      image = result.data;
      document.getElementById("pfUploadNote").textContent = "Uploaded to " + image;
    }

    return {
      name,
      categoryId: Number(document.getElementById("pfCategory").value),
      brand: document.getElementById("pfBrand").value.trim(),
      description: document.getElementById("pfDesc").value.trim(),
      price, discount, stock, image,
      image2: document.getElementById("pfImage2").value.trim(),
      image3: document.getElementById("pfImage3").value.trim(),
      sizes: document.getElementById("pfSizes").value.trim(),
      color: document.getElementById("pfColor").value.trim(),
      specifications: document.getElementById("pfSpecs").value.trim(),
      featured: document.getElementById("pfFeatured").checked,
      bestSeller: document.getElementById("pfBest").checked
    };
  }

  document.getElementById("newProduct").addEventListener("click", async () => {
    await ensureCategories();
    openModal("Add product", productForm(), async () => {
      await API.createProduct(await productPayload());
      UI.success("Product added");
      await loadProducts();
    });
  });

  document.getElementById("productRows").addEventListener("click", async (event) => {
    const edit = event.target.closest("[data-prod-edit]");
    const del = event.target.closest("[data-prod-del]");

    if (edit) {
      const p = products.find(x => x.id === Number(edit.dataset.prodEdit));
      openModal("Edit product", productForm(p), async () => {
        await API.updateProduct(p.id, await productPayload());
        UI.success("Product updated");
        await loadProducts();
      });
    }

    if (del) {
      if (!confirm("Delete this product permanently?")) return;
      try {
        await API.deleteProduct(Number(del.dataset.prodDel));
        UI.success("Product deleted");
        await loadProducts();
      } catch (err) { UI.error(err.message); }
    }
  });

  // Inline stock update — saves when the field loses focus or Enter is pressed.
  document.getElementById("productRows").addEventListener("change", async (event) => {
    const input = event.target.closest("[data-stock]");
    if (!input) return;
    const value = Number(input.value);
    if (!Number.isInteger(value) || value < 0) {
      UI.error("Stock must be zero or a positive whole number");
      return;
    }
    input.disabled = true;
    try {
      await API.updateStock(Number(input.dataset.stock), value);
      UI.success("Stock updated");
    } catch (err) {
      UI.error(err.message);
    } finally {
      input.disabled = false;
    }
  });

  /* ---------------- orders ---------------- */

  function renderOrders() {
    const filter = document.getElementById("orderFilter").value;
    const rows = document.getElementById("orderRows");
    const list = filter ? orders.filter(o => o.orderStatus === filter) : orders;

    if (!list.length) {
      rows.innerHTML = `<tr><td colspan="8" class="sx-muted">No orders match this filter.</td></tr>`;
      return;
    }

    rows.innerHTML = list.map(o => `
      <tr>
        <td><strong>#${o.id}</strong></td>
        <td>${UI.escape(o.customerName || (o.user ? o.user.name : ""))}
            <div class="sx-small sx-muted">${UI.escape(o.customerEmail || "")}</div></td>
        <td>${UI.date(o.createdAt)}</td>
        <td>${o.items.length}</td>
        <td>${UI.money(o.totalAmount)}</td>
        <td>${o.paymentMethod === "COD" ? "COD" : "Online"}
            <div class="sx-small sx-muted">${UI.escape(o.paymentStatus)}</div></td>
        <td>
          <select data-status="${o.id}" ${o.orderStatus === "CANCELLED" ? "disabled" : ""}>
            ${STATUSES.map(s =>
              `<option ${s === o.orderStatus ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </td>
        <td class="sx-right">
          <button class="sx-btn sx-btn-ghost sx-btn-sm" data-order-view="${o.id}">Details</button>
        </td>
      </tr>`).join("");
  }

  async function loadOrders() {
    const rows = document.getElementById("orderRows");
    rows.innerHTML = `<tr><td colspan="8"><div class="sx-spinner"></div></td></tr>`;
    try {
      orders = await API.orders();   // admins receive every order
      renderOrders();
    } catch (err) {
      rows.innerHTML = `<tr><td colspan="8">${UI.escape(err.message)}</td></tr>`;
    }
  }

  document.getElementById("orderFilter").addEventListener("change", renderOrders);

  document.getElementById("orderRows").addEventListener("change", async (event) => {
    const select = event.target.closest("[data-status]");
    if (!select) return;
    const id = Number(select.dataset.status);
    select.disabled = true;
    try {
      await API.updateOrderStatus(id, select.value);
      UI.success("Order #" + id + " is now " + select.value.toLowerCase());
      await loadOrders();
    } catch (err) {
      UI.error(err.message);
      select.disabled = false;
      await loadOrders();
    }
  });

  document.getElementById("orderRows").addEventListener("click", (event) => {
    const view = event.target.closest("[data-order-view]");
    if (!view) return;
    const o = orders.find(x => x.id === Number(view.dataset.orderView));
    if (!o) return;

    openModal("Order #" + o.id, `
      <div class="sx-toolbar" style="margin-bottom:.6rem">
        <div class="sx-small sx-muted">Placed ${UI.date(o.createdAt)}</div>
        <span class="sx-chip sx-chip-${String(o.orderStatus).toLowerCase()}">${o.orderStatus}</span>
      </div>
      <table class="sx-table">
        <thead><tr><th>Product</th><th>Qty</th><th class="sx-right">Line total</th></tr></thead>
        <tbody>
          ${o.items.map(i => `<tr>
            <td>${UI.escape(i.productName)}
              ${i.size ? `<span class="sx-small sx-muted"> · ${UI.escape(i.size)}</span>` : ""}</td>
            <td>${i.quantity}</td>
            <td class="sx-right">${UI.money(Number(i.price) * i.quantity)}</td></tr>`).join("")}
        </tbody>
      </table>
      <table class="sx-specs" style="margin-top:1rem">
        <tr><td>Subtotal</td><td class="sx-right">${UI.money(o.subTotal)}</td></tr>
        <tr><td>Discount${o.couponCode ? " (" + UI.escape(o.couponCode) + ")" : ""}</td>
            <td class="sx-right">− ${UI.money(o.discountAmount)}</td></tr>
        <tr><td>Delivery</td><td class="sx-right">${UI.money(o.deliveryCharge)}</td></tr>
        <tr><td><strong>Total</strong></td>
            <td class="sx-right"><strong>${UI.money(o.totalAmount)}</strong></td></tr>
      </table>
      <h4 style="margin:1.1rem 0 .3rem">Ship to</h4>
      <p class="sx-small sx-muted" style="white-space:pre-line">${UI.escape(o.shippingAddress)}</p>
      <p class="sx-small sx-muted">${UI.escape(o.customerName)} ·
         ${UI.escape(o.customerPhone)} · ${UI.escape(o.customerEmail)}</p>`);
  });

  /* ---------------- users ---------------- */

  async function loadUsers() {
    const rows = document.getElementById("userRows");
    rows.innerHTML = `<tr><td colspan="8"><div class="sx-spinner"></div></td></tr>`;
    try {
      users = await API.adminUsers();
    } catch (err) {
      rows.innerHTML = `<tr><td colspan="8">${UI.escape(err.message)}</td></tr>`;
      return;
    }

    rows.innerHTML = users.map(u => `
      <tr>
        <td>${u.id}</td>
        <td><strong>${UI.escape(u.name)}</strong></td>
        <td>${UI.escape(u.email)}</td>
        <td>${UI.escape(u.phone || "—")}</td>
        <td><span class="sx-chip ${u.role === "ADMIN" ? "sx-chip-confirmed" : ""}">${u.role}</span></td>
        <td>${UI.date(u.createdAt)}</td>
        <td><span class="sx-chip ${u.active ? "sx-chip-delivered" : "sx-chip-cancelled"}">
          ${u.active ? "Active" : "Disabled"}</span></td>
        <td class="sx-right">
          ${u.role === "ADMIN"
            ? `<span class="sx-small sx-muted">Protected</span>`
            : `<button class="sx-btn sx-btn-ghost sx-btn-sm" data-user-toggle="${u.id}"
                 data-active="${!!u.active}">
                 ${u.active ? "Deactivate" : "Activate"}</button>`}
        </td>
      </tr>`).join("");
  }

  document.getElementById("userRows").addEventListener("click", async (event) => {
    const button = event.target.closest("[data-user-toggle]");
    if (!button) return;
    const id = Number(button.dataset.userToggle);
    const makeActive = button.dataset.active !== "true";
    button.disabled = true;
    try {
      await API.setUserActive(id, makeActive);
      UI.success(makeActive ? "User activated" : "User deactivated");
      await loadUsers();
    } catch (err) {
      UI.error(err.message);
      button.disabled = false;
    }
  });

  /* ---------------- coupons ---------------- */

  async function loadCoupons() {
    const rows = document.getElementById("couponRows");
    rows.innerHTML = `<tr><td colspan="6"><div class="sx-spinner"></div></td></tr>`;
    try {
      coupons = await API.adminCoupons();
    } catch (err) {
      rows.innerHTML = `<tr><td colspan="6">${UI.escape(err.message)}</td></tr>`;
      return;
    }

    if (!coupons.length) {
      rows.innerHTML = `<tr><td colspan="6" class="sx-muted">No coupons yet.</td></tr>`;
      return;
    }

    rows.innerHTML = coupons.map(c => {
      const expired = c.expiryDate && new Date(c.expiryDate) < new Date();
      return `
      <tr>
        <td><strong>${UI.escape(c.code)}</strong></td>
        <td>${c.discount}%</td>
        <td>${UI.money(c.minOrderAmount)}</td>
        <td>${c.expiryDate ? UI.date(c.expiryDate) : "No expiry"}</td>
        <td><span class="sx-chip ${c.status && !expired ? "sx-chip-delivered" : "sx-chip-cancelled"}">
          ${expired ? "Expired" : (c.status ? "Active" : "Disabled")}</span></td>
        <td class="sx-right">
          <button class="sx-btn sx-btn-ghost sx-btn-sm" style="color:var(--red)"
                  data-coupon-del="${c.id}">Delete</button></td>
      </tr>`;
    }).join("");
  }

  document.getElementById("newCoupon").addEventListener("click", () => {
    const today = new Date();
    const later = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    openModal("Add coupon", `
      <div class="sx-form-row">
        <div class="sx-field"><label for="kfCode">Code</label>
          <input id="kfCode" placeholder="SPORTX10" style="text-transform:uppercase"></div>
        <div class="sx-field"><label for="kfDiscount">Discount (%)</label>
          <input id="kfDiscount" type="number" min="1" max="90" value="10"></div>
      </div>
      <div class="sx-form-row">
        <div class="sx-field"><label for="kfMin">Minimum order (₹)</label>
          <input id="kfMin" type="number" min="0" value="999"></div>
        <div class="sx-field"><label for="kfExpiry">Expires on</label>
          <input id="kfExpiry" type="date" value="${later.toISOString().slice(0, 10)}"></div>
      </div>
      <div class="sx-field">
        <label><input type="checkbox" id="kfStatus" checked> Active</label></div>`,
      async () => {
        const code = document.getElementById("kfCode").value.trim().toUpperCase();
        const discount = Number(document.getElementById("kfDiscount").value);
        if (code.length < 3) throw new Error("Coupon code must be at least 3 characters");
        if (!(discount >= 1 && discount <= 90)) throw new Error("Discount must be between 1 and 90");

        await API.createCoupon({
          code, discount,
          minOrderAmount: Number(document.getElementById("kfMin").value || 0),
          expiryDate: document.getElementById("kfExpiry").value || null,
          status: document.getElementById("kfStatus").checked
        });
        UI.success("Coupon created");
        await loadCoupons();
      });
  });

  document.getElementById("couponRows").addEventListener("click", async (event) => {
    const del = event.target.closest("[data-coupon-del]");
    if (!del) return;
    if (!confirm("Delete this coupon?")) return;
    try {
      await API.deleteCoupon(Number(del.dataset.couponDel));
      UI.success("Coupon deleted");
      await loadCoupons();
    } catch (err) { UI.error(err.message); }
  });

  /* ---------------- boot ---------------- */

  const wanted = (location.hash || "").replace("#", "");
  if (loaders[wanted]) {
    document.querySelectorAll(".sx-tabpane").forEach(p =>
      p.classList.toggle("active", p.id === "tab-" + wanted));
    nav.querySelectorAll("button").forEach(b =>
      b.classList.toggle("active", b.dataset.tab === wanted));
    loaders[wanted]();
  } else {
    loadStats();
  }
});
