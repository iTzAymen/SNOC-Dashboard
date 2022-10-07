const formDOM = document.getElementById("account-form");
const alertDangerDOM = document.querySelector("#account-form .alert-danger");
const alertSuccessDOM = document.querySelector("#account-form .alert-success");
const alertLightDOM = document.querySelector("#account-form .alert-secondary");

const getData = () => {
  const userJSON = localStorage.getItem("user");
  const user = JSON.parse(userJSON);
  const { _id, email, name: username } = user;

  const emailDOM = document.getElementById("email-input");
  const _idDOM = document.getElementById("id-input");
  const usernameDOM = document.getElementById("username-input");

  emailDOM.value = email;
  _idDOM.value = _id;
  usernameDOM.value = username;
};

getData();

formDOM.addEventListener("submit", async (e) => {
  e.preventDefault();
  loadAlert();

  const token = localStorage.getItem("token");
  const config = {
    headers: {
      authorization: `Bearer ${token}`,
    },
  };
  const formData = new FormData(e.target);

  const body = {
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
  };

  await axios
    .patch(`https://snoc-dashboard-api.herokuapp.com/api/v1/auth`, body, config)
    .then((res) => {
      const data = res.data;
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      showAlert(true, "Changes updated successfully");

      setTimeout(() => {
        window.location.reload();
      }, 200);
    })
    .catch((err) => {
      console.log(err);
      if (err.response.data) {
        showAlert(false, err.response.data.msg);
      }
    });

  const body2 = {
    email: formData.get("email"),
    old_password: formData.get("password"),
    new_password: formData.get("new_password"),
  };

  if (formData.get("new_password") == "") {
    return;
  }

  if (formData.get("new_password") !== formData.get("confirm_password")) {
    showAlert(false, "Password confirmation does not match");
    return;
  }

  await axios
    .patch(
      `https://snoc-dashboard-api.herokuapp.com/api/v1/auth/reset`,
      body2,
      config
    )
    .then((res) => {
      const data = res.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      showAlert(true, "Changes updated successfully");
    })
    .catch((err) => {
      console.log(err);
      if (err.response.data) {
        showAlert(false, err.response.data.msg);
      }
    });
});

const showAlert = (success, msg) => {
  if (success) {
    alertLightDOM.classList.add("d-none");
    alertDangerDOM.classList.add("d-none");
    alertSuccessDOM.classList.remove("d-none");

    alertSuccessDOM.textContent = msg;
  } else {
    alertLightDOM.classList.add("d-none");
    alertDangerDOM.classList.remove("d-none");
    alertSuccessDOM.classList.add("d-none");

    alertDangerDOM.textContent = msg;
  }
};

const loadAlert = () => {
  alertLightDOM.classList.remove("d-none");
  alertDangerDOM.classList.add("d-none");
  alertSuccessDOM.classList.add("d-none");
};
