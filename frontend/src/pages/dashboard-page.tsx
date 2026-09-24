import { useRoles } from "@/hooks/use-roles";
import { Navigate } from "react-router";
import { LoadingState } from "@/components/states";

const HOME_BY_PERSONA = {
  organizer: "/dashboard/events",
  staff: "/dashboard/validate-qr",
  attendee: "/dashboard/tickets",
  guest: "/",
} as const;

// Sends each user to the dashboard page that matches their role
const DashboardPage: React.FC = () => {
  const { isLoading, persona } = useRoles();

  if (isLoading) {
    return <LoadingState />;
  }

  return <Navigate to={HOME_BY_PERSONA[persona]} replace />;
};

export default DashboardPage;
