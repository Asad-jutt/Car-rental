import React, { useState, useEffect } from 'react';
import { FontPreset, Vehicle, SyndicateTier } from './types';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FleetMatrix } from './components/FleetMatrix';
import { WhiteGloveProtocol } from './components/WhiteGloveProtocol';
import { SyndicateTiers } from './components/SyndicateTiers';
import { DriverLogs } from './components/DriverLogs';
import { SecurityEnclave } from './components/SecurityEnclave';
import { Footer } from './components/Footer';
import { AllocationModal } from './components/AllocationModal';

export default function App() {
  const [currentFontPreset, setCurrentFontPreset] = useState<FontPreset>('unbounded');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [activeSection, setActiveSection] = useState('hero');
  const [selectedHub, setSelectedHub] = useState('MANHATTAN CENTRAL HUB (AIRLIFT READY)');
  const [selectedDuration, setSelectedDuration] = useState('72-HOUR FLIGHT DURATION // UNLIMITED DYNAMICS');

  // Update data-font-preset attribute on root HTML element
  useEffect(() => {
    document.documentElement.setAttribute('data-font-preset', currentFontPreset);
  }, [currentFontPreset]);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'inventory', 'protocol', 'tiers'];
      const scrollPos = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectVehicleForModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleSelectTierForModal = (_tier: SyndicateTier) => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#e2e2e2] flex flex-col font-mono-tech">
      {/* Pinned Architectural Navigation Bar */}
      <Header
        currentPreset={currentFontPreset}
        onSelectPreset={setCurrentFontPreset}
        activeSection={activeSection}
        onOpenModal={() => setIsModalOpen(true)}
      />

      {/* Main Viewport Content */}
      <main className="w-full pt-16 flex-1 flex flex-col">
        {/* Stage 01: Viewport Hero */}
        <HeroSection
          onOpenModal={() => setIsModalOpen(true)}
          selectedHub={selectedHub}
          onSelectHub={setSelectedHub}
          selectedDuration={selectedDuration}
          onSelectDuration={setSelectedDuration}
        />

        {/* Stage 02: Active Inventory & Fleet Matrix */}
        <FleetMatrix onSelectVehicle={handleSelectVehicleForModal} />

        {/* Stage 03: White-Glove Deployment Protocol */}
        <WhiteGloveProtocol />

        {/* Stage 04: Syndicate Membership Allocation Tiers */}
        <SyndicateTiers onSelectTier={handleSelectTierForModal} />

        {/* Telemetry & Verified Driver Verification Logs */}
        <DriverLogs />

        {/* Security Enclave & Protocol Compliance FAQs */}
        <SecurityEnclave />
      </main>

      {/* Industrial Brutalist Footer */}
      <Footer />

      {/* Interactive Telemetry & Allocation Matrix Modal */}
      <AllocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedVehicle={selectedVehicle}
      />

      {/* Floating Font Feedback Indicator on bottom left */}
      <div className="fixed bottom-4 left-4 z-40 hidden sm:flex items-center gap-2 border border-[#222] bg-[#111]/90 backdrop-blur px-3 py-1.5 font-mono text-[10px] text-[#aaa]">
        <span className="w-1.5 h-1.5 bg-[#ff5a00] inline-block"></span>
        <span>ACTIVE FONT:</span>
        <span className="text-[#ffffff] font-bold uppercase">{currentFontPreset}</span>
        <button
          onClick={() => {
            const list: FontPreset[] = ['unbounded', 'syncopate', 'chakra', 'syne'];
            const nextIdx = (list.indexOf(currentFontPreset) + 1) % list.length;
            setCurrentFontPreset(list[nextIdx]);
          }}
          className="ml-2 text-[#ff5a00] hover:underline cursor-pointer"
        >
          [CYCLE ↻]
        </button>
      </div>
    </div>
  );
}
