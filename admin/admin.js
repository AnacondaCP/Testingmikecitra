// Konfigurasi Akun
const USERS = {
    admin: { pass: "mike123", role: "admin" },
    owner: { pass: "owner123", role: "owner" }
};

// --- FUNGSI LOGIN ---
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

// --- FUNGSI LOGOUT ---
function logout() {
    localStorage.removeItem("role");
    window.location.href = "login.html";
}

// --- NAVIGASI DASHBOARD ---
function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    const target = document.getElementById(id);
    if (target) target.style.display = "block";
}

// --- 1. PROSES UPLOAD EXCEL (PREMI) ---
function prosesExcel() {
    const fileInput = document.getElementById('excelFile');
    const status = document.getElementById('statusUpload');
    
    if (!fileInput.files[0]) return alert("Pilih file excel dulu!");

    status.innerHTML = "⏳ Sedang sinkronisasi data...";
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

            // Simpan ke LocalStorage agar dibaca kalkulator (calc.js)
            localStorage.setItem("dbPremi", JSON.stringify(jsonData));
            status.innerHTML = `<b style="color:#10b981">✅ Sukses! ${jsonData.length} data premi telah di-sync ke Kalkulator.</b>`;
        } catch (err) {
            status.innerHTML = `<b style="color:#ef4444">❌ Gagal membaca file Excel!</b>`;
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

// --- 2. MANAGE PRODUK ---
function simpanProduk() {
    const nama = document.getElementById('prodName').value;
    const img = document.getElementById('prodImg').value;
    const desc = document.getElementById('prodDesc').value;

    if (!nama || !desc) return alert("Minimal isi Nama dan Deskripsi!");

    const produkBaru = { nama, img, desc, date: new Date().toLocaleDateString() };
    let dbProduk = JSON.parse(localStorage.getItem("dbProduk") || "[]");
    dbProduk.push(produkBaru);
    
    localStorage.setItem("dbProduk", JSON.stringify(dbProduk));
    alert("Produk Berhasil Ditambahkan!");
    
    // Reset Form
    document.getElementById('prodName').value = "";
    document.getElementById('prodDesc').value = "";
}

// --- 3. MANAGE TESTIMONI ---
function simpanTesti() {
    const nama = document.getElementById('testiName').value;
    const teks = document.getElementById('testiText').value;

    if (!nama || !teks) return alert("Isi semua kolom!");

    let dbTesti = JSON.parse(localStorage.getItem("dbTesti") || "[]");
    dbTesti.push({ nama, teks });
    
    localStorage.setItem("dbTesti", JSON.stringify(dbTesti));
    alert("Testimoni Berhasil Disimpan!");
}

// --- PROTEKSI HALAMAN ---
window.onload = function() {
    const role = localStorage.getItem("role");
    const isDashboard = window.location.pathname.includes("dashboard.html");

    if (isDashboard) {
        if (!role) {
            window.location.href = "login.html";
            return;
        }
        // Menu khusus owner
        if (role !== "owner" && document.getElementById("ownerMenu")) {
            document.getElementById("ownerMenu").style.display = "none";
        }
        showPage("home");
    }
};
