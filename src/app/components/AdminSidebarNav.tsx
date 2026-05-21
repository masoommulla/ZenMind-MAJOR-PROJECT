import React, { useState } from 'react';
import { Settings, Activity, Users, Shield, Edit2, HelpCircle, MessageSquare, ShieldAlert, BookOpen, Brain, ShoppingBag, LifeBuoy, AlertTriangle, Bell, TrendingUp, UserCircle, Briefcase, ChevronDown, ChevronRight } from 'lucide-react';
import NavItem from './NavItem';

// AdminSidebarNav groups for the admin dashboard with collapsible sections
export default function AdminSidebarNav({
  tab,
  navigateToTab,
  collapsed,
  setCollapsed,
}: {
  tab: string;
  navigateToTab: (t: string) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}) {
  const groups = [
    {
      label: 'Analytics',
      items: [{ icon: Activity, label: 'Analytics', id: 'analytics' }],
    },
    {
      label: 'Management',
      items: [
        { icon: Users, label: 'Members Directory', id: 'users' },
        { icon: Shield, label: 'Therapists Directory', id: 'therapists' },
        { icon: Edit2, label: 'Content Mgmt', id: 'content' },
        { icon: HelpCircle, label: 'FAQs Management', id: 'faqs' },
        { icon: MessageSquare, label: 'Peer Circles', id: 'circles' },
        { icon: ShieldAlert, label: 'Flagged Content', id: 'flagged' },
        { icon: BookOpen, label: 'Reading Lists', id: 'reading' },
        { icon: Brain, label: 'Wellness Programs', id: 'programs' },
        { icon: ShoppingBag, label: 'Wellness Store', id: 'store' },
        { icon: Brain, label: 'Quiz Questions', id: 'quiz' },
        { icon: LifeBuoy, label: 'Support Tickets', id: 'support' },
        { icon: ShieldAlert, label: 'Therapist Inbox', id: 'therapist_inbox' },
        { icon: AlertTriangle, label: 'Crisis Monitor', id: 'crisis' },
        { icon: Bell, label: 'Notifications', id: 'notifications' },
        { icon: TrendingUp, label: 'Session Insights', id: 'session_insights' },
        { icon: UserCircle, label: 'Team Members', id: 'team' },
        { icon: Briefcase, label: 'Job Postings', id: 'jobs' },
        { icon: Users, label: 'Applications', id: 'applications' },
      ],
    },
    {
      label: 'Settings',
      items: [{ icon: Settings, label: 'Settings', id: 'settings' }],
    },
  ];

  // Track expanded/collapsed state of each group (default all expanded)
  const [expandedGroups, setExpandedGroups] = useState(() =>
    groups.reduce((acc, g) => ({ ...acc, [g.label]: true }), {})
  );

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex flex-col gap-1">
      {groups.map(group => (
        <div key={group.label} className="flex flex-col gap-1">
          <button
            onClick={() => toggleGroup(group.label)}
            className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400"
          >
            <span>{group.label}</span>
            {collapsed ? null : expandedGroups[group.label] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {expandedGroups[group.label] &&
            group.items.map(item => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={tab === item.id}
                onClick={() => navigateToTab(item.id)}
                expanded={!collapsed}
              />
            ))}
        </div>
      ))}
      <div className="p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 p-2 text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        </button>
      </div>
    </div>
  );
}
