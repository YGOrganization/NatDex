import { COLOR_RULES } from './colorRules.js';

function normalizeColorKey(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
}

export function resolveImage(entry) {
  const colorKey = normalizeColorKey(entry.color);
  const colorRule = COLOR_RULES[colorKey];

  if (!colorRule) {
    return null;
  }

  // Manual-only colors: only use explicit entry.image
  if (colorRule.manualImageOverride) {
    return entry.image || null;
  }

  // Explicit override always wins
  if (entry.image) {
    return entry.image;
  }

  // Auto-generate for WHITE cards using YGOPRODeck cropped art
  if (colorKey === 'white') {
    return `https://images.ygoprodeck.com/images/cards_cropped/${entry.id}.jpg`;
  }

  return null;
}
