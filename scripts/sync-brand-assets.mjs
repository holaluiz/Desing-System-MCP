import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'src/assets');
const target = path.join(root, 'apps/showcase/public/caramelo');
if (fs.existsSync(source)) {
  fs.mkdirSync(target, { recursive: true });
  fs.cpSync(source, target, { recursive: true });
}
