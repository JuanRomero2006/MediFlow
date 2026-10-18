import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { HeartPulse, Loader2, Stethoscope, User, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión | Salud Viva" },
      { name: "description", content: "Ingresa a tu cuenta de paciente, médico o recepción para gestionar citas y agenda." },
      { property: "og:title", content: "Iniciar sesión | Salud Viva" },
      { property: "og:description", content: "Acceso a paneles de paciente, médico y recepción." },
    ],
  }),
  component: Login,
});

const roles = [
  { id: "paciente", label: "Paciente", icon: User, to: "/panel/paciente" },
  { id: "medico", label: "Médico", icon: Stethoscope, to: "/panel/medico" },
  { id: "recepcion", label: "Recepción", icon: ClipboardList, to: "/panel/recepcion" },
] as const;

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<(typeof roles)[number]>(roles[0]);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(`Bienvenido · perfil ${role.label}`);
      navigate({ to: role.to });
    }, 700);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-5 py-12 sm:px-10 lg:px-16">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <HeartPulse className="size-5" />
          </span>
          <span className="font-display text-lg font-extrabold">Salud Viva</span>
        </Link>

        <div className="mt-10 w-full max-w-md">
          <h1 className="text-3xl font-extrabold">Ingresa a tu cuenta</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Elige tu perfil y accede a tu panel de gestión.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-2">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-2xl border p-3 text-center transition-colors ${
                  role.id === r.id ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-secondary"
                }`}
              >
                <r.icon className="mx-auto size-5" />
                <span className="mt-2 block text-xs font-semibold">{r.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" required placeholder="tucorreo@ejemplo.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" required placeholder="••••••••" />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </Button>
          </form>

          <p className="mt-6 text-xs text-muted-foreground">
            Demo de interfaz: la autenticación real aún no está conectada. Falta backend de usuarios
            y roles.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            ¿Solo quieres una cita?{" "}
            <Link to="/agendar" className="font-semibold text-primary">Solicítala aquí</Link>
          </p>
        </div>
      </div>

      <div className="hidden bg-primary-soft lg:flex lg:items-center lg:justify-center lg:p-16">
        <div className="max-w-sm">
          <h2 className="font-display text-3xl font-extrabold">Tu salud, organizada en un solo lugar</h2>
          <p className="mt-4 text-muted-foreground">
            Consulta tus próximas citas, tu historial de atención y la agenda de tu equipo desde
            cualquier dispositivo.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {["Citas y recordatorios", "Agenda por profesional", "Gestión operativa de recepción"].map((t) => (
              <li key={t} className="surface-card px-4 py-3">{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}