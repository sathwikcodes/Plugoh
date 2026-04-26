"use client";

import NumberFlow from "@number-flow/react";
import React from "react";

export function PricingInteraction({
  starterMonth,
  starterAnnual,
  proMonth,
  proAnnual,
}: {
  starterMonth: number;
  starterAnnual: number;
  proMonth: number;
  proAnnual: number;
}) {
  const [active, setActive] = React.useState(0);
  const [period, setPeriod] = React.useState(0);
  const [starter, setStarter] = React.useState(starterMonth);
  const [pro, setPro] = React.useState(proMonth);

  const handleChangePlan = (index: number) => {
    setActive(index);
  };

  const handleChangePeriod = (index: number) => {
    setPeriod(index);
    if (index === 0) {
      setStarter(starterMonth);
      setPro(proMonth);
    } else {
      setStarter(starterAnnual);
      setPro(proAnnual);
    }
  };

  return (
    <div className="flex h-[min(72dvh,680px)] w-full max-w-sm flex-col items-center gap-3 overflow-hidden rounded-[32px] border-2 bg-white p-3 shadow-md sm:h-[620px]">
      <div className="relative flex w-full items-center rounded-full bg-slate-100 p-1.5">
        <button
          className="z-20 w-full rounded-full p-1.5 font-semibold text-slate-800"
          onClick={() => handleChangePeriod(0)}
        >
          Monthly
        </button>
        <button
          className="z-20 w-full rounded-full p-1.5 font-semibold text-slate-800"
          onClick={() => handleChangePeriod(1)}
        >
          Yearly
        </button>
        <div
          className="absolute inset-0 z-10 flex w-1/2 items-center justify-center p-1.5"
          style={{
            transform: `translateX(${period * 100}%)`,
            transition: "transform 0.3s",
          }}
        >
          <div className="h-full w-full rounded-full bg-white shadow-sm" />
        </div>
      </div>

      <div className="relative w-full flex-1 overflow-y-auto pr-1">
        <div className="relative flex w-full flex-col items-center justify-center gap-3 pb-1">
        <div
          className="flex w-full cursor-pointer justify-between rounded-2xl border-2 border-gray-400 p-4"
          onClick={() => handleChangePlan(0)}
        >
          <div className="flex flex-col items-start">
            <p className="text-xl font-semibold text-gray-950">Free</p>
            <p className="text-md text-slate-500">
              <span className="font-medium text-black">$0.00</span>/month
            </p>
          </div>
          <div
            className="mt-0.5 flex size-6 items-center justify-center rounded-full border-2 border-slate-500 p-1"
            style={{
              borderColor: `${active === 0 ? "#000" : "#64748b"}`,
              transition: "border-color 0.3s",
            }}
          >
            <div
              className="size-3 rounded-full bg-black"
              style={{
                opacity: `${active === 0 ? 1 : 0}`,
                transition: "opacity 0.3s",
              }}
            />
          </div>
        </div>

        <div
          className="flex w-full cursor-pointer justify-between rounded-2xl border-2 border-gray-400 p-4"
          onClick={() => handleChangePlan(1)}
        >
          <div className="flex flex-col items-start">
            <p className="flex items-center gap-2 text-xl font-semibold text-gray-950">
              Starter
              <span className="block rounded-lg bg-yellow-100 px-2 py-1 text-sm text-yellow-950">
                Popular
              </span>
            </p>
            <p className="text-md flex text-slate-500">
              <span className="flex items-center font-medium text-black">
                ${" "}
                <NumberFlow className="font-medium text-black" value={starter} />
              </span>
              /month
            </p>
          </div>
          <div
            className="mt-0.5 flex size-6 items-center justify-center rounded-full border-2 border-slate-500 p-1"
            style={{
              borderColor: `${active === 1 ? "#000" : "#64748b"}`,
              transition: "border-color 0.3s",
            }}
          >
            <div
              className="size-3 rounded-full bg-black"
              style={{
                opacity: `${active === 1 ? 1 : 0}`,
                transition: "opacity 0.3s",
              }}
            />
          </div>
        </div>

        <div
          className="flex w-full cursor-pointer justify-between rounded-2xl border-2 border-gray-400 p-4"
          onClick={() => handleChangePlan(2)}
        >
          <div className="flex flex-col items-start">
            <p className="text-xl font-semibold text-gray-950">Pro</p>
            <p className="text-md flex text-slate-500">
              <span className="flex items-center font-medium text-black">
                ${" "}
                <NumberFlow className="font-medium text-black" value={pro} />
              </span>
              /month
            </p>
          </div>
          <div
            className="mt-0.5 flex size-6 items-center justify-center rounded-full border-2 border-slate-500 p-1"
            style={{
              borderColor: `${active === 2 ? "#000" : "#64748b"}`,
              transition: "border-color 0.3s",
            }}
          >
            <div
              className="size-3 rounded-full bg-black"
              style={{
                opacity: `${active === 2 ? 1 : 0}`,
                transition: "opacity 0.3s",
              }}
            />
          </div>
        </div>

        <div
          className="absolute top-0 h-[88px] w-full rounded-2xl border-[3px] border-black"
          style={{
            transform: `translateY(${active * 88 + 12 * active}px)`,
            transition: "transform 0.3s",
          }}
        />
        </div>
      </div>

      <button className="w-full rounded-full bg-black p-3 text-lg text-white transition-transform duration-300 active:scale-95">
        Get Started
      </button>
    </div>
  );
}
