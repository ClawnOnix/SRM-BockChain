import React from 'react';
export function Logo() {
  return <div className="flex items-center">
      <div className="h-12 w-12 rounded-lg bg-[#4ade80] flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-[#0f172a]">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      </div>
      <span className="ml-3 text-xl font-bold text-white">SRM-Blockchain</span>
    </div>;
}