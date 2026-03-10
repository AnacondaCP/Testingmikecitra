// --- ADMIN LOGIC ---
const USERS = {
    admin: { pass: "mike123", role: "admin" },
    owner: { pass: "owner123", role: "owner" }
};

function login() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    if (USERS[user] && USERS[user].pass === pass) {
        localStorage.setItem("role", USERS[user].role);
        window.location.href = "dashboard.html";
    } else { alert("Salah Cu!"); }
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    document.getElementById(id).style.display = "block";
}

// --- SMART EXCEL PARSER (Sesuai File Allianz Lu) ---
function prosesExcel() {
    const fileInput = document.getElementById('excelFile');
    const status = document.getElementById('statusUpload');
    if (!fileInput.files[0]) return alert("Pilih file excel dulu!");

    status.innerHTML = "⏳ Lagi diperes datanya... Sabar.";
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

                // Koordinat baris sesuai file LEGACY PRO lu
                const rowUP = rows[2];      // Baris 3: Santunan
                const rowGender = rows[3];  // Baris 4: Gender
                const rowTenor = rows[4];   // Baris 5: Masa Setor

                // Mulai baca data usia dari baris ke-6 (Index 5)
                for (let i = 5; i < rows.length; i++) {
                    const row = rows[i];
                    const usia = row[1]; // Kolom B (Index 1) adalah Usia
                    if (usia === undefined || usia === "") continue;

                    // Loop tiap kolom premi mulai dari Kolom C (Index 2)
                    for (let col = 2; col < row.length; col++) {
                        let premi = row[col];
                        if (!premi || isNaN(premi)) continue;

                        // Ambil info header dengan teknik findBack (buat merged cells)
                        let upRaw = findValidBack(rowUP, col);
                        let tenorRaw = findValidBack(rowTenor, col);
                        let genderRaw = rowGender[col] ? rowGender[col].toString().toLowerCase() : "";

                        if (upRaw && tenorRaw && genderRaw) {
                            const up = upRaw.toString().replace(/\D/g, '');
                            const tenor = tenorRaw.toString().replace(/\D/g, '');
                            const gender = genderRaw.includes("pria") ? "pria" : "wanita";
                            
                            // Key: pria_30_200000000_10
                            const key = `${gender}_${usia}_${up}_${tenor}`;
                            globalDB[sheetName][key] = Number(premi);
                        }
                    }
                }
            });

            localStorage.setItem("globalDB", JSON.stringify(globalDB));
            status.innerHTML = `<span style="color:#10b981">✅ BERHASIL! Data Umur 0-70 Masuk Semua!</span>`;
            alert("Database Excel Berhasil Disinkronkan!");
        } catch (err) {
            console.error(err);
            status.innerHTML = "❌ Gagal baca Excel! Cek format barisnya.";
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
