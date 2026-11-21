// 1. Service Worker Registration & Immediate Auto-Update
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => {
        console.log('[EDFI PWA] Service Worker registered!', reg);

        // Force immediate check on launch
        reg.update();

        // Also check whenever the user returns to the app from background
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            reg.update();
          }
        });

        // If an updated worker is already waiting, activate immediately
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        // When a new update is found, activate as soon as installed
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      })
      .catch(err => console.error('[EDFI PWA] Service Worker failed:', err));
  });
}

// 2. Global State & DOM elements
let deferredPrompt = null;
const installDrawer = document.getElementById('pwa-install-drawer');
const installBtn = document.getElementById('installBtn'); // floating toolbar button
const drawerInstallBtn = document.getElementById('drawerInstallBtn'); // drawer action button
const drawerCancelBtn = document.getElementById('drawerCancelBtn'); // drawer cancel button
const androidSection = document.getElementById('pwa-android-section');
const androidManualSection = document.getElementById('pwa-android-manual-section');
const androidManualCloseBtn = document.getElementById('androidManualCloseBtn');
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
const isAndroid = /Android/i.test(navigator.userAgent);
const isInAppBrowser = /FBAN|FBAV|Instagram|WhatsApp|Twitter|Line|Snapchat|MicroMessenger/i.test(navigator.userAgent);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

// 5. Always make Install Button available if not already installed
if (!isStandalone && installBtn) {
  installBtn.classList.remove('hidden');
}

// 6. Native Installer Logic (Android, Chrome, Edge)
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent standard browser mini-infobar
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  
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

function hideAllSections() {
  if (androidSection) androidSection.classList.add('hidden');
  if (androidManualSection) androidManualSection.classList.add('hidden');
  if (iosSection) iosSection.classList.add('hidden');
}

function showAndroidPrompt() {
  if (!installDrawer) return;
  hideAllSections();
  if (androidSection) androidSection.classList.remove('hidden');
  installDrawer.classList.add('show');
}

function showAndroidManualPrompt() {
  if (!installDrawer) return;
  hideAllSections();
  if (androidManualSection) androidManualSection.classList.remove('hidden');
  installDrawer.classList.add('show');
}

// Bind Action Buttons
if (installBtn) {
  installBtn.addEventListener('click', () => {
    if (deferredPrompt) {
      // 1-Click native install on supported Android/Chrome
      showAndroidPrompt();
    } else if (isIOS && !isStandalone) {
      // Step-by-step iOS Safari visual guide
      showIosPrompt();
    } else {
      // Android in-app browser, non-Chrome, or fallback guide
      showAndroidManualPrompt();
    }
  });
}

if (drawerInstallBtn) {
  drawerInstallBtn.addEventListener('click', () => {
    if (!deferredPrompt) {
      showAndroidManualPrompt();
      return;
    }
    
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

if (androidManualCloseBtn) {
  androidManualCloseBtn.addEventListener('click', () => {
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

// 7. iOS Installation Guidance Flow
function showIosPrompt() {
  if (!installDrawer || !iosSection) return;
  hideAllSections();
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

// 8. Success Tracking
window.addEventListener('appinstalled', (evt) => {
  console.log('[EDFI PWA] App installed successfully!');
  if (installBtn) installBtn.classList.add('hidden');
  hideInstallDrawer();
});