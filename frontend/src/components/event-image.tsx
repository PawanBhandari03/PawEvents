import { cn } from "@/lib/utils";

const IMAGES = [
  "/event-image-1.webp",
  "/event-image-2.webp",
  "/event-image-3.webp",
  "/event-image-4.webp",
];

// Same event always gets the same picture (no flicker between renders)
const pickImage = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return IMAGES[Math.abs(hash) % IMAGES.length];
};

const EventImage: React.FC<{
  seed: string;
  alt?: string;
  className?: string;
}> = ({ seed, alt = "", className }) => (
  <img
    src={pickImage(seed)}
    alt={alt}
    loading="lazy"
    className={cn("h-full w-full object-cover", className)}
  />
);

export default EventImage;
