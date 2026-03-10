// 1. Ambil Data
const db = JSON.parse(localStorage.getItem("globalDB") || "{}");

// 2. Load Dropdown Produk
window.addEventListener('DOMContentLoaded', () => {
    const productSelect = document.getElementById("productType");
    if (productSelect && Object.keys(db).length > 0) {
        productSelect.innerHTML = "";
        Object.keys(db).forEach(prod => {
            let opt = document.createElement("option");
            opt.value = prod;
            opt.innerText = prod;
            productSelect.appendChild(opt);
        });
    }
});

// Helper: Format Titik Ribuan
function formatRibuan(obj) {
    let val = obj.value.replace(/\D/g, "");
    if (val !== "") obj.value = Number(val).toLocaleString('id-ID');
}

// Helper: Bersihkan Titik
function cleanNum(str) {
    return str ? str.toString().replace(/\./g, "") : "";
}

// Gaji ke UP Otomatis
function hitungUP_VVIP() {
    const income = Number(cleanNum(document.getElementById("income").value));
    const mult = Number(document.getElementById("yearProteksi").value);
    if (income > 0) {
        const saran = income * 12 * mult;
        document.getElementById("upTarget").value = saran.toLocaleString('id-ID');
    }
}

// 3. FUNGSI HITUNG UTAMA
document.getElementById("hitungBtn").addEventListener("click", function() {
    const product = document.getElementById("productType").value;
    const gender = document.getElementById("gender").value;
    const age = document.getElementById("umur").value;
    const upRaw = cleanNum(document.getElementById("upTarget").value);
    const term = document.getElementById("paymentTerm").value;
    const freq = document.getElementById("paymentFreq").value;

    if (!db[product]) return alert("Pilih Produk dulu!");
    if (!age || !upRaw) return alert("Isi Usia dan UP!");

    // Normalisasi UP (Cek format 1.000.000.000, 1000, atau 1)
    const variations = [
        upRaw, 
        (Number(upRaw)/1000000).toString(), 
        (Number(upRaw)/1000000000).toString()
    ];

    let premiTahunan = null;
    for (let v of variations) {
        let key = `${gender}_${age}_${v}_${term}`;
        if (db[product][key]) {
            premiTahunan = db[product][key];
            break;
        }
    }

    if (premiTahunan) {
        const hasil = (freq === "12") ? Math.round(premiTahunan * 0.088) : premiTahunan;
        
        document.getElementById("hasilDisplay").style.display = "block";
        document.getElementById("finalPremi").innerText = "Rp " + hasil.toLocaleString('id-ID') + (freq === "12" ? " / Bln" : " / Thn");
        
        document.getElementById("rincianBawah").innerHTML = `
            <div style="background:rgba(56, 189, 248, 0.1); padding:15px; border-radius:12px; border:1px solid #38bdf8; color:white;">
                <p style="color:#38bdf8; font-weight:bold; margin:0;">TOTAL MANFAAT (UP+BOOSTER):</p>
                <h2 style="color:#facc15; margin:10px 0;">Rp ${(Number(upRaw) * 1.5).toLocaleString('id-ID')}</h2>
                <p style="font-size:0.8rem; margin:0;">Masa Bayar: ${term} Tahun</p>
            </div>
        `;
    } else {
        alert("Data tidak ditemukan di Excel untuk Usia " + age + " dan UP tersebut.");
    }
});
