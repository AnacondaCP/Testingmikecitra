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

function cleanNum(str) { return str ? str.toString().replace(/\D/g, "") : ""; }

function formatRibuan(obj) {
    let val = obj.value.replace(/\D/g, "");
    if (val !== "") obj.value = Number(val).toLocaleString('id-ID');
}

document.getElementById("hitungBtn").addEventListener("click", function() {
    const db = JSON.parse(localStorage.getItem("globalDB") || "{}");
    const product = document.getElementById("productType").value;
    const gender = document.getElementById("gender").value;
    const age = document.getElementById("umur").value;
    const upTarget = cleanNum(document.getElementById("upTarget").value);
    const tenor = document.getElementById("paymentTerm").value;
    const freq = document.getElementById("paymentFreq").value;

    if (!db[product]) return alert("Pilih Produk atau Upload Excel di Dashboard dulu!");

    const key = `${gender}_${age}_${upTarget}_${tenor}`;
    const premiTahunan = db[product][key];

    if (premiTahunan) {
        const final = (freq === "12") ? Math.round(premiTahunan * 0.088) : premiTahunan;
        document.getElementById("hasilDisplay").style.display = "block";
        document.getElementById("finalPremi").innerText = "Rp " + final.toLocaleString('id-ID') + (freq === "12" ? " / Bln" : " / Thn");
        
        document.getElementById("rincianBawah").innerHTML = `
            <div style="background:rgba(56, 189, 248, 0.1); padding:15px; border-radius:12px; border:1px solid #38bdf8;">
                <p>Produk: ${product} | Usia: ${age}</p>
                <p>UP Santunan: Rp ${Number(upTarget).toLocaleString('id-ID')}</p>
                <p>Masa Setor: ${tenor} Tahun</p>
            </div>
        `;
    } else {
        alert("❌ DATA GAK ADA!\nCek apakah kombinasi Usia, UP, dan Masa Setor ada di Excel.");
    }
});
