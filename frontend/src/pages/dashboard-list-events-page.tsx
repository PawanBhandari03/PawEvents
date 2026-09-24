import { useCallback, useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link } from "react-router";
import {
  CalendarDays,
  CalendarPlus,
  ExternalLink,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { SimplePagination } from "@/components/simple-pagination";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "@/components/states";
import StatusBadge from "@/components/status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EventStatusEnum,
  EventSummary,
  SpringBootPagination,
} from "@/domain/domain";
import { deleteEvent, listEvents } from "@/lib/api";
import {
  dateBlock,
  errorMessage,
  formatEventWhen,
  formatPrice,
  formatShortDate,
} from "@/lib/format";

const priceRange = (event: EventSummary): string => {
  const prices = event.ticketTypes.map((t) => t.price);
  if (prices.length === 0) {
    return "No tickets";
  }
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max
    ? formatPrice(min)
    : `${formatPrice(min)} – ${formatPrice(max)}`;
};

const capacity = (event: EventSummary): string => {
  const total = event.ticketTypes.reduce(
    (sum, t) => sum + (t.totalAvailable ?? 0),
    0,
  );
  return total > 0 ? `${total.toLocaleString("en-IN")} capacity` : "";
};

const EventRow: React.FC<{
  event: EventSummary;
  onDelete: (event: EventSummary) => void;
}> = ({ event, onDelete }) => {
  const block = dateBlock(event.start);
  const isPublished = event.status === EventStatusEnum.PUBLISHED;

  return (
    <li className="flex gap-4 p-4 transition-colors hover:bg-accent/40 sm:gap-5 sm:p-5">
      <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl border bg-background">
        {block ? (
          <>
            <span className="text-[10px] font-semibold tracking-wider text-brand">
              {block.month}
            </span>
            <span className="text-lg leading-tight font-semibold">
              {block.day}
            </span>
          </>
        ) : (
          <CalendarDays className="size-5 text-muted-foreground" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/dashboard/events/update/${event.id}`}
            className="truncate font-semibold hover:underline"
          >
            {event.name}
          </Link>
          <StatusBadge status={event.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatEventWhen(event.start, event.end)}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            <span className="max-w-56 truncate">{event.venue}</span>
          </span>
          <span>
            {event.ticketTypes.length}{" "}
            {event.ticketTypes.length === 1 ? "ticket type" : "ticket types"} ·{" "}
            {priceRange(event)}
          </span>
          {capacity(event) && <span>{capacity(event)}</span>}
          {(event.salesStart || event.salesEnd) && (
            <span>
              {event.salesStart && event.salesEnd
                ? `On sale ${formatShortDate(event.salesStart)} – ${formatShortDate(event.salesEnd)}`
                : event.salesStart
                  ? `On sale from ${formatShortDate(event.salesStart)}`
                  : `Sales close ${formatShortDate(event.salesEnd)}`}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-start gap-1">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="hidden sm:inline-flex"
        >
          <Link to={`/dashboard/events/update/${event.id}`}>
            <Pencil /> Edit
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="More actions">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild className="sm:hidden">
              <Link to={`/dashboard/events/update/${event.id}`}>
                <Pencil /> Edit
              </Link>
            </DropdownMenuItem>
            {isPublished && (
              <DropdownMenuItem asChild>
                <Link to={`/events/${event.id}`}>
                  <ExternalLink /> View public page
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(event)}
            >
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
};

const DashboardListEventsPage: React.FC = () => {
  const { isLoading, user } = useAuth();
  const [events, setEvents] = useState<
    SpringBootPagination<EventSummary> | undefined
  >();
  const [error, setError] = useState<string | undefined>();
  const [page, setPage] = useState(0);

  const [eventToDelete, setEventToDelete] = useState<
    EventSummary | undefined
  >();
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);

  const accessToken = user?.access_token;

  const refresh = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    try {
      setEvents(await listEvents(accessToken, page));
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [accessToken, page]);

  useEffect(() => {
    if (!isLoading) {
      refresh();
    }
  }, [isLoading, refresh]);

  const handleDelete = async () => {
    if (!eventToDelete || !accessToken) {
      return;
    }
    setIsDeleting(true);
    setDeleteError(undefined);
    try {
      await deleteEvent(accessToken, eventToDelete.id);
      setEventToDelete(undefined);
      await refresh();
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const newEventButton = (
    <Button asChild>
      <Link to="/dashboard/events/create">
        <Plus /> New event
      </Link>
    </Button>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Organizer"
        title="My events"
        description="Drafts are only visible to you. Publish an event to put its tickets on sale."
        actions={newEventButton}
      />

      <div className="mt-8">
        {error ? (
          <ErrorState title="Couldn't load your events" message={error} />
        ) : !events ? (
          <LoadingState label="Loading events" />
        ) : events.content.length === 0 ? (
          <EmptyState
            icon={<CalendarPlus />}
            title="Create your first event"
            description="Add the details and ticket types, then publish it when you're ready to sell."
            action={newEventButton}
          />
        ) : (
          <>
            <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
              {events.content.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  onDelete={(e) => {
                    setDeleteError(undefined);
                    setEventToDelete(e);
                  }}
                />
              ))}
            </ul>
            <div className="mt-8 flex justify-center">
              <SimplePagination pagination={events} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <AlertDialog
        open={!!eventToDelete}
        onOpenChange={(open) => !open && setEventToDelete(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{eventToDelete?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              The event, its ticket types and any tickets already sold will be
              removed. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <ErrorState title="Couldn't delete" message={deleteError} />
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              {isDeleting ? "Deleting…" : "Delete event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardListEventsPage;
