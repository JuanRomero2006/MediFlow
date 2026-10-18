import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { HeartPulse, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export type NavItem = { label: string; to?: string; icon: React.ElementType };

export function DashboardLayout({
  role,
  user,
  nav,
  children,
}: {
  role: string;
  user: string;
  nav: NavItem[];
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const list = (
    <nav className="space-y-1">
      {nav.map((item, i) => (
        <button
          key={item.label}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
            i === 0 ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          <item.icon className="size-4 shrink-0" />
          <span className="truncate">{item.label}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="container-page grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <HeartPulse className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-base font-extrabold">Salud Viva</span>
              <span className="block truncate text-xs text-muted-foreground">Panel {role}</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-[12rem] truncate text-sm text-muted-foreground sm:block">{user}</span>
            <Button variant="outline" size="sm" asChild>
              <Link to="/login"><LogOut className="size-4" /> Salir</Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
              aria-label="Menú del panel"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {open && <div className="container-page border-t border-border py-3 lg:hidden">{list}</div>}
      </header>

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="surface-card sticky top-24 p-3">{list}</div>
        </aside>
        <main className="min-w-0 space-y-8">{children}</main>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="surface-card p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <p className="truncate text-sm text-muted-foreground">{label}</p>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-extrabold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}