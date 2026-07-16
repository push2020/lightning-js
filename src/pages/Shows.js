import Blits from '@lightningjs/blits'
import PageContainer from '../components/PageContainer.js'
import showsData from '../data/shows.js'

/**
 * Shows page: hero carousel plus 10 TV show rails (Trending, Binge-Worthy,
 * genres, Anime, Award-Winning Series, New Episodes).
 */
export default Blits.Component('Shows', {
  components: {
    PageContainer,
  },
  template: '<PageContainer :hero="$hero" :rails="$rails" />',
  state() {
    return {
      /**
       * Hero carousel slides for the Shows page
       * @type {object[]}
       */
      hero: showsData.hero,
      /**
       * Content rails for the Shows page
       * @type {object[]}
       */
      rails: showsData.rails,
    }
  },
})
