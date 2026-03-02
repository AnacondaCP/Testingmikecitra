// Premium Animation Engine

const observer = new IntersectionObserver((entries) => {

entries.forEach(entry => {

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

},{
threshold:0.15
});

// semua element animasi
document.querySelectorAll(
'.fade-up, .fade-down, .fade-left, .fade-right, .zoom-in'
).forEach(el => observer.observe(el));


// smooth hover glow
document.querySelectorAll(".card, button").forEach(el=>{

el.addEventListener("mouseenter",()=>{
el.style.transform="translateY(-6px)";
});

el.addEventListener("mouseleave",()=>{
el.style.transform="translateY(0)";
});

// smooth parallax glow

window.addEventListener("mousemove",(e)=>{

let x = e.clientX / window.innerWidth;

let y = e.clientY / window.innerHeight;

document.body.style.backgroundPosition =
`${x*50}% ${y*50}%`;

});
});