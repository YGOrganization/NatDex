import { COLOR_RULES } from './colorRules.js';
import { RUSH_NAMES } from './rushNames.js';

// Encode for Yugipedia FilePath
function encodeForWiki(name) {
  return encodeURIComponent(name.replace(/ /g, "_"));
}

export function resolveImage(entry) {
  const color = entry.color;
  const rules = COLOR_RULES[color];

  // Case 1: White or Yellow → auto image
  if (!rules.manualImageOverride) {
    if (color === "White") {
      // TCG/OCG auto image
      const encoded = encodeForWiki(entry.name);
      return `https://yugipedia.com/wiki/Special:FilePath/${encoded}.png`;
    }

    if (color === "Yellow") {
      // Rush Duel auto image
      const rushName = RUSH_NAMES[entry.name] || `${entry.name} (Rush Duel)`;
      const encoded = encodeForWiki(rushName);
      return `https://yugipedia.com/wiki/Special:FilePath/${encoded}.png`;
    }
  }

  // Case 2: Manual override colors
  // If admin provided a URL, use it
  if (entry.image && entry.image.trim() !== "") {
    return entry.image.trim();
  }

  // Case 3: No image provided → empty cell
  return null;
}
