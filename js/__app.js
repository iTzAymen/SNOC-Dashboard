const DATE_INDEX = "DATE DE CREATION"
const CITY_INDEX = "WILAYA PDV"
const CITY_INDEX_BACKUP = "WILAYA"
const OFFER_INDEX = "PRODUIT"
const REJECT_INDEX = "DESCRIPTION"
const REJECT_INDEX_BACKUP = "RAISON REJECT"


const parseCSV = (data) => {
    const csvData = [];
    const lines = data.split("\n");

    for (let i = 0; i < lines.length; i++) {
        csvData[i] = lines[i].split(",");
    }

    return csvData;
};

const cleanArray = (arr) => {
    delete arr["undefined"]
    delete arr["NULL"]
    for (let element in arr) {
        if (!isNaN(element)) {
            delete arr[element]
        }
    }
}

const getStats = (dataset, column_index, backup_index) => {
    let stats = {}

    for (let index in dataset) {
        let Transaction = dataset[index]
        let Type = Transaction[column_index] || !backup_index ? Transaction[column_index] : Transaction[backup_index]
        if (Type) {
            Type = Type.replace('"', '')
        }
        stats[Type] = stats[Type] ? stats[Type] + 1 : 1
    }
    cleanArray(stats)

    return stats
}

const getMaxInRows = (dataset, column_index, backup_index) => {
    let stats = getStats(dataset, column_index, backup_index)

    let max = 0
    let best_offer
    for (offer in stats) {
        if (stats[offer] > max) {
            max = stats[offer]
            best_offer = offer
        }
    }

    return best_offer
}

const countOccurences = (dataset, values, column_index, backup_index) => {
    let occurences = 0
    for (let index in dataset) {
        Transaction = dataset[index]
        Value = Transaction[column_index] ? Transaction[column_index].replace('"', '') : null
        backupValue = Transaction[backup_index] ? Transaction[backup_index].replace('"', '') : null
        if ((Value && values.indexOf(Value) >= 0) || (backupValue && values.indexOf(backupValue) >= 0)) {
            occurences += 1
        }
    }
    return occurences
}

const displayStats = (total_transactions, best_offer, best_city, total_rejected, container) => {
    const transactions_card = document.querySelector(`#${container.id} #total-transactions`)
    transactions_card.textContent = total_transactions

    const offer_card = document.querySelector(`#${container.id} #best-offer`)
    offer_card.textContent = best_offer ? best_offer : "None"

    const city_card = document.querySelector(`#${container.id} #best-city`)
    city_card.textContent = best_city ? best_city : "None"

    const refused_card = document.querySelector(`#${container.id} #total-refused`)
    refused_card.textContent = total_rejected
}

const updateStats = (dataset, container) => {
    const rejected_values = ["Failed", "Payment Rejected", "Rejected By Approval Team", "Manque copie PI", "Identité différente sur système", "ID proof not properly visible", "ID proof not matching with ID Number or ID Type", "Document mal scanné", "Client mineur", "Absence déclaration de perte ou vol"]

    const best_city = getMaxInRows(dataset, CITY_INDEX, CITY_INDEX_BACKUP)
    const total_transactions = dataset.length
    const best_offer = getMaxInRows(dataset, OFFER_INDEX)
    const total_rejected = countOccurences(dataset, rejected_values, REJECT_INDEX, REJECT_INDEX_BACKUP)

    displayStats(total_transactions, best_offer, best_city, total_rejected, container)
}

const geteDailyStats = (dataset, actualDate) => {
    if (!dataset || !actualDate) {
        return
    }

    const filteredDataset = dataset.filter((row) => {
        let d = row[DATE_INDEX].split("T")[0]
        let transactionActualDate = new Date(d)
        const isSameDate = (actualDate.getDate() == transactionActualDate.getDate() && actualDate.getMonth() == transactionActualDate.getMonth() && actualDate.getFullYear() == transactionActualDate.getFullYear())
        return isSameDate
    })

    if (filteredDataset.length == 0) {
        return null
    }

    return filteredDataset
}

const getMonthlyStats = (dataset, month, year) => {
    if (!dataset || !month || !year) {
        return
    }

    const filteredDataset = dataset.filter((row) => {
        let d = row[DATE_INDEX].split("T")[0]
        let transactionActualDate = new Date(d)
        const isSameMonth = (month == transactionActualDate.getMonth() && year == transactionActualDate.getFullYear())
        return isSameMonth
    })
    return filteredDataset
}

const getHourlyStats = (dataset, hour, day, month, year) => {
    if (!dataset || !month || !year || !day) {
        return
    }

    const filteredDataset = dataset.filter((row) => {
        let d = row[DATE_INDEX].split("T")[0]
        let h = row[DATE_INDEX].split("T")[1].split(":")[0]
        let transactionActualDate = new Date(d)
        const isSameHour = (h == hour && transactionActualDate.getDate() == day && month == transactionActualDate.getMonth() && transactionActualDate.getFullYear() == year)
        return isSameHour
    })
    return filteredDataset
}

const updateMonthlyData = (dataset, todayDate) => {
    const MONTHS_LABELS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "December"]
    let monthlyData = {}
    for (let month = 1; month <= 12; month++) {
        const monthlySet = getMonthlyStats(dataset, month, todayDate.getFullYear())
        monthlyData[MONTHS_LABELS[month]] = monthlySet.length
    }
    for (let month = 1; month <= 12; month++) {
        const currentIndex = MONTHS_LABELS[month]
        const nextIndex = MONTHS_LABELS[month + 1]

        const isEmpty = !(monthlyData[currentIndex] > 0)
        const isNextEmpty = (month + 1 < 12 && monthlyData[nextIndex] == 0) || month == 12
        if (isEmpty && isNextEmpty) {
            delete monthlyData[currentIndex]
        }
    }
    return monthlyData
}

const updateHourlyData = (dataset, date) => {
    let hourlyData = {}
    for (let hour = 0; hour < 24; hour++) {
        const hourlySet = getHourlyStats(dataset, hour, date.getDate(), date.getMonth(), date.getFullYear())
        const hourLabel = hour > 12 ? (hour - 12).toString() + " PM" : hour.toString() + " AM"
        hourlyData[hourLabel] = hourlySet.length
    }
    for (let hour = 0; hour < 24; hour++) {
        const currentIndex = hour > 12 ? (hour - 12).toString() + " PM" : hour.toString() + " AM"
        const nextIndex = hour + 1 > 12 ? (hour + 1 - 12).toString() + " PM" : (hour + 1).toString() + " AM"

        const isEmpty = !(hourlyData[currentIndex] > 0)
        const isNextEmpty = (hour + 1 < 12 && hourlyData[nextIndex] == 0) || hour == 23
        if (isEmpty && isNextEmpty) {
            delete hourlyData[currentIndex]
        }
    }
    return hourlyData
}

const updateCharts = (dataset, container, actualDate, isDaily) => {

    let monthlyHourlyData = isDaily ? updateHourlyData(dataset, actualDate) : updateMonthlyData(dataset, actualDate)

    let offer_stats = getStats(dataset, OFFER_INDEX)
    let offersData = {}

    for (let i = 0; i < 6; i++) {
        let max
        for (let offer in offer_stats) {
            if (!max || offer_stats[offer] > offer_stats[max]) {
                if (!offersData[offer]) {
                    max = offer
                }
            }
        }

        offersData[max] = offer_stats[max]
    }

    let city_stats = getStats(dataset, CITY_INDEX, CITY_INDEX_BACKUP)
    let cityData = {}

    for (let i = 0; i < 6; i++) {
        let max
        for (let city in city_stats) {
            if (!max || city_stats[city] > city_stats[max]) {
                if (!cityData[city]) {
                    max = city
                }
            }
        }

        cityData[max] = city_stats[max]
    }

    if (isDaily) {
        destroyCharts(container)
    }

    displayCharts(container, monthlyHourlyData, offersData, cityData)
}

const toggleData = (state) => {
    if (state) {
        document.getElementById("total-cards").classList.remove("d-none")
        document.getElementById("overview-charts").classList.remove("d-none")

        document.getElementById("overview-no-data").classList.add("d-none")

        document.querySelectorAll('#overview-container #loader').forEach((element) => {
            element.classList.add("d-none")
        })

        document.querySelectorAll('#overview-container canvas').forEach((element) => {
            element.classList.remove('d-none')
        })
    } else {
        document.getElementById("total-cards").classList.add("d-none")
        document.getElementById("overview-charts").classList.add("d-none")

        document.getElementById("overview-no-data").classList.remove("d-none")
    }
}

const toggleDailyData = (state) => {
    if (state) {
        document.getElementById("daily-cards").classList.remove("d-none")
        document.getElementById("daily-charts").classList.remove("d-none")

        document.getElementById("daily-no-data").classList.add("d-none")

        document.querySelectorAll('#daily-container #loader').forEach((element) => {
            element.classList.add("d-none")
        })

        document.querySelectorAll('#daily-container canvas').forEach((element) => {
            element.classList.remove('d-none')
        })
    } else {
        document.getElementById("overview-no-data").classList.remove("d-none")
        document.getElementById("daily-no-data").classList.remove("d-none")

        document.getElementById("daily-cards").classList.add("d-none")
        document.getElementById("daily-charts").classList.add("d-none")
    }
}

const updateDailyPage = (dataset, daily_cards, daily_charts, actualDate) => {
    const filteredSet = geteDailyStats(dataset, actualDate)
    document.getElementById("readable-date").textContent = actualDate.toDateString()
    toggleDailyData(filteredSet)
    if (filteredSet) {
        updateStats(filteredSet, daily_cards)
        updateCharts(filteredSet, daily_charts, actualDate, true)
    }
}

const updateOverviewPage = (dataset, total_cards, overview_charts, todayDate) => {
    toggleData(dataset)
    updateStats(dataset, total_cards)
    updateCharts(dataset, overview_charts, todayDate)
}

console.log('-- Getting data --')
const d = new Date()
const token = localStorage.getItem('token')
const config = {
    headers: {
        authorization: `Bearer ${token}`
    }
}
axios.get('https://snoc-dashboard-api.herokuapp.com/api/v1/transactions', config)
    .then((res) => {
        const t = new Date() - d
        console.log(`-- Data successfully received after ${t} ms --`)
        if (res.data.success) {
            const data = res.data.data
            main(data)
        }
        else {
            alert("HTTP-Error: " + res.status);
        }
    })
    .catch(err => {
        console.log(err)
        if (err.toString().includes("Chart is not defined")) {
            document.querySelectorAll("#total-cards, #overview-charts, #daily-cards, #daily-charts").forEach((value) => {
                value.classList.add("d-none")
            })
        }
    })

function main(arr) {
    let maxDate = null
    let minDate = null
    let dataset = [...arr]
    dataset.forEach((value, index) => {
        const dateString = value[DATE_INDEX]
        const transactionDate = dateString ? new Date(dateString) : null
        if (transactionDate && (!maxDate || transactionDate > maxDate)) {
            maxDate = transactionDate
        }
        if (transactionDate && (!minDate || transactionDate < minDate)) {
            minDate = transactionDate
        }
    })

    const total_cards = document.getElementById("total-cards")
    const dateInput = document.getElementById("date-input")
    const refreshBtn = document.getElementById("date-submit")
    const daily_cards = document.getElementById("daily-cards")
    const overview_charts = document.getElementById("overview-charts")
    const daily_charts = document.getElementById("daily-charts")
    const todayDate = new Date()

    dateInput.max = maxDate.toISOString().split("T")[0]
    dateInput.min = minDate.toISOString().split("T")[0]

    updateOverviewPage(dataset, total_cards, overview_charts, todayDate)

    refreshBtn.onclick = () => {
        const actualDate = new Date(dateInput.value)
        updateDailyPage(dataset, daily_cards, daily_charts, actualDate)
    }

    updateDailyPage(dataset, daily_cards, daily_charts, maxDate)
}

let chartsCache = []

function destroyCharts(container) {
    chartsCache.forEach((value) => {
        if (container.contains(value.canvas))
            value.destroy()
    })
}

function displayCharts(container, monthlyData, offersData, cityData) {
    const default_options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            }
        }
    }

    const monthly_data = {
        datasets: [{
            label: 'Transactions',
            backgroundColor: 'rgba(225, 29, 37,0.3)',
            borderColor: '#e11d25',
            pointBorderColor: 'rgb(255, 255, 255)',
            pointBackgroundColor: '#e11d25',
            borderCapStyle: 'round',
            pointBorderWidth: 1,
            borderWidth: 3,
            pointRadius: 6,
            hoverRadius: 8,
            fill: true,
            cubicInterpolationMode: 'monotone',
            data: monthlyData,
            animations: {
                borderWidth: {
                    duration: 1000,
                    easing: 'easeInOutQuad',
                    from: 3,
                    to: 4,
                    loop: true
                }
            },
        }]
    };

    const monthly_config = {
        type: 'line',
        data: monthly_data,
        options: default_options
    };

    const monthlyCanvas = document.querySelector(`#${container.id} #monthly_transaction`)
    monthlyCanvas.getContext('2d').clearRect(0, 0, monthlyCanvas.width, monthlyCanvas.height)

    const monthly_chart = new Chart(
        monthlyCanvas,
        monthly_config
    );

    chartsCache.push(monthly_chart)

    const offer_data = {
        datasets: [{
            label: 'Transactions',
            backgroundColor: '#e11d25',
            borderRadius: 5,
            borderColor: 'rgba(225, 29, 37,0.3)',
            data: offersData,
            barThickness: 'flex'
        }]
    };

    const offer_config = {
        type: 'bar',
        data: offer_data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        },
    };

    const offerCanvas = document.querySelector(`#${container.id} #offer_transactions`)
    offerCanvas.getContext('2d').clearRect(0, 0, offerCanvas.width, offerCanvas.height)

    const offer_chart = new Chart(
        offerCanvas,
        offer_config
    );

    chartsCache.push(offer_chart)

    const city_data = {
        datasets: [{
            label: 'Transactions',
            backgroundColor: '#e11d25',
            borderColor: 'rgba(225, 29, 37,0.3)',
            borderRadius: 5,
            data: cityData,
            barThickness: 'flex'
        }]
    };

    const city_config = {
        type: 'bar',
        data: city_data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        },
    };

    const cityCanvas = document.querySelector(`#${container.id} #city_transactions`)
    cityCanvas.getContext('2d').clearRect(0, 0, cityCanvas.width, cityCanvas.height)

    const city_chart = new Chart(
        cityCanvas,
        city_config
    );

    chartsCache.push(city_chart)
}