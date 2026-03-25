// ==========================================
// 1. ISOLASI STATE UNTUK TIAP DIAGRAM (Anti-Bocor antar Tab)
// ==========================================
function attachInteractions(wrapper) {
    if (wrapper.dataset.interacted) return; // Cegah dobel event
    wrapper.dataset.interacted = 'true';

    let scale = 1, posX = 0, posY = 0, startX = 0, startY = 0;
    let isDragging = false;

    const apply = () => {
        const svg = wrapper.querySelector('svg');
        if (svg) svg.style.transform = `translate3d(${posX}px, ${posY}px, 0) scale(${scale})`;
    };

    // A. SCROLL MOUSE (DESKTOP)
    wrapper.onwheel = (e) => {
        e.preventDefault();
        const xs = (e.clientX - posX) / scale;
        const ys = (e.clientY - posY) / scale;
        scale *= (e.deltaY > 0) ? 0.9 : 1.1;
        scale = Math.min(Math.max(0.1, scale), 15);
        posX = e.clientX - xs * scale;
        posY = e.clientY - ys * scale;
        apply();
    };

    // B. DRAG PAN (DESKTOP)
    wrapper.onmousedown = (e) => {
        if (e.button !== 0) return;
        isDragging = true;
        startX = e.clientX - posX;
        startY = e.clientY - posY;
        wrapper.style.cursor = 'grabbing';
    };

    // C. INTEGRASI MOBILE (TOUCH & PINCH TO ZOOM)
    let initialDist = null;
    let initialScale = 1;

    wrapper.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            startX = e.touches[0].clientX - posX;
            startY = e.touches[0].clientY - posY;
        } else if (e.touches.length === 2) {
            isDragging = false;
            initialDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            initialScale = scale;
        }
    }, {passive: false});

    wrapper.addEventListener('touchmove', (e) => {
        e.preventDefault(); 
        if (isDragging && e.touches.length === 1) {
            posX = e.touches[0].clientX - startX;
            posY = e.touches[0].clientY - startY;
            apply();
        } else if (e.touches.length === 2 && initialDist) {
            const currentDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            scale = Math.min(Math.max(0.1, initialScale * (currentDist / initialDist)), 15);
            apply();
        }
    }, {passive: false});

    const endDrag = () => { isDragging = false; initialDist = null; wrapper.style.cursor = 'grab'; };
    window.addEventListener('mousemove', (e) => {
        if (isDragging) { posX = e.clientX - startX; posY = e.clientY - startY; apply(); }
    });
    window.addEventListener('mouseup', endDrag);
    wrapper.addEventListener('touchend', endDrag);
    wrapper.addEventListener('mouseleave', endDrag);

    // Fungsi reset mandiri tiap wrapper
    wrapper.resetZoom = () => { scale = 1; posX = 0; posY = 0; apply(); };
}

// ==========================================
// 2. INJEKSI ANIMASI & HOVER (Dijalankan pasca Load)
// ==========================================
function initializeSVGFeatures(svg) {
    if (!svg || svg.dataset.initialized) return;
    svg.dataset.initialized = 'true';

    // A. Paksa Suntik Class Animasi (Api, Asap, Kipas) berdasarkan ID
    svg.querySelectorAll('[id="GLOW FIRE"]').forEach(el => el.classList.add('furnace-glow'));
    svg.querySelectorAll('[id="SMOKE"]').forEach(el => el.classList.add('smoke-anim'));
    svg.querySelectorAll('[id^="blade"]').forEach(el => el.classList.add('fan-spin'));

    // B. Logika Hover Tooltip
    const popup = document.getElementById('info-popup');
    if (popup && typeof equipInfo !== 'undefined') {
        svg.querySelectorAll('*').forEach(el => {
            const id = (el.getAttribute('id') || '').toUpperCase();
            if (!id || id.startsWith('LINE') || el.tagName === 'g' || el.tagName === 'defs') return;

            let key = Object.keys(equipInfo).find(k => id.includes(k) || (el.textContent && el.textContent.toUpperCase().includes(k)));
            if (key) {
                el.style.cursor = 'help';
                el.style.pointerEvents = 'all';
                el.onmouseenter = () => {
                    document.getElementById('popup-title').innerText = equipInfo[key].title;
                    document.getElementById('popup-body').innerText = equipInfo[key].body;
                    popup.classList.add('visible');
                };
                el.onmousemove = (e) => { popup.style.left = (e.clientX + 20) + 'px'; popup.style.top = (e.clientY + 20) + 'px'; };
                el.onmouseleave = () => popup.classList.remove('visible');
            }
        });
    }
}

// ==========================================
// 3. RADAR MUTATION OBSERVER
// ==========================================
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
        if (node.tagName && node.tagName.toLowerCase() === 'svg') initializeSVGFeatures(node);
    }));
});

window.addEventListener('load', () => {
    document.querySelectorAll('.diagram-wrapper').forEach(wrapper => {
        attachInteractions(wrapper); // Pasang event pan/zoom ke wadah
        observer.observe(wrapper, { childList: true }); // Awasi isi wadah
        const existingSvg = wrapper.querySelector('svg');
        if (existingSvg) initializeSVGFeatures(existingSvg);
    });
});

window.resetZoom = () => {
    const activeWrapper = document.querySelector('.diagram-wrapper.active');
    if (activeWrapper && activeWrapper.resetZoom) activeWrapper.resetZoom();
};
window.initBoilerInteractions = () => {}; // Alias dummy agar main.js tidak error