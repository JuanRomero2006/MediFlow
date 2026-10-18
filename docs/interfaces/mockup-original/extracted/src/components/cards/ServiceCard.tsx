import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/lib/health-data";

export function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon;
  return (
    <article className="surface-card group flex flex-col p-6 transition-all hover:-translate-y-1 hover:shadow-soft">
      <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-5 text-lg font-bold">{service.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {service.description}
      </p>
      <Link
        to="/agendar"
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
      >
        Solicitar cita
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </article>
  );
}