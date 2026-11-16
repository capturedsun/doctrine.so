// The one page's two views: home (/) and the download panel (/download). A link with data-to switches them in
// place (history.pushState); the browser's back and forward switch them again. The server answers either path
// with the page, its view already set, so a reload or a direct link shows the same.
const frame = document.querySelector('.frame')
const VIEWS = { '/': ['home', 'Doctrine — The Hierarchical Harness'], '/download': ['download', 'Download — Doctrine'] }
function show(path) {
    const v = VIEWS[path]
    if (!v || !frame) return false
    frame.dataset.view = v[0]
    document.title = v[1]
    return true
}
document.addEventListener('click', e => {
    const a = e.target.closest('a[data-to]')
    if (!a || !frame || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return // (a new tab: the link as it is)
    e.preventDefault()
    if (a.dataset.to === location.pathname) return
    history.pushState({ view: a.dataset.to }, '', a.dataset.to)
    show(a.dataset.to)
})
addEventListener('popstate', () => show(location.pathname))
