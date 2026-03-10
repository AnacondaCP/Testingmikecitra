// OTO-LOAD PRODUK DARI DATABASE
window.addEventListener('DOMContentLoaded', () => {
    const db = JSON.parse(localStorage.getItem("globalDB") || "{}");
    const select = document.getElementById("productType");
    if (select && Object.keys(db).length > 0) {
        select.innerHTML = '<option value="">-- Pilih Produk --</option>';
        Object.keys(db).forEach(prod => {
            let opt = document.createElement("option");
            opt.value = prod; opt.innerText = prod;
            select.appendChild(opt);
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
    
    // Ambil angka UP dari dropdown/input
    const upTarget = document.getElementById("upTarget").value.replace(/\D/g, "");

    if (!db[product]) return alert("Pilih Produk atau Upload Excel dulu di Dashboard!");

    // Cari key saklek: gender_usia_up_tenor
    const key = `${gender}_${age}_${upTarget}_${tenor}`;
    const premiTahunan = db[product][key];

    if (premiTahunan) {
        // Rumus Bulanan: Tahunan * 0.088
        const final = (freq === "12") ? Math.round(premiTahunan * 0.088) : premiTahunan;
        
        document.getElementById("hasilDisplay").style.display = "block";
        document.getElementById("finalPremi").innerText = "Rp " + final.toLocaleString('id-ID') + (freq === "12" ? " / Bln" : " / Thn");
        
        document.getElementById("rincianBawah").innerHTML = `
            <div style="background:rgba(56, 189, 248, 0.1); padding:15px; border-radius:12px; border:1px solid #38bdf8; margin-top:15px;">
                <p><b>RINCIAN DATA:</b></p>
                <p>UP Santunan: Rp ${Number(upTarget).toLocaleString('id-ID')}</p>
                <p>Masa Setor: ${tenor} Tahun</p>
                <p>Premi Dasar (Thn): Rp ${premiTahunan.toLocaleString('id-ID')}</p>
            </div>
        `;
    } else {
        alert("❌ DATA TIDAK ADA!\nCek apakah kombinasi Usia, UP, dan Masa Setor ada di Excel.");
    }
});
