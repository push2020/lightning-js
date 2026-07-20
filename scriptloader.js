import fs from 'fs'
import path from 'path'

const DIST_DIR = path.resolve('dist')
const PKGCONFIG_FILENAME = 'pkgconfig.js'

// Note: unlike a classic webpack bundle, Vite's own output is real ES modules
// (they use native `import`/`export`), so every discovered .js file must be
// injected as `<script type="module">` - a plain classic <script> would throw
// a syntax error on the `import` statements inside it.

/**
 * Recursively walks the Vite build output and collects every .js and .css
 * file in it (skipping the generated pkgconfig.js itself), so anything Vite
 * emits - now or after future changes - is picked up automatically without
 * needing to be registered anywhere by hand.
 * @param {string} dir - directory to walk
 * @returns {{type: string, relativePath: string}[]} discovered files, paths relative to DIST_DIR
 */
function walkDistDir(dir) {
  const found = []
  const entries = fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }) : []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      found.push(...walkDistDir(fullPath))
      continue
    }

    if (entry.name === PKGCONFIG_FILENAME) continue

    if (entry.name.endsWith('.js')) {
      found.push({ type: 'js', relativePath: path.relative(DIST_DIR, fullPath) })
    } else if (entry.name.endsWith('.css')) {
      found.push({ type: 'css', relativePath: path.relative(DIST_DIR, fullPath) })
    }
  }

  return found
}

/**
 * Converts every discovered dist/ file into the {type, url} shape the
 * generated loader expects. The `${domain}` text is intentionally a literal
 * string here (not interpolated) - buildPkgConfigSource() below wraps it in
 * backticks so it becomes a real template expression, evaluated later in the
 * browser at runtime, letting the same build run from any host/base path.
 * @returns {{type: string, url: string}[]}
 */
function getAllDistFiles() {
  return walkDistDir(DIST_DIR)
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath))
    .map(({ type, relativePath }) => ({
      type,
      url: '${domain}/' + relativePath.split(path.sep).join('/'),
    }))
}

/**
 * Generates dist/pkgconfig.js: a runtime manifest that resolves its own
 * base URL from the script tag that loaded it, then loads every discovered
 * file in sequence as an ES module (or a stylesheet, for .css).
 * @param {{type: string, url: string}[]} files - files to embed in the manifest
 * @returns {string} JS source for pkgconfig.js
 */
function buildPkgConfigSource(files) {
  const resourceList = files
    .map((file) => `  { type: "${file.type}", url: \`${file.url}\` }`)
    .join(',\n')

  return `var domain = ''
const baseHref = document.getElementById('pkgconfigscript')
if (baseHref) {
  const url = new URL(baseHref.src)
  domain = \`\${url.protocol}//\${url.hostname}\${url.port ? ':' + url.port : ''}\`
}

const filesToLoad = [
${resourceList}
]

// Loads a single file. JS files are loaded as ES modules (Vite's build output
// uses native import/export), so a classic script would fail on that syntax.
function loadScript(url) {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.type = 'module'
    script.src = url
    script.onload = () => resolve()
    script.onerror = () => resolve(new Error(\`Failed to load \${url}\`))
    document.body.appendChild(script)
  })
}

function loadCss(url) {
  const link = document.createElement('link')
  link.href = url
  link.rel = 'stylesheet'
  document.head.appendChild(link)
}

async function loadAllFiles() {
  for (const file of filesToLoad) {
    if (file.type === 'js') {
      await loadScript(file.url)
    } else if (file.type === 'css') {
      loadCss(file.url)
    }
  }
}

loadAllFiles().catch((err) => console.error('Loading error:', err))
`
}

/**
 * Rewrites dist/index.html to replace Vite's auto-injected module entry
 * script with the pkgconfig.js loader tag, leaving everything else (styles,
 * the scale-to-fit boot script, favicon, title) exactly as Vite generated it.
 * @returns {void}
 */
function rewriteIndexHtml() {
  const indexPath = path.join(DIST_DIR, 'index.html')
  const html = fs.readFileSync(indexPath, 'utf8')

  const withoutEntryScript = html.replace(
    /\s*<script type="module"[^>]*src="[^"]*"[^>]*><\/script>/,
    ''
  )
  const withLoader = withoutEntryScript.replace(
    '</body>',
    '        <script id="pkgconfigscript" src="/pkgconfig.js"></script>\n    </body>'
  )

  fs.writeFileSync(indexPath, withLoader)
}

const files = getAllDistFiles()
fs.writeFileSync(path.join(DIST_DIR, PKGCONFIG_FILENAME), buildPkgConfigSource(files))
rewriteIndexHtml()
