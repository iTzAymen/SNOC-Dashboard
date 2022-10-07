const selectedTransaction = localStorage.getItem('selected-transaction')
const tableParent = document.querySelector('.table tbody')
const transactionTitle = document.getElementById('transaction-title')

const displayData = (data) => {
    transactionTitle.innerText = `Transaction #${data['IDENTIFIANT DE TRANSACTION']} - Details`

    tableParent.innerHTML = ''
    for(const property in data){
        if(property === '_id'){
            continue
        }

        const el = document.createElement('tr')
        if(data[property].toLowerCase() == 'null'){
            el.innerHTML = `<th scope="row">${property}</th><td>⎯⎯⎯⎯</td>`
        }else if(property.startsWith('DATE')){
            const date = new Date(data[property]).toLocaleString()
            el.innerHTML = `<th scope="row">${property}</th><td>${date}</td>`
        }else{
            el.innerHTML = `<th scope="row">${property}</th><td>${data[property]}</td>`
        }

        tableParent.appendChild(el)
    }

}

if(selectedTransaction){
    const transactionData = JSON.parse(selectedTransaction)
    displayData(transactionData)
}