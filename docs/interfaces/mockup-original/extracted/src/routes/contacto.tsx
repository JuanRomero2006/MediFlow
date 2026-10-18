import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto | Salud Viva" },
      { name: "description", content: "Escríbenos, llámanos o visita nuestras sedes en Neiva, Pitalito y Garzón." },
      { property: "og:title", content: "Contacto | Salud Viva" },
      { property: "og:description", content: "Canales de atención y sedes de la red Salud Viva." },
    ],
  }),
  component: Contacto,
});

function Contacto() {
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Mensaje enviado", {
        description: "Te responderemos al correo registrado en horario hábil.",
      });
      (e.target as HTMLFormElement).reset();
    }, 900);
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Contacto"
        title="Hablemos de tu atención"
        description="Resolvemos dudas sobre citas, servicios y sedes. También puedes usar el asistente en línea."
      />
      <section className="container-page grid gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-4">
          {[
            { icon: Phone, title: "Teléfono", text: "(608) 875 0000" },
            { icon: Mail, title: "Correo", text: "hola@saludviva.co" },
            { icon: MapPin, title: "Sede principal", text: "Calle 8 #12-45, Neiva" },
            { icon: Clock, title: "Horario", text: "Lun a Vie 7:00 - 19:00 · Sáb 8:00 - 13:00" },
          ].map((c) => (
            <div key={c.title} className="surface-card flex items-start gap-4 p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                <c.icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold">{c.title}</p>
                <p className="text-sm text-muted-foreground">{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="surface-card space-y-5 p-6 md:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input id="nombre" name="nombre" required placeholder="Juan Pérez" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" name="telefono" required placeholder="300 000 0000" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" name="email" type="email" required placeholder="tucorreo@ejemplo.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mensaje">¿En qué te ayudamos?</Label>
            <Textarea id="mensaje" name="mensaje" required rows={5} placeholder="Cuéntanos tu solicitud" />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            {loading ? "Enviando..." : "Enviar mensaje"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Este formulario es demostrativo: aún no está conectado a un backend de correo.
          </p>
        </form>
      </section>
    </SiteLayout>
  );
}