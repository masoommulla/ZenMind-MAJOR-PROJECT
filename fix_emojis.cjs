const fs = require('fs');
const file = 'src/app/components/AdminDashboard.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/âœ…/g, '✅');
c = c.replace(/ðŸ—‘ï¸ /g, '🗑️');
c = c.replace(/â†’/g, '→');
c = c.replace(/ðŸ©º/g, '🩺');
c = c.replace(/ðŸ“…/g, '📅');
c = c.replace(/ðŸ ‹ï¸ /g, '🏥');
c = c.replace(/ðŸ“š/g, '📚');
c = c.replace(/ðŸŽ¯/g, '🎯');
c = c.replace(/ðŸ¤–/g, '🤖');

fs.writeFileSync(file, c, 'utf8');
console.log('Fixed emojis');
