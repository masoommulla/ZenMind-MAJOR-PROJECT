import React from 'react';

export default function NavItem({ icon: Icon, label, active, onClick, expanded }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center ${expanded ? 'gap-3 px-4' : 'justify-center px-0'} py-3 rounded-xl font-semibold transition-all duration-200 ${
        active
          ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow-md shadow-[#0d5d3a]/20 dark:shadow-[#1a8a5a]/20'
          : 'text-[#4a7c5d] dark:text-gray-400 hover:bg-[#f0fbf4] dark:hover:bg-white/5 hover:text-[#0d5d3a] dark:hover:text-gray-200'
      }`}
      title={!expanded ? label : undefined}
    >
      <Icon size={20} className="shrink-0" />
      {expanded && <span className="whitespace-nowrap overflow-hidden">{label}</span>}
    </button>
  );
}
