import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router";
import { useRoles } from "../hooks/use-roles";

const CallbackPage: React.FC = () => {
  const { isLoading: isAuthLoading, isAuthenticated, error } = useAuth();
  const { isLoading: isRolesLoading, isOrganizer } = useRoles();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthLoading || isRolesLoading) {
      return;
    }

    if (error) {
      console.error("Authentication error:", error);
      return;
    }

    if (isAuthenticated) {
      const redirectPath = localStorage.getItem("redirectPath");
      localStorage.removeItem("redirectPath");
      if (redirectPath) {
        navigate(redirectPath);
      } else if (!isOrganizer) {
        navigate("/");
      } else {
        navigate("/organizers");
      }
    }
  }, [isAuthLoading, isRolesLoading, isAuthenticated, error, navigate, isOrganizer]);

  if (isAuthLoading || isRolesLoading) {
    return <p>Processing login...</p>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-950 text-red-200 border border-red-800 rounded">
        <p className="font-bold">Authentication failed</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  return <p>Completing login...</p>;
};

export default CallbackPage;
