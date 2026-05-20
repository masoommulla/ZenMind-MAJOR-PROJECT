const fs = require('fs');

let content = fs.readFileSync('src/app/components/AdminDashboard.tsx', 'utf8');

// Add ChevronDown to imports if not there
if (!content.includes('ChevronDown')) {
  content = content.replace(
    /import \{\n?.*?Settings,/,
    "import { ChevronDown, Settings,"
  );
  // Just in case it's in a single line
  content = content.replace(
    /import \{ Settings,/,
    "import { ChevronDown, Settings,"
  );
}

const adminNavGroupsCode = `
const ADMIN_NAV_GROUPS = [
  {
    title: 'User Management',
    icon: <Users size={20} className="shrink-0" />,
    items: [
      { key: 'users', label: 'Members Directory', icon: <Users size={20} className="shrink-0" /> },
      { key: 'therapists', label: 'Therapists Directory', icon: <Stethoscope size={20} className="shrink-0" /> },
      { key: 'team', label: 'Team Members', icon: <UserCircle size={20} className="shrink-0" /> },
    ]
  },
  {
    title: 'Content & Assets',
    icon: <FileText size={20} className="shrink-0" />,
    items: [
      { key: 'content', label: 'Content Mgmt', icon: <FileText size={20} className="shrink-0" /> },
      { key: 'programs', label: 'Wellness Programs', icon: <Brain size={20} className="shrink-0" /> },
      { key: 'store', label: 'Wellness Store', icon: <ShoppingBag size={20} className="shrink-0" /> },
      { key: 'reading', label: 'Reading Lists', icon: <BookOpen size={20} className="shrink-0" /> },
      { key: 'faqs', label: 'FAQs Management', icon: <HelpCircle size={20} className="shrink-0" /> },
      { key: 'quiz', label: 'Quiz Questions', icon: <Brain size={20} className="shrink-0" /> },
    ]
  },
  {
    title: 'Support & Safety',
    icon: <ShieldAlert size={20} className="shrink-0" />,
    items: [
      { key: 'crisis', label: 'Crisis Monitor', icon: <AlertTriangle size={20} className="shrink-0" /> },
      { key: 'flagged', label: 'Flagged Content', icon: <Shield size={20} className="shrink-0" /> },
      { key: 'support', label: 'Support Tickets', icon: <LifeBuoy size={20} className="shrink-0" /> },
      { key: 'therapist_inbox', label: 'Therapist Inbox', icon: <ShieldAlert size={20} className="shrink-0" /> },
    ]
  },
  {
    title: 'Data & Analytics',
    icon: <Activity size={20} className="shrink-0" />,
    items: [
      { key: 'analytics', label: 'Analytics', icon: <Activity size={20} className="shrink-0" /> },
      { key: 'session_insights', label: 'Session Insights', icon: <TrendingUp size={20} className="shrink-0" /> },
      { key: 'notifications', label: 'Notifications', icon: <Bell size={20} className="shrink-0" /> },
    ]
  },
  {
    title: 'Recruitment',
    icon: <Briefcase size={20} className="shrink-0" />,
    items: [
      { key: 'jobs', label: 'Job Postings', icon: <Briefcase size={20} className="shrink-0" /> },
      { key: 'applications', label: 'Applications', icon: <Users size={20} className="shrink-0" /> },
    ]
  },
  { key: 'circles', label: 'Peer Circles', icon: <MessageSquare size={20} className="shrink-0" /> },
  { key: 'settings', label: 'Settings', icon: <Settings size={20} className="shrink-0" /> },
];

function AdminSidebarNav({ activeTab, navTo, expanded, setSidebarExpanded }: any) {
  const [expandedGroup, setExpandedGroup] = React.useState<string | null>(null);
  
  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
      {ADMIN_NAV_GROUPS.map((group: any) => {
        if (!group.items) {
           const active = activeTab === group.key;
           return (
             <button key={group.key} onClick={() => navTo(group.key)} title={!expanded ? group.label : undefined}
               className={\`w-full flex items-center \${expanded ? 'gap-3 px-4' : 'justify-center px-0'} py-3 rounded-xl font-semibold transition-all duration-200 \${active ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow-md shadow-[#0d5d3a]/20 dark:shadow-[#1a8a5a]/20' : 'text-[#4a7c5d] dark:text-gray-400 hover:bg-[#f0fbf4] dark:hover:bg-white/5 hover:text-[#0d5d3a] dark:hover:text-gray-200'}\`}
             >
               {group.icon}
               {expanded && <span className="whitespace-nowrap overflow-hidden">{group.label}</span>}
             </button>
           );
        }
        
        const isGroupActive = group.items.some((i: any) => i.key === activeTab);
        const isExpanded = expandedGroup === group.title || isGroupActive;
        
        return (
          <div key={group.title} className="flex flex-col gap-1">
             <button onClick={() => {
                 if (!expanded && setSidebarExpanded) setSidebarExpanded(true);
                 setExpandedGroup(isExpanded && expanded ? null : group.title);
               }}
               title={!expanded ? group.title : undefined}
               className={\`w-full flex items-center justify-between \${expanded ? 'px-4' : 'justify-center px-0'} py-3 rounded-xl font-semibold transition-all duration-200 text-[#4a7c5d] dark:text-gray-400 hover:bg-[#f0fbf4] dark:hover:bg-white/5 hover:text-[#0d5d3a] dark:hover:text-gray-200\`}
               style={{ color: isGroupActive && !expanded ? '#0d5d3a' : undefined }}
             >
               <div className="flex items-center gap-3">
                 {group.icon}
                 {expanded && <span className="whitespace-nowrap overflow-hidden text-xs uppercase tracking-wider opacity-80">{group.title}</span>}
               </div>
               {expanded && (isExpanded ? <ChevronDown size={16} className="opacity-50" /> : <ChevronRight size={16} className="opacity-50" />)}
             </button>
             {isExpanded && expanded && (
               <div className="flex flex-col gap-1 pl-4 border-l-2 border-[#0d5d3a]/10 dark:border-white/10 ml-4">
                 {group.items.map((item: any) => {
                    const active = activeTab === item.key;
                    return (
                      <button key={item.key} onClick={() => navTo(item.key)}
                        className={\`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all duration-200 \${active ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow-sm shadow-[#0d5d3a]/20' : 'text-[#4a7c5d] dark:text-gray-400 hover:bg-[#f0fbf4] dark:hover:bg-white/5 hover:text-[#0d5d3a] dark:hover:text-gray-200'}\`}
                      >
                        <div style={{ transform: 'scale(0.85)' }}>{item.icon}</div>
                        <span className="whitespace-nowrap overflow-hidden text-sm">{item.label}</span>
                      </button>
                    )
                 })}
               </div>
             )}
          </div>
        );
      })}
    </nav>
  )
}
`;

// Insert the code just before `type AdminDashboardProps`
content = content.replace(
  /type AdminDashboardProps/,
  adminNavGroupsCode + '\n\ntype AdminDashboardProps'
);

// Replace the `<nav>...</nav>` entirely.
// Find the <nav> block
const navStartIdx = content.indexOf('<nav className="flex-1 overflow-y-auto');
const navEndIdx = content.indexOf('</nav>', navStartIdx) + '</nav>'.length;

const newNavCode = `<AdminSidebarNav activeTab={activeTab} navTo={navTo} expanded={mobile || sidebarExpanded} setSidebarExpanded={!mobile ? setSidebarExpanded : undefined} />`;
content = content.substring(0, navStartIdx) + newNavCode + content.substring(navEndIdx);

fs.writeFileSync('src/app/components/AdminDashboard.tsx', content, 'utf8');
console.log('AdminDashboard.tsx updated');
