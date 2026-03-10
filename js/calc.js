// Load Dropdown Produk
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

function cleanNum(str) { return str ? str.toString().replace(/\./g, "") : ""; }

function formatRibuan(obj) {
    let val = obj.value.replace(/\D/g, "");
    if (val !== "") obj.value = Number(val).toLocaleString('id-ID');
}

function hitungUP_VVIP() {
    const income = Number(cleanNum(document.getElementById("income").value));
    const mult = Number(document.getElementById("yearProteksi").value);
    if (income > 0) {
        document.getElementById("upTarget").value = (income * 12 * mult).toLocaleString('id-ID');
    }
}

document.getElementById("hitungBtn").addEventListener("click", function() {
    const db = JSON.parse(localStorage.getItem("globalDB") || "{}");
    const product = document.getElementById("productType").value;
    const gender = document.getElementById("gender").value;
    const age = document.getElementById("umur").value;
    const upRaw = cleanNum(document.getElementById("upTarget").value);
    const term = document.getElementById("paymentTerm").value;
    const freq = document.getElementById("paymentFreq").value;

    if (!db[product]) return alert("Pilih Produk atau Upload Excel dulu!");

    // Cek Variasi Angka (1.000.000.000 vs 1000 vs 1)
    const variations = [upRaw, (Number(upRaw)/1000).toString(), (Number(upRaw)/1000000).toString()];
    let premiTahunan = null;

    for (let v of variations) {
        let key = `${gender}_${age}_${v}_${term}`;
        if (db[product][key]) {
            premiTahunan = db[product][key];
            break;
        }
    }

    if (premiTahunan) {
        const final = (freq === "12") ? Math.round(premiTahunan * 0.088) : premiTahunan;
        document.getElementById("hasilDisplay").style.display = "block";
        document.getElementById("finalPremi").innerText = "Rp " + final.toLocaleString('id-ID') + (freq === "12" ? " / Bln" : " / Thn");
        
        document.getElementById("rincianBawah").innerHTML = `
            <div style="background:rgba(56, 189, 248, 0.1); padding:15px; border-radius:12px; border:1px solid #38bdf8;">
                <p style="color:#38bdf8; font-weight:bold; margin:0;">MANFAAT SANTUNAN:</p>
                <h3 style="color:#facc15; margin:5px 0;">Rp ${(Number(upRaw)*1.5).toLocaleString('id-ID')}</h3>
                <p style="font-size:0.8rem; margin:0; color:#94a3b8;">(Termasuk Booster 50%) | Masa Bayar: ${term} Thn</p>
            </div>
        `;
    } else {
        alert("Data tidak ditemukan! Pastikan Usia " + age + " dan UP Rp " + Number(upRaw).toLocaleString('id-ID') + " ada di Excel.");
    }
});
