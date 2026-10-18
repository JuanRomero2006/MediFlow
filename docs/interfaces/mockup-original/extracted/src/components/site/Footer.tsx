import { Link } from "@tanstack/react-router";
import { HeartPulse, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <HeartPulse className="size-5" />
            </span>
            <span className="font-display text-lg font-extrabold">Salud Viva</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Plataforma de servicios de salud para agendar citas, encontrar especialistas y hacer
            seguimiento a tu atención.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Plataforma</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/servicios" className="hover:text-foreground">Servicios</Link></li>
            <li><Link to="/especialidades" className="hover:text-foreground">Especialidades</Link></li>
            <li><Link to="/profesionales" className="hover:text-foreground">Profesionales</Link></li>
            <li><Link to="/agendar" className="hover:text-foreground">Solicitar cita</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Compañía</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/nosotros" className="hover:text-foreground">Nosotros</Link></li>
            <li><Link to="/faq" className="hover:text-foreground">Preguntas frecuentes</Link></li>
            <li><Link to="/contacto" className="hover:text-foreground">Contacto</Link></li>
            <li><Link to="/login" className="hover:text-foreground">Iniciar sesión</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Contacto</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><Phone className="mt-0.5 size-4 shrink-0" /> (608) 875 0000</li>
            <li className="flex items-start gap-2"><Mail className="mt-0.5 size-4 shrink-0" /> hola@saludviva.co</li>
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0" /> Calle 8 #12-45, Neiva</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6">
        <p className="container-page text-xs text-muted-foreground">
          © {new Date().getFullYear()} Salud Viva. Información con fines demostrativos, no
          constituye asesoría médica.
        </p>
      </div>
    </footer>
  );
}