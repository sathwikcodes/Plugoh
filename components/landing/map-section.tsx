import { LocationMap } from "@/components/ui/expand-map";

export function MapSection() {
  return (
    <section className="relative py-20">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(52,211,153,0.03)_0%,_transparent_70%)]" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
          Our Locations
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <LocationMap
            location="Rajahmundry"
            coordinates="16.9891° N, 81.7840° E"
          />
          <LocationMap
            location="Vijayawada"
            coordinates="16.5062° N, 80.6480° E"
          />
          <LocationMap
            location="Hyderabad"
            coordinates="17.3850° N, 78.4867° E"
          />
        </div>
      </div>
    </section>
  );
}
