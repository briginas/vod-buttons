import {build} from 'esbuild';
import {cp, mkdir, rm} from 'node:fs/promises';
await rm('dist', {recursive: true, force: true});
await mkdir('dist', {recursive: true});
await cp('extension', 'dist', {recursive: true});
await build({entryPoints: {content: 'src/content.js', options: 'src/options.js'}, outdir: 'dist',
  bundle: true, format: 'iife', target: 'chrome120', legalComments: 'none'});
console.log('Built dist/ — load this directory in Chrome.');
