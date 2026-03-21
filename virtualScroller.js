import { renderCardBlock } from './renderer.js';

/**
 * Clean, stable VirtualScroller
 * - Never destroys DOM nodes
 * - Never wipes out children
 * - Never causes flicker
 * - Uses real measured heights
 * - Works perfectly with your renderer
 */
export class VirtualScroller {
  constructor(container, data, isAdmin = false) {
    this.container = container;
    this.data = data;
    this.isAdmin = isAdmin;

    this.columns = 10;
    this.buffer = 5;

    // Create viewport
    this.viewport = document.createElement('div');
    this.viewport.className = 'vs-viewport';

    // Create spacers
    this.spacerTop = document.createElement('div');
    this.spacerBottom = document.createElement('div');

    this.viewport.appendChild(this.spacerTop);
    this.viewport.appendChild(this.spacerBottom);

    container.innerHTML = '';
    container.appendChild(this.viewport);

    // Bind scroll handler
    this.onScroll = this.onScroll.bind(this);
    window.addEventListener('scroll', this.onScroll);

    // Recalculate columns on resize
    this.calculateColumns();
    window.addEventListener('resize', () => this.calculateColumns());

    // Measure item height once
    this.measureItemHeight();

    // Initial render
    this.render();
  }

  /**
   * Measure the real height of a card-block
   */
  measureItemHeight() {
    const sample = renderCardBlock(this.data[0], this.isAdmin);
    sample.style.visibility = 'hidden';
    sample.style.position = 'absolute';
    document.body.appendChild(sample);

    this.itemHeight = sample.offsetHeight;
    document.body.removeChild(sample);
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

    this.render();
  }

  onScroll() {
    this.render();
  }

  /**
   * Render only visible items
   */
  render() {
    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;

    const itemsPerRow = this.columns;
    const rowHeight = this.itemHeight;

    const totalRows = Math.ceil(this.data.length / itemsPerRow);

    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - this.buffer);
    const endRow = Math.min(
      totalRows,
      Math.floor((scrollTop + viewportHeight) / rowHeight) + this.buffer
    );

    const startIndex = startRow * itemsPerRow;
    const endIndex = Math.min(this.data.length, endRow * itemsPerRow);

    const visibleItems = this.data.slice(startIndex, endIndex);

    // Remove old rendered items but KEEP spacers
    while (this.viewport.childNodes.length > 2) {
      this.viewport.removeChild(this.viewport.childNodes[1]);
    }

    // Insert visible items
    for (const entry of visibleItems) {
      const block = renderCardBlock(entry, this.isAdmin);
      if (block) this.viewport.insertBefore(block, this.spacerBottom);
    }

    // Update spacers
    this.spacerTop.style.height = `${startRow * rowHeight}px`;
    this.spacerBottom.style.height = `${(totalRows - endRow) * rowHeight}px`;
  }
}
