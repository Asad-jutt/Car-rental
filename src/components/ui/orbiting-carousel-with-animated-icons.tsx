"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";

// --- Data: sales team ---
export type SalesTeamMember = {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  hub: string;
  bookings: string;
  profile: string;
  avatar: string;
};

const SALES_TEAM: SalesTeamMember[] = [
  {
    id: 1,
    name: "MARCUS DELANEY",
    role: "FLEET DIRECTOR // EV & SPORTS",
    email: "m.delaney@kinetic-rental.com",
    phone: "+1 (212) 555-0147",
    hub: "NYC // LOWER MANHATTAN",
    bookings: "1,240",
    profile:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop&h=500&crop=faces",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&h=250&auto=format&fit=crop&crop=entropy",
  },
  {
    id: 2,
    name: "AMELIA HART",
    role: "SENIOR RENTAL ADVISOR // LONDON",
    email: "a.hart@kinetic-rental.com",
    phone: "+44 20 7946 0812",
    hub: "LON // KENSINGTON",
    bookings: "986",
    profile:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop&h=500&crop=faces",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=250&h=250&auto=format&fit=crop&crop=entropy",
  },
  {
    id: 3,
    name: "DAVID OKAFOR",
    role: "FLEET DIRECTOR // SUV & FAMILY",
    email: "d.okafor@kinetic-rental.com",
    phone: "+1 (415) 555-0193",
    hub: "SFO // AIRPORT T-1",
    bookings: "1,102",
    profile:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop&h=500&crop=faces",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=250&h=250&auto=format&fit=crop&crop=entropy",
  },
  {
    id: 4,
    name: "SOFIA MARQUEZ",
    role: "CORPORATE ACCOUNTS LEAD",
    email: "s.marquez@kinetic-rental.com",
    phone: "+1 (305) 555-0176",
    hub: "MIA // CONVENTION CENTER",
    bookings: "874",
    profile:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop&h=500&crop=faces",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=250&h=250&auto=format&fit=crop&crop=entropy",
  },
  {
    id: 5,
    name: "JONAS BERG",
    role: "WEEKEND & LEISURE SPECIALIST",
    email: "j.berg@kinetic-rental.com",
    phone: "+1 (312) 555-0164",
    hub: "CHI // LOOP DOWNTOWN",
    bookings: "758",
    profile:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop&h=500&crop=faces",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=250&h=250&auto=format&fit=crop&crop=entropy",
  },
  {
    id: 6,
    name: "PRIYA NAIR",
    role: "AIRPORT OPS // EXPRESS CHECK-IN",
    email: "p.nair@kinetic-rental.com",
    phone: "+1 (212) 555-0158",
    hub: "NYC // LOWER MANHATTAN",
    bookings: "693",
    profile:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop&h=500&crop=faces",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=250&h=250&auto=format&fit=crop&crop=entropy",
  },
];

const AVATAR_FALLBACK =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop";

const safeImage = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement;
  target.src = AVATAR_FALLBACK;
};

// --- Responsive detection ---
type ScreenSize = "xs" | "sm" | "md" | "lg";

const getScreenSize = (): ScreenSize => {
  if (typeof window === "undefined") return "lg";
  const width = window.innerWidth;
  if (width < 480) return "xs";
  else if (width < 640) return "sm";
  else if (width < 768) return "md";
  else return "lg";
};

const useResponsive = (): ScreenSize => {
  const [screenSize, setScreenSize] = React.useState<ScreenSize>(getScreenSize);

  React.useEffect(() => {
    const checkScreenSize = () => setScreenSize(getScreenSize());
    checkScreenSize();

    // Resize fires continuously during a drag, and every call re-runs the
    // render below. Coalesce to one update per frame and skip the setState
    // entirely when the breakpoint has not actually changed.
    let frame = 0;
    const onResize = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setScreenSize((prev) => {
          const next = getScreenSize();
          return next === prev ? prev : next;
        });
      });
    };

    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return screenSize;
};

// --- Main Component ---
export default function OrbitCarousel() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isHovering, setIsHovering] = React.useState(false);
  const screenSize = useResponsive();
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const people = SALES_TEAM;

  // Responsive sizing
  const getResponsiveValues = () => {
    switch (screenSize) {
      case "xs":
        return {
          containerRadius: 100,
          profileSize: 45,
          cardWidth: "w-36",
          avatarSize: "w-12 h-12",
          avatarMargin: "-mt-8",
          fontSize: { name: "text-sm", role: "text-xs", email: "text-xs" },
        };
      case "sm":
        return {
          containerRadius: 120,
          profileSize: 55,
          cardWidth: "w-40",
          avatarSize: "w-14 h-14",
          avatarMargin: "-mt-9",
          fontSize: { name: "text-base", role: "text-xs", email: "text-xs" },
        };
      case "md":
        return {
          containerRadius: 150,
          profileSize: 65,
          cardWidth: "w-44",
          avatarSize: "w-16 h-16",
          avatarMargin: "-mt-10",
          fontSize: { name: "text-base", role: "text-sm", email: "text-xs" },
        };
      default:
        return {
          containerRadius: 200,
          profileSize: 80,
          cardWidth: "w-52",
          avatarSize: "w-20 h-20",
          avatarMargin: "-mt-12",
          fontSize: { name: "text-lg", role: "text-sm", email: "text-xs" },
        };
    }
  };

  const { containerRadius, profileSize, cardWidth, avatarSize, avatarMargin, fontSize } =
    getResponsiveValues();
  const containerSize = containerRadius * 2 + 100;

  // Calculate position for each profile
  const getPosition = React.useCallback(
    (index: number): { x: number; y: number; angle: number } => {
      const angle = (index - activeIndex) * (360 / people.length);
      const rad = (angle * Math.PI) / 180;
      return {
        x: Math.sin(rad) * containerRadius,
        y: -Math.cos(rad) * containerRadius,
        angle,
      };
    },
    [activeIndex, containerRadius]
  );

  // Navigation
  const next = () => setActiveIndex((i) => (i + 1) % people.length);
  const prev = () => setActiveIndex((i) => (i - 1 + people.length) % people.length);

  const handleProfileClick = React.useCallback(
    (index: number) => {
      if (index === activeIndex) return;
      setActiveIndex(index);
    },
    [activeIndex]
  );

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      // Arrow keys only drive the carousel while it actually holds focus.
      // Listening on `window` meant a slider off the bottom of the page
      // captured arrow keys from the booking form and every other control.
      const root = stageRef.current;
      if (!root || !root.contains(document.activeElement)) return;
      if (event.key === "ArrowLeft") prev();
      else if (event.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-rotation. Held while the pointer is over the carousel, while it is off
  // screen, and while the tab is in the background — a timer that keeps firing
  // for a section nobody is looking at costs a re-render every five seconds.
  React.useEffect(() => {
    if (isHovering) return;

    let inView = true;
    const start = () => {
      if (inView && !document.hidden) interval = window.setInterval(next, 5000);
    };
    let interval = 0;
    const stop = () => {
      if (interval) {
        window.clearInterval(interval);
        interval = 0;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? true;
        stop();
        start();
      },
      { rootMargin: "128px" },
    );
    observer.observe(containerRef.current ?? document.body);
    const onVisibility = () => {
      stop();
      start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isHovering]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center bg-transparent p-2 sm:p-4"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        ref={stageRef}
        className="relative flex items-center justify-center overflow-visible px-2"
        style={{ width: containerSize, height: containerSize, maxWidth: "100%" }}
      >
        {/* Orbit guide ring */}
        <div
          className="pointer-events-none absolute rounded-full border border-[#1f1f1f]"
          style={{ width: containerRadius * 2, height: containerRadius * 2 }}
        />

        {/* Active Person Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={people[activeIndex].id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className={`z-10 rounded-xl border border-[#222] bg-[#0e0e0e]/40 p-2 text-center shadow-xl backdrop-blur-xl sm:p-3 md:p-4 ${cardWidth}`}
          >
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              src={people[activeIndex].profile}
              alt={people[activeIndex].name}
              loading="lazy"
              decoding="async"
              onError={safeImage}
              className={`${avatarSize} mx-auto rounded-full border-4 border-[#0e0e0e] object-cover shadow-md ${avatarMargin}`}
            />
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <h2 className={`mt-2 font-headline font-bold uppercase tracking-tight text-[#ffffff] ${fontSize.name}`}>
                {people[activeIndex].name}
              </h2>
              <div className={`mt-1 flex items-center justify-center font-mono uppercase tracking-wider text-[#ff5a00] ${fontSize.role}`}>
                <Briefcase size={12} className="mr-1 flex-none" />
                <span className="truncate">{people[activeIndex].role}</span>
              </div>
              <div className={`mt-0.5 flex items-center justify-center font-mono text-[#888] ${fontSize.email}`}>
                <Mail size={12} className="mr-1 flex-none" />
                <span className="truncate">{people[activeIndex].email}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border border-[#222] bg-[#161616] p-2 font-mono text-[9px] uppercase tracking-wider text-[#888]">
                <span className="truncate">
                  HUB: <span className="font-bold text-[#ffffff]">{people[activeIndex].hub}</span>
                </span>
                <span className="truncate">
                  BOOKINGS: <span className="font-bold text-[#ff5a00]">{people[activeIndex].bookings}</span>
                </span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="mt-2 flex items-center justify-center space-x-1 sm:mt-3 sm:space-x-2"
            >
              <button
                onClick={prev}
                aria-label="Previous team member"
                className="rounded-full border border-[#333] bg-[#161616] p-1 text-[#a0a0a0] transition-all hover:border-[#ff5a00] hover:bg-[#ff5a00] hover:text-black active:scale-90 sm:p-1.5"
              >
                <ChevronLeft size={14} strokeWidth={1.75} />
              </button>
              <a
                href={`mailto:${people[activeIndex].email}`}
                className="flex items-center gap-1.5 rounded-full bg-[#ff5a00] px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-black transition-colors hover:bg-[#ff7a33] sm:px-4 sm:py-1 sm:text-xs"
              >
                <Mail size={12} strokeWidth={2} />
                Connect
              </a>
              <button
                onClick={next}
                aria-label="Next team member"
                className="rounded-full border border-[#333] bg-[#161616] p-1 text-[#a0a0a0] transition-all hover:border-[#ff5a00] hover:bg-[#ff5a00] hover:text-black active:scale-90 sm:p-1.5"
              >
                <ChevronRight size={14} strokeWidth={1.75} />
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Orbiting Profiles with Counter-Rotation */}
        {people.map((p, i) => {
          const { x, y, angle } = getPosition(i);
          const isActive = i === activeIndex;

          return (
            <motion.div
              key={p.id}
              animate={{ x, y }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 20,
                delay: isActive ? 0 : Math.abs(i - activeIndex) * 0.05,
              }}
              style={{
                width: profileSize,
                height: profileSize,
                position: "absolute",
                top: `calc(50% - ${profileSize / 2}px)`,
                left: `calc(50% - ${profileSize / 2}px)`,
                zIndex: isActive ? 20 : 10,
              }}
            >
              {/* Counter-rotation to keep image upright */}
              <motion.div
                animate={{ rotate: -angle }}
                transition={{
                  type: "spring",
                  stiffness: 150,
                  damping: 20,
                }}
                className="h-full w-full"
              >
                <motion.img
                  src={p.avatar}
                  alt={p.name}
                  loading="lazy"
                  decoding="async"
                  onError={safeImage}
                  onClick={() => handleProfileClick(i)}
                  whileHover={{
                    scale: 1.15,
                    boxShadow: "0 10px 25px -5px rgba(255,90,0,0.35), 0 10px 10px -5px rgba(255,90,0,0.15)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className={`h-full w-full cursor-pointer rounded-full object-cover transition-all duration-300 ${
                    isActive
                      ? "border-4 border-[#ff5a00] shadow-[0_0_12px_rgba(255,90,0,0.6)]"
                      : "border-2 border-[#333] hover:border-[#ff5a00]"
                  }`}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Indicator */}
      <div className="mt-4 flex justify-center space-x-1.5 sm:mt-6 sm:space-x-2">
        {people.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setActiveIndex(index)}
            aria-label={`Show ${people[index].name}`}
            className={`h-1.5 w-1.5 rounded-full transition-colors sm:h-2 sm:w-2 ${
              index === activeIndex ? "bg-[#ff5a00] shadow-[0_0_6px_#ff5a00]" : "bg-[#333]"
            }`}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
    </div>
  );
}

