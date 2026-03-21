import { VirtualScroller } from './virtualScroller.js';

// MVP: no admin login yet
const isAdmin = false;

async function loadData() {
  try {
    const response = await fetch('./data.json');
    const data = await response.json();

    const container = document.getElementById('card-grid');

    // Activate virtual scrolling (async constructor)
    await new VirtualScroller(container, data, isAdmin);

  } catch (err) {
    console.error("Failed to load data.json:", err);
  }
}

// Start the app
loadData();
