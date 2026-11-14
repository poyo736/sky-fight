// Mobile controls mirror the existing keyboard controls; the combat engine is unchanged.
(() => {
  const active = new Map();
  const send = (key, type) => window.dispatchEvent(new KeyboardEvent(type, {key, bubbles:true, cancelable:true}));
  document.querySelectorAll('#touchControls [data-key]').forEach(button => {
    const key = button.dataset.key;
    const release = (event) => {
      if (!active.has(button)) return;
      if (event) event.preventDefault();
      active.delete(button); button.classList.remove('pressed'); send(key,'keyup');
    };
    button.addEventListener('pointerdown', event => {
      event.preventDefault(); if (active.has(button)) return;
      button.setPointerCapture?.(event.pointerId);
      active.set(button, event.pointerId); button.classList.add('pressed'); send(key,'keydown');
    });
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
    button.addEventListener('contextmenu', event => event.preventDefault());
  });
  window.addEventListener('blur', () => {
    for (const button of active.keys()) {button.classList.remove('pressed'); send(button.dataset.key,'keyup');}
    active.clear();
  });
  // The battle section itself becomes fullscreen, retaining the HUD, arena,
  // on-screen mobile controls, and the replay/home buttons.
  const battle = document.getElementById('battle');
  const fullscreenButton = document.getElementById('fullscreenButton');
  const syncFullscreen = () => {
    const active = document.fullscreenElement === battle || document.webkitFullscreenElement === battle;
    fullscreenButton.textContent = active ? '⛶ 全画面を終了' : '⛶ 全画面表示';
    fullscreenButton.setAttribute('aria-pressed', String(active));
  };
  fullscreenButton?.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } else if (battle.requestFullscreen) await battle.requestFullscreen();
      else if (battle.webkitRequestFullscreen) battle.webkitRequestFullscreen();
      else { fullscreenButton.textContent = '画面いっぱいで表示中'; }
    } catch (error) { console.warn('Fullscreen unavailable:', error); }
    syncFullscreen();
  });
  document.addEventListener('fullscreenchange', syncFullscreen);
  document.addEventListener('webkitfullscreenchange', syncFullscreen);
  document.getElementById('battleHomeButton')?.addEventListener('click', () => {
    if (document.fullscreenElement === battle) document.exitFullscreen?.().catch(()=>{});
  });
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(console.warn));
  }
})();
