import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { ProfessionalCard } from "@/components/cards/ProfessionalCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { professionals, specialties } from "@/lib/health-data";

type SearchParams = { especialidad?: string | undefined };

export const Route = createFileRoute("/profesionales/")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    especialidad: typeof search["especialidad"] === "string" ? (search["especialidad"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Directorio de profesionales | Salud Viva" },
      { name: "description", content: "Conoce a los profesionales de la red: especialidad, ubicación, experiencia y disponibilidad." },
      { property: "og:title", content: "Directorio de profesionales | Salud Viva" },
      { property: "og:description", content: "Encuentra al especialista indicado y agenda tu cita." },
    ],
  }),
  component: Profesionales,
});

function Profesionales() {
  const { especialidad } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState("");

  const results = useMemo(
    () =>
      professionals.filter(
        (p) =>
          (!especialidad || p.specialtySlug === especialidad) &&
          (p.name + p.specialty + p.city).toLowerCase().includes(q.trim().toLowerCase()),
      ),
    [q, especialidad],
  );

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Profesionales"
        title="Un equipo en el que puedes confiar"
        description="Profesionales verificados, con agenda actualizada y perfiles completos."
      />
      <section className="container-page py-16">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, especialidad o ciudad..."
            aria-label="Buscar profesional"
            className="h-12 rounded-xl pl-11"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => navigate({ search: {} })}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              !especialidad ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-secondary"
            }`}
          >
            Todas
          </button>
          {specialties.map((s) => (
            <button
              key={s.slug}
              onClick={() => navigate({ search: { especialidad: s.slug } })}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                especialidad === s.slug
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border hover:bg-secondary"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        {results.length === 0 ? (
          <div className="surface-card mt-8 p-10 text-center">
            <p className="font-semibold">Aún no hay profesionales para este filtro</p>
            <p className="mt-1 text-sm text-muted-foreground">Ajusta la búsqueda o revisa otra especialidad.</p>
            <Button
              className="mt-6"
              variant="outline"
              onClick={() => {
                setQ("");
                navigate({ search: {} });
              }}
            >
              Ver todos
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => (
              <ProfessionalCard key={p.id} professional={p} />
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}