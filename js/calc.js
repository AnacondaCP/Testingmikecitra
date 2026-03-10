document.getElementById("hitungBtn").addEventListener("click", function() {
    const db = JSON.parse(localStorage.getItem("globalDB") || "{}");
    const product = document.getElementById("productType").value;
    const gender = document.getElementById("gender").value;
    const age = document.getElementById("umur").value;
    const upTarget = document.getElementById("upTarget").value.replace(/\D/g, ""); // Pastikan dapet angka murni
    const tenor = document.getElementById("paymentTerm").value;
    const freq = document.getElementById("paymentFreq").value;

    if (!db[product]) return alert("Pilih Produk / Upload Excel di Dashboard dulu!");

    // Key format: pria_30_200000000_10
    const key = `${gender}_${age}_${upTarget}_${tenor}`;
    const premiTahunan = db[product][key];

    if (premiTahunan) {
        // Rumus: Premi Bulanan = (Tahunan * 0.088)
        const hasil = (freq === "12") ? Math.round(premiTahunan * 0.088) : premiTahunan;
        
        document.getElementById("hasilDisplay").style.display = "block";
        document.getElementById("finalPremi").innerText = "Rp " + hasil.toLocaleString('id-ID');
        
        document.getElementById("rincianBawah").innerHTML = `
            <div style="background:rgba(56, 189, 248, 0.1); padding:10px; border-radius:10px; border:1px solid #38bdf8;">
                <p>Data Valid: <b>${product}</b></p>
                <p>Premi Dasar: Rp ${premiTahunan.toLocaleString('id-ID')} / Thn</p>
            </div>
        `;
    } else {
        alert("❌ DATA GAK ADA!\nCek di Excel: Usia " + age + ", UP " + Number(upTarget).toLocaleString('id-ID') + ", Tenor " + tenor + " thn.");
    }
});
