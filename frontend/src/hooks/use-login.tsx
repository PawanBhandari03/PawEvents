import { useCallback } from "react";
import { useAuth } from "react-oidc-context";

// Login / sign-up that return the user to the page they started on
export const useLogin = () => {
  const { signinRedirect } = useAuth();

  const rememberLocation = (path?: string) => {
    const current = window.location.pathname;
    // From a landing page, land on the user's own dashboard after login;
    // from anywhere else (e.g. an event), come back to the same page
    const fallback = ["/", "/organizers"].includes(current)
      ? "/dashboard"
      : current + window.location.search;
    try {
      localStorage.setItem("redirectPath", path ?? fallback);
    } catch {
      // Not critical: the callback falls back to the role's home page
    }
  };

  const login = useCallback(
    (path?: string) => {
      rememberLocation(path);
      return signinRedirect();
    },
    [signinRedirect],
  );

  const signup = useCallback(
    (path?: string) => {
      rememberLocation(path);
      // Keycloak opens its registration form for prompt=create
      return signinRedirect({ prompt: "create" });
    },
    [signinRedirect],
  );

  return { login, signup };
};
