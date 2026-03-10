// ==========================================
// 1. SISTEM LOGIN & NAVIGASI (BIAR GAK ERROR)
// ==========================================
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
    } else { 
        alert("Username atau Password Salah, Cu!"); 
    }
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

// ==========================================
// 2. LOGIKA PEMBACA EXCEL (LEGACY PRO SAKLEK)
// ==========================================
function prosesExcel() {
    const fileInput = document.getElementById('excelFile');
    const status = document.getElementById('statusUpload');
    if (!fileInput.files[0]) return alert("Pilih file excel dulu!");

    status.innerHTML = "⏳ Menghubungkan ke Otak Mike... Mohon Tunggu.";
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

                // Koordinat Row Allianz Legacy Pro:
                const rowSantunan = rows[2]; // Row 3
                const rowGender = rows[3];    // Row 4
                const rowTenor = rows[4];     // Row 5 (Masa Setor)

                for (let i = 5; i < rows.length; i++) {
                    const row = rows[i];
                    const usia = row[1]; // Kolom B (Usia)
                    if (usia === undefined || usia === "") continue;

                    row.forEach((cellValue, colIndex) => {
                        if (colIndex < 2 || !cellValue) return;

                        let upRaw = findValidBack(rowSantunan, colIndex);
                        let tenorRaw = findValidBack(rowTenor, colIndex);
                        let genderLabel = rowGender[colIndex];

                        if (upRaw && tenorRaw && genderLabel) {
                            const up = upRaw.toString().replace(/[^0-9]/g, '');
                            const tenor = tenorRaw.toString().replace(/[^0-9]/g, '');
                            const gender = genderLabel.toLowerCase().includes("pria") ? "pria" : "wanita";
                            
                            // Key: pria_30_200000000_10
                            const key = `${gender}_${usia}_${up}_${tenor}`;
                            globalDB[sheetName][key] = Number(cellValue);
                        }
                    });
                }
            });

            localStorage.setItem("globalDB", JSON.stringify(globalDB));
            status.innerHTML = `<span style="color:#10b981">✅ DATABASE PERMANEN AKTIF!</span>`;
            alert("Data Berhasil Disinkronkan!");
        } catch (err) {
            console.error(err);
            status.innerHTML = "❌ Excel Error. Cek format kolomnya!";
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
