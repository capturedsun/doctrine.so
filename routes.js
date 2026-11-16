// doctrine.so inside Forum: the site's routes.js, run by apps/website/server/actor.js
// (~/frm.so/_docs/site.md). One page: the shell for its browser (desktop/ or
// mobile/shell.html) with its head put in at <!--seo--> and the hero of Davinci's
// page C (the night edition), from _/text/home.html, at <!--page-->. The download
// is the hero's Download box; /download, the old page, sends you home.

var siteUrl = String(config.siteUrl || 'https://doctrine.so').replace(/\/+$/, '')
var HOME = { title: 'Doctrine — The Hierarchical Harness', description: 'Build your AI army. Recruit agents with a name, rank, and team, and watch them work through the chain of command.' }
var NOT_FOUND = { title: 'Not found — Doctrine', description: 'No such page.' }

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

// the hero with its copy for a page not found, and no canvas
function notFoundBody(home) {
    return home.replace(/<div class="copy">[\s\S]*<\/header>/, '<div class="copy">\n      <h1>Not <span>found</span>.</h1>\n      <p class="lede">There is no such page.</p>\n      <div class="actions"><a class="btn primary" href="/">Return home</a></div>\n    </div>\n  </div>\n</header>')
}

function page(req, res) {
    var shell = fileRead((req.mobile ? 'mobile' : 'desktop') + '/shell.html'), home = fileRead('_/text/home.html')
    if (shell == null || home == null) return res.text(500, 'the site has no shell or no page')
    var found = req.path === '/'
    res.html(found ? 200 : 404, shell.replace('<!--seo-->', headFor(found ? '/' : req.path, found ? HOME : NOT_FOUND)).replace('<!--page-->', (found ? home : notFoundBody(home)).replace(/\n$/, '')))
}

routes['GET /'] = page
routes['GET /*'] = page // (every other path: the shell with the not-found page)
routes['GET /download'] = function (req, res) { res.send(301, { Location: '/' }, '') }
routes['GET /robots.txt'] = function (req, res) { res.text(200, 'User-agent: *\nAllow: /\n\nSitemap: ' + siteUrl + '/sitemap.xml\n') }
routes['GET /sitemap.xml'] = function (req, res) {
    res.send(200, { 'Content-Type': 'application/xml' }, '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>' + siteUrl + '/</loc></url>\n</urlset>\n')
}
