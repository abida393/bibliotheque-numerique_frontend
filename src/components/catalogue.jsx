"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { api } from "@/lib/api";
import { useDebounce } from "@/lib/hooks";
import { DEFAULT_FILTERS, FiltersPanel } from "@/components/filters-panel";
import { ResourceCard } from "@/components/resource-card";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/empty-state";

function PageSkeleton() {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="h-64 animate-pulse rounded-xl border border-border bg-muted"
        />
      ))}
    </ul>
  );
}

export function Catalogue() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [resources, setResources] = useState([]);
  const [meta, setMeta] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const debouncedQuery = useDebounce(query, 450);

  // Load categories once
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = {
      page,
      per_page: 9,
      ...(debouncedQuery && { search: debouncedQuery }),
      ...(filters.category_id != null && { category_id: filters.category_id }),
      ...(filters.type !== "all" && { type: filters.type }),
      ...(filters.language !== "all" && { language: filters.language }),
      ...(filters.sort !== "recent" && { sort: filters.sort }),
    };

    api
      .get("/resources", params, controller.signal)
      .then((res) => {
        setResources(res.data ?? []);
        setMeta(res.meta ?? null);
      })
      .catch((err) => {
        if (err.name !== "AbortError")
          setError(err.message ?? "Erreur de chargement");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [debouncedQuery, filters, page, retryCount]);

  const activeFilterCount = [
    filters.category_id != null,
    filters.type !== "all",
    filters.language !== "all",
    filters.sort !== "recent",
  ].filter(Boolean).length;

  function resetAll() {
    setLoading(true);
    setError(null);
    setQuery("");
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }

  const total = meta?.total ?? resources.length;
  const totalPages = meta?.last_page ?? 1;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-balance text-foreground sm:text-3xl">
          Catalogue de ressources
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Explorez, consultez et enregistrez des documents académiques.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="catalogue-search" className="sr-only">
            Rechercher une ressource
          </label>
          <input
            id="catalogue-search"
            type="search"
            value={query}
            onChange={(e) => {
              setLoading(true);
              setError(null);
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher par titre, auteur ou mot-clé…"
            className="h-11 w-full rounded-xl border border-border bg-background pr-10 pl-11 text-sm text-foreground shadow-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError(null);
                setQuery("");
                setPage(1);
              }}
              aria-label="Effacer la recherche"
              className="absolute top-1/2 right-3 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <FiltersPanel
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          filters={filters}
          onChange={(f) => {
            setLoading(true);
            setError(null);
            setFilters(f);
            setPage(1);
          }}
          activeCount={activeFilterCount}
          categories={categories}
        />
      </div>

      {/* Status line */}
      {!loading && !error && (
        <p
          className="mt-4 text-sm text-muted-foreground"
          aria-live="polite"
          role="status"
        >
          {total} {total > 1 ? "ressources trouvées" : "ressource trouvée"}
        </p>
      )}

      {/* Content */}
      <div className="mt-4">
        {loading ? (
          <PageSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
            <p className="text-sm font-medium text-destructive">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                setRetryCount((count) => count + 1);
              }}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Réessayer
            </button>
          </div>
        ) : resources.length > 0 ? (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <li key={resource.id}>
                <ResourceCard resource={resource} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState onReset={resetAll} />
        )}
      </div>

      {/* Pagination */}
      {!loading && resources.length > 0 && totalPages > 1 && (
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-5 sm:flex-row">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Page <span className="font-medium text-foreground">{page}</span> sur{' '}
            <span className="font-medium text-foreground">{totalPages}</span>
          </p>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => {
              setLoading(true);
              setError(null);
              setPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}
    </main>
  );
}
