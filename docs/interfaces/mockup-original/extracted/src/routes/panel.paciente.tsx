import { createFileRoute, Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarPlus,
  FileClock,
  User,
  Bell,
  Clock,
} from "lucide-react";
import { DashboardLayout, StatCard } from "@/components/dashboard/DashboardLayout";
import { AppointmentCard } from "@/components/cards/AppointmentCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/panel/paciente")({
  head: () => ({
    meta: [
      { title: "Panel del paciente | Salud Viva" },
      { name: "description", content: "Consulta tu próxima cita, agenda nuevas consultas y revisa tu historial de atención." },
      { property: "og:title", content: "Panel del paciente | Salud Viva" },
      { property: "og:description", content: "Tus citas, historial y notificaciones en un solo lugar." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PanelPaciente,
});

const nav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Mis citas", icon: CalendarDays },
  { label: "Agendar cita", icon: CalendarPlus },
  { label: "Historial", icon: FileClock },
  { label: "Notificaciones", icon: Bell },
  { label: "Mi perfil", icon: User },
];

function PanelPaciente() {
  return (
    <DashboardLayout role="paciente" user="Juan Pérez" nav={nav}>
      <section>
        <h1 className="text-2xl font-extrabold md:text-3xl">Hola, Juan 👋</h1>
        <p className="mt-1 text-muted-foreground">Este es el resumen de tu atención.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Citas próximas" value="2" hint="1 esta semana" icon={CalendarDays} />
        <StatCard label="Atenciones 2026" value="7" hint="Última: 12 jul" icon={FileClock} />
        <StatCard label="Notificaciones" value="3" hint="1 requiere acción" icon={Bell} />
      </section>

      <section className="rounded-3xl bg-primary-soft p-6">
        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Clock className="size-4" /> Próxima cita
        </p>
        <div className="mt-3 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0">
            <p className="truncate font-display text-xl font-extrabold">Dermatología</p>
            <p className="truncate text-sm text-muted-foreground">Dra. María Rodríguez · Sede Centro</p>
            <p className="mt-1 text-sm font-medium">18 Ago · 10:30 AM</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Reprogramar</Button>
            <Button>Ver cita</Button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold">Acciones rápidas</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Agendar cita", icon: CalendarPlus, to: "/agendar" as const },
            { label: "Mis citas", icon: CalendarDays },
            { label: "Historial", icon: FileClock },
            { label: "Mi perfil", icon: User },
          ].map((a) =>
            a.to ? (
              <Link key={a.label} to={a.to} className="surface-card flex items-center gap-3 p-4 transition-colors hover:bg-secondary">
                <a.icon className="size-5 text-primary" />
                <span className="text-sm font-semibold">{a.label}</span>
              </Link>
            ) : (
              <button key={a.label} className="surface-card flex items-center gap-3 p-4 text-left transition-colors hover:bg-secondary">
                <a.icon className="size-5 text-primary" />
                <span className="text-sm font-semibold">{a.label}</span>
              </button>
            ),
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold">Mis citas</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <AppointmentCard
            appointment={{ specialty: "Dermatología", professional: "Dra. María Rodríguez", date: "18 Ago", time: "10:30 AM", place: "Sede Centro", status: "Confirmada" }}
            action={<Button variant="outline" size="sm">Ver detalle</Button>}
          />
          <AppointmentCard
            appointment={{ specialty: "Odontología", professional: "Dr. Julián Ortiz", date: "26 Ago", time: "09:00 AM", place: "Sede Norte", status: "Pendiente" }}
            action={<Button variant="outline" size="sm">Confirmar</Button>}
          />
        </div>
      </section>
    </DashboardLayout>
  );
}