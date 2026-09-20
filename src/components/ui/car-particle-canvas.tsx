"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type {
  CarParticlesHandle,
  CarParticlesReadyInfo,
} from "@/lib/car-particles";

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

    const shouldRun = () => inView && !pageHidden;

    const resize = () => {
      if (!handle) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width > 0 && height > 0) handle.resize(width, height);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!handle) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      handle.setPointer(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1),
      );
    };

    const onPointerLeave = () => {
      handle?.clearPointer();
    };

    const step = (now: number) => {
      // Pause the render loop entirely while the hero is off-screen or the
      // tab is hidden, so the particle simulation never burns GPU/CPU below
      // the fold or in a background tab.
      if (!shouldRun()) {
        frame = 0;
        return;
      }
      frame = requestAnimationFrame(step);
      if (!handle) return;
      const delta = (now - last) / 1000;
      last = now;
      if (!reduced) handle.update(delta);
      handle.render();
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

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? true;
        startIfVisible();
      },
      { rootMargin: "256px" },
    );
    visibilityObserver.observe(container);

    startIfVisible();

    const resolvedCount = count ?? (window.innerWidth < 768 ? 16000 : 32000);

    void import("@/lib/car-particles")
      .then(({ createCarParticles }) => {
        if (cancelled) return;
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
            onErrorRef.current?.(error);
          },
        });
        resize();
      })
      .catch((error) => {
        if (cancelled) return;
        setFailed(true);
        onErrorRef.current?.(error);
      });

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      visibilityObserver.disconnect();
      cancelAnimationFrame(frame);
      observer.disconnect();
      if (interactive) {
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
