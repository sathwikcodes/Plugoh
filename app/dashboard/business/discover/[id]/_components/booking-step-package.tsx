import type { ReactNode } from "react";
import { Check, ChevronDown, CircleAlert } from "lucide-react";
import Link from "next/link";
import { getAvailablePackages, type BookablePackage } from "@/lib/booking";
import { Button } from "@/components/ui/button";
import {
  Workspaces,
  WorkspaceTrigger,
  WorkspaceContent,
  type Workspace,
} from "@/components/ui/workspaces";

export function DropdownTrigger({
  label,
  workspace,
  isOpen,
}: {
  label: string;
  workspace: Workspace;
  isOpen: boolean;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <div className="min-w-0 text-left">
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-medium text-white">
          {workspace.name}
        </p>
      </div>
      <ChevronDown
        className={`h-4 w-4 text-white/55 transition-transform ${isOpen ? "rotate-180" : ""}`}
      />
    </div>
  );
}

export function WorkspaceRow({
  workspace,
  isSelected,
}: {
  workspace: Workspace;
  isSelected: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-white">{workspace.name}</p>
        {workspace.description ? (
          <p className="mt-1 text-xs text-white/50">{workspace.description}</p>
        ) : null}
      </div>
      {isSelected ? <Check className="h-4 w-4 text-white" /> : null}
    </div>
  );
}

interface BookingDropdownProps {
  heading: string;
  label: string;
  items: Workspace[];
  selectedId: string;
  onSelect: (ws: Workspace) => void;
  children?: ReactNode;
}

export function BookingDropdown({
  heading,
  label,
  items,
  selectedId,
  onSelect,
  children,
}: BookingDropdownProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-white/45">
        {heading}
      </h2>
      <Workspaces
        workspaces={items}
        selectedWorkspaceId={selectedId}
        onWorkspaceChange={onSelect}
      >
        <WorkspaceTrigger
          className="w-full rounded-[22px] border border-white/10 bg-white/4 px-4 py-3 text-left shadow-[0_16px_32px_rgba(0,0,0,0.18)] transition-colors hover:bg-white/6.5"
          renderTrigger={(ws, isOpen) => (
            <DropdownTrigger label={label} workspace={ws} isOpen={isOpen} />
          )}
        />
        <WorkspaceContent
          title={label}
          className="border-white/10 bg-[#241e30] text-white"
          renderWorkspace={(ws, isSelected) => (
            <WorkspaceRow workspace={ws} isSelected={isSelected} />
          )}
        />
      </Workspaces>
      {children}
    </section>
  );
}

interface BookingStepPackageProps {
  isProfileComplete: boolean;
  availablePackages: ReturnType<typeof getAvailablePackages>;
  selectedPackage: BookablePackage;
  onPackageChange: (pkg: BookablePackage) => void;
}

export function BookingStepPackage({
  isProfileComplete,
  availablePackages,
  selectedPackage,
  onPackageChange,
}: BookingStepPackageProps) {
  const canStart = isProfileComplete && availablePackages.length > 0;

  return (
    <>
      {!isProfileComplete ? (
        <div className="space-y-3 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-4">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-4 w-4 text-yellow-200" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-white">
                Complete your business profile first
              </p>
              <p className="text-sm text-white/65">
                We only need your brand details once, then future bookings stay
                faster.
              </p>
            </div>
          </div>
          <Button variant="outline" asChild className="w-full">
            <Link href="/dashboard/business/profile">
              Complete business profile
            </Link>
          </Button>
        </div>
      ) : null}
      {!availablePackages.length ? (
        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/3 p-4">
          <p className="text-sm font-medium text-white">
            This creator has no bookable package pricing yet.
          </p>
          <p className="text-sm text-white/60">
            Come back once their pricing is available.
          </p>
        </div>
      ) : null}
      {canStart ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-white/45">
            What you need
          </h2>
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${Math.min(availablePackages.length, 3)}, 1fr)`,
            }}
          >
            {availablePackages.map((item) => {
              const active = selectedPackage === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onPackageChange(item.key)}
                  className={`rounded-2xl border px-3 py-3 text-center transition ${
                    active
                      ? "border-white/30 bg-white text-black"
                      : "border-white/10 bg-white/3 text-white hover:bg-white/6"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${active ? "text-black" : "text-white"}`}
                  >
                    {item.label}
                  </p>
                  <p
                    className={`mt-1 text-lg font-semibold ${active ? "text-black" : "text-white"}`}
                  >
                    ₹{item.price.toLocaleString("en-IN")}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}
    </>
  );
}
