import React from 'react';
import { PROTOCOL_STEPS } from '../data/fleetData';

export const WhiteGloveProtocol: React.FC = () => {
  return (
    <section className="w-full bg-[#0e0e0e] border-b border-[#1f1f1f]" id="protocol">
      <div className="px-4 sm:px-8 py-10 sm:py-16">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-[#1f1f1f]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-[#ff5a00] inline-block shadow-[0_0_6px_#ff5a00]"></span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#ff5a00]">
                [MODULE_02 // CONCIERGE PIPELINE]
              </span>
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-[#ffffff] m-0">
              WHITE-GLOVE DEPLOYMENT PROTOCOL
            </h2>
          </div>
          <div className="text-left md:text-right mt-3 md:mt-0 font-mono text-[10px] sm:text-xs text-[#888] uppercase tracking-wider">
            DISPATCH LATENCY GUARANTEE: &lt; 90 MINUTES
            <br />
            ENCRYPTION: 512-BIT QUANTUM PROOF
          </div>
        </div>

        {/* 4-Step Technical Linear Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-0 border border-[#1f1f1f] bg-[#1f1f1f]">
          {PROTOCOL_STEPS.map((step) => (
            <div
              key={step.stepNumber}
              className="p-6 bg-[#0e0e0e] flex flex-col justify-between group hover:bg-[#141414] transition-colors relative"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#1f1f1f] mb-4">
                  <span className="font-mono text-xs sm:text-sm text-[#ff5a00] font-bold">
                    {step.stepNumber} // STEP
                  </span>
                  <span className="font-mono text-[10px] text-[#888] uppercase">
                    {step.code}
                  </span>
                </div>
                <h3 className="font-headline text-base sm:text-lg font-bold uppercase tracking-tight text-[#ffffff] mb-2">
                  {step.title}
                </h3>
                <p className="font-editorial text-xs sm:text-sm text-[#b0b0b0] leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-8 pt-3 border-t border-[#1f1f1f] flex items-center justify-between text-[11px] font-mono text-[#888]">
                <span>{step.paramLabel}</span>
                <span className="text-[#ff5a00] font-mono font-bold">
                  {step.stepFraction}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
