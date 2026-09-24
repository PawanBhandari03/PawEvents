import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router";
import { LoadingState } from "@/components/states";
import { useLogin } from "@/hooks/use-login";

const LoginPage: React.FC = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const { login } = useLogin();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      login("/dashboard");
    }
  }, [isLoading, isAuthenticated, login]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoadingState label="Redirecting to login" />;
};

export default LoginPage;
