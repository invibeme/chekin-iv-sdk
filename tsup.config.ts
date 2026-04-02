import {defineConfig} from 'tsup';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const packageJson = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  target: 'es2018',
  define: {
    __PACKAGE_NAME__: JSON.stringify(packageJson.name),
    __PACKAGE_VERSION__: JSON.stringify(packageJson.version),
  },
});
