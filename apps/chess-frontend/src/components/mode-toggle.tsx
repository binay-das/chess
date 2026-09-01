import { useState, useRef, useEffect } from "react";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { useTheme } from "../components/theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-(--border-10) bg-(--bg-surface-1) text-(--text-primary) transition-all hover:bg-(--border-10) hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-(--accent-gold)/40"
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-(--accent-gold)" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-(--accent-gold)" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-36 overflow-hidden rounded-xl border border-(--border-10) bg-(--bg-surface-5) p-1.5 shadow-2xl backdrop-blur-xl">
          <button
            type="button"
            onClick={() => {
              setTheme("light");
              setIsOpen(false);
            }}
            className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${theme === "light"
                ? "bg-(--accent-gold)/15 text-(--accent-gold) font-bold"
                : "text-(--text-muted-75) hover:bg-(--border-5) hover:text-(--text-primary)"
              }`}
          >
            <span className="flex items-center gap-2">
              <Sun className="h-3.5 w-3.5" />
              Light
            </span>
            {theme === "light" && <Check className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme("dark");
              setIsOpen(false);
            }}
            className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${theme === "dark"
                ? "bg-(--accent-gold)/15 text-(--accent-gold) font-bold"
                : "text-(--text-muted-75) hover:bg-(--border-5) hover:text-(--text-primary)"
              }`}
          >
            <span className="flex items-center gap-2">
              <Moon className="h-3.5 w-3.5" />
              Dark
            </span>
            {theme === "dark" && <Check className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme("system");
              setIsOpen(false);
            }}
            className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${theme === "system"
                ? "bg-(--accent-gold)/15 text-(--accent-gold) font-bold"
                : "text-(--text-muted-75) hover:bg-(--border-5) hover:text-(--text-primary)"
              }`}
          >
            <span className="flex items-center gap-2">
              <Monitor className="h-3.5 w-3.5" />
              System
            </span>
            {theme === "system" && <Check className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
}