import { ReactNode, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { Link, useLocation } from "react-router";
import { ShieldAlert } from "lucide-react";
import { Role, useRoles } from "@/hooks/use-roles";
import { useLogin } from "@/hooks/use-login";
import { Button } from "./ui/button";
import { LoadingState } from "./states";

interface ProtectedRouteProperties {
  children: ReactNode;
  // If set, the user needs at least one of these roles to see the page
  roles?: Role[];
}

const ROLE_NAMES: Record<Role, string> = {
  ORGANIZER: "organizer",
  STAFF: "door staff",
  ATTENDEE: "attendee",
};

const ProtectedRoute: React.FC<ProtectedRouteProperties> = ({
  children,
  roles,
}) => {
  const { isLoading, isAuthenticated } = useAuth();
  const { isOrganizer, isStaff, isAttendee } = useRoles();
  const { login } = useLogin();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      login(location.pathname + location.search);
    }
  }, [isLoading, isAuthenticated, location, login]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    return <LoadingState label="Redirecting to login" />;
  }

  const userRoles: Record<Role, boolean> = {
    ORGANIZER: isOrganizer,
    STAFF: isStaff,
    ATTENDEE: isAttendee,
  };

  if (roles && !roles.some((role) => userRoles[role])) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <div className="mb-5 grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
          <ShieldAlert className="size-5" />
        </div>
        <h1 className="font-display text-4xl">Not available</h1>
        <p className="mt-3 text-muted-foreground">
          This page is only for {roles.map((r) => ROLE_NAMES[r]).join(" or ")}{" "}
          accounts. You're signed in with a different account type.
        </p>
        <Button asChild className="mt-6">
          <Link to="/dashboard">Go to my dashboard</Link>
        </Button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
