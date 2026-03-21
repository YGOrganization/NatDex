import { VirtualScroller } from './virtualScroller.js';

// MVP: no admin login yet
const isAdmin = false;

async function loadData() {
  try {
    const response = await fetch('./data.json');
    const data = await response.json();

    const container = document.getElementById('card-grid');

    await new VirtualScroller(container, data, isAdmin);

    // Force scroll to top on load
    window.scrollTo(0, 0);

  } catch (err) {
    console.error("Failed to load data.json:", err);
  }
}
