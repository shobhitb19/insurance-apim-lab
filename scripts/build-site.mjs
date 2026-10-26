import { readFile, readdir, mkdir, writeFile, cp, rm } from 'node:fs/promises';
import path from 'node:path';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: false, linkify: false });
const out = path.resolve('_site');
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const files = (await readdir('docs')).filter(file => file.endsWith('.md'))
  .sort((a, b) => a === 'index.md' ? -1 : b === 'index.md' ? 1 : a.localeCompare(b));
const pages = await Promise.all(files.map(async file => {
  const source = await readFile(path.join('docs', file), 'utf8');
  const title = /^# (.+)$/m.exec(source)?.[1];
  if (!title) throw new Error(`Missing page title: ${file}`);
  return { file, source, title, output: file.replace(/\.md$/, '.html') };
}));
const css = await readFile('scripts/theme.css', 'utf8');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const page of pages) {
  const source = page.source
    .replace(/\]\((?:\.\/)?([^:)#]+)\.md(#[^)]*)?\)/g, ']($1.html$2)')
    .replace(/\]\(\.\.\/(contracts|policies|postman|mock)\/([^)]*)\)/g, ']($1/$2)');
  const nav = pages.map(p => `<a href="${escape(p.output)}"${p === page ? ' aria-current="page"' : ''}>${escape(p.title)}</a>`).join('\n');
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(page.title)} | Insurance API lab</title>
<script>(()=>{const param=new URLSearchParams(window.location.search).get("scoutTheme");const theme=param||(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",theme);})();</script>
<style>${css}</style></head><body><a class="skip" href="#content">Skip to content</a>
<aside><a class="brand" href="index.html">Insurance API lab</a><p>Fictional data. Real HTTP learning.</p>
<label for="search">Find a module</label><input id="search" type="search" placeholder="Filter module titles">
<nav aria-label="Workshop modules">${nav}</nav></aside>
<main id="content">${md.render(source)}<footer>Independent community workshop. No Microsoft sponsorship. MIT licensed.
<a href="https://github.com/shobhitb19/insurance-apim-lab">Repository and source assets</a></footer></main>
<script>document.querySelector('#search').addEventListener('input',event=>{for(const link of document.querySelectorAll('nav a'))link.hidden=!link.textContent.toLowerCase().includes(event.target.value.toLowerCase());});</script>
</body></html>`;
  await writeFile(path.join(out, page.output), html);
}
for (const directory of ['contracts', 'policies', 'postman', 'mock']) {
  await cp(directory, path.join(out, directory), { recursive: true });
}
await cp('LICENSE', path.join(out, 'LICENSE'));
console.log(`Built ${pages.length} guided pages and downloadable assets in _site.`);
