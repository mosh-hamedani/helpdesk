import { Navigate, Outlet } from "react-router";
import { useSession } from "../lib/auth-client";

export default function ProtectedRoute() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div className="loading">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
