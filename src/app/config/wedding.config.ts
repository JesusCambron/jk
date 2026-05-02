export const WEDDING_CONFIG = {
  coupleNames: 'Jesús & Karla',

  menu: [
    { id: 'inicio', label: 'Inicio', icon: 'home' },
    { id: 'detalles', label: 'Detalles', icon: 'heart' },
    { id: 'itinerario', label: 'Itinerario', icon: 'clock' },
    { id: 'regalos', label: 'Regalos', icon: 'gift' },
    { id: 'galeria', label: 'Galería', icon: 'image' },
  ],

  hero: {
    subtitle: '17 - Octubre - 2026',
    backgroundImage: '/assets/optimized/hero-bg1.jpg',
  },

  detalles: {
    title: 'Con mucho cariño',
    message:
      'Con amor en nuestros corazones, queremos invitarte a celebrar uno de los días más importantes de nuestras vidas. Acompáñanos a compartir risas, abrazos y momentos inolvidables mientras unimos nuestras historias en un nuevo comienzo. Tu presencia hará este día aún más especial, rodeados de quienes más queremos. ¡Esperamos contar contigo en este momento tan significativo para nosotros!',
    image: '/assets/optimized/DSC_5523.JPG',
  },

  itinerario: {
    title: 'Itinerario',
    items: [
      {
        time: '4:00 p.m.',
        title: 'Misa',
        place: 'Parroquia de Nuestra Señora de Guadalupe',
        icon: 'church',
      },
      {
        time: '7:00 p.m.',
        title: 'Civil',
        place: 'Hacienda Las Palmas (antes Quinta San Rafael)',
        icon: 'rings',
      },
      {
        time: '8:00 p.m.',
        title: 'Celebración',
        place: 'En el mismo lugar',
        icon: 'celebration',
      },
    ],
  },

  ubicacion: {
    title: 'Ubicación',
    iglesia: {
      title: 'Parroquia de Nuestra Señora de Guadalupe',
      place: 'Ceremonia Religiosa',
      url: 'https://maps.app.goo.gl/Xwv8aZiPHjuiNCXBA'
    },
    hacienda: {
      title: 'Hacienda Las Palmas',
      place: 'Recepción',
      url: 'https://maps.app.goo.gl/uKNwHasSRjuhehaX8'
    }
  },

  regalos: {
    title: 'Regalos',
    message:
      'Su presencia es nuestro mejor regalo. Sin embargo, si desean obsequiarnos algo, agradeceremos que sea en forma de apoyo económico para comenzar esta nueva etapa juntos. ¡Gracias de corazón!',
  },
} as const;
