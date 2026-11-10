'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import PrototypeBanner from './PrototypeBanner';
import SettingsModal from './SettingsModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07080c] text-slate-100 flex flex-col font-sans antialiased selection:bg-violet-600 selection:text-white">
      {/* Top Prototype Demonstration Notice */}
      <PrototypeBanner />

      <div className="flex flex-1 min-h-0">
        {/* Left Persistent Desktop Sidebar + Mobile Drawer */}
        <Sidebar
          isMobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar
            onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
            onOpenSettings={() => setSettingsOpen(true)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>

      {/* Global Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
