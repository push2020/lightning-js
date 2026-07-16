const POSTER_CATEGORIES = [
  'animals',
  'birds',
  'nature',
  'ocean',
  'waterfalls',
  'cities',
  'space',
  'scenery',
  'mountains',
]

const HERO_CATEGORIES = ['mountains', 'forests', 'ocean', 'wildlife', 'landscapes']

/**
 * Builds a deterministic Lorem Picsum URL for a given seed and dimensions.
 * @param {string} seed - unique seed string identifying the image
 * @param {number} w - image width in pixels
 * @param {number} h - image height in pixels
 * @returns {string} fully qualified image URL
 */
function picsumUrl(seed, w, h) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`
}

/**
 * Generates a list of poster image URLs, cycling through nature/scenery
 * categories and using unique seeds so images do not repeat across rails.
 * @param {string} prefix - unique prefix (usually the rail id)
 * @param {number} count - number of images to generate
 * @param {number} [w] - poster width in pixels
 * @param {number} [h] - poster height in pixels
 * @returns {string[]} array of image URLs
 */
export function buildPosterImages(prefix, count, w = 260, h = 390) {
  const images = []
  for (let i = 0; i < count; i++) {
    const category = POSTER_CATEGORIES[i % POSTER_CATEGORIES.length]
    images.push(picsumUrl(`${prefix}-${category}-${i}`, w, h))
  }
  return images
}

/**
 * Generates a list of hero background image URLs, cycling through landscape
 * categories and using unique seeds so images do not repeat across pages.
 * @param {string} prefix - unique prefix (usually the page id)
 * @param {number} count - number of images to generate
 * @param {number} [w] - hero width in pixels
 * @param {number} [h] - hero height in pixels
 * @returns {string[]} array of image URLs
 */
export function buildHeroImages(prefix, count, w = 1920, h = 880) {
  const images = []
  for (let i = 0; i < count; i++) {
    const category = HERO_CATEGORIES[i % HERO_CATEGORIES.length]
    images.push(picsumUrl(`hero-${prefix}-${category}-${i}`, w, h))
  }
  return images
}
