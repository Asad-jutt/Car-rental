"use client";

import * as React from "react";
import { HaloReel, type HaloReelItem } from "@/components/ui/halo-reel";
import { VEHICLES } from "@/data/fleetData";

/** Each fleet vehicle becomes a card on the ring. The card face reuses the
 *  fleet card aesthetic it already wears in the matrix below — same image,
 *  same name, same band — so swapping in the reel never changes how a vehicle
 *  reads. */
const ITEMS: HaloReelItem[] = VEHICLES.map((vehicle) => ({
  src: vehicle.imageUrl,
  alt: `${vehicle.name} profile`,
  title: vehicle.name,
  subtitle: `${vehicle.band} // $${vehicle.pricePer24h} / 24H`,
}));

export default function FleetReel({
  centerLabel,
  className,
}: {
  centerLabel?: React.ReactNode;
  className?: string;
}) {
  const resolvedCenterLabel = centerLabel ?? (
    <div className="pointer-events-none flex flex-col items-center gap-1 select-none">
      <span className="font-headline text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#ffffff]/95">
        SELECTED FLEET
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#ff5a00]">
        [SPIN TO BROWSE]
      </span>
    </div>
  );

  return (
    <HaloReel
      items={ITEMS}
      autoPlay
      holdDuration={1200}
      stepDuration={720}
      pauseOnHover
      draggable
      spread={1.2}
      maxCards={48}
      cardWidth={150}
      cardHeight={200}
      minScale={0.42}
      radiusXRatio={0.45}
      radiusYRatio={0.36}
      centerLabel={resolvedCenterLabel}
      showCenterLabel
      className={className}
      aria-label="Fleet carousel"
    />
  );
}
