import Blits from '@lightningjs/blits'
import PageContainer from '../components/PageContainer.js'
import getHomeData from '../data/home.js'

/**
 * Home page: hero carousel plus 10 content rails (Trending, Popular,
 * Continue Watching, genres, Recommended, Top Rated, New Releases, Documentaries).
 */
export default Blits.Component('Home', {
  components: {
    PageContainer,
  },
  template: '<PageContainer :hero="$hero" :rails="$rails" />',
  state() {
    const homeData = getHomeData()
    return {
      /**
       * Hero carousel slides for the Home page
       * @type {object[]}
       */
      hero: homeData.hero,
      /**
       * Content rails for the Home page
       * @type {object[]}
       */
      rails: homeData.rails,
    }
  },
})
