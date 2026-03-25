// State Zoom & Pan
let zoomScale = 1;
let pointX = 0;
let pointY = 0;
let startPos = { x: 0, y: 0 };
let isPanning = false;

function resetZoom() {
    zoomScale = 1; pointX = 0; pointY = 0;
    applyTransform();
}

function applyTransform() {
    const activeSVG = document.querySelector('.diagram-wrapper.active svg');
    if (activeSVG) {
        activeSVG.style.transform = `translate3d(${pointX}px, ${pointY}px, 0) scale(${zoomScale})`;
    }
}

function initZoomAndPan() {
    const container = document.querySelector('.diagram-wrapper.active');
    const svg = container ? container.querySelector('svg') : null;
    if (!container || !svg) return;

    container.onwheel = function(e) {
        e.preventDefault();
        const xs = (e.clientX - pointX) / zoomScale;
        const ys = (e.clientY - pointY) / zoomScale;
        const delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
        
        if (delta > 0) zoomScale *= 1.1; else zoomScale /= 1.1;
        zoomScale = Math.min(Math.max(0.1, zoomScale), 15);
        
        pointX = e.clientX - xs * zoomScale;
        pointY = e.clientY - ys * zoomScale;
        applyTransform();
    };

    container.onmousedown = function(e) {
        e.preventDefault();
        startPos = { x: e.clientX - pointX, y: e.clientY - pointY };
        isPanning = true;
    };
    
    window.onmousemove = function(e) {
        if (!isPanning) return;
        pointX = e.clientX - startPos.x;
        pointY = e.clientY - startPos.y;
        applyTransform();
    };
    
    window.onmouseup = function(e) { isPanning = false; };
}