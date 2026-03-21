import { COLOR_RULES } from './colorRules.js';
import { resolveImage } from './imageResolver.js';

/**
 * Normalize a color name to a safe key:
 * - lowercase
 * - spaces → hyphens
 * - remove invalid characters
 */
function normalizeColorKey(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
}

/**
 * Render a single card entry as a 3-row block:
 * Row 1: ID
 * Row 2: Image (or empty colored cell)
 * Row 3: Name
 */
export function renderCardBlock(entry, isAdmin = false) {
  const colorKey = normalizeColorKey(entry.color);
  const colorRule = COLOR_RULES[colorKey];

  // Container for the 3-row block
  const block = document.createElement('div');
  block.className = 'card-block';

  // Add normalized color class
  if (colorKey) {
    block.classList.add(`color-${colorKey}`);
  }

  // Apply hex color if known, otherwise fallback
  const hex = colorRule?.hex || '#444';
  block.style.setProperty('--card-color', hex);

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
