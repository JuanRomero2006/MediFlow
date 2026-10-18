import {
  Stethoscope,
  HeartPulse,
  FlaskConical,
  Smile,
  Home,
  Baby,
  Sparkles,
  Venus,
  type LucideIcon,
} from "lucide-react";

export type Service = {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
};

export const services: Service[] = [
  {
    slug: "medicina-general",
    name: "Medicina general",
    description: "Consulta médica integral para diagnóstico, control y remisión a especialistas.",
    icon: Stethoscope,
  },
  {
    slug: "especialidades",
    name: "Especialidades médicas",
    description: "Más de 20 especialidades con profesionales verificados y agenda en línea.",
    icon: HeartPulse,
  },
  {
    slug: "laboratorio",
    name: "Laboratorio clínico",
    description: "Toma de muestras y resultados digitales disponibles en tu cuenta.",
    icon: FlaskConical,
  },
  {
    slug: "odontologia",
    name: "Odontología",
    description: "Salud oral preventiva, estética y tratamientos especializados.",
    icon: Smile,
  },
  {
    slug: "domiciliaria",
    name: "Atención domiciliaria",
    description: "Valoración y cuidado profesional en casa para pacientes que lo requieren.",
    icon: Home,
  },
];

export type Specialty = {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  professionals: number;
};

export const specialties: Specialty[] = [
  {
    slug: "medicina-general",
    name: "Medicina general",
    description: "Primera línea de atención y control de salud.",
    icon: Stethoscope,
    professionals: 12,
  },
  {
    slug: "dermatologia",
    name: "Dermatología",
    description: "Piel, cabello y uñas.",
    icon: Sparkles,
    professionals: 6,
  },
  {
    slug: "pediatria",
    name: "Pediatría",
    description: "Atención para niñas y niños.",
    icon: Baby,
    professionals: 8,
  },
  {
    slug: "cardiologia",
    name: "Cardiología",
    description: "Corazón y sistema circulatorio.",
    icon: HeartPulse,
    professionals: 5,
  },
  {
    slug: "ginecologia",
    name: "Ginecología",
    description: "Salud femenina y control prenatal.",
    icon: Venus,
    professionals: 7,
  },
  {
    slug: "odontologia",
    name: "Odontología",
    description: "Salud oral integral.",
    icon: Smile,
    professionals: 9,
  },
];

export type Professional = {
  id: string;
  name: string;
  specialty: string;
  specialtySlug: string;
  city: string;
  rating: number;
  reviews: number;
  experience: string;
  bio: string;
  services: string[];
  schedule: string[];
  address: string;
  nextAvailable: string;
};

export const professionals: Professional[] = [
  {
    id: "maria-rodriguez",
    name: "Dra. María Rodríguez",
    specialty: "Dermatología",
    specialtySlug: "dermatologia",
    city: "Neiva",
    rating: 4.9,
    reviews: 128,
    experience: "12 años de experiencia",
    bio: "Dermatóloga clínica enfocada en salud de la piel, acné y dermatología estética con enfoque preventivo.",
    services: ["Consulta dermatológica", "Control de acné", "Dermatoscopia", "Procedimientos menores"],
    schedule: ["Lun a Vie · 8:00 - 12:00", "Lun, Mié, Vie · 14:00 - 18:00"],
    address: "Sede Centro · Calle 8 #12-45, Neiva",
    nextAvailable: "Hoy · 4:30 PM",
  },
  {
    id: "carlos-mendez",
    name: "Dr. Carlos Méndez",
    specialty: "Cardiología",
    specialtySlug: "cardiologia",
    city: "Neiva",
    rating: 4.8,
    reviews: 96,
    experience: "15 años de experiencia",
    bio: "Cardiólogo con énfasis en prevención cardiovascular, hipertensión y rehabilitación cardiaca.",
    services: ["Consulta cardiológica", "Electrocardiograma", "Control de hipertensión"],
    schedule: ["Mar a Jue · 7:00 - 13:00"],
    address: "Sede Norte · Carrera 5 #40-12, Neiva",
    nextAvailable: "Mañana · 9:00 AM",
  },
  {
    id: "laura-castro",
    name: "Dra. Laura Castro",
    specialty: "Pediatría",
    specialtySlug: "pediatria",
    city: "Pitalito",
    rating: 5,
    reviews: 210,
    experience: "10 años de experiencia",
    bio: "Pediatra dedicada al crecimiento y desarrollo infantil, vacunación y acompañamiento a familias.",
    services: ["Consulta pediátrica", "Control de crecimiento", "Asesoría en lactancia"],
    schedule: ["Lun a Sáb · 8:00 - 14:00"],
    address: "Sede Pitalito · Calle 3 #7-20",
    nextAvailable: "Hoy · 6:00 PM",
  },
  {
    id: "andres-pineda",
    name: "Dr. Andrés Pineda",
    specialty: "Medicina general",
    specialtySlug: "medicina-general",
    city: "Neiva",
    rating: 4.7,
    reviews: 74,
    experience: "8 años de experiencia",
    bio: "Médico general con enfoque en atención primaria, control de enfermedades crónicas y medicina preventiva.",
    services: ["Consulta general", "Control de crónicos", "Certificados médicos"],
    schedule: ["Lun a Vie · 6:00 - 14:00"],
    address: "Sede Centro · Calle 8 #12-45, Neiva",
    nextAvailable: "Hoy · 2:00 PM",
  },
  {
    id: "sofia-vargas",
    name: "Dra. Sofía Vargas",
    specialty: "Ginecología",
    specialtySlug: "ginecologia",
    city: "Garzón",
    rating: 4.9,
    reviews: 143,
    experience: "14 años de experiencia",
    bio: "Ginecóloga y obstetra con acompañamiento integral en control prenatal y salud reproductiva.",
    services: ["Consulta ginecológica", "Control prenatal", "Citología"],
    schedule: ["Mié a Vie · 8:00 - 16:00"],
    address: "Sede Garzón · Carrera 10 #6-30",
    nextAvailable: "Jue · 11:00 AM",
  },
  {
    id: "julian-ortiz",
    name: "Dr. Julián Ortiz",
    specialty: "Odontología",
    specialtySlug: "odontologia",
    city: "Neiva",
    rating: 4.8,
    reviews: 88,
    experience: "9 años de experiencia",
    bio: "Odontólogo general y estético, enfocado en rehabilitación oral y prevención.",
    services: ["Consulta odontológica", "Profilaxis", "Blanqueamiento", "Resinas"],
    schedule: ["Lun a Vie · 9:00 - 18:00"],
    address: "Sede Norte · Carrera 5 #40-12, Neiva",
    nextAvailable: "Hoy · 5:15 PM",
  },
];

export const timeSlots = [
  "07:00 AM",
  "08:30 AM",
  "09:00 AM",
  "10:30 AM",
  "11:00 AM",
  "02:00 PM",
  "03:30 PM",
  "04:30 PM",
];

export const faqs = [
  {
    q: "¿Cómo agendo una cita médica?",
    a: "Ingresa a Solicitar cita, elige la especialidad, el profesional, la fecha y el horario disponible. Confirmas tus datos y recibes el resumen de tu cita.",
  },
  {
    q: "¿Necesito una cuenta para agendar?",
    a: "Puedes iniciar el proceso sin cuenta. Al confirmar te pedimos tus datos de contacto para enviarte el recordatorio y el detalle de la cita.",
  },
  {
    q: "¿Puedo cancelar o reprogramar?",
    a: "Sí. Desde Mis citas en tu panel puedes cancelar o reprogramar hasta 4 horas antes del horario agendado.",
  },
  {
    q: "¿Atienden a domicilio?",
    a: "Sí, contamos con atención domiciliaria para valoraciones, curaciones y seguimiento de pacientes que no pueden desplazarse.",
  },
  {
    q: "¿Dónde están ubicadas las sedes?",
    a: "Tenemos sedes en Neiva (Centro y Norte), Pitalito y Garzón, con horarios extendidos de lunes a sábado.",
  },
  {
    q: "¿El chat entrega diagnósticos?",
    a: "No. El asistente resuelve dudas de agendamiento, servicios y ubicaciones. Cualquier diagnóstico requiere consulta con un profesional.",
  },
];