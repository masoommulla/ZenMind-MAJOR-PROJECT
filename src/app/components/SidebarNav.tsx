import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Stethoscope,
  Calendar,
  BarChart2,
  BookHeart,
  Users2,
  Target,
  Globe2,
  Dumbbell,
  Library,
  BookMarked,
  ShoppingBag,
  Settings,
  ChevronDown,
  ChevronRight,
  HeartPulse,
  Sparkles,
  FolderHeart,
} from 'lucide-react';

// Define the navigation groups for the user dashboard
const NAV_GROUPS = [
  {
    title: 'Care & Support',
    icon: <HeartPulse className="w-5 h-5 flex-shrink-0" />, // using HeartPulse as a representative icon
    items: [
      { key: 'aichat', label: 'AI Chat', icon: <MessageCircle className="w-4 h-4 flex-shrink-0" /> },
      { key: 'therapy', label: 'Therapy Hub', icon: <Stethoscope className="w-4 h-4 flex-shrink-0" /> },
      { key: 'sessions', label: 'My Sessions', icon: <Calendar className="w-4 h-4 flex-shrink-0" /> },
    ],
  },
  {
    title: 'My Journey',
    icon: <Sparkles className="w-5 h-5 flex-shrink-0" />, // sparkles for journey
    items: [
      { key: 'progress', label: 'My Progress', icon: <BarChart2 className="w-4 h-4 flex-shrink-0" /> },
      { key: 'journal', label: 'Mood Journal', icon: <BookHeart className="w-4 h-4 flex-shrink-0" /> },
      { key: 'goals', label: 'My Goals', icon: <Target className="w-4 h-4 flex-shrink-0" /> },
    ],
  },
  {
    title: 'Wellness Hub',
    icon: <FolderHeart className="w-5 h-5 flex-shrink-0" />, // folder heart for hub
    items: [
      { key: 'resources', label: 'Resources', icon: <Library className="w-4 h-4 flex-shrink-0" /> },
      { key: 'reading', label: 'Reading Lists', icon: <BookMarked className="w-4 h-4 flex-shrink-0" /> },
      { key: 'programs', label: 'Wellness Programs', icon: <Dumbbell className="w-4 h-4 flex-shrink-0" /> },
      { key: 'store', label: 'Store', icon: <ShoppingBag className="w-4 h-4 flex-shrink-0" /> },
    ],
  },
  {
    title: 'Community',
    icon: <Globe2 className="w-5 h-5 flex-shrink-0" />, // globe for community
    items: [
      { key: 'community', label: 'Community', icon: <Globe2 className="w-4 h-4 flex-shrink-0" /> },
      { key: 'circles', label: 'Peer Circles', icon: <Users2 className="w-4 h-4 flex-shrink-0" /> },
    ],
  },
  // Settings stays as a top‑level entry, no grouping
  { key: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5 flex-shrink-0" /> },
];

/**
 * Sidebar navigation component used in the user dashboard.
 * Implements collapsible accordion groups as described in Option B.
 */
export default function SidebarNav({ tab, navigateToTab, collapsed, setCollapsed }: any) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Persist the collapsed state across reloads – handled by the parent via localStorage.

  const handleGroupClick = (groupTitle: string, hasItems: boolean) => {
    if (!hasItems && setCollapsed) {
      // Top‑level single item (e.g., Settings) – just navigate.
      return;
    }
    // When the sidebar is collapsed we first expand it before opening a group.
    if (collapsed && setCollapsed) setCollapsed(false);
    setExpandedGroup(prev => (prev === groupTitle ? null : groupTitle));
  };

  return (
    <>
      {NAV_GROUPS.map((group: any) => {
        // Single top‑level items (no `items` array) – render as a simple button.
        if (!group.items) {
          const active = tab === group.key;
          return (
            <button
              key={group.key}
              type="button"
              onClick={() => navigateToTab(group.key)}
              title={collapsed ? group.label : undefined}
              className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-2xl transition-all ${
                active
                  ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow-md'
                  : 'text-[#4a7c5d] dark:text-gray-400 hover:bg-[#f0fbf4] dark:hover:bg-white/5 hover:text-[#0d5d3a] dark:hover:text-gray-200'
              }`}
              style={active ? { background: 'var(--dash-nav-active-bg)', color: '#fff' } : undefined}
            >
              {group.icon}
              {!collapsed && <span className="text-sm font-semibold whitespace-nowrap overflow-hidden">{group.label}</span>}
            </button>
          );
        }

        const isGroupActive = group.items.some((i: any) => i.key === tab);
        const isExpanded = expandedGroup === group.title || isGroupActive;

        return (
          <div key={group.title} className="flex flex-col gap-1">
            {/* Group header */}
            <button
              type="button"
              onClick={() => handleGroupClick(group.title, true)}
              title={collapsed ? group.title : undefined}
              className={`w-full flex items-center justify-between ${collapsed ? 'px-0' : 'px-3'} py-2.5 rounded-2xl transition-all text-[#4a7c5d] dark:text-gray-400 hover:bg-[#f0fbf4] dark:hover:bg-white/5 hover:text-[#0d5d3a] dark:hover:text-gray-200`}
              style={isGroupActive && collapsed ? { color: '#0d5d3a' } : undefined}
            >
              <div className="flex items-center gap-3">
                {group.icon}
                {!collapsed && <span className="whitespace-nowrap overflow-hidden text-xs uppercase tracking-wider opacity-80">{group.title}</span>}
              </div>
              {collapsed ? null : isExpanded ? <ChevronDown size={16} className="opacity-50" /> : <ChevronRight size={16} className="opacity-50" />}
            </button>
            {/* Group items – only visible when expanded and not collapsed */}
            {isExpanded && !collapsed && (
              <div className="flex flex-col gap-1 pl-4 border-l-2 border-[#0d5d3a]/10 dark:border-white/10 ml-4">
                {group.items.map((item: any) => {
                  const active = tab === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => navigateToTab(item.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                        active
                          ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow-sm'
                          : 'text-[#4a7c5d] dark:text-gray-400 hover:bg-[#f0fbf4] dark:hover:bg-white/5 hover:text-[#0d5d3a] dark:hover:text-gray-200'
                      }`}
                    >
                      <div style={{ transform: 'scale(0.85)' }}>{item.icon}</div>
                      <span className="whitespace-nowrap overflow-hidden text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
