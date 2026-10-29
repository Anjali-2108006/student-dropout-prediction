const fs = require('fs');
const path = require('path');
const target = process.argv[2];
const b64 = process.argv[3];
const absPath = path.resolve(target);
fs.mkdirSync(path.dirname(absPath), { recursive: true });
fs.writeFileSync(absPath, Buffer.from(b64, 'base64').toString('utf8'), 'utf8');
console.log('Successfully wrote ' + absPath);