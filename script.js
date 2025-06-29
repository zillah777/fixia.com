// PWA Installation and Service Worker Registration
let deferredPrompt;
const installButton = document.getElementById('installButton');

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// PWA Install Prompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installButton.style.display = 'block';
});

installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
        installButton.style.display = 'none';
    }
});

// Handle successful installation
window.addEventListener('appinstalled', (evt) => {
    console.log('PWA was installed');
    installButton.style.display = 'none';
});

// Online/Offline Status
function updateOnlineStatus() {
    const offlineIndicator = document.getElementById('offlineIndicator') || createOfflineIndicator();
    
    if (navigator.onLine) {
        offlineIndicator.classList.remove('show');
    } else {
        offlineIndicator.classList.add('show');
    }
}

function createOfflineIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'offlineIndicator';
    indicator.className = 'offline-indicator';
    indicator.textContent = 'Sin conexión - Funcionando en modo offline';
    document.body.insertBefore(indicator, document.body.firstChild);
    return indicator;
}

// Listen for online/offline events
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Initial status check
document.addEventListener('DOMContentLoaded', () => {
    updateOnlineStatus();
});

// App functionality
class ServiplayApp {
    constructor() {
        this.init();
    }
    
    init() {
        console.log('Serviplay PWA inicializada');
        this.addEventListeners();
    }
    
    addEventListeners() {
        // Add any specific app event listeners here
    }
}

// Initialize app
const app = new ServiplayApp();