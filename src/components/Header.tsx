import React, { useState } from 'react';
import { FontPreset } from '../types';
import { BRAND_LOGO } from '../data/fleetData';

interface HeaderProps {
  currentPreset: FontPreset;
  onSelectPreset: (preset: FontPreset) => void;
  activeSection: string;
  onOpenModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPreset,
  onSelectPreset,
  activeSection,
  onOpenModal,
}) => {
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const presets: { id: FontPreset; name: string; tag: string; desc: string }[] = [
    {
      id: 'unbounded',
      name: 'UNBOUNDED',
      tag: 'NEW // RECOMMENDED',
      desc: 'Precision aerodynamic geometry & hypercar stance',
    },
    {
      id: 'syncopate',
      name: 'SYNCOPATE',
      tag: 'WIDE MONOLITH',
      desc: 'Architectural haute-horlogerie wide horizontal cadence',
    },
    {
      id: 'chakra',
      name: 'CHAKRA PETCH',
      tag: 'RACETRACK HUD',
      desc: 'Chiseled angular telemetry & cockpit HUD display',
    },
    {
      id: 'syne',
      name: 'SYNE',
      tag: 'ORIGINAL TEMPLATE',
      desc: 'Previous curved art-deco template font for comparison',
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0e0e0e]/95 backdrop-blur-md border-b border-[#1f1f1f] select-none">
      <div className="h-16 w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <a href="#hero" className="flex items-center gap-3 group">
            <img
              alt="KINETIC Brand Mark"
              className="h-7 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              src={BRAND_LOGO}
            />
            <span className="font-headline text-xl sm:text-2xl font-black uppercase tracking-tight text-[#e2e2e2]">
              KINETIC
            </span>
          </a>

          <div className="h-4 w-[1px] bg-[#1f1f1f] hidden sm:block"></div>
          <span className="hidden sm:inline-block border border-[#1f1f1f] bg-[#1b1b1b] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#929292]">
            [PROTOCOL // V.27.4]
          </span>
        </div>

        {/* Center: Navigation Stages */}
        <nav className="hidden xl:flex items-center h-full">
          <a
            href="#hero"
            className={`h-full flex items-center px-4 font-mono text-xs uppercase tracking-wider transition-colors border-b-2 ${
              activeSection === 'hero'
                ? 'text-[#e2e2e2] border-[#ff5a00] bg-[#1b1b1b]'
                : 'border-transparent text-[#a0a0a0] hover:text-[#e2e2e2]'
            }`}
          >
            STAGE 01 // VIEWPORT HERO
          </a>
          <a
            href="#inventory"
            className={`h-full flex items-center px-4 font-mono text-xs uppercase tracking-wider transition-colors border-b-2 ${
              activeSection === 'inventory'
                ? 'text-[#e2e2e2] border-[#ff5a00] bg-[#1b1b1b]'
                : 'border-transparent text-[#a0a0a0] hover:text-[#e2e2e2]'
            }`}
          >
            STAGE 02 // FLEET BLUEPRINT
          </a>
          <a
            href="#protocol"
            className={`h-full flex items-center px-4 font-mono text-xs uppercase tracking-wider transition-colors border-b-2 ${
              activeSection === 'protocol'
                ? 'text-[#e2e2e2] border-[#ff5a00] bg-[#1b1b1b]'
                : 'border-transparent text-[#a0a0a0] hover:text-[#e2e2e2]'
            }`}
          >
            STAGE 03 // WHITE-GLOVE PORTAL
          </a>
          <a
            href="#tiers"
            className={`h-full flex items-center px-4 font-mono text-xs uppercase tracking-wider transition-colors border-b-2 ${
              activeSection === 'tiers'
                ? 'text-[#e2e2e2] border-[#ff5a00] bg-[#1b1b1b]'
                : 'border-transparent text-[#a0a0a0] hover:text-[#e2e2e2]'
            }`}
          >
            STAGE 04 // SYNDICATE
          </a>
        </nav>

        {/* Right: Telemetry + Font Selector + User Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* FONT PRESET SELECTOR (Crucial for user's explicit request) */}
          <div className="relative">
            <button
              onClick={() => setShowFontMenu(!showFontMenu)}
              className="flex items-center gap-1.5 border border-[#ff5a00]/40 bg-[#1b1b1b] hover:border-[#ff5a00] px-2.5 py-1 text-xs font-mono text-[#e2e2e2] transition-colors"
              title="Click to toggle or compare font pairs"
            >
              <span className="text-[#ff5a00] font-bold">Aa</span>
              <span className="hidden sm:inline text-[#929292]">FONT:</span>
              <span className="font-bold text-[#ff5a00] uppercase">
                {currentPreset}
              </span>
              <span className="text-[10px] text-[#929292]">▼</span>
            </button>

            {/* Dropdown Menu */}
            {showFontMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowFontMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-[#141414] border border-[#2a2a2a] p-2 z-50 shadow-2xl">
                  <div className="p-2 border-b border-[#222] mb-1 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#ff5a00] uppercase tracking-wider font-bold">
                      [TYPOGRAPHY ENGINE]
                    </span>
                    <span className="text-[9px] font-mono text-[#777]">
                      LIVE RE-RENDER
                    </span>
                  </div>
                  <div className="space-y-1">
                    {presets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          onSelectPreset(preset.id);
                          setShowFontMenu(false);
                        }}
                        className={`w-full text-left p-2.5 border transition-all flex flex-col gap-0.5 ${
                          currentPreset === preset.id
                            ? 'border-[#ff5a00] bg-[#1f1f1f]'
                            : 'border-transparent hover:border-[#333] hover:bg-[#1a1a1a]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-sm font-bold tracking-tight text-white uppercase"
                            style={{
                              fontFamily:
                                preset.id === 'unbounded'
                                  ? 'Unbounded'
                                  : preset.id === 'syncopate'
                                  ? 'Syncopate'
                                  : preset.id === 'chakra'
                                  ? 'Chakra Petch'
                                  : 'Syne',
                            }}
                          >
                            {preset.name}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 ${
                              preset.id === currentPreset
                                ? 'bg-[#ff5a00] text-black font-bold'
                                : 'bg-[#222] text-[#999]'
                            }`}
                          >
                            {preset.tag}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-[#888] leading-tight">
                          {preset.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Active Telemetry Chip */}
          <div className="hidden sm:flex items-center gap-1.5 border border-[#1f1f1f] bg-[#1b1b1b] px-2 py-1 font-mono text-[10px] text-[#e2e2e2]">
            <span className="w-1.5 h-1.5 bg-[#ff5a00] inline-block shadow-[0_0_6px_#ff5a00] animate-pulse"></span>
            <span className="tracking-wide">[TELEMETRY: ACTIVE]</span>
          </div>

          {/* Global Region Indicator */}
          <div className="hidden md:flex items-center border border-[#1f1f1f] bg-[#1b1b1b] px-2 py-1 font-mono text-[10px] text-[#929292]">
            <span className="text-[#a0a0a0]">[REGION:</span>
            <span className="text-[#e2e2e2] ml-1">GLOBAL // NYC-LON-TYO]</span>
          </div>

          {/* Direct Dispatch Quick Button */}
          <button
            onClick={onOpenModal}
            className="w-8 h-8 bg-[#ff5a00] hover:bg-white text-black font-bold flex items-center justify-center transition-colors"
            title="Open Allocation Matrix"
          >
            <span className="material-symbols-outlined text-base">sensors</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden w-8 h-8 border border-[#1f1f1f] bg-[#1b1b1b] flex items-center justify-center text-[#e2e2e2]"
          >
            <span className="material-symbols-outlined text-sm">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#111] border-b border-[#1f1f1f] p-4 font-mono text-xs space-y-2">
          <a
            href="#hero"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 border border-[#222] bg-[#161616] text-[#e2e2e2] hover:border-[#ff5a00]"
          >
            STAGE 01 // VIEWPORT HERO
          </a>
          <a
            href="#inventory"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 border border-[#222] bg-[#161616] text-[#e2e2e2] hover:border-[#ff5a00]"
          >
            STAGE 02 // FLEET BLUEPRINT
          </a>
          <a
            href="#protocol"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 border border-[#222] bg-[#161616] text-[#e2e2e2] hover:border-[#ff5a00]"
          >
            STAGE 03 // WHITE-GLOVE PORTAL
          </a>
          <a
            href="#tiers"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 border border-[#222] bg-[#161616] text-[#e2e2e2] hover:border-[#ff5a00]"
          >
            STAGE 04 // SYNDICATE
          </a>
        </div>
      )}
    </header>
  );
};
