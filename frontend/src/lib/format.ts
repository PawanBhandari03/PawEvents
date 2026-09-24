import { format, isSameDay } from "date-fns";

// Backend dates are LocalDateTime strings ("2026-12-01T19:00:00"), which the
// browser parses as local time.
type DateInput = Date | string | undefined | null;

const toDate = (value: DateInput): Date | undefined => {
  if (!value) {
    return undefined;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const CURRENCY = "INR";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export const formatPrice = (price: number | undefined | null): string => {
  if (price === undefined || price === null || Number.isNaN(price)) {
    return "—";
  }
  return price === 0 ? "Free" : currencyFormatter.format(price);
};

export const formatDate = (value: DateInput): string => {
  const date = toDate(value);
  return date ? format(date, "EEE, d MMM yyyy") : "Date TBA";
};

export const formatShortDate = (value: DateInput): string => {
  const date = toDate(value);
  return date ? format(date, "d MMM yyyy") : "TBA";
};

export const formatTime = (value: DateInput): string => {
  const date = toDate(value);
  return date ? format(date, "h:mm a") : "";
};

export const formatDateTime = (value: DateInput): string => {
  const date = toDate(value);
  return date ? format(date, "d MMM yyyy, h:mm a") : "Not set";
};

// "Sat, 12 Dec 2026 · 7:00 PM – 11:00 PM" or a range across days
export const formatEventWhen = (start: DateInput, end: DateInput): string => {
  const s = toDate(start);
  const e = toDate(end);
  if (!s) {
    return "Date to be announced";
  }
  if (!e) {
    return `${formatDate(s)} · ${formatTime(s)}`;
  }
  if (isSameDay(s, e)) {
    return `${formatDate(s)} · ${formatTime(s)} – ${formatTime(e)}`;
  }
  return `${format(s, "d MMM, h:mm a")} – ${format(e, "d MMM yyyy, h:mm a")}`;
};

// Compact form for cards: "Sun, 11 Oct · 7:00 PM"
export const formatCardWhen = (start: DateInput): string => {
  const s = toDate(start);
  return s
    ? `${format(s, "EEE, d MMM")} · ${formatTime(s)}`
    : "Date to be announced";
};

// Pieces for the calendar-style date block on cards
export const dateBlock = (
  value: DateInput,
): { month: string; day: string } | undefined => {
  const date = toDate(value);
  return date
    ? { month: format(date, "MMM").toUpperCase(), day: format(date, "d") }
    : undefined;
};

// <input type="datetime-local"> uses "YYYY-MM-DDTHH:mm"
export const toDateTimeInput = (value: DateInput): string => {
  const date = toDate(value);
  return date ? format(date, "yyyy-MM-dd'T'HH:mm") : "";
};

// Send wall-clock time to the backend's LocalDateTime without a timezone
export const fromDateTimeInput = (value: string): string | undefined =>
  value ? `${value}:00` : undefined;

export const errorMessage = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === "string") {
    return err;
  }
  return "Something went wrong. Please try again.";
};
