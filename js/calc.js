// OTO-LOAD PRODUK DARI STORAGE
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
    
    // Ambil nilai UP dari input (Misal: 200.000.000 -> 200000000)
    let upInput = document.getElementById("upTarget").value.replace(/\D/g, "");

    if (!db[product]) return alert("Data produk kosong! Upload Excel dulu di Dashboard.");

    // CARI DATA SAKLEK SESUAI KEY EXCEL
    const key = `${gender}_${age}_${upInput}_${tenor}`;
    const premiTahunan = db[product][key];

    if (premiTahunan) {
        // Premi Bulanan = Premi Tahunan * 0.088
        const finalPremi = (freq === "12") ? Math.round(premiTahunan * 0.088) : premiTahunan;
        
        document.getElementById("hasilDisplay").style.display = "block";
        document.getElementById("finalPremi").innerText = "Rp " + finalPremi.toLocaleString('id-ID') + (freq === "12" ? " / Bln" : " / Thn");
        
        document.getElementById("rincianBawah").innerHTML = `
            <div style="background:rgba(56, 189, 248, 0.1); padding:15px; border-radius:12px; border:1px solid #38bdf8; margin-top:15px;">
                <p><b>RINCIAN DATA XLS:</b></p>
                <p>UP Santunan: Rp ${Number(upInput).toLocaleString('id-ID')}</p>
                <p>Masa Setor: ${tenor} Tahun</p>
                <p>Premi Dasar (Thn): Rp ${premiTahunan.toLocaleString('id-ID')}</p>
            </div>
        `;
    } else {
        alert("❌ DATA TIDAK ADA!\nCek: Usia " + age + " & UP " + Number(upInput).toLocaleString('id-ID') + " ada gak di Excel?");
    }
});
