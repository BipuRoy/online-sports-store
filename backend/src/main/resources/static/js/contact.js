/* =====================================================================
   SPORTX - static/js/contact.js
   Validates the contact form and posts it to /api/contact.
   ===================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  UI.mount("Contact");

  const form = document.getElementById("contactForm");
  if (!form) return;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(input, message) {
    const field = input.closest(".sx-field");
    if (!field) return;
    const slot = field.querySelector(".sx-field-error");
    field.classList.toggle("invalid", !!message);
    if (slot) slot.textContent = message || "";
  }

  // Pre-fill from the signed-in account so people do not retype it.
  const user = API.getUser();
  if (user) {
    form.name.value = user.name || "";
    form.email.value = user.email || "";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const { name, email, subject, message } = form;
    let valid = true;

    [name, email, message].forEach(i => setError(i, ""));

    if (name.value.trim().length < 3) {
      setError(name, "Tell us your name"); valid = false;
    }
    if (!EMAIL_RE.test(email.value.trim())) {
      setError(email, "Enter a valid email address"); valid = false;
    }
    if (message.value.trim().length < 10) {
      setError(message, "Please write at least 10 characters"); valid = false;
    }
    if (!valid) return;

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = "Sending…";

    try {
      await API.contact({
        name: name.value.trim(),
        email: email.value.trim(),
        subject: subject.value.trim() || "General enquiry",
        message: message.value.trim()
      });
      form.reset();
      if (user) { form.name.value = user.name || ""; form.email.value = user.email || ""; }
      UI.success("Thanks — your message has been received.");
    } catch (err) {
      UI.error(err.message);
    } finally {
      button.disabled = false;
      button.textContent = "Send message";
    }
  });
});
