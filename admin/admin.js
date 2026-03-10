// --- LOGIKA PEMBACA EXCEL (FIXED FOR EXACT MATCH) ---
function prosesExcel() {
    const fileInput = document.getElementById('excelFile');
    const status = document.getElementById('statusUpload');
    if (!fileInput.files[0]) return alert("Pilih file excel dulu!");

    status.innerHTML = "⏳ Menyingkronkan Data Database Mike...";
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

                // Baris 3 biasanya Header Santunan (200 Juta, 500 Juta, 1 Miliar)
                const rowSantunan = rows[2]; 
                // Baris 5 biasanya Header Masa Setor (5, 10, 15 Tahun)
                const rowTenor = rows[4];
                // Baris 4 biasanya Header Gender (Pria/Wanita)
                const rowGender = rows[3];

                for (let i = 5; i < rows.length; i++) {
                    const row = rows[i];
                    const usia = row[1]; // Kolom B
                    if (usia === undefined || usia === null) continue;

                    row.forEach((cellValue, colIndex) => {
                        if (colIndex < 2 || !cellValue) return;

                        // Cari info header ke belakang (merged cell fix)
                        let santunanRaw = findValidBack(rowSantunan, colIndex);
                        let tenorRaw = findValidBack(rowTenor, colIndex);
                        let genderRaw = rowGender[colIndex]; // Biasanya tiap kolom ada label pria/wanita

                        if (santunanRaw && tenorRaw && genderRaw) {
                            // Bersihin angka (Contoh: "SANTUNAN 200 JUTA" jadi "200000000")
                            const up = santunanRaw.toString().replace(/[^0-9]/g, '');
                            const tenor = tenorRaw.toString().replace(/[^0-9]/g, '');
                            const gender = genderRaw.toLowerCase().includes("pria") ? "pria" : "wanita";
                            
                            // KUNCI MATI: pria_30_200000000_10
                            const key = `${gender}_${usia}_${up}_${tenor}`;
                            globalDB[sheetName][key] = cellValue;
                        }
                    });
                }
            });

            localStorage.setItem("globalDB", JSON.stringify(globalDB));
            status.innerHTML = `<span style="color:#10b981">✅ DATABASE SYNCED! Angka saklek dari Excel masuk.</span>`;
        } catch (err) {
            console.error(err);
            status.innerHTML = "❌ Gagal baca Excel. Pastikan format kolom sesuai.";
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

function findValidBack(arr, index) {
    for (let i = index; i >= 0; i--) {
        if (arr[i] && arr[i].toString().trim() !== "") return arr[i];
    }
    return null;
}
