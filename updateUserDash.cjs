const fs = require('fs');

let content = fs.readFileSync('src/app/components/Dashboard.tsx', 'utf8');

// 1. Add imports
content = content.replace(
  /import \{\n  MessageCircle/,
  "import {\n  ChevronDown, ChevronRight, HeartPulse, Sparkles, FolderHeart,\n  MessageCircle"
);

// 2. Replace NAV_ITEMS definition with NAV_GROUPS and a flat helper
const navGroupsCode = `
const NAV_GROUPS = [
  {
    title: 'Care & Support',
    icon: <HeartPulse className="w-5 h-5 flex-shrink-0" />,
    items: [
      { key: 'aichat', label: 'AI Chat', icon: <MessageCircle className="w-4 h-4 flex-shrink-0" /> },
      { key: 'therapy', label: 'Therapy Hub', icon: <Stethoscope className="w-4 h-4 flex-shrink-0" /> },
      { key: 'sessions', label: 'My Sessions', icon: <Calendar className="w-4 h-4 flex-shrink-0" /> },
    ]
  },
  {
    title: 'My Journey',
    icon: <Sparkles className="w-5 h-5 flex-shrink-0" />,
    items: [
      { key: 'progress', label: 'My Progress', icon: <BarChart2 className="w-4 h-4 flex-shrink-0" /> },
      { key: 'journal', label: 'Mood Journal', icon: <BookHeart className="w-4 h-4 flex-shrink-0" /> },
      { key: 'goals', label: 'My Goals', icon: <Target className="w-4 h-4 flex-shrink-0" /> },
    ]
  },
  {
    title: 'Wellness Hub',
    icon: <FolderHeart className="w-5 h-5 flex-shrink-0" />,
    items: [
      { key: 'resources', label: 'Resources', icon: <Library className="w-4 h-4 flex-shrink-0" /> },
      { key: 'reading', label: 'Reading Lists', icon: <BookMarked className="w-4 h-4 flex-shrink-0" /> },
      { key: 'programs', label: 'Wellness Programs', icon: <Dumbbell className="w-4 h-4 flex-shrink-0" /> },
      { key: 'store', label: 'Store', icon: <ShoppingBag className="w-4 h-4 flex-shrink-0" /> },
    ]
  },
  {
    title: 'Community',
    icon: <Globe2 className="w-5 h-5 flex-shrink-0" />,
    items: [
      { key: 'community', label: 'Community', icon: <Globe2 className="w-4 h-4 flex-shrink-0" /> },
      { key: 'circles', label: 'Peer Circles', icon: <Users2 className="w-4 h-4 flex-shrink-0" /> },
    ]
  },
  { key: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5 flex-shrink-0" /> },
];

function SidebarNav({ tab, navigateToTab, collapsed, setCollapsed }: any) {
  const [expanded, setExpanded] = useState<string | null>(null);
  
  return (
    <>
      {NAV_GROUPS.map((group: any) => {
        if (!group.items) {
           return (
              <button key={group.key} type="button" onClick={() => navigateToTab(group.key)} title={collapsed ? group.label : undefined}
                className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all \${collapsed ? 'justify-center mt-2' : 'mt-2'}\`}
                style={tab === group.key ? {
                  background: 'var(--dash-nav-active-bg)', color: '#fff',
                  border: '2px solid var(--dash-nav-active-border)',
                  boxShadow: 'var(--dash-nav-active-shadow)', fontWeight: 800,
                } : {
                  background: 'transparent', border: '2px solid transparent',
                  color: 'var(--dash-ink)',
                }}
                onMouseEnter={e => { if (tab !== group.key) (e.currentTarget as HTMLElement).style.background = 'var(--dash-nav-hover)'; }}
                onMouseLeave={e => { if (tab !== group.key) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span>{group.icon}</span>
                {!collapsed && <span className="text-sm font-semibold whitespace-nowrap overflow-hidden">{group.label}</span>}
              </button>
           )
        }
        
        const isGroupActive = group.items.some((i: any) => i.key === tab);
        const isExpanded = expanded === group.title || isGroupActive;
        
        return (
          <div key={group.title} className="space-y-0.5 mt-2">
             <button type="button" onClick={() => {
                 if (collapsed && setCollapsed) setCollapsed(false);
                 setExpanded(isExpanded && !collapsed ? null : group.title);
               }}
               title={collapsed ? group.title : undefined}
               className={\`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all hover:bg-black/5 dark:hover:bg-white/5 \${collapsed ? 'justify-center' : ''}\`}
               style={{ color: isGroupActive && collapsed ? 'var(--dash-nav-active-bg)' : 'var(--dash-ink)' }}
             >
                <div className="flex items-center gap-3">
                   <span className={isGroupActive && collapsed ? "opacity-100" : "opacity-70"}>{group.icon}</span>
                   {!collapsed && <span className="text-sm font-bold opacity-70 tracking-wide uppercase text-[10px]">{group.title}</span>}
                </div>
                {!collapsed && (isExpanded ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />)}
             </button>
             {isExpanded && !collapsed && (
                <div className="pl-6 space-y-0.5 mt-1">
                   {group.items.map((item: any) => (
                      <button key={item.key} type="button" onClick={() => navigateToTab(item.key)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
                        style={tab === item.key ? { 
                          background: 'var(--dash-nav-active-bg)', color: '#fff', fontWeight: 800,
                          boxShadow: 'var(--dash-nav-active-shadow)'
                        } : { background: 'transparent', color: 'var(--dash-ink)' }}
                        onMouseEnter={e => { if (tab !== item.key) (e.currentTarget as HTMLElement).style.background = 'var(--dash-nav-hover)'; }}
                        onMouseLeave={e => { if (tab !== item.key) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                         <span>{item.icon}</span>
                         <span className="text-sm font-medium">{item.label}</span>
                      </button>
                   ))}
                </div>
             )}
          </div>
        )
      })}
    </>
  )
}
`;

content = content.replace(
  /const NAV_ITEMS[\s\S]*?\];/,
  navGroupsCode
);

// 3. Replace mobile nav block
content = content.replace(
  /\{NAV_ITEMS\.map\(\(\{ key, label, icon \}\) => \([\s\S]*?\}\)\)\}/,
  `<SidebarNav tab={tab} navigateToTab={navigateToTab} collapsed={false} />`
);

// 4. Replace desktop nav block
content = content.replace(
  /\{NAV_ITEMS\.map\(\(\{ key, label, icon \}\) => \([\s\S]*?\}\)\)\}/,
  `<SidebarNav tab={tab} navigateToTab={navigateToTab} collapsed={collapsed} setCollapsed={setCollapsed} />`
);

fs.writeFileSync('src/app/components/Dashboard.tsx', content, 'utf8');
console.log('Dashboard.tsx updated');
