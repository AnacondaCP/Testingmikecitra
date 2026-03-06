/**
 * KALKULATOR LEGACY PRO VVIP - EXCEL INTEGRATED
 * Otomatis membaca data dari Dashboard Upload
 */

// 1. Ambil data dari LocalStorage (hasil upload Excel)
const dataExcelRaw = localStorage.getItem("dbPremi");
const dbExcel = dataExcelRaw ? JSON.parse(dataExcelRaw) : null;

// Data Backup (Tetap ada buat jaga-jaga kalau excel belum diupload)
const dbBackup = {
    pria: {
        1: [878000, 1865000, 3290000],
        35: [3124000, 6635000, 11700000],
        42: [4900000, 10410000, 18370000]
    },
    wanita: {
        1: [762000, 1610000, 2850000],
        35: [2440000, 5185000, 9150000],
        42: [3966000, 8425000, 14870000]
    }
};

function cleanNum(str) { return Number(str.replace(/\./g, "")); }

// 2. FUNGSI UTAMA: MENCARI PREMI DARI EXCEL
function getPremiFromExcel(gender, age, upTarget, term) {
    if (!dbExcel) return null;

    // Filter baris berdasarkan usia (Kolom 'USIA' di excel lo)
    const barisUsia = dbExcel.find(row => row.__EMPTY_1 == age || row.USIA == age);
    if (!barisUsia) return null;

    /* LOGIKA MAPPING KOLOM EXCEL LO:
       Berdasarkan file yang lo kirim, kolomnya menyamping.
       __EMPTY_2 = Pria 5th (200jt), __EMPTY_3 = Wanita 5th (200jt)
       __EMPTY_5 = Pria 10th (200jt), dst.
    */
    
    let key = "";
    const genKey = gender.toLowerCase();

    // Mapping manual berdasarkan struktur "SANTUNAN 200 JUTA" (Benchmark awal)
    if (term == "5") key = (genKey === "pria") ? "__EMPTY_2" : "__EMPTY_3";
    else if (term == "10") key = (genKey === "pria") ? "__EMPTY_5" : "__EMPTY_6";
    else if (term == "15") key = (genKey === "pria") ? "__EMPTY_8" : "__EMPTY_9";

    let premiDasar = barisUsia[key];

    // Jika user minta UP lebih dari 200jt (misal 1M), kita kali lipat saja secara matematis
    // Karena struktur data 200jt, 500jt, 1M di excel lo linear.
    if (premiDasar) {
        return (upTarget / 200000000) * premiDasar;
    }
    return null;
}

// 3. FUNGSI INTERPOLASI (Jika Excel Kosong)
function getBaseRateBackup(gen, age, upTarget) {
    const table = dbBackup[gen];
    const ages = Object.keys(table).map(Number).sort((a, b) => a - b);
    let lowAge = ages[0], highAge = ages[ages.length - 1];
    for (let a of ages) {
        if (a <= age) lowAge = a;
        if (a >= age) { highAge = a; break; }
    }
    const calcUP = (u) => {
        const [p200, p500, p1M] = table[u];
        if (upTarget <= 200000000) return (upTarget / 200000000) * p200;
        if (upTarget <= 500000000) return p200 + (upTarget - 200000000) * (p500 - p200) / 300000000;
        return (upTarget / 1000000000) * p1M;
    };
    const rLow = calcUP(lowAge), rHigh = calcUP(highAge);
    if (lowAge === highAge) return rLow;
    const t = (age - lowAge) / (highAge - lowAge);
    return rLow * Math.pow(rHigh / rLow, t);
}

// 4. EVENT HITUNG
document.getElementById("hitungBtn").addEventListener("click", function() {
    const age = parseInt(document.getElementById("umur").value);
    const upVal = cleanNum(document.getElementById("up").value);
    const gen = document.getElementById("gender").value;
    const term = document.getElementById("paymentTerm").value;
    const freq = document.getElementById("paymentFreq").value;

    if (!upVal || isNaN(age)) {
        alert("Isi Usia dan UP dulu Bos!");
        return;
    }

    let premiTahunan = 0;

    // Coba ambil dari Excel dulu
    const dariExcel = getPremiFromExcel(gen, age, upVal, term);
    
    if (dariExcel) {
        premiTahunan = dariExcel;
    } else {
        // Kalau gagal/excel belum ada, pake backup + multiplier
        const termMultiplier = { "5": 1.82, "10": 1.0, "15": 0.74 };
        premiTahunan = getBaseRateBackup(gen, age, upVal) * termMultiplier[term];
    }

    // Hitung Frekuensi (Bulanan = x 0.088)
    let finalResult = (freq === "12") ? (premiTahunan * 0.088) : premiTahunan;

    // TAMPILKAN HASIL
    const formatted = "Rp " + Math.round(finalResult).toLocaleString('id-ID');
    document.getElementById("hasilDisplay").style.display = "block";
    document.getElementById("finalPremi").innerText = formatted + (freq === "12" ? " / Bln" : " / Thn");
    
    document.getElementById("rincianBawah").innerHTML = `
        <div style="background:rgba(56, 189, 248, 0.05); padding:15px; border-radius:12px; border:1px solid #334155;">
            <p style="color:#38bdf8; margin:0; font-weight:bold;">ESTIMASI MANFAAT CAIR:</p>
            <h3 style="color:#facc15; margin:10px 0;">Rp ${(upVal*1.5).toLocaleString('id-ID')}</h3>
            <p style="font-size:0.8rem; margin:0;">Masa Bayar: ${term} Tahun | Sumber: ${dariExcel ? 'Database Excel' : 'Sistem Prediksi'}</p>
        </div>
    `;

    // Modal
    document.getElementById("modalPremi").innerText = formatted;
    document.getElementById("hasilModal").style.display = "flex";
});

// Fungsi pembantu
function formatRibuan(obj) {
    let val = obj.value.replace(/\D/g, "");
    obj.value = val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function hitungUP_VVIP() {
    const inc = cleanNum(document.getElementById('income').value) || 0;
    const yr = Number(document.getElementById('yearProteksi').value);
    document.getElementById('up').value = (inc * 12 * yr).toLocaleString('id-ID');
}

function tutupModal() { document.getElementById("hasilModal").style.display = "none"; }
