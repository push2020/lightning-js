import Blits from '@lightningjs/blits'
import { SCROLL_TRANSITION_DURATION, SCROLL_TRANSITION_EASING } from '../constants/animation.js'

// Note: template values are hardcoded literals - see FocusBorder.js for why.
// 1920x880 matches constants/layout.js STAGE_W/HERO_HEIGHT. x="64" on the copy
// block matches constants/layout.js CONTENT_PADDING_X.

/**
 * A single hero banner slide: full-bleed background image, gradient overlay
 * and slide copy. Crossfades in/out based on the `active` prop, which the
 * parent HeroCarousel controls.
 */
export default Blits.Component('HeroSlide', {
  template: `
    <Element w="1920" h="880" :alpha.transition="$alphaTransition">
      <Element w="1920" h="880" :src="$imageSrc" fit="cover" color="#ffffff" />
      <Element w="1920" h="880" color="{bottom: '#0B0B0B', top: 'rgba(11, 11, 11, 0.1)'}" />
      <Element w="1920" h="260" y="620" color="{bottom: '#0B0B0B', top: 'rgba(11, 11, 11, 0)'}" />
      <Element y="520" w="900" x="64">
        <Text :content="$subtitle" size="28" color="#00B3FF" />
        <Text y="46" :content="$title" size="72" color="#FFFFFF" maxwidth="900" maxlines="1" />
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
     * Image src descriptor with keepAlive set, so the hero texture survives
     * this slide's destruction (e.g. on tab switch) and is reused instead of
     * being re-fetched/decoded/re-uploaded on remount
     * @returns {{src: string, keepAlive: boolean}}
     */
    imageSrc() {
      return { src: this.image, keepAlive: true }
    },
    /**
     * Transition config that smoothly crossfades this slide in/out when the
     * `active` prop changes, instead of jumping straight to the target alpha
     * @returns {{value: number, duration: number, easing: string}}
     */
    alphaTransition() {
      return {
        value: this.active ? 1 : 0,
        duration: SCROLL_TRANSITION_DURATION,
        easing: SCROLL_TRANSITION_EASING,
      }
    },
  },
})
