import { VirtualScroller } from './virtualScroller.js?v=4';

// MVP: no admin login yet
const isAdmin = false;

async function loadData() {
  try {
    const response = await fetch('./data.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const container = document.getElementById('card-grid');

    // Initialize virtual scroller (async constructor)
    await new VirtualScroller(container, data, isAdmin);

    // Always start at the top
    window.scrollTo(0, 0);
  } catch (err) {
    console.error('Failed to load data.json:', err);
    const container = document.getElementById('card-grid');
    if (container) {
      container.textContent = 'Failed to load card data.';
    }
  }
}

// Start the app
loadData();
// Wait for DOM + CSS + layout to fully settle
await new Promise(resolve => requestAnimationFrame(() => {
  requestAnimationFrame(resolve);
}));

// Now initialize the scroller
await new VirtualScroller(container, data, isAdmin);

// Ensure we start at the top
window.scrollTo(0, 0);
