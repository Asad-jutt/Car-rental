import { cn } from "@/lib/utils";
import { TestimonialCard } from "@/components/ui/testimonial-card";
import type { TestimonialAuthor } from "@/components/ui/testimonial-card";

interface TestimonialsSectionProps {
  title: string;
  description?: string;
  eyebrow?: string;
  meta?: string;
  testimonials: Array<{
    author: TestimonialAuthor;
    text: string;
    href?: string;
  }>;
  className?: string;
}

export function TestimonialsSection({
  title,
  description,
  eyebrow = "[MODULE_05 // CUSTOMER REVIEWS]",
  meta = "VERIFIED ORDERS // 4.9/5 AVERAGE RATING",
  testimonials,
  className,
}: TestimonialsSectionProps) {
  return (
    <section
      id="case-studies"
      className={cn(
        "relative w-full overflow-hidden scroll-mt-12 border-b border-[#1f1f1f] bg-background text-foreground",
        className,
      )}
    >
      {/* Ambient Backlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 bottom-0"
        style={{
          background:
            "radial-gradient(900px circle at 80% 5%, rgba(255,90,0,0.20), transparent 55%), radial-gradient(700px circle at 12% 90%, rgba(255,90,0,0.12), transparent 60%)",
        }}
      />

      {/* Industrial Header */}
      <div className="relative mx-auto w-full max-w-[1200px] px-4 pt-10 sm:px-5 sm:pt-14 lg:px-6 lg:pt-16">
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[#1f1f1f] pb-4 sm:mb-8 md:flex-row md:items-end">
          <div className="max-w-full">
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-block h-2 w-2 bg-[#ff5a00] shadow-[0_0_6px_#ff5a00]" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#ff5a00]">
                {eyebrow}
              </span>
            </div>
            <h2 className="m-0 font-headline text-xl font-extrabold uppercase tracking-tight text-white sm:text-2xl lg:text-3xl">
              {title}
            </h2>
            {description && (
              <p className="mt-3 max-w-2xl font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                {description}
              </p>
            )}
          </div>
          {meta && (
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#888] sm:text-xs md:text-right">
              {meta}
            </div>
          )}
        </div>
      </div>

      {/* Full-Bleed Marquee Feed */}
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
        <div className="group flex flex-row overflow-hidden py-2 [--gap:2rem] [gap:var(--gap)] sm:[--gap:2.5rem]">
          {/* Two passes is exactly what a seamless `-100%` loop needs: the row
              is N cards plus N-1 gaps, so shifting by 100% plus one more gap
              lands pass two where pass one started. It was four passes, which
              doubled the avatar requests for a loop nobody perceives. */}
          <div className="flex shrink-0 flex-row justify-around [gap:var(--gap)] animate-marquee group-hover:[animation-play-state:paused]">
            {Array.from({ length: 2 }).map((_, setIndex) =>
              testimonials.map((testimonial, i) => (
                <TestimonialCard
                  key={`${setIndex}-${i}`}
                  {...testimonial}
                  // Only the first pass is real content; the copy is decoration.
                  aria-hidden={setIndex === 0 ? undefined : true}
                />
              )),
            )}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-background sm:block" />
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-background sm:block" />
      </div>

      {/* Bottom Bleed */}
      <div aria-hidden className="relative h-0" />
    </section>
  );
}