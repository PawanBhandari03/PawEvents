import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link, useParams } from "react-router";
import { ArrowLeft, CalendarDays, Check, Copy, MapPin } from "lucide-react";
import { TicketDetails } from "@/domain/domain";
import { getTicket, getTicketQr } from "@/lib/api";
import { errorMessage, formatEventWhen, formatPrice } from "@/lib/format";
import { ErrorState, LoadingState } from "@/components/states";
import StatusBadge from "@/components/status-badge";
import { Button } from "@/components/ui/button";

const DashboardViewTicketPage: React.FC = () => {
  const { id } = useParams();
  const { isLoading, user } = useAuth();

  const [ticket, setTicket] = useState<TicketDetails | undefined>();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [qrError, setQrError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isLoading || !user?.access_token || !id) {
      return;
    }
    const accessToken = user.access_token;
    let objectUrl: string | undefined;
    let cancelled = false;

    const load = async () => {
      try {
        const details = await getTicket(accessToken, id);
        if (!cancelled) {
          setTicket(details);
        }
      } catch (err) {
        if (!cancelled) {
          setError(errorMessage(err));
        }
        return;
      }
      try {
        objectUrl = URL.createObjectURL(await getTicketQr(accessToken, id));
        if (!cancelled) {
          setQrCodeUrl(objectUrl);
        }
      } catch {
        if (!cancelled) {
          setQrError(true);
        }
      }
    };
    load();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [isLoading, user?.access_token, id]);

  const copyId = async () => {
    if (!ticket) {
      return;
    }
    try {
      await navigator.clipboard.writeText(ticket.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked; the ID is still visible to copy by hand
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <ErrorState
          title="Ticket not found"
          message={error}
          action={
            <Button asChild size="sm" variant="outline">
              <Link to="/dashboard/tickets">Back to my tickets</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (!ticket) {
    return <LoadingState label="Loading ticket" />;
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Link
        to="/dashboard/tickets"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> My tickets
      </Link>

      <article className="overflow-hidden rounded-3xl border bg-card shadow-xl shadow-black/5 dark:shadow-black/40">
        {/* Top of the stub */}
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-[0.14em] text-brand uppercase">
              Admit one
            </span>
            <StatusBadge
              status={ticket.status}
              label={ticket.status === "PURCHASED" ? "Active" : undefined}
            />
          </div>
          <h1 className="font-display text-4xl leading-tight">
            {ticket.eventName}
          </h1>
          <div className="space-y-2 text-sm">
            <p className="flex gap-2">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              {formatEventWhen(ticket.eventStart, ticket.eventEnd)}
            </p>
            <p className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span className="whitespace-pre-line">{ticket.eventVenue}</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-secondary p-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Ticket</p>
              <p className="font-medium">{ticket.ticketTypeName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="font-medium tabular-nums">
                {formatPrice(ticket.price)}
              </p>
            </div>
          </div>
        </div>

        <div className="perforation" aria-hidden />

        {/* QR half */}
        <div className="flex flex-col items-center p-6">
          {/* QR stays black-on-white in both themes so scanners can read it */}
          <div className="grid size-56 place-items-center rounded-2xl bg-white p-3">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="Entry QR code"
                className="h-full w-full [image-rendering:pixelated]"
              />
            ) : qrError ? (
              <p className="px-4 text-center text-sm text-neutral-500">
                QR code unavailable. Staff can check you in with the ticket ID
                below.
              </p>
            ) : (
              <div className="size-full animate-pulse rounded-lg bg-neutral-100" />
            )}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Show this code at the entrance
          </p>

          <button
            type="button"
            onClick={copyId}
            className="mt-5 flex max-w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors hover:bg-accent"
            title="Copy ticket ID"
          >
            <span className="min-w-0">
              <span className="block text-[11px] text-muted-foreground">
                Ticket ID
              </span>
              <span className="block truncate font-mono text-xs">
                {ticket.id}
              </span>
            </span>
            {copied ? (
              <Check className="size-4 shrink-0 text-success" />
            ) : (
              <Copy className="size-4 shrink-0 text-muted-foreground" />
            )}
          </button>
        </div>
      </article>
    </div>
  );
};

export default DashboardViewTicketPage;
