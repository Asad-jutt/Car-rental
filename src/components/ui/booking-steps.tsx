"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BookingStepSource {
  type: string;
  srcset: string;
}

export interface BookingStepMedia {
  src: string;
  width: number;
  height: number;
  sources: BookingStepSource[];
}

interface BookingStepsProps {
  media?: BookingStepMedia[];
}

const BOOKING_STEPS = [
  {
    id: "01",
    code: "[STEP: BROWSE]",
    title: "CHOOSE YOUR VEHICLE",
    description:
      "Explore our fleet of EVs, sports coupes, and family SUVs. Filter by price, fuel type, seating, and availability across locations.",
    paramLabel: "FLEET: 12+ VEHICLES",
    fraction: "01/04",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "02",
    code: "[STEP: BOOK]",
    title: "PICK DATES & LOCATION",
    description:
      "Select your pickup and drop-off branch, travel dates, and optional add-ons like navigation, child seats, or additional drivers in minutes.",
    paramLabel: "BOOKING: ONLINE",
    fraction: "02/04",
    image:
      "https://images.pexels.com/photos/1667071/pexels-photo-1667071.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: "03",
    code: "[STEP: DOCS]",
    title: "DRIVER & LICENSE CHECK",
    description:
      "Bring a valid driver\u2019s license and a payment card. Instant verification at the counter keeps the whole process under ten minutes.",
    paramLabel: "CHECK-IN: < 10 MIN",
    fraction: "03/04",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "04",
    code: "[STEP: DRIVE]",
    title: "START YOUR TRIP",
    description:
      "Grab your keys, do a quick walkaround, and head out. Included insurance, 24/7 roadside assistance, and easy airport returns.",
    paramLabel: "SUPPORT: ROADSIDE 24/7",
    fraction: "04/04",
    image:
      "https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=1200&auto=format&fit=crop",
  },
];

const AUTO_PLAY_DURATION = 5000;

export default function BookingSteps({ media }: BookingStepsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const count = BOOKING_STEPS.length;

  const handleNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % count);
  }, [count]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  const handleTabClick = (index: number) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    setIsPaused(false);
  };

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(handleNext, AUTO_PLAY_DURATION);
    return () => clearInterval(interval);
  }, [activeIndex, isPaused, handleNext]);

  const variants = {
    enter: (dir: number) => ({
      y: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      y: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      y: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const step = BOOKING_STEPS[activeIndex];
  const stepMedia = media?.[activeIndex] ?? null;

  return (
    <section
      id="protocol"
      className="w-full scroll-mt-12 border-b border-[#1f1f1f] bg-[#0e0e0e]"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-5 sm:py-14 lg:px-6 lg:py-16">
        {/* Section Header */}
        <div className="mb-8 flex flex-col justify-between border-b border-[#1f1f1f] pb-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-block h-2 w-2 bg-[#ff5a00] shadow-[0_0_6px_#ff5a00]" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#ff5a00]">
                [MODULE_02 // BOOKING GUIDE]
              </span>
            </div>
            <h2 className="m-0 font-headline text-xl font-extrabold uppercase tracking-tight text-[#ffffff] sm:text-2xl lg:text-3xl">
              BOOKING IS SIMPLE
            </h2>
          </div>
          <div className="mt-4 font-mono text-[10px] uppercase tracking-wider text-[#888] md:mt-0 md:text-right sm:text-xs">
            BOOK ONLINE IN UNDER 10 MINUTES
            <br />
            NO HIDDEN FEES / FREE CANCELLATION
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Step Tabs */}
          <div className="order-2 pt-2 lg:order-1 lg:col-span-5">
            <div className="flex flex-col space-y-0">
              {BOOKING_STEPS.map((s, index) => {
                const isActive = activeIndex === index;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleTabClick(index)}
                    className={cn(
                      "group relative flex w-full cursor-pointer items-stretch gap-4 text-left transition-colors duration-500 md:gap-5 py-6 md:py-7 border-t border-[#1f1f1f] first:border-t-0",
                      isActive
                        ? "text-[#ffffff]"
                        : "text-[#666] hover:text-[#b0b0b0]"
                    )}
                  >
                    {/* Auto-play progress rail */}
                    <div className="relative w-[2px] flex-none bg-[#1f1f1f]">
                      {isActive && (
                        <motion.div
                          key={`progress-${index}-${isPaused}`}
                          className="absolute left-0 top-0 w-full origin-top bg-[#ff5a00] shadow-[0_0_8px_#ff5a00]"
                          initial={{ height: "0%" }}
                          animate={
                            isPaused ? { height: "0%" } : { height: "100%" }
                          }
                          transition={{
                            duration: AUTO_PLAY_DURATION / 1000,
                            ease: "linear",
                          }}
                        />
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-[10px] font-bold tabular-nums text-[#ff5a00] md:text-[11px]">
                          {s.id} // STEP
                        </span>
                        <span
                          className={cn(
                            "font-mono text-[9px] uppercase tracking-wider transition-colors duration-500 md:text-[10px]",
                            isActive ? "text-[#b0b0b0]" : "text-[#555]"
                          )}
                        >
                          {s.code}
                        </span>
                      </div>

                      <span
                        className={cn(
                          "font-headline text-base font-bold uppercase tracking-tight transition-colors duration-500 md:text-xl",
                          isActive ? "text-[#ffffff]" : "text-[#8a8a8a]"
                        )}
                      >
                        {s.title}
                      </span>

                      <AnimatePresence mode="wait" initial={false}>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{
                              duration: 0.3,
                              ease: [0.23, 1, 0.32, 1],
                            }}
                            className="overflow-hidden"
                          >
                            <p className="pb-3 pt-0.5 font-editorial text-[13px] leading-relaxed text-[#b0b0b0]">
                              {s.description}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="mt-1 flex items-center justify-between border-t border-[#1f1f1f] pt-3 font-mono text-[10px] text-[#888]">
                        <span>{s.paramLabel}</span>
                        <span className="font-bold tabular-nums text-[#ff5a00]">
                          {s.fraction}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Panel */}
          <div className="order-1 flex flex-col justify-center lg:order-2 lg:col-span-7">
            <div
              className="relative"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Ambient glow */}
              <div className="pointer-events-none absolute -inset-5 -z-10 rounded-[2.5rem] bg-[#ff5a00]/10 blur-3xl" />

              <div className="relative aspect-4/5 overflow-hidden rounded-2xl border border-[#262626] bg-[#141414] md:aspect-4/3 lg:aspect-16/11">
                <AnimatePresence
                  initial={false}
                  custom={direction}
                  mode="popLayout"
                >
                  <motion.div
                    key={activeIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      y: { type: "spring", stiffness: 260, damping: 32 },
                      opacity: { duration: 0.4 },
                    }}
                    className="absolute inset-0 h-full w-full cursor-pointer"
                    onClick={handleNext}
                  >
                    {stepMedia ? (
                      <picture>
                        {stepMedia.sources.map((source) => (
                          <source
                            key={source.type}
                            type={source.type}
                            srcSet={source.srcset}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 640px"
                          />
                        ))}
                        <img
                          src={stepMedia.src}
                          alt={step.title}
                          width={stepMedia.width}
                          height={stepMedia.height}
                          decoding="async"
                          loading="lazy"
                          className="m-0! block h-full w-full object-cover p-0! transition-transform duration-700 hover:scale-105"
                        />
                      </picture>
                    ) : (
                      <img
                        src={step.image}
                        alt={step.title}
                        decoding="async"
                        loading="lazy"
                        className="m-0! block h-full w-full object-cover p-0! transition-transform duration-700 hover:scale-105"
                      />
                    )}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0e0e0e]/90 via-[#0e0e0e]/25 to-transparent" />
                    <div className="absolute bottom-5 left-5 right-28 flex flex-col gap-0.5">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-[#ff5a00]">
                        {step.code}
                      </span>
                      <span className="font-headline text-sm font-bold uppercase tracking-tight text-[#ffffff] md:text-lg">
                        {step.title}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Step counter chip */}
                <div className="absolute right-4 top-4 z-20 bg-[#ff5a00] px-2 py-1 font-mono text-[10px] font-bold tabular-nums text-black">
                  {step.id} / 04
                </div>

                {/* Controls */}
                <div className="absolute bottom-4 right-4 z-30 flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="flex h-10 w-10 items-center justify-center border border-[#1f1f1f] bg-[#0e0e0e]/80 text-[#a0a0a0] backdrop-blur-md transition-all hover:border-[#ff5a00] hover:bg-[#ff5a00] hover:text-black active:scale-90"
                    aria-label="Previous booking step"
                  >
                    <ArrowLeft size={16} strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="flex h-10 w-10 items-center justify-center border border-[#1f1f1f] bg-[#0e0e0e]/80 text-[#a0a0a0] backdrop-blur-md transition-all hover:border-[#ff5a00] hover:bg-[#ff5a00] hover:text-black active:scale-90"
                    aria-label="Next booking step"
                  >
                    <ArrowRight size={16} strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}