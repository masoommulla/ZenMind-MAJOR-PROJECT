const fs = require('fs');
const file = 'src/app/components/AdminDashboard.tsx';
let c = fs.readFileSync(file, 'utf8');

const map = {
  'â”€': '─',
  'â• ': '═',
  'â€”': '—',
  'â€¢': '•',
  'â€“': '–',
  'â€¦': '…',
  'âœ…': '✅',
  'ðŸ—‘ï¸ ': '🗑️',
  'â†’': '→',
  'ðŸ©º': '🩺',
  'ðŸ“…': '📅',
  'ðŸ \u2039ï¸ ': '🏥', // 'ðŸ ‹ï¸ ' in some views, but let's be careful
  'ðŸ“š': '📚',
  'ðŸŽ¯': '🎯',
  'ðŸ¤–': '🤖',
  'ðŸŽ‰': '🎉',
  'â ¤ï¸ ': '❤️',
  'ðŸ’¬': '💬',
  'ðŸ§ ': '🧠',
  'ðŸ’š': '💚',
  'ðŸŒ¿': '🌿',
  'ðŸŒ™': '🌙',
  'ðŸ”¥': '🔥',
  'ðŸŒˆ': '🌈',
  'ðŸ¤ ': '🤝',
  'âš¡': '⚡',
  'ðŸ•Šï¸ ': '🕊️',
  'ðŸŒ¸': '🌸',
  'â— ': '●',
  'â—‹': '○',
  'â ³': '⏳',
  'ðŸ–¥ï¸ ': '🖥️',
  'ðŸ’°': '💰',
  'ðŸŽ“': '🎓',
  'âœ“': '✓',
  'âŸ³': '↻'
};

for (const [bad, good] of Object.entries(map)) {
  c = c.split(bad).join(good);
}

// Special case for Wellness Programs since it might have a zero width space or something
c = c.replace(/ðŸ \u2039ï¸ /g, '🏥');
c = c.replace(/ðŸ ‹ï¸ /g, '🏥');

fs.writeFileSync(file, c, 'utf8');
console.log('Fixed more emojis/mojibake');
