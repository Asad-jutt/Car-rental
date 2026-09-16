import React, { useEffect, useState } from 'react';
import { HERO_IMAGE } from '../data/fleetData';

interface HeroSectionProps {
  onOpenModal: () => void;
  selectedHub: string;
  onSelectHub: (hub: string) => void;
  selectedDuration: string;
  onSelectDuration: (dur: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenModal,
  selectedHub,
  selectedDuration,
}) => {
  const [utcTime, setUtcTime] = useState<string>('--:--:-- UTC');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, '0');
      const m = String(now.getUTCMinutes()).padStart(2, '0');
      const s = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${h}:${m}:${s} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="hero"
      className="relative w-full min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-[#0e0e0e] select-none border-b border-[#1f1f1f]"
    >
      {/* Asymmetrical 40/60 Viewport Split */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 min-h-0 relative">
        {/* LEFT EDITORIAL PANEL (5 Cols = ~41.6%) */}
        <div className="lg:col-span-5 flex relative h-full bg-[#0e0e0e] z-10 border-r border-[#1f1f1f]">
          {/* Vertical Micro-Running Baseline Tracker */}
          <div className="w-10 sm:w-12 h-full flex flex-col items-center justify-between py-6 bg-[#161616]/40 shrink-0 border-r border-[#1f1f1f]">
            <span className="font-mono text-[9px] text-[#ff5a00] tracking-widest">
              [AXIS_L0]
            </span>
            <div className="[writing-mode:vertical-rl] rotate-180 font-mono text-[9px] tracking-[0.25em] text-[#888] uppercase">
              [DEPT_SPEC:2027] // SPEC_ALLOCATION_MATRIX
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#ff5a00]"></span>
              <span className="font-mono text-[10px] text-[#888]">01</span>
            </div>
          </div>

          {/* Left Content Area */}
          <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {/* Top Metadata Header */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-1.5 py-0.5 bg-[#ff5a00] text-black font-mono text-[10px] font-bold tracking-wider uppercase">
                  ARCHITECTURAL PROTOCOL
                </span>
                <span className="font-mono text-[10px] text-[#929292] tracking-widest uppercase truncate max-w-[280px]">
                  [KINETIC AUTOMOTIVE CONSORTIUM]
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[#777] font-mono text-[11px] mt-1">
                <span>REF_ID:</span>
                <span className="text-[#e2e2e2] font-semibold">KC-NY-0941A</span>
                <span className="text-[#555]">/</span>
                <span>VER:</span>
                <span className="text-[#ff5a00]">ALPHA_DECO</span>
              </div>
            </div>

            {/* Massive Typographic Headline */}
            <div className="my-6 lg:my-auto py-2">
              <span className="font-mono text-[11px] text-[#ff5a00] tracking-[0.3em] uppercase block mb-2 font-medium">
                [PHASE_ZERO // DEPLOYMENT]
              </span>
              <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-[#ffffff] uppercase tracking-tight leading-[0.95] m-0">
                MACHINERY
                <br />
                WITHOUT
                <br />
                <span className="text-[#ff5a00]">FRICTION.</span>
              </h1>

              {/* Interactive Monospace Micro Text Block */}
              <div className="mt-6 relative group cursor-crosshair overflow-hidden bg-[#161616] p-4 border border-[#222]">
                <div className="flex items-center justify-between mb-1.5 text-[#888] font-mono text-[11px]">
                  <span>[DISPATCH_MEMORANDUM]</span>
                  <span className="text-[#ff5a00] group-hover:rotate-45 transition-transform duration-200">
                    ✛
                  </span>
                </div>
                <p className="font-editorial text-sm text-[#ccc] leading-relaxed transition-all duration-300 group-hover:translate-y-[-120%] group-hover:opacity-0">
                  Zero compromise propulsion. Fleet allocated on-demand to
                  private tarmac, helipads, and metropolitan penthouses across
                  three continents.
                </p>
                <div className="absolute inset-0 p-4 bg-[#202020] translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col justify-center">
                  <span className="font-mono text-[10px] text-[#ff5a00] font-bold mb-1">
                    [ACTIVE ALLOCATION CRITERIA]
                  </span>
                  <p className="font-mono text-[11px] text-[#ffffff] uppercase tracking-wider leading-relaxed">
                    [SPEC_RESERVE: UNLOCKED]
                    <br />
                    [FLEET_BAND: S-CLASS DYNAMICS]
                    <br />
                    [KEYLESS DISPATCH: READY // G-FORCE LOCK ENGAGED]
                  </p>
                </div>
              </div>
            </div>

            {/* Industrial Telemetry Widgets Array */}
            <div className="grid grid-cols-3 gap-0 bg-[#1f1f1f] border border-[#1f1f1f] mt-4">
              <div className="p-3 bg-[#0e0e0e] flex flex-col border-r border-[#1f1f1f]">
                <span className="font-mono text-[9px] text-[#888] uppercase">
                  [LIVE UTC TIME]
                </span>
                <span
                  id="live-utc"
                  className="font-mono text-xs sm:text-sm text-[#ffffff] mt-1 font-bold tabular-nums tracking-wider"
                >
                  {utcTime}
                </span>
              </div>
              <div className="p-3 bg-[#0e0e0e] flex flex-col border-r border-[#1f1f1f]">
                <span className="font-mono text-[9px] text-[#888] uppercase">
                  [GLOBAL POSITION]
                </span>
                <span className="font-mono text-xs sm:text-sm text-[#ffffff] mt-1 font-bold tracking-tight truncate">
                  40.7128°N 74.0060°W
                </span>
              </div>
              <div className="p-3 bg-[#0e0e0e] flex flex-col">
                <span className="font-mono text-[9px] text-[#888] uppercase">
                  [CHASSIS STATUS]
                </span>
                <span className="font-mono text-xs sm:text-sm text-[#ff5a00] mt-1 font-bold tracking-tight">
                  09 HUB / 31 ALLOC
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT IMMERSIVE IMAGE FRAME (7 Cols = ~58.3%) */}
        <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-full bg-[#0e0e0e] overflow-hidden group flex items-center justify-center">
          {/* Background Image Container */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105"
            style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
          />

          {/* Blueprint Vignette & Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-[#0e0e0e]/40 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e0e0e] via-transparent to-transparent pointer-events-none" />

          {/* Blueprint Crosshairs & Corner Brackets */}
          <div className="absolute top-4 sm:top-6 left-4 sm:left-6 pointer-events-none flex items-center gap-2">
            <span className="font-mono text-xs text-[#ff5a00] font-bold">┌</span>
            <span className="font-mono text-[10px] text-[#e2e2e2] tracking-widest uppercase">
              SPEC_CAM: RIG_01
            </span>
          </div>

          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 pointer-events-none text-right">
            <span className="font-mono text-[10px] text-[#888] uppercase">
              SYS_CAM_01 // APERTURE F/1.4
            </span>
            <span className="font-mono text-xs text-[#ff5a00] font-bold block">
              ┐
            </span>
          </div>

          {/* Optical Center Crosshair Target */}
          <div className="relative pointer-events-none flex items-center justify-center">
            <div className="w-16 h-16 relative flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
              <div className="w-full h-px bg-[#ff5a00]/60"></div>
              <div className="h-full w-px bg-[#ff5a00]/60 absolute"></div>
              <span className="absolute font-mono text-[10px] text-[#ff5a00] -top-4 -right-4">
                [ + ]
              </span>
              <span className="absolute font-mono text-[10px] text-[#ffffff] -bottom-4 -left-4">
                LIDAR: 100%
              </span>
            </div>
          </div>

          {/* Lower Right Floating Focal Indicator */}
          <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 pointer-events-none flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0e0e0e]/90 backdrop-blur border border-[#1f1f1f]">
              <span className="w-2 h-2 bg-[#ff5a00] inline-block shadow-[0_0_6px_#ff5a00]"></span>
              <span className="font-mono text-[10px] sm:text-xs text-[#ffffff] uppercase tracking-wider">
                CHASSIS_004: ELECTRIC QUAD-MOTOR // 1,914 HP
              </span>
            </div>
            <span className="font-mono text-xs text-[#ff5a00] font-bold">┘</span>
          </div>

          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 pointer-events-none">
            <span className="font-mono text-xs text-[#ff5a00] font-bold">└</span>
          </div>
        </div>
      </div>

      {/* Base Integrated Command Strip (Interactive Dispatch Bar) */}
      <div className="w-full bg-[#0e0e0e] z-20 shrink-0 border-t border-[#1f1f1f]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 bg-[#1f1f1f]">
          {/* Command Slot 01: Node Location */}
          <div
            onClick={onOpenModal}
            className="md:col-span-4 p-4 bg-[#0e0e0e] hover:bg-[#181818] transition-colors group cursor-pointer border-b md:border-b-0 md:border-r border-[#1f1f1f]"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#888] group-hover:text-[#ff5a00] transition-colors uppercase tracking-widest">
                [NODE_LOC: SELECT REGION]
              </span>
              <span className="font-mono text-[10px] text-[#666] group-hover:text-[#ffffff]">
                LOC_ID: 001
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-mono text-xs sm:text-sm text-[#ffffff] font-bold uppercase tracking-wider truncate">
                {selectedHub}
              </span>
              <span className="material-symbols-outlined text-[#888] group-hover:text-[#ff5a00] text-sm">
                arrow_drop_down
              </span>
            </div>
          </div>

          {/* Command Slot 02: Time Frame */}
          <div
            onClick={onOpenModal}
            className="md:col-span-4 p-4 bg-[#0e0e0e] hover:bg-[#181818] transition-colors group cursor-pointer border-b md:border-b-0 md:border-r border-[#1f1f1f]"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#888] group-hover:text-[#ff5a00] transition-colors uppercase tracking-widest">
                [TIME_FRAME: SELECT DURATION]
              </span>
              <span className="font-mono text-[10px] text-[#666] group-hover:text-[#ffffff]">
                TIER: FLIGHT
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-mono text-xs sm:text-sm text-[#ffffff] font-bold uppercase tracking-wider truncate">
                {selectedDuration}
              </span>
              <span className="material-symbols-outlined text-[#888] group-hover:text-[#ff5a00] text-sm">
                schedule
              </span>
            </div>
          </div>

          {/* Command Slot 03: Run Engine Action */}
          <div
            onClick={onOpenModal}
            className="md:col-span-4 p-4 bg-[#ff5a00] hover:bg-[#ffffff] transition-colors cursor-pointer group flex items-center justify-between"
          >
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-black font-bold uppercase tracking-widest">
                [COMMAND]
              </span>
              <span className="font-headline text-lg sm:text-xl text-black font-black uppercase tracking-tight">
                RUN_ENGINE →
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1.5">
              <span className="font-mono text-[10px] text-black font-bold tracking-widest uppercase">
                DISPATCH TELEMETRY
              </span>
              <span className="material-symbols-outlined text-black text-sm">
                sensors
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
