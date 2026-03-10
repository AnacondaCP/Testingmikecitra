// 1. Load Dropdown Produk Otomatis saat halaman dibuka
window.addEventListener('DOMContentLoaded', () => {
    const db = JSON.parse(localStorage.getItem("globalDB") || "{}");
    const productSelect = document.getElementById("productType");
    
    if (productSelect) {
        if (Object.keys(db).length > 0) {
            productSelect.innerHTML = ""; 
            Object.keys(db).forEach(prodName => {
                let opt = document.createElement("option");
                opt.value = prodName;
                opt.innerText = prodName;
                productSelect.appendChild(opt);
            });
        } else {
            productSelect.innerHTML = "<option value=''>Upload Data di Admin Dulu</option>";
        }
    }
});

// Fungsi pembersih angka (hapus titik agar bisa dihitung)
function cleanNum(str) { 
    if (!str) return 0;
    return Number(str.toString().replace(/\./g, "")); 
}

// Fungsi Format Ribuan (Tambah Titik saat ngetik)
function formatRibuan(obj) {
    let val = obj.value.replace(/\D/g, "");
    if (val !== "") {
        obj.value = Number(val).toLocaleString('id-ID');
    }
}

// FUNGSI INCOME REPLACEMENT (Hitung UP dari Gaji)
function hitungUP_VVIP() {
    const income = cleanNum(document.getElementById("income").value);
    const multiplier = Number(document.getElementById("yearProteksi").value);
    const upInput = document.getElementById("up");

    if (income > 0) {
        const saranUP = income * 12 * multiplier;
        upInput.value = saranUP.toLocaleString('id-ID'); // Isi otomatis kolom UP Dasar
    }
}

// PROSES HITUNG PREMI
document.getElementById("hitungBtn").addEventListener("click", function() {
    const db = JSON.parse(localStorage.getItem("globalDB") || "{}");
    
    // Ambil Input (Gue samain ID-nya dengan HTML lo)
    const selectedProd = document.getElementById("productType").value;
    const gender = document.getElementById("gender").value;
    const age = document.getElementById("umur").value; // ID di HTML lo adalah 'umur'
    const upTarget = cleanNum(document.getElementById("up").value); // ID di HTML lo adalah 'up'
    const term = document.getElementById("paymentTerm").value;
    const freq = document.getElementById("paymentFreq").value;

    if (!selectedProd || !db[selectedProd]) {
        return alert("Pilih produk dulu! (Pastikan sudah upload Excel di Admin)");
    }

    if (!age || !upTarget) {
        return alert("Isi Usia dan UP Dasar dulu!");
    }

    // Cari di database: pria_30_1000000000_10
    const key = `${gender}_${age}_${upTarget}_${term}`;
    const premiTahunan = db[selectedProd][key];

    if (premiTahunan) {
        // Hitung Bulanan (0.088) atau Tahunan (tetap)
        const finalResult = (freq === "12") ? Math.round(premiTahunan * 0.088) : premiTahunan;
        
        // Tampilkan Hasil
        document.getElementById("hasilDisplay").style.display = "block";
        const formatted = "Rp " + finalResult.toLocaleString('id-ID');
        document.getElementById("finalPremi").innerText = formatted + (freq === "12" ? " / Bln" : " / Thn");
        
        // Rincian Manfaat
        document.getElementById("rincianBawah").innerHTML = `
            <div style="background:rgba(56, 189, 248, 0.1); padding:15px; border-radius:12px; border:1px solid #38bdf8; margin-top:15px;">
                <p style="color:#38bdf8; margin:0; font-weight:bold;">ESTIMASI TOTAL MANFAAT:</p>
                <h3 style="color:#facc15; margin:10px 0;">Rp ${(upTarget * 1.5).toLocaleString('id-ID')}</h3>
                <p style="font-size:0.8rem; color:#cbd5e1; margin:0;">(UP Dasar + Booster 50%)<br>Masa Bayar: ${term} Tahun</p>
            </div>
        `;
        
        // Modal (Opsional kalau mau muncul)
        if(document.getElementById("modalPremi")) {
            document.getElementById("modalPremi").innerText = formatted;
            document.getElementById("hasilModal").style.display = "flex";
        }
    } else {
        alert(`Data tidak ditemukan untuk:\n- Usia: ${age}\n- UP: Rp ${upTarget.toLocaleString('id-ID')}\n- Tenor: ${term} thn\n\nPastikan data ini ada di file Excel yang Anda upload.`);
    }
});
