function baca(){

window.open(
"https://wa.me/6281386590899?text=Saya melihat study case di website MikeCitra.ins dan ingin konsultasi",
"_blank"
);

}

// LIVE leaderboard simulation example

let leaderboard = document.getElementById("leaderboard");

let data = [

"Usia 25 - Premi Rp 450rb",

"Usia 32 - Premi Rp 780rb",

"Usia 28 - Premi Rp 520rb"

];

leaderboard.innerHTML = data.join("<br>");