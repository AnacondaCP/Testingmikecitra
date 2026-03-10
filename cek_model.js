const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI('AIzaSyBTyCCfpzh_pxDR6VSvxn3Qx8IW8fjxTjk');

async function listModels() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Kita tes satu
    const result = await model.generateContent("test");
    console.log("✅ Berhasil! Pakai model: gemini-1.5-flash");
  } catch (e) {
    console.log("❌ Gagal pake flash, nyoba gemini-pro...");
    try {
        const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
        await model2.generateContent("test");
        console.log("✅ Berhasil! Pakai model: gemini-pro");
    } catch (e2) {
        console.log("‼️ Semua gagal. Error terakhir: ", e2.message);
    }
  }
}
listModels();
