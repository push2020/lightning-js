import Blits from '@lightningjs/blits'
import { CONTENT_PADDING_X } from '../constants/layout.js'
import { DURATION, EASING, transition } from '../helpers/animations.js'

const COPY_X = CONTENT_PADDING_X
const COPY_X_INACTIVE = CONTENT_PADDING_X - 60

// Note: template values are hardcoded literals - see FocusBorder.js for why.
// 1920x880 matches constants/layout.js STAGE_W/HERO_HEIGHT.

/**
 * A single hero banner slide: full-bleed background image, gradient overlay
 * and slide copy. Fades and slides in/out based on the `active` prop, which
 * the parent HeroCarousel controls.
 */
export default Blits.Component('HeroSlide', {
  template: `
    <Element w="1920" h="880" :alpha.transition="$fadeTransition">
      <Element w="1920" h="880" :src="$image" fit="cover" color="#ffffff" />
      <Element w="1920" h="880" color="{bottom: '#0B0B0B', top: 'rgba(11, 11, 11, 0.1)'}" />
      <Element w="1920" h="260" y="620" color="{bottom: '#0B0B0B', top: 'rgba(11, 11, 11, 0)'}" />
      <Element y="520" w="900" :x.transition="$slideTransition">
        <Text :content="$subtitle" size="28" color="#00B3FF" font="lato" />
        <Text y="46" :content="$title" size="72" color="#FFFFFF" font="raleway" maxwidth="900" maxlines="1" />
        <Text
          y="150"
          :content="$description"
          size="28"
          color="#AAAAAA"
          maxwidth="820"
          maxlines="2"
          lineheight="38"
        />
      </Element>
    </Element>
  `,
  props: {
    image: '',
    title: '',
    subtitle: '',
    description: '',
    active: false,
  },
  computed: {
    /**
     * Transition config for fading the slide in/out as it becomes active
     * @returns {object}
     */
    fadeTransition() {
      return transition(this.active ? 1 : 0, { duration: DURATION.hero })
    },
    /**
     * Transition config for the subtle slide-in/out of the copy block
     * @returns {object}
     */
    slideTransition() {
      return transition(this.active ? COPY_X : COPY_X_INACTIVE, {
        duration: DURATION.hero,
        easing: EASING.smooth,
      })
    },
  },
})
