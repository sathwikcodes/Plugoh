"use client";

import {
  Calendar as CalendarRac,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Heading,
  RangeCalendar as RangeCalendarRac,
  Button,
  type CalendarProps,
  type DateValue,
  type RangeCalendarProps,
} from "react-aria-components";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type CalendarComponentProps<T extends DateValue> = CalendarProps<T> & {
  className?: string;
};

type RangeCalendarComponentProps<T extends DateValue> =
  RangeCalendarProps<T> & {
    className?: string;
  };

function CalendarHeader() {
  return (
    <header className="mb-2 flex items-center justify-between gap-2 px-1">
      <Button
        slot="previous"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background text-foreground transition hover:bg-accent"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Heading className="text-sm font-semibold text-foreground" />
      <Button
        slot="next"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background text-foreground transition hover:bg-accent"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </header>
  );
}

function CalendarGridComponent({ isRange = false }: { isRange?: boolean }) {
  return (
    <CalendarGrid className="w-full border-separate border-spacing-1 text-center">
      <CalendarGridHeader>
        {(day) => (
          <CalendarHeaderCell className="pb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {day}
          </CalendarHeaderCell>
        )}
      </CalendarGridHeader>
      <CalendarGridBody>
        {(date) => (
          <CalendarCell
            date={date}
            className={cn(
              "relative h-9 w-9 rounded-md text-sm text-foreground transition before:absolute before:inset-0 before:-z-10 before:rounded-md before:transition",
              "data-[focused]:ring-2 data-[focused]:ring-ring/40",
              "data-[disabled]:text-muted-foreground/45 data-[disabled]:opacity-60",
              "data-[outside-month]:text-muted-foreground/50",
              "data-[hovered]:before:bg-accent",
              "data-[selected]:bg-primary data-[selected]:font-medium data-[selected]:text-primary-foreground",
              isRange
                ? "data-[selection-start]:rounded-l-md data-[selection-end]:rounded-r-md data-[selection-start]:bg-primary data-[selection-end]:bg-primary data-[selection-start]:text-primary-foreground data-[selection-end]:text-primary-foreground data-[selected]:bg-primary/90"
                : "",
            )}
          />
        )}
      </CalendarGridBody>
    </CalendarGrid>
  );
}

const Calendar = <T extends DateValue>({
  className,
  ...props
}: CalendarComponentProps<T>) => {
  return (
    <CalendarRac {...props} className={cn("w-fit rounded-xl p-2", className)}>
      <CalendarHeader />
      <CalendarGridComponent />
    </CalendarRac>
  );
};

const RangeCalendar = <T extends DateValue>({
  className,
  ...props
}: RangeCalendarComponentProps<T>) => {
  return (
    <RangeCalendarRac
      {...props}
      className={cn("w-fit rounded-xl p-2", className)}
    >
      <CalendarHeader />
      <CalendarGridComponent isRange />
    </RangeCalendarRac>
  );
};

export { Calendar, RangeCalendar };
