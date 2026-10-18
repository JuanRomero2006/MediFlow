import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { SpecialtyCard } from "@/components/cards/SpecialtyCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { specialties } from "@/lib/health-data";

export const Route = createFileRoute("/especialidades")({
  head: () => ({
    meta: [
      { title: "Especialidades médicas | Salud Viva" },
      { name: "description", content: "Busca entre dermatología, pediatría, cardiología, ginecología y más especialidades disponibles." },
      { property: "og:title", content: "Especialidades médicas | Salud Viva" },
      { property: "og:description", content: "Encuentra la atención que necesitas y agenda con un especialista." },
    ],
  }),
  component: Especialidades,
});

function Especialidades() {
  const [q, setQ] = useState("");
  const results = useMemo(
    () => specialties.filter((s) => s.name.toLowerCase().includes(q.trim().toLowerCase())),
    [q],
  );

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Especialidades"
        title="Encuentra la atención que necesitas"
        description="Explora las especialidades disponibles en la red y agenda directamente con el profesional."
      />
      <section className="container-page py-16">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar especialidad..."
            aria-label="Buscar especialidad"
            className="h-12 rounded-xl pl-11"
          />
        </div>

        {results.length === 0 ? (
          <div className="surface-card mt-8 p-10 text-center">
            <p className="font-semibold">Sin resultados para “{q}”</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Prueba con otro término o consulta con medicina general.
            </p>
            <Button className="mt-6" variant="outline" onClick={() => setQ("")}>
              Limpiar búsqueda
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((s) => (
              <SpecialtyCard key={s.slug} specialty={s} />
            ))}
          </div>
        )}

        <div className="mt-10">
          <Button variant="outline" size="lg" asChild>
            <Link to="/profesionales">Ver profesionales disponibles</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}