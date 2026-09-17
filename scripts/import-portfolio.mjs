// Generate web-only derivatives. The supplied source directory is never modified.
// Usage: pnpm exec node scripts/import-portfolio.mjs <source-directory>
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
// Reuse Next.js's installed image processor; no extra dependency is required.
const sharp = require(require.resolve('sharp', { paths: [path.dirname(require.resolve('next/package.json'))] }));
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv[2] && path.resolve(process.argv[2]);
if (!source || source === root || !(await stat(source)).isDirectory()) throw new Error('Provide the original portfolio directory.');
const destination = path.join(root, 'public', 'portfolio');
await mkdir(destination, { recursive: true });
await mkdir(path.join(root, 'app', 'data'), { recursive: true });
const catalogPath = path.join(root, 'app', 'data', 'portfolio.json');
let cachedImages = new Map();
try {
  const previous = JSON.parse(await readFile(catalogPath, 'utf8'));
  cachedImages = new Map(previous.categories.flatMap((category) => category.projects.flatMap((project) => project.groups.flatMap((group) => group.images))).map((image) => [image.id, image]));
} catch (error) { if (error.code !== 'ENOENT') throw error; }

const sort = (a, b) => a.localeCompare(b, 'zh-CN', { numeric: true });
const hash = (data) => createHash('sha256').update(data).digest('hex');
const id = (name) => hash(name).slice(0, 12);
const directories = async (dir) => (await readdir(dir, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort(sort);
async function imagesIn(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await imagesIn(full));
    else if (/\.(png|jpe?g)$/i.test(entry.name)) files.push(full);
  }
  return files.sort(sort);
}

const categories = [];
let count = 0;
let sourceBytes = 0;
let webBytes = 0;
for (const [categoryId, name, english, description] of [
  ['interface', '界面', 'INTERFACE DESIGN', '信息有序，体验清晰。'],
  ['game-ui', '游戏UI', 'GAME INTERFACE', '在操作与反馈之间，进入体验。'],
  ['events', '公司活动', 'EVENT VISUALS', '从活动主视觉，到不同场景的延展。'],
]) {
  const category = { id: categoryId, name, english, description, projects: [] };
  const categoryDir = path.join(source, name);
  for (const folder of await directories(categoryDir)) {
    const relativeProject = `${name}/${folder}`;
    const project = { id: id(relativeProject), name: /^\d+$/.test(folder) ? `公司活动 ${folder.padStart(2, '0')}` : folder, sourceFolder: folder, coverId: '', groups: [] };
    const projectDir = path.join(categoryDir, folder);
    for (const file of await imagesIn(projectDir)) {
      const relative = path.relative(source, file).split(path.sep).join('/');
      const groupName = path.relative(projectDir, path.dirname(file)).split(path.sep).join(' / ') || '效果图';
      let group = project.groups.find((item) => item.name === groupName);
      if (!group) { group = { id: id(`${relativeProject}/${groupName}`), name: groupName, images: [] }; project.groups.push(group); }
      const imageId = id(relative);
      const original = await readFile(file);
      const sourceSha256 = hash(original);
      const thumb = `${imageId}-thumb.webp`;
      const detail = `${imageId}.webp`;
      const cached = cachedImages.get(imageId);
      let output;
      if (cached?.sourceSha256 === sourceSha256) {
        try { await stat(path.join(destination, thumb)); output = { width: cached.width, height: cached.height, size: (await stat(path.join(destination, detail))).size }; }
        catch (error) { if (error.code !== 'ENOENT') throw error; }
      }
      if (!output) {
        await sharp(original).rotate().resize({ width: 960, height: 960, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(destination, thumb));
        output = await sharp(original).rotate().resize({ width: 5120, height: 5120, fit: 'inside', withoutEnlargement: true }).webp({ quality: 90 }).toFile(path.join(destination, detail));
      }
      if (hash(await readFile(file)) !== sourceSha256) throw new Error(`Source changed during import: ${relative}`);
      group.images.push({ id: imageId, name: path.parse(file).name, filename: path.basename(file), src: `/portfolio/${detail}`, thumb: `/portfolio/${thumb}`, width: output.width, height: output.height, source: relative, sourceSha256 });
      sourceBytes += original.length;
      webBytes += output.size + (await stat(path.join(destination, thumb))).size;
      count++;
    }
    const screenOrder = ['屏一', '屏二', '屏三', '屏四'];
    project.groups.sort((a, b) => {
      const first = screenOrder.findIndex((prefix) => a.name.startsWith(prefix));
      const second = screenOrder.findIndex((prefix) => b.name.startsWith(prefix));
      return first >= 0 && second >= 0 ? first - second : sort(a.name, b.name);
    });
    const images = project.groups.flatMap((group) => group.images);
    if (!images.length) throw new Error(`No images in ${relativeProject}`);
    project.coverId = (images.find((image) => ['待机', '待机2', '无人机总动员', 'KV1920', '竖版主视觉', 'P1'].includes(image.name)) ?? images[0]).id;
    category.projects.push(project);
    console.log(`${name} / ${project.name}: ${images.length} images`);
  }
  categories.push(category);
}
await writeFile(catalogPath, `${JSON.stringify({ categories }, null, 2)}\n`);
console.log(JSON.stringify({ projects: categories.reduce((sum, category) => sum + category.projects.length, 0), images: count, sourceMB: +(sourceBytes / 1048576).toFixed(2), webMB: +(webBytes / 1048576).toFixed(2) }));
