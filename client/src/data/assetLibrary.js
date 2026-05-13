const assetModules = import.meta.glob('../assets/*.{jpg,jpeg,png,webp,svg,gif}', {
  eager: true,
  import: 'default',
})

const assets = Object.entries(assetModules).map(([path, url]) => {
  const fileName = path.split('/').pop() || path
  return {
    path,
    fileName,
    url,
    normalized: normalize(fileName),
  }
})

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '')
}

export function findAssetUrl(query, fallback = '') {
  const n = normalize(query)
  if (!n) return fallback
  const exact = assets.find((asset) => asset.normalized === n)
  if (exact) return exact.url
  const partial = assets.find(
    (asset) => asset.normalized.includes(n) || n.includes(asset.normalized)
  )
  return partial?.url || fallback
}

export const allAssets = assets.map((item) => ({
  fileName: item.fileName,
  url: item.url,
}))

/** URLs for assets whose normalized filename includes every normalized substring, sorted by file name. */
export function getAssetUrlsMatchingNormalizedParts(...parts) {
  const needles = parts.map(normalize).filter(Boolean)
  if (!needles.length) return []
  return assets
    .filter((a) => needles.every((n) => a.normalized.includes(n)))
    .sort((a, b) => a.fileName.localeCompare(b.fileName))
    .map((a) => a.url)
}
