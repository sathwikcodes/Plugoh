"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Menu, LogOut, User, LayoutDashboard, X } from "lucide-react";
import { NotificationDrawer } from "@/components/shared/notification-drawer";

export function Navbar() {
  const { user, profile, role, signOut } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardPath =
    role === "influencer" ? "/dashboard/influencer" : "/dashboard/business";
  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">R</span>
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            ReelReach
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href={dashboardPath}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </Link>
              </Button>
              <NotificationDrawer />
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    className="text-muted-foreground text-xs"
                    disabled
                  >
                    {profile?.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(dashboardPath)}>
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </nav>

        {/* Mobile nav */}
        <div className="flex items-center gap-1 md:hidden">
          {user && <NotificationDrawer />}
          <Drawer
            direction="right"
            open={mobileOpen}
            onOpenChange={setMobileOpen}
          >
            <DrawerTrigger>
              <Button variant="ghost" size="icon" className="h-11 w-11">
                <Menu className="h-6 w-6" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-full w-[min(300px,85vw)] ml-auto rounded-none">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-display font-bold text-lg">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex flex-col gap-1 p-4">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 p-3 mb-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {profile?.full_name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {profile?.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="justify-start h-12 text-base"
                      asChild
                      onClick={() => setMobileOpen(false)}
                    >
                      <Link href={dashboardPath}>
                        <LayoutDashboard className="mr-3 h-5 w-5" /> Dashboard
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start h-12 text-base text-destructive"
                      onClick={() => {
                        handleSignOut();
                        setMobileOpen(false);
                      }}
                    >
                      <LogOut className="mr-3 h-5 w-5" /> Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="justify-start h-12 text-base"
                      asChild
                      onClick={() => setMobileOpen(false)}
                    >
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button
                      className="justify-start h-12 text-base"
                      asChild
                      onClick={() => setMobileOpen(false)}
                    >
                      <Link href="/register">Register</Link>
                    </Button>
                  </>
                )}
              </nav>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
}
