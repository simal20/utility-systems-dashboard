// DATA INFORMASI ALAT (Database)
const equipInfo = {
  'FURNACE': { title: 'FURNACE', body: 'Ruang bakar utama suhu tinggi (~700 °C) tempat terjadinya konversi energi batubara menjadi panas. Perpindahan panas dominan terjadi melalui radiasi.' },
  'BOTTOM ASH': { title: 'BOTTOM ASH', body: 'Abu berat sisa pembakaran yang jatuh ke bagian bawah boiler untuk selanjutnya dibuang sebagai limbah.' },
  'FLY ASH': { title: 'FLY ASH', body: 'Abu halus yang terbawa aliran gas buang menuju ESP.' },
  'ESP': { title: 'ELECTROSTATIC PRECIPITATOR (ESP)', body: 'Alat penangkap debu halus menggunakan medan listrik statis (anoda dan katoda) bertegangan tinggi untuk "membersihkan" gas buang sebelum dikeluarkan dari cerobong.' },
  'COAL FEEDER': { title: 'COAL FEEDER', body: 'Pengatur laju aliran batubara sesuai dengan kebutuhan atau beban boiler.' },
  'TRAVELLING GRATE': { title: 'TRAVELLING GRATE', body: 'Lantai pembakaran berjalan yang membawa batubara hingga terbakar sempurna.' },
  'FD FAN': { title: 'FORCED DRAFT FAN (FDF)', body: 'Kipas peniup udara pembakaran.' },
  'ID FAN': { title: 'INDUCED DRAFT FAN (IDF)', body: 'Kipas penghisap gas buang menuju cerobong (chimney).' },
  'BFP': { title: 'BOILER FEED PUMP (BFP)', body: 'Pompa air pengisi boiler dengan tekanan tinggi.' },
  'AIR PREHEATER': { title: 'AIR PREHEATER (APH)', body: 'Pemanas udara pembakaran sebelum masuk ke furnace dengan menggunakan sisa panas dari gas buang.' },
  'STEAM DRUM': { title: 'STEAM DRUM', body: 'Bejana pemisah antara uap jenuh dan air boiler.' },
  'SUPERHEATER': { title: 'SUPERHEATER (SH)', body: 'Pemanas steam lanjut menjadi steam kering untuk suplai ke steam turbine.' },
  'ECONOMIZER': { title: 'ECONOMIZER', body: 'Pemanas awal air umpan boiler memanfaatkan temperatur gas buang yang masih tinggi.' },
  'DEAERATOR': { title: 'DEAERATOR', body: 'Pembuang gas terlarut dalam air, seperti O2 & CO2, untuk mencegah korosi.' },
  'WATER TANK': { title: 'DEMIN WATER TANK', body: 'Sumber air demineral sebagai air umpan boiler.' }
};

// ==========================================
// LOAD EXTERNAL SVG
// ==========================================
async function loadSVG(url, containerId) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const svgData = await response.text();
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = svgData;
            // MutationObserver di interactions.js otomatis mendeteksi perubahan ini
        }
    } catch (error) {
        console.error("Gagal memuat SVG:", error);
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = `<div class="placeholder-card">Gagal memuat ${url}. Pastikan pakai Local Server.</div>`;
    }
}

// Navigation HOME 
function switchPage(el, pageId) {
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.page-section').forEach(section => section.classList.remove('active'));
  document.getElementById('page-' + pageId).classList.add('active');
  
  if(pageId === 'boiler') { 
    setTimeout(() => { 
        if(typeof initBoilerInteractions === 'function') initBoilerInteractions(); 
        if(typeof resetZoom === 'function') resetZoom(); 
    }, 150); 
  }
}

// Navigation Sub-Layout Boiler 
function switchBoilerLayout(el, layoutKey) {
    document.querySelectorAll('.sub-nav .sub-item').forEach(item => item.classList.remove('active'));
    el.classList.add('active');
    
    document.querySelectorAll('#page-boiler .diagram-wrapper').forEach(wrap => wrap.classList.remove('active'));
    
    let targetId = 'diagram-' + layoutKey;
    let target = document.getElementById(targetId);
    if(target) {
        target.classList.add('active');
        setTimeout(() => {
            if(typeof initBoilerInteractions === 'function') initBoilerInteractions();
            if(typeof resetZoom === 'function') resetZoom();
        }, 50);
    }
}

// Live Clock
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { hour12: false });
    const clockEl = document.getElementById('live-clock');
    if(clockEl) clockEl.innerText = timeString;
}

setInterval(updateClock, 1000);

// Initialization
window.addEventListener('load', () => {
    updateClock();
    // Get all SVGs
    loadSVG('assets/logo-pabrikin.svg', 'logo-place');
    loadSVG('assets/boiler75.svg', 'diagram-stoker');
    loadSVG('assets/distribution.svg', 'diagram-distribution');
    initFilters();
});
