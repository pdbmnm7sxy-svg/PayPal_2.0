'use client';

import React, { useState, useEffect } from 'react';
import TelemetryHeader from './TelemetryHeader';
import TactileDock from './TactileDock';
import CommandPalette from './CommandPalette';
import PrototypeBanner from './PrototypeBanner';
import SettingsModal from './SettingsModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-violet-600 selection:text-white relative pb-24">
      {/* Top Prototype Demonstration Notice */}
      <PrototypeBanner />

      {/* Top Cosmic Telemetry Status Bar */}
      <TelemetryHeader
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Dynamic Viewport */}
      <main className="flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
        {children}
      </main>

      {/* Floating Tactile Segmented Dock (Screen bottom) */}
      <TactileDock onOpenCommandPalette={() => setCommandPaletteOpen(true)} />

      {/* Omnipresent ⌘K Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Global Settings & Simulation Config Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
