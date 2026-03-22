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
// Destroy old scroller safely
// ---------------------------------------------
function destroyScroller() {
  if (scroller) {
    if (typeof scroller.destroy === "function") {
      scroller.destroy();
    }
    scroller = null;
  }
}

// ---------------------------------------------
// Convert wildcard pattern to regex
// ---------------------------------------------
function patternToRegex(pattern) {
  const escaped = pattern.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&');
  const regexPattern = escaped.replace(/\*/g, '.*');
  return new RegExp(regexPattern, 'i');
}

// ---------------------------------------------
// Apply search filter (WITH container replacement)
// ---------------------------------------------
async function applySearchFilter(pattern) {
  if (!fullData.length) return;

  const regex = patternToRegex(pattern);

  const filtered = fullData.filter(card =>
    regex.test(card.name)
  );

  const oldContainer = document.getElementById('card-grid');

  // ⭐ Destroy old scroller before replacing DOM node
  destroyScroller();

  // ⭐ Replace container entirely to remove stale measurement nodes
  const newContainer = oldContainer.cloneNode(false);
  oldContainer.replaceWith(newContainer);

  // ⭐ Wait for layout to settle
  await new Promise(resolve => requestAnimationFrame(() => {
    requestAnimationFrame(resolve);
  }));

  // ⭐ Create new scroller cleanly
  scroller = new VirtualScroller(newContainer, filtered, isAdmin);
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

    fullData = data;

    await new Promise(resolve => requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    }));

    destroyScroller();

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
  const btn = document.getElementById("back-to-top");
  if (btn) {
    btn.addEventListener("click", () => window.scrollTo(0, 0));
  }

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
