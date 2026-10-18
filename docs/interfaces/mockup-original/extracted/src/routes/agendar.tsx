import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronLeft, CalendarDays, Clock, MapPin, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { professionals, specialties, timeSlots } from "@/lib/health-data";

type SearchParams = { profesional?: string | undefined; especialidad?: string | undefined };

export const Route = createFileRoute("/agendar")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    profesional: typeof search["profesional"] === "string" ? (search["profesional"] as string) : undefined,
    especialidad: typeof search["especialidad"] === "string" ? (search["especialidad"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Solicitar cita médica | Salud Viva" },
      { name: "description", content: "Agenda tu cita en 6 pasos: especialidad, profesional, fecha, horario, datos y confirmación." },
      { property: "og:title", content: "Solicitar cita médica | Salud Viva" },
      { property: "og:description", content: "Un proceso guiado para reservar tu atención en minutos." },
    ],
  }),
  component: Agendar,
});

const steps = ["Especialidad", "Profesional", "Fecha", "Horario", "Paciente", "Confirmación"];

function nextDays(count: number) {
  const out: { iso: string; day: string; num: string; month: string }[] = [];
  const base = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push({
      iso: d.toISOString().slice(0, 10),
      day: d.toLocaleDateString("es-CO", { weekday: "short" }),
      num: String(d.getDate()),
      month: d.toLocaleDateString("es-CO", { month: "short" }),
    });
  }
  return out;
}

function Agendar() {
  const search = Route.useSearch();
  const preselected = professionals.find((p) => p.id === search.profesional);

  const [step, setStep] = useState(preselected ? 2 : 0);
  const [specialty, setSpecialty] = useState<string | undefined>(
    preselected?.specialtySlug ?? search.especialidad,
  );
  const [professionalId, setProfessionalId] = useState<string | undefined>(preselected?.id);
  const [date, setDate] = useState<string | undefined>(undefined);
  const [time, setTime] = useState<string | undefined>(undefined);
  const [patient, setPatient] = useState({ nombre: "", documento: "", telefono: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const days = useMemo(() => nextDays(10), []);
  const filtered = useMemo(
    () => professionals.filter((p) => !specialty || p.specialtySlug === specialty),
    [specialty],
  );
  const professional = professionals.find((p) => p.id === professionalId);
  const selectedDay = days.find((d) => d.iso === date);

  const canContinue = [
    Boolean(specialty),
    Boolean(professionalId),
    Boolean(date),
    Boolean(time),
    patient.nombre.trim().length > 2 && patient.telefono.trim().length > 6,
    true,
  ][step];

  const confirm = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setDone(true);
      toast.success("Cita confirmada", { description: "Te enviamos el detalle por correo." });
    }, 900);
  };

  if (done) {
    return (
      <SiteLayout>
        <section className="container-page flex justify-center py-20">
          <div className="surface-card w-full max-w-lg p-8 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-primary-soft text-primary">
              <Check className="size-8" />
            </span>
            <h1 className="mt-6 text-2xl font-extrabold">Tu cita quedó confirmada</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Recibirás un recordatorio 24 horas antes de la atención.
            </p>
            <div className="mt-6 space-y-3 rounded-2xl bg-secondary p-5 text-left text-sm">
              <p className="flex items-center gap-2"><User className="size-4 text-primary" />{professional?.name} · {professional?.specialty}</p>
              <p className="flex items-center gap-2"><CalendarDays className="size-4 text-primary" />{selectedDay?.day} {selectedDay?.num} {selectedDay?.month}</p>
              <p className="flex items-center gap-2"><Clock className="size-4 text-primary" />{time}</p>
              <p className="flex items-center gap-2"><MapPin className="size-4 text-primary" />{professional?.address}</p>
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <Button variant="outline" asChild><Link to="/">Volver al inicio</Link></Button>
              <Button asChild><Link to="/panel/paciente">Ver mis citas</Link></Button>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="container-page py-12 md:py-16">
        <h1 className="text-2xl font-extrabold md:text-4xl">Solicitar cita</h1>
        <p className="mt-2 text-muted-foreground">Sigue los pasos, toma menos de 2 minutos.</p>

        <ol className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <li key={s} className="flex shrink-0 items-center gap-2">
              <span
                className={`grid size-7 place-items-center rounded-full text-xs font-bold ${
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                      ? "bg-primary-soft text-primary ring-2 ring-primary"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span className={`text-sm ${i === step ? "font-semibold" : "text-muted-foreground"}`}>{s}</span>
              {i < steps.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
            </li>
          ))}
        </ol>

        <div className="surface-card mt-8 p-6 md:p-8">
          {step === 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {specialties.map((s) => (
                <button
                  key={s.slug}
                  onClick={() => { setSpecialty(s.slug); setProfessionalId(undefined); }}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    specialty === s.slug ? "border-primary bg-primary-soft" : "border-border hover:bg-secondary"
                  }`}
                >
                  <p className="font-semibold">{s.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.professionals} profesionales</p>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No hay profesionales disponibles para esta especialidad.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filtered.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProfessionalId(p.id)}
                    className={`rounded-2xl border p-4 text-left transition-colors ${
                      professionalId === p.id ? "border-primary bg-primary-soft" : "border-border hover:bg-secondary"
                    }`}
                  >
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-primary">{p.specialty}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{p.city} · {p.experience}</p>
                  </button>
                ))}
              </div>
            )
          )}

          {step === 2 && (
            <div className="flex flex-wrap gap-3">
              {days.map((d) => (
                <button
                  key={d.iso}
                  onClick={() => setDate(d.iso)}
                  className={`w-20 rounded-2xl border p-3 text-center transition-colors ${
                    date === d.iso ? "border-primary bg-primary-soft" : "border-border hover:bg-secondary"
                  }`}
                >
                  <p className="text-xs uppercase text-muted-foreground">{d.day}</p>
                  <p className="font-display text-xl font-bold">{d.num}</p>
                  <p className="text-xs text-muted-foreground">{d.month}</p>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {timeSlots.map((t, i) => {
                const disabled = i === 2;
                return (
                  <button
                    key={t}
                    disabled={disabled}
                    onClick={() => setTime(t)}
                    className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      time === t ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-secondary"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input id="nombre" value={patient.nombre} onChange={(e) => setPatient({ ...patient, nombre: e.target.value })} placeholder="Juan Pérez" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documento">Documento</Label>
                <Input id="documento" value={patient.documento} onChange={(e) => setPatient({ ...patient, documento: e.target.value })} placeholder="1075..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" value={patient.telefono} onChange={(e) => setPatient({ ...patient, telefono: e.target.value })} placeholder="300 000 0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input id="email" type="email" value={patient.email} onChange={(e) => setPatient({ ...patient, email: e.target.value })} placeholder="tucorreo@ejemplo.com" />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3 text-sm">
              <h2 className="text-lg font-bold">Revisa tu cita</h2>
              <div className="grid gap-3 rounded-2xl bg-secondary p-5 sm:grid-cols-2">
                <p><span className="text-muted-foreground">Especialidad:</span> {professional?.specialty}</p>
                <p><span className="text-muted-foreground">Profesional:</span> {professional?.name}</p>
                <p><span className="text-muted-foreground">Fecha:</span> {selectedDay?.day} {selectedDay?.num} {selectedDay?.month}</p>
                <p><span className="text-muted-foreground">Hora:</span> {time}</p>
                <p><span className="text-muted-foreground">Paciente:</span> {patient.nombre}</p>
                <p><span className="text-muted-foreground">Contacto:</span> {patient.telefono}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Demo: la cita no se guarda en un servidor todavía. Falta conectar backend de citas.
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button
              variant="ghost"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              <ChevronLeft /> Atrás
            </Button>
            {step < steps.length - 1 ? (
              <Button size="lg" disabled={!canContinue} onClick={() => setStep((s) => s + 1)}>
                Continuar
              </Button>
            ) : (
              <Button size="lg" disabled={saving} onClick={confirm}>
                {saving && <Loader2 className="animate-spin" />}
                {saving ? "Confirmando..." : "Confirmar cita"}
              </Button>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}