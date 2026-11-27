// Anti Klik Kanan Menyeluruh (Capture Phase)
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
