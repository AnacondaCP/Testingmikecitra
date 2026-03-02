// DATABASE DASAR (Rate per 1 Juta UP untuk Usia 30)
const baseData = {
    pria: { 5: 14920, 10: 9140, 15: 8090 },
    wanita: { 5: 12270, 10: 7140, 15: 6110 }
};

function formatRibuan(obj) {
    let val = obj.value.replace(/\D/g, "");
    obj.value = val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function cleanNum(str) { return Number(str.replace(/\./g, "")); }
function formatRp(num) { return "Rp " + Math.round(num).toLocaleString('id-ID'); }

function hitungUP_VVIP() {
    const inc = cleanNum(document.getElementById('income').value) || 0;
    const yr = Number(document.getElementById('yearProteksi').value);
    document.getElementById('up').value = (inc * 12 * yr).toLocaleString('id-ID').replace(/,/g, ".");
}

document.getElementById("hitungBtn").addEventListener("click", function() {
    const age = Number(document.getElementById("umur").value);
    const upVal = cleanNum(document.getElementById("up").value);
    const gen = document.getElementById("gender").value;
    const term = document.getElementById("paymentTerm").value;
    const freq = Number(document.getElementById("paymentFreq").value);

    if (!upVal || !age) { alert("Masukkan Usia dan UP dulu!"); return; }

    // --- LOGIC UMUR BEBAS (EXPONENTIAL GROWTH) ---
    // Allianz premi naik sekitar 4-6% per tahun usia.
    let baseRate = baseData[gen][term];
    let ageDiff = age - 30;
    let ageFactor = Math.pow(1.052, ageDiff); // Kenaikan rata-rata 5.2% per tahun
    
    // --- LOGIC UP KERITING (LOADING FACTOR) ---
    let adjust = 1.0;
    if (upVal <= 200000000) adjust = 1.34;
    else if (upVal <= 500000000) adjust = 1.14;
    else if (upVal < 1000000000) {
        let ratio = (upVal - 500000000) / (1000000000 - 500000000);
        adjust = 1.14 - (ratio * 0.14);
    }

    // Kalkulasi Premi Dasar
    let annualBasic = (upVal / 1000000) * baseRate * ageFactor * adjust;

    // Tambahan Rider CI (Penyakit Kritis) & Waiver - Estimasi Akurat 74%
    let totalAnnual = annualBasic * 1.745;

    // Faktor Bulanan Allianz (0.088)
    let premiFinal = (freq === 12) ? (totalAnnual * 0.088) : totalAnnual;

    // Tampilkan Hasil UI
    const hasilDiv = document.getElementById("hasil");
    hasilDiv.style.opacity = 1;
    hasilDiv.innerHTML = `${formatRp(premiFinal)} / ${freq == 12 ? 'Bulan' : 'Tahun'}`;

    const benefitDiv = document.getElementById("benefit");
    benefitDiv.style.opacity = 1;
    benefitDiv.innerHTML = `
        <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; margin-top:15px; border-left: 4px solid #facc15;">
            <p style="color:#38bdf8; font-weight:bold; margin-bottom:5px;">Rincian Manfaat Mike:</p>
            • UP Warisan Dasar: ${formatRp(upVal)}<br>
            • Bonus Booster (50%): ${formatRp(upVal * 0.5)}<br>
            <strong style="color:#facc15;">🔥 TOTAL DITERIMA: ${formatRp(upVal * 1.5)}</strong>
        </div>`;

    // Modal Popup
    document.getElementById("modalPremi").innerText = `${formatRp(premiFinal)} / periode`;
    document.getElementById("modalBenefit").innerHTML = `
        <p>✅ <strong>Santunan Jiwa:</strong> ${formatRp(upVal * 1.5)}</p>
        <p>✅ <strong>Proteksi:</strong> s/d Usia 100 Tahun</p>
        <p>✅ <strong>Status:</strong> Generate Accurately</p>
    `;
    document.getElementById("hasilModal").style.display = "flex";
});

function tutupModal() { document.getElementById("hasilModal").style.display = "none"; }