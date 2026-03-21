import { COLOR_RULES } from './colorRules.js';

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
 * Convert a card name into a Yugipedia filename base:
 * Removes all non-alphanumeric characters.
 * Example:
 *   "Blue-Eyes White Dragon" → "BlueEyesWhiteDragon"
 */
function makeBaseName(name) {
  return String(name || '').replace(/[^A-Za-z0-9]/g, '');
}

/**
 * Resolve the correct image URL for a card entry.
 */
export function resolveImage(entry) {
  const colorKey = normalizeColorKey(entry.color);
  const colorRule = COLOR_RULES[colorKey];

  // If no color rule exists, treat as no image
  if (!colorRule) {
    return null;
  }

  // If this color requires manual images, only use entry.image
  if (colorRule.manualImageOverride) {
    return entry.image || null;
  }

  // If entry explicitly provides an image, always use it
  if (entry.image) {
    return entry.image;
  }

  // Auto-generate for WHITE cards
  if (colorKey === 'white') {
    const baseName = makeBaseName(entry.name);
    const filename = `${baseName}-MADU-EN-VG-artwork.png`;

    // Direct file path (best for <img src>)
    return `https://yugipedia.com/wiki/Special:FilePath/${filename}`;
  }

  // No auto-generation for other colors (yet)
  return null;
}
