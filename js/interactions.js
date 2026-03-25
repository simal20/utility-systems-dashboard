// DATA INFORMASI ALAT (Database)
const equipInfo = {
    'FURNACE': { title: 'BOILER FURNACE', body: 'Ruang bakar utama suhu tinggi (900-1100°C) tempat terjadinya konversi energi batubara menjadi panas.' },
    'ESP': { title: 'ELECTROSTATIC PRECIPITATOR', body: 'Alat penangkap debu halus menggunakan medan listrik statis tegangan tinggi.' },
    'STEAM': { title: 'MAIN STEAM HEADER', body: 'Jalur utama distribusi uap tekanan tinggi menuju proses produksi dan turbin.' },
    'ELECTRICITY': { title: 'POWER GRID 20kV', body: 'Pusat distribusi kelistrikan dari Generator dan PLN menuju substation tiap plant.' },
    'RAW WATER': { title: 'RAW WATER INTAKE', body: 'Sistem suplai air mentah sebelum diproses oleh Water Treatment Plant.' },
    'AIR COMPRESSOR': { title: 'INSTRUMENT AIR', body: 'Sistem udara bertekanan kering untuk menggerakkan control valve di lapangan.' }
};

let zoomScale = 1, pointX = 0, pointY = 0, isPanning = false, startPos = { x: 0, y: 0 };

function resetZoom() { 
    zoomScale = 1; pointX = 0; pointY = 0; 
    applyTransform(); 
}

function applyTransform() {
    const svg = document.querySelector('.diagram-wrapper.active svg');
    if (svg) svg.style.transform = `translate3d(${pointX}px, ${pointY}px, 0) scale(${zoomScale})`;
}

// Fungsi utama yang menangani Zoom, Pan, Tooltip, dan Animasi SVG
function initZoomAndPan() {
    const container = document.querySelector('.diagram-wrapper.active');
    const svg = container ? container.querySelector('svg') : null;
    if (!container || !svg) return;

    // SCROLL ZOOM
    container.onwheel = (e) => {
        e.preventDefault();
        const delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;
        const xs = (e.clientX - pointX) / zoomScale;
        const ys = (e.clientY - pointY) / zoomScale;
        if (delta > 0) zoomScale *= 1.1; else zoomScale /= 1.1;
        zoomScale = Math.min(Math.max(0.1, zoomScale), 15);
        pointX = e.clientX - xs * zoomScale;
        pointY = e.clientY - ys * zoomScale;
        applyTransform();
    };

    // DRAG PAN
    container.onmousedown = (e) => { 
        e.preventDefault(); 
        startPos = { x: e.clientX - pointX, y: e.clientY - pointY }; 
        isPanning = true; 
    };
    window.onmousemove = (e) => { 
        if (!isPanning) return; 
        pointX = e.clientX - startPos.x; 
        pointY = e.clientY - startPos.y; 
        applyTransform(); 
    };
    window.onmouseup = () => isPanning = false;

    // HOVER TOOLTIP
    const popup = document.getElementById('info-popup');
    if (popup) {
        svg.querySelectorAll('*').forEach(el => {
            const id = (el.getAttribute('id') || '').toUpperCase();
            if (id === 'STM01' || id.startsWith('LINE')) { 
                el.style.pointerEvents = 'none'; 
                return; 
            }
            
            let key = Object.keys(equipInfo).find(k => id.includes(k) || el.textContent.toUpperCase().includes(k));
            if (key) {
                el.style.cursor = 'help'; el.style.pointerEvents = 'all';
                el.onmouseenter = () => {
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

    // ANIMATIONS
    const fire = svg.getElementById('GLOW FIRE') || svg.querySelector('[id="GLOW FIRE"]');
    if (fire) fire.classList.add('furnace-glow');
    svg.querySelectorAll('[id^="blade"], [id^="BLADE"]').forEach(f => f.classList.add('fan-spin'));
}

// Alias agar fungsi tetap bisa dipanggil dari main.js tanpa error
window.initBoilerInteractions = initZoomAndPan;
window.initZoomAndPan = initZoomAndPan;

// Jalankan saat web pertama dimuat
window.addEventListener('load', initZoomAndPan);