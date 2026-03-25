let zoomScale = 1, pointX = 0, pointY = 0, isPanning = false, startPos = { x: 0, y: 0 };
let currentSvg = null; 

function resetZoom() { 
    zoomScale = 1; pointX = 0; pointY = 0; 
    applyTransform(); 
}

function applyTransform() {
    if (currentSvg) {
        currentSvg.style.transform = `translate3d(${pointX}px, ${pointY}px, 0) scale(${zoomScale})`;
    }
}

// ==========================================
// 1. FUNGSI INTI: MEMASANG INTERAKSI
// ==========================================
function attachInteractions(svg) {
    if (!svg || svg === currentSvg) return;
    currentSvg = svg;
    
    const container = svg.parentElement;
    if (!container) return;

    container.style.cursor = 'grab';
    resetZoom();

    // -- EVENT: MOUSE WHEEL (ZOOM) --
    container.onwheel = (e) => {
        e.preventDefault();
        const delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;
        const xs = (e.clientX - pointX) / zoomScale;
        const ys = (e.clientY - pointY) / zoomScale;
        
        if (delta > 0) zoomScale *= 1.1; 
        else zoomScale /= 1.1;
        
        zoomScale = Math.min(Math.max(0.1, zoomScale), 15); 
        pointX = e.clientX - xs * zoomScale;
        pointY = e.clientY - ys * zoomScale;
        applyTransform();
    };

    // -- EVENT: MOUSE DOWN (PAN START) --
    container.onmousedown = (e) => { 
        if (e.button !== 0) return; // Hanya klik kiri
        e.preventDefault(); 
        startPos = { x: e.clientX - pointX, y: e.clientY - pointY }; 
        isPanning = true; 
        container.style.cursor = 'grabbing';
    };

    // -- EVENT: MOUSE MOVE (PANNING) --
    window.onmousemove = (e) => { 
        if (!isPanning) return; 
        pointX = e.clientX - startPos.x; 
        pointY = e.clientY - startPos.y; 
        applyTransform(); 
    };

    // -- EVENT: MOUSE UP (PAN END) --
    window.onmouseup = () => {
        isPanning = false;
        if(container) container.style.cursor = 'grab';
    };

    // -- FITUR: HOVER TOOLTIP --
    const popup = document.getElementById('info-popup');
    if (popup && typeof equipInfo !== 'undefined') {
        svg.querySelectorAll('*').forEach(el => {
            const id = (el.getAttribute('id') || '').toUpperCase();
            if (!id || id.startsWith('LINE') || el.tagName === 'g' || el.tagName === 'defs') return; 
            
            let key = Object.keys(equipInfo).find(k => id.includes(k) || (el.textContent && el.textContent.toUpperCase().includes(k)));
            
            if (key) {
                el.style.cursor = 'help'; 
                el.style.pointerEvents = 'all';
                el.onmouseenter = (e) => {
                    document.getElementById('popup-title').innerText = equipInfo[key].title;
                    document.getElementById('popup-body').innerText = equipInfo[key].body;
                    popup.classList.add('visible');
                };
                el.onmousemove = (e) => {
                    popup.style.left = (e.clientX + 20) + 'px';
                    popup.style.top = (e.clientY + 20) + 'px';
                };
                el.onmouseleave = () => popup.classList.remove('visible');
            }
        });
    }

    // -- FITUR: ANIMASI --
    const fire = svg.getElementById('GLOW FIRE') || svg.querySelector('[id="GLOW FIRE"]');
    if (fire) fire.classList.add('furnace-glow');
    svg.querySelectorAll('[id^="blade"], [id^="BLADE"]').forEach(f => f.classList.add('fan-spin'));
}

// ==========================================
// 2. FUNGSI PEMAKSA (FORCE INIT)
// ==========================================
function initZoomAndPan() {
    // Mencari SVG di dalam section yang saat ini memiliki class .active
    const activeSection = document.querySelector('.page-section.active');
    if (!activeSection) return;
    
    const activeWrapper = activeSection.querySelector('.diagram-wrapper.active') || activeSection.querySelector('.diagram-wrapper');
    if (!activeWrapper) return;
    
    const svg = activeWrapper.querySelector('svg');
    if (svg) {
        attachInteractions(svg);
    } else {
        // Jika belum ada SVG (mungkin masih loading), coba lagi dalam 300ms
        setTimeout(initZoomAndPan, 300);
    }
}

// ==========================================
// 3. OBSERVER & LOAD EVENT
// ==========================================
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach(node => {
            if (node.tagName && node.tagName.toLowerCase() === 'svg') {
                initZoomAndPan();
            }
        });
    });
});

window.addEventListener('load', () => {
    document.querySelectorAll('.diagram-wrapper').forEach(wrapper => {
        observer.observe(wrapper, { childList: true });
    });
    initZoomAndPan();
});

// Alias Global
window.initBoilerInteractions = initZoomAndPan;
window.initZoomAndPan = initZoomAndPan;
window.resetZoom = resetZoom;