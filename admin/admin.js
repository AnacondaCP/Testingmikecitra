const USERS = {
    admin: { pass: "mike123", role: "admin" },
    owner: { pass: "owner123", role: "owner" }
};

// --- FUNGSI LOGIN ---
function login() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    if (USERS[user] && USERS[user].pass === pass) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", USERS[user].role);
        window.location.href = "dashboard.html";
    } else { alert("Username/Password salah, Cu!"); }
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    document.getElementById(id).style.display = "block";
}

// --- FUNGSI PROSES EXCEL (SMART PARSER) ---
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

                const rowUP = rows[2] || [];     
                const rowGender = rows[3] || []; 
                const rowTenor = rows[4] || [];  

                for (let i = 5; i < rows.length; i++) {
                    const row = rows[i];
                    const usia = row[1]; 
                    if (!usia) continue;

                    row.forEach((cellValue, colIndex) => {
                        if (colIndex < 2 || !cellValue) return;

                        let upRaw = findValidBack(rowUP, colIndex);
                        let genderRaw = findValidBack(rowGender, colIndex);
                        let tenorRaw = findValidBack(rowTenor, colIndex);

                        if (upRaw && genderRaw && tenorRaw) {
                            const up = upRaw.toString().replace(/\D/g, '');
                            const tenor = tenorRaw.toString().replace(/\D/g, '');
                            const gender = genderRaw.toLowerCase().includes("pria") ? "pria" : "wanita";
                            
                            const key = `${gender}_${usia}_${up}_${tenor}`;
                            globalDB[sheetName][key] = Number(cellValue);
                        }
                    });
                }
            });

            localStorage.setItem("globalDB", JSON.stringify(globalDB));
            status.innerHTML = `<span style="color:#10b981">✅ DATA SINKRON!</span>`;
            alert("Database Excel Berhasil Masuk!");
        } catch (err) {
            status.innerHTML = "❌ Gagal baca format Excel.";
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
