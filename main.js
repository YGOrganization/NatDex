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
// Active filters
// ---------------------------------------------
let activeTextFilter = "";
let activeTypeFilter = "all";

// ---------------------------------------------
// Dropdown → color mapping (EXACT data.json strings)
// ---------------------------------------------
const typeFilterMap = {
  "all": "all",
  "tcg": ["White", "Green"],
  "rush": ["Yellow"],
  "real": ["White", "Yellow", "Green"],
  "fake": ["Light Grey", "Magenta", "Blue", "Dark Grey", "Black"],
  "token": ["Light Grey"],
  "vg": ["Blue"],
  "manga": ["Magenta"],
  "nope": ["Tan", "Magenta", "Dark Grey"]
};

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
// Wait for FULL layout stability
// ---------------------------------------------
async function waitForStableLayout() {
  await new Promise(resolve => requestAnimationFrame(() => {
    requestAnimationFrame(resolve);
  }));

  if (document.readyState === "complete") {
    return;
  }

  await new Promise(resolve => {
    window.addEventListener("load", resolve, { once: true });
  });
}

// ---------------------------------------------
// Apply BOTH filters (dropdown + text)
// ---------------------------------------------
async function applyCombinedFilters() {
  let filtered = fullData;

  // 1. Apply type filter
  if (activeTypeFilter !== "all") {
    const allowedColors = typeFilterMap[activeTypeFilter];
    filtered = filtered.filter(card => allowedColors.includes(card.color));
  }

  // 2. Apply text filter
  if (activeTextFilter.trim() !== "") {
    const regex = patternToRegex(activeTextFilter);
    filtered = filtered.filter(card => regex.test(card.name));
  }

  // 3. Rebuild scroller using the SAFE pipeline
  const oldContainer = document.getElementById('card-grid');
  destroyScroller();

  const newContainer = oldContainer.cloneNode(false);
  oldContainer.replaceWith(newContainer);

  await waitForStableLayout();
  newContainer.offsetWidth;

  scroller = await new VirtualScroller(newContainer, filtered, isAdmin);
  scroller.calculateColumns();
  scroller.render();
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
    console.log("Loaded data length:", data.length);

    fullData = data;

    const container = document.getElementById('card-grid');

    await waitForStableLayout();

    destroyScroller();

    container.offsetWidth;

    scroller = await new VirtualScroller(container, data, isAdmin);
    scroller.calculateColumns();
    scroller.render();

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
window.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("load", loadData, { once: true });
});

window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("back-to-top");
  if (btn) {
    btn.addEventListener("click", () => window.scrollTo(0, 0));
  }

  // Text filter
  const searchInput = document.getElementById("filter-text");
  if (searchInput) {
    let debounceTimer = null;

    searchInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        activeTextFilter = searchInput.value;
        applyCombinedFilters();
      }, 200);
    });
  }

  // Dropdown filter
  const typeDropdown = document.getElementById("type-dropdown");
  if (typeDropdown) {
    typeDropdown.addEventListener("change", () => {
      activeTypeFilter = typeDropdown.value;
      applyCombinedFilters();
    });
  }
});
