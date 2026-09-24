import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, CalendarDays, Check, Info, MapPin } from "lucide-react";
import EventImage from "@/components/event-image";
import { Button } from "@/components/ui/button";
import { ErrorState, LoadingState } from "@/components/states";
import {
  PublishedEventDetails,
  PublishedEventTicketTypeDetails,
} from "@/domain/domain";
import { getPublishedEvent } from "@/lib/api";
import {
  errorMessage,
  formatDateTime,
  formatEventWhen,
  formatPrice,
} from "@/lib/format";
import { useRoles } from "@/hooks/use-roles";
import { useLogin } from "@/hooks/use-login";
import { cn } from "@/lib/utils";

const PublishedEventsPage: React.FC = () => {
  const { id } = useParams();
  const { persona } = useRoles();
  const { login } = useLogin();

  const [error, setError] = useState<string | undefined>();
  const [event, setEvent] = useState<PublishedEventDetails | undefined>();
  const [selected, setSelected] = useState<
    PublishedEventTicketTypeDetails | undefined
  >();

  useEffect(() => {
    if (!id) {
      return;
    }
    const load = async () => {
      try {
        const data = await getPublishedEvent(id);
        setEvent(data);
        setSelected(data.ticketTypes[0]);
      } catch (err) {
        setError(errorMessage(err));
      }
    };
    load();
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <ErrorState
          title="Event not available"
          message="This event may have been removed or isn't on sale any more."
          action={
            <Button asChild size="sm" variant="outline">
              <Link to="/">Browse events</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (!event) {
    return <LoadingState label="Loading event" />;
  }

  const purchasePath = selected
    ? `/events/${event.id}/purchase/${selected.id}`
    : undefined;

  const now = new Date();
  const salesNotOpen = !!event.salesStart && now < new Date(event.salesStart);
  const salesClosed = !!event.salesEnd && now > new Date(event.salesEnd);

  const renderAction = () => {
    if (salesNotOpen) {
      return (
        <Button disabled className="w-full" size="lg">
          On sale {formatDateTime(event.salesStart)}
        </Button>
      );
    }
    if (salesClosed) {
      return (
        <Button disabled className="w-full" size="lg">
          Sales closed
        </Button>
      );
    }
    if (!selected || !purchasePath) {
      return (
        <Button disabled className="w-full" size="lg">
          Tickets unavailable
        </Button>
      );
    }
    switch (persona) {
      case "attendee":
        return (
          <Button asChild className="w-full" size="lg">
            <Link to={purchasePath}>Continue to checkout</Link>
          </Button>
        );
      case "guest":
        return (
          <Button className="w-full" size="lg" onClick={() => login()}>
            Log in to buy
          </Button>
        );
      default:
        return (
          <div className="flex gap-2 rounded-lg bg-secondary p-3 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" />
            You're signed in as{" "}
            {persona === "organizer" ? "an organizer" : "door staff"}. Tickets
            can only be bought with an attendee account.
          </div>
        );
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All events
      </Link>

      <div className="aspect-[16/7] overflow-hidden rounded-3xl bg-muted">
        <EventImage seed={event.id} alt="" />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <h1 className="font-display text-5xl leading-none sm:text-6xl">
            {event.name}
          </h1>
          <dl className="mt-6 space-y-3">
            <div className="flex gap-3">
              <dt className="sr-only">When</dt>
              <CalendarDays className="mt-0.5 size-5 shrink-0 text-brand" />
              <dd>{formatEventWhen(event.start, event.end)}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="sr-only">Where</dt>
              <MapPin className="mt-0.5 size-5 shrink-0 text-brand" />
              <dd className="whitespace-pre-line">{event.venue}</dd>
            </div>
          </dl>

          <h2 className="mt-12 mb-4 text-lg font-semibold">Choose a ticket</h2>
          {event.ticketTypes.length === 0 ? (
            <p className="text-muted-foreground">
              No tickets have been released for this event yet.
            </p>
          ) : (
            <div className="space-y-3" role="radiogroup" aria-label="Tickets">
              {event.ticketTypes.map((ticketType) => {
                const isSelected = selected?.id === ticketType.id;
                return (
                  <button
                    key={ticketType.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelected(ticketType)}
                    className={cn(
                      "flex w-full items-start gap-4 rounded-2xl border bg-card p-5 text-left transition-colors",
                      isSelected
                        ? "border-foreground ring-1 ring-foreground"
                        : "hover:border-foreground/30",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border",
                        isSelected &&
                          "border-foreground bg-foreground text-background",
                      )}
                    >
                      {isSelected && <Check className="size-3" />}
                    </span>
                    <span className="flex-1">
                      <span className="flex items-baseline justify-between gap-4">
                        <span className="font-semibold">{ticketType.name}</span>
                        <span className="font-semibold tabular-nums">
                          {formatPrice(ticketType.price)}
                        </span>
                      </span>
                      {ticketType.description && (
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {ticketType.description}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">Your selection</p>
            <p className="mt-1 text-lg font-semibold">
              {selected?.name ?? "No ticket selected"}
            </p>
            <div className="my-5 flex items-baseline justify-between border-y py-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-3xl font-semibold tabular-nums">
                {formatPrice(selected?.price)}
              </span>
            </div>
            {renderAction()}
            {event.salesEnd && !salesClosed && !salesNotOpen && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Sales close {formatDateTime(event.salesEnd)}
              </p>
            )}
            {persona === "attendee" && !salesClosed && !salesNotOpen && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Your ticket and QR code appear in My tickets.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PublishedEventsPage;
