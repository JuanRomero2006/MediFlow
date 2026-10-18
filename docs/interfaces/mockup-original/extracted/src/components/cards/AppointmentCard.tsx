import { CalendarDays, Clock, MapPin } from "lucide-react";

export type Appointment = {
  specialty: string;
  professional: string;
  date: string;
  time: string;
  place: string;
  status?: "Confirmada" | "Pendiente" | "Cancelada" | "Atendida";
};

const statusStyles: Record<string, string> = {
  Confirmada: "bg-primary-soft text-primary",
  Pendiente: "bg-warning/15 text-warning-foreground",
  Cancelada: "bg-destructive/10 text-destructive",
  Atendida: "bg-secondary text-secondary-foreground",
};

export function AppointmentCard({
  appointment,
  action,
}: {
  appointment: Appointment;
  action?: React.ReactNode;
}) {
  return (
    <article className="surface-card p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{appointment.specialty}</p>
          <p className="truncate text-sm text-muted-foreground">{appointment.professional}</p>
        </div>
        {appointment.status && (
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[appointment.status]}`}
          >
            {appointment.status}
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5"><CalendarDays className="size-4" />{appointment.date}</span>
        <span className="flex items-center gap-1.5"><Clock className="size-4" />{appointment.time}</span>
        <span className="flex items-center gap-1.5"><MapPin className="size-4" />{appointment.place}</span>
      </div>
      {action && <div className="mt-4">{action}</div>}
    </article>
  );
}