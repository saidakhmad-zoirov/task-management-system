import { Outlet } from "react-router-dom";

import { LinkButton } from "../components/ui/Button";
import { Logo } from "../components/ui/Logo";
import { useAuth } from "../hooks/useAuth";

export function PublicLayout() {
  const { user } = useAuth();
  return (
    <div className="relative flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 px-4 pt-3 sm:px-6" style={{ top: "env(safe-area-inset-top, 0px)" }}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 rounded-full border border-line bg-bg/70 pl-5 pr-2 backdrop-blur-xl">
          <Logo />
          <nav className="flex items-center gap-2">
            {user ? (
              <LinkButton to="/dashboard" size="sm">
                Dashboard
              </LinkButton>
            ) : (
              <>
                <LinkButton to="/login" variant="ghost" size="sm">
                  Kirish
                </LinkButton>
                <LinkButton to="/register" size="sm">
                  Boshlash
                </LinkButton>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-faint sm:flex-row sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} TaskPulse — portfolio loyiha</span>
          <span className="font-mono">FastAPI · PostgreSQL · React · TypeScript</span>
        </div>
      </footer>
    </div>
  );
}
