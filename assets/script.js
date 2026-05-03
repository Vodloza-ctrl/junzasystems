const ZVAKHO_NUMBER = '263XXXXXXXXX';
function wa(keyword){ return `https://wa.me/${ZVAKHO_NUMBER}?text=${encodeURIComponent(keyword)}`; }
document.querySelectorAll('[data-wa]').forEach(a=>{a.href=wa(a.dataset.wa)});
