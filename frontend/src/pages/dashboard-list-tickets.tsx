import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link } from "react-router";
import { ArrowUpRight, MapPin, Ticket } from "lucide-react";
import { SimplePagination } from "@/components/simple-pagination";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "@/components/states";
import StatusBadge from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { SpringBootPagination, TicketSummary } from "@/domain/domain";
import { listTickets } from "@/lib/api";
import {
  dateBlock,
  errorMessage,
  formatEventWhen,
  formatPrice,
} from "@/lib/format";

const TicketStub: React.FC<{ ticket: TicketSummary }> = ({ ticket }) => {
  const block = dateBlock(ticket.eventStart);

  return (
    <Link
      to={`/dashboard/tickets/${ticket.id}`}
      className="group flex overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30"
    >
      {/* Date column */}
      <div className="flex w-20 shrink-0 flex-col items-center justify-center border-r-2 border-dashed bg-brand-soft px-2 text-brand sm:w-24">
        {block ? (
          <>
            <span className="text-xs font-semibold tracking-wider">
              {block.month}
            </span>
            <span className="font-display text-4xl leading-none">
              {block.day}
            </span>
          </>
        ) : (
          <Ticket className="size-6" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="truncate font-semibold">{ticket.eventName}</h3>
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
        <p className="text-sm text-muted-foreground">
          {formatEventWhen(ticket.eventStart, ticket.eventEnd)}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{ticket.eventVenue}</span>
        </p>
        <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3 text-sm">
          <span>
            {ticket.ticketType.name}
            <span className="text-muted-foreground">
              {" "}
              · {formatPrice(ticket.ticketType.price)}
            </span>
          </span>
          <StatusBadge
            status={ticket.status}
            label={ticket.status === "PURCHASED" ? "Active" : undefined}
          />
        </div>
      </div>
    </Link>
  );
};

const DashboardListTickets: React.FC = () => {
  const { isLoading, user } = useAuth();

  const [tickets, setTickets] = useState<
    SpringBootPagination<TicketSummary> | undefined
  >();
  const [error, setError] = useState<string | undefined>();
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (isLoading || !user?.access_token) {
      return;
    }
    listTickets(user.access_token, page)
      .then(setTickets)
      .catch((err) => setError(errorMessage(err)));
  }, [isLoading, user?.access_token, page]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Attendee"
        title="My tickets"
        description="Open a ticket to show its QR code at the entrance."
      />

      <div className="mt-8">
        {error ? (
          <ErrorState title="Couldn't load your tickets" message={error} />
        ) : !tickets ? (
          <LoadingState label="Loading tickets" />
        ) : tickets.content.length === 0 ? (
          <EmptyState
            icon={<Ticket />}
            title="No tickets yet"
            description="When you buy a ticket it shows up here, ready to scan at the door."
            action={
              <Button asChild>
                <Link to="/">Find an event</Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {tickets.content.map((ticket) => (
                <TicketStub key={ticket.id} ticket={ticket} />
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <SimplePagination pagination={tickets} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardListTickets;
