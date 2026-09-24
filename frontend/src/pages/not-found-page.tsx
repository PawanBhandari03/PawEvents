import { Button } from "@/components/ui/button";
import { Link } from "react-router";

const NotFoundPage: React.FC = () => (
  <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
    <p className="font-mono text-sm text-brand">404</p>
    <h1 className="mt-2 font-display text-5xl">Page not found</h1>
    <p className="mt-3 text-muted-foreground">
      The page you're looking for doesn't exist or has moved.
    </p>
    <Button asChild className="mt-6">
      <Link to="/">Browse events</Link>
    </Button>
  </div>
);

export default NotFoundPage;
