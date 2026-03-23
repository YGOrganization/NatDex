// manifestLoader.js
// Loads the YGOResources manifest once and caches it.

let ygoManifest = null;

export async function loadYgoManifest() {
  if (ygoManifest) return ygoManifest;

  try {
    const res = await fetch("https://artworks.ygoresources.com/manifest.json");
    if (!res.ok) {
      console.error("Failed to load YGO manifest:", res.status);
      return null;
    }

    ygoManifest = await res.json();
    console.log("YGO manifest loaded");
    return ygoManifest;

  } catch (err) {
    console.error("Error loading YGO manifest:", err);
    return null;
  }
}

export function getYgoManifest() {
  return ygoManifest;
}
