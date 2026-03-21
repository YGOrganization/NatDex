import { renderCardBlock } from './renderer.js';

/**
 * VirtualScroller
 * Efficiently renders only the visible portion of a large dataset.
 */
export class VirtualScroller {
  constructor(container, data, isAdmin = false) {
    this.container = container;
    this.data = data;
    this.isAdmin = isAdmin;

    this.itemHeight = 220; // Approx height of a trio block
    this.buffer = 5;       // Extra rows above/below viewport
    this.columns = 10;     // Max columns; CSS will reduce this on smaller screens

    this.viewport = document.createElement('div');
    this.viewport.className = 'vs-viewport';

    this.spacerTop = document.createElement('div');
    this.spacerBottom = document.createElement('div');

    this.viewport.appendChild(this.spacerTop);
    this.viewport.appendChild(this.spacerBottom);

    container.innerHTML = '';
    container.appendChild(this.viewport);

    this.onScroll = this.onScroll.bind(this);
    window.addEventListener('scroll', this.onScroll);

    this.calculateColumns();
    window.addEventListener('resize', () => this.calculateColumns());

    this.render();
  }

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

    this.viewport.innerHTML = '';
    this.viewport.appendChild(this.spacerTop);

    for (const entry of visibleItems) {
      const block = renderCardBlock(entry, this.isAdmin);
      if (block) this.viewport.appendChild(block);
    }

    this.viewport.appendChild(this.spacerBottom);

    this.spacerTop.style.height = `${startRow * rowHeight}px`;
    this.spacerBottom.style.height = `${(totalRows - endRow) * rowHeight}px`;
  }
}
