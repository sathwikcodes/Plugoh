"use client";

import * as React from "react";
import PhoneInputPrimitive from "react-phone-number-input/input";
import flags from "react-phone-number-input/flags";
import type { Value } from "react-phone-number-input";
import { cn } from "@/lib/utils";

const IndianFlag = flags["IN"];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onFocus?: React.FocusEventHandler<HTMLDivElement>;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
}

const PhoneInput = React.forwardRef<HTMLDivElement, PhoneInputProps>(
  (
    {
      value,
      onChange,
      id,
      placeholder,
      required,
      className,
      style,
      onFocus,
      onBlur,
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center", className)}
        style={style}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <span className="flex h-5 w-7 shrink-0 overflow-hidden rounded-sm ml-1">
          {IndianFlag && <IndianFlag title="India" />}
        </span>
        <PhoneInputPrimitive
          id={id}
          country="IN"
          international={false}
          value={(value as Value) || undefined}
          onChange={(val) => onChange(val || "")}
          placeholder={placeholder}
          required={required}
          className="flex-1 h-full bg-transparent outline-none text-inherit px-3"
        />
      </div>
    );
  },
);
PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
