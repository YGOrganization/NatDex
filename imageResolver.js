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
 * Resolve the correct image URL for a card entry.
 */
export function resolveImage(entry) {
  const colorKey = normalizeColorKey(entry.color);
  const colorRule = COLOR_RULES[colorKey];

  // If no color rule exists, treat as no image
  if (!colorRule) {
    return null;
  }

  // If this color requires manual images, return null
  if (colorRule.manualImageOverride) {
    return null;
  }

  // Otherwise use the entry's image field
  return entry.image || null;
}
