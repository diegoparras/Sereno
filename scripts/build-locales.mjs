import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { strings } from './strings.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

for (const lang of ['es', 'en']) {
  const out = {};
  for (const [key, def] of Object.entries(strings)) {
    if (!def[lang]) throw new Error(`Falta "${key}" en ${lang}`);
    const entry = { message: def[lang].replace(/\$1/g, '$VALUE$') };
    if (def.ph) entry.placeholders = { value: { content: '$1' } };
    else entry.message = def[lang];
    out[key] = entry;
  }
  const dir = join(root, '_locales', lang);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'messages.json'), JSON.stringify(out, null, 2) + '\n');
  console.log(`_locales/${lang}/messages.json: ${Object.keys(out).length} textos`);
}
