function prosesExcel() {
    const fileInput = document.getElementById('excelFile');
    const status = document.getElementById('statusUpload');
    if (!fileInput.files[0]) return alert("Pilih file excel dulu!");

    status.innerHTML = "⏳ Lagi nyedot data... Sabar Cu.";
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            let globalDB = {}; 

            workbook.SheetNames.forEach(sheetName => {
                const sheet = workbook.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                globalDB[sheetName] = {};

                // Koordinat Header sesuai File Lu (Row 3, 4, 5)
                const rowUP = rows[2];      // Baris 3
                const rowGender = rows[3];  // Baris 4
                const rowTenor = rows[4];   // Baris 5

                // Data Usia mulai dari baris ke-6 (Index 5)
                for (let i = 5; i < rows.length; i++) {
                    const row = rows[i];
                    const usia = row[1]; // Kolom B (Index 1) adalah USIA
                    
                    if (usia === undefined || usia === "") continue;

                    // Loop mulai dari kolom C (Index 2) sampe ujung kanan
                    for (let col = 2; col < row.length; col++) {
                        let premi = row[col];
                        if (!premi || isNaN(premi)) continue;

                        // Ambil info header pake logika "Cari ke Kiri" (Merged Cell Fix)
                        let up = findHeader(rowUP, col).toString().replace(/\D/g, '');
                        let tenor = findHeader(rowTenor, col).toString().replace(/\D/g, '');
                        let genderRaw = rowGender[col] ? rowGender[col].toString().toLowerCase() : "";
                        let gender = genderRaw.includes("pria") ? "pria" : "wanita";

                        // Simpan ke Database
                        const key = `${gender}_${usia}_${up}_${tenor}`;
                        globalDB[sheetName][key] = Number(premi);
                    }
                }
            });

            localStorage.setItem("globalDB", JSON.stringify(globalDB));
            status.innerHTML = `<span style="color:#10b981">✅ DATA SAKLEK MASUK SEMUA (UMUR 0 - AKHIR)!</span>`;
            alert("Database Excel Berhasil Disinkronkan!");
        } catch (err) {
            console.error(err);
            status.innerHTML = "❌ Gagal! Pastiin file Excelnya bener.";
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

// Fungsi buat nyari judul kolom yang digabung (Merged)
function findHeader(arr, idx) {
    for (let i = idx; i >= 0; i--) {
        if (arr[i] && arr[i].toString().trim() !== "") return arr[i];
    }
    return "";
}
