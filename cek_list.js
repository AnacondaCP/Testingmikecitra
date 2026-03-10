const axios = require('axios');
const API_KEY = 'AIzaSyBTyCCfpzh_pxDR6VSvxn3Qx8IW8fjxTjk';

async function liatModel() {
    try {
        console.log("🔍 Menghubungi Google AI Studio...");
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const res = await axios.get(url);
        
        console.log("\n✅ MODEL YANG SUPPORT DI API KEY LU:");
        console.log("--------------------------------------");
        
        res.data.models.forEach(m => {
            // Kita filter yang bisa generateContent aja biar gak pusing
            if (m.supportedGenerationMethods.includes("generateContent")) {
                console.log(`📌 Nama: ${m.name.replace('models/', '')}`);
                console.log(`   Spek: ${m.description}`);
                console.log("--------------------------------------");
            }
        });
    } catch (err) {
        console.error("❌ Gagal total, Cu! Pesan error:", err.response?.data || err.message);
    }
}

liatModel();

