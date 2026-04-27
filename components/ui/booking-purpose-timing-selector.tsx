import { useState, type ReactNode } from "react";
import { Check, Clock3, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThreeDPill } from "@/components/ui/3d-pill";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

export interface PurposeOption {
  id: string;
  label: string;
  description?: string;
}

export interface TimeOption {
  id: string;
  label: string;
  description?: string;
}

interface BookingPurposeTimingSelectorProps {
  purposes: PurposeOption[];
  selectedPurposeId: string;
  onPurposeSelect: (id: string) => void;
  times: TimeOption[];
  selectedTimeId: string;
  onTimeSelect: (id: string) => void;
  timeChildren?: ReactNode;
}

const PURPOSE_ICONS: Record<string, string> = {
  visit_place: "📍",
  feature_product: "📦",
  showcase_service: "✨",
  promote_offer: "🎯",
  brand_shoutout: "📣",
};

export function BookingPurposeTimingSelector({
  purposes,
  selectedPurposeId,
  onPurposeSelect,
  times,
  selectedTimeId,
  onTimeSelect,
  timeChildren,
}: BookingPurposeTimingSelectorProps) {
  const [tab, setTab] = useState<"purpose" | "time">("purpose");
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleApiChange = (newApi: CarouselApi) => {
    setApi(newApi);
    newApi?.on("select", () => {
      setCurrentIndex(newApi.selectedScrollSnap());
    });
  };

  const scrollPrev = () => api?.scrollPrev();
  const scrollNext = () => api?.scrollNext();

  const canScrollPrev = currentIndex > 0;
  const canScrollNext = currentIndex < purposes.length - 1;

  const handleSelect = (id: string) => {
    onPurposeSelect(id);
    setTab("time");
  };

  return (
    <section className="space-y-3">
      <div className="rounded-full border border-white/10 bg-white/5 p-1.5">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTab("purpose")}
            className="flex w-full justify-center"
          >
            {tab === "purpose" ? (
              <ThreeDPill
                label="Purpose"
                color="gold"
                className="three-d-pill--md three-d-pill--no-glow w-full justify-center"
              />
            ) : (
              <span className="inline-flex h-10 w-full items-center justify-center rounded-full px-3 text-sm font-semibold text-white/70 transition hover:text-white">
                Purpose
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab("time")}
            className="flex w-full justify-center"
          >
            {tab === "time" ? (
              <ThreeDPill
                label="Timeline"
                color="gold"
                className="three-d-pill--md three-d-pill--no-glow w-full justify-center"
              />
            ) : (
              <span className="inline-flex h-10 w-full items-center justify-center rounded-full px-3 text-sm font-semibold text-white/70 transition hover:text-white">
                Timeline
              </span>
            )}
          </button>
        </div>
      </div>

      {tab === "purpose" ? (
        <div className="space-y-3">
          <Carousel
            setApi={handleApiChange}
            opts={{ align: "start", loop: false }}
            className="w-full overflow-hidden"
          >
            <CarouselContent className="-ml-2.5">
              {purposes.map((item) => {
                const isSelected = selectedPurposeId === item.id;
                const icon = PURPOSE_ICONS[item.id] ?? "🎯";
                return (
                  <CarouselItem key={item.id} className="pl-2.5 basis-full">
                    <div
                      className={cn(
                        "flex h-52 flex-col rounded-2xl border p-4 transition-all",
                        isSelected
                          ? "border-white/55 bg-white/12"
                          : "border-white/10 bg-white/3",
                      )}
                    >
                      <span className="text-2xl leading-none">{icon}</span>
                      <p className="mt-3 text-[15px] font-semibold leading-snug text-white">
                        {item.label}
                      </p>
                      {item.description ? (
                        <p className="mt-1.5 flex-1 overflow-hidden text-xs leading-relaxed text-white/55 line-clamp-3">
                          {item.description}
                        </p>
                      ) : (
                        <div className="flex-1" />
                      )}
                      <button
                        type="button"
                        onClick={() => handleSelect(item.id)}
                        className={cn(
                          "mt-4 inline-flex h-9 w-full shrink-0 items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition-all",
                          isSelected
                            ? "bg-white text-black"
                            : "border border-white/20 bg-white/8 text-white active:bg-white/20",
                        )}
                      >
                        {isSelected ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            Selected
                          </>
                        ) : (
                          "Select"
                        )}
                      </button>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>

          {/* Dot indicators + nav */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="grid h-7 w-7 place-items-center rounded-full border border-white/15 text-white/50 transition hover:bg-white/8 hover:text-white disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-1.5">
              {purposes.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => api?.scrollTo(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === currentIndex
                      ? "w-4 bg-white"
                      : "w-1.5 bg-white/25 hover:bg-white/45",
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="grid h-7 w-7 place-items-center rounded-full border border-white/15 text-white/50 transition hover:bg-white/8 hover:text-white disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Hint if nothing selected */}
          {!selectedPurposeId ? (
            <p className="text-center text-xs text-white/35">
              Swipe to browse · tap Select to continue
            </p>
          ) : null}
        </div>
      ) : (
        <div className="max-h-[36dvh] space-y-2 overflow-y-auto pr-1 sm:max-h-none sm:overflow-visible sm:pr-0">
          {times.map((item) => {
            const isActive = selectedTimeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTimeSelect(item.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition",
                  isActive
                    ? "border-white/55 bg-white/12"
                    : "border-white/10 bg-white/3 hover:bg-white/7",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 grid shrink-0 place-items-center transition",
                    isActive
                      ? "h-9 w-9"
                      : "h-5 w-5 rounded-full border border-white/35 text-transparent",
                  )}
                >
                  {isActive ? (
                    <ThreeDPill
                      label="selected"
                      icon={<Check className="h-3.5 w-3.5 text-[#0d0b0f]" />}
                      className="three-d-pill--circle"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">
                    {item.label}
                  </p>
                  {item.description ? (
                    <p className="mt-0.5 text-xs text-white/55">
                      {item.description}
                    </p>
                  ) : null}
                </div>
                {item.id === "asap" ? (
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                ) : null}
              </button>
            );
          })}
          {timeChildren}
        </div>
      )}
    </section>
  );
}
