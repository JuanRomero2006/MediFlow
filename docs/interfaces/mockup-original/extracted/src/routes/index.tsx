import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, CheckCircle2, ShieldCheck, Star, Clock } from "lucide-react";
import heroImage from "@/assets/hero-doctor.jpg";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { SpecialtyCard } from "@/components/cards/SpecialtyCard";
import { ProfessionalCard } from "@/components/cards/ProfessionalCard";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs, professionals, services, specialties } from "@/lib/health-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Salud Viva | Agenda tus citas médicas en línea" },
      {
        name: "description",
        content:
          "Agenda citas médicas, encuentra especialistas verificados y accede a servicios de salud de forma sencilla en Neiva, Pitalito y Garzón.",
      },
      { property: "og:title", content: "Salud Viva | Tu salud, más cerca y más fácil" },
      {
        property: "og:description",
        content: "Citas médicas en línea, especialistas verificados y servicios de salud en un solo lugar.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-card">
        <div className="container-page grid gap-12 py-14 md:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-1.5 text-xs font-semibold text-primary">
              <ShieldCheck className="size-3.5" /> Profesionales verificados
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] md:text-6xl">
              Tu salud, más cerca y más fácil.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              Agenda tus citas médicas, encuentra especialistas y accede a nuestros servicios de
              salud de forma sencilla.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link to="/agendar">Solicitar cita</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/servicios">Conocer nuestros servicios</Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
              {[
                { k: "+45", v: "Profesionales" },
                { k: "20+", v: "Especialidades" },
                { k: "4", v: "Sedes" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="font-display text-2xl font-extrabold text-primary">{s.k}</dt>
                  <dd className="text-xs text-muted-foreground">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-border">
              <img
                src={heroImage}
                alt="Profesional de la salud sonriendo en un consultorio moderno"
                width={1200}
                height={1400}
                className="h-[24rem] w-full object-cover object-top md:h-[32rem]"
              />
            </div>

            <div className="surface-card absolute -left-2 bottom-6 w-64 p-4 shadow-soft sm:left-6 md:animate-float-soft">
              <p className="flex items-center gap-2 text-xs font-semibold text-primary">
                <CalendarCheck className="size-4" /> Próxima cita
              </p>
              <p className="mt-2 text-sm font-bold">Dermatología</p>
              <p className="text-xs text-muted-foreground">Dra. María Rodríguez</p>
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium">
                <Clock className="size-3.5" /> 18 Ago · 10:30 AM
              </p>
            </div>

            <div className="surface-card absolute right-0 top-6 hidden w-52 p-4 shadow-soft sm:block">
              <p className="text-xs text-muted-foreground">Disponibilidad hoy</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-bold">
                <span className="size-2 rounded-full bg-success" /> 12 agendas abiertas
              </p>
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="size-3.5 fill-warning text-warning" /> 4.9 de satisfacción
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="container-page py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Servicios</p>
          <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">Atención completa, sin trámites</h2>
          <p className="mt-3 text-muted-foreground">
            Elige el servicio que necesitas y agenda en línea con disponibilidad real.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
      </section>

      {/* Especialidades */}
      <section className="bg-card py-20">
        <div className="container-page">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Especialidades</p>
              <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">Encuentra la atención que necesitas</h2>
              <p className="mt-3 text-muted-foreground">
                Explora las especialidades disponibles y agenda con el profesional indicado.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/especialidades">Ver todas las especialidades</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {specialties.map((s) => (
              <SpecialtyCard key={s.slug} specialty={s} />
            ))}
          </div>
        </div>
      </section>

      {/* Profesionales */}
      <section className="container-page py-20">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Profesionales</p>
            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">Conoce a nuestro equipo</h2>
            <p className="mt-3 text-muted-foreground">
              Perfiles con experiencia, ubicación y disponibilidad al día.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/profesionales">Ver directorio</Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.slice(0, 3).map((p) => (
            <ProfessionalCard key={p.id} professional={p} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page">
        <div className="grid gap-8 rounded-[2rem] bg-primary p-8 text-primary-foreground md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-12">
          <div>
            <h2 className="text-2xl font-extrabold md:text-4xl">Agenda tu cita en menos de 2 minutos</h2>
            <ul className="mt-6 grid gap-2 text-sm md:grid-cols-3">
              {["Sin llamadas", "Confirmación inmediata", "Recordatorios automáticos"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/agendar">
              Solicitar cita <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page grid gap-10 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Ayuda</p>
          <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">Preguntas frecuentes</h2>
          <p className="mt-3 text-muted-foreground">
            ¿Necesitas algo más? Escríbenos o usa el asistente en línea.
          </p>
          <Button className="mt-6" variant="outline" asChild>
            <Link to="/contacto">Contactar</Link>
          </Button>
        </div>
        <Accordion type="single" collapsible>
          {faqs.slice(0, 4).map((f, i) => (
            <AccordionItem key={f.q} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </SiteLayout>
  );
}
