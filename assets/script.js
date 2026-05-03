const WNUM='263719362231';
function wa(text){return `https://wa.me/${WNUM}?text=${encodeURIComponent(text)}`}
document.querySelectorAll('[data-wa]').forEach(a=>a.href=wa(a.dataset.wa));
const hamb=document.querySelector('.hamb'), links=document.querySelector('.links');
if(hamb&&links){hamb.addEventListener('click',()=>links.classList.toggle('open'))}
