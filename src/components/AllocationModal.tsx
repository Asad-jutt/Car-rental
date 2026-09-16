import React, { useState } from 'react';
import { HUBS, VEHICLES } from '../data/fleetData';
import { Vehicle } from '../types';

interface AllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVehicle?: Vehicle | null;
}

export const AllocationModal: React.FC<AllocationModalProps> = ({
  isOpen,
  onClose,
  selectedVehicle,
}) => {
  const [selectedHub, setSelectedHub] = useState('nyc');
  const [selectedVehicleId, setSelectedVehicleId] = useState(
    selectedVehicle?.id || 'KC-VLK-01'
  );
  const [durationDays, setDurationDays] = useState(3);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  // Sync if selectedVehicle changes
  React.useEffect(() => {
    if (selectedVehicle) {
      setSelectedVehicleId(selectedVehicle.id);
    }
  }, [selectedVehicle]);

  if (!isOpen) return null;

  const currentVehicle =
    VEHICLES.find((v) => v.id === selectedVehicleId) || VEHICLES[0];
  const currentHub = HUBS.find((h) => h.id === selectedHub) || HUBS[0];

  const totalEstimate = currentVehicle.pricePer24h * durationDays;

  const handleConfirm = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      setDispatchSuccess(true);
      setTimeout(() => {
        setDispatchSuccess(false);
        onClose();
      }, 2500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0e0e0e]/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#141414] border border-[#262626] p-4 sm:p-8 flex flex-col justify-between my-auto relative shadow-2xl">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222]">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-[#ff5a00] shadow-[0_0_8px_#ff5a00]"></span>
            <span className="font-mono text-xs sm:text-sm text-[#ffffff] font-bold uppercase tracking-widest">
              [KINETIC ALLOCATION MATRIX // TELEMETRY DIRECTORY]
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#222] hover:bg-[#ff5a00] text-[#e2e2e2] hover:text-black font-mono text-xs uppercase tracking-wider transition-colors border border-[#333]"
          >
            [CLOSE_ESC ✕]
          </button>
        </div>

        {/* Modal Center Matrix Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 my-6 border border-[#222] divide-y md:divide-y-0 md:divide-x divide-[#222]">
          {/* Hub Select */}
          <div className="p-4 sm:p-6 bg-[#0e0e0e] flex flex-col gap-4">
            <span className="font-mono text-xs text-[#ff5a00] uppercase tracking-wider font-bold">
              01 // SELECT FLIGHT TARMAC / HUB
            </span>
            <div className="flex flex-col gap-1.5">
              {HUBS.map((hub) => (
                <label
                  key={hub.id}
                  onClick={() => setSelectedHub(hub.id)}
                  className={`flex items-center justify-between p-2.5 cursor-pointer border transition-colors ${
                    selectedHub === hub.id
                      ? 'bg-[#1e1e1e] border-[#ff5a00]/70'
                      : 'bg-[#141414] border-transparent hover:border-[#333]'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-xs text-[#ffffff]">
                      {hub.name}
                    </span>
                    <span className="font-mono text-[9px] text-[#777]">
                      LATENCY: {hub.latency}
                    </span>
                  </div>
                  <span
                    className={`w-2.5 h-2.5 ${
                      selectedHub === hub.id
                        ? 'bg-[#ff5a00] shadow-[0_0_6px_#ff5a00]'
                        : 'bg-[#333]'
                    }`}
                  ></span>
                </label>
              ))}
            </div>
          </div>

          {/* Vehicle Select */}
          <div className="p-4 sm:p-6 bg-[#0e0e0e] flex flex-col gap-4">
            <span className="font-mono text-xs text-[#ff5a00] uppercase tracking-wider font-bold">
              02 // VEHICLE PROPULSION CLASS
            </span>
            <div className="flex flex-col gap-1.5">
              {VEHICLES.map((v) => (
                <label
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`flex items-center justify-between p-2.5 cursor-pointer border transition-colors ${
                    selectedVehicleId === v.id
                      ? 'bg-[#1e1e1e] border-[#ff5a00]/70'
                      : 'bg-[#141414] border-transparent hover:border-[#333]'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-xs text-[#ffffff] font-bold">
                      {v.name}
                    </span>
                    <span className="font-mono text-[9px] text-[#999]">
                      {v.power} HP • {v.zeroToSixty}S • {v.drive}
                    </span>
                  </div>
                  <span
                    className={`w-2.5 h-2.5 ${
                      selectedVehicleId === v.id
                        ? 'bg-[#ff5a00] shadow-[0_0_6px_#ff5a00]'
                        : 'bg-[#333]'
                    }`}
                  ></span>
                </label>
              ))}
            </div>

            {/* Duration Slider */}
            <div className="pt-2 border-t border-[#222]">
              <div className="flex justify-between font-mono text-[10px] text-[#888] mb-1">
                <span>FLIGHT DURATION:</span>
                <span className="text-[#ff5a00] font-bold">{durationDays} DAYS (72H FLIGHT)</span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full accent-[#ff5a00] bg-[#222] h-1.5 cursor-pointer"
              />
            </div>
          </div>

          {/* Dispatch Spec */}
          <div className="p-4 sm:p-6 bg-[#0e0e0e] flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs text-[#ff5a00] uppercase tracking-wider font-bold">
                03 // PROTOCOL TELEMETRY
              </span>
              <div className="mt-4 space-y-1.5 font-mono text-[11px] text-[#888]">
                <div className="flex justify-between py-1.5 bg-[#141414] px-2.5 border border-[#222]">
                  <span>DISPATCH LATENCY:</span>
                  <span className="text-[#ffffff] font-bold">
                    IMMEDIATE ({currentHub.latency})
                  </span>
                </div>
                <div className="flex justify-between py-1.5 bg-[#141414] px-2.5 border border-[#222]">
                  <span>CONCIERGE TACTICAL:</span>
                  <span className="text-[#ffffff]">UNMARKED FLATBED</span>
                </div>
                <div className="flex justify-between py-1.5 bg-[#141414] px-2.5 border border-[#222]">
                  <span>NFC PROVISIONING:</span>
                  <span className="text-[#ff5a00]">APPLE SECURE ENCLAVE</span>
                </div>
                <div className="flex justify-between py-1.5 bg-[#141414] px-2.5 border border-[#ff5a00]/40 mt-2">
                  <span className="text-[#e2e2e2] font-bold">ESTIMATED RATE:</span>
                  <span className="text-[#ff5a00] font-extrabold text-xs sm:text-sm">
                    ${totalEstimate.toLocaleString()} TOTAL
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              {dispatchSuccess ? (
                <div className="p-3 bg-[#004d20] border border-[#00a846] text-white font-mono text-xs text-center font-bold">
                  ✓ [TELEMETRY INITIATED] NFC ENCLAVE SYNCED TO DEVICE
                </div>
              ) : (
                <button
                  disabled={isDispatching}
                  onClick={handleConfirm}
                  className="w-full py-3 bg-[#ff5a00] hover:bg-[#ffffff] text-black font-mono text-xs font-extrabold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  {isDispatching ? (
                    <>
                      <span className="w-2 h-2 bg-black animate-ping"></span>
                      <span>SYNTHESIZING CRYPTO KEYS...</span>
                    </>
                  ) : (
                    <span>[CONFIRM DISPATCH PARAMETERS]</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Bottom Coordinates */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-[#222] font-mono text-[10px] text-[#777] gap-2">
          <span>KINETIC AUTONOMOUS NETWORK // PORTAL SPEC: REV_4</span>
          <span>LAT_TOLERANCE: 0.0001MM // ZERO-KNOWLEDGE PROOF VERIFIED</span>
        </div>
      </div>
    </div>
  );
};
