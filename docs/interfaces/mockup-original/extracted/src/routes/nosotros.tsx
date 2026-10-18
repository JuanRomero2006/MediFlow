import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, HeartHandshake, Timer, Users } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/nosotros")({
  head: () => ({
    meta: [
      { title: "Nosotros | Salud Viva" },
      { name: "description", content: "Conoce a Salud Viva: red de profesionales y sedes con atención humana y tecnología simple." },
      { property: "og:title", content: "Nosotros | Salud Viva" },
      { property: "og:description", content: "Red de profesionales de salud con atención humana y agendamiento digital." },
    ],
  }),
  component: Nosotros,
});

const values = [
  { icon: HeartHandshake, title: "Atención humana", text: "Cada consulta empieza por escuchar. Tecnología al servicio de las personas." },
  { icon: ShieldCheck, title: "Profesionales verificados", text: "Validamos títulos, registro y experiencia de cada profesional de la red." },
  { icon: Timer, title: "Tiempos claros", text: "Agenda transparente, recordatorios y confirmación de cada cita." },
  { icon: Users, title: "Cobertura regional", text: "Sedes en Neiva, Pitalito y Garzón, más atención domiciliaria." },
];

function Nosotros() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Nosotros"
        title="Salud cercana, con procesos simples"
        description="Somos una red de profesionales de la salud que integra agendamiento digital, historia de atención y acompañamiento en cada etapa del cuidado."
      />

      <section className="container-page py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.title} className="surface-card p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
                <v.icon className="size-5" />
              </span>
              <h2 className="mt-5 text-base font-bold">{v.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-extrabold md:text-3xl">Nuestro propósito</h2>
            <p className="mt-4 text-muted-foreground">
              Queremos que pedir una cita médica sea tan simple como enviar un mensaje. Por eso
              reunimos en una sola plataforma la agenda de los profesionales, los servicios de la
              red y la información que el paciente necesita para decidir.
            </p>
            <p className="mt-4 text-muted-foreground">
              Trabajamos con equipos clínicos y administrativos para que la experiencia sea
              consistente antes, durante y después de la consulta.
            </p>
            <Button className="mt-8" size="lg" asChild>
              <Link to="/agendar">Solicitar cita</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { k: "+45", v: "Profesionales en la red" },
              { k: "4", v: "Sedes de atención" },
              { k: "20+", v: "Especialidades" },
              { k: "98%", v: "Citas confirmadas" },
            ].map((s) => (
              <div key={s.v} className="surface-card p-6">
                <p className="font-display text-3xl font-extrabold text-primary">{s.k}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}