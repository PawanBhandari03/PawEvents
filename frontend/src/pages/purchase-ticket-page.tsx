import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorState, LoadingState } from "@/components/states";
import EventImage from "@/components/event-image";
import { PublishedEventDetails } from "@/domain/domain";
import { getPublishedEvent, purchaseTicket } from "@/lib/api";
import { errorMessage, formatEventWhen, formatPrice } from "@/lib/format";

// Groups digits as "1234 5678 9012 3456"
const formatCardNumber = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2
    ? `${digits.slice(0, 2)}/${digits.slice(2)}`
    : digits;
};

const PurchaseTicketPage: React.FC = () => {
  const { eventId, ticketTypeId } = useParams();
  const { user } = useAuth();

  const [event, setEvent] = useState<PublishedEventDetails | undefined>();
  const [loadError, setLoadError] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  useEffect(() => {
    if (!eventId) {
      return;
    }
    getPublishedEvent(eventId)
      .then(setEvent)
      .catch((err) => setLoadError(errorMessage(err)));
  }, [eventId]);

  const ticketType = event?.ticketTypes.find((t) => t.id === ticketTypeId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.access_token || !eventId || !ticketTypeId) {
      return;
    }
    setError(undefined);
    setIsSubmitting(true);
    try {
      await purchaseTicket(user.access_token, eventId, ticketTypeId);
      setIsSuccess(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadError || (event && !ticketType)) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <ErrorState
          title="This ticket isn't available"
          message="The event or ticket type may have been removed."
          action={
            <Button asChild size="sm" variant="outline">
              <Link to="/">Browse events</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (!event || !ticketType) {
    return <LoadingState label="Preparing checkout" />;
  }

  if (isSuccess) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <div className="grid size-14 place-items-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="size-7" />
        </div>
        <h1 className="mt-6 font-display text-5xl">You're going!</h1>
        <p className="mt-3 text-muted-foreground">
          Your <span className="text-foreground">{ticketType.name}</span> ticket
          for <span className="text-foreground">{event.name}</span> is ready.
          Show its QR code at the entrance.
        </p>
        <div className="mt-8 flex gap-3">
          <Button asChild>
            <Link to="/dashboard/tickets">View my tickets</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Browse more</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link
        to={`/events/${event.id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to event
      </Link>
      <h1 className="font-display text-5xl">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border bg-card p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Payment details</h2>
            <span className="rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-medium text-warning">
              Demo checkout
            </span>
          </div>
          <p className="-mt-2 text-sm text-muted-foreground">
            No payment is taken. Don't enter real card details. Any values will
            do.
          </p>

          <div className="space-y-2">
            <Label htmlFor="card-number">Card number</Label>
            <div className="relative">
              <CreditCard className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="card-number"
                inputMode="numeric"
                autoComplete="off"
                placeholder="4242 4242 4242 4242"
                className="pl-10 font-mono"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(formatCardNumber(e.target.value))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="card-name">Name on card</Label>
            <Input
              id="card-name"
              autoComplete="off"
              placeholder="Full name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="card-expiry">Expiry</Label>
              <Input
                id="card-expiry"
                inputMode="numeric"
                autoComplete="off"
                placeholder="MM/YY"
                className="font-mono"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-cvc">CVC</Label>
              <Input
                id="card-cvc"
                inputMode="numeric"
                autoComplete="off"
                placeholder="123"
                className="font-mono"
                value={cvc}
                onChange={(e) =>
                  setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
              />
            </div>
          </div>

          {error && <ErrorState title="Payment failed" message={error} />}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Lock />}
            {isSubmitting
              ? "Processing…"
              : `Pay ${formatPrice(ticketType.price)}`}
          </Button>
        </form>

        <aside className="h-fit overflow-hidden rounded-2xl border bg-card">
          <div className="aspect-[16/9] bg-muted">
            <EventImage seed={event.id} />
          </div>
          <div className="space-y-4 p-6">
            <div>
              <p className="font-semibold">{event.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatEventWhen(event.start, event.end)}
              </p>
              <p className="text-sm text-muted-foreground">{event.venue}</p>
            </div>
            <div className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  1 × {ticketType.name}
                </span>
                <span className="tabular-nums">
                  {formatPrice(ticketType.price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fees</span>
                <span>None</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between border-t pt-4">
              <span className="font-medium">Total</span>
              <span className="text-2xl font-semibold tabular-nums">
                {formatPrice(ticketType.price)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PurchaseTicketPage;
