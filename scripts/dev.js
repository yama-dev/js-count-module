const esbuild = require('esbuild');
const pkg = require('../package.json');

const banner = `/*! ${pkg.name} v${pkg.version} | ${pkg.repository.url} | ${pkg.license} */`;

async function main() {
  const browserContext = await esbuild.context({
    entryPoints: ['src/standalone.js'],
    outfile: 'dist/js-count-module.global.js',
    format: 'iife',
    platform: 'browser',
    bundle: true,
    target: ['es2018'],
    banner: { js: banner },
  });

  const cjsContext = await esbuild.context({
    entryPoints: ['src/js-count-module.js'],
    outfile: 'dist/js-count-module.cjs',
    format: 'cjs',
    platform: 'node',
    bundle: true,
    target: ['es2018'],
    banner: { js: banner },
  });

  const esmContext = await esbuild.context({
    entryPoints: ['src/js-count-module.js'],
    outfile: 'dist/js-count-module.mjs',
    format: 'esm',
    platform: 'neutral',
    bundle: true,
    target: ['es2018'],
    banner: { js: banner },
  });

  await Promise.all([
    browserContext.rebuild(),
    cjsContext.rebuild(),
    esmContext.rebuild(),
  ]);

  await Promise.all([
    browserContext.watch(),
    cjsContext.watch(),
    esmContext.watch(),
  ]);

  const server = await browserContext.serve({
    servedir: '.',
    port: 8000,
  });

  const primaryHost = server.hosts[0] || '127.0.0.1';
  console.log(`dev server: http://${primaryHost}:${server.port}/examples/`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
