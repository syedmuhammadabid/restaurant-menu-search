export interface MenuHit {
  id: number;
  score: number;
  name: string;
  category: string;
  price: number | null;
  tags: string[];
  size?: string;
  items?: string[];
}

export interface SearchResponse {
  query: string;
  count: number;
  results: MenuHit[];
}

export interface CategoriesResponse {
  count: number;
  categories: string[];
}

export interface SearchParams {
  q: string;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "/api").replace(/\/$/, "");

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { signal });
  if (!res.ok) {
    let detail = "";
    try {
      detail = JSON.stringify(await res.json());
    } catch {
      detail = res.statusText;
    }
    throw new Error(`Request failed (${res.status}): ${detail}`);
  }
  return res.json() as Promise<T>;
}

export function searchMenu(
  params: SearchParams,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  const query = new URLSearchParams({ q: params.q });
  if (params.limit != null) query.set("limit", String(params.limit));
  if (params.category) query.set("category", params.category);
  if (params.minPrice != null) query.set("min_price", String(params.minPrice));
  if (params.maxPrice != null) query.set("max_price", String(params.maxPrice));
  return getJson<SearchResponse>(`/search?${query.toString()}`, signal);
}

export function getCategories(signal?: AbortSignal): Promise<CategoriesResponse> {
  return getJson<CategoriesResponse>("/categories", signal);
}
