const listparent = document.querySelector("tbody");
const loaderDOM = document.getElementById("loader");
const loadBtn = document.getElementById("load-more");
const loadBtnText = loadBtn.innerText;

const getPageWithID = async (page, id) => {
  const token = localStorage.getItem("token");
  const config = {
    headers: {
      authorization: `Bearer ${token}`,
    },
  };
  await axios
    .get(
      `https://snoc-dashboard-api.herokuapp.com/api/v1/transactions/page/${page}?id=${id}`,
      config
    )
    .then((res) => {
      if (res.data.success) {
        toggleLoader(false);
        const data = res.data.data;
        data.forEach(insertOneRow);
      } else {
        alert("HTTP-Error: " + res.status);
      }
    })
    .catch((err) => console.log(err));
};

const insertOneRow = (data) => {
  try {
    const id = data["IDENTIFIANT DE TRANSACTION"];
    const type = data["Type Transaction\n"];
    const code = data["CODE PDV"];
    const status = data["DESCRIPTION"];
    const date = data["DATE DE DERNIERE MODIFICATION"];

    const newDate = new Date(date).toLocaleString();

    const el = document.createElement("tr");
    el.innerHTML = `
        <th id="transaction-id" scope="row">${id}</th>
        <td>${type}</td>
        <td>${code}</td>
        <td>${status}</td>
        <td>${newDate}</td>
        <td><a class="btn btn-sm btn-primary px-3">Details</a></td>
        `;
    listparent.appendChild(el);

    const detailsBtn = el.querySelector("a");
    detailsBtn.addEventListener("click", (e) => {
      localStorage.setItem("selected-transaction", JSON.stringify(data));
      window.location.href = "activity_detailed.html";
    });
  } catch (error) {
    console.log(error);
  }
};

const deleteAllRows = () => {
  currentPage = 0;
  listparent.innerHTML = "";
};

const toggleLoader = (state) => {
  console.log(`Loader set to ${state}`);
  if (state) {
    loaderDOM.classList.remove("d-none");
    loaderDOM.classList.add("d-flex");
  } else {
    loaderDOM.classList.remove("d-flex");
    loaderDOM.classList.add("d-none");
  }
};

loadBtn.addEventListener("click", async (e) => {
  loadBtn.disabled = true;

  loadBtn.innerHTML = "Loading";
  currentPage = currentPage + 1;
  await getPageWithID(currentPage, "");
  loadBtn.innerHTML = loadBtnText;

  loadBtn.disabled = false;
});

let currentPage = 0;

const start = async () => {
  await getPageWithID(currentPage, "");
  toggleLoader(false);
};

start();

const formDOM = document.getElementById("search-form");
const inputDOM = document.querySelector("#search-form input");

formDOM.addEventListener("submit", (e) => {
  e.preventDefault();
  deleteAllRows();
  toggleLoader(true);
  const id = inputDOM.value;
  getPageWithID(0, id);
});
