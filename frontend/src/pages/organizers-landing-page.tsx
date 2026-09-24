import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoles } from "@/hooks/use-roles";
import { useLogin } from "@/hooks/use-login";

const STEPS = [
  {
    title: "Create",
    body: "Add your event's name, venue, dates and as many ticket types as you need. Keep it as a draft until it's ready.",
  },
  {
    title: "Sell",
    body: "Publish and it's listed straight away. Set when sales open and close, cap each ticket type, or leave it unlimited.",
  },
  {
    title: "Check in",
    body: "Every ticket carries a unique QR code. Door staff scan it on their phone, and a ticket can't be used twice.",
  },
];

const OrganizersLandingPage: React.FC = () => {
  const { persona } = useRoles();
  const { login } = useLogin();

  const primaryAction =
    persona === "organizer" ? (
      <Button asChild size="lg">
        <Link to="/dashboard/events/create">
          Create an event <ArrowRight />
        </Link>
      </Button>
    ) : persona === "guest" ? (
      <Button size="lg" onClick={() => login("/dashboard")}>
        Organizer log in <ArrowRight />
      </Button>
    ) : undefined;

  return (
    <>
      <section className="border-b">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-4 text-xs font-medium tracking-[0.14em] text-brand uppercase">
              For organizers
            </p>
            <h1 className="font-display text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
              Sell out your <em className="text-brand">next event.</em>
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              Set up events, sell tickets and let people in at the door, all
              without spreadsheets.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {primaryAction}
              <Button asChild size="lg" variant="outline">
                <Link to="/">See live events</Link>
              </Button>
            </div>
            {persona === "guest" && (
              <p className="mt-4 text-sm text-muted-foreground">
                Organizer accounts are set up by the platform team.
              </p>
            )}
            {(persona === "attendee" || persona === "staff") && (
              <p className="mt-4 text-sm text-muted-foreground">
                Your account can't create events. Ask the platform team for
                organizer access.
              </p>
            )}
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
            <img
              src="/organizers-landing-hero.png"
              alt="A crowd at a concert"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="max-w-md text-2xl font-semibold tracking-tight">
          From first draft to the last guest through the door
        </h2>
        <ol className="mt-10 grid gap-10 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="border-t pt-6">
              <span className="font-display text-5xl text-brand">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
};

export default OrganizersLandingPage;
