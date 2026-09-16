import React, { useState } from 'react';
import { FAQS } from '../data/fleetData';

export const SecurityEnclave: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<string | null>('faq-1');

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <section className="w-full bg-[#0e0e0e] border-b border-[#1f1f1f]" id="security">
      <div className="px-4 sm:px-8 py-10 sm:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-[#1f1f1f]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-[#ff5a00] inline-block shadow-[0_0_6px_#ff5a00]"></span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#ff5a00]">
                [MODULE_05 // PROTOCOL COMPLIANCE]
              </span>
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-[#ffffff] m-0">
              SECURITY ENCLAVE &amp; FAQ DISPATCH
            </h2>
          </div>
          <div className="font-mono text-[10px] sm:text-xs text-[#888] uppercase tracking-wider mt-3 md:mt-0">
            LEGAL FRAMEWORK: MARITIME &amp; AVIATION INTERFACE READY
          </div>
        </div>

        {/* Monospace Technical Accordions */}
        <div className="border border-[#1f1f1f] divide-y divide-[#1f1f1f]">
          {FAQS.map((faq) => {
            const isOpen = openFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="group bg-[#0e0e0e] hover:bg-[#121212] transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-4 sm:p-6 flex items-center justify-between text-left cursor-pointer list-none select-none"
                >
                  <div className="flex items-center gap-3 sm:gap-4 pr-4">
                    <span className="font-mono text-xs sm:text-sm text-[#ff5a00] font-bold shrink-0">
                      {faq.code}
                    </span>
                    <span className="font-headline text-xs sm:text-sm md:text-base font-bold uppercase tracking-wide text-[#ffffff]">
                      {faq.question}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-sm sm:text-base text-[#ff5a00] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-45' : 'rotate-0'
                    }`}
                  >
                    ✛
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-6 pb-6 pt-0 font-editorial text-xs sm:text-sm text-[#b0b0b0] border-t border-[#1f1f1f]/50">
                    <p className="pt-3 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
