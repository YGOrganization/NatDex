// main.js
import { renderCardGrid } from './renderer.js'; 
// IMPORTANT: no ?v=7, no VirtualScroller import

async function loadData() {
  try {
    const response = await fetch('./data.json'); // no version number
    if (!response.ok) {
      console.error('Failed to load card data:', response.status, response.statusText);
      return [];
    }
    return await response.json();
  } catch (err) {
    console.error('Error loading data.json:', err);
    return [];
  }
}

function isAdminMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('admin') === '1';
}

(async () => {
  const data = await loadData();
  const container = document.getElementById('card-grid');
  const admin = isAdminMode();

  // Render everything directly into the page
  renderCardGrid(data, container, admin);
})();
