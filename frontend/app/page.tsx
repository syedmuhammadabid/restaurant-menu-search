"use client";

import { useEffect, useMemo, useState } from "react";

import { getCategories, searchMenu, type MenuHit } from "@/lib/api";
import { useDebounce } from "@/lib/useDebounce";
import { SearchBar } from "@/components/SearchBar";
import { Filters, type FilterState } from "@/components/Filters";
import { ResultsList } from "@/components/ResultsList";

const INITIAL_FILTERS: FilterState = {
  category: "",
  minPrice: "",
  maxPrice: "",
  limit: 10,
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [categories, setCategories] = useState<string[]>([]);
  const [results, setResults] = useState<MenuHit[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query.trim(), 300);

  useEffect(() => {
    const controller = new AbortController();
    getCategories(controller.signal)
      .then((res) => setCategories(res.categories))
      .catch(() => {
        /* categories are optional; ignore load failure */
      });
    return () => controller.abort();
  }, []);

  const minPrice = useMemo(
    () => (filters.minPrice ? Number(filters.minPrice) : undefined),
    [filters.minPrice],
  );
  const maxPrice = useMemo(
    () => (filters.maxPrice ? Number(filters.maxPrice) : undefined),
    [filters.maxPrice],
  );

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setCount(0);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    searchMenu(
      {
        q: debouncedQuery,
        limit: filters.limit,
        category: filters.category || undefined,
        minPrice,
        maxPrice,
      },
      controller.signal,
    )
      .then((res) => {
        setResults(res.results);
        setCount(res.count);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setResults([]);
        setCount(0);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debouncedQuery, filters.limit, filters.category, minPrice, maxPrice]);

  const hasQuery = debouncedQuery.length > 0;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-14 sm:py-20">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Cafe Bagalo <span className="text-muted">Menu Search</span>
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Describe what you&apos;re in the mood for — search is semantic, not
          keyword.
        </p>
      </header>

      <div className="space-y-4">
        <SearchBar value={query} onChange={setQuery} />
        <Filters categories={categories} value={filters} onChange={setFilters} />
      </div>

      <div className="mt-8">
        {hasQuery && !loading && !error && (
          <p className="mb-4 text-xs uppercase tracking-wide text-muted">
            {count} {count === 1 ? "result" : "results"} for “{debouncedQuery}”
          </p>
        )}
        <ResultsList
          results={results}
          loading={loading}
          error={error}
          hasQuery={hasQuery}
        />
      </div>
    </main>
  );
}
