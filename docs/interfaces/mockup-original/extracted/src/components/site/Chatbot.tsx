import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircle, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

type Msg = { from: "bot" | "user"; text: string };

const quick = [
  { label: "Agendar cita", answer: "Puedes agendar en 6 pasos: especialidad, profesional, fecha, horario, datos y confirmación." },
  { label: "Ver profesionales", answer: "Tenemos profesionales en Neiva, Pitalito y Garzón. Filtra por especialidad en el directorio." },
  { label: "Ver servicios", answer: "Ofrecemos medicina general, especialidades, laboratorio, odontología y atención domiciliaria." },
  { label: "Ubicaciones", answer: "Sede Centro y Norte en Neiva, más sedes en Pitalito y Garzón. Horario de lunes a sábado." },
  { label: "Cancelar cita", answer: "Desde Mis citas en tu panel puedes cancelar o reprogramar hasta 4 horas antes." },
];

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      from: "bot",
      text: "Hola 👋 Soy el asistente de Salud Viva. Puedo ayudarte con citas, servicios y ubicaciones. No entrego diagnósticos médicos.",
    },
  ]);

  const ask = (q: (typeof quick)[number]) =>
    setMessages((m) => [...m, { from: "user", text: q.label }, { from: "bot", text: q.answer }]);

  return (
    <>
      {open && (
        <div className="fixed inset-x-4 bottom-24 z-50 flex max-h-[70vh] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft sm:inset-x-auto sm:right-6 sm:w-[22rem]">
          <div className="flex items-center gap-3 border-b border-border bg-primary-soft px-4 py-3">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Bot className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Asistente Salud Viva</p>
              <p className="text-xs text-muted-foreground">Responde al instante</p>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto" aria-label="Cerrar chat" onClick={() => setOpen(false)}>
              <X />
            </Button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.from === "bot"
                    ? "max-w-[85%] rounded-2xl rounded-tl-sm bg-secondary px-3 py-2 text-sm"
                    : "ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                }
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-border p-3">
            <div className="flex flex-wrap gap-2">
              {quick.map((q) => (
                <button
                  key={q.label}
                  onClick={() => ask(q)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
                >
                  {q.label}
                </button>
              ))}
            </div>
            <Button className="w-full" asChild onClick={() => setOpen(false)}>
              <Link to="/agendar">Solicitar cita</Link>
            </Button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.03] sm:right-6"
      >
        <MessageCircle className="size-4" />
        {open ? "Cerrar" : "¿Necesitas ayuda?"}
      </button>
    </>
  );
}