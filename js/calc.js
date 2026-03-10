// 1. Ambil database dari LocalStorage
const db = JSON.parse(localStorage.getItem("globalDB") || "{}");

// 2. Load Dropdown Produk Otomatis
window.addEventListener('DOMContentLoaded', () => {
    const productSelect = document.getElementById("productType");
    if (productSelect && Object.keys(db).length > 0) {
        productSelect.innerHTML = ""; 
        Object.keys(db).forEach(prodName => {
            let opt = document.createElement("option");
            opt.value = prodName;
            opt.innerText = prodName;
            productSelect.appendChild(opt);
        });
    }
});

// Fungsi hapus titik agar angka bisa dihitung
function cleanNum(str) { 
    if (!str) return 0;
    return str.toString().replace(/\./g, ""); 
}

// Fungsi tambah titik buat tampilan (Ribuan)
function formatRibuan(obj) {
    let val = obj.value.replace(/\D/g, "");
    if (val !== "") {
        obj.value = Number(val).toLocaleString('id-ID');
    }
}

// Fungsi Gaji Ideal -> Ngisi UP Otomatis
function hitungUP_VVIP() {
    const income = Number(cleanNum(document.getElementById("income").value));
    const multiplier = Number(document.getElementById("yearProteksi").value);
    const upInput = document.getElementById("up");

    if (income > 0) {
        const saranUP = income * 12 * multiplier;
        upInput.value = saranUP.toLocaleString('id-ID'); 
    }
}

// 3. LOGIKA TOMBOL HITUNG
document.getElementById("hitungBtn").addEventListener("click", function() {
    const selectedProd = document.getElementById("productType").value;
    const gender = document.getElementById("gender").value;
    const age = document.getElementById("umur").value; // Sesuai ID di HTML
    const upRaw = document.getElementById("up").value; // Ambil nilai yang ada titiknya
    const upClean = cleanNum(upRaw); // Hapus titik: "1.000.000" -> "1000000"
    const term = document.getElementById("paymentTerm").value;
    const freq = document.getElementById("paymentFreq").value;

    if (!selectedProd || !db[selectedProd]) {
        return alert("Pilih produk dulu! Pastikan sudah upload Excel di Admin.");
    }

    // Key pencarian (TANPA TITIK di UP)
    const key = `${gender}_${age}_${upClean}_${term}`;
    const premiTahunan = db[selectedProd][key];

    if (premiTahunan) {
        // Hitung Bulanan (Faktor 0.088)
        const hasil = (freq === "12") ? Math.round(premiTahunan * 0.088) : premiTahunan;
        
        // Tampilkan
        document.getElementById("hasilDisplay").style.display = "block";
        const formatted = "Rp " + hasil.toLocaleString('id-ID');
        document.getElementById("finalPremi").innerText = formatted + (freq === "12" ? " / Bln" : " / Thn");
        
        document.getElementById("rincianBawah").innerHTML = `
            <div style="background:rgba(56,189,248,0.1); padding:15px; border-radius:12px; border:1px solid #38bdf8;">
                <p style="color:#38bdf8; font-weight:bold; margin:0;">TOTAL MANFAAT (UP + BOOSTER):</p>
                <h2 style="color:#facc15; margin:10px 0;">Rp ${(upClean * 1.5).toLocaleString('id-ID')}</h2>
                <p style="font-size:0.8rem; margin:0;">Produk: ${selectedProd} | Masa Bayar: ${term} Thn</p>
            </div>
        `;
    } else {
        alert(`Data Gagal Ditarik!\n\nSistem mencari data:\n- Produk: ${selectedProd}\n- Usia: ${age}\n- UP: ${upClean}\n- Tenor: ${term}\n\nPastikan di Excel lo ada angka di baris/kolom tersebut!`);
    }
});
