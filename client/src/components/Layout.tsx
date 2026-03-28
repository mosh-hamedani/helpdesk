import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { Role } from "core/constants/role.ts";
import { signOut, useSession } from "../lib/auth-client";
import { useTheme } from "../lib/theme";
import {
  LayoutDashboard,
  Ticket,
  Users,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import BrandLogo from "./BrandLogo";

export default function Layout() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 text-[13px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
      isActive
        ? "text-primary-foreground bg-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-accent"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <nav className="sticky top-0 z-50 bg-background border-b px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Link to="/" className="mr-5 group">
            <BrandLogo showWordmark />
          </Link>
          <NavLink to="/" end className={navLinkClass}>
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </NavLink>
          <NavLink to="/tickets" className={navLinkClass}>
            <Ticket className="h-3.5 w-3.5" />
            Tickets
          </NavLink>
          {session?.user?.role === Role.admin && (
            <NavLink to="/users" className={navLinkClass}>
              <Users className="h-3.5 w-3.5" />
              Users
            </NavLink>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-lg h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <div className="h-5 w-px bg-border mx-2" />
          <span className="text-[13px] text-muted-foreground mr-1">
            {session?.user?.name}
          </span>
          <button
            className="inline-flex items-center justify-center gap-1.5 rounded-lg text-[13px] font-medium px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 cursor-pointer"
            onClick={handleSignOut}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </nav>
      <main className="flex-1 px-8 py-8 max-w-[1200px] w-full mx-auto animate-in-page">
        <Outlet />
      </main>
    </div>
  );
}
