import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Stethoscope,
  CheckCircle2,
  XCircle,
  Search,
  Clock,
} from "lucide-react";
import { DashboardLayout, StatCard } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/panel/recepcion")({
  head: () => ({
    meta: [
      { title: "Panel de recepción | Salud Viva" },
      { name: "description", content: "Operación diaria: citas del día, confirmaciones, cancelaciones y disponibilidad." },
      { property: "og:title", content: "Panel de recepción | Salud Viva" },
      { property: "og:description", content: "Gestión operativa de agenda y pacientes." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PanelRecepcion,
});

const nav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Agenda", icon: CalendarDays },
  { label: "Pacientes", icon: Users },
  { label: "Citas", icon: Clock },
  { label: "Confirmaciones", icon: CheckCircle2 },
  { label: "Disponibilidad", icon: Stethoscope },
];

const rows = [
  { hora: "08:00", paciente: "Ana Gómez", profesional: "Dr. Andrés Pineda", estado: "Confirmada" },
  { hora: "09:00", paciente: "Marta Díaz", profesional: "Dra. María Rodríguez", estado: "Atendida" },
  { hora: "10:30", paciente: "Juan Pérez", profesional: "Dra. María Rodríguez", estado: "Pendiente" },
  { hora: "11:15", paciente: "Luis Ramírez", profesional: "Dr. Julián Ortiz", estado: "Pendiente" },
  { hora: "14:00", paciente: "Sara Muñoz", profesional: "Dr. Carlos Méndez", estado: "Cancelada" },
];

const badge: Record<string, string> = {
  Confirmada: "bg-primary-soft text-primary",
  Pendiente: "bg-warning/15 text-warning-foreground",
  Cancelada: "bg-destructive/10 text-destructive",
  Atendida: "bg-secondary text-secondary-foreground",
};

function PanelRecepcion() {
  return (
    <DashboardLayout role="recepción" user="Camila Torres" nav={nav}>
      <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold md:text-3xl">Operación del día</h1>
          <p className="mt-1 text-muted-foreground">Lunes 10 de agosto · 4 sedes activas</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar paciente o cita..." aria-label="Búsqueda rápida" className="h-11 rounded-xl pl-10" />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Citas del día" value="34" hint="6 sin confirmar" icon={CalendarDays} />
        <StatCard label="Confirmaciones" value="22" hint="Actualizado 8:40 AM" icon={CheckCircle2} />
        <StatCard label="Cancelaciones" value="3" hint="2 reprogramadas" icon={XCircle} />
        <StatCard label="Profesionales" value="9" hint="1 sin disponibilidad" icon={Stethoscope} />
      </section>

      <section className="surface-card overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border p-5">
          <h2 className="truncate text-lg font-bold">Citas de hoy</h2>
          <Button size="sm" variant="outline">Exportar</Button>
        </div>

        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Hora</th>
                <th className="px-5 py-3">Paciente</th>
                <th className="px-5 py-3">Profesional</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.hora + r.paciente} className="border-t border-border">
                  <td className="px-5 py-4 font-medium">{r.hora}</td>
                  <td className="px-5 py-4">{r.paciente}</td>
                  <td className="px-5 py-4 text-muted-foreground">{r.profesional}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge[r.estado]}`}>{r.estado}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button size="sm" variant="outline">Gestionar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="divide-y divide-border md:hidden">
          {rows.map((r) => (
            <li key={r.hora + r.paciente} className="p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{r.hora} · {r.paciente}</p>
                  <p className="truncate text-sm text-muted-foreground">{r.profesional}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${badge[r.estado]}`}>{r.estado}</span>
              </div>
              <Button size="sm" variant="outline" className="mt-3 w-full">Gestionar</Button>
            </li>
          ))}
        </ul>
      </section>
    </DashboardLayout>
  );
}