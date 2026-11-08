# Origen y asignación de imágenes

Las fotografías de las páginas públicas se referencian desde medios publicados en el sitio oficial de Previred Colombia. Cada `src` se utiliza una sola vez en el proyecto para evitar repetir imágenes.

## Asignación

- Inicio: sede de Neiva y campaña familiar/bienestar.
- Contacto: sede de Clínica Especializada Previred en Neiva.
- Especialidades: sede Previred de referencia.
- Profesionales: fotografía institucional del equipo.
- Servicios: laboratorio clínico, medicina especializada, laboratorio, odontología y optometría, con una imagen distinta por bloque.
- Ayuda: sede de Pitalito como referencia de la red de atención.
- Nosotros: fotografía del equipo de la sede de Ibagué.

Las tarjetas de profesionales de demostración muestran iniciales en lugar de fotografías: los perfiles son ficticios y así no se atribuyen fotos de personas reales a nombres inventados.

## Visualización

Las imágenes usan `object-fit: contain` para mostrar el encuadre completo sin recortes. Se descargan desde el sitio de origen, por lo que requieren conexión a Internet. MediFlow es un proyecto académico independiente y no es un canal oficial de Previred.


## Ajuste final de imágenes principales

- Nosotros: fotografía institucional del equipo de Previred frente a la sede, original 800 × 800 px (`Fotos-nueva-sede-personal-800x800-1.jpg`). Se encuadra priorizando al equipo.
- Especialidades: fotografía horizontal de la recepción de Skin Clinic Previred (`qr2.jpg`), relacionada con la atención especializada y con una composición más limpia.

Ambas imágenes son distintas, usan sus archivos originales alojados en el sitio de Previred y se muestran con proporciones controladas para evitar deformación. Requieren conexión a Internet.


## Ajuste de imagen de Profesionales

- Profesionales: imagen original generada para MediFlow, con un equipo de tres profesionales de salud en una clínica moderna. Se almacena localmente en `assets/images/profesionales-equipo-medico.webp` (1672 × 941 px) para evitar depender de una URL externa y mantener una imagen nítida y distinta a la de Nosotros.
