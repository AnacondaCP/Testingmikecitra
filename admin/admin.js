// --- LOGIC LOGIN & DASHBOARD ---
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
    } else { alert("Login Gagal, Cu!"); }
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

// --- LOGIC PEMBACA EXCEL (KHUSUS VERCEL / LOCALSTORAGE) ---
function prosesExcel() {
    const fileInput = document.getElementById('excelFile');
    const status = document.getElementById('statusUpload');
    if (!fileInput.files[0]) return alert("Mana filenya kontol?");

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

                // Mapping Baris Allianz Legacy Pro Lu:
                const rowSantunan = rows[2]; // Baris 3 (SANTUNAN 200 JUTA, dst)
                const rowGender = rows[3];    // Baris 4 (PRIA, WANITA)
                const rowTenor = rows[4];     // Baris 5 (MASA SETOR)

                for (let i = 5; i < rows.length; i++) {
                    const row = rows[i];
                    const usia = row[1]; // Kolom B (Index 1) adalah Usia
                    if (usia === undefined || usia === "") continue;

                    row.forEach((cellValue, colIndex) => {
                        // Skip kolom index < 2 (Kolom A & B) dan pastikan ada nilai angkanya
                        if (colIndex < 2 || !cellValue || isNaN(cellValue)) return;

                        let upRaw = findValidBack(rowSantunan, colIndex);
                        let tenorRaw = findValidBack(rowTenor, colIndex);
                        let genderLabel = rowGender[colIndex];

                        if (upRaw && tenorRaw && genderLabel) {
                            const up = upRaw.toString().replace(/[^0-9]/g, '');
                            const tenor = tenorRaw.toString().replace(/[^0-9]/g, '');
                            const gender = genderLabel.toLowerCase().includes("pria") ? "pria" : "wanita";
                            
                            // Key format: pria_30_200000000_10
                            const key = `${gender}_${usia}_${up}_${tenor}`;
                            globalDB[sheetName][key] = Number(cellValue);
                        }
                    });
                }
            });

            // Simpan Permanen di Browser
            localStorage.setItem("globalDB", JSON.stringify(globalDB));
            status.innerHTML = `<span style="color:#10b981">✅ DATA SINKRON SAKLEK!</span>`;
            alert("Database Excel Lu Berhasil Masuk!");
        } catch (err) {
            console.error(err);
            status.innerHTML = "❌ Gagal baca Excel. Formatnya berantakan mungkin.";
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
