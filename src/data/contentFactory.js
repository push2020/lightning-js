import { buildPosterImages, buildHeroImages } from './images.js'
import { getTierConfig } from '../helpers/deviceTier.js'
import { CARD_W, CARD_H, LANDSCAPE_CARD_W, LANDSCAPE_CARD_H } from '../constants/layout.js'

const ADJECTIVES = [
  'Silent',
  'Crimson',
  'Last',
  'Broken',
  'Hidden',
  'Golden',
  'Endless',
  'Wild',
  'Frozen',
  'Rising',
  'Lost',
  'Eternal',
  'Midnight',
  'Scarlet',
  'Distant',
  'Sacred',
  'Shattered',
  'Velvet',
  'Restless',
  'Radiant',
]

const NOUNS = [
  'Horizon',
  'Ember',
  'Kingdom',
  'Legacy',
  'Shadow',
  'Tide',
  'Voyage',
  'Echo',
  'Storm',
  'Summit',
  'Wolves',
  'Empire',
  'Mirage',
  'Serenade',
  'Frontier',
  'Requiem',
  'Odyssey',
  'Harbor',
  'Comet',
  'Labyrinth',
]

/**
 * Produces a small, stable numeric hash for a string, used to seed title generation.
 * @param {string} value - the string to hash
 * @returns {number} a positive integer hash
 */
function hashString(value) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) % 100000
  }
  return hash
}

/**
 * Deterministically generates a movie/show style title from an adjective + noun pair.
 * @param {number} seed - numeric seed used to pick the word combination
 * @returns {string} generated title
 */
function generateTitle(seed) {
  const adjective = ADJECTIVES[seed % ADJECTIVES.length]
  const noun = NOUNS[(seed * 7 + 3) % NOUNS.length]
  return `${adjective} ${noun}`
}

/**
 * Builds a single content rail with generated poster cards.
 * @param {object} config
 * @param {string} config.id - unique rail identifier
 * @param {string} config.title - rail heading shown to the user
 * @param {string[]} config.genres - pool of genre labels applied round-robin to cards
 * @param {number} [config.count] - number of cards to generate (defaults to 26)
 * @param {boolean} [config.withProgress] - whether cards show a continue-watching progress bar
 * @param {'portrait'|'landscape'} [config.variant] - card shape for this rail (defaults to 'portrait')
 * @returns {{id: string, title: string, items: object[], cardW: number, cardH: number}} the generated rail
 */
export function createRail({ id, title, genres, count = 26, withProgress = false, variant = 'portrait' }) {
  const isLandscape = variant === 'landscape'
  const { posterW, posterH, landscapeW, landscapeH } = getTierConfig().images
  const imageW = isLandscape ? landscapeW : posterW
  const imageH = isLandscape ? landscapeH : posterH
  const images = buildPosterImages(id, count, imageW, imageH)
  const seedBase = hashString(id)
  const items = []
  for (let i = 0; i < count; i++) {
    items.push({
      id: `${id}-${i}`,
      title: generateTitle(seedBase + i),
      genre: genres[i % genres.length],
      image: images[i],
      progress: withProgress ? 0.15 + ((i * 13) % 70) / 100 : undefined,
    })
  }
  return {
    id,
    title,
    items,
    cardW: isLandscape ? LANDSCAPE_CARD_W : CARD_W,
    cardH: isLandscape ? LANDSCAPE_CARD_H : CARD_H,
  }
}

/**
 * Builds the hero carousel slides for a page, attaching a generated background image to each.
 * @param {object} config
 * @param {string} config.id - unique page identifier, used to seed images
 * @param {{title: string, subtitle: string, description: string}[]} config.slides - slide copy
 * @returns {object[]} hero slide data including generated background images
 */
export function createHeroSlides({ id, slides }) {
  const { heroW, heroH } = getTierConfig().images
  const images = buildHeroImages(id, slides.length, heroW, heroH)
  return slides.map((slide, index) => ({
    id: `${id}-hero-${index}`,
    image: images[index],
    ...slide,
  }))
}
