/**
 * KALKULATOR LEGACY PRO VVIP - MULTI-TERM EDITION
 * Support Masa Bayar: 5, 10, 15 Tahun
 */

const dbMike = {
    pria: {
        1:  [878000, 1865000, 3290000],
        5:  [1066000, 2265000, 4000000],
        7:  [1104000, 2350000, 4140000],
        10: [1164000, 2475000, 4370000],
        15: [1436000, 3050000, 5380000],
        20: [1706000, 3625000, 6400000],
        25: [2034000, 4325000, 7620000],
        30: [2436000, 5180000, 9140000],
        35: [3124000, 6635000, 11700000],
        40: [4160000, 8840000, 15600000],
        42: [4900000, 10410000, 18370000]
    },
    wanita: {
        1:  [762000, 1610000, 2850000],
        5:  [910000, 1925000, 3400000],
        7:  [948000, 2010000, 3540000],
        10: [1000000, 2125000, 3750000],
        15: [1206000, 2565000, 4520000],
        20: [1448000, 3075000, 5430000],
        25: [1712000, 3635000, 6420000],
        30: [1904000, 4045000, 7140000],
        35: [2440000, 5185000, 9150000],
        40: [3358000, 7135000, 12590000],
        42: [3966000, 8425000, 14870000]
    }
};

// Allianz Term Multiplier (Rasio Masa Bayar)
const termMultiplier = {
    "5": 1.82,  // Bayar 5 tahun lebih mahal per tahunnya
    "10": 1.00, // Benchmark data Mike
    "15": 0.74  // Bayar 15 tahun lebih murah per tahunnya
};

function cleanNum(str) { return Number(str.replace(/\./g, "")); }

function getBaseRate(gen, age, upTarget) {
    const table = dbMike[gen];
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
        if (upTarget <= 1000000000) return p500 + (upTarget - 500000000) * (p1M - p500) / 500000000;
        return (upTarget / 1000000000) * p1M;
    };

    const rLow = calcUP(lowAge);
    const rHigh = calcUP(highAge);

    if (lowAge === highAge) return rLow;
    // Exponential Interpolation untuk umur ganjil
    const t = (age - lowAge) / (highAge - lowAge);
    return rLow * Math.pow(rHigh / rLow, t);
}

document.getElementById("hitungBtn").addEventListener("click", function() {
    const age = parseInt(document.getElementById("umur").value);
    const upVal = cleanNum(document.getElementById("up").value);
    const gen = document.getElementById("gender").value;
    const term = document.getElementById("paymentTerm").value;
    const freq = document.getElementById("paymentFreq").value;

    if (!upVal || isNaN(age)) {
        alert("Woy! Isi Usia dan UP-nya dulu!");
        return;
    }

    // 1. Dapatkan premi dasar (Benchmark 10 Tahun)
    let baseAnnual = getBaseRate(gen, age, upVal);

    // 2. Sesuaikan dengan Masa Bayar (5, 10, 15)
    let finalAnnual = baseAnnual * termMultiplier[term];

    // 3. Konversi Frekuensi (Bulanan Allianz = x 0.088)
    let finalResult = (freq === "12") ? (finalAnnual * 0.088) : finalAnnual;

    // Output UI
    const formatted = "Rp " + Math.round(finalResult).toLocaleString('id-ID');
    document.getElementById("hasilDisplay").style.display = "block";
    document.getElementById("finalPremi").innerText = formatted + (freq === "12" ? " / Bln" : " / Thn");
    
    document.getElementById("rincianBawah").innerHTML = `
        <div style="background:rgba(56, 189, 248, 0.05); padding:15px; border-radius:12px; border:1px solid #334155;">
            <p style="color:#38bdf8; margin:0; font-weight:bold;">ESTIMASI MANFAAT CAIR:</p>
            <h3 style="color:#facc15; margin:10px 0;">Rp ${(upVal*1.5).toLocaleString('id-ID')}</h3>
            <p style="font-size:0.8rem; margin:0;">Masa Bayar: ${term} Tahun | Masa Proteksi: s/d Usia 100</p>
        </div>
    `;

    // Modal Popup
    document.getElementById("modalPremi").innerText = formatted;
    document.getElementById("modalBenefit").innerHTML = `
        <ul style="text-align:left; font-size: 0.9rem;">
            <li>UP Warisan Dasar: Rp ${upVal.toLocaleString('id-ID')}</li>
            <li>Booster Warisan 50%: Rp ${(upVal*0.5).toLocaleString('id-ID')}</li>
            <li><b>Total Santunan: Rp ${(upVal*1.5).toLocaleString('id-ID')}</b></li>
            <li>Masa Bayar: ${term} Tahun</li>
        </ul>
    `;
    document.getElementById("hasilModal").style.display = "flex";
});

// Re-using other functions from previous version
function formatRibuan(obj) {
    let val = obj.value.replace(/\D/g, "");
    obj.value = val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function hitungUP_VVIP() {
    const inc = cleanNum(document.getElementById('income').value) || 0;
    const yr = Number(document.getElementById('yearProteksi').value);
    const upIdeal = inc * 12 * yr;
    document.getElementById('up').value = upIdeal.toLocaleString('id-ID');
}

function tutupModal() {
    document.getElementById("hasilModal").style.display = "none";
}
