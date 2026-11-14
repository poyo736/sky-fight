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
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(console.warn));
  }
})();
