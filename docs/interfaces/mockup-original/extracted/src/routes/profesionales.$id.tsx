import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarDays, MapPin, Star, Clock, BriefcaseMedical } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { professionals, type Professional } from "@/lib/health-data";

export const Route = createFileRoute("/profesionales/$id")({
  loader: ({ params }): { professional: Professional } => {
    const professional = professionals.find((p) => p.id === params.id);
    if (!professional) throw notFound();
    return { professional };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Perfil no disponible | Salud Viva" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.professional;
    return {
      meta: [
        { title: `${p.name} · ${p.specialty} | Salud Viva` },
        { name: "description", content: `${p.name}, ${p.specialty} en ${p.city}. ${p.experience}. Agenda tu cita en línea.` },
        { property: "og:title", content: `${p.name} · ${p.specialty}` },
        { property: "og:description", content: p.bio },
      ],
    };
  },
  notFoundComponent: ProfileNotFound,
  component: ProfileDetail,
});

function ProfileNotFound() {
  return (
    <SiteLayout>
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-extrabold">No encontramos este perfil</h1>
        <p className="mt-2 text-muted-foreground">Puede que el profesional ya no esté disponible.</p>
        <Button className="mt-6" asChild>
          <Link to="/profesionales">Ver directorio</Link>
        </Button>
      </div>
    </SiteLayout>
  );
}

function ProfileDetail() {
  const { professional: p } = Route.useLoaderData();

  return (
    <SiteLayout>
      <section className="border-b border-border bg-card">
        <div className="container-page py-12 md:py-16">
          <Link to="/profesionales" className="text-sm font-medium text-primary">
            ← Volver al directorio
          </Link>
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="flex min-w-0 items-center gap-5">
              <span className="grid size-20 shrink-0 place-items-center rounded-3xl bg-primary-soft font-display text-2xl font-extrabold text-primary">
                {p.name.replace(/^Dr[a]?\.\s*/i, "").split(" ").slice(0, 2).map((w: string) => w[0]).join("")}
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-extrabold md:text-4xl">{p.name}</h1>
                <p className="mt-1 text-primary">{p.specialty}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="size-4" />{p.city}</span>
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Star className="size-4 fill-warning text-warning" />
                    {p.rating.toFixed(1)} <span className="font-normal text-muted-foreground">({p.reviews})</span>
                  </span>
                </div>
              </div>
            </div>
            <Button size="lg" asChild>
              <Link to="/agendar" search={{ profesional: p.id }}>Agendar cita</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-8 py-14 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-8">
          <div className="surface-card p-6">
            <h2 className="text-lg font-bold">Información profesional</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.bio}</p>
            <p className="mt-4 flex items-center gap-2 text-sm font-medium">
              <BriefcaseMedical className="size-4 text-primary" /> {p.experience}
            </p>
          </div>

          <div className="surface-card p-6">
            <h2 className="text-lg font-bold">Servicios</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {p.services.map((s: string) => (
                <li key={s} className="rounded-xl bg-secondary px-4 py-3 text-sm">{s}</li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="surface-card p-6">
            <h2 className="text-base font-bold">Horarios</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {p.schedule.map((h: string) => (
                <li key={h} className="flex items-center gap-2"><Clock className="size-4 shrink-0" />{h}</li>
              ))}
            </ul>
          </div>
          <div className="surface-card p-6">
            <h2 className="text-base font-bold">Ubicación</h2>
            <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0" />{p.address}
            </p>
          </div>
          <div className="rounded-3xl bg-primary-soft p-6">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <CalendarDays className="size-4" /> Próxima disponibilidad
            </p>
            <p className="mt-1 text-lg font-bold">{p.nextAvailable}</p>
            <Button className="mt-4 w-full" asChild>
              <Link to="/agendar" search={{ profesional: p.id }}>Agendar cita</Link>
            </Button>
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
}