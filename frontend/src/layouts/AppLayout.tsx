import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { CloseIcon, GridIcon, ListIcon, LogoutIcon, MenuIcon, PlusIcon, UserIcon } from "../components/ui/Icons";
import { Logo } from "../components/ui/Logo";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: GridIcon },
  { to: "/tasks", label: "Vazifalar", icon: ListIcon },
  { to: "/profile", label: "Profil", icon: UserIcon },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col gap-8 p-5">
      <Logo to="/dashboard" />
      <Button
        icon={<PlusIcon width={18} height={18} />}
        className="w-full"
        onClick={() => {
          navigate("/tasks?new=1");
          onNavigate?.();
        }}
      >
        Yangi vazifa
      </Button>
      <nav className="flex flex-col gap-1" aria-label="Asosiy menyu">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `roll-host relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${isActive ? "bg-panel-2 text-ink" : "text-muted hover:bg-panel hover:text-ink"}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-accent" />}
                <Icon width={18} height={18} className={isActive ? "text-accent" : ""} />
                <span className="roll">
                  <span>{label}</span>
                  <span aria-hidden="true">{label}</span>
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-3 rounded-2xl border border-line bg-panel p-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet/15 font-mono text-sm font-semibold uppercase text-violet">{user?.username.slice(0, 2)}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user?.username}</p>
          <p className="truncate text-xs text-faint">{user?.email}</p>
        </div>
        <button
          type="button"
          aria-label="Chiqish"
          title="Chiqish"
          className="grid size-9 place-items-center rounded-full text-muted transition hover:bg-coral/10 hover:text-coral"
          onClick={() => {
            logout();
            notify("Hisobdan chiqdingiz", "info");
            navigate("/login");
          }}
        >
          <LogoutIcon width={18} height={18} />
        </button>
      </div>
    </div>
  );
}

export function AppLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="relative flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 border-r border-line bg-bg-2/80 backdrop-blur lg:block">
        <Sidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky z-30 flex h-16 items-center justify-between border-b border-line bg-bg/80 px-4 backdrop-blur-xl lg:hidden" style={{ top: "env(safe-area-inset-top, 0px)" }}>
          <Logo to="/dashboard" />
          <button type="button" aria-label="Menyu" aria-expanded={open} onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-full hover:bg-panel-2">
            <MenuIcon />
          </button>
        </header>
        <main key={pathname} className="page-in mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menyu">
          <button type="button" aria-label="Yopish" className="absolute inset-0 bg-bg/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="page-in absolute inset-y-0 left-0 w-[min(20rem,85vw)] border-r border-line bg-bg-2">
            <button type="button" aria-label="Yopish" onClick={() => setOpen(false)} className="absolute right-3 top-4 grid size-9 place-items-center rounded-full text-muted hover:bg-panel-2">
              <CloseIcon />
            </button>
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </div>
  );
}
