// Harmless teaching fixture: fixed fake value, local file only.
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
fs.writeFileSync(path.join(root, 'captured-canary.txt'), expected + '\n', {flag:'wx'});
