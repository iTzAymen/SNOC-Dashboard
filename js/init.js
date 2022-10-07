const auth = new Auth();

document.querySelectorAll("#logout-btn").forEach(element => {
    element.addEventListener("click", (e) => {
        auth.logOut();
    })
});
