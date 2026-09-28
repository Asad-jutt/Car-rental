"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { CarParticlesHandle, CarParticlesReadyInfo } from "@/lib/car-particles";
import { createCarParticles } from "@/lib/car-particles";

export interface CarParticleCanvasProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  src: string;
  color?: string;
  particleSize?: number;
  count?: number;
  threshold?: number;
  radius?: number;
  strength?: number;
  spring?: number;
  damping?: number;
  depth?: number;
  idle?: number;
  opacity?: number;
  padding?: number;
  maxDpr?: number;
  interactive?: boolean;
  fallback?: React.ReactNode;
  onReady?: (info: CarParticlesReadyInfo) => void;
  onError?: (error: unknown) => void;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

/**
 * Picks a particle budget from what the device can actually do, instead of a
 * fixed 16k/32k split. The old ceiling was set for a desktop GPU and falls
 * apart on a phone or a machine falling back to software WebGL, where the
 * per-frame integration loop is pure overhead. The field is sampled, not
 * simulated, so a smaller budget costs sprite density and nothing else.
 */
function resolveParticleCount(explicit?: number): number {
  if (explicit) return explicit;
  if (typeof window === "undefined") return 8000;

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
  const short = Math.min(window.innerWidth, window.innerHeight);

  let budget = 16000;

  if (cores <= 4) budget = 8000;
  else if (cores <= 8) budget = 11000;
  if (memory <= 4) budget = Math.min(budget, 6000);

  if (coarse || short < 768) {
    budget = Math.min(budget, 5000);
  } else if (short < 1024) {
    budget = Math.min(budget, 9000);
  }

  return budget;
}

/** Frame-time budget before we start thinning the particle field. */
const SLOW_FRAME_MS = 26;
const MIN_DRAWN = 0.25;

/** Pointer position is cached because reading it back on every `pointermove`
 *  forces a synchronous layout, and the hero sits under a fixed header. */
const RECT_REFRESH_MS = 250;

export function CarParticleCanvas({
  src,
  color,
  particleSize = 1.5,
  count,
  threshold,
  radius,
  strength,
  spring,
  damping,
  depth,
  idle,
  opacity,
  padding,
  maxDpr,
  interactive = true,
  fallback,
  onReady,
  onError,
  className,
  style,
  ...props
}: CarParticleCanvasProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = React.useState(false);

  const onReadyRef = React.useRef(onReady);
  const onErrorRef = React.useRef(onError);
  React.useEffect(() => {
    onReadyRef.current = onReady;
    onErrorRef.current = onError;
  });

  React.useEffect(() => {
    setFailed(false);

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let cancelled = false;
    let frame = 0;
    let handle: CarParticlesHandle | null = null;
    let last = performance.now();
    const reduced = prefersReducedMotion();
    let inView = true;
    let pageHidden = document.hidden;
    // Rolling window used to notice a device that cannot hold frame rate.
    let slowFrames = 0;
    let fastFrames = 0;
    let quality = 1;
    let rect = canvas.getBoundingClientRect();
    let rectReadAt = performance.now();

    const shouldRun = () => inView && !pageHidden;

    const resize = () => {
      if (!handle) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width > 0 && height > 0) handle.resize(width, height);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!handle) return;
      const now = performance.now();
      if (now - rectReadAt > RECT_REFRESH_MS) {
        rect = canvas.getBoundingClientRect();
        rectReadAt = now;
      }
      if (rect.width === 0 || rect.height === 0) return;
      handle.setPointer(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1),
      );
    };

    const onPointerLeave = () => {
      handle?.clearPointer();
    };

    // Scrolling moves the canvas under a stationary cursor, so a cached rect
    // has to be dropped whenever the page moves or the element resizes.
    const invalidateRect = () => {
      rectReadAt = 0;
    };

    const step = (now: number) => {
      if (!shouldRun()) {
        frame = 0;
        return;
      }
      frame = requestAnimationFrame(step);
      if (!handle) return;
      const delta = (now - last) / 1000;
      last = now;

      if (reduced) {
        // Honour the preference by drawing a single static frame. Continuing to
        // render() every frame burns a core for an image that never changes.
        frame = 0;
        handle.render();
        return;
      }

      handle.update(delta);
      handle.render();

      // Shed particles when we are consistently missing frame, and stop
      // shedding once there is comfortable headroom again.
      const frameMs = delta * 1000;
      if (frameMs > SLOW_FRAME_MS && quality > MIN_DRAWN) {
        slowFrames += 1;
        fastFrames = 0;
        if (slowFrames >= 30) {
          slowFrames = 0;
          quality = Math.max(MIN_DRAWN, quality * 0.7);
          handle.degrade();
        }
      } else if (frameMs < 14) {
        fastFrames += 1;
        slowFrames = 0;
        if (fastFrames >= 240) fastFrames = 0;
      }
    };

    const startIfVisible = () => {
      if (cancelled || frame !== 0) return;
      last = performance.now();
      frame = requestAnimationFrame(step);
    };

    const onVisibility = () => {
      pageHidden = document.hidden;
      startIfVisible();
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (interactive) {
      container.addEventListener("pointermove", onPointerMove);
      container.addEventListener("pointerleave", onPointerLeave);
      container.addEventListener("pointercancel", onPointerLeave);
    }

    const observer = new ResizeObserver(() => {
      invalidateRect();
      resize();
    });
    observer.observe(container);

    // A cached pointer rect only stays valid while the canvas is stationary
    // relative to the viewport, so scroll and resize both drop it.
    if (interactive) {
      window.addEventListener("scroll", invalidateRect, { passive: true });
      window.addEventListener("resize", invalidateRect, { passive: true });
    }

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? true;
        startIfVisible();
      },
      { rootMargin: "256px" },
    );
    visibilityObserver.observe(container);

    startIfVisible();

    const resolvedCount = resolveParticleCount(count);

    handle = createCarParticles({
      canvas,
      src,
      color,
      particleSize,
      targetCount: resolvedCount,
      threshold,
      radius,
      strength,
      spring,
      damping,
      depth,
      idle,
      opacity,
      padding,
      maxDpr,
      onReady: (info) => onReadyRef.current?.(info),
      onError: (error) => {
        if (cancelled) return;
        setFailed(true);
        // A silent fallback is indistinguishable from a working hero: the page
        // looks fine, but the particle field is an <img>. Report it when the
        // caller has not asked for it explicitly.
        if (onErrorRef.current) onErrorRef.current(error);
        else console.error("[CarParticleCanvas] falling back to a static image:", error);
      },
    });

    resize();

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      visibilityObserver.disconnect();
      cancelAnimationFrame(frame);
      observer.disconnect();
      if (interactive) {
        window.removeEventListener("scroll", invalidateRect);
        window.removeEventListener("resize", invalidateRect);
        container.removeEventListener("pointermove", onPointerMove);
        container.removeEventListener("pointerleave", onPointerLeave);
        container.removeEventListener("pointercancel", onPointerLeave);
      }
      handle?.dispose();
      handle = null;
    };
  }, [
    src,
    color,
    particleSize,
    count,
    threshold,
    radius,
    strength,
    spring,
    damping,
    depth,
    idle,
    opacity,
    padding,
    maxDpr,
    interactive,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      style={{ touchAction: interactive ? "pan-y" : undefined, ...style }}
      {...props}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 block h-full w-full"
      />
      {failed
        ? (fallback ?? (
            <img
              src={src}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-80"
            />
          ))
        : null}
    </div>
  );
}

export default CarParticleCanvas;