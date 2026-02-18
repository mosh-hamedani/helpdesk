import { Navigate, Outlet } from "react-router";
import { Role } from "core/constants/role.ts";
import { useSession } from "../lib/auth-client";

export default function AdminRoute() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (session?.user?.role !== Role.admin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
