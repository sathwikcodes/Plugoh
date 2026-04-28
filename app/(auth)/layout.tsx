import { type ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="dark h-dvh overflow-hidden overscroll-none"
      data-auth-theme="neutral"
    >
      {children}
    </div>
  );
}
