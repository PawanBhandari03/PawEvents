import { useRoles } from "@/hooks/use-roles";
import { Navigate } from "react-router";

// Sends each user to the dashboard page that matches their role
const DashboardPage: React.FC = () => {
  const { isLoading, isOrganizer, isStaff } = useRoles();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isOrganizer) {
    return <Navigate to="/dashboard/events" replace />;
  }

  if (isStaff) {
    return <Navigate to="/dashboard/validate-qr" replace />;
  }

  return <Navigate to="/dashboard/tickets" replace />;
};

export default DashboardPage;
