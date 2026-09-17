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
      centerLabel={centerLabel}
      showCenterLabel
      className={className}
      aria-label="Fleet carousel"
    />
  );
}
