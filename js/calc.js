document.getElementById("hitungBtn").addEventListener("click", function() {
    const db = JSON.parse(localStorage.getItem("globalDB") || "{}");
    const product = document.getElementById("productType").value;
    const gender = document.getElementById("gender").value;
    const age = document.getElementById("umur").value;
    const tenor = document.getElementById("paymentTerm").value;
    const freq = document.getElementById("paymentFreq").value;
    
    // Ambil angka mentah dari input UP (Contoh: 200.000.000 -> 200000000)
    const upRaw = document.getElementById("upTarget").value.replace(/\D/g, "");

    if (!db[product]) return alert("Data produk belum diupload!");

    // CARI DATA SAKLEK DI DATABASE
    const key = `${gender}_${age}_${upRaw}_${tenor}`;
    const premiTahunan = db[product][key];

    if (premiTahunan) {
        // Hitung bulanan (Hanya ini satu-satunya rumus: Premi Tahun x 0.088)
        const final = (freq === "12") ? Math.round(premiTahunan * 0.088) : premiTahunan;
        
        document.getElementById("hasilDisplay").style.display = "block";
        document.getElementById("finalPremi").innerText = "Rp " + final.toLocaleString('id-ID') + (freq === "12" ? " / Bln" : " / Thn");
        
        document.getElementById("rincianBawah").innerHTML = `
            <div style="background:rgba(56, 189, 248, 0.1); padding:15px; border-radius:12px; border:1px solid #38bdf8;">
                <p style="color:#38bdf8; font-weight:bold;">RINCIAN DATA ASLI:</p>
                <p>Produk: ${product}</p>
                <p>UP Santunan: Rp ${Number(upRaw).toLocaleString('id-ID')}</p>
                <p>Masa Setor: ${tenor} Tahun</p>
                <p>Premi Dasar (Tahun): Rp ${premiTahunan.toLocaleString('id-ID')}</p>
            </div>
        `;
    } else {
        alert("❌ Data TIDAK DITEMUKAN! Pastikan Santunan (UP), Usia, dan Masa Setor sesuai dengan tabel Excel yang diupload.");
    }
});
