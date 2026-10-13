"use client";

import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Shield,
  User,
  Menu,
  X,
  Upload,
  Bell,
  CheckCheck,
  RefreshCw,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/auth-context";
import { useClickOutside } from "@/lib/hooks";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const PUBLIC_LINKS = [{ label: "Catalogue", to: "/" }];

const AUTH_LINKS = [
  { label: "Mes contributions", to: "/mes-contributions" },
  { label: "Favoris", to: "/favoris" },
  { label: "Historique", to: "/historique" },
];

function MenuItem({ icon: Icon, label, to, onClick, destructive }) {
  const cls = cn(
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors outline-none",
    destructive
      ? "text-destructive hover:bg-destructive/10"
      : "text-popover-foreground hover:bg-muted",
  );
  if (to)
    return (
      <Link to={to} className={cls} onClick={onClick}>
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </Link>
    );
  return (
    <button type="button" role="menuitem" className={cls} onClick={onClick}>
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </button>
  );
}

function initials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Navbar() {
  const { user, isAdmin, isModerator, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationError, setNotificationError] = useState("");
  const [notificationRefreshKey, setNotificationRefreshKey] = useState(0);
  const menuRef = useRef(null);
  const notificationRef = useRef(null);

  useClickOutside(menuRef, () => setMenuOpen(false));
  useClickOutside(notificationRef, () => setNotificationsOpen(false));

  useEffect(() => {
    if (!isModerator && !isAdmin) return;
    let active = true;

    async function loadNotifications() {
      try {
        const response = await api.get("/notifications");
        if (!active) return;
        setNotifications(response.data ?? []);
        setUnreadCount(response.unread_count ?? 0);
        setNotificationError("");
      } catch (error) {
        if (active) setNotificationError(error.message ?? "Chargement impossible");
      }
    }

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") loadNotifications();
    }

    loadNotifications();
    const interval = window.setInterval(loadNotifications, 10000);
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [isAdmin, isModerator, notificationRefreshKey]);

  async function handleLogout() {
    setMenuOpen(false);
    
    const result = await MySwal.fire({
      title: (
        <div className="logout-confirmation-heading">
          <span className="logout-confirmation-icon">
            <LogOut className="size-5" aria-hidden="true" />
          </span>
          <span className="logout-confirmation-title-copy">
            <span className="logout-confirmation-eyebrow">Fin de session</span>
            <span className="logout-confirmation-title-text">Quitter Biblia ?</span>
          </span>
        </div>
      ),
      html: (
        <div className="logout-confirmation-content">
          <p className="logout-confirmation-message">
            Votre session sera fermée sur cet appareil. Vous pourrez vous reconnecter à tout moment.
          </p>
          <div className="logout-confirmation-account">
            <span className="logout-confirmation-avatar">
              {initials(user?.name) || "B"}
            </span>
            <div className="logout-confirmation-account-copy">
              <p className="logout-confirmation-account-name">{user?.name}</p>
              <p className="logout-confirmation-account-email">{user?.email ?? 'Compte bibliothèque'}</p>
            </div>
            <span className="logout-confirmation-session">Connecté</span>
          </div>
        </div>
      ),
      showCancelButton: true,
      showCloseButton: true,
      focusCancel: true,
      reverseButtons: true,
      confirmButtonText: 'Me déconnecter',
      cancelButtonText: 'Rester connecté',
      buttonsStyling: false,
      customClass: {
        container: 'logout-confirmation-backdrop',
        popup: 'logout-confirmation',
        title: 'logout-confirmation-title',
        htmlContainer: 'logout-confirmation-html',
        closeButton: 'logout-confirmation-close',
        actions: 'logout-confirmation-actions',
        confirmButton: 'logout-confirmation-confirm',
        cancelButton: 'logout-confirmation-cancel'
      }
    });

    if (result.isConfirmed) {
      await logout();
      navigate("/connexion", { replace: true });
    }
  }

  async function openNotification(notification) {
    if (!notification.read_at) {
      try {
        await api.post(`/notifications/${notification.id}/read`);
        setNotifications((current) => current.map((item) =>
          item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item,
        ));
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch {
        // Keep navigation available if marking the item read fails.
      }
    }
    setNotificationsOpen(false);
    navigate(notification.data?.url ?? "/admin/moderation");
  }

  async function markAllNotificationsRead() {
    try {
      await api.post("/notifications/read-all");
      const readAt = new Date().toISOString();
      setNotifications((current) => current.map((item) => ({ ...item, read_at: item.read_at ?? readAt })));
      setUnreadCount(0);
    } catch {
      setNotificationError("Impossible de marquer les notifications comme lues.");
    }
  }

  const userInitials = initials(user?.name);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="text-lg font-semibold text-foreground">
          Biblia
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-1 md:flex"
        >
          {PUBLIC_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          {user &&
            AUTH_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {(isModerator || isAdmin) && (
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen((open) => !open)}
                aria-label={unreadCount ? `Notifications, ${unreadCount} non lues` : "Notifications"}
                aria-expanded={notificationsOpen}
                aria-haspopup="dialog"
                className="relative inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Bell className="size-4.5" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex min-w-4.5 h-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-semibold text-destructive-foreground">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <section
                  role="dialog"
                  aria-label="Notifications de modération"
                  className="absolute right-0 z-50 mt-2 w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                    <div>
                      <h2 className="text-sm font-semibold">Notifications</h2>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {unreadCount ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : "Tout est à jour"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setNotificationError("");
                          setNotificationRefreshKey((key) => key + 1);
                        }}
                        aria-label="Actualiser les notifications"
                        title="Actualiser"
                        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <RefreshCw className="size-3.5" aria-hidden="true" />
                      </button>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllNotificationsRead}
                          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-accent"
                        >
                          <CheckCheck className="size-3.5" aria-hidden="true" />
                          Tout lire
                        </button>
                      )}
                    </div>
                  </div>

                  {notificationError && (
                    <p className="px-4 py-3 text-xs text-destructive">{notificationError}</p>
                  )}

                  {notifications.length > 0 ? (
                    <ul className="max-h-96 divide-y divide-border overflow-y-auto">
                      {notifications.map((notification) => (
                        <li key={notification.id}>
                          <button
                            type="button"
                            onClick={() => openNotification(notification)}
                            className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/70"
                          >
                            <span className={cn(
                              "mt-1.5 size-2 shrink-0 rounded-full",
                              notification.read_at ? "bg-transparent" : "bg-primary",
                            )} aria-hidden="true" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-foreground">
                                {notification.data?.title ?? "Nouvelle ressource à modérer"}
                              </span>
                              <span className="mt-0.5 block text-xs text-muted-foreground">
                                {notification.data?.message ?? "Une nouvelle contribution attend votre examen."}
                              </span>
                              {notification.created_at && (
                                <span className="mt-1.5 block text-[11px] text-muted-foreground/80">
                                  {new Date(notification.created_at).toLocaleString("fr-FR", {
                                    dateStyle: "short",
                                    timeStyle: "short",
                                  })}
                                </span>
                              )}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Aucune notification pour le moment.
                    </p>
                  )}

                  <Link
                    to="/admin/moderation"
                    onClick={() => setNotificationsOpen(false)}
                    className="block border-t border-border px-4 py-3 text-center text-sm font-medium text-primary transition-colors hover:bg-muted/70"
                  >
                    Ouvrir la file de modération
                  </Link>
                </section>
              )}
            </div>
          )}

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-1.5 rounded-lg p-1 pr-2 transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-linear-to-br from-primary to-indigo-400 text-sm font-semibold text-primary-foreground">
                {userInitials}
              </span>
              <ChevronDown
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg"
              >
                <div className="border-b border-border px-3 py-2">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.email ?? user?.name}
                  </p>
                </div>
                <MenuItem
                  icon={User}
                  label="Mon Profil"
                  to="/profil"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="my-1 h-px bg-border" />
                {isAdmin && (
                  <>
                    <MenuItem
                      icon={LayoutDashboard}
                      label="Tableau de bord"
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                    />
                    <MenuItem
                      icon={Shield}
                      label="Modération"
                      to="/admin/moderation"
                      onClick={() => setMenuOpen(false)}
                    />
                    <MenuItem
                      icon={User}
                      label="Utilisateurs"
                      to="/admin/utilisateurs"
                      onClick={() => setMenuOpen(false)}
                    />
                    <MenuItem
                      icon={BookOpen}
                      label="Catégories"
                      to="/admin/categories"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="my-1 h-px bg-border" />
                  </>
                )}
                {isModerator && !isAdmin && (
                  <>
                    <MenuItem
                      icon={Shield}
                      label="Modération"
                      to="/admin/moderation"
                      onClick={() => setMenuOpen(false)}
                    />
                    <MenuItem
                      icon={BookOpen}
                      label="Catégories"
                      to="/admin/categories"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="my-1 h-px bg-border" />
                  </>
                )}
                <MenuItem
                  icon={Upload}
                  label="Soumettre un document"
                  to="/contribuer"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="my-1 h-px bg-border" />
                <MenuItem
                  icon={LogOut}
                  label="Se déconnecter"
                  destructive
                  onClick={handleLogout}
                />
              </div>
            )}
          </div>

          {/* Mobile burger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 md:hidden"
          >
            {mobileOpen ? (
              <X className="size-4.5" />
            ) : (
              <Menu className="size-4.5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav
          aria-label="Navigation mobile"
          className="border-t border-border px-4 py-2 md:hidden"
        >
          {PUBLIC_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          {user &&
            AUTH_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              Admin
            </NavLink>
          )}
          {isModerator && !isAdmin && (
            <NavLink
              to="/admin/moderation"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              Modération
            </NavLink>
          )}
        </nav>
      )}
    </header>
  );
}
