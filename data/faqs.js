export const faqs = [
  {
    q: '¿Cómo agendo una cita médica?',
    a: 'Ingresa a Solicitar cita, elige la especialidad, el profesional, la fecha y el horario disponible. Luego confirmas tus datos.',
    keywords: ['agendar', 'cita', 'solicitar'],
  },
  {
    q: '¿Necesito una cuenta para agendar?',
    a: 'Puedes agendar como invitado. Si inicias sesión como paciente, tus citas quedarán vinculadas a tu panel.',
    keywords: ['cuenta', 'registro', 'login'],
  },
  {
    q: '¿Cómo inicio sesión?',
    a: 'Usa el enlace Iniciar sesión con tu correo o usuario de demostración. El sistema te llevará al panel según tu rol.',
    keywords: ['iniciar', 'sesión', 'login', 'acceso'],
  },
  {
    q: '¿Cómo consulto mi turno?',
    a: 'En el panel del paciente, sección Turnos, verás el número y estado de tu turno virtual del día.',
    keywords: ['turno', 'espera', 'número'],
  },
  {
    q: '¿Puedo cancelar o reprogramar?',
    a: 'Desde Mis citas puedes cancelar hasta 4 horas antes del horario agendado (demostración local).',
    keywords: ['cancelar', 'reprogramar'],
  },
  {
    q: '¿Atienden a domicilio?',
    a: 'Sí, contamos con atención domiciliaria para pacientes que no pueden desplazarse (información demostrativa).',
    keywords: ['domicilio', 'casa'],
  },
  {
    q: '¿El chat entrega diagnósticos?',
    a: 'No. El asistente orienta sobre navegación, citas y turnos. No sustituye la consulta médica.',
    keywords: ['diagnóstico', 'chat', 'bot'],
  },
];

export const chatQuickReplies = [
  {
    label: 'Agendar cita',
    answer:
      'Ve a Solicitar cita o al panel del paciente. El proceso tiene 6 pasos: especialidad, profesional, fecha, horario, datos y confirmación.',
  },
  {
    label: 'Iniciar sesión',
    answer:
      'En la página de login ingresa correo o usuario y contraseña. Serás redirigido automáticamente al panel de tu rol.',
  },
  {
    label: 'Consultar turno',
    answer:
      'Tras registrar tu llegada en recepción (simulación), consulta el turno en Panel paciente → Turnos.',
  },
  {
    label: 'Ver servicios',
    answer:
      'Ofrecemos medicina general, especialidades, laboratorio, odontología y atención domiciliaria en sedes de Neiva y regiones cercanas.',
  },
];
