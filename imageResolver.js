import { COLOR_RULES } from './colorRules.js';
import { getYgoManifest } from './manifestLoader.js';

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

  // Manifest must already be loaded
  const manifest = getYgoManifest();
  if (!manifest) return null;

  // TEST PHASE: Only Blue-Eyes White Dragon (4007)
  if (entry.id === 4007 && (entry.color === "White" || entry.color === "Yellow")) {
    const cardEntry = manifest.cards?.["4007"];
    if (!cardEntry) return null;

    const art1 = cardEntry["1"];
    if (!art1 || !art1.bestArt) return null;

    return "https://artworks.ygoresources.com" + art1.bestArt;
  }

  // All other cards: no auto-art yet
  return null;
}
