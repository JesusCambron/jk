export const WEDDING_CONFIG = {
  coupleNames: 'Jesús & Karla',

  menu: [
    { id: 'inicio', label: 'Inicio', icon: 'home' },
    { id: 'detalles', label: 'Detalles', icon: 'heart' },
    { id: 'itinerario', label: 'Itinerario', icon: 'clock' },
    { id: 'regalos', label: 'Regalos', icon: 'gift' },
    { id: 'galeria', label: 'Sesión save the date', icon: 'image' },
  ],

  hero: {
    subtitle: '17 - Octubre - 2026',
    backgroundImage: 'assets/optimized/columna3c.jpeg',
    // backgroundImage: 'assets/optimized/hero-bg1.jpg',
  },

  detalles: {
    title: '¡Nos casamos!',
    message:
      'Con la bendición de Dios y el amor de nuestras familias, queremos invitarte a celebrar uno de los días más importantes de nuestras vidas. Acompáñanos a compartir risas, abrazos y momentos inolvidables mientras unimos nuestras historias en un nuevo comienzo. Tu presencia hará este día aún más especial, rodeados de quienes más queremos. ¡Esperamos contar contigo en este momento tan significativo para nosotros!',
    image: 'assets/optimized/nos-casamos4.jpg',
  },

  itinerario: {
    title: 'Itinerario',
    items: [
      {
        time: '4:00 p.m.',
        title: 'Misa',
        place: 'Santuario de Guadalupe',
        icon: 'church',
        url: 'https://maps.app.goo.gl/xbxkVevHgarcuDD2A',
      },
      {
        time: '7:00 p.m.',
        title: 'Civil',
        place: 'Hacienda Las Palmas',
        icon: 'rings',
        url: 'https://maps.app.goo.gl/uKNwHasSRjuhehaX8',
      },
      {
        time: '8:00 p.m.',
        title: 'Celebración',
        place: 'Hacienda Las Palmas',
        icon: 'celebration',
        url: 'https://maps.app.goo.gl/uKNwHasSRjuhehaX8',
      },
    ],
  },

  ubicacion: {
    title: 'Ubicación',
    iglesia: {
      title: 'Santuario de Nuestra Señora de Guadalupe',
      place: 'Calle Durango entre Hermenegildo Galeana y Av. Ignacio Zaragoza',
      url: 'https://maps.app.goo.gl/xbxkVevHgarcuDD2A'
    },
    hacienda: {
      title: 'Hacienda Las Palmas',
      place: 'Calle Base Providencia, entronque con Tinajera',
      url: 'https://maps.app.goo.gl/uKNwHasSRjuhehaX8'
    }
  },

  regalos: {
    title: 'Mesa de Regalos',
    message:
      '¡Saber que contaremos con ustedes ya es nuestro mayor regalo! Compartir este día es lo que más nos emociona. Si de igual forma desean tener un gesto o detalle especial con nosotros para consentirnos en nuestro nuevo camino juntos, aquí les dejamos las opciones que tenemos disponibles:',
    liverpoolCode: '52027327',
    liverpoolUrl: 'https://mesaderegalos.liverpool.com.mx/milistaderegalos/52027327',
    amazonUrl: 'https://www.amazon.com.mx/wedding/guest-view/3B1EXOVGOP0BY',
    bbvaClabe: '012 180 01565949178 5',
    bbvaBeneficiario: 'JESUS MANUEL CAMBRON TAPIA',
    enFiestaInfo: 'Si lo prefieren, también tendremos un lugar designado en la recepción para recibir sobres o regalos físicos.',
    dressCodeNote: 'Queremos que la novia brille como merece, por eso les pedimos amablemente no vestir de blanco. ¡Gracias por su apoyo!',
  },
} as const;

export const firebaseConfig = {
  apiKey: "AIzaSyBfHk2FVoABM4Nm7Dw0j38UFxNkP4F89F4",
  authDomain: "boda-jk-b8dea.firebaseapp.com",
  projectId: "boda-jk-b8dea",
  storageBucket: "boda-jk-b8dea.firebasestorage.app",
  messagingSenderId: "432843092557",
  appId: "1:432843092557:web:d49c5a37616357a042a204",
  measurementId: "G-P26V2EBNRM"
};