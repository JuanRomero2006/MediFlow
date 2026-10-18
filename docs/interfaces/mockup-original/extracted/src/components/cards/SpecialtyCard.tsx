import { Link } from "@tanstack/react-router";
import type { Specialty } from "@/lib/health-data";

export function SpecialtyCard({ specialty }: { specialty: Specialty }) {
  const Icon = specialty.icon;
  return (
    <Link
      to="/profesionales"
      search={{ especialidad: specialty.slug }}
      className="surface-card flex items-start gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <h3 className="truncate font-semibold">{specialty.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{specialty.description}</p>
        <p className="mt-2 text-xs font-medium text-primary">
          {specialty.professionals} profesionales
        </p>
      </div>
    </Link>
  );
}