import React, { useState } from 'react';

export const Footer: React.FC = () => {
  const [cipherInput, setCipherInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cipherInput.trim()) return;
    setSubscribed(true);
    setTimeout(() => {
      setCipherInput('');
      setSubscribed(false);
    }, 3000);
  };

  return (
    <footer className="w-full bg-[#0e0e0e] border-t border-[#1f1f1f] text-[#e2e2e2] select-none">
      {/* Live Global Node Status Indicators Ribbon */}
      <div className="w-full border-b border-[#1f1f1f] px-4 sm:px-8 py-2.5 bg-[#141414]/60">
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] sm:text-[11px]">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-[#888] uppercase">[LIVE NODES]:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#ff5a00] inline-block shadow-[0_0_6px_#ff5a00]"></span>
              <span>NYC / JFK [ONLINE]</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#ff5a00] inline-block shadow-[0_0_6px_#ff5a00]"></span>
              <span>LON / BATTERSEA [ONLINE]</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#ff5a00] inline-block shadow-[0_0_6px_#ff5a00]"></span>
              <span>TYO / HANEDA [ONLINE]</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#ff5a00] inline-block shadow-[0_0_6px_#ff5a00]"></span>
              <span>ZRH / KNOTEN [ONLINE]</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#ff5a00] inline-block shadow-[0_0_6px_#ff5a00]"></span>
              <span>DXB / AIRLIFT [ONLINE]</span>
            </div>
          </div>
          <div className="text-[#888] font-mono">
            SYSTEM LOAD: 48.2% // ZERO LATENCY
          </div>
        </div>
      </div>

      {/* Primary Footer Dispatch Interface */}
      <div className="w-full px-4 sm:px-8 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Brand Info & Monospace Memo */}
        <div className="md:col-span-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-headline text-xl sm:text-2xl tracking-tight uppercase font-extrabold text-[#ffffff]">
                KINETIC
              </span>
              <span className="border border-[#1f1f1f] bg-[#161616] px-2 py-0.5 font-mono text-[9px] uppercase text-[#ff5a00] font-bold">
                [PROTOCOL V.27.4]
              </span>
            </div>
            <p className="font-editorial text-xs sm:text-sm text-[#a0a0a0] leading-relaxed max-w-sm">
              Autonomous luxury automotive logistics consortium. High-performance
              electric and hybrid powertrains dispatched without friction to
              global private terminals.
            </p>
          </div>
          <div className="font-mono text-[10px] text-[#777] leading-relaxed">
            ATELIER REF: 0x9B41-FC77-2027
            <br />
            CRYPTOGRAPHIC INTEGRITY: VERIFIED // AIR-GAPPED HARDWARE
          </div>
        </div>

        {/* Navigation Column 1 */}
        <div className="md:col-span-2 flex flex-col space-y-2 font-mono text-[11px]">
          <span className="text-[#ff5a00] uppercase tracking-widest font-bold mb-1">
            [FLEET_DIRECT]
          </span>
          <a className="text-[#888] hover:text-[#ffffff] transition-colors py-0.5" href="#inventory">
            VALKYRIE-X (S-BAND)
          </a>
          <a className="text-[#888] hover:text-[#ffffff] transition-colors py-0.5" href="#inventory">
            AURA GT (HYPER-GT)
          </a>
          <a className="text-[#888] hover:text-[#ffffff] transition-colors py-0.5" href="#inventory">
            AEGIS APEX (TRACK)
          </a>
          <a className="text-[#888] hover:text-[#ffffff] transition-colors py-0.5" href="#inventory">
            SOLARIS QUAD (RESERVE)
          </a>
          <a className="text-[#888] hover:text-[#ffffff] transition-colors py-0.5" href="#inventory">
            BESPOKE CHASSIS
          </a>
        </div>

        {/* Navigation Column 2 */}
        <div className="md:col-span-2 flex flex-col space-y-2 font-mono text-[11px]">
          <span className="text-[#ff5a00] uppercase tracking-widest font-bold mb-1">
            [INFRASTRUCTURE]
          </span>
          <a className="text-[#888] hover:text-[#ffffff] transition-colors py-0.5" href="#protocol">
            TARMAC CONCIERGE
          </a>
          <a className="text-[#888] hover:text-[#ffffff] transition-colors py-0.5" href="#protocol">
            HELI DOCKING NETWORK
          </a>
          <a className="text-[#888] hover:text-[#ffffff] transition-colors py-0.5" href="#protocol">
            ZERO-KNOWLEDGE AUTH
          </a>
          <a className="text-[#888] hover:text-[#ffffff] transition-colors py-0.5" href="#security">
            LLOYDS ESCROW BOND
          </a>
          <a className="text-[#888] hover:text-[#ffffff] transition-colors py-0.5" href="#security">
            TELEMETRY ENCLAVE
          </a>
        </div>

        {/* Newsletter / Terminal Cipher Input */}
        <div className="md:col-span-4 flex flex-col justify-between space-y-4">
          <div>
            <span className="font-mono text-[10px] uppercase text-[#ff5a00] tracking-widest font-bold block mb-1">
              [DISPATCH_CIPHER // SUBSCRIPTION]
            </span>
            <p className="font-editorial text-xs text-[#a0a0a0] mb-3 leading-relaxed">
              Receive confidential allocation releases, prototype track invitations,
              and node updates directly into your PGP/terminal.
            </p>

            <form onSubmit={handleSubscribe} className="flex items-stretch border border-[#1f1f1f] bg-[#161616]">
              <input
                className="flex-1 bg-transparent border-0 px-3 py-2 font-mono text-xs text-[#ffffff] placeholder:text-[#666] focus:outline-none"
                placeholder="CIPHER_PUBKEY OR EMAIL"
                type="text"
                value={cipherInput}
                onChange={(e) => setCipherInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 bg-[#ff5a00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#ffffff] transition-colors"
              >
                {subscribed ? 'ENROLLED ✓' : 'ENGAGE'}
              </button>
            </form>
          </div>

          <div className="flex items-center gap-3 font-mono text-[10px] text-[#777]">
            <span className="hover:text-[#ff5a00] cursor-pointer">TERMINAL // SSH</span>
            <span>•</span>
            <span className="hover:text-[#ff5a00] cursor-pointer">TELEGRAM BOT</span>
            <span>•</span>
            <span className="hover:text-[#ff5a00] cursor-pointer">API DOCS</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Encryption Hash & Legal */}
      <div className="w-full px-4 sm:px-8 py-4 border-t border-[#1f1f1f] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[10px] text-[#777]">
        <div className="flex items-center gap-3">
          <span>SYS_REF // KINETIC-ATELIER-00</span>
          <span className="hidden sm:inline">|</span>
          <span>SPEC_SHEET RUNTIME REV 4.2</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="hover:text-[#ffffff] cursor-pointer uppercase">
            ENCRYPTION_HASH: SHA256_8F201C
          </span>
          <span className="hover:text-[#ffffff] cursor-pointer uppercase">
            CHASSIS_ALLOCATION_TERMS
          </span>
          <span className="text-[#888]">© 2025 KINETIC MOTORS CONSORTIUM</span>
        </div>
      </div>
    </footer>
  );
};
