class Auth {
    constructor(){
        const token = localStorage.getItem("token");
        this.validateToken(token);
    }

    validateToken(token){
        if(!token){
            this.logOut()
        }else{
            document.querySelector("body").style.display = "block"
        }
    }

    logOut(){
        localStorage.removeItem("token")
        window.location.replace("login.html")
    }
}