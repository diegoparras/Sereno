// Empaqueta solo lo que necesita la extensión en dist/<nombre>-<versión>.zip,
// listo para subir a la Chrome Web Store.
import { readFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { version } = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
const { name } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const out = join(root, 'dist', `${name}-${version}.zip`);

mkdirSync(join(root, 'dist'), { recursive: true });
rmSync(out, { force: true });
execFileSync(
  'zip',
  ['-r', '-X', '-q', out, 'manifest.json', '_locales', 'src', 'icons/icon-16.png', 'icons/icon-32.png', 'icons/icon-48.png', 'icons/icon-128.png'],
  { cwd: root, stdio: 'inherit' }
);
console.log(`Listo: dist/${name}-${version}.zip`);
