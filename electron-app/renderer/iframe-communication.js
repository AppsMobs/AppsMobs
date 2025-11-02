// Communication avec l'iframe script-editor
console.log('Chargement du script de communication...');

// Garde pour éviter le double-binding
if (!window.__iframeHandlersBound) {
  window.__iframeHandlersBound = true;

  // Écouteur global de secours (fonctionne même si l'event load de l'iframe n'a pas encore été reçu)
  window.addEventListener('message', function(event) {
    try {
      if (event.data && event.data.type === 'request-devices') {
        const serials = (window.currentDeviceSerials || []);
        const iframe = document.getElementById('script-editor-iframe');
        if (iframe) iframe.contentWindow.postMessage({ type:'set-devices', devices: serials }, '*');
      } else if (event.data && event.data.type === 'capture-screenshot') {
        const serial = event.data.serial;
        if (window.electronAPI && window.electronAPI.captureScreenshot) {
          window.electronAPI.captureScreenshot(serial).then(async (result) => {
            // Ne pas ouvrir automatiquement; renvoyer le résultat à l'iframe
            const iframe = document.getElementById('script-editor-iframe');
            if (iframe) iframe.contentWindow.postMessage({ type:'capture-screenshot-result', result }, '*');
          });
        }
      } else if (event.data && event.data.type === 'open-file') {
        const p = event.data.path;
        if (p && window.electronAPI && window.electronAPI.openFile) {
          window.electronAPI.openFile(p);
        }
      }
    } catch {}
  });
}

// Attendre que l'iframe soit chargée
document.getElementById('script-editor-iframe').addEventListener('load', function() {
  console.log('Iframe script-editor chargée');
  
  // Dès le chargement, pousser la liste si disponible
  try {
    const serials = (window.currentDeviceSerials || []);
    if (serials.length) {
      document.getElementById('script-editor-iframe').contentWindow.postMessage({
        type: 'set-devices',
        devices: serials
      }, '*');
    }
  } catch {}
});

console.log('Script de communication chargé');
