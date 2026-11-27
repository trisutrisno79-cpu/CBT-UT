// ==========================================
// 1. GENERATOR SUARA PERINGATAN (Web Audio API)
// ==========================================
function playAlertSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(920, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(420, audioCtx.currentTime + 0.45);

    gainNode.gain.setValueAtTime(0.6, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.45);
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
// 3. FITUR ZOOM IN, ZOOM OUT & RESET ZOOM
// ==========================================
let currentZoom = 100;
const minZoom = 50;
const maxZoom = 200;
const zoomStep = 10;

const examFrame = document.getElementById('exam-frame');
const zoomLevelText = document.getElementById('zoom-level');

function applyZoom() {
  const scale = currentZoom / 100;
  // Gunakan kombinasi zoom & transform agar kompatibel di semua halaman web
  examFrame.style.zoom = scale;
  examFrame.style.transform = `scale(${scale})`;
  examFrame.style.transformOrigin = '0 0';
  examFrame.style.width = `${100 / scale}%`;
  examFrame.style.height = `${100 / scale}%`;
  zoomLevelText.textContent = `${currentZoom}%`;
}

document.getElementById('btn-zoom-in').addEventListener('click', (e) => {
  e.stopPropagation();
  if (currentZoom < maxZoom) {
    currentZoom += zoomStep;
    applyZoom();
  }
});

document.getElementById('btn-zoom-out').addEventListener('click', (e) => {
  e.stopPropagation();
  if (currentZoom > minZoom) {
    currentZoom -= zoomStep;
    applyZoom();
  }
});

zoomLevelText.addEventListener('click', (e) => {
  e.stopPropagation();
  currentZoom = 100;
  applyZoom();
});

// ==========================================
// 4. TOMBOL INFO, REFRESH & KELUAR (PASSWORD: xyz)
// ==========================================
const infoModal = document.getElementById('info-modal');
document.getElementById('btn-info').addEventListener('click', () => {
  infoModal.classList.remove('hidden');
});

document.getElementById('btn-close-info').addEventListener('click', () => {
  infoModal.classList.add('hidden');
});

document.getElementById('btn-refresh').addEventListener('click', () => {
  examFrame.src = examFrame.src;
});

const exitModal = document.getElementById('exit-modal');
const exitInput = document.getElementById('exit-password');
const errorMsg = document.getElementById('error-msg');
let isAuthorizedExit = false;

document.getElementById('btn-exit').addEventListener('click', () => {
  playAlertSound();
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
    isAuthorizedExit = true;
    window.close();
  } else {
    playAlertSound();
    errorMsg.classList.remove('hidden');
    exitInput.value = '';
    exitInput.focus();
  }
}

// ==========================================
// 5. KAMERA DEPAN & FITUR GESER (DRAGGABLE)
// ==========================================
let isCameraReady = false;

async function startCamera() {
  const videoEl = document.getElementById('webcam-video');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });
    videoEl.srcObject = stream;
    await videoEl.play();
    isCameraReady = true;
  } catch (err) {
    console.error("Error kamera:", err);
    isCameraReady = true; // Tetap aktifkan kunci fokus setelah dialog selesai
  }
}
startCamera();

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

  newX = Math.max(0, Math.min(window.innerWidth - cameraBox.offsetWidth, newX));
  newY = Math.max(50, Math.min(window.innerHeight - cameraBox.offsetHeight, newY));

  cameraBox.style.left = newX + 'px';
  cameraBox.style.top = newY + 'px';
  cameraBox.style.right = 'auto';
  cameraBox.style.bottom = 'auto';
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

// ==========================================
// 6. ALWAYS ON TOP, DETEKSI TIDAK FOKUS & ANTI CHEAT
// ==========================================
window.addEventListener('blur', () => {
  if (isAuthorizedExit || !isCameraReady) return;
  playAlertSound();
  window.focus();
  if (chrome && chrome.windows) {
    chrome.windows.getCurrent((win) => {
      chrome.windows.update(win.id, { focused: true, state: "fullscreen" });
    });
  }
});

setInterval(() => {
  if (isAuthorizedExit || !isCameraReady) return;
  if (!document.hasFocus()) {
    playAlertSound();
    window.focus();
    if (chrome && chrome.windows) {
      chrome.windows.getCurrent((win) => {
        chrome.windows.update(win.id, { focused: true, state: "fullscreen" });
      });
    }
  }
}, 800);

// Anti Klik Kanan Menyeluruh
const disableRightClick = (e) => {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  playAlertSound();
  return false;
};

window.addEventListener('contextmenu', disableRightClick, true);
document.addEventListener('contextmenu', disableRightClick, true);

['mousedown', 'mouseup', 'auxclick'].forEach((evt) => {
  window.addEventListener(evt, (e) => {
    if (e.button === 2) {
      e.preventDefault();
      e.stopPropagation();
      playAlertSound();
    }
  }, true);
});

// Anti Copy, Cut, Paste
['copy', 'cut', 'paste'].forEach(evt => {
  document.addEventListener(evt, (e) => {
    e.preventDefault();
    playAlertSound();
  });
});

// Deteksi Tombol Tidak Diperlukan & Shortcut
document.addEventListener('keydown', (e) => {
  if (!exitModal.classList.contains('hidden')) return;

  const forbiddenKeys = [
    'PrintScreen', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 
    'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Escape', 'ContextMenu'
  ];

  if (
    forbiddenKeys.includes(e.key) ||
    e.ctrlKey || 
    e.altKey || 
    e.metaKey
  ) {
    e.preventDefault();
    playAlertSound();

    if (e.key === 'PrintScreen' && navigator.clipboard) {
      navigator.clipboard.writeText('');
    }
  }
});

// Paksa tetap Fullscreen
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && !isAuthorizedExit) {
    playAlertSound();
    document.documentElement.requestFullscreen().catch(() => {});
  }
});

// Blokir API Screen Capture
if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
  navigator.mediaDevices.getDisplayMedia = function() {
    playAlertSound();
    return Promise.reject(new Error("Perekaman layar diblokir oleh sistem ujian."));
  };
}
