import Blits from '@lightningjs/blits'
import PageContainer from '../components/PageContainer.js'
import sportsData from '../data/sports.js'

/**
 * Sports page: hero carousel plus themed sports rails (Football, Cricket,
 * Basketball, Tennis, Olympics, Motorsports).
 */
export default Blits.Component('Sports', {
  components: {
    PageContainer,
  },
  template: '<PageContainer :hero="$hero" :rails="$rails" />',
  state() {
    return {
      /**
       * Hero carousel slides for the Sports page
       * @type {object[]}
       */
      hero: sportsData.hero,
      /**
       * Content rails for the Sports page
       * @type {object[]}
       */
      rails: sportsData.rails,
    }
  },
})
