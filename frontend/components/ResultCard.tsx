import type { MenuHit } from "@/lib/api";

interface ResultCardProps {
  hit: MenuHit;
}

function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function ResultCard({ hit }: Readonly<ResultCardProps>) {
  return (
    <li className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-accent/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-medium text-foreground">
            {hit.name}
          </h3>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-muted">
            {hit.category}
            {hit.size ? ` · ${hit.size}` : ""}
          </p>
        </div>
        {hit.price != null && (
          <span className="shrink-0 font-mono text-sm text-foreground">
            Rs {hit.price}
          </span>
        )}
      </div>

      {hit.items && hit.items.length > 0 && (
        <p className="mt-2 text-sm text-muted">{hit.items.join(", ")}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {hit.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border px-2 py-0.5 text-xs text-muted"
          >
            {tag}
          </span>
        ))}
        <span
          className="ml-auto font-mono text-xs text-accent"
          title="Relevance score"
        >
          {formatScore(hit.score)}
        </span>
      </div>
    </li>
  );
}
