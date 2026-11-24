# PC²BS 2027 conference website

Static site (HTML, CSS, JavaScript). No build step and no dependencies.

## Files
- `index.html` the page
- `assets/css/style.css` styles
- `assets/js/main.js` particles, cursor, countdown and scroll effects
- `assets/img/` logos, speaker photos, QR code and the college gate illustration
- `404.html`, `_headers`, `.nojekyll` hosting helpers

## Deploy
- **Cloudflare Pages**: create a project, upload this folder (or connect the repo). Build command: none. Output directory: `/`.
- **Netlify**: drag and drop this folder onto app.netlify.com/drop, or connect the repo with no build command and publish directory `/`.
- **GitHub Pages**: push these files to a repository root, then Settings → Pages → Deploy from branch → `main` / root.

All paths are relative, so the site also works from a sub-path such as `username.github.io/repo/`.
