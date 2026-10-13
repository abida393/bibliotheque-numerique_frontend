import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Users,
  BookOpen,
  Clock,
  TrendingUp,
  Star,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

function StatCard({ icon: Icon, label, value, color = "text-primary" }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <span
          className={`inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 ${color}`}
        >
          <Icon className="size-5" />
        </span>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="text-3xl font-bold text-foreground">{value ?? "—"}</p>
    </div>
  );
}

function MiniBarChart({ data, maxValue }) {
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d, i) => {
        const pct = maxValue > 0 ? (d.count / maxValue) * 100 : 0;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1"
            title={`${d.date}: ${d.count}`}
          >
            <div
              className="w-full rounded-t-sm bg-primary/70 transition-all"
              style={{ height: `${pct}%`, minHeight: pct > 0 ? "2px" : "0" }}
            />
          </div>
        );
      })}
    </div>
  );
}

export function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [popular, setPopular] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const [ov, pop, cat, tr] = await Promise.all([
        api.get("/stats/overview"),
        api.get("/stats/popular-resources"),
        api.get("/stats/resources-by-category"),
        api.get("/stats/activity-trend"),
      ]);
      setOverview(ov);
      setPopular(pop);
      setByCategory(
        cat
          .filter((c) => c.resources_count > 0)
          .sort((a, b) => b.resources_count - a.resources_count)
          .slice(0, 8),
      );
      setTrend(tr);
      setError(null);
    } catch (err) {
      setError(err.message ?? "Impossible de charger les statistiques.");
    } finally {
      setLoading(false);
    }
  }, []);

  function reload() {
    setLoading(true);
    setError(null);
    load();
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get("/stats/overview"),
      api.get("/stats/popular-resources"),
      api.get("/stats/resources-by-category"),
      api.get("/stats/activity-trend"),
    ])
      .then(([ov, pop, cat, tr]) => {
        if (!active) return;
        setOverview(ov);
        setPopular(pop);
        setByCategory(
          cat
            .filter((c) => c.resources_count > 0)
            .sort((a, b) => b.resources_count - a.resources_count)
            .slice(0, 8),
        );
        setTrend(tr);
        setError(null);
      })
      .catch((err) => {
        if (active)
          setError(err.message ?? "Impossible de charger les statistiques.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-32">
        <Spinner className="size-8" />
      </div>
    );

  if (error)
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <AlertTriangle className="size-10 text-destructive mx-auto mb-4" />
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={reload} className="gap-2">
          <RefreshCw className="size-4" /> Réessayer
        </Button>
      </div>
    );

  const maxCount = Math.max(...trend.map((d) => d.count), 1);
  const maxCatCount = Math.max(...byCategory.map((c) => c.resources_count), 1);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Tableau de bord
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vue d'ensemble de la bibliothèque numérique.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reload}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw className="size-4" />
          </button>
          <Link
            to="/admin/moderation"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Modération
          </Link>
          <Link
            to="/admin/utilisateurs"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Utilisateurs
          </Link>
          <Link
            to="/admin/categories"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Catégories
          </Link>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        <StatCard
          icon={BookOpen}
          label="Ressources validées"
          value={overview?.total_resources}
        />
        <StatCard
          icon={Clock}
          label="En attente"
          value={overview?.total_pending}
          color="text-amber-600"
        />
        <StatCard
          icon={Users}
          label="Utilisateurs"
          value={overview?.total_users}
          color="text-indigo-600"
        />
        <StatCard
          icon={BarChart3}
          label="Catégories"
          value={overview?.total_categories}
          color="text-green-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity trend */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Activité — 30 derniers jours
            </h2>
          </div>
          {trend.length > 0 ? (
            <>
              <MiniBarChart data={trend} maxValue={maxCount} />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>{trend[0]?.date}</span>
                <span>{trend[trend.length - 1]?.date}</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Aucune donnée
            </p>
          )}
        </div>

        {/* Resources by category */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Ressources par catégorie
            </h2>
          </div>
          <ul className="space-y-2.5">
            {byCategory.map((c) => (
              <li key={c.id} className="flex items-center gap-3 text-sm">
                <span className="w-32 truncate text-muted-foreground shrink-0">
                  {c.name}
                </span>
                <div className="flex-1 rounded-full bg-muted h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${(c.resources_count / maxCatCount) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-8 text-right text-xs font-medium text-foreground">
                  {c.resources_count}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Popular resources */}
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Star className="size-4 text-amber-500 fill-amber-500" />
            <h2 className="text-sm font-semibold text-foreground">
              Top 10 des ressources consultées
            </h2>
          </div>
          <ul className="divide-y divide-border">
            {popular.map((r, i) => (
              <li key={r.id} className="flex items-center gap-4 py-3">
                <span className="text-lg font-bold text-muted-foreground/40 w-7 text-right shrink-0">
                  {i + 1}
                </span>
                <Link
                  to={`/ressources/${r.id}`}
                  className="flex-1 min-w-0 text-sm font-medium text-foreground hover:text-primary transition-colors truncate"
                >
                  {r.title}
                </Link>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {r.consultations_count} consultation
                  {r.consultations_count !== 1 ? "s" : ""}
                </span>
              </li>
            ))}
            {popular.length === 0 && (
              <li className="py-8 text-center text-sm text-muted-foreground">
                Aucune donnée
              </li>
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}
