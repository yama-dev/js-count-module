const esbuild = require('esbuild');
const pkg = require('../package.json');

const banner = `/*! ${pkg.name} v${pkg.version} | ${pkg.repository.url} | ${pkg.license} */`;

const builds = [
  {
    entryPoints: ['src/js-count-module.js'],
    outfile: 'dist/js-count-module.cjs',
    format: 'cjs',
    platform: 'node',
    bundle: true,
    minify: true,
    target: ['es2018'],
    banner: { js: banner },
  },
  {
    entryPoints: ['src/js-count-module.js'],
    outfile: 'dist/js-count-module.mjs',
    format: 'esm',
    platform: 'neutral',
    bundle: true,
    minify: true,
    target: ['es2018'],
    banner: { js: banner },
  },
  {
    entryPoints: ['src/standalone.js'],
    outfile: 'dist/js-count-module.global.js',
    format: 'iife',
    platform: 'browser',
    bundle: true,
    minify: true,
    target: ['es2018'],
    banner: { js: banner },
  },
];

async function main() {
  await Promise.all(builds.map((options) => esbuild.build(options)));
  console.log('Built CommonJS, ESM, and browser bundles into dist/.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
