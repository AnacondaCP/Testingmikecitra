const ADMIN = {
    username: "admin",
    password: "mike123"
}

const OWNER = {
    username: "owner",
    password: "owner123"
}

function login(){

    const user = document.getElementById("username").value
    const pass = document.getElementById("password").value

    if(user === ADMIN.username && pass === ADMIN.password){

        localStorage.setItem("role","admin")
        window.location.href = "dashboard.html"

    }

    else if(user === OWNER.username && pass === OWNER.password){

        localStorage.setItem("role","owner")
        window.location.href = "dashboard.html"

    }
    function logout(){

localStorage.removeItem("role")
window.location.href = "login.html"

}


function showPage(id){

document.querySelectorAll(".page").forEach(p=>{
p.style.display="none"
})

document.getElementById(id).style.display="block"

}


// cek login role
window.onload = function(){

const role = localStorage.getItem("role")

if(!role){
window.location.href = "login.html"
}

// owner only menu
if(role !== "owner"){
document.getElementById("ownerMenu").style.display = "none"
}

// show first page
showPage("home")

}

    else{

        alert("Login gagal")

    }

}