"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ThreeDButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  label?: string;
  hoverLabel?: string;
  hideIcon?: boolean;
  customIcon?: React.ReactNode;
};

type ChildProps = {
  className?: string;
  children?: React.ReactNode;
};

function LetterState({
  label,
  state,
  customIcon,
}: {
  label: string;
  state: "state-1" | "state-2";
  customIcon?: React.ReactNode;
}) {
  return (
    <span className={cn("char", state)} aria-hidden="true">
      {customIcon ? (
        <span className="char-icon mr-1.5 flex shrink-0 items-center justify-center">
          {customIcon}
        </span>
      ) : null}
      {[...label].map((char, index) => (
        <span
          key={`${state}-${char}-${index}`}
          data-label={char === " " ? "\u00a0" : char}
          style={{ "--i": index + 1 } as React.CSSProperties}
        >
          {char === " " ? "\u00a0" : char}
        </span>
      ))}
    </span>
  );
}

function ButtonChrome({
  label,
  hoverLabel,
  hideIcon,
  customIcon,
}: {
  label: string;
  hoverLabel: string;
  hideIcon?: boolean;
  customIcon?: React.ReactNode;
}) {
  return (
    <>
      <div className="bg" />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 342 208"
        height={208}
        width={342}
        className="splash"
      >
        <path strokeLinecap="round" strokeWidth={3} d="M54.1054 99.7837C54.1054 99.7837 40.0984 90.7874 26.6893 97.6362C13.2802 104.485 1.5 97.6362 1.5 97.6362" />
        <path strokeLinecap="round" strokeWidth={3} d="M285.273 99.7841C285.273 99.7841 299.28 90.7879 312.689 97.6367C326.098 104.486 340.105 95.4893 340.105 95.4893" />
        <path strokeLinecap="round" strokeWidth={3} strokeOpacity="0.3" d="M281.133 64.9917C281.133 64.9917 287.96 49.8089 302.934 48.2295C317.908 46.6501 319.712 36.5272 319.712 36.5272" />
        <path strokeLinecap="round" strokeWidth={3} strokeOpacity="0.3" d="M281.133 138.984C281.133 138.984 287.96 154.167 302.934 155.746C317.908 157.326 319.712 167.449 319.712 167.449" />
        <path strokeLinecap="round" strokeWidth={3} d="M230.578 57.4476C230.578 57.4476 225.785 41.5051 236.061 30.4998C246.337 19.4945 244.686 12.9998 244.686 12.9998" />
        <path strokeLinecap="round" strokeWidth={3} d="M230.578 150.528C230.578 150.528 225.785 166.471 236.061 177.476C246.337 188.481 244.686 194.976 244.686 194.976" />
        <path strokeLinecap="round" strokeWidth={3} strokeOpacity="0.3" d="M170.392 57.0278C170.392 57.0278 173.89 42.1322 169.571 29.54C165.252 16.9478 168.751 2.05227 168.751 2.05227" />
        <path strokeLinecap="round" strokeWidth={3} strokeOpacity="0.3" d="M170.392 150.948C170.392 150.948 173.89 165.844 169.571 178.436C165.252 191.028 168.751 205.924 168.751 205.924" />
        <path strokeLinecap="round" strokeWidth={3} d="M112.609 57.4476C112.609 57.4476 117.401 41.5051 107.125 30.4998C96.8492 19.4945 98.5 12.9998 98.5 12.9998" />
        <path strokeLinecap="round" strokeWidth={3} d="M112.609 150.528C112.609 150.528 117.401 166.471 107.125 177.476C96.8492 188.481 98.5 194.976 98.5 194.976" />
        <path strokeLinecap="round" strokeWidth={3} strokeOpacity="0.3" d="M62.2941 64.9917C62.2941 64.9917 55.4671 49.8089 40.4932 48.2295C25.5194 46.6501 23.7159 36.5272 23.7159 36.5272" />
        <path strokeLinecap="round" strokeWidth={3} strokeOpacity="0.3" d="M62.2941 145.984C62.2941 145.984 55.4671 161.167 40.4932 162.746C25.5194 164.326 23.7159 174.449 23.7159 174.449" />
      </svg>
      <div className="wrap">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 221 42"
          height={42}
          width={221}
          className="path"
        >
          <path strokeLinecap="round" strokeWidth={3} d="M182.674 2H203C211.837 2 219 9.16344 219 18V24C219 32.8366 211.837 40 203 40H18C9.16345 40 2 32.8366 2 24V18C2 9.16344 9.16344 2 18 2H47.8855" />
        </svg>
        <div className="outline" />
        <div className="content">
          <LetterState label={label} state="state-1" customIcon={customIcon} />
          {!hideIcon && (
            <div className="icon" aria-hidden="true">
              <div />
            </div>
          )}
          <LetterState
            label={hoverLabel}
            state="state-2"
            customIcon={customIcon}
          />
        </div>
      </div>
      <span className="sr-only">{label}</span>
    </>
  );
}

const ThreeDButton = React.forwardRef<HTMLButtonElement, ThreeDButtonProps>(
  (
    {
      asChild = false,
      className,
      children,
      label = "Book Now",
      hoverLabel = label,
      hideIcon = false,
      customIcon,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const rootClassName = cn("three-d-button", className);
    const chrome = (
      <ButtonChrome
        label={label}
        hoverLabel={hoverLabel}
        hideIcon={hideIcon}
        customIcon={customIcon}
      />
    );

    if (asChild && React.isValidElement<ChildProps>(children)) {
      return React.cloneElement(children, {
        className: cn(rootClassName, children.props.className),
        children: chrome,
      });
    }

    return (
      <button ref={ref} type={type} className={rootClassName} {...props}>
        {chrome}
      </button>
    );
  },
);

ThreeDButton.displayName = "ThreeDButton";

export { ThreeDButton };
