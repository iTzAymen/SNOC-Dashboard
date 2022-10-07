const formDOM = document.getElementById('login-form')
const emailDOM = document.getElementById('inputEmail')
const passwordDOM = document.getElementById('inputPassword')

const emailAlertDOM = document.getElementById('email-error-message')
const passwordAlertDOM = document.getElementById('password-error-message')

formDOM.addEventListener('submit', async (e) => {

    passwordAlertDOM.classList.add('d-none')
    e.preventDefault()

    const email = emailDOM.value
    const password = passwordDOM.value

    try {
        const { data } = await axios.post('https://snoc-dashboard-api.herokuapp.com/api/v1/auth/login', { email, password })
        
        emailDOM.value = ''
        passwordDOM.value = ''

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        window.location.href = 'index.html'
    } catch (error) {
        let message = 'Something went wrong, Please try again'
        if(error.response){
            message = error.response.data.msg
        }
        passwordAlertDOM.classList.remove('d-none')
        passwordAlertDOM.textContent = message

        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }
})

const checkToken = () => {  
    const token = localStorage.getItem('token')
    if (token) {
        window.location.href = 'index.html'
    }
  }
checkToken()