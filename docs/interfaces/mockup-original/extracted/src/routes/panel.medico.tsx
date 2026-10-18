import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, CalendarDays, Users, Stethoscope, Clock, CheckCircle2 } from "lucide-react";
import { DashboardLayout, StatCard } from "@/components/dashboard/DashboardLayout";
import { AppointmentCard } from "@/components/cards/AppointmentCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/panel/medico")({
  head: () => ({
    meta: [
      { title: "Panel del médico | Salud Viva" },
      { name: "description", content: "Agenda del día, pacientes y disponibilidad para profesionales de la red." },
      { property: "og:title", content: "Panel del médico | Salud Viva" },
      { property: "og:description", content: "Gestiona tu agenda clínica y tus pacientes." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PanelMedico,
});

const nav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Agenda", icon: CalendarDays },
  { label: "Pacientes", icon: Users },
  { label: "Consultas", icon: Stethoscope },
  { label: "Disponibilidad", icon: Clock },
];

function PanelMedico() {
  return (
    <DashboardLayout role="médico" user="Dra. María Rodríguez" nav={nav}>
      <section>
        <h1 className="text-2xl font-extrabold md:text-3xl">Buenos días, Dra. Rodríguez 👋</h1>
        <p className="mt-1 text-muted-foreground">Tienes 8 citas programadas para hoy.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Citas de hoy" value="8" hint="Jornada 8:00 - 18:00" icon={CalendarDays} />
        <StatCard label="Pendientes" value="2" hint="Por confirmar llegada" icon={Clock} />
        <StatCard label="Atendidas" value="5" hint="Promedio 22 min" icon={CheckCircle2} />
      </section>

      <section className="rounded-3xl bg-primary-soft p-6">
        <p className="flex items-center gap-2 text-sm font-semibold text-primary"><Clock className="size-4" /> Próxima cita</p>
        <div className="mt-3 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0">
            <p className="truncate font-display text-xl font-extrabold">10:30 AM · Juan Pérez</p>
            <p className="truncate text-sm text-muted-foreground">Control de acné · Consultorio 3</p>
          </div>
          <Button>Ver agenda</Button>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold">Agenda de hoy</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {[
            { specialty: "Control de acné", professional: "Juan Pérez", time: "10:30 AM", status: "Confirmada" as const },
            { specialty: "Primera vez", professional: "Ana Gómez", time: "11:00 AM", status: "Pendiente" as const },
            { specialty: "Dermatoscopia", professional: "Luis Ramírez", time: "02:00 PM", status: "Confirmada" as const },
            { specialty: "Control", professional: "Marta Díaz", time: "09:00 AM", status: "Atendida" as const },
          ].map((a) => (
            <AppointmentCard
              key={a.time + a.professional}
              appointment={{ ...a, date: "Hoy", place: "Consultorio 3" }}
              action={<Button variant="outline" size="sm">Abrir consulta</Button>}
            />
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}