import { ReactNode, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { Link, useLocation } from "react-router";
import { useRoles } from "@/hooks/use-roles";
import { Button } from "./ui/button";

type Role = "ORGANIZER" | "STAFF" | "ATTENDEE";

interface ProtectedRouteProperties {
  children: ReactNode;
  // If set, the user needs at least one of these roles to see the page
  roles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProperties> = ({
  children,
  roles,
}) => {
  const { isLoading, isAuthenticated, signinRedirect } = useAuth();
  const {
    isLoading: isRolesLoading,
    isOrganizer,
    isStaff,
    isAttendee,
  } = useRoles();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      localStorage.setItem("redirectPath", location.pathname + location.search);
      signinRedirect();
    }
  }, [isLoading, isAuthenticated, location, signinRedirect]);

  if (isLoading || (isAuthenticated && isRolesLoading)) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated) {
    return <p>Redirecting to login...</p>;
  }

  const userRoles: Record<Role, boolean> = {
    ORGANIZER: isOrganizer,
    STAFF: isStaff,
    ATTENDEE: isAttendee,
  };

  if (roles && !roles.some((role) => userRoles[role])) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">Access denied</h1>
          <p className="text-gray-400">
            This page is only available to{" "}
            {roles.map((r) => r.toLowerCase()).join(" / ")} accounts.
          </p>
          <Link to="/dashboard">
            <Button className="cursor-pointer">Go to my dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
