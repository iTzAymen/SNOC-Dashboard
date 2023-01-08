const total_cards = document.getElementById("total-cards");
const dateInput = document.getElementById("date-input");
const refreshBtn = document.getElementById("date-submit");
const daily_cards = document.getElementById("daily-cards");
const overview_charts = document.getElementById("overview-charts");
const daily_charts = document.getElementById("daily-charts");

const MONTHS_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getMax = (arr) => {
  let max_id = "";
  let max = -1;
  let idx = -1;
  arr.forEach((obj, idx_) => {
    const { _id, count } = obj;
    if (count && count > max) {
      max = count;
      max_id = _id;
      idx = idx_;
    }
  });
  return max_id;
};

const toggleData = (state) => {
  if (state) {
    document
      .querySelectorAll("#overview-container #loader")
      .forEach((element) => {
        element.classList.add("d-none");
      });

    document
      .querySelectorAll("#overview-container canvas, #total-cards .card-text")
      .forEach((element) => {
        element.classList.remove("d-none");
      });
  } else {
    document
      .querySelectorAll("#overview-container #loader")
      .forEach((element) => {
        element.classList.remove("d-none");
      });

    document
      .querySelectorAll("#overview-container canvas, #total-cards .card-text")
      .forEach((element) => {
        element.classList.add("d-none");
      });
  }
};

const toggleDailyData = (state) => {
  if (state) {
    document.querySelectorAll("#daily-container #loader").forEach((element) => {
      element.classList.add("d-none");
    });

    document
      .querySelectorAll("#daily-container canvas, #daily-cards .card-text")
      .forEach((element) => {
        element.classList.remove("d-none");
      });
  } else {
    document.querySelectorAll("#daily-container #loader").forEach((element) => {
      element.classList.remove("d-none");
    });

    document
      .querySelectorAll("#daily-container canvas, #daily-cards .card-text")
      .forEach((element) => {
        element.classList.add("d-none");
      });
  }
};

const displayOverviewCards = (data) => {
  const { total_count, offer_count, city_count, refused_count } = data;

  const total_countDOM = document.querySelector(
    "#overview-container #total-transactions"
  );
  total_countDOM.textContent = total_count[0].count;

  const offer_countDOM = document.querySelector(
    "#overview-container #best-offer"
  );
  offer_countDOM.textContent = getMax(offer_count);

  const city_countDOM = document.querySelector(
    "#overview-container #best-city"
  );
  city_countDOM.textContent = getMax(city_count);

  const refused_countDOM = document.querySelector(
    "#overview-container #total-refused"
  );
  refused_countDOM.textContent = refused_count[0] ? refused_count[0].count : 0;
};

const displayDailyCards = (data) => {
  const { total_count, offer_count, city_count, refused_count } = data;

  const total_countDOM = document.querySelector(
    "#daily-container #total-transactions"
  );
  total_countDOM.textContent = total_count[0].count;

  const offer_countDOM = document.querySelector("#daily-container #best-offer");
  offer_countDOM.textContent = getMax(offer_count);

  const city_countDOM = document.querySelector("#daily-container #best-city");
  city_countDOM.textContent = getMax(city_count);

  const refused_countDOM = document.querySelector(
    "#daily-container #total-refused"
  );
  refused_countDOM.textContent = refused_count[0] ? refused_count[0].count : 0;
};

const displayOverviewGraphs = (data) => {
  const { transactions_count, offer_count, city_count } = data;
  const container = overview_charts;

  let transactions_count_obj = [];
  transactions_count.forEach((value) => {
    transactions_count_obj[value._id] = value.count;
  });

  let offer_count_obj = {};
  offer_count.forEach((value) => {
    offer_count_obj[value._id] = value.count;
  });

  let city_count_obj = {};
  city_count.forEach((value) => {
    city_count_obj[value._id] = value.count;
  });

  displayCharts(
    container,
    transactions_count_obj,
    offer_count_obj,
    city_count_obj,
    false
  );
};

const displayDailyGraphs = (data) => {
  const { transactions_count, offer_count, city_count } = data;
  const container = daily_charts;
  destroyCharts(container);

  let transactions_count_obj = [];
  transactions_count.forEach((value) => {
    transactions_count_obj[value._id] = value.count;
  });

  let offer_count_obj = {};
  offer_count.forEach((value) => {
    offer_count_obj[value._id] = value.count;
  });

  let city_count_obj = {};
  city_count.forEach((value) => {
    city_count_obj[value._id] = value.count;
  });

  displayCharts(
    container,
    transactions_count_obj,
    offer_count_obj,
    city_count_obj,
    true
  );
};

// New method
const token = localStorage.getItem("token");
const config = {
  headers: {
    authorization: `Bearer ${token}`,
  },
};

const updateOverviewSection = () => {
  toggleData(false);
  const d = new Date();
  axios
    .get(
      "https://snoc-dashboard-api.onrender.com/api/v1/transactions/overview",
      config
    )
    .then((res) => {
      const t = new Date() - d;
      console.log(`Statistics overview received after ${t} ms`);
      toggleData(res.data.success);
      if (res.data.success) {
        const data = res.data.data;
        displayOverviewCards(data);
        displayOverviewGraphs(data);
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const updateDailySection = (date) => {
  toggleDailyData(false);
  const d = new Date();
  axios
    .post(
      "https://snoc-dashboard-api.onrender.com/api/v1/transactions/daily",
      { date },
      config
    )
    .then((res) => {
      const t = new Date() - d;
      console.log(`Statistics daily received after ${t} ms`);
      toggleDailyData(res.data.success);
      if (res.data.success) {
        const data = res.data.data;
        displayDailyCards(data);
        displayDailyGraphs(data);
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const validateDate = async (date) => {
  const d = new Date();
  let data = { valid: false };
  await axios
    .post(
      "https://snoc-dashboard-api.onrender.com/api/v1/transactions/validate",
      { date },
      config
    )
    .then((res) => {
      const t = new Date() - d;
      console.log(`Date validation received after ${t} ms`);
      if (res.data.success) {
        data = res.data.data;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return data;
};

const updateDateInput = (min, max) => {
  const min_date = new Date(min);
  const max_date = new Date(max);
  dateInput.min = min_date.toISOString().split("T")[0];
  dateInput.max = max_date.toISOString().split("T")[0];
};

refreshBtn.addEventListener("click", async () => {
  const date = new Date(dateInput.value);
  const { valid, min, max } = await validateDate(date);
  updateDateInput(min, max);
  if (valid) {
    updateDailySection(date);
  }
});

let chartsCache = [];

function destroyCharts(container) {
  chartsCache.forEach((value) => {
    if (container.contains(value.canvas)) value.destroy();
  });
}

function displayCharts(container, monthlyData, offersData, cityData, daily) {
  const default_options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };
  let labels = [];
  if (daily) {
    labels = monthlyData.map((value, index) => {
      const r = index % 12;
      const d = Math.floor(index / 12);
      return `${r} ${d === 0 ? "AM" : "PM"}`;
    });

    monthlyData = monthlyData.filter((n) => n);
    labels = labels.filter((n) => n);
  } else {
    const start_month = Number(Object.keys(monthlyData).at(0));
    const end_month = Number(Object.keys(monthlyData).at(-1)) + 1;

    labels = MONTHS_LABELS.slice(start_month, end_month);
    monthlyData = monthlyData.slice(start_month, end_month);
  }

  const monthly_data = {
    labels: labels,
    datasets: [
      {
        label: "Transactions",
        backgroundColor: "rgba(225, 29, 37,0.3)",
        borderColor: "#e11d25",
        pointBorderColor: "rgb(255, 255, 255)",
        pointBackgroundColor: "#e11d25",
        borderCapStyle: "round",
        pointBorderWidth: 1,
        borderWidth: 3,
        pointRadius: 6,
        hoverRadius: 8,
        fill: true,
        cubicInterpolationMode: "monotone",
        data: monthlyData,
        animations: {
          borderWidth: {
            duration: 1000,
            easing: "easeInOutQuad",
            from: 3,
            to: 4,
            loop: true,
          },
        },
      },
    ],
  };

  const monthly_config = {
    type: "line",
    data: monthly_data,
    options: default_options,
  };

  const monthlyCanvas = document.querySelector(
    `#${container.id} #monthly_transaction`
  );
  monthlyCanvas
    .getContext("2d")
    .clearRect(0, 0, monthlyCanvas.width, monthlyCanvas.height);

  const monthly_chart = new Chart(monthlyCanvas, monthly_config);

  chartsCache.push(monthly_chart);

  const offer_data = {
    datasets: [
      {
        label: "Transactions",
        backgroundColor: "#e11d25",
        borderRadius: 5,
        borderColor: "rgba(225, 29, 37,0.3)",
        data: offersData,
        barThickness: "flex",
      },
    ],
  };

  const offer_config = {
    type: "bar",
    data: offer_data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
        x: {
          display: false,
        },
      },
    },
  };

  const offerCanvas = document.querySelector(
    `#${container.id} #offer_transactions`
  );
  offerCanvas
    .getContext("2d")
    .clearRect(0, 0, offerCanvas.width, offerCanvas.height);

  const offer_chart = new Chart(offerCanvas, offer_config);

  chartsCache.push(offer_chart);

  const city_data = {
    datasets: [
      {
        label: "Transactions",
        backgroundColor: "#e11d25",
        borderColor: "rgba(225, 29, 37,0.3)",
        borderRadius: 5,
        data: cityData,
        barThickness: "flex",
      },
    ],
  };

  const city_config = {
    type: "bar",
    data: city_data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
        x: {
          display: false,
        },
      },
    },
  };

  const cityCanvas = document.querySelector(
    `#${container.id} #city_transactions`
  );
  cityCanvas
    .getContext("2d")
    .clearRect(0, 0, cityCanvas.width, cityCanvas.height);

  const city_chart = new Chart(cityCanvas, city_config);

  chartsCache.push(city_chart);
}

const start = async () => {
  let date = new Date();
  updateOverviewSection();
  const { valid, min, max } = await validateDate(date);
  updateDateInput(min, max);
  if (!valid) {
    date = new Date(max);
  }
  updateDailySection(date);
  dateInput.value = date.toISOString().split("T")[0];
};

start();
