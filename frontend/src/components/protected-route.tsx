import { ReactNode, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useLocation } from "react-router";

interface ProtectedRouteProperties {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProperties> = ({ children }) => {
  const { isLoading, isAuthenticated, signinRedirect } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      localStorage.setItem(
        "redirectPath",
        location.pathname + location.search,
      );
      signinRedirect();
    }
  }, [isLoading, isAuthenticated, location, signinRedirect]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated) {
    return <p>Redirecting to login...</p>;
  }

  return children;
};

export default ProtectedRoute;
