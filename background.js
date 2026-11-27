function launchExam() {
  chrome.windows.create({
    url: chrome.runtime.getURL("exam.html"),
    type: "popup",
    state: "fullscreen"
  });
}

// Buka otomatis saat ekstensi pertama kali diinstal atau diaktifkan
chrome.runtime.onInstalled.addListener(() => {
  launchExam();
});

// Buka saat ikon ekstensi diklik
chrome.action.onClicked.addListener(() => {
  launchExam();
});
