
import {
  BarChartOutlined
} from "@ant-design/icons-vue";

export const randomImage = {
  URL: "https://picsum.photos/1920/900?random=1"
}


export const coords = [
  {
    textStrong: "Le dimanche soir de",
    endofText: "6:00 à 8:00 pm."
  },
  {
    textStrong: "À partir du ",
    endofText: "30 mai 2025."
  },
  {
    textStrong: "Prenez rendez-vous avec le Pasteur ",
    endofText: "Frantzou Jean-Baptiste."
  }
]

export const menuItems = [
  {
    name: 'nav.home',
    to: "/#terrain",
    icon: BarChartOutlined,
    dropdown: null,
  }
];


export const cards = [
  {
    image: '/assets/img/frantzou-jb.png',
    alt: 'Frantzou JB'
  },
  {
    image: '',
    alt: ''
  },
  {
    image: '/assets/img/presentation.jpg',
    alt: 'Culte PNG'
  }
]

export const terrains = ref([
  {
    id: 1,
    title: 'Terrain Viabilisé - Riviera',
    location: 'Riviera, Abidjan',
    city: 'abidjan',
    surface: 800,
    price: 18000000,
    status: 'disponible',
    description: 'Terrain premium dans quartier huppé, entièrement viabilisé.',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    features: ['Titre foncier', 'Quartier premium', 'Tous réseaux', 'Sécurité 24/7'],
    owner: {
      name: 'Aya Diabaté',
      phone: '+225 07 XX XX XX XX',
      whatsapp: '+2250798765432',
      email: 'a.diabate@example.com'
    },
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'
    ]
  },
  {
    id: 2,
    title: 'Terrain Commercial - Plateau',
    location: 'Plateau, Abidjan',
    city: 'abidjan',
    surface: 450,
    price: 15000000,
    status: 'disponible',
    description: 'Terrain idéal pour projet commercial en plein centre ville.',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    features: ['Titre foncier', 'Zone commerciale', 'Accès facile', 'Tous réseaux'],
    owner: {
      name: 'Marie Traoré',
      phone: '+225 05 XX XX XX XX',
      whatsapp: '+2250587654321',
      email: 'm.traore@example.com'
    },
    images: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'
    ]
  },
  {
    id: 3,
    title: 'Grand Terrain - Yamoussoukro',
    location: 'Centre, Yamoussoukro',
    city: 'yamoussoukro',
    surface: 1200,
    price: 12000000,
    status: 'reserve',
    description: 'Vaste terrain avec vue panoramique, parfait pour grand projet résidentiel.',
    image: 'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=800&q=80',
    features: ['Titre foncier', 'Vue panoramique', 'Calme', 'Grande superficie'],
    owner: {
      name: 'Koffi Yao',
      phone: '+225 01 XX XX XX XX',
      whatsapp: '+2250156781234',
      email: 'k.yao@example.com'
    },
    images: [
      'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=800&q=80',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'
    ]
  },
  {
    id: 4,
    title: 'Terrain Agricole - Bouaké',
    location: 'Périphérie, Bouaké',
    city: 'bouake',
    surface: 2000,
    price: 6000000,
    status: 'disponible',
    description: 'Excellent terrain pour projet agricole ou ferme moderne.',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    features: ['Titre foncier', 'Sol fertile', 'Accès route', 'Point d\'eau'],
    owner: {
      name: 'Ibrahim Koné',
      phone: '+225 05 XX XX XX XX',
      whatsapp: '+2250543218765',
      email: 'i.kone@example.com'
    },
    images: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
      'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=800&q=80'
    ]
  },
  {
    id: 5,
    title: 'Terrain Lotissement - Bingerville',
    location: 'Bingerville, Abidjan',
    city: 'abidjan',
    surface: 500,
    price: 7200000,
    status: 'disponible',
    description: 'Terrain dans lotissement moderne avec toutes commodités.',
    image: 'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=800&q=80',
    features: ['Titre foncier', 'Lotissement sécurisé', 'Électricité', 'Eau courante'],
    owner: {
      name: 'Fatou Ouattara',
      phone: '+225 01 XX XX XX XX',
      whatsapp: '+2250165432187',
      email: 'f.ouattara@example.com'
    },
    images: [
      'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=800&q=80'
    ]
  }
])