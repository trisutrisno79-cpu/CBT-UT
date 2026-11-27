// Suntikkan proteksi langsung ke dalam halaman ujian (suo.ut.ac.id)
(function () {
  // 1. Blokir total menu dan fungsi klik kanan (capture phase)
  const blockContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
  };

  window.addEventListener('contextmenu', blockContextMenu, true);
  document.addEventListener('contextmenu', blockContextMenu, true);

  // Blokir klik mouse tombol kanan (button === 2) pada mousedown & mouseup
  ['mousedown', 'mouseup', 'auxclick'].forEach((evt) => {
    window.addEventListener(evt, (e) => {
      if (e.button === 2) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    }, true);
  });

  // 2. Blokir Copy, Cut, Paste, dan Drag teks/gambar di dalam soal
  ['copy', 'cut', 'paste', 'dragstart', 'selectstart'].forEach((evt) => {
    document.addEventListener(evt, (e) => {
      // Tetap izinkan mengetik/memilih di kolom input jawaban esai/login
      const tag = e.target && e.target.tagName;
      if (evt === 'selectstart' && (tag === 'INPUT' || tag === 'TEXTAREA')) return;

      e.preventDefault();
      e.stopPropagation();
      return false;
    }, true);
  });

  // 3. Blokir tombol ContextMenu keyboard & shortcut Inspect Element / View Source
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'ContextMenu' ||
      e.key === 'F12' ||
      (e.shiftKey && e.key === 'F10') ||
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) ||
      (e.ctrlKey && ['u', 'U', 's', 'S', 'p', 'P'].includes(e.key))
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);
})();
