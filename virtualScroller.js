import { renderCardBlock } from './renderer.js?v=4';

/**
 * Production‑ready VirtualScroller for NatDex
 * ----------------------------------------------------
 * - Uses an inner grid so spacers never occupy columns
 * - Measures item height safely (never 0 or NaN)
 * - Prevents infinite scroll loops
 * - Handles resize + dynamic columns
 * - Only re-renders when needed
 */
export class VirtualScroller {
  constructor(container, data, isAdmin = false) {
    return (async () => {
      this.container = container;
      this.data = data;
      this.isAdmin = isAdmin;

      this.columns = 10;
      this.buffer = 5;
      this.itemHeight = 250; // safe fallback

      // Outer viewport (NOT a grid)
      this.viewport = document.createElement('div');
      this.viewport.className = 'vs-viewport';

      // Spacers (above and below the grid)
      this.spacerTop = document.createElement('div');
      this.spacerBottom = document.createElement('div');

      // Inner grid that holds actual cards
      this.grid = document.createElement('div');
      this.grid.className = 'vs-grid';

      this.viewport.appendChild(this.spacerTop);
      this.viewport.appendChild(this.grid);
      this.viewport.appendChild(this.spacerBottom);

      container.innerHTML = '';
      container.appendChild(this.viewport);

      // Bind scroll handler
      this.onScroll = this.onScroll.bind(this);
      window.addEventListener('scroll', this.onScroll);

      // Recalculate columns on resize
      this.calculateColumns();
      window.addEventListener('resize', () => this.calculateColumns());

// Wait 2 frames for CSS + layout to fully apply
await new Promise(resolve => requestAnimationFrame(() => {
  requestAnimationFrame(resolve);
}));

// Now measure height
await this.measureItemHeight();


      // Initial render
      this.render();

      return this;
    })();
  }

  /**
   * Safely measure the height of a card.
   * Uses a two‑frame layout pass to ensure width is known.
   */
  async measureItemHeight() {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        // Find first valid entry
        let sample = null;
        for (const entry of this.data) {
          sample = renderCardBlock(entry, this.isAdmin);
          if (sample) break;
        }

        if (!sample) {
          resolve();
          return;
        }

        // Insert sample into grid so it gets real width
        this.grid.appendChild(sample);

        // Wait one more frame for layout to settle
        requestAnimationFrame(() => {
          const h = sample.offsetHeight;

          // Safety guard: never allow 0 or NaN
          this.itemHeight = (h && h > 0) ? h : 250;

          this.grid.removeChild(sample);
          resolve();
        });
      });
    });
  }

  /**
   * Determine number of columns based on container width.
   */
  calculateColumns() {
    const width = this.container.clientWidth;

    if (width < 500) this.columns = 1;
    else if (width < 700) this.columns = 2;
    else if (width < 1000) this.columns = 4;
    else if (width < 1300) this.columns = 6;
    else if (width < 1600) this.columns = 8;
    else this.columns = 10;

    if (this.itemHeight > 0) {
      this.render();
    }
  }

  onScroll() {
    this.render();
  }

  /**
   * Render only visible items into the inner grid.
   */
  render() {
    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;

    const itemsPerRow = this.columns;
    const rowHeight = this.itemHeight || 1; // never 0
    const totalRows = Math.ceil(this.data.length / itemsPerRow);

    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - this.buffer);
    const endRow = Math.min(
      totalRows,
      Math.floor((scrollTop + viewportHeight) / rowHeight) + this.buffer
    );

    const startIndex = startRow * itemsPerRow;
    const endIndex = Math.min(this.data.length, endRow * itemsPerRow);

    const visibleItems = this.data.slice(startIndex, endIndex);

    // Clear only the grid (keep spacers)
    this.grid.innerHTML = '';

    // Insert visible items
    for (const entry of visibleItems) {
      const block = renderCardBlock(entry, this.isAdmin);
      if (block) {
        this.grid.appendChild(block);
      }
    }

    // Update spacers
    this.spacerTop.style.height = `${startRow * rowHeight}px`;
    this.spacerBottom.style.height = `${(totalRows - endRow) * rowHeight}px`;
  }
}
