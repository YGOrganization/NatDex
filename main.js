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
// Wait for FULL layout stability (Option C)
// ---------------------------------------------
async function waitForStableLayout() {
  // DOM + CSS layout
  await new Promise(resolve => requestAnimationFrame(() => {
    requestAnimationFrame(resolve);
  }));

  // Images, fonts, final layout pass
  if (document.readyState === "complete") {
    return;
  }

  await new Promise(resolve => {
    window.addEventListener("load", resolve, { once: true });
  });
}

// ---------------------------------------------
// Apply search filter (with container replacement + full layout wait)
// ---------------------------------------------
async function applySearchFilter(pattern) {
  if (!fullData.length) return;

  const regex = patternToRegex(pattern);
  console.log("fullData length before filter:", fullData.length);

  const filtered = fullData.filter(card =>
    regex.test(card.name)
  );
  console.log("filtered length:", filtered.length);

  const oldContainer = document.getElementById('card-grid');

  // Destroy old scroller
  destroyScroller();

  // Replace container entirely
  const newContainer = oldContainer.cloneNode(false);
  oldContainer.replaceWith(newContainer);

  // Wait for full layout stability
  await waitForStableLayout();
// ⭐ Wait for all images to load so card height is correct
await Promise.all(
  Array.from(document.images)
    .filter(img => !img.complete)
    .map(img => new Promise(resolve => {
      img.onload = img.onerror = resolve;
    }))
);

  console.log("fullData length after filter (should be unchanged):", fullData.length);

  // Initialize scroller cleanly
  // Force a grid reflow to ensure correct column count
newContainer.style.display = "none";
newContainer.offsetHeight; // force reflow
newContainer.style.display = "";
  scroller = new VirtualScroller(newContainer, filtered, isAdmin);
}

// ---------------------------------------------
// Load data + initialize scroller (Option C)
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

    // Wait for full layout stability
    await waitForStableLayout();
    // ⭐ Wait for all images to load so card height is correct
await Promise.all(
  Array.from(document.images)
    .filter(img => !img.complete)
    .map(img => new Promise(resolve => {
      img.onload = img.onerror = resolve;
    }))
);

    destroyScroller();
    
// ⭐ Force a grid reflow before initializing VirtualScroller
container.style.display = "none";
container.offsetHeight; // forces reflow
container.style.display = "";

// Now initialize the scroller with correct measurements
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
// Start the app (Option C)
// ---------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  // Wait for full load before initializing data
  window.addEventListener("load", loadData, { once: true });
});

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
