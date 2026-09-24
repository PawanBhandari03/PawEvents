import { Monitor, Moon, Sun } from "lucide-react";
import { Theme, useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const options: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light theme", icon: Sun },
  { value: "system", label: "System theme", icon: Monitor },
  { value: "dark", label: "Dark theme", icon: Moon },
];

const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        "inline-flex items-center rounded-full border bg-card p-0.5",
        className,
      )}
    >
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          title={label}
          onClick={() => setTheme(value)}
          className={cn(
            "grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground",
            theme === value && "bg-secondary text-foreground",
          )}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
