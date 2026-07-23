# How this app works

A simple guide to the OTT (JioTV+ style) streaming app in this repo — what it does and how the code is organized. For install/run commands, see [README.md](README.md).

## What this is

A TV-app UI (Home / Movies / Shows / Sports) built with **Blits**, a component framework for the **Lightning 3** rendering engine (made for smart TVs, set-top boxes, game consoles — anything driven by a remote control instead of a mouse). There's no backend: all content (titles, images, descriptions) is generated in code from a handful of word lists and [Lorem Picsum](https://picsum.photos) images.

## The 30-second mental model

- Every page is: **one hero banner carousel** + **a stack of horizontal "rails"** (rows of poster cards), scrolling vertically.
- A remote control has 6 buttons that matter: **Left / Right / Up / Down / Enter / Back**. Nothing is clicked with a mouse.
- At any moment, exactly **one component on screen "has focus"** and is the thing reacting to button presses — like a cursor, except it's a whole component instead of a blinking line.
- The app uses a single **low-end tier** config to set render quality and how many off-screen cards/rails/slides are kept mounted, since low-end settings run acceptably on both constrained and high-end hardware.

## Folder structure

```
src/
  index.js            Boots the app (screen size, low-end tier launch settings, keymap)
  App.js              Root component: router + navbar + boot splash + exit-confirmation dialog
  pages/              One file per page (Home, Movies, Shows, Sports)
  components/         Reusable UI pieces (see below)
  data/                Generated dummy content for each page
  constants/           Shared numbers (layout, theme colors/fonts, transition timing)
  helpers/             Small pure functions (scroll math, tier config, focus sound)
```

### components/

| Component | What it does |
|---|---|
| `Navbar` | Top bar with the logo and 4 tabs. Handles Left/Right to move between tabs, Down/Enter to hand off into the page content. |
| `PageContainer` | The "page template" used by every page: lays out the hero + all its rails, handles Up/Down between them, remembers scroll position, and virtualizes which rails are mounted. |
| `HeroCarousel` / `HeroSlide` | The big auto-playing banner at the top of every page. Virtualizes which slides are mounted and works around a canvas text-rendering quirk (see below). |
| `ContentRail` | One horizontally-scrolling row of cards (e.g. "Trending Now"). Virtualizes which cards are mounted and owns a single fixed focus border. |
| `PosterCard` | A single poster: image, title, genre, progress bar (for Continue Watching). Purely prop-driven, has no notion of focus. |
| `FocusBorder` | The glow + white border drawn over whichever card/option is focused. Reusable, `active`/`w`/`h` props only. |
| `SkeletonCard` | Placeholder block shown while a poster image is still loading. |
| `LoadingScreen` | Splash screen shown for ~0.6s while the app boots. |
| `ExitConfirmModal` | Full-screen "Exit App?" dialog shown when Back is pressed with nowhere left to go (i.e. the Navbar itself is focused). |
| `PerfHud` | Fixed overlay in the top-right showing live FPS / frame time / main-thread work time, sampled via its own `requestAnimationFrame` loop. |
| `Loader` | Static three-dot loading indicator (no animation). |

### pages/

Each page (`Home.js`, `Movies.js`, `Shows.js`, `Sports.js`) is intentionally tiny — it just imports its data file and renders `<PageContainer :hero="..." :rails="..." />`. All the actual layout/behavior logic lives once in `PageContainer`, not copy-pasted per page.

### data/

- `contentFactory.js` — the two functions that build fake content: `createRail(...)` (generates N poster cards with made-up titles like "Crimson Wolves") and `createHeroSlides(...)` (attaches a background image to each hero slide). Both read the tier's `images` config (`getTierConfig().images`) to request appropriately-sized poster/hero images.
- `images.js` — turns a rail/page id + width/height into a Lorem Picsum URL, cycling through categories (mountains, ocean, animals, etc.) so images don't repeat. It's tier-agnostic — the caller (`contentFactory.js`) decides what size to ask for.
- `home.js` / `movies.js` / `shows.js` / `sports.js` — each just calls `createRail`/`createHeroSlides` to declare that page's hero slides and list of rails. **This is the file to edit if you want to add/rename/remove rails or change hero copy.**

## How Blits templates work (the unusual part)

Every component has a `template` string written in an HTML-like syntax:

```js
template: `
  <Element w="200" h="100" color="#333">
    <Text :content="$title" />
  </Element>
`
```

- Plain attributes (`w="200"`) are fixed values.
- A `$` prefix (`$title`) reads a `state`/`props`/`computed` value from the component.
- A `:` prefix on the attribute name (`:content="..."`) makes it **reactive** — it re-renders automatically whenever that value changes. Without the `:`, it's set once and never updates.

**Important quirk found while building this:** the `template` string is scanned as plain text by the build tool *before* your JavaScript ever runs. That means you **cannot** use normal JS template-literal interpolation like `` `w="${STAGE_W}"` `` inside a `template:` block — it won't be substituted, and will break the build. That's why every component's template uses hardcoded numbers (with a comment noting which constant they should match), while the surrounding JavaScript (`computed`, `methods`, `state`) uses the real imported constants normally.

**Second quirk found while building this — Text nodes and alpha 0:** the canvas-based text renderer only rasterizes a `Text` node's glyphs on its *first* paint attempt. If that first attempt happens while the node (or an ancestor) is at `alpha=0` or mid-animation-up-from-0, the glyphs never get rasterized — even after alpha later settles at 1, the text stays blank forever (plain colored rects are unaffected; this is Text-specific). This shows up in three places and is worked around differently in each:
- **Page routing** (`App.js`): Blits' default route transition fades the incoming page in from alpha 0. The fix is to drop the "in" fade entirely (`TAB_TRANSITION` only defines an `out` fade) so new pages never render their first frame at alpha 0.
- **`ExitConfirmModal`**: instead of toggling the dialog card's alpha, it's moved off-stage horizontally (`x=1920`) to hide it, so its Text children are always painted at alpha 1. Only the Text-free dim backdrop uses a plain alpha toggle.
- **`HeroSlide`**: see the two-`requestAnimationFrame` reveal logic below.

## How virtualization works (tier-based)

To avoid keeping the entire page's worth of hero slides / rails / cards mounted at once, three components only mount a small window of items around whatever's currently focused, using Blits' `:range="{from, to}"` directive on a `:for` loop:

- **`HeroCarousel`** — mounts `[slideWinStart, slideWinEnd)`, centered on the current slide plus `heroNeighbors` slides on each side. Window is recomputed in `goToSlide()`.
- **`ContentRail`** — mounts `[winStart, winEnd)`, sized to fit the visible viewport width plus a `cardBuffer` of extra cards on each side. Window is recomputed in `updateScroll()`.
- **`PageContainer`** — mounts `[railWinStart, railWinEnd)` rails, sized to `railVisibleRows` plus `railBufferUp`/`railBufferDown` extra rails above/below. Window is recomputed in `updateRailWindow()`, which must run *before* focusing a rail (`focusCurrentSection()`), since a rail outside the window isn't in the tree yet and can't be found by `$select()`.

The buffer/window sizes above (`heroNeighbors`, `cardBuffer`, `railBufferUp`, `railBufferDown`, `railVisibleRows`) — plus poster/hero image resolution and Lightning's launch-time render settings (`renderQuality`, `maxFPS`, `viewportMargin`, `gpuMemory`) — all come from **`helpers/deviceTier.js`**, which exposes a single low-end tier config used for every device (it runs acceptably on constrained and high-end hardware alike, so there's no need to detect device capability).

`getLaunchSettings()` feeds `Blits.Launch()` in `index.js`; `getTierConfig()` feeds the per-component window sizes and `contentFactory.js`'s image dimensions.

## How remote-control focus & navigation works

This is the trickiest part of the codebase, so here's the full picture.

**Rule #1:** Only one component has focus at a time. When you press a key, Blits sends it to whichever component currently has focus. If that component doesn't handle the key, it automatically bubbles up to its parent, then its parent's parent, and so on.

**Rule #2:** A component "hands off" focus by calling `.$focus()` on another component (usually found via `this.$select('someRef')`).

Given that, here's the actual flow in this app:

1. **App boots** → `App.js` shows the splash for ~0.6s, then focuses the `Navbar`.
2. **Navbar has focus** → Left/Right moves between Home/Movies/Shows/Sports and switches pages immediately. Down (or Enter) hands focus into the current page.
3. **Page content has focus** → Down moves to the next rail, Up moves to the previous one. Left/Right inside a rail moves between cards. At the topmost rail, pressing Up hands focus back to the Navbar.
4. **A rail remembers its own state** — which card was selected and how far it had scrolled — because the rail component instance is never destroyed, just visually un-highlighted when you move away. Come back down to that rail later and it's exactly how you left it.
5. **Back with nowhere left to go** — if Back is pressed while the Navbar itself is focused (i.e. it bubbled all the way up with no page/rail handling it), `App.js` opens `ExitConfirmModal`, which takes over focus until the user picks Cancel/Exit or presses Back again.

Since the Navbar and the page content are "cousins" in the component tree (not parent/child), they can't call `.$focus()` on each other directly. Instead they talk through Blits' built-in event bus:

- Navbar does `this.$emit('nav:focus-content')` when you press Down.
- `PageContainer` is listening for that event and focuses whichever section (hero or rail) the user was on last.
- `PageContainer` does `this.$emit('nav:focus-navbar')` when you press Up from the top section.
- `App.js` is listening for that and re-focuses the Navbar.
- Similarly, `ExitConfirmModal` emits `app:confirm-exit` / `app:cancel-exit`, which `App.js` listens for to actually close the window or return focus to the Navbar.

### Focus borders: one fixed border per rail, not one per card

`PosterCard` has no notion of focus at all — it's purely prop-driven (image, title, genre, progress). Instead, `ContentRail` renders a **single `FocusBorder`, fixed at `x="64"` (= `CARD_PEEK_WIDTH`, lining up with the rail title's own `x="64"`)**, outside the horizontally-scrolling card track. `getRailScrollOffset()` always slides the selected card into that same fixed slot, so visually the border appears to stay in place while the card track glides underneath it — rather than the border re-parenting or re-animating to a new card position on every Left/Right press — and the first card always rests at this same usual position at boot. The card track itself is full-bleed edge-to-edge across the whole 1920px screen (like `HeroSlide`'s background image) — only the rail's title text keeps the app's usual `x="64"` margin — so once you scroll past the first card, its edge peeks/cuts off at the rail's true left screen edge instead of disappearing entirely, and cards get cut off by the true right screen edge too: a peek carousel. `ExitConfirmModal` reuses the same `FocusBorder` component per-option (Cancel/Exit), since it only has two static options and no scrolling track.

## How scrolling works

There's no real "scrolling" — it's all done by animating a container's `x`/`y` position, using a shared transition timing (`SCROLL_TRANSITION_DURATION` / `SCROLL_TRANSITION_EASING` in `constants/animation.js`) so page scroll, rail scroll, and hero crossfades all feel like the same smooth glide:

- **Vertical (page) scroll**: `PageContainer` keeps track of which section is focused (`0` = hero, `1+` = rail index) and moves the whole content stack up by that much, in `helpers/scroll.js`'s `getPageScrollOffset`. It's offset by the navbar's height so the focused rail's title never ends up hidden behind the fixed navbar bar.
- **Horizontal (rail) scroll**: `ContentRail` always scrolls so the focused card sits in its fixed slot, `CARD_PEEK_WIDTH` in from the row's left edge (the same slot for every card, including the first, so the row always starts at its usual position at rest) — even the very last card, which leaves blank space after it — so once scrolled, the previous card's edge stays peeking into view rather than disappearing entirely, and the full-bleed track lets cards get cut off by the true screen edge on the right too. That's `getRailScrollOffset` in the same file.
- **Hero crossfade**: `HeroSlide` transitions its background image's `alpha` between 0 and 1 as `active` changes, using the same shared duration/easing.

Cards/slides/rails outside their component's virtualization window (see above) simply aren't mounted at all until they scroll into range, which keeps memory and node count bounded regardless of how much content a page has.

### The hero slide two-frame reveal

Because a `HeroSlide` can be freshly mounted mid-scroll by the hero carousel's virtualization window, and because Text nodes never recover if their first paint happens at alpha 0 or mid-fade-in (see the quirk above), `HeroSlide` holds its copy block (title/subtitle/description) at **alpha 1 unconditionally** until it has confirmed two real animation frames have painted since it mounted:

```js
ready() {
  this._revealRafId = requestAnimationFrame(() => {
    this._revealRafId = requestAnimationFrame(() => {
      this.mounted = true
    })
  })
}
```

Only after `mounted` flips to `true` does the copy block start following `active` (fading with the rest of the slide); the background image's own crossfade transition is likewise held at duration `0` until `mounted`, so a newly-mounted slide snaps straight to its resting alpha instead of visibly animating up from the engine's default. If the slide is destroyed before the two frames land (e.g. scrolled out of range quickly), `destroy()` cancels the pending `requestAnimationFrame` to avoid setting state on a dead component.

`HeroCarousel` additionally gives its CTA button and pagination dots an explicit `zIndex="1"` — Blits stacks siblings by creation order, not template order, and slides mounted later by the virtualization window would otherwise render on top of the CTA/dots without it.

## Adding new content

To add a rail to a page, open its data file (e.g. `src/data/home.js`) and add one more `createRail({...})` entry to the `rails` array — give it a unique `id`, a `title`, and a small list of `genres`. Images and card titles are generated automatically. To change how many cards a rail gets, pass `count: N`.

## Where things are styled

- `constants/theme.js` — all the colors (background, accent blue, text colors) and font names.
- `constants/layout.js` — all the pixel sizes (card size, rail height, navbar height, etc).
- `constants/animation.js` — shared scroll/crossfade transition duration and easing, used by `ContentRail`, `HeroCarousel`/`HeroSlide`, and `PageContainer`.

Changing a value in these files updates the JS-side math (scroll calculations, etc.), but remember: because of the template quirk above, the actual visual `template` markup in each component has its own hardcoded copy of these same numbers, with a comment pointing back to the constant it should match.
