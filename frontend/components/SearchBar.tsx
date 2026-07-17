interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: Readonly<SearchBarProps>) {
  return (
    <div className="relative">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
      >
        <circle cx="11" cy="11" r="7" />
        <path strokeLinecap="round" d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search the menu… e.g. spicy chicken burger"
        autoFocus
        className="w-full rounded-xl border border-border bg-card py-3.5 pl-12 pr-4 text-base text-foreground placeholder:text-muted/70 outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/40"
      />
    </div>
  );
}
