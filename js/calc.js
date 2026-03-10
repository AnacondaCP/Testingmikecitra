// Load Dropdown Produk Otomatis saat halaman dibuka
window.addEventListener('DOMContentLoaded', () => {
    const db = JSON.parse(localStorage.getItem("globalDB") || "{}");
    const productSelect = document.getElementById("productType"); // Pastikan ID ini ada di HTML
    
    if (productSelect && Object.keys(db).length > 0) {
        productSelect.innerHTML = ""; // Bersihkan dummy
        Object.keys(db).forEach(prodName => {
            let opt = document.createElement("option");
            opt.value = prodName;
            opt.innerText = prodName;
            productSelect.appendChild(opt);
        });
    }
});

function cleanNum(str) { return Number(str.replace(/\./g, "")); }

document.getElementById("hitungBtn").addEventListener("click", function() {
    const db = JSON.parse(localStorage.getItem("globalDB") || "{}");
    
    // Ambil Input
    const selectedProd = document.getElementById("productType").value;
    const gender = document.getElementById("gender").value;
    const age = document.getElementById("age").value;
    const upTarget = document.getElementById("upTarget").value.replace(/\D/g, '');
    const term = document.getElementById("paymentTerm").value;
    const freq = document.getElementById("paymentFreq").value;

    if (!db[selectedProd]) return alert("Pilih produk atau upload data dulu di admin!");

    // Cari di database hasil upload
    const key = `${gender}_${age}_${upTarget}_${term}`;
    const premiTahunan = db[selectedProd][key];

    if (premiTahunan) {
        const finalResult = (freq === "12") ? Math.round(premiTahunan * 0.088) : premiTahunan;
        tampilkanHasil(finalResult, selectedProd, upTarget, term, freq);
    } else {
        alert("Data tidak ditemukan! Cek apakah Usia dan UP sudah ada di Excel.");
    }
});

function tampilkanHasil(nominal, namaProd, up, term, freq) {
    const formatted = "Rp " + nominal.toLocaleString('id-ID');
    document.getElementById("hasilDisplay").style.display = "block";
    document.getElementById("finalPremi").innerText = formatted + (freq === "12" ? " / Bln" : " / Thn");
    
    // Update Rincian
    document.getElementById("rincianBawah").innerHTML = `
        <div style="background:rgba(56, 189, 248, 0.05); padding:15px; border-radius:12px; border:1px solid #334155;">
            <p style="color:#38bdf8; margin:0; font-weight:bold;">PRODUK: ${namaProd}</p>
            <h3 style="color:#facc15; margin:10px 0;">Total Manfaat: Rp ${(up * 1.5).toLocaleString('id-ID')}</h3>
            <p style="font-size:0.8rem; margin:0;">Masa Bayar: ${term} Tahun | Premi sudah termasuk Booster 50%</p>
        </div>
    `;
    
    // Tampilkan Modal (Opsional)
    if(document.getElementById("modalPremi")) {
        document.getElementById("modalPremi").innerText = formatted;
        document.getElementById("hasilModal").style.display = "flex";
    }
}
