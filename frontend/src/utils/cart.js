/* SPORTX - static/js/cart.js : cart contents, quantity changes, coupon and totals. */

document.addEventListener("DOMContentLoaded", async () => {
  UI.mount("");

  const root = document.getElementById("cartRoot");

  if (!API.isLoggedIn()) {
    root.innerHTML = UI.empty("🔒", "Sign in to see your cart",
      "Your cart is saved to your account so it follows you between devices.",
      `<a class="sx-btn sx-btn-primary" href="/login?next=/cart">Sign in</a>`);
    return;
  }

  let coupon = sessionStorage.getItem("sportx_coupon") || "";

  async function load() {
    root.innerHTML = `<div class="sx-spinner"></div>`;
    let summary;
    try {
      summary = await API.cartSummary(coupon);
    } catch (err) {
      // An expired or now-invalid coupon should not hide the cart.
      if (coupon) {
        UI.error(err.message);
        coupon = ""; sessionStorage.removeItem("sportx_coupon");
        return load();
      }
      root.innerHTML = UI.empty("⚠️", "Could not load your cart", err.message);
      return;
    }

    if (!summary.items.length) {
      root.innerHTML = UI.empty("🛒", "Your cart is empty",
        "Browse the shop and add something you want to play with.",
        `<a class="sx-btn sx-btn-primary" href="/shop">Start shopping</a>`);
      UI.setBadge("sxCartCount", 0);
      return;
    }

    root.innerHTML = `
      <div class="sx-cart-layout">
        <div class="sx-panel">
          <div class="sx-toolbar" style="margin-bottom:.4rem">
            <h3 style="margin:0">${summary.totalQuantity} item${summary.totalQuantity === 1 ? "" : "s"}</h3>
            <button class="sx-btn sx-btn-ghost sx-btn-sm" id="clearCart">Empty cart</button>
          </div>
          ${summary.items.map(item => {
            const p = item.product;
            const price = UI.finalPrice(p);
            return `
            <div class="sx-cart-row" data-item="${item.id}">
              <a href="/product?id=${p.id}"><img src="${UI.escape(p.image || "")}" alt="${UI.escape(p.name)}"></a>
              <div>
                <a href="/product?id=${p.id}"><strong>${UI.escape(p.name)}</strong></a>
                <div class="sx-small sx-muted">${UI.escape(p.brand || "SPORTX")}
                  ${item.size ? " · Size " + UI.escape(item.size) : ""}</div>
                <div class="sx-price" style="margin:.35rem 0">
                  <b>${UI.money(price)}</b>
                  ${p.discount ? `<s>${UI.money(p.price)}</s>` : ""}
                </div>
                <div style="display:flex;align-items:center;gap:.7rem;flex-wrap:wrap">
                  <div class="sx-qty">
                    <button data-dec="${item.id}" aria-label="Decrease">−</button>
                    <input value="${item.quantity}" data-qty="${item.id}" inputmode="numeric" aria-label="Quantity">
                    <button data-inc="${item.id}" aria-label="Increase">+</button>
                  </div>
                  <span class="sx-small ${p.stock <= 5 ? "sx-stock low" : "sx-muted"}">
                    ${p.stock <= 5 ? `Only ${p.stock} in stock` : `${p.stock} in stock`}</span>
                  <button class="sx-btn sx-btn-ghost sx-btn-sm" data-remove="${item.id}">Remove</button>
                </div>
              </div>
              <div style="text-align:right">
                <strong>${UI.money(price * item.quantity)}</strong>
              </div>
            </div>`;
          }).join("")}
        </div>

        <aside class="sx-panel sx-summary">
          <h3>Order summary</h3>
          <div class="sx-coupon">
            <input id="couponInput" placeholder="Coupon code" value="${UI.escape(summary.couponCode || "")}">
            <button class="sx-btn sx-btn-dark sx-btn-sm" id="applyCoupon">Apply</button>
          </div>
          ${summary.couponCode
            ? `<p class="sx-small" style="color:var(--green);margin:-.3rem 0 .6rem">
                 ${UI.escape(summary.couponCode)} applied.
                 <button class="sx-btn sx-btn-ghost sx-btn-sm" id="removeCoupon">Remove</button></p>`
            : `<p class="sx-small sx-muted" style="margin:-.3rem 0 .6rem">
                 Try SPORTX10, PLAY20 or NEW5.</p>`}

          <div class="sx-summary-line"><span>Subtotal (${summary.totalQuantity} items)</span>
            <span>${UI.money(summary.subTotal)}</span></div>
          <div class="sx-summary-line"><span>Product discount</span>
            <span style="color:var(--green)">− ${UI.money(summary.productDiscount)}</span></div>
          <div class="sx-summary-line"><span>Coupon discount</span>
            <span style="color:var(--green)">− ${UI.money(summary.couponDiscount)}</span></div>
          <div class="sx-summary-line"><span>Delivery charge</span>
            <span>${Number(summary.deliveryCharge) === 0 ? "Free" : UI.money(summary.deliveryCharge)}</span></div>
          <div class="sx-summary-total"><span>Total</span><span>${UI.money(summary.total)}</span></div>

          <button class="sx-btn sx-btn-primary sx-btn-block" id="checkoutBtn"
            style="margin-top:1rem">Proceed to checkout</button>
          <a class="sx-btn sx-btn-ghost sx-btn-block" href="/shop" style="margin-top:.5rem">Continue shopping</a>
        </aside>
      </div>`;

    UI.setBadge("sxCartCount", summary.totalQuantity);
    wire();
  }

  function wire() {
    root.addEventListener("click", async (event) => {
      const inc = event.target.closest("[data-inc]");
      const dec = event.target.closest("[data-dec]");
      const remove = event.target.closest("[data-remove]");

      if (inc || dec) {
        const id = Number((inc || dec).dataset.inc || (inc || dec).dataset.dec);
        const input = root.querySelector(`[data-qty="${id}"]`);
        const next = Number(input.value) + (inc ? 1 : -1);
        if (next < 1) return;
        await changeQuantity(id, next);
      }

      if (remove) {
        const id = Number(remove.dataset.remove);
        remove.disabled = true;
        try { await API.removeCartItem(id); UI.success("Removed from cart"); load(); }
        catch (err) { UI.error(err.message); remove.disabled = false; }
      }
    }, { once: true });

    root.querySelectorAll("[data-qty]").forEach(input =>
      input.addEventListener("change", () =>
        changeQuantity(Number(input.dataset.qty), Math.max(1, Number(input.value)))));

    document.getElementById("clearCart").addEventListener("click", async () => {
      if (!confirm("Remove everything from your cart?")) return;
      try { await API.clearCart(); UI.success("Cart emptied"); load(); }
      catch (err) { UI.error(err.message); }
    });

    document.getElementById("applyCoupon").addEventListener("click", () => {
      const code = document.getElementById("couponInput").value.trim().toUpperCase();
      if (!code) { UI.error("Enter a coupon code first"); return; }
      coupon = code;
      sessionStorage.setItem("sportx_coupon", code);
      load();
    });

    const removeCoupon = document.getElementById("removeCoupon");
    if (removeCoupon) removeCoupon.addEventListener("click", () => {
      coupon = ""; sessionStorage.removeItem("sportx_coupon"); load();
    });

    document.getElementById("checkoutBtn").addEventListener("click", () => location.href = "/checkout");
  }

  async function changeQuantity(id, quantity) {
    try {
      await API.updateCartItem(id, quantity);
      load();
    } catch (err) {
      UI.error(err.message);   // e.g. "Only 3 left in stock for ..."
      load();
    }
  }

  load();
});
