import { PublishedEventSummary } from "@/domain/domain";
import { dateBlock, formatCardWhen } from "@/lib/format";
import { MapPin } from "lucide-react";
import { Link } from "react-router";
import EventImage from "./event-image";

const EventCard: React.FC<{ event: PublishedEventSummary }> = ({ event }) => {
  const block = dateBlock(event.start);

  return (
    <Link
      to={`/events/${event.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none dark:hover:shadow-black/30"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <EventImage
          seed={event.id}
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {block && (
          <div className="absolute top-3 left-3 flex w-12 flex-col items-center rounded-lg bg-card/95 py-1 text-card-foreground shadow-sm backdrop-blur">
            <span className="text-[10px] font-semibold tracking-wider text-brand">
              {block.month}
            </span>
            <span className="text-lg leading-tight font-semibold">
              {block.day}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 leading-snug font-semibold">
          {event.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {formatCardWhen(event.start)}
        </p>
        <p className="mt-auto flex items-center gap-1.5 pt-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{event.venue}</span>
        </p>
      </div>
    </Link>
  );
};

export default EventCard;
