// CSS imports
import '../styles/styles.css';
import '../styles/responsives.css';
import 'tiny-slider/dist/tiny-slider.css';
import 'leaflet/dist/leaflet.css';

// Components
import App from './pages/app';
import { registerServiceWorker } from './utils';
import Camera from './utils/camera';

document.addEventListener('DOMContentLoaded', async () => {
  window.app = new App({
    content: document.getElementById('main-content'),
    drawerButton: document.getElementById('drawer-button'),
    drawerNavigation: document.getElementById('navigation-drawer'),
    skipLinkButton: document.getElementById('skip-link'),
  });
  const skipLink = document.getElementById('skip-link');
  const mainContent = document.getElementById('main-content');
  
  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    mainContent.focus();
  });
  skipLink.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      mainContent.focus();
    }
  });
  await window.app.renderPage();
await registerServiceWorker();
// for demonstration purpose-only
  console.log('Berhasil mendaftarkan service worker.');
 
  window.addEventListener('hashchange', async () => {
    await app.renderPage();
      // Stop all active media
    Camera.stopAllStreams();
  });
});