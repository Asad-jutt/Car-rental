// Built using Hyperiux Vault: https://vault.hyperiux.com
// Adapted for the KINETIC dark automotive design language.
"use client";

import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// True when the user has asked the OS to minimise animation. Safe to call
// during render - returns false on the server.
function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

// Reduced motion: a much larger perspective distance flattens the 3D card
// rotation (less depth distortion) instead of removing it outright.
const REDUCED_PERSPECTIVE = "4800px";

const MOBILE_BREAKPOINT = 640;
const TABLET_BREAKPOINT = 1025;

const MOBILE_STEP = 2;
const TABLET_STEP = 6;
const DESKTOP_STEP = 10;

const MOBILE_ROTATE_IN = -60;
const TABLET_ROTATE_IN = -80;
const DESKTOP_ROTATE_IN = -100;

const MOBILE_ROTATE_OUT = 50;
const TABLET_ROTATE_OUT = 65;
const DESKTOP_ROTATE_OUT = 80;

const ROTATE_X_NEGATIVE = 5;
const ROTATE_X_POSITIVE = -5;

// Reduced motion: cut the card rotation down a lot (not just the perspective
// flattening above) - "reduce a lot", so a stronger cut than the 25% factor
// used elsewhere.
const ROTATION_REDUCTION_FACTOR = 0.15;

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface CardsRotateSliderImage {
  src?: string;
  text?: string;
  /** Monospace kicker shown above the card title, e.g. `[GT-COUPE // EV]`. */
  sub?: string;
  /** Telemetry line below the title, e.g. `450HP · 4.1S · RWD`. */
  spec?: string;
  /** Daily rate shown in the accent color, e.g. `$149`. */
  price?: string;
  /** Vehicle id passed through to the `data-vehicle` booking trigger. */
  vehicleId?: string;
}

const DEFAULT_IMAGES: CardsRotateSliderImage[] = [
  { src: "https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?q=80&w=1200&auto=format&fit=crop", sub: "[REAR // ACTION]", text: "Initialize Motion Layer", price: "$199" },
  { src: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop", sub: "[CORNER // ENTRY]", text: "Inject Depth Matrix", price: "$199" },
  { src: "https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1200&auto=format&fit=crop", sub: "[PROFILE // MID-TURN]", text: "Sync Scroll Engine", price: "$199" },
  { src: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=1200&auto=format&fit=crop", sub: "[STRAIGHTAWAY // SPEED]", text: "Calibrate Perspective", price: "$199" },
  { src: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop", sub: "[LOW ANGLE // DYNAMIC]", text: "Activate 3D Pipeline", price: "$199" },
];

export interface CardsRotateSliderProps {
  /** Cards shown in the horizontal track. Defaults to a 5-image sample set. */
  images?: CardsRotateSliderImage[];
  /** Multiplier on the built-in per-breakpoint rotateY entrance/exit strength as cards scroll by. */
  rotationAmount?: number;
  /** Multiplier on the built-in per-breakpoint vertical offset each card travels while scrolling past. */
  verticalDrift?: number;
  /**
   * Seconds the horizontal track takes to catch up to the scroll position
   * (GSAP `scrub`). `0` tracks the scrollbar exactly 1:1; higher values add a
   * lerp catch-up so the wheel glides instead of snapping. Ignored under
   * `prefers-reduced-motion`, which always tracks 1:1.
   */
  scrollSmoothing?: number;
  /** 3D perspective distance, in pixels, applied to the sticky track — lower values look deeper/more distorted. */
  perspective?: number;
  /** Shows the text caption overlay on each card. */
  showCaptions?: boolean;
  /** Color of the card caption text. */
  textColor?: string;
  /** Show the "scroll to rotate" hint pill at the bottom of the track. */
  showScrollHint?: boolean;
  /** Panel background color behind the sticky track. */
  background?: string;
}

/**
 * A horizontally scroll-pinned track of cards that rotate in from one side,
 * settle flat, then rotate out the other — driven by GSAP ScrollTrigger with
 * a nested per-card timeline. Falls back to a flattened, mostly de-rotated
 * pass under `prefers-reduced-motion`.
 */
export default function CardsRotateSlider({
  images = DEFAULT_IMAGES,
  rotationAmount = 1,
  verticalDrift = 1,
  scrollSmoothing = 0.7,
  perspective = 1200,
  showCaptions = true,
  textColor = "#ffffff",
  showScrollHint = true,
  background = "#0e0e0e",
}: CardsRotateSliderProps) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const wrappersRef = useRef<(HTMLDivElement | null)[]>([]);
  const reducedMotion = prefersReducedMotion();

  useEffect(() => {
    const outer = outerRef.current;
    const track = trackRef.current;

    if (!outer || !track) return;

    const onResize = () => {
      const travel = track.scrollWidth - window.innerWidth;
      outer.style.height = `${travel + window.innerHeight}px`;
    };

    onResize();

    const resizeObserver = new ResizeObserver(onResize);

    resizeObserver.observe(track);
    window.addEventListener("resize", onResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [images]);

  useIsomorphicLayoutEffect(() => {
    const outer = outerRef.current;
    const track = trackRef.current;

    if (!outer || !track) return;

    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const isTablet = window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT;

    // Size the pin container synchronously with trigger setup so ScrollTrigger
    // never measures a section that reports zero height at refresh time.
    const travel = track.scrollWidth - window.innerWidth;
    outer.style.height = `${travel + window.innerHeight}px`;

    const context = gsap.context(() => {
      const horizontalTween = gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: outer,
          start: "top top",
          end: () => `+=${track.scrollWidth - window.innerWidth}`,
          // A numeric scrub lerps the track toward the scroll position, so the
          // cards glide instead of snapping 1:1 to the scrollbar. The per-card
          // triggers below stay on `scrub: true` because they read their
          // position from this tween via `containerAnimation` — smoothing them
          // too would let the cards detach from the track.
          // Reduced motion: `true` (1:1), no catch-up lag at all.
          scrub: reducedMotion ? true : scrollSmoothing,
          invalidateOnRefresh: true,
        },
      });

      cardsRef.current.forEach((card, index) => {
        const wrapper = wrappersRef.current[index];

        if (!card || !wrapper) return;

        const total = images.length;
        const mid = Math.floor(total / 2);

        const step = (isMobile ? MOBILE_STEP : isTablet ? TABLET_STEP : DESKTOP_STEP) * verticalDrift;

        let offset: number;

        if (index < mid) {
          offset = -((mid - index) * step);
        } else {
          offset = (index - mid + 1) * step;
        }

        const rotationScale = reducedMotion ? ROTATION_REDUCTION_FACTOR : 1;

        const rotateXValue = (offset < 0 ? ROTATE_X_NEGATIVE : ROTATE_X_POSITIVE) * rotationScale;

        const rotateInValue =
          (isMobile ? MOBILE_ROTATE_IN : isTablet ? TABLET_ROTATE_IN : DESKTOP_ROTATE_IN) * rotationScale * rotationAmount;

        const rotateOutValue =
          (isMobile ? MOBILE_ROTATE_OUT : isTablet ? TABLET_ROTATE_OUT : DESKTOP_ROTATE_OUT) * rotationScale * rotationAmount;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapper,
            containerAnimation: horizontalTween,
            start: "left 100%",
            end: "right 0%",
            scrub: true,
          },
        });

        tl.fromTo(
          card,
          {
            rotateY: rotateInValue,
            rotateX: rotateXValue,
            opacity: 0.8,
            y: `${offset}vh`,
          },
          {
            rotateY: 0,
            rotateX: 0,
            opacity: 1,
            y: 0,
            ease: "none",
          },
        ).to(card, {
          rotateY: rotateOutValue,
          opacity: 0.9,
          y: `${-offset}vh`,
          ease: "none",
        });
      });

      ScrollTrigger.refresh();
    });

    return () => context.revert();
  }, [images, rotationAmount, verticalDrift, scrollSmoothing]);

  // overflowX set inline, not via a Tailwind class: "clip" (not "hidden") is
  // required so this doesn't hijack the sticky track's containing block
  // below, and an inline style guarantees the rule applies even in a host
  // whose Tailwind build doesn't ship the `overflow-x-clip` utility.
  return (
    <div
      ref={outerRef}
      className="relative bg-[#0e0e0e]"
      style={{ overflowX: "clip", backgroundColor: background }}
    >
      <div
        className="sticky top-0 flex h-screen items-center overflow-hidden"
        style={{ perspective: reducedMotion ? REDUCED_PERSPECTIVE : `${perspective}px` }}
      >
        {/* Ambient orange glow behind the track */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[60vh] w-[65vw] rounded-full bg-[#ff5a00]/[0.07] blur-[120px]" />
        </div>

        <div
          ref={trackRef}
          className="flex h-full items-center will-change-transform gap-[5vw] max-[1025px]:gap-[8vw] max-md:gap-[12vw] pl-[32vw] pr-[26vw] max-[1025px]:pl-[22vw] max-[1025px]:pr-[22vw] max-md:pl-[12vw] max-md:pr-[12.5vw]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {images.map((img, index) => (
            <div
              key={index}
              ref={(element) => {
                wrappersRef.current[index] = element;
              }}
              className="relative flex h-[50vh] w-[38vw] shrink-0 items-center justify-center max-[1025px]:h-[45vh] max-[1025px]:w-[55vw] max-md:h-[40vh] max-md:w-[75vw] max-[1025px]:[&>div]:h-[45vh] max-[1025px]:[&>div]:w-[50vw] max-md:[&>div]:h-[40vh] max-md:[&>div]:w-[75vw]"
              style={{ transformStyle: "preserve-3d" }}
            >
              <RotationCard
                ref={(element) => {
                  cardsRef.current[index] = element;
                }}
                src={img.src}
                text={img.text}
                sub={img.sub}
                spec={img.spec}
                price={img.price}
                vehicleId={img.vehicleId}
                index={index}
                total={images.length}
                showCaptions={showCaptions}
                textColor={textColor}
              />
            </div>
          ))}
        </div>

        {showScrollHint && (
          <div className="pointer-events-none absolute inset-x-0 bottom-7 z-20 flex justify-center">
            <p className="border border-[#1f1f1f] bg-[#0e0e0e]/70 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[#a0a0a0] backdrop-blur-sm">
              SCROLL TO ROTATE THE FLEET — SETTLES FLAT, THEN TILTS OUT
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface RotationCardProps {
  src?: string;
  index: number;
  total: number;
  text?: string;
  sub?: string;
  spec?: string;
  price?: string;
  vehicleId?: string;
  showCaptions: boolean;
  textColor: string;
}

const RotationCard = forwardRef<HTMLDivElement, RotationCardProps>(
  ({ src, index, total, text, sub, spec, price, vehicleId, showCaptions, textColor }, ref) => {
    const shadow = "0 0.15vw 0.35vw rgba(0,0,0,0.45), 0 0.45vw 1.2vw rgba(0,0,0,0.5)";
    return (
      <div
        ref={ref}
        className="absolute h-[50vh] w-[38vw] origin-right overflow-hidden max-md:h-[40vh] max-md:w-[75vw]"
        style={{
          transformStyle: "preserve-3d",
          zIndex: total - index,
        }}
      >
        {/* Frame */}
        <div className="absolute inset-0 border border-[#262626] bg-[#161616]" />
        <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
          <img src={src} alt={text || "slide"} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-[1.04]" />
          {/* Legibility gradient */}
          <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[#0e0e0e]/85 via-[#0e0e0e]/20 to-transparent" />
          {showCaptions && text && (
            <div className="pointer-events-none absolute inset-x-0 bottom-[3vh] z-10 flex max-md:bottom-[2.2vh] flex-col items-center gap-[0.9vh] px-[2vw] text-center">
              {sub && (
                <span className="font-mono text-[0.68vw] uppercase tracking-[0.32em] max-md:text-[1.5vw]" style={{ color: textColor, opacity: 0.62, textShadow: shadow }}>
                  {sub}
                </span>
              )}
              <span
                className="font-headline text-[1.85vw] font-bold uppercase leading-none tracking-tight max-md:text-[5vw]"
                style={{ color: textColor, textShadow: shadow }}
              >
                {text}
              </span>
              {spec && (
                <span className="font-mono text-[0.72vw] uppercase tracking-widest max-md:text-[1.6vw]" style={{ color: textColor, opacity: 0.82, textShadow: shadow }}>
                  {spec}
                </span>
              )}
              <div className="mt-[0.6vh] flex flex-wrap items-center justify-center gap-[1vw] max-md:gap-3">
                {price && (
                  <span className="font-mono text-[1.45vw] font-extrabold tabular-nums leading-none text-[#ff5a00] max-md:text-[3.6vw]" style={{ textShadow: "0 0.15vw 0.3vw rgba(0,0,0,0.7)" }}>
                    {price}
                    <span className="ml-1 text-[0.55em] font-bold opacity-80">/ DAY</span>
                  </span>
                )}
                <a
                  href={
                    vehicleId
                      ? `/booking?vehicle=${encodeURIComponent(vehicleId)}`
                      : "/booking"
                  }
                  data-vehicle={vehicleId}
                  className="pointer-events-auto inline-flex cursor-pointer items-center gap-[0.55vw] border border-[#ff5a00] bg-[#ff5a00] px-[1vw] py-[0.7vh] font-mono text-[0.7vw] font-extrabold uppercase tracking-widest text-black transition-colors hover:border-[#ffffff] hover:bg-[#ffffff] max-md:text-[1.8vw] max-md:px-3 max-md:py-1"
                >
                  BOOK IMMEDIATELY <span aria-hidden>→</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

RotationCard.displayName = "RotationCard";

export { RotationCard };