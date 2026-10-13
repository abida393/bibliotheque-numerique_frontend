import { useEffect, useState, useRef } from "react";
import { Users, Search, Trash2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { usePaginated } from "@/lib/hooks";
import { useDebounce } from "@/lib/hooks";
import { Pagination } from "@/components/pagination";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const ROLES = ["user", "moderator", "admin"];

function RoleBadge({ roles }) {
  const role = roles?.[0] ?? "user";
  const map = {
    admin:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    moderator:
      "bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400",
    user: "bg-muted      text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        map[role] ?? map.user,
      )}
    >
      {role}
    </span>
  );
}

function RoleDropdown({ userId, currentRole, onChanged }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close on click outside or Escape
  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function changeRole(role) {
    if (role === currentRole) {
      setOpen(false);
      return;
    }
    if (!confirm(`Changer le rôle vers « ${role} » ?`)) return;
    setOpen(false);
    setLoading(true);
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      onChanged(userId, role);
      toast.success(`Rôle changé en « ${role} ».`);
    } catch (err) {
      toast.error(err.message ?? "Erreur lors du changement de rôle.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
      >
        {loading ? <Spinner className="size-3" /> : null}
        {currentRole ?? "user"}
        <ChevronDown className="size-3 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-32 rounded-xl border border-border bg-popover p-1 shadow-lg">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => changeRole(r)}
              className={cn(
                "w-full rounded-lg px-3 py-1.5 text-left text-xs capitalize transition-colors hover:bg-muted",
                r === currentRole && "font-semibold text-primary",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminUsersPage() {
  const { user: me } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);
  const { items, meta, loading, error, refetch } = usePaginated(
    "/admin/users",
    { page, ...(debouncedSearch && { search: debouncedSearch }) },
  );
  const [localItems, setLocalItems] = useState(null);
  const resultKey = JSON.stringify([page, debouncedSearch]);
  const displayedItems =
    localItems?.key === resultKey ? localItems.items : items;

  function onRoleChanged(userId, newRole) {
    setLocalItems((prev) => ({
      key: resultKey,
      items: (prev?.key === resultKey ? prev.items : items).map((u) =>
        u.id === userId ? { ...u, roles: [newRole] } : u,
      ),
    }));
  }

  async function deleteUser(userId, name) {
    if (
      !confirm(
        `Supprimer l'utilisateur « ${name} » ? Cette action est irréversible.`,
      )
    )
      return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setLocalItems((prev) => ({
        key: resultKey,
        items: (prev?.key === resultKey ? prev.items : items).filter(
          (u) => u.id !== userId,
        ),
      }));
      toast.success(`Utilisateur « ${name} » supprimé.`);
    } catch (err) {
      toast.error(err.message ?? "Erreur lors de la suppression.");
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          <Users className="size-6 text-primary" /> Gestion des utilisateurs
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gérez les rôles et comptes des membres.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Rechercher un utilisateur…"
          className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner className="size-8" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-sm text-destructive">{error}</p>
          <button
            onClick={refetch}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Nom
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground hidden sm:table-cell">
                  Département
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Rôle
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayedItems.map((u) => (
                <tr
                  key={u.id}
                  className="bg-card transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{u.name}</p>
                    {u.email && (
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {u.department ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {u.id === me?.id ? (
                      <RoleBadge roles={u.roles} />
                    ) : (
                      <RoleDropdown
                        userId={u.id}
                        currentRole={u.roles?.[0]}
                        onChanged={onRoleChanged}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.id !== me?.id && (
                      <button
                        type="button"
                        onClick={() => deleteUser(u.id, u.name)}
                        aria-label="Supprimer l'utilisateur"
                        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {displayedItems.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && (meta?.last_page ?? 1) > 1 && (
        <div className="mt-8">
          <Pagination
            page={page}
            totalPages={meta.last_page}
            onPageChange={(p) => {
              setPage(p);
              setLocalItems(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}
    </main>
  );
}
