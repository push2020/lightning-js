import { createRail, createHeroSlides } from './contentFactory.js'

/**
 * Lazily-built, memoized Home page data. Building this (26 rails x 26 cards)
 * is deferred until the page is actually visited, instead of running for
 * every page at app boot, and cached so revisiting the tab doesn't rebuild it.
 * @type {{hero: object[], rails: object[]} | null}
 */
let cache = null

/**
 * Returns the Home page's hero slides and content rails, building them on
 * first call and reusing the cached result afterwards.
 * @returns {{hero: object[], rails: object[]}}
 */
export default function getHomeData() {
  if (cache) return cache
  cache = buildHomeData()
  return cache
}

/**
 * Builds the Home page's hero slides and content rails from scratch.
 * @returns {{hero: object[], rails: object[]}}
 */
function buildHomeData() {
  const hero = createHeroSlides({
    id: 'home',
    slides: [
      {
        title: 'Silent Horizon',
        subtitle: 'A New Original Series',
        description:
          'Follow a lone ranger across untamed mountains in search of a legend thought lost to time.',
      },
      {
        title: 'Ocean Requiem',
        subtitle: 'Documentary Premiere',
        description:
          'Dive into the deep blue and discover the fragile beauty of life beneath the waves.',
      },
      {
        title: 'Wildfire Kingdom',
        subtitle: 'Season 2 Now Streaming',
        description: 'Power, betrayal and survival collide in the untamed heart of the wilderness.',
      },
      {
        title: 'The Last Summit',
        subtitle: 'Award-Winning Film',
        description:
          'One climber. One mountain. A journey that will test the limits of human endurance.',
      },
      {
        title: 'Emerald Frontier',
        subtitle: 'Exclusive Original',
        description:
          'An expedition into uncharted forests uncovers secrets the world was never meant to find.',
      },
      {
        title: 'Restless Tide',
        subtitle: 'New This Week',
        description:
          'A coastal town is shaken when the sea gives up a mystery decades in the making.',
      },
    ],
  })

  const rails = [
    createRail({
      id: 'home-trending',
      title: 'Trending Now',
      genres: ['Action', 'Drama', 'Thriller'],
    }),
    createRail({
      id: 'home-popular',
      title: 'Popular Right Now',
      genres: ['Drama', 'Comedy', 'Romance'],
    }),
    createRail({
      id: 'home-continue',
      title: 'Continue Watching',
      genres: ['Drama', 'Action', 'Sci-Fi'],
      withProgress: true,
    }),
    createRail({ id: 'home-action', title: 'Action', genres: ['Action', 'Adventure'] }),
    createRail({ id: 'home-comedy', title: 'Comedy', genres: ['Comedy', 'Family'] }),
    createRail({ id: 'home-adventure', title: 'Adventure', genres: ['Adventure', 'Fantasy'] }),
    createRail({
      id: 'home-recommended',
      title: 'Recommended For You',
      genres: ['Drama', 'Thriller', 'Mystery'],
    }),
    createRail({ id: 'home-top-rated', title: 'Top Rated', genres: ['Drama', 'Crime'] }),
    createRail({ id: 'home-new', title: 'New Releases', genres: ['Action', 'Comedy', 'Drama'] }),
    createRail({
      id: 'home-documentaries',
      title: 'Documentaries',
      genres: ['Documentary', 'Nature'],
    }),
    createRail({ id: 'home-scifi', title: 'Sci-Fi & Fantasy', genres: ['Sci-Fi', 'Fantasy'] }),
    createRail({ id: 'home-crime', title: 'Crime & Mystery', genres: ['Crime', 'Mystery'] }),
    createRail({ id: 'home-family', title: 'Family Favorites', genres: ['Family', 'Animation'] }),
    createRail({ id: 'home-hidden-gems', title: 'Hidden Gems', genres: ['Drama', 'Indie'] }),
    createRail({
      id: 'home-award-originals',
      title: 'Award-Winning Originals',
      genres: ['Drama', 'Biography'],
    }),
    createRail({ id: 'home-horror', title: 'Horror', genres: ['Horror', 'Thriller'] }),
    createRail({
      id: 'home-reality-game',
      title: 'Reality & Game Shows',
      genres: ['Reality', 'Game Show'],
    }),
    createRail({ id: 'home-anime', title: 'Anime', genres: ['Anime', 'Action'] }),
    createRail({ id: 'home-standup', title: 'Stand-up Comedy', genres: ['Comedy', 'Stand-up'] }),
    createRail({
      id: 'home-music-concerts',
      title: 'Music & Concerts',
      genres: ['Musical', 'Documentary'],
    }),
    createRail({ id: 'home-true-crime', title: 'True Crime', genres: ['Crime', 'Documentary'] }),
    createRail({ id: 'home-feel-good', title: 'Feel Good Favorites', genres: ['Comedy', 'Family'] }),
    createRail({
      id: 'home-international',
      title: 'International Cinema',
      genres: ['Drama', 'Foreign'],
    }),
    createRail({
      id: 'home-true-events',
      title: 'Based on True Events',
      genres: ['Drama', 'Biography'],
    }),
    createRail({ id: 'home-weekend-binge', title: 'Weekend Binge', genres: ['Drama', 'Thriller'] }),
    createRail({ id: 'home-just-added', title: 'Just Added', genres: ['Action', 'Drama', 'Comedy'] }),
  ]

  return { hero, rails }
}
