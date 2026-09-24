import { useMemo } from "react";
import { useAuth } from "react-oidc-context";
import { jwtDecode } from "jwt-decode";

export type Role = "ORGANIZER" | "STAFF" | "ATTENDEE";

// The four kinds of visitor the UI adapts to
export type Persona = "guest" | "organizer" | "staff" | "attendee";

interface UseRolesReturn {
  isLoading: boolean;
  roles: string[];
  isOrganizer: boolean;
  isAttendee: boolean;
  isStaff: boolean;
  persona: Persona;
}

interface JwtPayload {
  realm_access?: {
    roles?: string[];
  };
}

const parseRoles = (accessToken: string | undefined): string[] => {
  if (!accessToken) {
    return [];
  }
  try {
    const payload = jwtDecode<JwtPayload>(accessToken);
    return (payload.realm_access?.roles || []).filter((role) =>
      role.startsWith("ROLE_"),
    );
  } catch (error) {
    console.error("Error parsing JWT: " + error);
    return [];
  }
};

export const useRoles = (): UseRolesReturn => {
  const { isLoading, isAuthenticated, user } = useAuth();
  const accessToken = user?.access_token;

  return useMemo(() => {
    const roles = parseRoles(accessToken);
    const isOrganizer = roles.includes("ROLE_ORGANIZER");
    const isStaff = roles.includes("ROLE_STAFF");
    const isAttendee = roles.includes("ROLE_ATTENDEE");

    let persona: Persona = "guest";
    if (isAuthenticated) {
      if (isOrganizer) {
        persona = "organizer";
      } else if (isStaff) {
        persona = "staff";
      } else {
        persona = "attendee";
      }
    }

    return { isLoading, roles, isOrganizer, isAttendee, isStaff, persona };
  }, [isLoading, isAuthenticated, accessToken]);
};
