console.log("main.js loaded");

import { VirtualScroller } from './virtualScroller.js';

// MVP: no admin login yet
const isAdmin = false;

// ---------------------------------------------
// Store full dataset + current scroller
// ---------------------------------------------
let fullData = [];
let scroller = null;

// ---------------------------------------------
// Convert wildcard pattern to regex
// ---------------------------------------------
function patternToRegex(pattern) {
  // Escape regex special chars except *
  const escaped = pattern.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&');
  // Convert * to .*
  const regexPattern = escaped.replace(/\*/g, '.*');
  return new RegExp(regexPattern, 'i'); // match anywhere, case-insensitive
}

// ---------------------------------------------
// Apply search filter (WITH layout wait fix)
// ---------------------------------------------
async function applySearchFilter(pattern) {
  if (!fullData.length) return;

  const regex = patternToRegex(pattern);

  const filtered = fullData.filter(card =>
    regex.test(card.name) // adjust if your field is different
  );

  const container = document.getElementById('card-grid');
  container.innerHTML = ""; // clear old content

  // ⭐ WAIT FOR LAYOUT TO SETTLE BEFORE INITIALIZING
  await new Promise(resolve => requestAnimationFrame(() => {
    requestAnimationFrame(resolve);
  }));

  scroller = new VirtualScroller(container, filtered, isAdmin);
}

// ---------------------------------------------
// Load data + initialize scroller
// ---------------------------------------------
async function loadData() {
  try {
    const response = await fetch('./data.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const container = document.getElementById('card-grid');

    // Store full dataset
    fullData = data;

    // Wait for DOM + CSS + layout to fully settle
    await new Promise(resolve => requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    }));

    // Initialize the virtual scroller
    scroller = new VirtualScroller(container, data, isAdmin);

  } catch (err) {
    console.error('Failed to load data.json:', err);
    const container = document.getElementById('card-grid');
    if (container) {
      container.textContent = 'Failed to load card data.';
    }
  }
}

// ---------------------------------------------
// Start the app
// ---------------------------------------------
window.addEventListener("DOMContentLoaded", loadData);

window.addEventListener("DOMContentLoaded", () => {
  // Back to top
  const btn = document.getElementById("back-to-top");
  if (btn) {
    btn.addEventListener("click", () => window.scrollTo(0, 0));
  }

  // Search filter
  const searchInput = document.getElementById("filter-text");
  if (searchInput) {
    let debounceTimer = null;

    searchInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        applySearchFilter(searchInput.value);
      }, 200);
    });
  }
});
