import { COLOR_RULES } from './colorRules.js';
import { resolveImage } from './imageResolver.js';

/**
 * Render a single card entry as a 3-row block:
 * Row 1: ID
 * Row 2: Image (or empty colored cell)
 * Row 3: Name
 */
export function renderCardBlock(entry, isAdmin = false) {
  const colorRule = COLOR_RULES[entry.color];

  // If this is admin-only and user is not admin, skip rendering
  if (colorRule.adminOnly && !isAdmin) {
    return null;
  }

  // Container for the 3-row block
  const block = document.createElement('div');
  block.className = 'card-block';

  // Apply background color to the whole block (optional)
  block.style.setProperty('--card-color', colorRule.hex);

  // Row 1: ID
  const idRow = document.createElement('div');
  idRow.className = 'card-row card-row-id';
  idRow.textContent = entry.id;
  block.appendChild(idRow);

  // Row 2: Image (or empty colored cell)
  const imageRow = document.createElement('div');
  imageRow.className = 'card-row card-row-image';

  const imageUrl = resolveImage(entry);

  if (imageUrl) {
    const img = document.createElement('img');
    img.className = 'card-image';
    img.src = imageUrl;
    img.alt = entry.name;
    imageRow.appendChild(img);
  } else {
    // No image: leave empty, but color via CSS using --card-color
    imageRow.classList.add('card-row-empty-image');
  }

  block.appendChild(imageRow);

  // Row 3: Name
  const nameRow = document.createElement('div');
  nameRow.className = 'card-row card-row-name';
  nameRow.textContent = entry.name;
  block.appendChild(nameRow);

  return block;
}

/**
 * Render a list of entries into a container.
 * This is a simple, non-virtualized renderer for MVP.
 * Later, virtualScroller.js will call renderCardBlock for visible items only.
 */
export function renderCardGrid(entries, container, isAdmin = false) {
  container.innerHTML = '';

  for (const entry of entries) {
    const block = renderCardBlock(entry, isAdmin);
    if (block) {
      container.appendChild(block);
    }
  }
}
