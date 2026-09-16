import React from 'react';
import { SYNDICATE_TIERS } from '../data/fleetData';
import { SyndicateTier } from '../types';

interface SyndicateTiersProps {
  onSelectTier: (tier: SyndicateTier) => void;
}

export const SyndicateTiers: React.FC<SyndicateTiersProps> = ({ onSelectTier }) => {
  return (
    <section className="w-full bg-[#0e0e0e] border-b border-[#1f1f1f]" id="tiers">
      <div className="px-4 sm:px-8 py-10 sm:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-[#1f1f1f]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-[#ff5a00] inline-block shadow-[0_0_6px_#ff5a00]"></span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#ff5a00]">
                [MODULE_03 // SYNDICATE PRIVILEGES]
              </span>
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-[#ffffff] m-0">
              MEMBERSHIP ALLOCATION TIERS
            </h2>
            <p className="font-mono text-[10px] sm:text-[11px] text-[#929292] uppercase tracking-widest mt-1">
              ANNUAL RETENTION &amp; DEDICATED HYPERCAR CAPACITY RESERVES
            </p>
          </div>
          <div className="font-mono text-[10px] sm:text-xs text-[#888] uppercase tracking-wider mt-3 md:mt-0">
            [GLOBAL FLEET CAPACITY: 120 SEATS WORLDWIDE]
          </div>
        </div>

        {/* 3 Bordered Data Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#1f1f1f] border border-[#1f1f1f]">
          {SYNDICATE_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`p-6 sm:p-8 flex flex-col justify-between group transition-colors relative ${
                tier.featured
                  ? 'bg-[#141414] border-y lg:border-y-0 lg:border-x-2 border-[#ff5a00]'
                  : 'bg-[#0e0e0e] hover:bg-[#141414]'
              }`}
            >
              {/* Floating Corner Badge for featured */}
              {tier.featured && (
                <div className="absolute top-0 right-0 bg-[#ff5a00] text-black font-mono text-[10px] font-bold uppercase px-3 py-1 tracking-wider">
                  {tier.slotsRemaining}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1f1f1f]">
                  <span
                    className={`font-mono text-[10px] uppercase ${
                      tier.featured ? 'text-[#ff5a00] font-bold' : 'text-[#888]'
                    }`}
                  >
                    {tier.tierNumber}
                  </span>
                  <span className="font-mono text-[10px] uppercase text-[#aaa]">
                    {tier.statusBadge}
                  </span>
                </div>

                <h3 className="font-headline text-xl sm:text-2xl font-bold uppercase text-[#ffffff] tracking-tight mb-2">
                  {tier.name}
                </h3>

                <div className="flex items-baseline gap-2 mb-6">
                  <span
                    className={`font-headline text-2xl sm:text-3xl font-extrabold ${
                      tier.featured ? 'text-[#ff5a00]' : 'text-[#ffffff]'
                    }`}
                  >
                    {tier.price}
                  </span>
                  <span className="font-mono text-[10px] text-[#888] uppercase">
                    {tier.priceSub}
                  </span>
                </div>

                <ul className="space-y-3 font-editorial text-xs sm:text-sm text-[#b0b0b0] border-t border-[#1f1f1f] pt-4 mb-8">
                  {tier.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span
                        className={`font-mono font-bold text-xs ${
                          feat.included ? 'text-[#ff5a00]' : 'text-[#555]'
                        }`}
                      >
                        {feat.included ? '✛' : '—'}
                      </span>
                      <span
                        className={
                          feat.included
                            ? 'text-[#d0d0d0]'
                            : 'text-[#666] line-through'
                        }
                      >
                        {feat.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onSelectTier(tier)}
                className={`w-full py-2.5 font-mono text-xs uppercase tracking-wider font-bold transition-colors ${
                  tier.featured
                    ? 'bg-[#ff5a00] hover:bg-[#ffffff] text-black'
                    : 'bg-[#202020] hover:bg-[#ff5a00] text-[#ffffff] hover:text-black border border-[#333]'
                }`}
              >
                {tier.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
