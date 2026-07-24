import Blits from '@lightningjs/blits'
import { SCROLL_TRANSITION_DURATION, SCROLL_TRANSITION_EASING } from '../constants/animation.js'

// Note: template values are hardcoded literals - see FocusBorder.js for why.
// 1920x880 matches constants/layout.js STAGE_W/HERO_HEIGHT. x="64" on the copy
// block matches constants/layout.js CONTENT_PADDING_X.
//
// The copy block's Text nodes need to render while genuinely visible at
// least once, or they stay blank forever - see the TAB_TRANSITION comment in
// App.js: a text node whose alpha is still 0 (or animating up from 0) the
// first time it tries to rasterize never recovers, even once alpha reaches 1
// later. $copyAlpha works around this by holding the copy at alpha 1 until
// two real animation frames have painted after this slide's `ready` hook
// fires, then dropping to the real active/inactive value. Blits' `ready`
// only means the template has been spawned, not that the browser has
// actually painted it - a single setTimeout/microtask gap (as this used
// previously) can land before that first paint, especially once the app is
// mid-scroll rather than freshly booted, which left neighbor slides snapping
// to alpha 0 before their text ever rasterized. Waiting two rAFs guarantees a
// painted frame at alpha 1 has happened first. That's a barely-perceptible
// blip in the copy block only, not the whole slide - a fair trade for text
// that reliably shows up.

/**
 * A single hero banner slide: full-bleed background image, gradient overlay
 * and slide copy. Crossfades in/out based on the `active` prop, which the
 * parent HeroCarousel controls.
 */
export default Blits.Component('HeroSlide', {
  template: `
    <Element w="1920" h="880">
      <Element w="1920" h="880" :alpha.transition="$alphaTransition">
        <Element w="1920" h="880" :src="$imageSrc" fit="cover" color="#ffffff" />
        <Element w="1920" h="880" color="{bottom: '#0B0B0B', top: 'rgba(11, 11, 11, 0.1)'}" />
        <Element w="1920" h="260" y="620" color="{bottom: '#0B0B0B', top: 'rgba(11, 11, 11, 0)'}" />
      </Element>
      <Element y="520" w="900" x="64" :alpha="$copyAlpha">
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
    /**
     * Crossfade duration (ms), driven by the parent carousel so held paging can
     * use a shorter fade than a single deliberate press.
     */
    fadeDuration: SCROLL_TRANSITION_DURATION,
    /** Crossfade easing, driven by the parent carousel. */
    fadeEasing: SCROLL_TRANSITION_EASING,
  },
  state() {
    return {
      /**
       * Whether this slide's copy block has had a guaranteed painted frame
       * to rasterize its Text nodes while visible. Starts false - see the
       * note above.
       * @type {boolean}
       */
      mounted: false,
    }
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
     * `active` prop changes, instead of jumping straight to the target alpha.
     * Uses a zero duration until this slide has completed its first mount, so
     * a slide freshly instantiated by the parent's :range window (e.g. a
     * neighbor coming into range) snaps straight to its resting alpha instead
     * of animating down from the engine's default alpha of 1 - which would
     * otherwise briefly flash that slide at full opacity on top of the
     * actually active one.
     * @returns {{value: number, duration: number, easing: string}}
     */
    alphaTransition() {
      return {
        value: this.active ? 1 : 0,
        duration: this.mounted ? this.fadeDuration : 0,
        easing: this.fadeEasing,
      }
    },
    /**
     * Alpha for the copy block only - see the note above for why this holds
     * at 1 until the first render completes, instead of following `active`
     * from the very start like the image does.
     * @returns {number}
     */
    copyAlpha() {
      return this.mounted ? (this.active ? 1 : 0) : 1
    },
  },
  hooks: {
    /**
     * Marks this slide as mounted once two real animation frames have
     * painted after the template is spawned, so the copy block settles to
     * its real active/inactive alpha only after its Text nodes have
     * genuinely rasterized while visible, and subsequent image crossfades
     * animate instead of snapping
     * @returns {void}
     */
    ready() {
      this._revealRafId = requestAnimationFrame(() => {
        this._revealRafId = requestAnimationFrame(() => {
          this.mounted = true
        })
      })
    },
    /**
     * Cancels the pending reveal frame if this slide is destroyed before it
     * completes, e.g. scrolled back out of the :range window quickly
     * @returns {void}
     */
    destroy() {
      cancelAnimationFrame(this._revealRafId)
    },
  },
})
