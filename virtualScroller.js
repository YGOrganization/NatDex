import { renderCardBlock } from './renderer.js';

/**
 * Clean, stable VirtualScroller (async constructor version)
 * - Cards live in an inner grid (.vs-grid)
 * - Spacers are outside the grid, so they don't occupy columns
 * - Height is measured from the first valid card
 */
export class VirtualScroller {
  constructor(container, data, isAdmin = false) {
    // Return an async IIFE so the caller gets a fully initialized instance
    return (async () => {
      this.container = container;
      this.data = data;
      this.isAdmin = isAdmin;

      this.columns = 10;
      this.buffer = 5;
      this.itemHeight = 250; // fallback until measured

      // Outer viewport (NOT a grid)
      this.viewport = document.createElement('div');
      this.viewport.className = 'vs-viewport';

      // Spacers live outside the grid
      this.spacerTop = document.createElement('div');
      this.spacerBottom = document.createElement('div');

      // Inner grid that actually holds cards
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

      // Measure height AFTER layout stabilizes
      await this.measureItemHeight();

      // Initial render
      this.render();

      return this;
    })();
  }

  /**
   * Find the first valid entry and measure its rendered height.
   */
  measureItemHeight() {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        // Find first entry that produces a non-null block
        let sample = null;
        for (const entry of this.data) {
          sample = renderCardBlock(entry, this.isAdmin);
          if (sample) break;
        }

        if (!sample) {
          // Fallback: no valid entries, keep default height
          resolve();
          return;
        }

        // Insert into grid so it gets real width
        this.grid.appendChild(sample);

        // Let browser compute layout
        requestAnimationFrame(() => {
          this.itemHeight = sample.offsetHeight || this.itemHeight;
          this.grid.removeChild(sample);
          resolve();
        });
      });
    });
  }

  /**
   * Determine number of columns based on container width
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
    const rowHeight = this.itemHeight || 1; // avoid division by zero
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
