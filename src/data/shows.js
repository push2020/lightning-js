import { createRail, createHeroSlides } from './contentFactory.js'

const hero = createHeroSlides({
  id: 'shows',
  slides: [
    {
      title: 'Wildfire Kingdom',
      subtitle: 'Season 2 Now Streaming',
      description: 'Power, betrayal and survival collide in the untamed heart of the wilderness.',
    },
    {
      title: 'Echoes of Winter',
      subtitle: 'New Season',
      description: 'A small town unravels as long-buried secrets rise to the surface.',
    },
    {
      title: 'The Serenade Files',
      subtitle: 'Binge The Full Season',
      description: 'A detective duo chase a case that spans generations and continents.',
    },
    {
      title: 'Restless Harbor',
      subtitle: 'All Episodes Streaming',
      description: 'A coastal community fights to protect what they love most.',
    },
    {
      title: 'Golden Labyrinth',
      subtitle: 'Fan Favorite',
      description: 'Six strangers. One maze. A competition where only one can win.',
    },
    {
      title: 'Midnight Frontier',
      subtitle: 'New Episodes Weekly',
      description: 'On the edge of civilization, a group of settlers face their toughest test yet.',
    },
  ],
})

const rails = [
  createRail({ id: 'shows-trending', title: 'Trending Shows', genres: ['Drama', 'Thriller'] }),
  createRail({ id: 'shows-binge', title: 'Binge-Worthy Series', genres: ['Drama', 'Crime'] }),
  createRail({ id: 'shows-drama', title: 'Drama Series', genres: ['Drama'] }),
  createRail({ id: 'shows-comedy', title: 'Comedy Series', genres: ['Comedy'] }),
  createRail({ id: 'shows-crime', title: 'Crime & Mystery', genres: ['Crime', 'Mystery'] }),
  createRail({ id: 'shows-reality', title: 'Reality TV', genres: ['Reality'] }),
  createRail({ id: 'shows-kids', title: 'Kids & Family', genres: ['Family', 'Animation'] }),
  createRail({ id: 'shows-anime', title: 'Anime', genres: ['Anime', 'Action'] }),
  createRail({ id: 'shows-award', title: 'Award-Winning Series', genres: ['Drama', 'Biography'] }),
  createRail({ id: 'shows-new', title: 'New Episodes', genres: ['Drama', 'Comedy'] }),
  createRail({
    id: 'shows-scifi',
    title: 'Sci-Fi & Fantasy Series',
    genres: ['Sci-Fi', 'Fantasy'],
  }),
  createRail({ id: 'shows-talk', title: 'Talk Shows', genres: ['Talk Show', 'Reality'] }),
  createRail({ id: 'shows-docuseries', title: 'Documentary Series', genres: ['Documentary'] }),
  createRail({ id: 'shows-romance', title: 'Romantic Series', genres: ['Romance', 'Drama'] }),
  createRail({ id: 'shows-horror', title: 'Horror Series', genres: ['Horror', 'Thriller'] }),
  createRail({ id: 'shows-teen', title: 'Teen Drama', genres: ['Drama', 'Teen'] }),
  createRail({ id: 'shows-superhero', title: 'Superhero Series', genres: ['Action', 'Sci-Fi'] }),
  createRail({ id: 'shows-legal', title: 'Legal Drama', genres: ['Drama', 'Crime'] }),
  createRail({ id: 'shows-medical', title: 'Medical Drama', genres: ['Drama'] }),
  createRail({ id: 'shows-sitcoms', title: 'Sitcoms', genres: ['Comedy'] }),
  createRail({ id: 'shows-gameshows', title: 'Game Shows', genres: ['Game Show', 'Reality'] }),
  createRail({ id: 'shows-cooking', title: 'Cooking Shows', genres: ['Reality', 'Lifestyle'] }),
  createRail({ id: 'shows-miniseries', title: 'Miniseries', genres: ['Drama', 'Limited Series'] }),
  createRail({ id: 'shows-political', title: 'Political Drama', genres: ['Drama'] }),
  createRail({
    id: 'shows-supernatural',
    title: 'Supernatural Series',
    genres: ['Fantasy', 'Horror'],
  }),
  createRail({ id: 'shows-workplace', title: 'Workplace Comedies', genres: ['Comedy'] }),
  createRail({
    id: 'shows-historical',
    title: 'Historical Drama',
    genres: ['Drama', 'History'],
  }),
  createRail({ id: 'shows-adventure', title: 'Adventure Series', genres: ['Adventure', 'Action'] }),
]

export default { hero, rails }
