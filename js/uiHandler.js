document.querySelectorAll("nav .nav-link").forEach((value) => {
  value.addEventListener("click", () => {
    document.querySelectorAll("nav .nav-link").forEach((value2) => {
      value2.classList.remove("active");
    });
    value.classList.add("active");
  });
});

const user = JSON.parse(localStorage.getItem("user"));
document.getElementById("account-toggle").textContent = user.name;
