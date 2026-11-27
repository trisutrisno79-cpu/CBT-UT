let examWindowId = null;
const examUrl = chrome.runtime.getURL("exam.html");

function launchExam() {
  if (examWindowId !== null) {
    chrome.windows.update(examWindowId, { focused: true, state: "fullscreen" }, () => {
      if (chrome.runtime.lastError) {
        examWindowId = null;
        createExamWindow();
      }
    });
  } else {
    createExamWindow();
  }
}

function createExamWindow() {
  chrome.windows.create({
    url: examUrl,
    type: "popup",
    state: "fullscreen",
    focused: true
  }, (win) => {
    examWindowId = win.id;
  });
}

// Buka otomatis saat diinstal atau ikon diklik
chrome.runtime.onInstalled.addListener(launchExam);
chrome.action.onClicked.addListener(launchExam);

// Tutup tab lain jika user mencoba membuka tab/browser baru saat ujian aktif
chrome.tabs.onCreated.addListener((tab) => {
  if (examWindowId !== null && tab.windowId !== examWindowId) {
    chrome.tabs.remove(tab.id).catch(() => {});
    chrome.windows.update(examWindowId, { focused: true, state: "fullscreen" }).catch(() => {});
  }
});

// Paksa jendela ujian selalu di paling depan (Always on Top) jika kehilangan fokus
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (examWindowId !== null && windowId !== examWindowId) {
    chrome.windows.update(examWindowId, { focused: true, state: "fullscreen" }, () => {
      if (chrome.runtime.lastError) {
        examWindowId = null;
      }
    });
  }
});

// Reset ID saat jendela ujian ditutup dengan password yang benar
chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === examWindowId) {
    examWindowId = null;
  }
});
