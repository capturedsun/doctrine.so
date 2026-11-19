// doctrine.so inside Forum: the site's routes.js, run by apps/website/server/actor.js
// (~/frm.so/_docs/site.md). One page: the shell for its browser (desktop/ or
// mobile/shell.html) with its head put in at <!--seo--> and the hero of Davinci's
// page C (the night edition), from _/text/home.html, at <!--page-->. It has two
// views, home (/) and the download panel (/download), which _/code/views.js
// switches in place; either path is answered with the page, its view set.

var siteUrl = String(config.siteUrl || 'https://doctrine.so').replace(/\/+$/, '')
// the app's release, in site.json alone: its version (as ~/doctrine/package.json has it), for the subtitle under
// the wordmark and the dmg's name in the latest release; and the dmg's size in bytes, as the release's API answer
// gave it (none: no size shown). A release sets both there once.
var version = String(config.version || '')
var download = 'https://github.com/capturedsun/doctrine.so/releases/latest/download/Doctrine-' + version + '-universal.dmg'
var size = Number(config.dmgSize) > 0 ? ' · ' + Math.round(Number(config.dmgSize) / 1e6) + ' MB' : ''
var PAGES = {
    '/': { view: 'home', title: 'Doctrine — The Hierarchical Harness', description: 'Build your AI army. Recruit agents with a name, rank, and team, and watch them work through the chain of command.' },
    '/download': { view: 'download', title: 'Download — Doctrine', description: 'Doctrine for the Mac, one universal app for Apple silicon and Intel.' },
}
var NOT_FOUND = { view: 'home', title: 'Not found — Doctrine', description: 'No such page.' }

var escapeHtml = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') }

function headFor(path, p) {
    var url = siteUrl + path
    return [
        '<title>' + escapeHtml(p.title) + '</title>',
        '<meta name="description" content="' + escapeHtml(p.description) + '">',
        '<link rel="canonical" href="' + escapeHtml(url) + '">',
        '<meta property="og:title" content="' + escapeHtml(p.title) + '">',
        '<meta property="og:description" content="' + escapeHtml(p.description) + '">',
        '<meta property="og:url" content="' + escapeHtml(url) + '">',
        '<meta property="og:image" content="' + escapeHtml(siteUrl + '/_/images/badge-exact.png') + '">',
    ].join('\n  ')
}

// the hero with its copy for a page not found: no canvas, no panel
function notFoundBody(home) {
    return home.replace(/<div class="copy">[\s\S]*<\/header>/, '<div class="copy">\n      <h1>Not <span>found</span>.</h1>\n      <p class="lede">There is no such page. <a href="/" style="text-decoration:underline">Return home</a>.</p>\n    </div>\n  </div>\n</header>')
}

function page(req, res) {
    var shell = fileRead((req.mobile ? 'mobile' : 'desktop') + '/shell.html'), home = fileRead('_/text/home.html')
    if (shell == null || home == null) return res.text(500, 'the site has no shell or no page')
    var p = PAGES[req.path], at = p || NOT_FOUND
    home = home.replace(/\{\{version\}\}/g, escapeHtml(version)).replace(/\{\{download\}\}/g, escapeHtml(download)).replace(/\{\{size\}\}/g, escapeHtml(size)).replace(/\{\{view\}\}/g, at.view)
    res.html(p ? 200 : 404, shell.replace('<!--seo-->', headFor(req.path, at)).replace('<!--page-->', (p ? home : notFoundBody(home)).replace(/\n$/, '')))
}

Object.keys(PAGES).forEach(function (path) { routes['GET ' + path] = page })
routes['GET /*'] = page // (every other path: the shell with the not-found page)
// the macOS app's updater (desktop/updater.js: Electron's autoUpdater, Squirrel.Mac, serverType 'json'): the static
// feed Squirrel reads. It compares currentRelease with the running app's version and, when it is higher, downloads the
// entry's updateTo.url, the signed universal .zip of that version's release (by its tag, never 'latest'). site.json
// holds what release.mjs's site step wrote: version, zipSize, zipSha256 (a download that differs is refused), pubDate.
routes['GET /update/mac'] = function (req, res) {
    if (!/^\d+\.\d+\.\d+$/.test(version)) return res.send(503, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-cache' }, 'no release yet\n')
    var zip = 'Doctrine-' + version + '-universal.zip'
    var to = { version: version, name: version, notes: '', url: 'https://github.com/capturedsun/doctrine.so/releases/download/v' + version + '/' + zip }
    if (config.pubDate) to.pub_date = String(config.pubDate)
    if (Number(config.zipSize) > 0) to.size = Number(config.zipSize)
    if (/^[0-9a-f]{64}$/.test(String(config.zipSha256 || ''))) to.sha256 = String(config.zipSha256)
    res.send(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }, JSON.stringify({ currentRelease: version, releases: [{ version: version, updateTo: to }] }) + '\n')
}
routes['GET /robots.txt'] = function (req, res) { res.text(200, 'User-agent: *\nAllow: /\n\nSitemap: ' + siteUrl + '/sitemap.xml\n') }
routes['GET /sitemap.xml'] = function (req, res) {
    var urls = Object.keys(PAGES).map(function (path) { return '  <url><loc>' + siteUrl + path + '</loc></url>' }).join('\n')
    res.send(200, { 'Content-Type': 'application/xml' }, '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '\n</urlset>\n')
}
