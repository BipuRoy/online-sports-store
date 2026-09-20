/* SPORTX - static/js/order-success.js : confirmation screen after checkout. */

document.addEventListener("DOMContentLoaded", async () => {
  UI.mount("");

  const box = document.getElementById("successDetails");
  const id = UI.query("id");
  if (!id) { box.innerHTML = ""; return; }

  try {
    const order = await API.order(id);
    box.innerHTML = `
      <table class="sx-specs" style="text-align:left;margin-top:1rem">
        <tr><td>Order ID</td><td><strong>#${order.id}</strong></td></tr>
        <tr><td>Placed on</td><td>${UI.date(order.createdAt)}</td></tr>
        <tr><td>Items</td><td>${order.items.length}</td></tr>
        <tr><td>Total paid</td><td><strong>${UI.money(order.totalAmount)}</strong></td></tr>
        <tr><td>Payment</td><td>${order.paymentMethod === "COD" ? "Cash on delivery" : "Online (mock gateway)"}
          — ${UI.escape(order.paymentStatus)}</td></tr>
        <tr><td>Status</td><td><span class="sx-chip sx-chip-${order.orderStatus.toLowerCase()}">
          ${UI.escape(order.orderStatus)}</span></td></tr>
        <tr><td>Delivering to</td><td>${UI.escape(order.shippingAddress)}</td></tr>
      </table>`;
    UI.refreshCounts();
  } catch (err) {
    box.innerHTML = `<p class="sx-muted">${UI.escape(err.message)}</p>`;
  }
});
