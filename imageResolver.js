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
  console.log("Resolver hit for entry:", entry);

  const cardEntry = manifest.cards?.["4007"];
  if (!cardEntry) return null;

  const art1 = cardEntry["1"];
  if (!art1) return null;

  // ⭐ 1. Prefer neuron_high (art-only crop)
  const neuron = art1.idx?.en?.find(x => x.source === "neuron_high");
  if (neuron?.path) {
    return "https:" + neuron.path;
  }

  // ⭐ 2. Fall back to bestArt
  if (art1.bestArt?.startsWith("//")) {
    return "https:" + art1.bestArt;
  }

  // ⭐ 3. Fall back to bestTCG / bestOCG
  if (art1.bestTCG?.startsWith("//")) {
    return "https:" + art1.bestTCG;
  }
  if (art1.bestOCG?.startsWith("//")) {
    return "https:" + art1.bestOCG;
  }

  // ⭐ 4. Fall back to database scan
  const db = art1.idx?.en?.find(x => x.source === "database");
  if (db?.path) {
    return "https:" + db.path;
  }

  return null;
}

