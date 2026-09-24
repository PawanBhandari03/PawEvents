import { FormEvent, useRef, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  CameraOff,
  CheckCircle2,
  Keyboard,
  Loader2,
  ScanLine,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/states";
import {
  TicketValidationMethod,
  TicketValidationStatus,
} from "@/domain/domain";
import { validateTicket } from "@/lib/api";
import { errorMessage, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type Mode = "scan" | "manual";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Outcome =
  | { kind: "valid"; id: string }
  | { kind: "used"; id: string }
  | { kind: "error"; id: string; message: string };

interface HistoryEntry {
  outcome: Outcome;
  at: Date;
  method: TicketValidationMethod;
}

const OUTCOME_STYLE = {
  valid: {
    title: "Let them in",
    body: "Valid ticket. It's now marked as used.",
    icon: CheckCircle2,
    panel: "bg-success-soft border-success/40",
    iconColor: "text-success",
  },
  used: {
    title: "Already used",
    body: "This ticket has been checked in before. Don't admit again.",
    icon: XCircle,
    panel: "bg-danger-soft border-destructive/40",
    iconColor: "text-destructive",
  },
  error: {
    title: "Not recognised",
    body: "",
    icon: XCircle,
    panel: "bg-danger-soft border-destructive/40",
    iconColor: "text-destructive",
  },
} as const;

const DashboardValidateQrPage: React.FC = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("scan");
  const [manualId, setManualId] = useState("");
  const [outcome, setOutcome] = useState<Outcome | undefined>();
  const [isChecking, setIsChecking] = useState(false);
  const [cameraError, setCameraError] = useState<string | undefined>();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  // Guards against the scanner firing again while a check is in flight
  const busy = useRef(false);

  const check = async (rawId: string, method: TicketValidationMethod) => {
    const id = rawId.trim();
    if (!id || !user?.access_token || busy.current) {
      return;
    }
    busy.current = true;
    setIsChecking(true);

    let result: Outcome;
    if (!UUID_PATTERN.test(id)) {
      result = {
        kind: "error",
        id,
        message:
          method === TicketValidationMethod.QR_SCAN
            ? "That QR code isn't a ticket from this platform."
            : "That doesn't look like a ticket ID. Check it and try again.",
      };
      setOutcome(result);
      setHistory((prev) =>
        [{ outcome: result, at: new Date(), method }, ...prev].slice(0, 20),
      );
      setIsChecking(false);
      busy.current = false;
      return;
    }
    try {
      const response = await validateTicket(user.access_token, { id, method });
      result =
        response.status === TicketValidationStatus.VALID
          ? { kind: "valid", id }
          : { kind: "used", id };
    } catch (err) {
      const message = errorMessage(err);
      result = {
        kind: "error",
        id,
        message: /not found/i.test(message)
          ? method === TicketValidationMethod.QR_SCAN
            ? "This QR code doesn't belong to any ticket."
            : "No ticket has this ID. Check it and try again."
          : message,
      };
    }

    setOutcome(result);
    setHistory((prev) =>
      [{ outcome: result, at: new Date(), method }, ...prev].slice(0, 20),
    );
    setIsChecking(false);
    busy.current = false;
  };

  const reset = () => {
    setOutcome(undefined);
    setManualId("");
  };

  const handleManual = (e: FormEvent) => {
    e.preventDefault();
    check(manualId, TicketValidationMethod.MANUAL);
  };

  const style = outcome ? OUTCOME_STYLE[outcome.kind] : undefined;
  const admitted = history.filter((h) => h.outcome.kind === "valid").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Door staff"
        title="Check-in"
        description="Scan the QR code on an attendee's ticket, or type in the ticket ID."
        actions={
          <div className="rounded-xl border bg-card px-4 py-2 text-right">
            <p className="text-xs text-muted-foreground">
              Admitted this session
            </p>
            <p className="text-2xl font-semibold tabular-nums">{admitted}</p>
          </div>
        }
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,440px)_1fr]">
        {/* Input side */}
        <div>
          <div
            className="mb-4 grid grid-cols-2 rounded-full border bg-card p-1"
            role="tablist"
          >
            {(
              [
                { value: "scan", label: "Scan QR", icon: ScanLine },
                { value: "manual", label: "Enter ID", icon: Keyboard },
              ] as const
            ).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                onClick={() => {
                  setMode(value);
                  reset();
                }}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-full py-2 text-sm transition-colors",
                  mode === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>

          {mode === "scan" ? (
            <div className="relative aspect-square overflow-hidden rounded-3xl border bg-black">
              {cameraError ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-white/80">
                  <CameraOff className="size-8" />
                  <p className="font-medium text-white">Camera unavailable</p>
                  <p className="text-sm">
                    Allow camera access in your browser, or switch to Enter ID.
                  </p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setCameraError(undefined)}
                  >
                    Try again
                  </Button>
                </div>
              ) : (
                <Scanner
                  paused={!!outcome || isChecking}
                  scanDelay={800}
                  components={{ finder: false }}
                  styles={{
                    container: { width: "100%", height: "100%" },
                    video: { objectFit: "cover" },
                  }}
                  onScan={(codes) => {
                    const value = codes[0]?.rawValue;
                    if (value) {
                      check(value, TicketValidationMethod.QR_SCAN);
                    }
                  }}
                  onError={(err) =>
                    setCameraError(errorMessage(err) || "Camera error")
                  }
                />
              )}
              {/* Viewfinder corners */}
              {!cameraError && (
                <div className="pointer-events-none absolute inset-12">
                  {[
                    "top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl",
                    "top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl",
                    "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl",
                    "bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl",
                  ].map((pos) => (
                    <span
                      key={pos}
                      className={cn("absolute size-10 border-white/90", pos)}
                    />
                  ))}
                </div>
              )}
              {isChecking && (
                <div className="absolute inset-0 grid place-items-center bg-black/50">
                  <Loader2 className="size-8 animate-spin text-white" />
                </div>
              )}
            </div>
          ) : (
            <form
              onSubmit={handleManual}
              className="space-y-4 rounded-3xl border bg-card p-6"
            >
              <label htmlFor="ticket-id" className="text-sm font-medium">
                Ticket ID
              </label>
              <Input
                id="ticket-id"
                autoFocus
                autoComplete="off"
                spellCheck={false}
                placeholder="e.g. 5c64aff8-9ea7-4d91-bc9b-a8fd5bf5289c"
                className="h-12 font-mono"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The ID is printed under the QR code on the attendee's ticket.
              </p>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!manualId.trim() || isChecking}
              >
                {isChecking && <Loader2 className="animate-spin" />}
                Check ticket
              </Button>
            </form>
          )}
        </div>

        {/* Result side */}
        <div className="space-y-6">
          {outcome && style ? (
            <div
              className={cn("rounded-3xl border p-8", style.panel)}
              role="status"
              aria-live="assertive"
            >
              <style.icon className={cn("size-14", style.iconColor)} />
              <h2 className="mt-4 font-display text-5xl">{style.title}</h2>
              <p className="mt-2 text-muted-foreground">
                {outcome.kind === "error" ? outcome.message : style.body}
              </p>
              <p className="mt-4 truncate font-mono text-xs text-muted-foreground">
                {outcome.id}
              </p>
              <Button size="lg" className="mt-6" onClick={reset}>
                {mode === "scan" ? "Scan next" : "Check another"}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed p-12 text-center">
              <ScanLine className="size-8 text-muted-foreground" />
              <p className="mt-3 font-medium">Ready</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "scan"
                  ? "Hold the ticket's QR code inside the frame."
                  : "Enter a ticket ID to check it."}
              </p>
            </div>
          )}

          {history.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                Recent checks
              </h3>
              <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
                {history.map((entry, i) => {
                  const s = OUTCOME_STYLE[entry.outcome.kind];
                  return (
                    <li
                      key={i}
                      className="flex items-center gap-3 px-4 py-3 text-sm"
                    >
                      <s.icon className={cn("size-4 shrink-0", s.iconColor)} />
                      <span className="font-medium">{s.title}</span>
                      <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
                        {entry.outcome.id}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {formatTime(entry.at)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardValidateQrPage;
