import { COLOR_RULES } from './colorRules.js?v=4';
import { resolveImage } from './imageResolver.js?v=4';

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
 * Create a standard 3-row card block:
 * Row 1: ID
 * Row 2: Image (or empty colored cell)
 * Row 3: Name
 */
function buildCardBlock(entry, colorKey, hex, imageUrl, showName = true) {
  const block = document.createElement('div');
  block.className = 'card-block';

  if (colorKey) {
    block.classList.add(`color-${colorKey}`);
  }

  if (hex) {
    block.style.setProperty('--card-color', hex);
  }

  // Row 1: ID
  const idRow = document.createElement('div');
  idRow.className = 'card-row card-row-id';
  idRow.textContent = entry.id;
  block.appendChild(idRow);

  // Row 2: Image (or empty)
  const imageRow = document.createElement('div');
  imageRow.className = 'card-row card-row-image';

  if (imageUrl) {
    const img = document.createElement('img');
    img.className = 'card-image';
    img.src = imageUrl;
    img.alt = entry.name || '';
    imageRow.appendChild(img);
  } else {
    imageRow.classList.add('card-row-empty-image');
  }

  block.appendChild(imageRow);

  // Row 3: Name
  const nameRow = document.createElement('div');
  nameRow.className = 'card-row card-row-name';
  nameRow.textContent = showName ? (entry.name || '') : '';
  block.appendChild(nameRow);

  return block;
}

/**
 * Render a single card entry as a 3-row block.
 */
export function renderCardBlock(entry, isAdmin = false) {
  // Guard against completely invalid entries
  if (!entry || !entry.id) {
    return null;
  }

  const colorKey = normalizeColorKey(entry.color);
  const colorRule = COLOR_RULES[colorKey];

  // Admin-only handling: show placeholder in public mode
  if (colorRule?.adminOnly && !isAdmin) {
    const tanKey = 'tan';
    const tanRule = COLOR_RULES[tanKey];
    const hex = tanRule?.hex || '#fff2cc';

    // Placeholder: ID only, no name, no image, tan color
    return buildCardBlock(
      entry,
      tanKey,
      hex,
      null,
      false // hide name
    );
  }

  // Normal card rendering
  const hex = colorRule?.hex || '#444';
  const imageUrl = resolveImage(entry);

  return buildCardBlock(entry, colorKey, hex, imageUrl, true);
}

/**
 * Render a list of entries into a container (non-virtual fallback).
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
