import { Link, Outlet, useNavigate } from "react-router";
import { Role } from "core/constants/role.ts";
import { signOut, useSession } from "../lib/auth-client";

export default function Layout() {
  const { data: session } = useSession();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between bg-background border-b px-6 h-14">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-bold hover:text-foreground transition-colors">Helpdesk</Link>
          <Link to="/tickets" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Tickets
          </Link>
          {session?.user?.role === Role.admin && (
            <Link to="/users" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Users
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{session?.user?.name}</span>
          <button
            className="inline-flex items-center justify-center rounded-md text-sm font-medium px-4 py-2 border border-input hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      </nav>
      <main className="flex-1 p-8 max-w-[1200px] w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
