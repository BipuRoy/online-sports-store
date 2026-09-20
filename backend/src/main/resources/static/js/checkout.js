/* SPORTX - static/js/checkout.js : validates the address form and places the order. */

document.addEventListener("DOMContentLoaded", async () => {
  UI.mount("");

  if (!API.isLoggedIn()) { location.href = "/login?next=/checkout"; return; }

  const coupon = sessionStorage.getItem("sportx_coupon") || "";
  const form = document.getElementById("checkoutForm");

  // ---------- prefill from the saved profile ----------
  try {
    const me = await API.profile();
    form.fullName.value = me.name || "";
    form.email.value = me.email || "";
    form.phone.value = me.phone || "";
    if (me.address) {
      const parts = me.address.split(",").map(s => s.trim());
      form.address.value = parts[0] || "";
      form.city.value = parts[1] || "";
      form.state.value = parts[2] || "";
      form.country.value = parts[3] || "India";
      form.pincode.value = parts[4] || "";
    }
  } catch { /* prefill is a convenience, not a requirement */ }

  // ---------- order summary ----------
  let summary;
  try {
    summary = await API.cartSummary(coupon);
  } catch {
    summary = await API.cartSummary("");
  }

  if (!summary.items.length) {
    UI.error("Your cart is empty");
    setTimeout(() => location.href = "/cart", 900);
    return;
  }

  document.getElementById("summaryItems").innerHTML = summary.items.map(item => `
    <div style="display:flex;justify-content:space-between;gap:.6rem;padding:.4rem 0;font-size:.9rem">
      <span>${UI.escape(item.product.name)}
        <span class="sx-muted">× ${item.quantity}</span></span>
      <span>${UI.money(UI.finalPrice(item.product) * item.quantity)}</span>
    </div>`).join("") + `<hr style="border:0;border-top:1px solid var(--line);margin:.6rem 0">`;

  document.getElementById("summaryTotals").innerHTML = `
    <div class="sx-summary-line"><span>Subtotal</span><span>${UI.money(summary.subTotal)}</span></div>
    <div class="sx-summary-line"><span>Product discount</span>
      <span style="color:var(--green)">− ${UI.money(summary.productDiscount)}</span></div>
    ${summary.couponCode ? `<div class="sx-summary-line">
      <span>Coupon ${UI.escape(summary.couponCode)}</span>
      <span style="color:var(--green)">− ${UI.money(summary.couponDiscount)}</span></div>` : ""}
    <div class="sx-summary-line"><span>Delivery charge</span>
      <span>${Number(summary.deliveryCharge) === 0 ? "Free" : UI.money(summary.deliveryCharge)}</span></div>
    <div class="sx-summary-total"><span>Total payable</span><span>${UI.money(summary.total)}</span></div>`;

  // ---------- payment method ----------
  document.querySelectorAll(".sx-pay-option").forEach(option => {
    option.addEventListener("click", () => {
      document.querySelectorAll(".sx-pay-option").forEach(o => o.classList.remove("active"));
      option.classList.add("active");
      option.querySelector("input").checked = true;
      document.getElementById("mockGateway").hidden = option.dataset.pay !== "ONLINE";
    });
  });

  // ---------- validation ----------
  const rules = {
    fullName: v => v.trim().length >= 3 || "Enter your full name",
    email:    v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email address",
    phone:    v => /^[0-9]{10}$/.test(v) || "Phone number must be exactly 10 digits",
    address:  v => v.trim().length >= 5 || "Enter your street address",
    city:     v => v.trim().length >= 2 || "Enter your city",
    state:    v => v.trim().length >= 2 || "Enter your state",
    country:  v => v.trim().length >= 2 || "Enter your country",
    pincode:  v => /^[0-9]{4,10}$/.test(v) || "Enter a valid PIN / ZIP code"
  };

  function validate() {
    let valid = true;
    Object.entries(rules).forEach(([name, check]) => {
      const input = form[name];
      const field = input.closest(".sx-field");
      const result = check(input.value);
      if (result === true) {
        field.classList.remove("invalid");
      } else {
        field.classList.add("invalid");
        field.querySelector(".sx-field-error").textContent = result;
        valid = false;
      }
    });
    return valid;
  }

  Object.keys(rules).forEach(name =>
    form[name].addEventListener("input", () => form[name].closest(".sx-field").classList.remove("invalid")));

  // ---------- place order ----------
  document.getElementById("placeOrder").addEventListener("click", async (e) => {
    if (!validate()) { UI.error("Check the highlighted fields"); return; }

    const button = e.target;
    button.disabled = true;
    button.textContent = "Placing your order…";

    const payload = {
      fullName: form.fullName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      address: form.address.value.trim(),
      city: form.city.value.trim(),
      state: form.state.value.trim(),
      country: form.country.value.trim(),
      pincode: form.pincode.value.trim(),
      paymentMethod: form.querySelector('input[name="paymentMethod"]:checked').value,
      couponCode: summary.couponCode || null
    };

    try {
      const order = await API.placeOrder(payload);
      sessionStorage.removeItem("sportx_coupon");
      sessionStorage.setItem("sportx_last_order", JSON.stringify(order));
      location.href = "/order-success?id=" + order.id;
    } catch (err) {
      UI.error(err.message);
      button.disabled = false;
      button.textContent = "Place order";
    }
  });
});
