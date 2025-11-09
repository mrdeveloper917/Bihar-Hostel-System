document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const password = document.getElementById("password");
  const confirm = document.getElementById("password2");
  const confirmError = document.getElementById("confirmError");

  // ✅ Live password match validation
  confirm.addEventListener("input", () => {
    if (confirm.value !== password.value) {
      confirm.setCustomValidity("Passwords do not match");
      confirmError.style.display = "block";
    } else {
      confirm.setCustomValidity("");
      confirmError.style.display = "none";
    }
  });

  // ✅ Prevent invalid form submission
  form.addEventListener("submit", (e) => {
    if (!form.checkValidity()) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.classList.add("was-validated");
  });
});
