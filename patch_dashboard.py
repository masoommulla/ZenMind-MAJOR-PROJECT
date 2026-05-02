import re

f = open('src/app/components/Dashboard.tsx', encoding='utf-8')
content = f.read()
f.close()

# Fix 1: Remove leftover DESKTOP_SIDEBAR from test
content = content.replace(
    'hidden md:block flex-shrink-0 relative DESKTOP_SIDEBAR',
    'hidden md:block flex-shrink-0 relative'
)

# Fix 2: Insert mobile drawer before desktop sidebar comment
OLD_SIDEBAR = '      {/* \u2500\u2500 SIDEBAR wrapper \u2014 controls width, holds toggle tab \u2500\u2500 */}'
MOBILE_DRAWER = """\
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}
      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-[#0d5d3a]/10 z-40 md:hidden shadow-xl flex flex-col">
          <div className="flex items-center p-3 border-b border-[#0d5d3a]/10 min-h-[64px]">
            {avatarUrl
              ? <img src={avatarUrl} alt="P" className="w-9 h-9 rounded-full object-cover ring-2 ring-[#0d5d3a]/20 flex-shrink-0" />
              : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{initials}</div>
            }
            <div className="ml-2 flex-1 min-w-0">
              <div className="text-[#0a2617] font-bold text-sm truncate" style={{fontFamily:'Syne,sans-serif'}}>Dashboard</div>
              <div className="text-xs text-[#4a7c5d] truncate">{me?.name}</div>
            </div>
            <button type="button" onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 ml-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(({ key, label, icon }) => (
              <button key={key} type="button" onClick={() => { setTab(key); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl border transition-all ${tab === key ? 'bg-[#0d5d3a] text-white border-[#0d5d3a]' : 'bg-white text-[#0a2617] border-transparent hover:bg-[#f3fbf6]'}`}>
                <span className={tab === key ? 'text-white' : 'text-[#0d5d3a]'}>{icon}</span>
                <span className="text-sm font-semibold">{label}</span>
              </button>
            ))}
          </nav>
          <div className="mt-auto border-t border-[#0d5d3a]/10 p-2">
            <button type="button" onClick={onLogout}
              className="w-full flex items-center gap-2.5 text-sm font-semibold text-[#e05555] hover:bg-red-50 rounded-2xl px-3 py-2.5 transition">
              <LogOut className="w-4 h-4 flex-shrink-0" /><span>Sign out</span>
            </button>
          </div>
        </div>
      )}
      {/* Desktop sidebar \u2014 controls width, holds toggle tab */}"""

if OLD_SIDEBAR in content:
    content = content.replace(OLD_SIDEBAR, MOBILE_DRAWER)
    print('Fix 2 applied: mobile drawer inserted')
else:
    print('Fix 2 NOT found - searching for partial match...')
    idx = content.find('SIDEBAR wrapper')
    print(f'  Partial idx={idx}, context: {repr(content[max(0,idx-10):idx+30])}')

# Fix 3: Replace md:hidden Logout with hamburger in the header
old3 = '            <button type="button" onClick={onLogout}\n              className="md:hidden px-3 py-2 rounded-xl border border-[#0d5d3a]/18 text-[#0d5d3a] text-sm font-semibold">\n              Logout\n            </button>'
new3 = '            <button type="button" onClick={() => setMobileOpen(true)}\n              className="md:hidden p-2 rounded-xl border border-[#0d5d3a]/15 text-[#0d5d3a] hover:bg-[#f0fbf4] transition">\n              <Menu className="w-5 h-5" />\n            </button>'
if old3 in content:
    content = content.replace(old3, new3)
    print('Fix 3 applied: hamburger button in header')
else:
    # Try with \r\n
    old3r = old3.replace('\n', '\r\n')
    if old3r in content:
        new3r = new3.replace('\n', '\r\n')
        content = content.replace(old3r, new3r)
        print('Fix 3 applied (CRLF): hamburger button in header')
    else:
        print('Fix 3 NOT found')

f = open('src/app/components/Dashboard.tsx', 'w', encoding='utf-8', newline='')
f.write(content)
f.close()
print('Done writing file')
