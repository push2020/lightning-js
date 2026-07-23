import { createRail, createHeroSlides } from './contentFactory.js'

/**
 * Lazily-built, memoized Sports page data. Deferred until the page is
 * actually visited, instead of running for every page at app boot, and
 * cached so revisiting the tab doesn't rebuild it.
 * @type {{hero: object[], rails: object[]} | null}
 */
let cache = null

/**
 * Returns the Sports page's hero slides and content rails, building them on
 * first call and reusing the cached result afterwards.
 * @returns {{hero: object[], rails: object[]}}
 */
export default function getSportsData() {
  if (cache) return cache
  cache = buildSportsData()
  return cache
}

/**
 * Builds the Sports page's hero slides and content rails from scratch.
 * @returns {{hero: object[], rails: object[]}}
 */
function buildSportsData() {
  const hero = createHeroSlides({
    id: 'sports',
    slides: [
      {
        title: 'Champions Cup Final',
        subtitle: 'Live This Weekend',
        description: 'The top clubs in the world meet in a winner-takes-all showdown.',
      },
      {
        title: 'Grand Prix Showdown',
        subtitle: 'Race Week',
        description: 'The fastest drivers on the planet battle for pole position.',
      },
      {
        title: 'World Series Countdown',
        subtitle: 'Live Coverage',
        description: 'Every pitch, every play, live as the season reaches its climax.',
      },
      {
        title: 'Summit Circuit Finals',
        subtitle: 'Only on JioTV Plus',
        description: 'The biggest stars of the season face off for the championship title.',
      },
      {
        title: 'Grand Slam Highlights',
        subtitle: 'Replay Available',
        description: 'Relive the greatest matches from the biggest Grand Slam of the year.',
      },
    ],
  })

  const rails = [
    createRail({ id: 'sports-football', title: 'Football', genres: ['Football', 'Live'] }),
    createRail({ id: 'sports-cricket', title: 'Cricket', genres: ['Cricket', 'Live'] }),
    createRail({ id: 'sports-basketball', title: 'Basketball', genres: ['Basketball', 'Live'] }),
    createRail({ id: 'sports-tennis', title: 'Tennis', genres: ['Tennis', 'Live'] }),
    createRail({ id: 'sports-olympics', title: 'Olympics', genres: ['Olympics', 'Highlights'] }),
    createRail({ id: 'sports-motorsports', title: 'Motorsports', genres: ['Motorsports', 'Live'] }),
    createRail({ id: 'sports-kabaddi', title: 'Kabaddi', genres: ['Kabaddi', 'Live'] }),
    createRail({ id: 'sports-badminton', title: 'Badminton', genres: ['Badminton', 'Live'] }),
    createRail({ id: 'sports-hockey', title: 'Hockey', genres: ['Hockey', 'Live'] }),
    createRail({ id: 'sports-boxing', title: 'Boxing', genres: ['Boxing', 'Highlights'] }),
    createRail({ id: 'sports-rugby', title: 'Rugby', genres: ['Rugby', 'Live'] }),
    createRail({ id: 'sports-golf', title: 'Golf', genres: ['Golf', 'Live'] }),
    createRail({ id: 'sports-wrestling', title: 'Wrestling', genres: ['Wrestling', 'Live'] }),
    createRail({ id: 'sports-athletics', title: 'Athletics', genres: ['Athletics', 'Highlights'] }),
    createRail({ id: 'sports-swimming', title: 'Swimming', genres: ['Swimming', 'Live'] }),
    createRail({
      id: 'sports-table-tennis',
      title: 'Table Tennis',
      genres: ['Table Tennis', 'Live'],
    }),
    createRail({ id: 'sports-volleyball', title: 'Volleyball', genres: ['Volleyball', 'Live'] }),
    createRail({ id: 'sports-esports', title: 'Esports', genres: ['Esports', 'Live'] }),
    createRail({ id: 'sports-snooker', title: 'Snooker', genres: ['Snooker', 'Live'] }),
    createRail({ id: 'sports-cycling', title: 'Cycling', genres: ['Cycling', 'Live'] }),
  ]

  return { hero, rails }
}
