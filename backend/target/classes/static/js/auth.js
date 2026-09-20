/* =====================================================================
   SPORTX - static/js/auth.js
   Shared by /login and /register. Handles client-side validation,
   the forgot-password dialog and the post-login redirect.
   ===================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  UI.mount("");

  /* ---------------- helpers ---------------- */

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_RE = /^[6-9]\d{9}$/;

  /** Writes a message under a field and marks it invalid. */
  function setError(input, message) {
    const field = input.closest(".sx-field");
    if (!field) return;
    const slot = field.querySelector(".sx-field-error");
    field.classList.toggle("invalid", !!message);
    if (slot) slot.textContent = message || "";
  }

  function clearErrors(form) {
    form.querySelectorAll(".sx-field").forEach(f => {
      f.classList.remove("invalid");
      const slot = f.querySelector(".sx-field-error");
      if (slot) slot.textContent = "";
    });
  }

  /** Where to go once the user is signed in. */
  function afterLogin(auth) {
    const next = UI.query("next");
    if (next && next.startsWith("/")) return next;
    return auth.role === "ADMIN" ? "/admin" : "/dashboard";
  }

  function busy(button, on, label) {
    button.disabled = on;
    button.textContent = on ? "Please wait…" : label;
  }

  /* ---------------- login ---------------- */

  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    // Already signed in? Skip the form.
    if (API.isLoggedIn()) {
      const user = API.getUser();
      location.replace(user && user.role === "ADMIN" ? "/admin" : "/dashboard");
      return;
    }

    const button = document.getElementById("loginBtn");

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearErrors(loginForm);

      const email = loginForm.email;
      const password = loginForm.password;
      let valid = true;

      if (!EMAIL_RE.test(email.value.trim())) {
        setError(email, "Enter a valid email address"); valid = false;
      }
      if (password.value.length < 6) {
        setError(password, "Password must be at least 6 characters"); valid = false;
      }
      if (!valid) return;

      busy(button, true, "Sign in");
      try {
        const auth = await API.login({
          email: email.value.trim().toLowerCase(),
          password: password.value
        });
        API.setSession(auth);
        UI.success("Welcome back, " + auth.name.split(" ")[0]);
        setTimeout(() => location.href = afterLogin(auth), 600);
      } catch (err) {
        UI.error(err.message);
        busy(button, false, "Sign in");
      }
    });

    /* ---------------- forgot password (simulated) ---------------- */

    const modal = document.getElementById("forgotModal");
    const link = document.getElementById("forgotLink");
    const send = document.getElementById("sendReset");

    const open  = () => modal.classList.add("open");
    const close = () => modal.classList.remove("open");

    if (link) link.addEventListener("click", (e) => { e.preventDefault(); open(); });
    if (modal) {
      modal.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", close));
      modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    }
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

    if (send) {
      send.addEventListener("click", () => {
        const value = document.getElementById("forgotEmail").value.trim();
        if (!EMAIL_RE.test(value)) { UI.error("Enter a valid email address"); return; }
        close();
        UI.success("If that email is registered, a reset link has been sent.");
      });
    }
  }

  /* ---------------- registration ---------------- */

  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    if (API.isLoggedIn()) { location.replace("/dashboard"); return; }

    const button = document.getElementById("registerBtn");

    registerForm.phone.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
    });

    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearErrors(registerForm);

      const { name, email, phone, password, confirmPassword } = registerForm;
      let valid = true;

      if (name.value.trim().length < 3) {
        setError(name, "Name must be at least 3 characters"); valid = false;
      }
      if (!EMAIL_RE.test(email.value.trim())) {
        setError(email, "Enter a valid email address"); valid = false;
      }
      if (!PHONE_RE.test(phone.value.trim())) {
        setError(phone, "Enter a 10-digit mobile number"); valid = false;
      }
      if (password.value.length < 6) {
        setError(password, "Use at least 6 characters"); valid = false;
      }
      if (password.value !== confirmPassword.value) {
        setError(confirmPassword, "Passwords do not match"); valid = false;
      }
      if (!valid) return;

      busy(button, true, "Create account");
      try {
        const auth = await API.register({
          name: name.value.trim(),
          email: email.value.trim().toLowerCase(),
          phone: phone.value.trim(),
          password: password.value,
          confirmPassword: confirmPassword.value
        });
        API.setSession(auth);
        UI.success("Account created. Welcome to SPORTX!");
        setTimeout(() => location.href = afterLogin(auth), 700);
      } catch (err) {
        // The server rejects duplicate emails — show it on the field.
        if (/email/i.test(err.message)) setError(email, err.message);
        UI.error(err.message);
        busy(button, false, "Create account");
      }
    });
  }
});
