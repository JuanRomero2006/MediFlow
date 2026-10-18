import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { faqs } from "@/lib/health-data";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Preguntas frecuentes | Salud Viva" },
      { name: "description", content: "Resuelve dudas sobre agendamiento, cancelaciones, sedes y servicios de la red Salud Viva." },
      { property: "og:title", content: "Preguntas frecuentes | Salud Viva" },
      { property: "og:description", content: "Todo sobre citas, cancelaciones y sedes de atención." },
    ],
  }),
  component: Faq,
});

function Faq() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Ayuda"
        title="Preguntas frecuentes"
        description="Las dudas más comunes sobre citas, servicios y atención."
      />
      <section className="container-page grid gap-10 py-16 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <aside className="surface-card h-fit p-6">
          <h2 className="text-lg font-bold">¿Sigues con dudas?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Escríbenos y te respondemos en horario hábil, o agenda directamente tu cita.
          </p>
          <div className="mt-6 grid gap-2">
            <Button asChild><Link to="/agendar">Solicitar cita</Link></Button>
            <Button variant="outline" asChild><Link to="/contacto">Contactar</Link></Button>
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
}