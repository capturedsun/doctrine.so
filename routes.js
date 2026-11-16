// doctrine.so inside Forum: the site's routes.js, run by apps/website/server/actor.js
// (~/frm.so/_docs/site.md). Each page is the shell for its browser (desktop/ or
// mobile/shell.html) with its head put in at <!--seo--> and its body, from
// _/text/<page>.html, at <!--page-->. The pages came from Pericles's matisse
// design (a.html is the home page, download.html the download page).

var siteUrl = String(config.siteUrl || 'https://doctrine.so').replace(/\/+$/, '')
var TITLE = 'Doctrine — A chain of command for agents'
var PAGES = {
    '/': { body: '_/text/home.html', style: '/_/code/home.css', title: TITLE, description: 'Doctrine, the hierarchical harness: a chain of command for agents.' },
    '/download': { body: '_/text/download.html', style: '/_/code/download.css', title: 'Download — Doctrine', description: 'Doctrine for the Mac: the canvas, and the code behind it.' },
}
var NOT_FOUND = { style: '/_/code/download.css', title: 'Not found — Doctrine', description: 'No such page.' }

var escapeHtml = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') }

function headFor(path, p) {
    var url = siteUrl + (path === '/' ? '/' : path)
    return [
        '<title>' + escapeHtml(p.title) + '</title>',
        '<meta name="description" content="' + escapeHtml(p.description) + '">',
        '<link rel="canonical" href="' + escapeHtml(url) + '">',
        '<meta property="og:title" content="' + escapeHtml(p.title) + '">',
        '<meta property="og:description" content="' + escapeHtml(p.description) + '">',
        '<meta property="og:url" content="' + escapeHtml(url) + '">',
        '<meta property="og:image" content="' + escapeHtml(siteUrl + '/_/images/logo.jpg') + '">',
        '<link rel="stylesheet" href="' + p.style + '">',
    ].join('\n')
}

function notFoundBody() {
    var body = fileRead('_/text/download.html') || ''
    return body.replace(/<main>[\s\S]*<\/main>/, '<main>\n    <h1>Not found</h1>\n    <ol><li><div><b>No such page</b><span>It may have moved.</span></div><a href="/">Home</a></li></ol>\n  </main>')
}

function page(req, res) {
    var p = PAGES[req.path], shell = fileRead((req.mobile ? 'mobile' : 'desktop') + '/shell.html')
    if (shell == null) return res.text(500, 'the site has no shell')
    var body = p ? fileRead(p.body) : notFoundBody()
    if (body == null) return res.text(500, 'the site has no page for ' + req.path)
    res.html(p ? 200 : 404, shell.replace('<!--seo-->', headFor(req.path, p || NOT_FOUND)).replace('<!--page-->', body.replace(/\n$/, '')))
}

Object.keys(PAGES).forEach(function (path) { routes['GET ' + path] = page })
routes['GET /*'] = page // (every other path: the shell with the not-found page)
routes['GET /robots.txt'] = function (req, res) { res.text(200, 'User-agent: *\nAllow: /\n\nSitemap: ' + siteUrl + '/sitemap.xml\n') }
routes['GET /sitemap.xml'] = function (req, res) {
    var urls = Object.keys(PAGES).map(function (path) { return '  <url><loc>' + siteUrl + path + '</loc></url>' }).join('\n')
    res.send(200, { 'Content-Type': 'application/xml' }, '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '\n</urlset>\n')
}
