import type { MenuHit } from "@/lib/api";
import { ResultCard } from "./ResultCard";

interface ResultsListProps {
  results: MenuHit[];
  loading: boolean;
  error: string | null;
  hasQuery: boolean;
}

export function ResultsList({
  results,
  loading,
  error,
  hasQuery,
}: Readonly<ResultsListProps>) {
  if (error) {
    return (
      <p className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
        {error}
      </p>
    );
  }

  if (loading) {
    return (
      <ul className="grid gap-3 sm:grid-cols-2">
        {["a", "b", "c", "d"].map((key) => (
          <li
            key={key}
            className="h-28 animate-pulse rounded-xl border border-border bg-card"
          />
        ))}
      </ul>
    );
  }

  if (!hasQuery) {
    return (
      <p className="text-sm text-muted">
        Start typing to search the menu.
      </p>
    );
  }

  if (results.length === 0) {
    return <p className="text-sm text-muted">No matching items found.</p>;
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {results.map((hit) => (
        <ResultCard key={hit.id} hit={hit} />
      ))}
    </ul>
  );
}
