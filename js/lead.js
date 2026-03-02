function kirimLead(email,umur,premi){

console.log("Lead masuk:", email, umur, premi);

// nanti bisa connect ke backend / email API

let wa =
"https://wa.me/6281386590899?text=" +
"Simulasi Premi:%0A" +
"Umur:" + umur +
"%0APremi:" + premi;

window.open(wa,'_blank');

}content://com.android.externalstorage.documents/tree/primary%3ADCIM%2Fmikecitrans-website::primary:DCIM/mikecitrans-website/js/lead.js