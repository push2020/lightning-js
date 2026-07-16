import Blits from '@lightningjs/blits'
import PageContainer from '../components/PageContainer.js'
import moviesData from '../data/movies.js'

/**
 * Movies page: hero carousel plus 10 movie rails (Trending, Blockbusters,
 * genres, Award Winners, New in Theaters, Documentaries).
 */
export default Blits.Component('Movies', {
  components: {
    PageContainer,
  },
  template: '<PageContainer :hero="$hero" :rails="$rails" />',
  state() {
    return {
      /**
       * Hero carousel slides for the Movies page
       * @type {object[]}
       */
      hero: moviesData.hero,
      /**
       * Content rails for the Movies page
       * @type {object[]}
       */
      rails: moviesData.rails,
    }
  },
})
