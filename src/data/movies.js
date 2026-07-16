import { createRail, createHeroSlides } from './contentFactory.js'

const hero = createHeroSlides({
  id: 'movies',
  slides: [
    {
      title: 'The Last Summit',
      subtitle: 'Now Playing',
      description:
        'One climber. One mountain. A journey that will test the limits of human endurance.',
    },
    {
      title: 'Crimson Odyssey',
      subtitle: 'Blockbuster Hit',
      description: 'A daring heist across three continents spirals into a fight for survival.',
    },
    {
      title: 'Shattered Empire',
      subtitle: 'Award-Winning Drama',
      description:
        'When an empire falls, one family must decide what they are willing to sacrifice.',
    },
    {
      title: 'Wild Comet',
      subtitle: 'Sci-Fi Spectacle',
      description: 'A stranded crew races against time to make it home from deep space.',
    },
    {
      title: 'Velvet Mirage',
      subtitle: 'Critically Acclaimed',
      description: 'A glamorous city hides secrets that threaten to unravel a life built on lies.',
    },
    {
      title: 'Frontier of Ash',
      subtitle: 'Now Streaming',
      description: 'In a world scorched by war, an unlikely alliance sparks a new hope.',
    },
  ],
})

const rails = [
  createRail({ id: 'movies-trending', title: 'Trending Movies', genres: ['Action', 'Thriller'] }),
  createRail({ id: 'movies-blockbusters', title: 'Blockbusters', genres: ['Action', 'Adventure'] }),
  createRail({ id: 'movies-action', title: 'Action Movies', genres: ['Action'] }),
  createRail({ id: 'movies-comedy', title: 'Comedy Movies', genres: ['Comedy'] }),
  createRail({ id: 'movies-thrillers', title: 'Thrillers', genres: ['Thriller', 'Mystery'] }),
  createRail({ id: 'movies-romance', title: 'Romance', genres: ['Romance', 'Drama'] }),
  createRail({ id: 'movies-scifi', title: 'Sci-Fi & Fantasy', genres: ['Sci-Fi', 'Fantasy'] }),
  createRail({ id: 'movies-award', title: 'Award Winners', genres: ['Drama', 'Biography'] }),
  createRail({ id: 'movies-new', title: 'New in Theaters', genres: ['Action', 'Drama'] }),
  createRail({ id: 'movies-documentaries', title: 'Documentaries', genres: ['Documentary'] }),
  createRail({ id: 'movies-classics', title: 'Cult Classics', genres: ['Drama', 'Action'] }),
  createRail({ id: 'movies-family', title: 'Family Movies', genres: ['Family', 'Animation'] }),
  createRail({ id: 'movies-history', title: 'War & History', genres: ['History', 'Drama'] }),
  createRail({ id: 'movies-crime', title: 'Crime Movies', genres: ['Crime', 'Thriller'] }),
  createRail({ id: 'movies-horror', title: 'Horror Movies', genres: ['Horror'] }),
  createRail({ id: 'movies-romcom', title: 'Romantic Comedies', genres: ['Romance', 'Comedy'] }),
  createRail({ id: 'movies-superhero', title: 'Superhero Movies', genres: ['Action', 'Sci-Fi'] }),
  createRail({ id: 'movies-heist', title: 'Heist Movies', genres: ['Thriller', 'Crime'] }),
  createRail({ id: 'movies-musicals', title: 'Musicals', genres: ['Musical'] }),
  createRail({ id: 'movies-indie', title: 'Indie Films', genres: ['Drama', 'Indie'] }),
  createRail({ id: 'movies-sports', title: 'Sports Movies', genres: ['Drama', 'Sports'] }),
  createRail({
    id: 'movies-true-events',
    title: 'Based on True Events',
    genres: ['Drama', 'Biography'],
  }),
  createRail({ id: 'movies-foreign', title: 'Foreign Films', genres: ['Drama', 'Foreign'] }),
  createRail({ id: 'movies-mystery', title: 'Mystery Movies', genres: ['Mystery', 'Thriller'] }),
  createRail({ id: 'movies-adventure', title: 'Adventure Movies', genres: ['Adventure'] }),
  createRail({ id: 'movies-biopics', title: 'Biopics', genres: ['Biography', 'Drama'] }),
  createRail({
    id: 'movies-classic-hollywood',
    title: 'Classic Hollywood',
    genres: ['Drama', 'Classic'],
  }),
  createRail({ id: 'movies-animated', title: 'Animated Movies', genres: ['Animation', 'Family'] }),
]

export default { hero, rails }
