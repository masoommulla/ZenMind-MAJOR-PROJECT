$file = 'src/app/components/Dashboard.tsx'
$content = Get-Content $file -Raw -Encoding UTF8

# Fix 1: Replace "justify-between" in header with just gap, and replace Logout btn with hamburger
$content = $content -replace 'flex items-center justify-between gap-3', 'flex items-center gap-3'
$content = $content -replace '<button type="button" onClick=\{onLogout\}\r?\n\s+className="md:hidden px-3 py-2 rounded-xl border border-\[#0d5d3a\]/18 text-\[#0d5d3a\] text-sm font-semibold">\r?\n\s+Logout\r?\n\s+</button>', '<button type="button" onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-xl border border-[#0d5d3a]/15 text-[#0d5d3a] hover:bg-[#f0fbf4] transition flex-shrink-0"><Menu className="w-5 h-5" /></button>'

# Fix 2: Add mobile drawer before the return statement's first content
# Find the SIDEBAR comment and insert mobile drawer before it
$mobileDrawer = @'

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed left-0 top-0 h-full w-[260px] bg-white border-r border-[#0d5d3a]/10 z-40 md:hidden shadow-xl flex flex-col">
          <div className="flex items-center p-3 border-b border-[#0d5d3a]/10 min-h-[64px]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{initials}</div>
            <div className="ml-2 flex-1 min-w-0">
              <div className="text-[#0a2617] font-bold text-sm truncate" style={{ fontFamily: 'Syne, sans-serif' }}>Dashboard</div>
              <div className="text-xs text-[#4a7c5d] truncate">{me?.name}</div>
            </div>
            <button type="button" onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
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
            <button type="button" onClick={onLogout} className="w-full flex items-center gap-2.5 text-sm font-semibold text-[#e05555] hover:bg-red-50 rounded-2xl px-3 py-2.5">
              <LogOut className="w-4 h-4" /><span>Sign out</span>
            </button>
          </div>
        </div>
      )}

      {/*
'@

$content = $content -replace '\r?\n\s+\{/\* .* SIDEBAR wrapper', $mobileDrawer

$content | Set-Content $file -NoNewline -Encoding UTF8
Write-Output "Patch applied successfully"
