import React, { useState } from 'react';
import { Vehicle } from '../types';
import { VEHICLES } from '../data/fleetData';

interface FleetMatrixProps {
  onSelectVehicle: (v: Vehicle) => void;
}

export const FleetMatrix: React.FC<FleetMatrixProps> = ({ onSelectVehicle }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'ev' | 'hybrid' | 'quad'>('all');
  const [selectedNode, setSelectedNode] = useState('ALL');

  const filteredVehicles = VEHICLES.filter((v) => {
    if (activeCategory === 'all') return true;
    return v.category === activeCategory;
  });

  return (
    <section className="w-full border-t border-[#1f1f1f] bg-[#0e0e0e]" id="inventory">
      {/* Section Title Bar & Telemetry Filters Header */}
      <div className="w-full border-b border-[#1f1f1f] px-4 sm:px-8 py-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-[#ff5a00] inline-block shadow-[0_0_6px_#ff5a00]"></span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#ff5a00]">
              [MODULE_01 // CHASSIS DIRECTORY]
            </span>
          </div>
          <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-[#ffffff] m-0">
            ACTIVE INVENTORY &amp; FLEET MATRIX
          </h2>
          <p className="font-mono text-[10px] sm:text-[11px] text-[#929292] uppercase tracking-widest mt-1">
            REAL-TIME GLOBAL TELEMETRY // IMMEDIATE DISPATCH PROTOCOLS
          </p>
        </div>

        {/* Filter System Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center border border-[#1f1f1f] bg-[#161616] p-1 gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 font-mono text-[11px] uppercase tracking-wider font-bold transition-colors whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-[#ff5a00] text-black'
                  : 'text-[#929292] hover:text-[#ffffff]'
              }`}
            >
              ALL PROPULSION
            </button>
            <button
              onClick={() => setActiveCategory('ev')}
              className={`px-3 py-1 font-mono text-[11px] uppercase tracking-wider font-bold transition-colors whitespace-nowrap ${
                activeCategory === 'ev'
                  ? 'bg-[#ff5a00] text-black'
                  : 'text-[#929292] hover:text-[#ffffff]'
              }`}
            >
              SOLID-STATE EV
            </button>
            <button
              onClick={() => setActiveCategory('hybrid')}
              className={`px-3 py-1 font-mono text-[11px] uppercase tracking-wider font-bold transition-colors whitespace-nowrap ${
                activeCategory === 'hybrid'
                  ? 'bg-[#ff5a00] text-black'
                  : 'text-[#929292] hover:text-[#ffffff]'
              }`}
            >
              HYBRID V12
            </button>
            <button
              onClick={() => setActiveCategory('quad')}
              className={`px-3 py-1 font-mono text-[11px] uppercase tracking-wider font-bold transition-colors whitespace-nowrap ${
                activeCategory === 'quad'
                  ? 'bg-[#ff5a00] text-black'
                  : 'text-[#929292] hover:text-[#ffffff]'
              }`}
            >
              QUANTUM QUAD
            </button>
          </div>

          <div className="flex items-center border border-[#1f1f1f] bg-[#161616] px-3 py-1.5">
            <span className="font-mono text-[10px] text-[#888] mr-2">[NODE:]</span>
            <select
              value={selectedNode}
              onChange={(e) => setSelectedNode(e.target.value)}
              className="bg-transparent border-0 font-mono text-[11px] uppercase text-[#ffffff] tracking-wider focus:outline-none focus:ring-0 p-0 cursor-pointer"
            >
              <option value="ALL" className="bg-[#161616]">
                ALL NODES (NYC / LON / TYO / DXB)
              </option>
              <option value="NYC" className="bg-[#161616]">
                NYC // JFK TARMAC
              </option>
              <option value="LON" className="bg-[#161616]">
                LON // BATTERSEA HELI
              </option>
              <option value="TYO" className="bg-[#161616]">
                TYO // HANEDA VAULT
              </option>
              <option value="DXB" className="bg-[#161616]">
                DXB // EMIRATES BERTH
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Fleet Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#1f1f1f] border-b border-[#1f1f1f]">
        {filteredVehicles.map((vehicle) => (
          <article
            key={vehicle.id}
            className="flex flex-col justify-between bg-[#0e0e0e] group hover:bg-[#141414] transition-colors"
          >
            {/* Top Micro-Metadata */}
            <div className="p-4 border-b border-[#1f1f1f] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#777]">ASSET_ID:</span>
                <span className="font-mono text-[11px] text-[#ffffff] font-bold">
                  {vehicle.id}
                </span>
              </div>
              <div
                className={`flex items-center gap-1.5 px-2 py-0.5 border ${
                  vehicle.statusTone === 'orange'
                    ? 'bg-[#ff5a00]/10 border-[#ff5a00]/40'
                    : 'bg-[#1f1f1f] border-[#333]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 inline-block ${
                    vehicle.statusTone === 'orange'
                      ? 'bg-[#ff5a00] shadow-[0_0_6px_#ff5a00]'
                      : 'bg-[#777]'
                  }`}
                ></span>
                <span
                  className={`font-mono text-[9px] font-bold tracking-wider ${
                    vehicle.statusTone === 'orange'
                      ? 'text-[#ff5a00]'
                      : 'text-[#888]'
                  }`}
                >
                  {vehicle.statusBadge}
                </span>
              </div>
            </div>

            {/* Vehicle Image Presentation */}
            <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#161616]">
              <img
                alt={`${vehicle.name} Profile`}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                src={vehicle.imageUrl}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-3 left-4 flex items-center gap-1">
                <span className="font-mono text-[9px] sm:text-[10px] bg-[#0e0e0e]/85 backdrop-blur px-2 py-0.5 border border-[#1f1f1f] text-[#ffffff] uppercase tracking-wider">
                  CHASSIS: {vehicle.chassis}
                </span>
              </div>
              <div className="absolute top-3 right-4 font-mono text-[10px] text-[#888]">
                ┌ {vehicle.rigLabel} ┐
              </div>
            </div>

            {/* Specs & Technical Telemetry */}
            <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <h3 className="font-headline text-lg sm:text-xl font-bold uppercase tracking-tight text-[#ffffff]">
                    {vehicle.name}
                  </h3>
                  <span className="font-mono text-[10px] text-[#888] uppercase">
                    [BAND: {vehicle.band}]
                  </span>
                </div>
                <p className="font-editorial text-xs sm:text-sm text-[#b0b0b0] leading-relaxed mb-4">
                  {vehicle.desc}
                </p>
              </div>

              {/* Technical Telemetry Matrix Grid */}
              <div className="grid grid-cols-3 gap-0 border border-[#1f1f1f] bg-[#161616] mb-4">
                <div className="p-3 border-r border-[#1f1f1f] flex flex-col">
                  <span className="font-mono text-[9px] text-[#888] uppercase">
                    POWER
                  </span>
                  <span className="font-headline text-lg sm:text-xl text-[#ffffff] font-bold tracking-tight mt-0.5">
                    {vehicle.power}
                    <span className="text-[10px] font-mono text-[#888] ml-1">
                      {vehicle.powerUnit}
                    </span>
                  </span>
                </div>
                <div className="p-3 border-r border-[#1f1f1f] flex flex-col">
                  <span className="font-mono text-[9px] text-[#888] uppercase">
                    0-60 MPH
                  </span>
                  <span className="font-headline text-lg sm:text-xl text-[#ff5a00] font-bold tracking-tight mt-0.5">
                    {vehicle.zeroToSixty}
                    <span className="text-[10px] font-mono text-[#888] ml-1">
                      SEC
                    </span>
                  </span>
                </div>
                <div className="p-3 flex flex-col">
                  <span className="font-mono text-[9px] text-[#888] uppercase">
                    DRIVE
                  </span>
                  <span className="font-headline text-lg sm:text-xl text-[#ffffff] font-bold tracking-tight mt-0.5">
                    {vehicle.drive}
                    <span className="text-[10px] font-mono text-[#888] ml-1">
                      {vehicle.driveSub}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#888] mb-4 border-b border-[#1f1f1f]/50 pb-2">
                <span>PWR/WT: {vehicle.pwrWt}</span>
                <span>•</span>
                <span>
                  {vehicle.secondarySpecLabel}: {vehicle.secondarySpecVal}
                </span>
                <span>•</span>
                <span className="text-[#aaa]">{vehicle.rangeOrEscrow}</span>
              </div>

              {/* Pricing & Reservation Trigger */}
              <div className="pt-3 border-t border-[#1f1f1f] flex items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-[9px] text-[#777] block uppercase">
                    ALLOCATION TARIFF
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-headline text-xl sm:text-2xl text-[#ffffff] font-extrabold">
                      ${vehicle.pricePer24h.toLocaleString()}
                    </span>
                    <span className="font-mono text-[10px] text-[#888] uppercase">
                      / 24H FLIGHT
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onSelectVehicle(vehicle)}
                  className="px-4 py-2 bg-[#222] hover:bg-[#ff5a00] text-[#ffffff] hover:text-black font-mono text-xs uppercase tracking-wider font-bold transition-colors border border-[#333] hover:border-[#ff5a00]"
                >
                  DEPLOY ASSET →
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
