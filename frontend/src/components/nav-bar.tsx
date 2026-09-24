import { useAuth } from "react-oidc-context";
import { Link, NavLink } from "react-router";
import { LogOut, Menu } from "lucide-react";
import { Persona, useRoles } from "@/hooks/use-roles";
import { useLogin } from "@/hooks/use-login";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import ThemeToggle from "./theme-toggle";

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

// Each kind of visitor only sees what they can actually do
const NAV_ITEMS: Record<Persona, NavItem[]> = {
  guest: [
    { to: "/", label: "Events", end: true },
    { to: "/organizers", label: "For organizers" },
  ],
  attendee: [
    { to: "/", label: "Events", end: true },
    { to: "/dashboard/tickets", label: "My tickets" },
  ],
  organizer: [
    { to: "/dashboard/events", label: "My events", end: true },
    { to: "/dashboard/events/create", label: "New event" },
    { to: "/", label: "Public listings", end: true },
  ],
  staff: [
    { to: "/dashboard/validate-qr", label: "Check-in" },
    { to: "/", label: "Events", end: true },
  ],
};

const PERSONA_LABEL: Record<Persona, string> = {
  guest: "Guest",
  attendee: "Attendee",
  organizer: "Organizer",
  staff: "Door staff",
};

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <Link
    to="/"
    className={cn("flex items-center gap-2 font-semibold", className)}
  >
    <img src="/favicon.svg" alt="" className="size-7" />
    <span className="text-[15px] tracking-tight">
      Paw<span className="text-brand">Events</span>
    </span>
  </Link>
);

const NavBar: React.FC = () => {
  const { user, isAuthenticated, signoutRedirect } = useAuth();
  const { persona } = useRoles();
  const { login, signup } = useLogin();
  const items = NAV_ITEMS[persona];

  const username = user?.profile?.preferred_username ?? "";
  const displayName =
    [user?.profile?.given_name, user?.profile?.family_name]
      .filter(Boolean)
      .join(" ") || username;
  const initials = (displayName || "?").slice(0, 2).toUpperCase();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "rounded-full px-3 py-1.5 text-sm transition-colors",
      isActive
        ? "bg-secondary text-foreground"
        : "text-muted-foreground hover:text-foreground",
    );

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {items.map((item) => (
            <NavLink
              key={item.to + item.label}
              to={item.to}
              end={item.end}
              className={linkClass}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-2 rounded-full border bg-card py-1 pr-3 pl-1 text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
                aria-label="Account menu"
              >
                <span className="grid size-7 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  {initials}
                </span>
                <span className="hidden max-w-28 truncate sm:inline">
                  {username}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="font-normal">
                  <p className="truncate font-medium">{displayName}</p>
                  {user?.profile?.email && (
                    <p className="truncate text-xs text-muted-foreground">
                      {user.profile.email}
                    </p>
                  )}
                  <span className="mt-2 inline-block rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand">
                    {PERSONA_LABEL[persona]}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="md:hidden" />
                {items.map((item) => (
                  <DropdownMenuItem
                    key={item.to + item.label}
                    asChild
                    className="md:hidden"
                  >
                    <Link to={item.to}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <div className="flex items-center justify-between px-2 py-1.5 sm:hidden">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
                <DropdownMenuItem onClick={() => signoutRedirect()}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => login()}
              >
                Log in
              </Button>
              <Button size="sm" onClick={() => signup()}>
                Sign up
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open menu"
                  >
                    <Menu />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {items.map((item) => (
                    <DropdownMenuItem key={item.to} asChild>
                      <Link to={item.to}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem onClick={() => login()}>
                    Log in
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <ThemeToggle />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
