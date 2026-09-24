import { Outlet } from "react-router";
import NavBar, { Logo } from "./nav-bar";

const AppLayout: React.FC = () => (
  <div className="flex min-h-screen flex-col">
    <NavBar />
    <main className="flex-1">
      <Outlet />
    </main>
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Logo className="text-foreground" />
        <p>© {new Date().getFullYear()} PawEvents. All rights reserved.</p>
      </div>
    </footer>
  </div>
);

export default AppLayout;
