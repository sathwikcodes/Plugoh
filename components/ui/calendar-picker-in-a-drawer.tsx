"use client";

import * as React from "react";
import {
  CalendarDate,
  getLocalTimeZone,
  parseDate,
  today,
  type DateValue,
} from "@internationalized/date";
import { CalendarPlusIcon } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar-rac";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

export const Component = () => {
  const [count, setCount] = React.useState(0);

  return (
    <div className={cn("flex flex-col items-center gap-4 rounded-lg p-4")}>
      <h1 className="mb-2 text-2xl font-bold">Component Example</h1>
      <h2 className="text-xl font-semibold">{count}</h2>
      <div className="flex gap-2">
        <button onClick={() => setCount((prev) => prev - 1)}>-</button>
        <button onClick={() => setCount((prev) => prev + 1)}>+</button>
      </div>
    </div>
  );
};

interface Calendar32Props {
  value: string;
  onChange: (nextValue: string) => void;
  id?: string;
  label?: string;
  className?: string;
  triggerClassName?: string;
  disablePastDates?: boolean;
}

function toCalendarDate(value: string): CalendarDate | null {
  if (!value) return null;
  try {
    return parseDate(value);
  } catch {
    return null;
  }
}

function formatCalendarDate(date: CalendarDate): string {
  return date.toDate(getLocalTimeZone()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function Calendar32({
  value,
  onChange,
  id = "date",
  label = "Date",
  className,
  triggerClassName,
  disablePastDates = true,
}: Calendar32Props) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  const date = React.useMemo(() => toCalendarDate(value), [value]);
  const minValue = disablePastDates ? today(getLocalTimeZone()) : undefined;

  const handleDateChange = (nextDate: DateValue) => {
    const normalized =
      nextDate instanceof CalendarDate
        ? nextDate
        : new CalendarDate(nextDate.year, nextDate.month, nextDate.day);
    onChange(normalized.toString());
    setOpen(false);
  };

  const triggerLabel = date ? formatCalendarDate(date) : "Select date";

  if (isMobile) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <Label htmlFor={id} className="px-1">
          {label}
        </Label>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              id={id}
              className={cn(
                "h-10 w-full justify-between rounded-xl border-white/15 bg-white/2 font-normal text-white hover:bg-white/6 hover:text-white",
                triggerClassName,
              )}
            >
              <span className="truncate">{triggerLabel}</span>
              <CalendarPlusIcon className="h-4 w-4 text-white/65" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[86dvh] overflow-hidden rounded-t-3xl border-white/10 bg-[#110f16] p-0 text-white">
            <DrawerHeader className="border-b border-white/10 px-5 pb-4 pt-5 text-left">
              <DrawerTitle className="text-base font-semibold text-white">
                Select date
              </DrawerTitle>
              <DrawerDescription className="text-sm text-white/55">
                Choose when you need the deliverable.
              </DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-5 pt-2">
              <Calendar
                value={date ?? undefined}
                onChange={handleDateChange}
                minValue={minValue}
                className="mx-auto w-full max-w-sm rounded-2xl border border-white/10 bg-white/3 p-3"
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label ? (
        <Label htmlFor={id} className="px-1">
          {label}
        </Label>
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          className={cn(
            "inline-flex h-10 w-full items-center justify-between rounded-xl border border-white/15 bg-white/2 px-3 text-sm font-normal text-white transition hover:bg-white/6",
            triggerClassName,
          )}
        >
          <span className="truncate">{triggerLabel}</span>
          <CalendarPlusIcon className="h-4 w-4 text-white/65" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-auto rounded-2xl border border-white/10 bg-[#110f16] p-3 text-white shadow-2xl"
        >
          <PopoverHeader className="px-1 pb-2">
            <PopoverTitle className="text-sm font-semibold text-white">
              Select date
            </PopoverTitle>
            <PopoverDescription className="text-xs text-white/55">
              Choose when you need the deliverable.
            </PopoverDescription>
          </PopoverHeader>
          <Calendar
            value={date ?? undefined}
            onChange={handleDateChange}
            minValue={minValue}
            className="rounded-xl border border-white/10 bg-white/3 p-2"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
