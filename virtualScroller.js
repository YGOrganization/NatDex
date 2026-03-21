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

this.viewport = container; // use the scroll container as the viewport

      this.spacerTop = document.createElement('div');
      this.spacerBottom = document.createElement('div');

      this.grid = document.createElement('div');
      this.grid.className = 'vs-grid';

      this.viewport.appendChild(this.spacerTop);
      this.viewport.appendChild(this.grid);
      this.viewport.appendChild(this.spacerBottom);

      this.renderQueued = false;
      this.onScroll = this.onScroll.bind(this);
      this.container.addEventListener('scroll', this.onScroll);

      this.calculateColumns = this.calculateColumns.bind(this);
      window.addEventListener('resize', this.calculateColumns);

      this.calculateColumns();

      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });

      await this.measureItemHeight();

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
          resolve();
          return;
        }

        this.grid.style.setProperty('--vs-columns', this.columns);
        this.grid.appendChild(sample);

        const img = sample.querySelector('img');

        const finalize = () => {
          requestAnimationFrame(() => {
            const h = sample.offsetHeight;
            this.itemHeight = h > 0 ? h : 250;
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

    if (width < 500) {
      this.columns = 1;
    } else if (width < 700) {
      this.columns = 2;
    } else if (width < 1000) {
      this.columns = 4;
    } else if (width < 1300) {
      this.columns = 6;
    } else if (width < 1600) {
      this.columns = 8;
    } else {
      this.columns = 10;
    }

    this.grid.style.setProperty('--vs-columns', this.columns);

    if (this.itemHeight > 0) {
      this.render();
    }
  }

  onScroll() {
    if (this.renderQueued) return;

    this.renderQueued = true;

    requestAnimationFrame(() => {
      this.renderQueued = false;
      this.render();
    });
  }

  render() {
    const rowHeight = this.itemHeight;

    if (!rowHeight || rowHeight <= 0) return;

    const scrollTop = this.container.scrollTop;
    const viewportHeight = this.container.clientHeight;

    const itemsPerRow = this.columns;
    const totalRows = Math.ceil(this.data.length / itemsPerRow);

    const startRow = Math.max(
      0,
      Math.floor(scrollTop / rowHeight) - this.buffer
    );

    const endRow = Math.min(
      totalRows,
      Math.floor((scrollTop + viewportHeight) / rowHeight) + this.buffer
    );

    const startIndex = startRow * itemsPerRow;
    const endIndex = Math.min(
      this.data.length,
      endRow * itemsPerRow
    );

    const visibleItems = this.data.slice(startIndex, endIndex);

    this.grid.innerHTML = '';

    for (const entry of visibleItems) {
      const block = renderCardBlock(entry, this.isAdmin);
      if (block) this.grid.appendChild(block);
    }

    const topHeight = startRow * rowHeight;
    const bottomHeight = (totalRows - endRow) * rowHeight;

    this.spacerTop.style.height = topHeight + 'px';
    this.spacerBottom.style.height = bottomHeight + 'px';
  }
}
