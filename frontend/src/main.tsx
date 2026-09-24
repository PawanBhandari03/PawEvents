import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AttendeeLandingPage from "./pages/attendee-landing-page.tsx";
import { AuthProvider } from "react-oidc-context";
import { createBrowserRouter, RouterProvider } from "react-router";
import OrganizersLandingPage from "./pages/organizers-landing-page.tsx";
import DashboardManageEventPage from "./pages/dashboard-manage-event-page.tsx";
import LoginPage from "./pages/login-page.tsx";
import ProtectedRoute from "./components/protected-route.tsx";
import CallbackPage from "./pages/callback-page.tsx";
import DashboardListEventsPage from "./pages/dashboard-list-events-page.tsx";
import PublishedEventsPage from "./pages/published-events-page.tsx";
import PurchaseTicketPage from "./pages/purchase-ticket-page.tsx";
import DashboardListTickets from "./pages/dashboard-list-tickets.tsx";
import DashboardPage from "./pages/dashboard-page.tsx";
import DashboardViewTicketPage from "./pages/dashboard-view-ticket-page.tsx";
import DashboardValidateQrPage from "./pages/dashboard-validate-qr-page.tsx";
import NotFoundPage from "./pages/not-found-page.tsx";
import AppLayout from "./components/app-layout.tsx";
import { ThemeProvider } from "./lib/theme.tsx";

const router = createBrowserRouter([
  {
    Component: AppLayout,
    children: [
      { path: "/", Component: AttendeeLandingPage },
      { path: "/callback", Component: CallbackPage },
      { path: "/login", Component: LoginPage },
      { path: "/events/:id", Component: PublishedEventsPage },
      { path: "/organizers", Component: OrganizersLandingPage },
      {
        path: "/events/:eventId/purchase/:ticketTypeId",
        element: (
          <ProtectedRoute roles={["ATTENDEE"]}>
            <PurchaseTicketPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/events",
        element: (
          <ProtectedRoute roles={["ORGANIZER"]}>
            <DashboardListEventsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/events/create",
        element: (
          <ProtectedRoute roles={["ORGANIZER"]}>
            <DashboardManageEventPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/events/update/:id",
        element: (
          <ProtectedRoute roles={["ORGANIZER"]}>
            <DashboardManageEventPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/tickets",
        element: (
          <ProtectedRoute roles={["ATTENDEE"]}>
            <DashboardListTickets />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/tickets/:id",
        element: (
          <ProtectedRoute roles={["ATTENDEE"]}>
            <DashboardViewTicketPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/validate-qr",
        element: (
          <ProtectedRoute roles={["STAFF"]}>
            <DashboardValidateQrPage />
          </ProtectedRoute>
        ),
      },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);

const oidcConfig = {
  authority: "http://localhost:9090/realms/event-ticket-platform",
  client_id: "event-ticket-platform-app",
  redirect_uri: "http://localhost:5173/callback",
  post_logout_redirect_uri: "http://localhost:5173/",
  // Strip ?code=&state= from the URL once the login callback is processed
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider {...oidcConfig}>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
