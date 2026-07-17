export interface FilterState {
  category: string;
  minPrice: string;
  maxPrice: string;
  limit: number;
}

interface FiltersProps {
  categories: string[];
  value: FilterState;
  onChange: (next: FilterState) => void;
}

const LIMIT_OPTIONS = [5, 10, 20, 50];

const fieldClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/40";
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";

export function Filters({ categories, value, onChange }: Readonly<FiltersProps>) {
  const set = <K extends keyof FilterState>(key: K, v: FilterState[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div>
        <label className={labelClass} htmlFor="filter-category">
          Category
        </label>
        <select
          id="filter-category"
          className={fieldClass}
          value={value.category}
          onChange={(e) => set("category", e.target.value)}
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="filter-min">
          Min price
        </label>
        <input
          id="filter-min"
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="0"
          className={fieldClass}
          value={value.minPrice}
          onChange={(e) => set("minPrice", e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="filter-max">
          Max price
        </label>
        <input
          id="filter-max"
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="∞"
          className={fieldClass}
          value={value.maxPrice}
          onChange={(e) => set("maxPrice", e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="filter-limit">
          Results
        </label>
        <select
          id="filter-limit"
          className={fieldClass}
          value={value.limit}
          onChange={(e) => set("limit", Number(e.target.value))}
        >
          {LIMIT_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
