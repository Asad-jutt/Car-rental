// Adapted from the Ruixen UI chat FAQ accordion for the KINETIC dark
// automotive design language: chat-style bubbles, near-black surfaces, the
// #ff5a00 telemetry accent, Unbounded headlines + Montserrat monospace.
// Section shell and header follow src/components/ui/testimonials-with-marquee.tsx.
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import * as Accordion from "@radix-ui/react-accordion";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  id: number | string;
  question: string;
  answer: string;
  /** Monospace kicker shown left of the question bubble, e.g. `[FAQ_01]`. */
  code?: string;
  icon?: string;
  iconPosition?: "left" | "right";
}

export interface FaqAccordionProps {
  data: FaqItem[];
  className?: string;
  /** Telemetry line above the thread, e.g. a support-desk status readout. */
  timestamp?: string;
  questionClassName?: string;
  answerClassName?: string;
  /** Section eyebrow above the heading, e.g. `[MODULE_06 // GOOD TO KNOW]`. */
  eyebrow?: string;
  /** Right-hand metadata line in the section header. */
  meta?: string;
}

/**
 * Support-desk style FAQ thread: each question is a left-aligned bubble that
 * expands into a right-aligned orange answer bubble. Single-open, so opening
 * one question closes the other, and the answer height is animated by
 * framer-motion so the thread slides instead of snapping.
 */
export function FaqAccordion({
  data,
  className,
  timestamp = "Every day, 9:01 AM",
  questionClassName,
  answerClassName,
  eyebrow = "[MODULE_06 // GOOD TO KNOW]",
  meta = "DRIVER REQUIREMENTS // INSURANCE // CANCELLATION",
}: FaqAccordionProps) {
  const [openItem, setOpenItem] = React.useState<string | null>(null);

  return (
    <section
      id="security"
      className={cn(
        "relative w-full overflow-hidden border-b border-[#1f1f1f] bg-[#0e0e0e] text-foreground scroll-mt-12",
      )}
    >
      {/* Ambient Backlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(800px circle at 85% 0%, rgba(255,90,0,0.16), transparent 60%), radial-gradient(600px circle at 8% 100%, rgba(255,90,0,0.10), transparent 62%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-5 sm:py-14 lg:px-6 lg:py-16">
        {/* Industrial Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[#1f1f1f] pb-4 sm:mb-8 md:flex-row md:items-end">
          <div className="max-w-full">
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-block h-2 w-2 bg-[#ff5a00] shadow-[0_0_6px_#ff5a00]" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#ff5a00]">
                {eyebrow}
              </span>
            </div>
            <h2 className="m-0 font-headline text-xl font-extrabold uppercase tracking-tight text-white sm:text-2xl lg:text-3xl">
              FAQS &amp; RENTAL POLICIES
            </h2>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#888] sm:text-xs md:text-right">
            {meta}
          </div>
        </div>

        <div className={cn("mt-6 sm:mt-8", className)}>
          {timestamp && (
            <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#888] sm:text-xs">
              <span className="inline-block h-1.5 w-1.5 bg-[#ff5a00] shadow-[0_0_6px_#ff5a00]" />
              {timestamp}
            </div>
          )}

          <Accordion.Root
            type="single"
            collapsible
            value={openItem || ""}
            onValueChange={(value) => setOpenItem(value)}
          >
            {data.map((item) => {
              const key = item.id.toString();
              const isOpen = openItem === key;

              return (
                <Accordion.Item value={key} key={key} className="mb-2">
                  <Accordion.Header>
                    <Accordion.Trigger className="group flex w-full items-center justify-start gap-x-3 text-left sm:gap-x-4">
                      {item.code && (
                        <span className="shrink-0 font-mono text-[10px] font-bold text-[#ff5a00] sm:text-xs">
                          {item.code}
                        </span>
                      )}

                      <div
                        className={cn(
                          "relative flex items-center space-x-2 rounded-xl p-2 transition-colors",
                          isOpen
                            ? "bg-[#ff5a00]/10 text-[#ff5a00]"
                            : "bg-[#161616] text-white hover:bg-[#ff5a00]/10",
                          questionClassName,
                        )}
                      >
                        {item.icon && (
                          <span
                            aria-hidden
                            className={cn(
                              "absolute bottom-6",
                              item.iconPosition === "right" ? "right-0" : "left-0",
                            )}
                            style={{
                              transform:
                                item.iconPosition === "right"
                                  ? "rotate(7deg)"
                                  : "rotate(-4deg)",
                            }}
                          >
                            {item.icon}
                          </span>
                        )}
                        <span className="font-headline text-xs font-bold uppercase tracking-wide sm:text-sm md:text-base">
                          {item.question}
                        </span>
                      </div>

                      <span
                        aria-hidden
                        className={cn(
                          "ml-auto flex h-6 w-6 shrink-0 items-center justify-center border transition-colors",
                          isOpen
                            ? "border-[#ff5a00] bg-[#ff5a00] text-black"
                            : "border-[#1f1f1f] text-[#ff5a00] group-hover:border-[#ff5a00]",
                        )}
                      >
                        {isOpen ? (
                          <Minus className="h-4 w-4" strokeWidth={2.5} />
                        ) : (
                          <Plus className="h-4 w-4" strokeWidth={2.5} />
                        )}
                      </span>
                    </Accordion.Trigger>
                  </Accordion.Header>

                  <Accordion.Content asChild forceMount>
                    <motion.div
                      initial="collapsed"
                      animate={isOpen ? "open" : "collapsed"}
                      variants={{
                        open: { opacity: 1, height: "auto" },
                        collapsed: { opacity: 0, height: 0 },
                      }}
                      transition={{ duration: 0.35, ease: [0.25, 0.8, 0.35, 1] }}
                      className="overflow-hidden"
                      // `forceMount` keeps the panel mounted so the height can
                      // be animated, but it also keeps a collapsed answer in
                      // the accessibility tree and reachable by keyboard.
                      // `inert` takes it out of both while staying rendered.
                      inert={!isOpen}
                    >
                      <div className="flex justify-end pb-2 pl-7 pt-2 md:pl-16">
                        <div
                          className={cn(
                            "relative max-w-lg rounded-2xl bg-[#ff5a00] px-4 py-2.5 text-black sm:px-5",
                            answerClassName,
                          )}
                        >
                          <p className="font-mono text-[11px] font-semibold leading-relaxed sm:text-xs md:text-sm">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </Accordion.Content>
                </Accordion.Item>
              );
            })}
          </Accordion.Root>
        </div>
      </div>
    </section>
  );
}

export default FaqAccordion;
