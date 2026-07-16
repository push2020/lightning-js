# How this app works

A simple guide to the OTT (JioTV+ style) streaming app in this repo — what it does and how the code is organized. For install/run commands, see [README.md](README.md).

## What this is

A TV-app UI (Home / Movies / Shows / Sports) built with **Blits**, a component framework for the **Lightning 3** rendering engine (made for smart TVs, set-top boxes, game consoles — anything driven by a remote control instead of a mouse). There's no backend: all content (titles, images, descriptions) is generated in code from a handful of word lists and [Lorem Picsum](https://picsum.photos) images.

## The 30-second mental model

- Every page is: **one hero banner carousel** + **a stack of horizontal "rails"** (rows of poster cards), scrolling vertically.
- A remote control has 5 buttons that matter: **Left / Right / Up / Down / Enter**. Nothing is clicked with a mouse.
- At any moment, exactly **one component on screen "has focus"** and is the thing reacting to button presses — like a cursor, except it's a whole component instead of a blinking line.

## Folder structure

```
src/
  index.js            Boots the app (screen size, fonts, launches App.js)
  App.js              Root component: navbar + router + boot splash screen
  pages/              One file per page (Home, Movies, Shows, Sports)
  components/         Reusable UI pieces (see below)
  data/                Generated dummy content for each page
  constants/           Shared numbers (sizes, colors) and font names
  helpers/             Small pure functions (scroll math, animation presets)
```

### components/

| Component | What it does |
|---|---|
| `Navbar` | Top bar with the logo and 4 tabs. Handles Left/Right to move between tabs, Down/Enter to hand off into the page content. |
| `PageContainer` | The "page template" used by every page: lays out the hero + all its rails, handles Up/Down between them, remembers scroll position. |
| `HeroCarousel` / `HeroSlide` | The big auto-playing banner at the top of every page. |
| `ContentRail` | One horizontally-scrolling row of cards (e.g. "Trending Now"). |
| `PosterCard` | A single poster: image, title, genre, progress bar (for Continue Watching). |
| `FocusBorder` | The glow + white border drawn around whichever card is focused. |
| `SkeletonCard` | Placeholder block shown while a poster image is still loading. |
| `LoadingScreen` | Splash screen shown for ~0.6s while the app boots. |

### pages/

Each page (`Home.js`, `Movies.js`, `Shows.js`, `Sports.js`) is intentionally tiny — it just imports its data file and renders `<PageContainer :hero="..." :rails="..." />`. All the actual layout/behavior logic lives once in `PageContainer`, not copy-pasted per page.

### data/

- `contentFactory.js` — the two functions that build fake content: `createRail(...)` (generates N poster cards with made-up titles like "Crimson Wolves") and `createHeroSlides(...)` (attaches a background image to each hero slide).
- `images.js` — turns a rail/page id into a Lorem Picsum URL, cycling through categories (mountains, ocean, animals, etc.) so images don't repeat.
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

## How remote-control focus & navigation works

This is the trickiest part of the codebase, so here's the full picture.

**Rule #1:** Only one component has focus at a time. When you press a key, Blits sends it to whichever component currently has focus. If that component doesn't handle the key, it automatically bubbles up to its parent, then its parent's parent, and so on.

**Rule #2:** A component "hands off" focus by calling `.$focus()` on another component (usually found via `this.$select('someRef')`).

Given that, here's the actual flow in this app:

1. **App boots** → `App.js` focuses the `Navbar`.
2. **Navbar has focus** → Left/Right moves between Home/Movies/Shows/Sports and switches pages immediately. Down (or Enter) hands focus into the current page.
3. **Page content has focus** → Down moves to the next rail, Up moves to the previous one. Left/Right inside a rail moves between cards. At the topmost rail, pressing Up hands focus back to the Navbar.
4. **A rail remembers its own state** — which card was selected and how far it had scrolled — because the rail component instance is never destroyed, just visually un-highlighted when you move away. Come back down to that rail later and it's exactly how you left it.

Since the Navbar and the page content are "cousins" in the component tree (not parent/child), they can't call `.$focus()` on each other directly. Instead they talk through Blits' built-in event bus:

- Navbar does `this.$emit('nav:focus-content')` when you press Down.
- `PageContainer` is listening for that event and focuses whichever section (hero or rail) the user was on last.
- `PageContainer` does `this.$emit('nav:focus-navbar')` when you press Up from the top section.
- `App.js` is listening for that and re-focuses the Navbar.

## How scrolling works

There's no real "scrolling" — it's all done by animating a container's `x`/`y` position:

- **Vertical (page) scroll**: `PageContainer` keeps track of which section is focused (`0` = hero, `1+` = rail index) and moves the whole content stack up by that much, in `helpers/scroll.js`'s `getPageScrollOffset`. It's offset by the navbar's height so the focused rail's title never ends up hidden behind the fixed navbar bar.
- **Horizontal (rail) scroll**: `ContentRail` always scrolls so the focused card sits at the **start** (left edge) of the row — even the very last card, which leaves blank space after it. That's `getRailScrollOffset` in the same file.

Cards further off-screen simply aren't rendered/loaded until they're near the visible area — Lightning does this automatically, so having a lot of rails and cards doesn't hurt performance.

## Adding new content

To add a rail to a page, open its data file (e.g. `src/data/home.js`) and add one more `createRail({...})` entry to the `rails` array — give it a unique `id`, a `title`, and a small list of `genres`. Images and card titles are generated automatically. To change how many cards a rail gets, pass `count: N`.

## Where things are styled

- `constants/theme.js` — all the colors (background, accent blue, text colors) and font names.
- `constants/layout.js` — all the pixel sizes (card size, rail height, navbar height, etc).

Changing a value in these files updates the JS-side math (scroll calculations, etc.), but remember: because of the template quirk above, the actual visual `template` markup in each component has its own hardcoded copy of these same numbers, with a comment pointing back to the constant it should match.
