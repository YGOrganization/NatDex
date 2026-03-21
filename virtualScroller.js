import { renderCardBlock } from './renderer.js';

export class VirtualScroller {
  constructor(container, data, isAdmin = false) {
    return (async () => {
      this.container = container;
      this.data = data;
      this.isAdmin = isAdmin;

      this.columns = 10;
      this.buffer = 5;
      this.itemHeight = 250;
      this.rowGap = 0;

      this.viewport = document.createElement('div');
      this.viewport.className = 'vs-viewport';

      this.spacerTop = document.createElement('div');
      this.spacerBottom = document.createElement('div');

      this.grid = document.createElement('div');
      this.grid.className = 'vs-grid';

      this.viewport.appendChild(this.spacerTop);
      this.viewport.appendChild(this.grid);
      this.viewport.appendChild(this.spacerBottom);

      container.innerHTML = '';
      container.appendChild(this.viewport);

      this.onScroll = this.onScroll.bind(this);
      window.addEventListener('scroll', this.onScroll);

      this.calculateColumns();
      window.addEventListener('resize', () => this.calculateColumns());

      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

      await this.measureItemHeight();

      const styles = getComputedStyle(this.grid);
      const gap = parseFloat(styles.rowGap || styles.gap || '0');
      this.rowGap = Number.isFinite(gap) ? gap : 0;

      this.render();
      return this;
    })();
  }

  async measureItemHeight() {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        let sample = null;
        for (const entry of this.data) {
          sample = renderCardBlock(entry, this.isAdmin);
          if (sample) break;
        }

        if (!sample) return resolve();

        this.grid.style.setProperty('--vs-columns', this.columns);

        this.grid.appendChild(sample);

        requestAnimationFrame(() => {
          const h = sample.offsetHeight;
          this.itemHeight = (h && h > 0) ? h : 250;
          this.grid.removeChild(sample);
          resolve();
        });
      });
    });
  }

  calculateColumns() {
    const width = this.container.clientWidth;

    if (width < 500) this.columns = 1;
    else if (width < 700) this.columns = 2;
    else if (width < 1000) this.columns = 4;
    else if (width < 1300) this.columns = 6;
    else if (width < 1600) this.columns = 8;
    else this.columns = 10;

    this.grid.style.setProperty('--vs-columns', this.columns);

    if (this.itemHeight > 0) this.render();
  }

  onScroll() {
    this.render();
  }

  render() {
    // ⭐ Correct scroll origin
    const scrollTop = Math.max(0, window.scrollY - this.container.offsetTop);

    const viewportHeight = window.innerHeight;

    const itemsPerRow = this.columns;
    const rowHeight = this.itemHeight + this.rowGap;
    const totalRows = Math.ceil(this.data.length / itemsPerRow);

    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - this.buffer);
    const endRow = Math.min(
      totalRows,
      Math.floor((scrollTop + viewportHeight) / rowHeight) + this.buffer
    );

    const startIndex = startRow * itemsPerRow;
    const endIndex = Math.min(this.data.length, endRow * itemsPerRow);

    const visibleItems = this.data.slice(startIndex, endIndex);

    this.grid.innerHTML = '';
    for (const entry of visibleItems) {
      const block = renderCardBlock(entry, this.isAdmin);
      if (block) this.grid.appendChild(block);
    }

    this.spacerTop.style.height = `${startRow * rowHeight}px`;
    this.spacerBottom.style.height = `${(totalRows - endRow) * rowHeight}px`;
  }
}
