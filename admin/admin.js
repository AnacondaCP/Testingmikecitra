// --- DATABASE ADMIN LOGIC ---
const USERS = {
    admin: { pass: "mike123", role: "admin" },
    owner: { pass: "owner1233", role: "owner" }
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
    localStorage.removeItem("role");
    window.location.href = "login.html";
}

function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    const target = document.getElementById(id);
    if (target) target.style.display = "block";
}

// --- LOGIKA PENYEDOT EXCEL (SMART MAPPING) ---
function prosesExcel() {
    const fileInput = document.getElementById('excelFile');
    const status = document.getElementById('statusUpload');
    if (!fileInput.files[0]) return alert("Pilih file excel-nya dulu anjing!");

    status.innerHTML = "⏳ Lagi nyalin data... Sabar.";
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

                // Mapping Baris Berdasarkan File Lu
                const rowSantunan = rows[2]; // Index 2 (Baris 3)
                const rowGender = rows[3];    // Index 3 (Baris 4)
                const rowTenor = rows[4];     // Index 4 (Baris 5)

                for (let i = 5; i < rows.length; i++) {
                    const row = rows[i];
                    const usia = row[1]; // Kolom B
                    if (usia === undefined || usia === "") continue;

                    row.forEach((cellValue, colIndex) => {
                        if (colIndex < 2 || !cellValue || isNaN(cellValue)) return;

                        // Ambil info header dengan teknik findValidBack (Cari ke kiri kalo kosong)
                        let upRaw = findValidBack(rowSantunan, colIndex);
                        let genderRaw = rowGender[colIndex];
                        let tenorRaw = findValidBack(rowTenor, colIndex);

                        if (upRaw && genderRaw && tenorRaw) {
                            const up = upRaw.toString().replace(/\D/g, '');
                            const tenor = tenorRaw.toString().replace(/\D/g, '');
                            const gender = genderRaw.toLowerCase().includes("pria") ? "pria" : "wanita";
                            
                            // Key: pria_30_200000000_10
                            const key = `${gender}_${usia}_${up}_${tenor}`;
                            globalDB[sheetName][key] = Number(cellValue);
                        }
                    });
                }
            });

            localStorage.setItem("globalDB", JSON.stringify(globalDB));
            status.innerHTML = `<span style="color:#10b981">✅ BERHASIL! Data Excel Lu Udah Permanen di Browser.</span>`;
            alert("Database Berhasil Diperbarui!");
        } catch (err) {
            console.error(err);
            status.innerHTML = "❌ Format Excel lu salah anjing!";
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
