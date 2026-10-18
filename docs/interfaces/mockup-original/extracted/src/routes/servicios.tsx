import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { Button } from "@/components/ui/button";
import { services } from "@/lib/health-data";

export const Route = createFileRoute("/servicios")({
  head: () => ({
    meta: [
      { title: "Servicios de salud | Salud Viva" },
      { name: "description", content: "Medicina general, especialidades, laboratorio, odontología y atención domiciliaria con agenda en línea." },
      { property: "og:title", content: "Servicios de salud | Salud Viva" },
      { property: "og:description", content: "Conoce los servicios de la red y solicita tu cita en minutos." },
    ],
  }),
  component: Servicios,
});

function Servicios() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Servicios"
        title="Todo lo que necesitas para tu atención"
        description="Servicios diseñados para resolver desde una consulta puntual hasta el seguimiento continuo de tu salud."
      />
      <section className="container-page py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start gap-4 rounded-3xl bg-primary-soft p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold">¿No sabes qué servicio necesitas?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Empieza por medicina general y te orientamos a la especialidad correcta.
            </p>
          </div>
          <Button size="lg" asChild>
            <Link to="/agendar">Solicitar cita</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}