import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = 'contributor-card-1.0.0.tgz';
const approved = {headline:'Your first contribution belongs here',message:'Build something useful. Review what you ship.',status:'reviewed'};
const changed = {headline:'A dependency changed this page',message:'Your app code stayed the same. The package changed what you shipped.',status:'changed'};
function safe(file, kind = 'file') {
  const relative = path.relative(repo, file);
  assert(relative && !relative.startsWith('..') && !path.isAbsolute(relative));
  const pieces = relative.split(path.sep);
  let current = repo;
  for (let i = 0; i < pieces.length; i++) {
    current = path.join(current, pieces[i]);
    let stat;
    try { stat = fs.lstatSync(current); } catch (e) { if (e.code === 'ENOENT') continue; throw e; }
    assert(!stat.isSymbolicLink(), 'Fixture preparation refuses symlinks');
    assert(i < pieces.length - 1 || kind === 'directory' ? stat.isDirectory() : stat.isFile() && stat.nlink === 1,
      'Fixture preparation needs ordinary owned files and directories');
  }
  return file;
}
const write = (file,data) => { safe(file); fs.mkdirSync(path.dirname(file),{recursive:true}); fs.writeFileSync(file,data); };
const manifest = {name:'@workshop/contributor-card',version:'1.0.0',main:'index.cjs',private:true,files:['index.cjs','postinstall.cjs'],description:'Authored offline teaching fixture. Never publish this package.'};
const hook = `// Harmless teaching fixture: fixed fake value, local file only.
const fs = require('node:fs');
const path = require('node:path');
const expected = 'DEMO_ONLY_NOT_A_REAL_CREDENTIAL';
if (process.env.DEMO_CANARY !== expected) throw new Error('Fixed teaching canary required');
const root = process.env.DEMO_WORK_ROOT;
if (!root || !path.isAbsolute(root) || fs.realpathSync(root) !== root
    || path.basename(root) !== 'unsafe' || path.basename(path.dirname(root)) !== 'work'
    || fs.realpathSync(__dirname) !== path.join(root, 'app/node_modules/@workshop/contributor-card')) {
  throw new Error('Only the installed teaching fixture may write its local marker');
}
fs.writeFileSync(path.join(root, 'captured-canary.txt'), expected + '\\n', {flag:'wx'});
`;
export function stageFixture(mode) {
  assert(['init','attack','restore'].includes(mode),'Usage: node scripts/fixture.mjs init|attack|restore');
  for (const dir of ['work','vendor','packages','approved']) {
    const target = path.join(repo,dir);
    if (fs.existsSync(target)) assert(fs.lstatSync(target).isDirectory() && !fs.lstatSync(target).isSymbolicLink());
  }
  const vendor = path.join(repo,'vendor/contributor-card');
  if (fs.existsSync(vendor)) assert(!fs.lstatSync(vendor).isSymbolicLink());
  fs.rmSync(vendor,{recursive:true,force:true});
  if (mode === 'restore') {
    for (const file of ['package.json', 'index.cjs']) {
      write(path.join(vendor,file),fs.readFileSync(safe(path.join(repo,'approved/source',file))));
    }
    write(path.join(repo,'packages',name),fs.readFileSync(safe(path.join(repo,'approved',name))));
    return;
  }
  const pkg = {...manifest};
  if (mode === 'attack') pkg.scripts = {postinstall:'node postinstall.cjs'};
  write(path.join(vendor,'package.json'),JSON.stringify(pkg,null,2)+'\n');
  write(path.join(vendor,'index.cjs'),'module.exports = '+JSON.stringify(mode==='attack'?changed:approved,null,2)+';\n');
  if (mode === 'attack') write(path.join(vendor,'postinstall.cjs'),hook);
  const scratch = path.join(repo,'work/fixture-preparation');
  fs.rmSync(scratch,{recursive:true,force:true}); fs.mkdirSync(scratch,{recursive:true});
  const config=path.join(scratch,'empty.npmrc'), global=path.join(scratch,'global.npmrc');
  write(config,''); write(global,'');
  const cli = fs.realpathSync(path.join(path.dirname(process.execPath),'npm'));
  assert(/^#![^\n]*\bnode\b/.test(fs.readFileSync(cli,'utf8')));
  const flags=['--offline','--ignore-scripts','--no-audit','--no-fund','--update-notifier=false','--registry=https://registry.invalid','--cache',path.join(scratch,'cache'),'--userconfig',config,'--globalconfig',global];
  function npm(args,cwd) {
    const r=spawnSync(process.execPath,[cli,...args,...flags],{cwd,env:{PATH:`${path.dirname(process.execPath)}:/usr/bin:/bin`},encoding:'utf8',timeout:45000});
    assert(r.status===0 && !r.error && !r.signal,`Fixture preparation failed: ${r.stderr}`);
    return r.stdout;
  }
  const packed=JSON.parse(npm(['pack','.','--json','--pack-destination',scratch],vendor));
  assert.equal(packed.length,1); assert.equal(packed[0].filename,'workshop-contributor-card-1.0.0.tgz');
  write(path.join(repo,'packages',name),fs.readFileSync(path.join(scratch,packed[0].filename)));
  if (mode === 'init') {
    write(path.join(repo,'approved',name),fs.readFileSync(path.join(repo,'packages',name)));
    for (const file of ['package.json', 'index.cjs']) {
      write(path.join(repo,'approved/source',file),fs.readFileSync(safe(path.join(vendor,file))));
    }
    safe(path.join(repo,'package-lock.json'));
    npm(['install','--package-lock-only'],repo);
    write(path.join(repo,'approved/package-lock.json'),fs.readFileSync(path.join(repo,'package-lock.json')));
  }
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) stageFixture(process.argv[2]);
