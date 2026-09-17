// Usage: pnpm exec node scripts/verify-portfolio.mjs [original-directory]
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const sharp = require(require.resolve('sharp', { paths: [path.dirname(require.resolve('next/package.json'))] }));
const { categories } = JSON.parse(await readFile(path.join(root, 'app/data/portfolio.json'), 'utf8'));
const ids = new Set();
const sources = new Set();
let imageCount = 0;
let projectCount = 0;
let bytes = 0;
for (const category of categories) {
  assert(category.projects.length > 0);
  for (const project of category.projects) {
    projectCount++;
    const images = project.groups.flatMap((group) => group.images);
    assert(images.some((image) => image.id === project.coverId), `Invalid cover: ${project.name}`);
    for (const group of project.groups) {
      assert(group.images.length > 0, `Empty group: ${group.name}`);
      for (const image of group.images) {
        assert(!ids.has(image.id), `Duplicate id: ${image.id}`);
        ids.add(image.id);
        assert(!sources.has(image.source), `Duplicate source: ${image.source}`);
        sources.add(image.source);
        for (const url of [image.src, image.thumb]) {
          assert.match(url, /^\/portfolio\/[a-f0-9]{12}(-thumb)?\.webp$/);
          const file = path.join(root, 'public', url);
          const metadata = await sharp(file).metadata();
          assert.equal(metadata.format, 'webp');
          assert(metadata.width > 0 && metadata.height > 0);
          if (url === image.src) { assert.equal(metadata.width, image.width); assert.equal(metadata.height, image.height); }
          else assert(Math.max(metadata.width, metadata.height) <= 960);
          bytes += (await stat(file)).size;
        }
        if (process.argv[2]) {
          const original = await readFile(path.join(process.argv[2], image.source));
          assert.equal(createHash('sha256').update(original).digest('hex'), image.sourceSha256, `Source changed: ${image.source}`);
        }
        imageCount++;
      }
    }
  }
}
if (process.argv[2]) {
  const entries = await readdir(process.argv[2], { recursive: true, withFileTypes: true });
  const originals = entries.filter((entry) => entry.isFile() && /\.(png|jpe?g)$/i.test(entry.name));
  assert.equal(originals.length, imageCount, 'Original image count does not match the catalog');
}
console.log(JSON.stringify({ categories: categories.length, projects: projectCount, images: imageCount, webFiles: imageCount * 2, webMB: +(bytes / 1048576).toFixed(2), originalsUnchanged: Boolean(process.argv[2]), result: 'passed' }, null, 2));
