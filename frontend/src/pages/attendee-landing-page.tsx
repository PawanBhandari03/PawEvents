import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, CalendarX, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublishedEventSummary, SpringBootPagination } from "@/domain/domain";
import { listPublishedEvents, searchPublishedEvents } from "@/lib/api";
import { errorMessage } from "@/lib/format";
import EventCard from "@/components/event-card";
import { SimplePagination } from "@/components/simple-pagination";
import { EmptyState, ErrorState } from "@/components/states";
import { useRoles } from "@/hooks/use-roles";

const PERSONA_CTA = {
  organizer: { to: "/dashboard/events", label: "Manage your events" },
  staff: { to: "/dashboard/validate-qr", label: "Open check-in" },
  attendee: { to: "/dashboard/tickets", label: "View my tickets" },
} as const;

const EventGridSkeleton: React.FC = () => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="overflow-hidden rounded-2xl border bg-card">
        <div className="aspect-[4/3] animate-pulse bg-muted" />
        <div className="space-y-2 p-4">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      </div>
    ))}
  </div>
);

const AttendeeLandingPage: React.FC = () => {
  const { persona } = useRoles();

  const [page, setPage] = useState(0);
  const [events, setEvents] = useState<
    SpringBootPagination<PublishedEventSummary> | undefined
  >();
  const [error, setError] = useState<string | undefined>();
  const [isFetching, setIsFetching] = useState(true);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");

  const load = useCallback(async (searchTerm: string, pageNumber: number) => {
    setIsFetching(true);
    setError(undefined);
    try {
      setEvents(
        searchTerm
          ? await searchPublishedEvents(searchTerm, pageNumber)
          : await listPublishedEvents(pageNumber),
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    load(activeQuery, page);
  }, [load, activeQuery, page]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setPage(0);
    setActiveQuery(query.trim());
  };

  const clearSearch = () => {
    setQuery("");
    setPage(0);
    setActiveQuery("");
  };

  const cta = persona === "guest" ? undefined : PERSONA_CTA[persona];

  return (
    <>
      {/* Hero */}
      <section className="border-b">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="mb-4 text-xs font-medium tracking-[0.14em] text-brand uppercase">
              Live music · Talks · Festivals
            </p>
            <h1 className="font-display text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
              Find your next <em className="text-brand">night out.</em>
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              Browse what's on, grab a ticket in a few taps, and walk in with a
              QR code on your phone.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-8 flex max-w-lg items-center gap-2 rounded-full border bg-card p-1.5 pl-5 shadow-sm focus-within:ring-[3px] focus-within:ring-ring/40"
              role="search"
            >
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by event or venue"
                aria-label="Search events"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <Button type="submit" className="rounded-full px-5">
                Search
              </Button>
            </form>

            {cta && (
              <Link
                to={cta.to}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
              >
                {cta.label} <ArrowRight className="size-4" />
              </Link>
            )}
          </div>

          <div className="relative hidden lg:block">
            <div className="aspect-[5/4] overflow-hidden rounded-3xl">
              <img
                src="/organizers-landing-hero.png"
                alt="A crowd at a live concert"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 rounded-2xl border bg-card px-5 py-4 shadow-lg shadow-black/5">
              <p className="text-xs text-muted-foreground">Entry</p>
              <p className="font-semibold">Scan &amp; go</p>
            </div>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {activeQuery ? `Results for “${activeQuery}”` : "Upcoming events"}
            </h2>
            {events && !isFetching && (
              <p className="mt-1 text-sm text-muted-foreground">
                {events.totalElements}{" "}
                {events.totalElements === 1 ? "event" : "events"}
              </p>
            )}
          </div>
          {activeQuery && (
            <Button variant="outline" size="sm" onClick={clearSearch}>
              <X /> Clear search
            </Button>
          )}
        </div>

        {error ? (
          <ErrorState
            title="Couldn't load events"
            message={error}
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => load(activeQuery, page)}
              >
                Try again
              </Button>
            }
          />
        ) : isFetching && !events ? (
          <EventGridSkeleton />
        ) : events && events.content.length > 0 ? (
          <>
            <div
              className={`grid gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-4 ${isFetching ? "opacity-60" : ""}`}
            >
              {events.content.map((event) => (
                <EventCard event={event} key={event.id} />
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <SimplePagination pagination={events} onPageChange={setPage} />
            </div>
          </>
        ) : (
          <EmptyState
            icon={<CalendarX />}
            title={activeQuery ? "No matching events" : "No events yet"}
            description={
              activeQuery
                ? "Try a different name or venue."
                : "Nothing is on sale right now. Check back soon."
            }
            action={
              persona === "organizer" ? (
                <Button asChild>
                  <Link to="/dashboard/events/create">Create an event</Link>
                </Button>
              ) : undefined
            }
          />
        )}
      </section>

      {/* Organizer pitch, only for people who aren't signed in */}
      {persona === "guest" && (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="flex flex-col gap-6 rounded-3xl bg-primary px-8 py-10 text-primary-foreground dark:border dark:bg-card dark:text-card-foreground sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl">
                Hosting an event?
              </h2>
              <p className="mt-2 max-w-md opacity-75">
                Publish it, sell tickets and check guests in at the door, all in
                one place.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <Link to="/organizers">
                For organizers <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      )}
    </>
  );
};

export default AttendeeLandingPage;
