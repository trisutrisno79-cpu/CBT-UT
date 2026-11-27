// ==========================================
// 1. GENERATOR SUARA PERINGATAN (Web Audio API)
// ==========================================
function playAlertSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Nada tinggi
    oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.4);

    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.4);
  } catch (e) {
    console.error("Audio gagal diputar:", e);
  }
}

// ==========================================
// 2. INFORMASI JAM, BATERAI & JARINGAN
// ==========================================
function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('id-ID', { hour12: false });
  document.getElementById('clock-display').textContent = `🕒 ${timeString}`;
}
setInterval(updateClock, 1000);
updateClock();

// Status Baterai
if ('getBattery' in navigator) {
  navigator.getBattery().then((battery) => {
    function updateBattery() {
      const level = Math.round(battery.level * 100);
      const charging = battery.charging ? '⚡' : '🔋';
      document.getElementById('battery-display').textContent = `${charging} ${level}%`;
    }
    updateBattery();
    battery.addEventListener('levelchange', updateBattery);
    battery.addEventListener('chargingchange', updateBattery);
  });
}

// Status Jaringan
function updateNetwork() {
  const netEl = document.getElementById('network-display');
  if (navigator.onLine) {
    netEl.textContent = '📶 Online';
    netEl.style.color = '#4ade80';
  } else {
    netEl.textContent = '❌ Offline';
    netEl.style.color = '#f87171';
    playAlertSound();
  }
}
window.addEventListener('online', updateNetwork);
window.addEventListener('offline', updateNetwork);
updateNetwork();

// ==========================================
// 3. TOMBOL REFRESH & KELUAR (PASSWORD: xyz)
// ==========================================
document.getElementById('btn-refresh').addEventListener('click', () => {
  const iframe = document.getElementById('exam-frame');
  iframe.src = iframe.src;
});

const exitModal = document.getElementById('exit-modal');
const exitInput = document.getElementById('exit-password');
const errorMsg = document.getElementById('error-msg');

document.getElementById('btn-exit').addEventListener('click', () => {
  playAlertSound(); // Bunyikan suara saat tombol keluar ditekan
  exitModal.classList.remove('hidden');
  exitInput.value = '';
  errorMsg.classList.add('hidden');
  exitInput.focus();
});

document.getElementById('btn-cancel-exit').addEventListener('click', () => {
  exitModal.classList.add('hidden');
});

document.getElementById('btn-confirm-exit').addEventListener('click', validateExit);
exitInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') validateExit();
});

function validateExit() {
  if (exitInput.value === 'xyz') {
    window.close(); // Tutup jendela ujian
  } else {
    playAlertSound();
    errorMsg.classList.remove('hidden');
    exitInput.value = '';
    exitInput.focus();
  }
}

// ==========================================
// 4. KAMERA DEPAN & FITUR GESER (DRAGGABLE)
// ==========================================
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });
    document.getElementById('webcam-video').srcObject = stream;
  } catch (err) {
    alert("Peringatan: Kamera wajib diaktifkan untuk mengikuti ujian!");
    playAlertSound();
  }
}
startCamera();

// Logika Geser Kotak Kamera
const cameraBox = document.getElementById('camera-box');
const cameraHeader = document.getElementById('camera-header');
let isDragging = false, offsetX = 0, offsetY = 0;

cameraHeader.addEventListener('mousedown', (e) => {
  isDragging = true;
  offsetX = e.clientX - cameraBox.getBoundingClientRect().left;
  offsetY = e.clientY - cameraBox.getBoundingClientRect().top;
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  let newX = e.clientX - offsetX;
  let newY = e.clientY - offsetY;

  // Batasi agar kamera tidak keluar dari layar
  newX = Math.max(0, Math.min(window.innerWidth - cameraBox.offsetWidth, newX));
  newY = Math.max(45, Math.min(window.innerHeight - cameraBox.offsetHeight, newY));

  cameraBox.style.left = newX + 'px';
  cameraBox.style.top = newY + 'px';
  cameraBox.style.right = 'auto';
  cameraBox.style.bottom = 'auto';
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

// ==========================================
// 5. ANTI COPY, ANTI KLIK KANAN, ANTI SCREENSHOT & DETEKSI TOMBOL
// ==========================================
// Anti Klik Kanan
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  playAlertSound();
});

// Anti Copy, Cut, Paste
['copy', 'cut', 'paste'].forEach(evt => {
  document.addEventListener(evt, (e) => {
    e.preventDefault();
    playAlertSound();
  });
});

// Deteksi Tombol Tidak Diperlukan & Shortcut Screenshot/DevTools
document.addEventListener('keydown', (e) => {
  // Jika modal password sedang terbuka, izinkan mengetik password
  if (!exitModal.classList.contains('hidden')) return;

  // Daftar tombol/kombinasi yang dilarang keras
  const forbiddenKeys = [
    'PrintScreen', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 
    'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Escape', 'ContextMenu'
  ];

  // Cek tombol fungsi, Ctrl/Alt/Meta (tombol Search/Launcher di Chromebook), atau PrintScreen
  if (
    forbiddenKeys.includes(e.key) ||
    e.ctrlKey || 
    e.altKey || 
    e.metaKey
  ) {
    e.preventDefault();
    playAlertSound();

    // Kosongkan clipboard jika user mencoba menekan PrintScreen
    if (e.key === 'PrintScreen' && navigator.clipboard) {
      navigator.clipboard.writeText('');
    }
  }
});

// Anti Rekam Layar / Pindah Fokus Jendela
window.addEventListener('blur', () => {
  playAlertSound();
});

// Paksa tetap Fullscreen jika user mencoba keluar dari fullscreen
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    playAlertSound();
    document.documentElement.requestFullscreen().catch(() => {});
  }
});

// Blokir API Screen Capture (getDisplayMedia) di dalam halaman
if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
  navigator.mediaDevices.getDisplayMedia = function() {
    playAlertSound();
    return Promise.reject(new Error("Perekaman layar diblokir oleh sistem ujian."));
  };
}
