import { Outlet, useNavigate } from "react-router";
import { signOut, useSession } from "../lib/auth-client";

export default function Layout() {
  const { data: session } = useSession();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <span className="navbar-brand">Helpdesk</span>
        <div className="navbar-right">
          <span className="navbar-user">{session?.user?.name}</span>
          <button className="btn btn-secondary" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
