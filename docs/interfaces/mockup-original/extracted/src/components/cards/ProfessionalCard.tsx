import { Link } from "@tanstack/react-router";
import { MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Professional } from "@/lib/health-data";

function initials(name: string) {
  return name
    .replace(/^Dr[a]?\.\s*/i, "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

export function ProfessionalCard({ professional }: { professional: Professional }) {
  return (
    <article className="surface-card flex flex-col p-6 transition-all hover:-translate-y-1 hover:shadow-soft">
      <div className="flex min-w-0 items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary-soft font-display text-lg font-bold text-primary">
          {initials(professional.name)}
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-bold">{professional.name}</h3>
          <p className="truncate text-sm text-primary">{professional.specialty}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            {professional.city}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1 font-medium text-foreground">
          <Star className="size-3.5 fill-warning text-warning" />
          {professional.rating.toFixed(1)}
          <span className="font-normal text-muted-foreground">({professional.reviews})</span>
        </span>
        <span>{professional.experience}</span>
      </div>

      <p className="mt-3 rounded-lg bg-secondary px-3 py-2 text-xs text-secondary-foreground">
        Próxima disponibilidad: <strong>{professional.nextAvailable}</strong>
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button variant="outline" asChild>
          <Link to="/profesionales/$id" params={{ id: professional.id }}>
            Ver perfil
          </Link>
        </Button>
        <Button asChild>
          <Link to="/agendar" search={{ profesional: professional.id }}>
            Agendar
          </Link>
        </Button>
      </div>
    </article>
  );
}