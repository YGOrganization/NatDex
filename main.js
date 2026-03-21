import { VirtualScroller } from './virtualScroller.js';
import { renderCardGrid } from './renderer.js';

async function loadData() {
  const response = await fetch('./data.json');
  return await response.json();
}

function isAdminMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('admin') === '1';
}

(async () => {
  const data = await loadData();
  const container = document.getElementById('card-grid');
  const admin = isAdminMode();

  new VirtualScroller(container, data, admin);
})();
