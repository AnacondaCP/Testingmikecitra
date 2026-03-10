// --- AUTO LOAD PRODUK ---
window.addEventListener('DOMContentLoaded', () => {
    const db = JSON.parse(localStorage.getItem("globalDB") || "{}");
    const productSelect = document.getElementById("productType");
    if (productSelect && Object.keys(db).length > 0) {
        productSelect.innerHTML = "";
        Object.keys(db).forEach(prod => {
            let opt = document.createElement("option");
            opt.value = prod; opt.innerText = prod;
            productSelect.appendChild(opt);
        });
    }
});

document.getElementById("hitungBtn").addEventListener("click", function() {
    const db = JSON.parse(localStorage.getItem("globalDB") || "{}");
    const product = document.getElementById("productType").value;
    const gender = document.getElementById("gender").value;
    const age = document.getElementById("umur").value;
    const tenor = document.getElementById("paymentTerm").value;
    const freq = document.getElementById("paymentFreq").value;
    const upInput = document.getElementById("upTarget").value.replace(/\D/g, "");

    if (!db[product]) return alert("Data produk kosong! Ke Dashboard dulu buat sinkron Excel.");

    // KEY MATCHING SAKLEK SESUAI EXCEL
    const key = `${gender}_${age}_${upInput}_${tenor}`;
    const premiTahunan = db[product][key];

    if (premiTahunan) {
        // Rumus resmi: Premi Bulan = Tahun * 0.088
        const final = (freq === "12") ? Math.round(premiTahunan * 0.088) : premiTahunan;
        
        document.getElementById("hasilDisplay").style.display = "block";
        document.getElementById("finalPremi").innerText = "Rp " + final.toLocaleString('id-ID');
        
        document.getElementById("rincianBawah").innerHTML = `
            <div style="background:rgba(56, 189, 248, 0.1); padding:15px; border-radius:12px; border:1px solid #38bdf8;">
                <p>Produk: <b>${product}</b></p>
                <p>UP: Rp ${Number(upInput).toLocaleString('id-ID')}</p>
                <p>Premi Dasar: Rp ${premiTahunan.toLocaleString('id-ID')} / Tahun</p>
            </div>
        `;
    } else {
        alert("❌ DATA GAK ADA!\nCek lagi input UP lu (200jt/500jt/1M) dan Usia.");
    }
});
