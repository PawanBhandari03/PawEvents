import { FormEvent, ReactNode, useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Check,
  EyeOff,
  Globe,
  Loader2,
  Pencil,
  Plus,
  Ticket,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState, LoadingState } from "@/components/states";
import StatusBadge from "@/components/status-badge";
import {
  CreateEventRequest,
  EventStatusEnum,
  UpdateEventRequest,
} from "@/domain/domain";
import { createEvent, getEvent, updateEvent } from "@/lib/api";
import {
  CURRENCY,
  errorMessage,
  formatDateTime,
  formatPrice,
  fromDateTimeInput,
  toDateTimeInput,
} from "@/lib/format";
import { cn } from "@/lib/utils";

interface TicketTypeData {
  // Undefined until saved on the server; key is only for React lists
  id: string | undefined;
  key: string;
  name: string;
  price: number;
  totalAvailable?: number;
  description: string;
}

interface EventForm {
  name: string;
  venue: string;
  start: string;
  end: string;
  salesStart: string;
  salesEnd: string;
  status: EventStatusEnum;
  ticketTypes: TicketTypeData[];
}

const EMPTY_FORM: EventForm = {
  name: "",
  venue: "",
  start: "",
  end: "",
  salesStart: "",
  salesEnd: "",
  status: EventStatusEnum.DRAFT,
  ticketTypes: [],
};

type TicketDraft = Omit<TicketTypeData, "price" | "totalAvailable"> & {
  price: string;
  totalAvailable: string;
};

const newKey = () => crypto.randomUUID();

const validate = (form: EventForm): string | undefined => {
  if (!form.name.trim()) {
    return "Give your event a name.";
  }
  if (!form.venue.trim()) {
    return "Add the venue so attendees know where to go.";
  }
  if (form.start && form.end && form.end <= form.start) {
    return "The event must end after it starts.";
  }
  if (form.salesStart && form.salesEnd && form.salesEnd <= form.salesStart) {
    return "Ticket sales must close after they open.";
  }
  if (form.ticketTypes.length === 0) {
    return "Add at least one ticket type.";
  }
  return undefined;
};

const Section: React.FC<{
  title: string;
  description: string;
  children: ReactNode;
}> = ({ title, description, children }) => (
  <section className="grid gap-6 border-b py-8 md:grid-cols-[240px_1fr]">
    <div>
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
    <div className="space-y-5">{children}</div>
  </section>
);

const Field: React.FC<{
  id: string;
  label: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}> = ({ id, label, hint, optional, children }) => (
  <div className="space-y-2">
    <Label htmlFor={id}>
      {label}
      {optional && (
        <span className="font-normal text-muted-foreground">(optional)</span>
      )}
    </Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const DashboardManageEventPage: React.FC = () => {
  const { isLoading, user } = useAuth();
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState<EventForm>(EMPTY_FORM);
  const [meta, setMeta] = useState<{ createdAt?: Date; updatedAt?: Date }>({});
  const [isLoaded, setIsLoaded] = useState(!isEditMode);
  const [loadError, setLoadError] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const [ticketDraft, setTicketDraft] = useState<TicketDraft | undefined>();
  const [ticketError, setTicketError] = useState<string | undefined>();

  const accessToken = user?.access_token;

  useEffect(() => {
    if (!isEditMode || isLoading || !accessToken) {
      return;
    }
    getEvent(accessToken, id)
      .then((event) => {
        setForm({
          name: event.name,
          venue: event.venue,
          start: toDateTimeInput(event.start),
          end: toDateTimeInput(event.end),
          salesStart: toDateTimeInput(event.salesStart),
          salesEnd: toDateTimeInput(event.salesEnd),
          status: event.status,
          ticketTypes: event.ticketTypes.map((t) => ({
            id: t.id,
            key: t.id,
            name: t.name,
            price: t.price,
            totalAvailable: t.totalAvailable,
            description: t.description ?? "",
          })),
        });
        setMeta({ createdAt: event.createdAt, updatedAt: event.updatedAt });
        setIsLoaded(true);
      })
      .catch((err) => setLoadError(errorMessage(err)));
  }, [isEditMode, isLoading, accessToken, id]);

  const update = <K extends keyof EventForm>(key: K, value: EventForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Ticket type dialog
  const openTicketDialog = (ticket?: TicketTypeData) => {
    setTicketError(undefined);
    setTicketDraft(
      ticket
        ? {
            ...ticket,
            price: String(ticket.price),
            totalAvailable:
              ticket.totalAvailable !== undefined &&
              ticket.totalAvailable !== null
                ? String(ticket.totalAvailable)
                : "",
          }
        : {
            id: undefined,
            key: newKey(),
            name: "",
            price: "",
            totalAvailable: "",
            description: "",
          },
    );
  };

  const saveTicketType = () => {
    if (!ticketDraft) {
      return;
    }
    const price = Number(ticketDraft.price);
    const total =
      ticketDraft.totalAvailable === ""
        ? undefined
        : Number(ticketDraft.totalAvailable);

    if (!ticketDraft.name.trim()) {
      setTicketError("Name the ticket type, e.g. General Admission.");
      return;
    }
    if (ticketDraft.price === "" || Number.isNaN(price) || price < 0) {
      setTicketError("Enter a price of 0 or more (0 makes it free).");
      return;
    }
    if (total !== undefined && (!Number.isInteger(total) || total < 1)) {
      setTicketError("Quantity must be a whole number of at least 1.");
      return;
    }

    const saved: TicketTypeData = {
      id: ticketDraft.id,
      key: ticketDraft.key,
      name: ticketDraft.name.trim(),
      description: ticketDraft.description.trim(),
      price,
      totalAvailable: total,
    };
    setForm((prev) => {
      const exists = prev.ticketTypes.some((t) => t.key === saved.key);
      return {
        ...prev,
        ticketTypes: exists
          ? prev.ticketTypes.map((t) => (t.key === saved.key ? saved : t))
          : [...prev.ticketTypes, saved],
      };
    });
    setTicketDraft(undefined);
  };

  const removeTicketType = (key: string) =>
    update(
      "ticketTypes",
      form.ticketTypes.filter((t) => t.key !== key),
    );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      return;
    }
    const problem = validate(form);
    if (problem) {
      setError(problem);
      return;
    }
    setError(undefined);
    setIsSaving(true);

    const common = {
      name: form.name.trim(),
      venue: form.venue.trim(),
      start: fromDateTimeInput(form.start),
      end: fromDateTimeInput(form.end),
      salesStart: fromDateTimeInput(form.salesStart),
      salesEnd: fromDateTimeInput(form.salesEnd),
      status: form.status,
    };

    try {
      if (isEditMode && id) {
        const request: UpdateEventRequest = {
          ...common,
          id,
          ticketTypes: form.ticketTypes.map((t) => ({
            id: t.id,
            name: t.name,
            price: t.price,
            description: t.description,
            totalAvailable: t.totalAvailable,
          })),
        };
        await updateEvent(accessToken, id, request);
      } else {
        const request: CreateEventRequest = {
          ...common,
          ticketTypes: form.ticketTypes.map((t) => ({
            name: t.name,
            price: t.price,
            description: t.description,
            totalAvailable: t.totalAvailable,
          })),
        };
        await createEvent(accessToken, request);
      }
      navigate("/dashboard/events");
    } catch (err) {
      setError(errorMessage(err));
      setIsSaving(false);
    }
  };

  if (loadError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <ErrorState
          title="Couldn't open this event"
          message={loadError}
          action={
            <Button asChild size="sm" variant="outline">
              <Link to="/dashboard/events">Back to my events</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (!isLoaded) {
    return <LoadingState label="Loading event" />;
  }

  const statusOptions = [
    {
      value: EventStatusEnum.DRAFT,
      title: "Draft",
      body: "Only you can see it. Nothing is on sale.",
      icon: EyeOff,
    },
    {
      value: EventStatusEnum.PUBLISHED,
      title: "Published",
      body: "Listed publicly and tickets can be bought.",
      icon: Globe,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 pb-32 sm:px-6">
      <Link
        to="/dashboard/events"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> My events
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="font-display text-5xl leading-none">
            {isEditMode ? form.name || "Edit event" : "New event"}
          </h1>
          {isEditMode && meta.updatedAt && (
            <p className="mt-3 text-sm text-muted-foreground">
              Created {formatDateTime(meta.createdAt)} · Last saved{" "}
              {formatDateTime(meta.updatedAt)}
            </p>
          )}
        </div>
        {isEditMode && <StatusBadge status={form.status} />}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Section
          title="Basics"
          description="What people see first when browsing events."
        >
          <Field id="event-name" label="Event name">
            <Input
              id="event-name"
              placeholder="e.g. Sunburn Arena, Mumbai"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </Field>
          <Field
            id="event-venue"
            label="Venue"
            hint="Include the address and anything that helps people find it."
          >
            <Textarea
              id="event-venue"
              placeholder="Venue name, street, city"
              className="min-h-24"
              value={form.venue}
              onChange={(e) => update("venue", e.target.value)}
            />
          </Field>
        </Section>

        <Section
          title="Date & time"
          description="Leave empty if the date hasn't been announced yet."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="event-start" label="Starts" optional>
              <Input
                id="event-start"
                type="datetime-local"
                value={form.start}
                onChange={(e) => update("start", e.target.value)}
              />
            </Field>
            <Field id="event-end" label="Ends" optional>
              <Input
                id="event-end"
                type="datetime-local"
                value={form.end}
                min={form.start || undefined}
                onChange={(e) => update("end", e.target.value)}
              />
            </Field>
          </div>
        </Section>

        <Section
          title="Ticket sales"
          description="When tickets can be bought. Leave empty to sell as soon as it's published."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="sales-start" label="Sales open" optional>
              <Input
                id="sales-start"
                type="datetime-local"
                value={form.salesStart}
                onChange={(e) => update("salesStart", e.target.value)}
              />
            </Field>
            <Field id="sales-end" label="Sales close" optional>
              <Input
                id="sales-end"
                type="datetime-local"
                value={form.salesEnd}
                min={form.salesStart || undefined}
                onChange={(e) => update("salesEnd", e.target.value)}
              />
            </Field>
          </div>
        </Section>

        <Section
          title="Tickets"
          description="Offer one or more ticket types, like General and VIP."
        >
          {form.ticketTypes.length === 0 ? (
            <button
              type="button"
              onClick={() => openTicketDialog()}
              className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed py-10 text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              <Ticket className="size-5" />
              Add your first ticket type
            </button>
          ) : (
            <>
              <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                {form.ticketTypes.map((ticket) => (
                  <li key={ticket.key} className="flex items-center gap-4 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{ticket.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {ticket.totalAvailable
                          ? `${ticket.totalAvailable.toLocaleString("en-IN")} available`
                          : "Unlimited"}
                        {ticket.description && ` · ${ticket.description}`}
                      </p>
                    </div>
                    <span className="font-semibold tabular-nums">
                      {formatPrice(ticket.price)}
                    </span>
                    <div className="flex">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${ticket.name}`}
                        onClick={() => openTicketDialog(ticket)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${ticket.name}`}
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeTicketType(ticket.key)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                variant="outline"
                onClick={() => openTicketDialog()}
              >
                <Plus /> Add ticket type
              </Button>
              {isEditMode && (
                <p className="text-xs text-muted-foreground">
                  Removing a ticket type also cancels any tickets already sold
                  for it.
                </p>
              )}
            </>
          )}
        </Section>

        <Section
          title="Visibility"
          description="You can switch between these at any time."
        >
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
            {statusOptions.map(({ value, title, body, icon: Icon }) => {
              const active = form.status === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => update("status", value)}
                  className={cn(
                    "flex gap-3 rounded-xl border bg-card p-4 text-left transition-colors",
                    active
                      ? "border-foreground ring-1 ring-foreground"
                      : "hover:border-foreground/30",
                  )}
                >
                  <Icon className="mt-0.5 size-4 shrink-0" />
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{title}</span>
                    <span className="block text-sm text-muted-foreground">
                      {body}
                    </span>
                  </span>
                  {active && <Check className="size-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </Section>

        {error && (
          <ErrorState className="mt-8" title="Can't save yet" message={error} />
        )}

        {/* Sticky action bar */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-end gap-3 px-4 py-3 sm:px-6">
            <Button asChild variant="ghost">
              <Link to="/dashboard/events">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="animate-spin" />}
              {isEditMode
                ? "Save changes"
                : form.status === EventStatusEnum.PUBLISHED
                  ? "Publish event"
                  : "Save draft"}
            </Button>
          </div>
        </div>
      </form>

      <Dialog
        open={!!ticketDraft}
        onOpenChange={(open) => !open && setTicketDraft(undefined)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {ticketDraft?.id ||
              form.ticketTypes.some((t) => t.key === ticketDraft?.key)
                ? "Edit ticket type"
                : "New ticket type"}
            </DialogTitle>
            <DialogDescription>
              Prices are in {CURRENCY}. Set 0 for a free ticket.
            </DialogDescription>
          </DialogHeader>
          {ticketDraft && (
            <div className="space-y-4">
              <Field id="ticket-name" label="Name">
                <Input
                  id="ticket-name"
                  placeholder="General Admission, VIP…"
                  value={ticketDraft.name}
                  onChange={(e) =>
                    setTicketDraft({ ...ticketDraft, name: e.target.value })
                  }
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field id="ticket-price" label="Price">
                  <Input
                    id="ticket-price"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0"
                    value={ticketDraft.price}
                    onChange={(e) =>
                      setTicketDraft({ ...ticketDraft, price: e.target.value })
                    }
                  />
                </Field>
                <Field id="ticket-qty" label="Quantity" optional>
                  <Input
                    id="ticket-qty"
                    type="number"
                    min={1}
                    step="1"
                    placeholder="Unlimited"
                    value={ticketDraft.totalAvailable}
                    onChange={(e) =>
                      setTicketDraft({
                        ...ticketDraft,
                        totalAvailable: e.target.value,
                      })
                    }
                  />
                </Field>
              </div>
              <Field id="ticket-description" label="Description" optional>
                <Textarea
                  id="ticket-description"
                  placeholder="What's included?"
                  value={ticketDraft.description}
                  onChange={(e) =>
                    setTicketDraft({
                      ...ticketDraft,
                      description: e.target.value,
                    })
                  }
                />
              </Field>
              {ticketError && (
                <p className="text-sm text-destructive" role="alert">
                  {ticketError}
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTicketDraft(undefined)}>
              Cancel
            </Button>
            <Button onClick={saveTicketType}>Save ticket type</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardManageEventPage;
