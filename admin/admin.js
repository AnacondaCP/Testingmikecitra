// Konfigurasi Akun
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
        alert("Username atau Password Salah!");
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

// --- FUNGSI SAKTI: OTOMATIS MAP EXCEL ---
function prosesExcel() {
    const fileInput = document.getElementById('excelFile');
    const status = document.getElementById('statusUpload');
    if (!fileInput.files[0]) return alert("Pilih file excel dulu!");

    status.innerHTML = "⏳ Menyingkronkan Produk...";
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

                // Mapping baris header sesuai format file lo
                const rowUP = rows[2] || [];     // Baris 3: "SANTUNAN 200 JUTA"
                const rowGender = rows[3] || []; // Baris 4: "PRIA / WANITA"
                const rowTenor = rows[4] || [];  // Baris 5: "MASA SETOR 10 TAHUN"

                for (let i = 5; i < rows.length; i++) {
                    const row = rows[i];
                    const usia = row[1]; // Kolom B adalah Usia
                    if (usia === undefined || usia === "") continue;

                    row.forEach((cellValue, colIndex) => {
                        if (colIndex < 2 || !cellValue) return;

                        // Cari data ke kiri jika sel tersebut merged
                        let upRaw = findValidBack(rowUP, colIndex);
                        let genderRaw = findValidBack(rowGender, colIndex);
                        let tenorRaw = findValidBack(rowTenor, colIndex);

                        if (upRaw && genderRaw && tenorRaw) {
                            const up = upRaw.toString().replace(/\D/g, '');
                            const tenor = tenorRaw.toString().replace(/\D/g, '');
                            const gender = genderRaw.toLowerCase().includes("pria") ? "pria" : "wanita";
                            
                            // Simpan dengan key unik
                            const key = `${gender}_${usia}_${up}_${tenor}`;
                            globalDB[sheetName][key] = cellValue;
                        }
                    });
                }
            });

            // Simpan seluruh produk ke satu database
            localStorage.setItem("globalDB", JSON.stringify(globalDB));
            status.innerHTML = `<span style="color:#10b981">✅ Berhasil! ${workbook.SheetNames.length} Produk Masuk Sistem.</span>`;
        } catch (err) {
            console.error(err);
            status.innerHTML = "❌ Gagal baca format Excel.";
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

function findValidBack(arr, index) {
    for (let i = index; i >= 0; i--) {
        if (arr[i]) return arr[i];
    }
    return null;
}

window.onload = function() {
    if (window.location.pathname.includes("dashboard.html") && !localStorage.getItem("role")) {
        window.location.href = "login.html";
    }
    showPage("home");
};
