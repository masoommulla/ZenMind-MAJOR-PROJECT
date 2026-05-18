const fs = require('fs');
const file = 'src/app/components/AdminDashboard.tsx';
let c = fs.readFileSync(file, 'utf8');

// 1. Normalize doubled line endings (\r\r\n → \r\n)
c = c.replace(/\r\r\n/g, '\r\n');

// 2. Fix em-dash mojibake (â€" = UTF-8 bytes C3 A2 E2 80 94 misread as Latin-1)
c = c.replace(/\u00e2\u0080\u009c/g, '\u2014');  // try variant 1
c = c.replace(/â€"/g, '\u2014');                  // literal match

// 3. Fix missing </p> closing tag on "No events this week" line
c = c.replace(/(No events this week 🌿)(\r?\n(\s*)\)\})/g, '$1</p>$2');

fs.writeFileSync(file, c, 'utf8');

const lines = c.split('\n').length;
console.log('Done. Lines:', lines);
