function initBoilerInteractions() {
  const container = document.querySelector('.diagram-wrapper.active');
  const svg = container ? container.querySelector('svg') : null;
  if (!svg) return;

  // Panggil logika dari zoom.js
  if (typeof initZoomAndPan === 'function') initZoomAndPan(); 

  const popup = document.getElementById('info-popup');
  const popTitle = document.getElementById('popup-title');
  const popBody = document.getElementById('popup-body');

  // Logika Hover berdasarkan ID SVG
  const allElements = svg.querySelectorAll('*');
  allElements.forEach(el => {
    const idAttr = (el.getAttribute('id') || '').toUpperCase();
    const tagName = el.tagName.toLowerCase();

    // Mengabaikan elemen base & pipa
    if (idAttr === 'STM01' || tagName === 'svg' || idAttr.startsWith('LINE')) {
        el.style.pointerEvents = (idAttr.startsWith('LINE')) ? 'none' : 'auto'; 
        if(idAttr === 'STM01') el.style.pointerEvents = 'none';
        return;
    }

    const cleanId = idAttr.replace(/[-_0-9]/g, ' '); 
    let key = Object.keys(equipInfo).find(k => cleanId.includes(k));
    
    if (!key && (tagName === 'text' || tagName === 'tspan')) {
      const txtContent = el.textContent.toUpperCase();
      key = Object.keys(equipInfo).find(k => txtContent.includes(k));
    }

    // Jika ditemukan di database (main.js)
    if (key) {
      el.style.cursor = 'help';
      el.style.pointerEvents = 'all';

      el.onmouseenter = (e) => {
        popTitle.textContent = equipInfo[key].title;
        popBody.textContent = equipInfo[key].body;
        popup.classList.add('visible');
        if (tagName !== 'g') el.style.filter = 'brightness(1.2) drop-shadow(0 0 5px #38bdf8)';
      };

      el.onmousemove = (e) => {
        let x = e.clientX + 20;
        let y = e.clientY + 20;
        if (x + 340 > window.innerWidth) x = e.clientX - 360;
        if (y + 150 > window.innerHeight) y = e.clientY - 170;
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
      };
      
      el.onmouseleave = () => { popup.classList.remove('visible'); el.style.filter = 'none'; };
    }
  });

  // Memicu Animasi
  const petir = svg.getElementById('PETIR');
  if (petir) petir.classList.add('lightning-glow');

  const fire = svg.getElementById('GLOW FIRE') || svg.querySelector('[id="GLOW FIRE"]');
  if (fire) fire.classList.add('furnace-glow');

  const blades = svg.querySelectorAll('[id^="blade"], [id^="BLADE"]');
  blades.forEach(f => f.classList.add('fan-spin'));

  let sDelay = 0;
  svg.querySelectorAll('[fill="#6D6D6D"]').forEach(s => {
    const w = s.closest('div[data-svg-wrapper]') || s;
    w.classList.add('smoke-anim');
    w.style.animationDelay = `${sDelay}s`;
    sDelay += 0.8;
  });
}

// Inisialisasi Pertama Kali
window.addEventListener('load', () => { 
  initBoilerInteractions(); 
});

// Pantau injeksi kode SVG dinamis
const observer = new MutationObserver(() => {
  if (document.querySelector('.diagram-wrapper.active svg')) {
    initBoilerInteractions();
  }
});
observer.observe(document.querySelector('.main-content'), { childList: true, subtree: true });