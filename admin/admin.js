function login(){

let user=document.getElementById("username").value
let pass=document.getElementById("password").value

if(user==="admin" && pass==="admin123"){
window.location="dashboard.html"
}

else{
alert("Login gagal")
}

}