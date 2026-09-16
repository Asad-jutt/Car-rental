import React from 'react';
import { DRIVER_LOGS } from '../data/fleetData';

export const DriverLogs: React.FC = () => {
  return (
    <section className="w-full bg-[#0e0e0e] border-b border-[#1f1f1f]" id="case-studies">
      <div className="px-4 sm:px-8 py-10 sm:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-[#1f1f1f]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-[#ff5a00] inline-block shadow-[0_0_6px_#ff5a00]"></span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#ff5a00]">
                [MODULE_04 // VERIFIED DISPATCH TELEMETRY]
              </span>
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-[#ffffff] m-0">
              DRIVER VERIFICATION &amp; LOGS
            </h2>
          </div>
          <div className="text-left md:text-right font-mono text-[10px] sm:text-xs text-[#888] uppercase tracking-wider mt-3 md:mt-0">
            BLOCKCHAIN TIMESTAMP RECORD // ALL DEPLOYMENTS LOGGED
          </div>
        </div>

        {/* Editorial High-Contrast Testimonial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-[#1f1f1f] divide-y lg:divide-y-0 lg:divide-x divide-[#1f1f1f]">
          {DRIVER_LOGS.map((log) => (
            <div
              key={log.id}
              className="p-6 sm:p-8 bg-[#0e0e0e] flex flex-col justify-between hover:bg-[#121212] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#1f1f1f] mb-4">
                  <span className="font-mono text-[10px] sm:text-[11px] text-[#ff5a00] font-bold">
                    {log.dispatchHash}
                  </span>
                  <span className="font-mono text-[10px] text-[#888]">
                    {log.node}
                  </span>
                </div>
                <blockquote className="font-editorial text-sm sm:text-base text-[#e2e2e2] leading-relaxed mb-6 italic">
                  {log.quote}
                </blockquote>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-[#1f1f1f]">
                <div className="font-headline text-sm font-bold uppercase text-[#ffffff]">
                  {log.author}
                </div>
                <div className="font-mono text-[10px] text-[#888] uppercase tracking-wider">
                  {log.title}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 bg-[#161616] p-2 border border-[#222] font-mono text-[10px]">
                  <span className="text-[#888]">
                    {log.stat1Label}{' '}
                    <span className="text-[#ff5a00] font-bold">
                      {log.stat1Val}
                    </span>
                  </span>
                  <span className="text-[#888]">
                    {log.stat2Label}{' '}
                    <span className="text-[#ffffff] font-bold">
                      {log.stat2Val}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
