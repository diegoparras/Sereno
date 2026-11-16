// Cambia el nombre visible de la extensión en todo el proyecto.
// Uso: npm run rename -- "Nuevo Nombre"
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const next = process.argv[2];
if (!next) {
  console.error('Uso: npm run rename -- "Nuevo Nombre"');
  process.exit(1);
}
const current = /export const BRAND = '([^']+)'/.exec(readFileSync(join(root, 'scripts/strings.mjs'), 'utf8'))[1];
if (current === next) process.exit(0);

const skip = new Set(['node_modules', '.git', 'dist', 'screenshots', 'LEGAL.md']);
const exts = new Set(['.js', '.mjs', '.json', '.html', '.css', '.md', '.svg']);
let changed = 0;
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    if (skip.has(f)) continue;
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (exts.has(extname(f))) {
      const src = readFileSync(p, 'utf8');
      if (src.includes(current)) {
        writeFileSync(p, src.split(current).join(next));
        changed++;
      }
    }
  }
})(root);

// nombre del paquete (para el zip)
const pkgPath = join(root, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
pkg.name = next.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

console.log(`"${current}" → "${next}" en ${changed} archivos. Ahora corre: npm run build`);
