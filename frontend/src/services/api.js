/* =====================================================================
   SPORTX - static/js/api.js
   Single place where the frontend talks to the Spring Boot REST API.
   Attaches the JWT to every request and turns error responses into
   readable messages.
   ===================================================================== */

const API = (() => {

  // Same origin when the frontend is served by Spring Boot.
  // Change to "http://localhost:8080" if you serve the frontend separately.
  const BASE = "";

  const TOKEN_KEY = "sportx_token";
  const USER_KEY  = "sportx_user";

  function getToken() { return localStorage.getItem(TOKEN_KEY); }

  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); }
    catch { return null; }
  }

  function setSession(auth) {
    localStorage.setItem(TOKEN_KEY, auth.token);
    localStorage.setItem(USER_KEY, JSON.stringify({
      userId: auth.userId, name: auth.name, email: auth.email, role: auth.role
    }));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function isLoggedIn() { return !!getToken(); }
  function isAdmin() { const u = getUser(); return !!u && u.role === "ADMIN"; }

  async function request(path, { method = "GET", body, raw } = {}) {
    const headers = {};
    const token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token;
    if (body && !raw) headers["Content-Type"] = "application/json";

    let response;
    try {
      response = await fetch(BASE + path, {
        method,
        headers,
        body: raw ? body : (body ? JSON.stringify(body) : undefined)
      });
    } catch {
      throw new Error("Cannot reach the server. Check that the backend is running on port 8080.");
    }

    if (response.status === 401) {
      clearSession();
      throw new Error("Your session has expired. Sign in again.");
    }
    if (response.status === 403) {
      throw new Error("You do not have permission to do that.");
    }
    if (response.status === 204) return null;

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error((data && data.message) || "Request failed (" + response.status + ")");
    }
    return data;
  }

  return {
    getToken, getUser, setSession, clearSession, isLoggedIn, isAdmin, request,

    // ---------------- auth ----------------
    register: (data) => request("/api/auth/register", { method: "POST", body: data }),
    login:    (data) => request("/api/auth/login",    { method: "POST", body: data }),
    me:       ()     => request("/api/auth/me"),
    changePassword: (data) => request("/api/auth/change-password", { method: "POST", body: data }),

    // ---------------- catalogue ----------------
    categories:   ()   => request("/api/categories"),
    createCategory: (d) => request("/api/categories", { method: "POST", body: d }),
    updateCategory: (id, d) => request("/api/categories/" + id, { method: "PUT", body: d }),
    deleteCategory: (id) => request("/api/categories/" + id, { method: "DELETE" }),

    products: (params = {}) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") q.append(k, v);
      });
      return request("/api/products?" + q.toString());
    },
    product:      (id) => request("/api/products/" + id),
    featured:     ()   => request("/api/products/featured"),
    bestSellers:  ()   => request("/api/products/best-sellers"),
    newArrivals:  ()   => request("/api/products/new-arrivals"),
    related:      (id) => request("/api/products/" + id + "/related"),
    productReviews: (id) => request("/api/products/" + id + "/reviews"),
    createProduct: (d) => request("/api/products", { method: "POST", body: d }),
    updateProduct: (id, d) => request("/api/products/" + id, { method: "PUT", body: d }),
    updateStock:   (id, stock) => request("/api/products/" + id + "/stock", { method: "PUT", body: { stock } }),
    deleteProduct: (id) => request("/api/products/" + id, { method: "DELETE" }),

    // ---------------- cart ----------------
    cart:        ()   => request("/api/cart"),
    cartSummary: (coupon) => request("/api/cart/summary" + (coupon ? "?coupon=" + encodeURIComponent(coupon) : "")),
    addToCart:   (productId, quantity = 1, size) =>
                   request("/api/cart", { method: "POST", body: { productId, quantity, size } }),
    updateCartItem: (id, quantity) => request("/api/cart/" + id, { method: "PUT", body: { quantity } }),
    removeCartItem: (id) => request("/api/cart/" + id, { method: "DELETE" }),
    clearCart:   ()   => request("/api/cart", { method: "DELETE" }),

    // ---------------- wishlist ----------------
    wishlist:         ()  => request("/api/wishlist"),
    addToWishlist:    (productId) => request("/api/wishlist", { method: "POST", body: { productId } }),
    removeFromWishlist: (productId) => request("/api/wishlist/" + productId, { method: "DELETE" }),

    // ---------------- orders ----------------
    placeOrder:  (d)  => request("/api/orders", { method: "POST", body: d }),
    orders:      ()   => request("/api/orders"),
    order:       (id) => request("/api/orders/" + id),
    updateOrderStatus: (id, status) => request("/api/orders/" + id + "/status", { method: "PUT", body: { status } }),
    cancelOrder: (id) => request("/api/orders/" + id + "/cancel", { method: "PUT" }),

    // ---------------- reviews, coupons, profile ----------------
    postReview:  (d)  => request("/api/reviews", { method: "POST", body: d }),
    validateCoupon: (code, subTotal) =>
                   request("/api/coupons/validate", { method: "POST", body: { code, subTotal: String(subTotal) } }),
    profile:     ()   => request("/api/users/me"),
    updateProfile: (id, d) => request("/api/users/" + id, { method: "PUT", body: d }),
    contact:     (d)  => request("/api/contact", { method: "POST", body: d }),

    // ---------------- admin ----------------
    adminStats:  ()   => request("/api/admin/stats"),
    adminUsers:  ()   => request("/api/admin/users"),
    setUserActive: (id, active) => request("/api/admin/users/" + id + "/status", { method: "PUT", body: { active } }),
    adminCoupons: ()  => request("/api/admin/coupons"),
    createCoupon: (d) => request("/api/admin/coupons", { method: "POST", body: d }),
    deleteCoupon: (id) => request("/api/admin/coupons/" + id, { method: "DELETE" }),
    uploadImage: (file) => {
      const form = new FormData();
      form.append("file", file);
      return request("/api/upload", { method: "POST", body: form, raw: true });
    }
  };
})();
