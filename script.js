// 1. Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('[EDFI PWA] Service Worker registered!', reg))
      .catch(err => console.error('[EDFI PWA] Service Worker failed:', err));
  });
}

// 2. Global State & DOM elements
let deferredPrompt;
const installDrawer = document.getElementById('pwa-install-drawer');
const installBtn = document.getElementById('installBtn'); // floating toolbar button
const drawerInstallBtn = document.getElementById('drawerInstallBtn'); // drawer action button
const drawerCancelBtn = document.getElementById('drawerCancelBtn'); // drawer cancel button
const androidSection = document.getElementById('pwa-android-section');
const iosSection = document.getElementById('pwa-ios-section');
const iosCloseBtn = document.getElementById('iosCloseBtn');
const offlineBadge = document.getElementById('offlineBadge');

// 3. Connection State Monitoring
function updateConnectionStatus() {
  if (offlineBadge) {
    if (navigator.onLine) {
      offlineBadge.classList.remove('visible');
    } else {
      offlineBadge.classList.add('visible');
    }
  }
}
window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);
updateConnectionStatus(); // initial check

// 4. Platform Detection Helpers
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

// 5. Native Installer Logic (Android, Chrome, Edge)
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent standard browser dialogue
  e.preventDefault();
  // Stash the event
  deferredPrompt = e;
  
  // Show standard buttons & toolbar if not in standalone
  if (!isStandalone && installBtn) {
    installBtn.classList.remove('hidden');
    
    // Auto show drawer after 2 seconds if not previously dismissed
    const dismissed = localStorage.getItem('pwa-android-dismissed');
    if (!dismissed) {
      setTimeout(() => {
        showAndroidPrompt();
      }, 2000);
    }
  }
});

function showAndroidPrompt() {
  if (!deferredPrompt || !installDrawer || !androidSection || !iosSection) return;
  androidSection.classList.remove('hidden');
  iosSection.classList.add('hidden');
  installDrawer.classList.add('show');
}

// Bind Action Buttons
if (installBtn) {
  installBtn.addEventListener('click', () => {
    if (deferredPrompt) {
      showAndroidPrompt();
    } else if (isIOS && !isStandalone) {
      showIosPrompt();
    } else {
      // General instructions fallback
      alert("To install, use your browser's menu option 'Add to Home screen' or 'Install'.");
    }
  });
}

if (drawerInstallBtn) {
  drawerInstallBtn.addEventListener('click', () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('[EDFI PWA] User accepted the install prompt');
        if (installBtn) installBtn.classList.add('hidden');
      } else {
        console.log('[EDFI PWA] User dismissed the install prompt');
      }
      hideInstallDrawer();
      deferredPrompt = null;
    });
  });
}

if (drawerCancelBtn) {
  drawerCancelBtn.addEventListener('click', () => {
    hideInstallDrawer();
    localStorage.setItem('pwa-android-dismissed', 'true');
  });
}

function hideInstallDrawer() {
  if (installDrawer) installDrawer.classList.remove('show');
  
  const existingIndicator = document.getElementById('ios-bouncing-indicator');
  if (existingIndicator) {
    existingIndicator.remove();
  }
}

// 6. iOS Installation Guidance Flow
function showIosPrompt() {
  if (!installDrawer || !androidSection || !iosSection) return;
  androidSection.classList.add('hidden');
  iosSection.classList.remove('hidden');
  installDrawer.classList.add('show');
  
  // Create and inject bouncing indicator pointing to Safari's action bar at bottom
  if (!document.getElementById('ios-bouncing-indicator')) {
    const indicator = document.createElement('div');
    indicator.id = 'ios-bouncing-indicator';
    indicator.className = 'ios-bouncing-indicator';
    indicator.innerHTML = `
      <div class="ios-indicator-glow"></div>
      <div class="ios-indicator-arrow"></div>
    `;
    document.body.appendChild(indicator);
  }
}

// Trigger iOS specific onboarding automatically
if (isIOS && !isStandalone) {
  if (installBtn) {
    installBtn.innerText = "Install Magazine";
    installBtn.classList.remove('hidden');
  }
  
  const dismissed = localStorage.getItem('pwa-ios-dismissed');
  if (!dismissed) {
    setTimeout(() => {
      showIosPrompt();
    }, 2500);
  }
}

if (iosCloseBtn) {
  iosCloseBtn.addEventListener('click', () => {
    hideInstallDrawer();
    localStorage.setItem('pwa-ios-dismissed', 'true');
  });
}

// 7. Success Tracking
window.addEventListener('appinstalled', (evt) => {
  console.log('[EDFI PWA] App installed successfully!');
  if (installBtn) installBtn.classList.add('hidden');
  hideInstallDrawer();
});