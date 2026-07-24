import Blits from '@lightningjs/blits'
import { CARD_TEXT_STRIP_HEIGHT } from '../constants/layout.js'
import { IMAGE_LOAD_DELAY, CARD_LIFT } from '../constants/animation.js'
import { isFastScrolling, onSettled } from '../helpers/loadGate.js'
import { isImageLoaded, markImageLoaded } from '../helpers/imageCache.js'
import SkeletonCard from './SkeletonCard.js'

// Note: template values are hardcoded literals - see FocusBorder.js for why.
// Image area is $w x $imageH, with a 90px (CARD_TEXT_STRIP_HEIGHT) title/genre
// strip below it, so $h = $imageH + 90 for both the portrait (260x390) and
// landscape (460x349) card variants - see constants/layout.js.

/**
 * A single OTT poster card: image, title and genre. Purely prop-driven and
 * has no notion of keyboard focus - the parent rail owns real focus and
 * renders a single fixed focus border over whichever card slides into the
 * selected slot (see ContentRail.js). Its only bit of self-animation is the
 * `lifted` prop: when the parent marks this card as the focused one, its
 * content rises by CARD_LIFT.offset px with a short ease-out (hover-lift).
 */
export default Blits.Component('PosterCard', {
  components: {
    SkeletonCard,
  },
  template: `
    <Element :w="$w" :h="$h">
      <Element :w="$w" :h="$h" :y.transition="$liftTransition">
        <Element
          :w="$w"
          :h="$imageH"
          color="#ffffff"
          :src="$imageSrc"
          fit="cover"
          @loaded="$onImageLoaded"
          @error="$onImageError"
        >
          <Element :show="$hasProgress" :y="$imageH - 6" :w="$w" h="6" color="rgba(255, 255, 255, 0.25)">
            <Element h="6" color="#00B3FF" :w="$w * $progressValue" />
          </Element>
        </Element>
        <SkeletonCard :show="!$imageLoaded" :w="$w" :h="$imageH" />
        <Element :y="$imageH + 14" :w="$w">
          <Text :content="$title" size="26" color="#FFFFFF" maxwidth="$w" maxlines="1" />
          <Text y="32" :content="$genre" size="20" color="#AAAAAA" maxwidth="$w" maxlines="1" />
        </Element>
      </Element>
    </Element>
  `,
  props: {
    title: '',
    genre: '',
    image: '',
    progress: undefined,
    w: 260,
    h: 390,
    /**
     * Whether this card is the focused card in its rail. When true the card
     * content lifts up by CARD_LIFT.offset px; the parent rail sets this on the
     * selected card only while the rail has focus (see ContentRail.js).
     */
    lifted: false,
  },
  state() {
    return {
      /**
       * Whether the poster image has finished loading
       * @type {boolean}
       */
      imageLoaded: false,
      /**
       * Whether this card is allowed to load its image yet. Starts false so the
       * texture isn't fetched the instant the card mounts; flipped true after a
       * short delay once scrolling has settled (see helpers/loadGate.js). Once
       * true it never returns to false, so a loaded card stays loaded.
       * @type {boolean}
       */
      canLoad: false,
    }
  },
  computed: {
    /**
     * Texture descriptor for the poster image, or undefined until this card is
     * cleared to load (keeping the src unset means no fetch/decode happens
     * while the card is only being scrolled past). keepAlive keeps the decoded
     * texture resident after first load so re-scrolling never reloads it.
     * @returns {{src: string, keepAlive: boolean} | undefined}
     */
    imageSrc() {
      return this.canLoad ? { src: this.image, keepAlive: true } : undefined
    },
    /**
     * Height of the image area, leaving room for the fixed-height title/genre
     * strip below it, regardless of the card's overall (portrait/landscape) size
     * @returns {number}
     */
    imageH() {
      return this.h - CARD_TEXT_STRIP_HEIGHT
    },
    /**
     * Whether this card should display a continue-watching progress bar
     * @returns {boolean}
     */
    hasProgress() {
      return typeof this.progress === 'number'
    },
    /**
     * Normalized progress value clamped between 0 and 1
     * @returns {number}
     */
    progressValue() {
      if (typeof this.progress !== 'number') return 0
      return Math.min(Math.max(this.progress, 0), 1)
    },
    /**
     * Vertical-offset transition for the hover-lift. Resting cards sit at y=0
     * (matching the engine's default, so a freshly mounted card doesn't animate
     * into place); the focused card animates up to -CARD_LIFT.offset with a
     * short ease-out and drops back down when focus leaves it.
     * @returns {{value: number, duration: number, easing: string}}
     */
    liftTransition() {
      return {
        value: this.lifted ? -CARD_LIFT.offset : 0,
        duration: CARD_LIFT.duration,
        easing: CARD_LIFT.easing,
      }
    },
  },
  hooks: {
    /**
     * Kicks off deferred image loading once the card is mounted, instead of
     * fetching the texture immediately from the template. If this image already
     * loaded earlier this session, it's shown instantly (no skeleton, no delay)
     * so a card remounted on scroll-back never appears to reload.
     * @returns {void}
     */
    ready() {
      if (isImageLoaded(this.image)) {
        this.canLoad = true
        this.imageLoaded = true
        return
      }
      this.scheduleImageLoad()
    },
    /**
     * Cancels any pending load timer/subscription if the card is scrolled out
     * of range before its image was cleared to load.
     * @returns {void}
     */
    destroy() {
      clearTimeout(this._loadTimer)
      this._unsubscribeSettled?.()
      this._unsubscribeSettled = null
    },
  },
  methods: {
    /**
     * Waits IMAGE_LOAD_DELAY after mount, then either loads the image (a calm,
     * settled view) or, if a fast scroll is in flight, waits for it to settle
     * so only cards left in the viewport end up loading.
     * @returns {void}
     */
    scheduleImageLoad() {
      this._loadTimer = setTimeout(() => {
        if (isFastScrolling()) {
          this._unsubscribeSettled = onSettled(() => {
            this._unsubscribeSettled = null
            this.canLoad = true
          })
        } else {
          this.canLoad = true
        }
      }, IMAGE_LOAD_DELAY)
    },
    /**
     * Reveals the poster image and hides the skeleton placeholder once loaded
     * @returns {void}
     */
    onImageLoaded() {
      this.imageLoaded = true
      markImageLoaded(this.image)
    },
    /**
     * Keeps the skeleton placeholder visible when the poster image fails to load
     * @returns {void}
     */
    onImageError() {
      this.imageLoaded = false
    },
  },
})
