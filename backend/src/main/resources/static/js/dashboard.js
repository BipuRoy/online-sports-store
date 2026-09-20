/* =====================================================================
   SPORTX - static/js/dashboard.js
   Customer account area: profile, orders, wishlist, cart, address
   and password. Each side-nav button reveals one pane.
   ===================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  UI.mount("");

  if (!API.isLoggedIn()) {
    location.replace("/login?next=/dashboard");
    return;
  }

  const STATUS_FLOW = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"];

  let profile = null;
  let orders = [];

  /* ---------------- tabs ---------------- */

  const nav = document.getElementById("dashNav");

  function showTab(name) {
    document.querySelectorAll(".sx-tabpane").forEach(p =>
      p.classList.toggle("active", p.id === "tab-" + name));
    nav.querySelectorAll("button[data-tab]").forEach(b =>
      b.classList.toggle("active", b.dataset.tab === name));
    history.replaceState(null, "", "#" + name);
  }

  nav.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-tab]");
    if (!button) return;
    showTab(button.dataset.tab);
    if (button.dataset.tab === "orders") loadOrders();
    if (button.dataset.tab === "wishlist") loadWishlist();
    if (button.dataset.tab === "cart") loadCart();
  });

  document.getElementById("dashLogout").addEventListener("click", () => {
    API.clearSession();
    UI.success("Signed out");
    setTimeout(() => location.href = "/", 500);
  });

  /* ---------------- profile & address ---------------- */

  async function loadProfile() {
    try {
      profile = await API.profile();
    } catch (err) {
      UI.error(err.message);
      return;
    }
    document.getElementById("greeting").textContent =
      "Hello, " + (profile.name || "there").split(" ")[0];
    document.getElementById("pName").value = profile.name || "";
    document.getElementById("pEmail").value = profile.email || "";
    document.getElementById("pPhone").value = profile.phone || "";
    document.getElementById("pAddress").value = profile.address || "";
  }

  function fieldError(input, message) {
    const field = input.closest(".sx-field");
    if (!field) return;
    const slot = field.querySelector(".sx-field-error");
    field.classList.toggle("invalid", !!message);
    if (slot) slot.textContent = message || "";
  }

  async function saveProfile(payload, button, label) {
    button.disabled = true;
    button.textContent = "Saving…";
    try {
      profile = await API.updateProfile(profile.id, payload);
      // Keep the cached session name in step with the change.
      const session = API.getUser();
      if (session) {
        session.name = profile.name;
        localStorage.setItem("sportx_user", JSON.stringify(session));
      }
      document.getElementById("greeting").textContent =
        "Hello, " + (profile.name || "there").split(" ")[0];
      UI.success("Saved");
    } catch (err) {
      UI.error(err.message);
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  }

  document.getElementById("profileForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("pName");
    const phone = document.getElementById("pPhone");
    fieldError(name, ""); fieldError(phone, "");

    let valid = true;
    if (name.value.trim().length < 3) { fieldError(name, "Name must be at least 3 characters"); valid = false; }
    if (phone.value && !/^[6-9]\d{9}$/.test(phone.value.trim())) {
      fieldError(phone, "Enter a 10-digit mobile number"); valid = false;
    }
    if (!valid) return;

    saveProfile({
      name: name.value.trim(),
      phone: phone.value.trim(),
      address: document.getElementById("pAddress").value.trim()
    }, event.submitter || event.target.querySelector("button"), "Save changes");
  });

  document.getElementById("addressForm").addEventListener("submit", (event) => {
    event.preventDefault();
    saveProfile({
      name: profile.name,
      phone: profile.phone,
      address: document.getElementById("pAddress").value.trim()
    }, event.target.querySelector("button"), "Save address");
  });

  /* ---------------- password ---------------- */

  document.getElementById("passwordForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const current = document.getElementById("currentPassword");
    const next = document.getElementById("newPassword");
    fieldError(next, "");

    if (next.value.length < 6) {
      fieldError(next, "Use at least 6 characters");
      return;
    }
    const button = event.target.querySelector("button");
    button.disabled = true;
    try {
      await API.changePassword({ currentPassword: current.value, newPassword: next.value });
      event.target.reset();
      UI.success("Password updated");
    } catch (err) {
      UI.error(err.message);
    } finally {
      button.disabled = false;
    }
  });

  /* ---------------- orders ---------------- */

  function statusChip(status) {
    return `<span class="sx-chip sx-chip-${String(status).toLowerCase()}">${UI.escape(status)}</span>`;
  }

  function tracker(status) {
    if (status === "CANCELLED") {
      return `<p class="sx-small" style="color:var(--red)">This order was cancelled.</p>`;
    }
    const reached = STATUS_FLOW.indexOf(status);
    return `<div class="sx-steps">
      ${STATUS_FLOW.map((step, index) => `
        <div class="sx-step ${index <= reached ? "done" : ""}">
          <b>${index <= reached ? "✓" : index + 1}</b>
          <span>${step.charAt(0) + step.slice(1).toLowerCase()}</span>
        </div>`).join("")}
    </div>`;
  }

  async function loadOrders() {
    const root = document.getElementById("ordersRoot");
    root.innerHTML = `<div class="sx-spinner"></div>`;
    try {
      orders = await API.orders();
    } catch (err) {
      root.innerHTML = UI.empty("⚠️", "Could not load your orders", err.message);
      return;
    }

    if (!orders.length) {
      root.innerHTML = UI.empty("📦", "No orders yet",
        "When you place an order it will show up here with live tracking.",
        `<a class="sx-btn sx-btn-primary" href="/shop">Start shopping</a>`);
      return;
    }

    root.innerHTML = `
      <div class="sx-table-wrap">
        <table class="sx-table">
          <thead><tr><th>Order</th><th>Date</th><th>Items</th>
            <th>Total</th><th>Payment</th><th>Status</th><th></th></tr></thead>
          <tbody>
            ${orders.map(order => `
              <tr>
                <td><strong>#${order.id}</strong></td>
                <td>${UI.date(order.createdAt)}</td>
                <td>${order.items.length}</td>
                <td>${UI.money(order.totalAmount)}</td>
                <td>${order.paymentMethod === "COD" ? "Cash on delivery" : "Online"}</td>
                <td>${statusChip(order.orderStatus)}</td>
                <td class="sx-right">
                  <button class="sx-btn sx-btn-ghost sx-btn-sm" data-view="${order.id}">Details</button>
                  ${["PENDING", "CONFIRMED", "PACKED"].includes(order.orderStatus)
                    ? `<button class="sx-btn sx-btn-ghost sx-btn-sm" data-cancel="${order.id}"
                         style="color:var(--red)">Cancel</button>` : ""}
                </td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>`;
  }

  /* ---------------- order details modal ---------------- */

  const modal = document.getElementById("orderModal");
  const modalBody = document.getElementById("orderModalBody");

  modal.querySelectorAll("[data-close]").forEach(b =>
    b.addEventListener("click", () => modal.classList.remove("open")));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("open"); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") modal.classList.remove("open");
  });

  function openOrder(order) {
    modalBody.innerHTML = `
      <div class="sx-toolbar" style="margin-bottom:.6rem">
        <div><strong>Order #${order.id}</strong>
          <div class="sx-small sx-muted">Placed ${UI.date(order.createdAt)}</div></div>
        ${statusChip(order.orderStatus)}
      </div>

      ${tracker(order.orderStatus)}

      <table class="sx-table" style="margin-top:1rem">
        <thead><tr><th>Product</th><th>Qty</th><th class="sx-right">Price</th></tr></thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td>${UI.escape(item.productName)}
                ${item.size ? `<span class="sx-small sx-muted"> · Size ${UI.escape(item.size)}</span>` : ""}</td>
              <td>${item.quantity}</td>
              <td class="sx-right">${UI.money(Number(item.price) * item.quantity)}</td>
            </tr>`).join("")}
        </tbody>
      </table>

      <table class="sx-specs" style="margin-top:1rem">
        <tr><td>Subtotal</td><td class="sx-right">${UI.money(order.subTotal)}</td></tr>
        <tr><td>Discount${order.couponCode ? " (" + UI.escape(order.couponCode) + ")" : ""}</td>
            <td class="sx-right">− ${UI.money(order.discountAmount)}</td></tr>
        <tr><td>Delivery</td><td class="sx-right">
          ${Number(order.deliveryCharge) === 0 ? "Free" : UI.money(order.deliveryCharge)}</td></tr>
        <tr><td><strong>Total paid</strong></td>
            <td class="sx-right"><strong>${UI.money(order.totalAmount)}</strong></td></tr>
      </table>

      <h4 style="margin:1.1rem 0 .3rem">Delivery address</h4>
      <p class="sx-small sx-muted" style="white-space:pre-line">${UI.escape(order.shippingAddress)}</p>
      <p class="sx-small sx-muted">${UI.escape(order.customerName)} · ${UI.escape(order.customerPhone)}
         · ${UI.escape(order.customerEmail)}</p>
      <p class="sx-small sx-muted">Payment:
         ${order.paymentMethod === "COD" ? "Cash on delivery" : "Online payment"}
         (${UI.escape(order.paymentStatus)})</p>`;
    modal.classList.add("open");
  }

  document.getElementById("ordersRoot").addEventListener("click", async (event) => {
    const view = event.target.closest("[data-view]");
    const cancel = event.target.closest("[data-cancel]");
    if (!view && !cancel) return;

    if (view) {
      const order = orders.find(o => o.id === Number(view.dataset.view));
      if (order) openOrder(order);
      return;
    }

    if (!confirm("Cancel this order? Stock will be returned to the store.")) return;
    cancel.disabled = true;
    try {
      await API.cancelOrder(Number(cancel.dataset.cancel));
      UI.success("Order cancelled");
      await loadOrders();
    } catch (err) {
      UI.error(err.message);
      cancel.disabled = false;
    }
  });

  /* ---------------- wishlist & cart panes ---------------- */

  function miniRow(p, right) {
    return `
      <div class="sx-mini-row">
        <img src="${UI.escape(p.image || "")}" alt="${UI.escape(p.name)}">
        <div>
          <a href="/product?id=${p.id}"><strong>${UI.escape(p.name)}</strong></a>
          <div class="sx-small sx-muted">${UI.escape(p.brand || "SPORTX")}</div>
        </div>
        <div class="sx-right">${right}</div>
      </div>`;
  }

  async function loadWishlist() {
    const root = document.getElementById("dashWishlist");
    root.innerHTML = `<div class="sx-spinner"></div>`;
    try {
      const items = await API.wishlist();
      root.innerHTML = items.length
        ? items.map(entry => miniRow(entry.product,
            `<strong>${UI.money(UI.finalPrice(entry.product))}</strong>`)).join("") +
          `<p style="margin-top:1rem"><a class="sx-btn sx-btn-outline sx-btn-sm"
             href="/wishlist">Open full wishlist</a></p>`
        : UI.empty("♡", "Nothing saved", "Tap the heart on a product to save it.",
            `<a class="sx-btn sx-btn-primary" href="/shop">Browse</a>`);
    } catch (err) {
      root.innerHTML = UI.empty("⚠️", "Could not load the wishlist", err.message);
    }
  }

  async function loadCart() {
    const root = document.getElementById("dashCart");
    root.innerHTML = `<div class="sx-spinner"></div>`;
    try {
      const summary = await API.cartSummary("");
      root.innerHTML = summary.items.length
        ? summary.items.map(item => miniRow(item.product,
            `<span class="sx-small sx-muted">× ${item.quantity}</span><br>
             <strong>${UI.money(UI.finalPrice(item.product) * item.quantity)}</strong>`)).join("") +
          `<table class="sx-specs" style="margin-top:1rem">
             <tr><td>Items</td><td class="sx-right">${summary.totalQuantity}</td></tr>
             <tr><td><strong>Total</strong></td>
                 <td class="sx-right"><strong>${UI.money(summary.total)}</strong></td></tr>
           </table>
           <p style="margin-top:1rem"><a class="sx-btn sx-btn-primary sx-btn-sm"
              href="/cart">Go to cart</a></p>`
        : UI.empty("🛒", "Your cart is empty", "Add something you want to play with.",
            `<a class="sx-btn sx-btn-primary" href="/shop">Start shopping</a>`);
    } catch (err) {
      root.innerHTML = UI.empty("⚠️", "Could not load the cart", err.message);
    }
  }

  /* ---------------- boot ---------------- */

  await loadProfile();

  const wanted = (location.hash || "").replace("#", "");
  if (["profile", "orders", "wishlist", "cart", "address", "password"].includes(wanted)) {
    showTab(wanted);
  }
  // Orders are the pane people check most, so load them either way.
  loadOrders();
  if (wanted === "wishlist") loadWishlist();
  if (wanted === "cart") loadCart();
});
