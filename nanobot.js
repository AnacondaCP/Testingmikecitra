const { Telegraf } = require('telegraf');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const xlsx = require('xlsx');
const pdf = require('pdf-parse-fork');

// ===== POLYFILL ANTI-ERROR PDF =====
if (typeof global.DOMMatrix === 'undefined') {
    global.DOMMatrix = class DOMMatrix {
        constructor() { this.m11 = 1; this.m12 = 0; this.m21 = 0; this.m22 = 1; this.m41 = 0; this.m42 = 0; }
        static transform(a, b) { return [a[0]*b[0]+a[2]*b[1], a[1]*b[0]+a[3]*b[1], a[0]*b[2]+a[2]*b[3], a[1]*b[2]+a[3]*b[3], a[0]*b[4]+a[2]*b[5]+a[4], a[1]*b[4]+a[3]*b[5]+a[5]]; }
    };
}

// ===== CONFIG =====
const TELEGRAM_TOKEN = '8556171807:AAEDGljhx7NtehH0IF8FuY3pgI62TqKVItg';
const GEMINI_API_KEY = 'AIzaSyBTyCCfpzh_pxDR6VSvxn3Qx8IW8fjxTjk';
const MODEL = "gemini-3.1-flash-lite-preview"; 
// ==================

const bot = new Telegraf(TELEGRAM_TOKEN);

// --- ENGINE AI MULTIMODAL ---
async function panggilAI(prompt, mimeType = null, base64Data = null) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
        let contents = [{ parts: [{ text: prompt }] }];
        if (mimeType && base64Data) {
            contents[0].parts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
        }
        const res = await axios.post(url, { contents }, { timeout: 35000 });
        return res.data.candidates[0].content.parts[0].text;
    } catch (err) {
        return "❌ AI Error: " + (err.response?.data?.error?.message || err.message);
    }
}

// --- FUNGSI GITHUB SYNC ---
function gitPush(ctx, msg) {
    exec(`git add . && git commit -m "${msg}" && git push origin main`, (err, stdout) => {
        if (err) return ctx.reply(`⚠️ Git Error: ${err.message}`);
        ctx.reply(`🚀 Berhasil Push ke GitHub!`);
    });
}

// --- SCANNER REPO ---
function scanDirectory(dir, fileList = []) {
    try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            if (file === 'node_modules' || file === '.git' || file === 'package-lock.json') return;
            if (fs.statSync(filePath).isDirectory()) scanDirectory(filePath, fileList);
            else fileList.push(filePath);
        });
        return fileList;
    } catch (e) { return []; }
}

// ==========================================
// --- FITUR TAHAN BANTING ---
// ==========================================

// 1. MENU UTAMA
bot.command(['start', 'menu', 'help'], (ctx) => {
    ctx.reply(`
🌐 **MIKE DEVOPS MASTER v7.5 (ANTI-CRASH)** 🌐
━━━━━━━━━━━━━━━━━━━━━━━━
🤖 **Brain:** \`Gemini 3.1 Pro\`
━━━━━━━━━━━━━━━━━━━━━━━━

📁 **INTELLIGENCE**
├─ \`/scan\` -> Biar AI paham kodingan lu
├─ \`/ask [tanya]\` -> Tanya soal isi repo
└─ \`/read [file]\` -> Bedah 1 file kodingan

🔥 **DEV & REPO**
├─ \`/create [file] [fitur]\` -> Bikin & Push
├─ \`/fix [file] [error]\` -> Debug & Push
├─ \`/status\` -> Cek Git Status
└─ \`/rollback\` -> Undo Update

📊 **MULTIMODAL (ANTI-ERROR)**
├─ *Kirim Foto Error/Kodingan* -> Analisa
├─ *Kirim PDF/Excel* -> Analisa Data
└─ \`/fix_this\` -> Terapkan solusi AI

🚀 **SYSTEM**
├─ \`/security\` -> Cek API Key bocor
├─ \`/cmd [perintah]\` -> Terminal
└─ \`/log\` -> Cek Error Log
    `, { parse_mode: 'Markdown' }).catch(() => ctx.reply("Menu Aktif! (Mode Text Only)"));
});

// 2. HANDLER MULTIMODAL (FIX ERROR LEWAT FOTO/DOKUMEN)
bot.on(['photo', 'document'], async (ctx) => {
    try {
        let fileId, fileName, mimeType;
        if (ctx.message.photo) {
            fileId = ctx.message.photo.pop().file_id;
            fileName = "image.jpg"; mimeType = "image/jpeg";
        } else {
            fileId = ctx.message.document.file_id;
            fileName = ctx.message.document.file_name; 
            mimeType = ctx.message.document.mime_type;
        }

        ctx.reply(`🔍 Membedah ${fileName}...`);
        const fileLink = await ctx.telegram.getFileLink(fileId);
        const response = await axios.get(fileLink, { responseType: 'arraybuffer' });
        const buffer = response.data;

        let prompt = `Lu Senior DevOps Mike. Analisa file ini. Jika ada saran kode, format FILE: [nama] KODE: [isi]. Jawab santai panggil Cu. `;
        let hasil = "";

        if (mimeType.includes('image')) {
            hasil = await panggilAI(prompt, mimeType, buffer.toString('base64'));
        } else if (fileName.endsWith('.pdf')) {
            const data = await pdf(buffer);
            hasil = await panggilAI(prompt + `Isi: ${data.text.substring(0, 5000)}`);
        } else if (fileName.endsWith('.xlsx')) {
            const wb = xlsx.read(buffer, { type: 'buffer' });
            hasil = await panggilAI(prompt + `Excel: ${JSON.stringify(xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]).slice(0,10))}`);
        }

        if (hasil.includes("KODE:")) fs.writeFileSync('last_suggested_code.txt', hasil);

        // --- SOLUSI ANTI ERROR PARSING ---
        try {
            await ctx.reply(`📝 **HASIL ANALISA:**\n\n${hasil}`, { parse_mode: 'Markdown' });
        } catch (e) {
            await ctx.reply(`📝 **HASIL ANALISA (Plain Text):**\n\n${hasil}`);
        }

    } catch (err) {
        ctx.reply("❌ Gagal Analisa: " + err.message);
    }
});

// 3. /SCAN & /ASK (LOGIKA PAHAM REPO)
bot.command('scan', async (ctx) => {
    try {
        const files = scanDirectory('./');
        fs.writeFileSync('repo_structure.json', JSON.stringify(files));
        const res = await panggilAI(`Ini struktur file gua:\n${files.join('\n')}\n\nPahami isinya Cu!`);
        ctx.reply(`✅ **Repo Terindeks!**\n\n${res}`);
    } catch (e) { ctx.reply("Gagal Scan."); }
});

bot.command('ask', async (ctx) => {
    try {
        const query = ctx.message.text.split(' ').slice(1).join(' ');
        const struct = fs.existsSync('repo_structure.json') ? fs.readFileSync('repo_structure.json', 'utf8') : "Belum scan.";
        const res = await panggilAI(`Repo Info: ${struct}\n\nUser Tanya: ${query}\n\nJawab panggil Cu.`);
        ctx.reply(res);
    } catch (e) { ctx.reply("Error Ask."); }
});

// 4. /FIX_THIS (EKSEKUSI SOLUSI)
bot.command('fix_this', (ctx) => {
    try {
        if (!fs.existsSync('last_suggested_code.txt')) return ctx.reply("Gak ada saran kode.");
        const saran = fs.readFileSync('last_suggested_code.txt', 'utf8');
        const file = saran.match(/FILE:\s*(\S+)/)?.[1] || "auto_fix.php";
        const kode = saran.split("KODE:")[1]?.replace(/```[a-z]*\n|```/g, "") || saran;
        fs.writeFileSync(file, kode.trim());
        gitPush(ctx, `Auto-fix via AI`);
    } catch (e) { ctx.reply("Gagal Fix."); }
});

// 5. CORE DEV TOOLS
bot.command('create', async (ctx) => {
    const input = ctx.message.text.split(' ').slice(1);
    const [file, ...fitur] = input;
    const kode = await panggilAI(`Buat kode LENGKAP ${file} fitur: ${fitur.join(' ')}. HANYA kode.`);
    fs.writeFileSync(file, kode.replace(/```[a-z]*\n|```/g, "").trim());
    gitPush(ctx, `Add: ${file}`);
});

bot.command('fix', async (ctx) => {
    const input = ctx.message.text.split(' ').slice(1);
    const [file, ...err] = input;
    if (!fs.existsSync(file)) return ctx.reply("File gak ada.");
    const kodeLama = fs.readFileSync(file, 'utf8');
    const kodeBaru = await panggilAI(`Kode: ${kodeLama}\n\nBenerin: ${err.join(' ')}. HANYA kode baru.`);
    fs.writeFileSync(file, kodeBaru.replace(/```[a-z]*\n|```/g, "").trim());
    gitPush(ctx, `Fix: ${file}`);
});

bot.command('status', (ctx) => exec('git status', (e, s) => ctx.reply(`\`\`\`\n${s}\n\`\`\``)));
bot.command('cmd', (ctx) => {
    const cmd = ctx.message.text.split(' ').slice(1).join(' ');
    exec(cmd, (e, s) => ctx.reply(`\`\`\`\n${s || e.message}\n\`\`\``));
});
bot.command('security', (ctx) => {
    exec('grep -rE "API_KEY|PASSWORD|SECRET|TOKEN" . --exclude=nanobot.js', (e, s) => ctx.reply(`🚩 **Found:**\n\n${s || 'Aman Cu.'}`));
});

// CHAT CURHAT
bot.on('text', async (ctx) => {
    if (ctx.message.text.startsWith('/')) return;
    const ans = await panggilAI("Lu Senior Dev Mike. Jawab panggil 'Cu': " + ctx.message.text);
    ctx.reply(ans).catch(() => ctx.reply("AI lagi puyeng Cu."));
});

bot.launch().then(() => console.log("🚀 ANTI-CRASH BOT READY!"));
