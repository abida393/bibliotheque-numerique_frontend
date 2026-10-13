/**
 * FavoritesContext — global favorites state with optimistic updates.
 * Fetches all favorited resource IDs on mount (up to 5 pages = 100 resources).
 */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "./auth-context";

const FavoritesContext = createContext(null);
const EMPTY_IDS = new Set();

export function FavoritesProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [favoriteState, setFavoriteState] = useState({
    userId: null,
    ids: EMPTY_IDS,
  });
  const ownerId = user?.id ?? null;
  const ids =
    isAuthenticated && favoriteState.userId === ownerId
      ? favoriteState.ids
      : EMPTY_IDS;
  const loading = isAuthenticated && favoriteState.userId !== ownerId;

  useEffect(() => {
    if (!isAuthenticated || ownerId === null) return;
    let cancelled = false;

    async function fetchAll() {
      try {
        let page = 1;
        const collected = new Set();
        while (page <= 5) {
          const res = await api.get("/favorites", { page });
          (res.data ?? []).forEach((r) => collected.add(r.id));
          if (page >= (res.meta?.last_page ?? 1)) break;
          page++;
        }
        if (!cancelled) setFavoriteState({ userId: ownerId, ids: collected });
      } catch {
        if (!cancelled) setFavoriteState({ userId: ownerId, ids: EMPTY_IDS });
      }
    }
    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, ownerId]);

  async function toggle(resourceId) {
    const was = ids.has(resourceId);
    // Optimistic
    setFavoriteState((prev) => {
      const n = new Set(prev.userId === ownerId ? prev.ids : EMPTY_IDS);
      if (was) n.delete(resourceId);
      else n.add(resourceId);
      return { userId: ownerId, ids: n };
    });
    try {
      if (was) await api.delete(`/resources/${resourceId}/favorite`);
      else await api.post(`/resources/${resourceId}/favorite`);
    } catch {
      // Rollback
      toast.error("Impossible de mettre à jour les favoris.");
      setFavoriteState((prev) => {
        const n = new Set(prev.userId === ownerId ? prev.ids : EMPTY_IDS);
        if (was) n.add(resourceId);
        else n.delete(resourceId);
        return { userId: ownerId, ids: n };
      });
    }
  }

  return (
    <FavoritesContext.Provider value={{ ids, loading, toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be inside <FavoritesProvider>");
  return ctx;
}
