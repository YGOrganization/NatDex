import { renderCardBlock } from './renderer.js';

export class VirtualScroller {
  constructor(container, data, isAdmin = false) {
    return (async () => {
      this.container = container;          // scroll container
      this.data = data;
      this.isAdmin = isAdmin;

      this.columns = 10;
      this.buffer = 5;
      this.itemHeight = 250;

      // Build viewport inside scroll container
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

      // Bind + attach scroll handler (container scroll, not window)
      this.renderQueued = false;
      this.onScroll = this.onScroll.bind(this);
      this.container.addEventListener('scroll', this.onScroll);

      // Bind resize handler
      this.calculateColumns = this.calculateColumns.bind(this);
      window.addEventListener('resize', this.calculateColumns);

      // IMPORTANT: calculate columns BEFORE measuring height
      this.calculateColumns();

      // Let layout settle
      await new Promise(r =>
        requestAnimationFrame(() => requestAnimationFrame(r))
      );

      // Measure item height AFTER columns are set
      await this.measureItemHeight();

      // Initial render
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

        if (!sample) {
          return resolve();
        }

        // Ensure correct column width before measuring
        this.grid.style.setProperty('--vs-columns', this.columns);
        this.grid.appendChild(sample);

        const img = sample.querySelector('img');

        const finalize = () => {
          requestAnimationFrame(() => {
            const h = sample.offsetHeight;
            this.itemHeight = (h && h > 0) ? h : 250;
            this.grid.removeChild(sample);
            resolve();
          });
        };

        if (img && !img.complete) {
          img.onload = finalize;
          img.onerror = finalize;
        } else {
          finalize();
        }
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

    // If height already known, re
