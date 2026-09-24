import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { Link, useNavigate } from "react-router";
import { ErrorState, LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";

const CallbackPage: React.FC = () => {
  const { isLoading, isAuthenticated, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || error || !isAuthenticated) {
      return;
    }

    let redirectPath: string | null = null;
    try {
      redirectPath = localStorage.getItem("redirectPath");
      localStorage.removeItem("redirectPath");
    } catch {
      // Fall back to the role's home page
    }

    if (redirectPath && redirectPath !== "/callback") {
      navigate(redirectPath, { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoading, isAuthenticated, error, navigate]);

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-24">
        <ErrorState
          title="We couldn't sign you in"
          message={error.message}
          action={
            <Button asChild size="sm" variant="outline">
              <Link to="/">Back to home</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return <LoadingState label="Signing you in" />;
};

export default CallbackPage;
