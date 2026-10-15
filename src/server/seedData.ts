export interface PilarItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_url: string;
  display_order: number;
}

export interface ProgramWeekItem {
  id: string;
  week_number: number;
  title: string;
  description: string;
  highlights: string[];
  display_order: number;
}

export interface CircuitItem {
  id: string;
  slug: string;
  title: string;
  region: 'sud' | 'centre' | 'nord';
  city: string;
  description: string;
  full_description: string;
  duration: string;
  highlights: string[];
  cover_image: string;
  gallery: string[];
  display_order: number;
}

export interface RealisationItem {
  id: string;
  slug: string;
  title: string;
  edition: string;
  description: string;
  full_description: string;
  highlights: string[];
  participants_count: number;
  zones: string[];
  cover_image: string;
  status: 'en-cours' | 'termine' | 'a-venir';
  date: string;
  gallery: { url: string; caption?: string }[];
}

export interface TestimonialItem {
  id: string;
  author_name: string;
  author_role: string;
  content: string;
  edition: string;
  photo_url?: string;
  is_published: boolean;
}

export interface PartnerItem {
  id: string;
  name: string;
  partner_type: string;
  description: string;
  logo_url?: string;
  website_url?: string;
}

export interface StatItem {
  id: string;
  label: string;
  value: string;
  suffix: string;
}

export const INITIAL_PILARS: PilarItem[] = [
  {
    id: 'p1',
    slug: 'activites-benevoles',
    title: 'Activités bénévoles',
    description: 'Mettez vos compétences au service des communautés béninoises : éducation, santé, environnement, entrepreneuriat.',
    image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    display_order: 1
  },
  {
    id: 'p2',
    slug: 'famille-accueil',
    title: 'Famille d\'accueil',
    description: 'Vivez au rythme d\'une famille béninoise et découvrez la culture de l\'intérieur dans un cadre bienveillant.',
    image_url: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=800&q=80',
    display_order: 2
  },
  {
    id: 'p3',
    slug: 'circuit-touristique',
    title: 'Circuit touristique',
    description: 'Explorez les sites historiques et naturels majeurs du Bénin, du sud au centre du pays.',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    display_order: 3
  }
];

export const INITIAL_WEEKS: ProgramWeekItem[] = [
  {
    id: 'w1',
    week_number: 1,
    title: 'Semaine 1 — Découverte et intégration',
    description: 'Accueil, immersion civique et découverte des grands repères historiques du Sud.',
    highlights: [
      'Formalités administratives et accueil officiel à l\'aéroport par l\'équipe ProGen Bénin.',
      'Découverte des sites historiques et culturels de Bohicon : Palais Royal, site souterrain d\'Agouinguinto et grand marché central.',
      'Initiation à la bonne citoyenneté : participation active à des ateliers communautaires (santé sexuelle et reproductive, entrepreneuriat local).',
      'Rencontre et dialogue avec les acteurs de la société civile : échanges directs avec des membres d\'ONG et d\'associations locales.'
    ],
    display_order: 1
  },
  {
    id: 'w2',
    week_number: 2,
    title: 'Semaine 2 — Immersion familiale et culturelle',
    description: 'Partage du quotidien en famille béninoise et découverte des traditions locales de l\'intérieur.',
    highlights: [
      'Séjour complet en immersion dans une famille d\'accueil béninoise : préparation des repas, tâches quotidiennes, agriculture et vie de quartier.',
      'Participation à des activités sportives de proximité et participation à des manifestations culturelles (concerts, festivals).',
      'Apprentissage de la langue fon : discussions interactives avec les enfants du quartier et visionnage de productions en langue fon.'
    ],
    display_order: 2
  },
  {
    id: 'w3',
    week_number: 3,
    title: 'Semaine 3 — Découverte du patrimoine et engagement',
    description: 'Voyage d\'exploration du Sud patrimonial et participation concrète à un chantier communautaire.',
    highlights: [
      'Voyage découverte du sud du Bénin : Porto-Novo (capitale patrimoniale), Ouidah (Route des Esclaves, Porte du Non-Retour) et Grand-Popo (Possotomé).',
      'Rencontre avec les artisans et entrepreneurs : poterie à Abomey, vannerie à Ganvié, tissage traditionnel à Djidja et sculpture sur bois à Saclo.',
      'Participation à un projet de développement communautaire : sensibilisation aux questions d\'hygiène et appui aux infrastructures scolaires ou sanitaires.'
    ],
    display_order: 3
  },
  {
    id: 'w4',
    week_number: 4,
    title: 'Semaine 4 — Bilan et citoyenneté active',
    description: 'Bilan personnel, capitalisation des acquis et célébration de la fraternité interculturelle.',
    highlights: [
      'Élaboration d\'un projet personnel de citoyenneté active présenté aux membres de la communauté.',
      'Bilan d\'expérience, entretiens individuels et préparation du retour avec les encadrants.',
      'Organisation d\'une soirée chaleureuse d\'au revoir réunissant les familles d\'accueil, amis et partenaires.',
      'Remise officielle du certificat de participation ProGen Bénin attestant de l\'implication dans le programme.'
    ],
    display_order: 4
  }
];

export const INITIAL_CIRCUITS: CircuitItem[] = [
  {
    id: 'c1',
    slug: 'ganvie-cite-lacustre',
    title: 'Ganvié — La cité lacustre',
    region: 'sud',
    city: 'Ganvié (Lac Nokoué)',
    description: 'Un village entièrement construit sur pilotis sur le lac Nokoué, où toute la vie s\'organise en pirogue : marchés flottants, écoles, habitations.',
    full_description: 'Surnommée avec fierté la Venise de l\'Afrique, Ganvié est une prouesse humaine et patrimoniale bâtie au XVIIe siècle par les populations Toffinou fuyant les razzias. La visite guidée en pirogue à perche permet de sillonner les canaux, d\'observer les marchés flottants matinaux, de découvrir les systèmes ancestraux de parcs de branchages (acadjas) et de partager un échange avec les habitants de l\'eau.',
    duration: '1 journée',
    highlights: ['Marché flottant matinal', 'Traversée en pirogue traditionnelle', 'Écoles et cases sur pilotis', 'Artisanat lacustre toffinou'],
    cover_image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
    ],
    display_order: 1
  },
  {
    id: 'c2',
    slug: 'ouidah-route-des-esclaves',
    title: 'Ouidah — La route des esclaves',
    region: 'sud',
    city: 'Ouidah',
    description: 'Ville historique, haut lieu de mémoire avec la Porte du Non-Retour, le Temple des Pythons, le musée d\'histoire et la basilique.',
    full_description: 'Ouidah représente un carrefour mémoriel et spirituel majeur d\'Afrique. Le parcours emprunte la Route des Esclaves, jalonnée de mémoriaux et de symboles, jusqu\'à la majestueuse Porte du Non-Retour sur le rivage de l\'Océan Atlantique. Visite du Fort Portugais hébergeant le Musée d\'Histoire, de la Basilique de l\'Immaculée Conception et découverte du Temple des Pythons au cœur de la ville.',
    duration: '1 journée',
    highlights: ['Porte du Non-Retour face à la mer', 'Temple sacré des Pythons', 'Fort Portugais & Musée d\'Histoire', 'Forêt sacrée de Kpassè'],
    cover_image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
    ],
    display_order: 2
  },
  {
    id: 'c3',
    slug: 'abomey-palais-royaux',
    title: 'Abomey — Les Palais Royaux',
    region: 'centre',
    city: 'Abomey',
    description: 'Ancienne capitale du royaume du Danhomè, classée au patrimoine mondial de l\'UNESCO. Ses palais royaux et ses bas-reliefs racontent l\'histoire du Bénin.',
    full_description: 'Capitale guerrière du Danhomè fondée au XVIIe siècle, Abomey abrite les palais historiques de douze souverains successifs. Classé au patrimoine mondial de l\'UNESCO, le site présente des bas-reliefs uniques en terre cuite polychrome illustrant les victoires militaires, les trônes sculptés montés sur des crânes d\'ennemis, les tentures appliquées d\'apparat et les célèbres armes des régiments d\'Amazones (Agoodjié).',
    duration: '1 journée',
    highlights: ['Palais Royaux classés UNESCO', 'Bas-reliefs en terre cuite', 'Musée d\'Histoire militaire et dynastique', 'Ateliers de tentures d\'Abomey'],
    cover_image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'
    ],
    display_order: 3
  },
  {
    id: 'c4',
    slug: 'bohicon-marche-agouinguinto',
    title: 'Bohicon — Le marché central et le site d\'Agouinguinto',
    region: 'centre',
    city: 'Bohicon',
    description: 'Un marché animé et un site souterrain énigmatique à découvrir en petit groupe.',
    full_description: 'Bohicon est le poumon ferroviaire et commercial du Zou. Découverte de son marché central bourdonnant d\'épices, de tissus et de produits maraîchers. À quelques kilomètres, exploration du village souterrain d\'Agouinguinto, complexe remarquable de refuges et galeries creusés au XVIe siècle pour se prémunir des attaques ennemies.',
    duration: '1/2 journée',
    highlights: ['Site souterrain archéologique d\'Agouinguinto', 'Marché central de Bohicon', 'Histoire défensive précoloniale'],
    cover_image: 'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&w=1200&q=80'
    ],
    display_order: 4
  },
  {
    id: 'c5',
    slug: 'porto-novo-capitale-patrimoniale',
    title: 'Porto-Novo — La capitale patrimoniale',
    region: 'sud',
    city: 'Porto-Novo',
    description: 'Ancienne capitale coloniale, riche de son architecture afro-brésilienne, de ses musées et de son grand marché.',
    full_description: 'Porto-Novo, la cité d\'Adjatchè aux lagunes calmes, séduit par sa douceur et son histoire singulière. Le circuit explore les façades aux frontons baroques héritées des familles afro-brésiliennes affranchies, l\'étonnante Grande Mosquée inspirée de l\'église de Salvador de Bahia, le Musée Honmè (palais royal) et le Musée Ethnographique.',
    duration: '1 journée',
    highlights: ['Architecture baroque afro-brésilienne', 'Grande Mosquée emblématique', 'Musée ethnographique Adandé', 'Jardin des Plantes et de la Nature'],
    cover_image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80'
    ],
    display_order: 5
  },
  {
    id: 'c6',
    slug: 'grand-popo-possotome',
    title: 'Grand-Popo & Possotomé — Plages et nature',
    region: 'sud',
    city: 'Grand-Popo & Lac Ahémé',
    description: 'Plages de sable fin, embouchure du Mono, village de Possotomé connu pour son lac et ses paysages.',
    full_description: 'Un séjour de ressourcement entre océan et eau douce. À Grand-Popo, admirez la Bouche du Roy où le fleuve Mono rejoint les vagues atlantiques. Puis cap sur Possotomé au bord du lac Ahémé pour un circuit écotouristique guidé à la découverte des traditions rituelles, des plantes médicinales et de la cuisine locale de poisson frais.',
    duration: '2 jours',
    highlights: ['Embouchure de la Bouche du Roy', 'Plages calmes de Grand-Popo', 'Écotourisme sur le lac Ahémé', 'Nuit en campement écologique'],
    cover_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
    ],
    display_order: 6
  },
  {
    id: 'c7',
    slug: 'cotonou-ville-en-mouvement',
    title: 'Cotonou — La ville en mouvement',
    region: 'sud',
    city: 'Cotonou',
    description: 'Découverte de la place de l\'Amazone, du marché Dantokpa, du port et des quartiers animés de la capitale économique.',
    full_description: 'Cœur économique et créatif du pays, Cotonou bouillonne d\'énergie. Ce circuit urbain permet de contempler l\'imposante statue en bronze de l\'Amazone de 30 mètres, symbole de bravoure féminine, de longer le Boulevard de la Marina, d\'arpenter les allées du mythique marché international Dantokpa et de visiter les fondations d\'art contemporain.',
    duration: '1/2 journée',
    highlights: ['Place et statue géante de l\'Amazone', 'Marché international Dantokpa', 'Boulevard de la Marina', 'Galeries artistiques urbaines'],
    cover_image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80'
    ],
    display_order: 7
  },
  {
    id: 'c8',
    slug: 'abomey-calavi-artisanat',
    title: 'Abomey-Calavi — Artisanat et vie locale',
    region: 'sud',
    city: 'Abomey-Calavi',
    description: 'Balade dans la ville universitaire, découverte des ateliers d\'artisans et des marchés locaux.',
    full_description: 'Abomey-Calavi, berceau du siège de ProGen Bénin, est une commune vibrante en bordure du lac Nokoué. Visite du siège de l\'ONG, rencontre avec les artisans menuisiers et vanniers, promenade sur le campus universitaire d\'Abomey-Calavi et dégustation des mets de rue réputés.',
    duration: '1/2 journée',
    highlights: ['Siège officiel ProGen Bénin', 'Ateliers d\'artisans et menuisiers', 'Campus Universitaire d\'Abomey-Calavi', 'Immersion dans les marchés de quartier'],
    cover_image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80'
    ],
    display_order: 8
  },
  {
    id: 'c9',
    slug: 'djidja-saclo-savoir-faire',
    title: 'Djidja & Saclo — Savoir-faire traditionnels',
    region: 'centre',
    city: 'Djidja & Saclo (Zou)',
    description: 'Rencontre avec les tisserands de Djidja et les sculpteurs sur bois de Saclo.',
    full_description: 'Une plongée intime dans les racines des arts manuels béninois. À Djidja, échange avec les tisseuses et tisserands utilisant des métiers traditionnels en bois pour produire le pagne kanvô. À Saclo, découverte des maîtres sculpteurs sur bois d\'Iroko façonnant masques, statuettes et insignes de chefferie.',
    duration: '1 journée',
    highlights: ['Tissage traditionnel du kanvô', 'Sculpture sur bois sacré à Saclo', 'Atelier pratique d\'initiation', 'Échange avec les maîtres artisans'],
    cover_image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=80'
    ],
    display_order: 9
  },
  {
    id: 'c10',
    slug: 'za-kpota-immersion-communautaire',
    title: 'Za-Kpota — Immersion communautaire',
    region: 'centre',
    city: 'Za-Kpota',
    description: 'Visite d\'écoles rurales partenaires, rencontre avec les communautés et participation à des activités d\'engagement.',
    full_description: 'Le cœur social du programme Pont des Deux Rives. Les participants partagent une journée complète dans une communauté rurale de Za-Kpota : lecture et animations avec les écoliers, participation à la rénovation d\'une salle de classe ou à un atelier d\'hygiène dentaire, et temps d\'échange fraternel avec le comité villageois.',
    duration: '1 journée',
    highlights: ['Accueil festif par le village', 'Atelier d\'animation avec les écoliers', 'Contribution concrète au développement rural', 'Partage d\'un repas champêtre'],
    cover_image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80'
    ],
    display_order: 10
  }
];

export const INITIAL_REALISATIONS: RealisationItem[] = [
  {
    id: 'r1',
    slug: 'premiere-edition-2025',
    title: 'Première édition du programme — 2025',
    edition: 'Édition 2025',
    date: '15 Janvier 2025',
    status: 'termine',
    description: 'La première édition du programme Pont des Deux Rives a accueilli une volontaire tunisienne pendant un mois d\'immersion, de découverte et d\'engagement aux côtés des communautés béninoises.',
    full_description: 'La toute première édition du programme Pont des Deux Rives a constitué un succès humain et formateur remarquable. Hébergée pendant un mois au sein d\'une famille d\'accueil bienveillante à Abomey-Calavi, la participante a pleinement expérimenté le quotidien béninois : confection des repas, apprentissage des salutations et expressions usuelles en langue fon, et partage de moments inoubliables avec les enfants du quartier.\n\nSur le terrain, la volontaire s\'est investie avec enthousiasme dans l\'animation d\'ateliers de sensibilisation à la santé sexuelle et reproductive ainsi qu\'à l\'hygiène communautaire au profit de jeunes élèves. Le volet culturel a permis d\'explorer les merveilles de Ganvié, la Route des Esclaves à Ouidah, les Palais Royaux d\'Abomey et la capitale Porto-Novo.\n\nPour clôturer son séjour, elle a élaboré et présenté avec brio son projet personnel de citoyenneté active, avant de recevoir son certificat officiel lors d\'une soirée d\'au revoir conviviale réunissant famille d\'accueil et représentants associatifs.',
    highlights: [
      'Immersion complète de 30 jours au sein d\'une famille d\'accueil bienveillante',
      'Participation active à des ateliers de sensibilisation en santé publique et hygiène',
      'Visites patrimoniales complètes : Ganvié, Ouidah, Abomey et Porto-Novo',
      'Élaboration et restitution d\'un projet personnel de citoyenneté active',
      'Remise officielle du certificat de participation ProGen Bénin'
    ],
    participants_count: 1,
    zones: ['Abomey-Calavi', 'Ganvié', 'Ouidah', 'Abomey', 'Porto-Novo'],
    cover_image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      { url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80', caption: 'Accueil chaleureux de la participante en famille d\'accueil' },
      { url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80', caption: 'Atelier éducatif communautaire avec les enfants' },
      { url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80', caption: 'Traversée en pirogue lors de la découverte de Ganvié' },
      { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', caption: 'Étape mémorielle à la Porte du Non-Retour à Ouidah' },
      { url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80', caption: 'Visite guidée des Palais Royaux d\'Abomey' },
      { url: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1200&q=80', caption: 'Soirée d\'au revoir et remise du certificat officiel' }
    ]
  }
];

export const INITIAL_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 't1',
    author_name: '[Témoignage à venir — participante de la première édition, 2025]',
    author_role: 'Volontaire internationale (Tunisie)',
    edition: 'Édition 2025',
    content: 'Ce mois passé au Bénin restera à jamais gravé dans mon parcours. Partager le quotidien de ma famille d\'accueil, me rendre utile dans les écoles et explorer des sites aussi chargés d\'émotion que Ganvié ou Ouidah a complètement enrichi mon engagement citoyen.',
    is_published: true
  },
  {
    id: 't2',
    author_name: '[Témoignage à venir — famille d\'accueil d\'Abomey-Calavi]',
    author_role: 'Famille d\'accueil partenaire (Calavi)',
    edition: 'Édition 2025',
    content: 'Accueillir notre première volontaire a été une fête pour toute notre maisonnée. Nos enfants ont découvert une nouvelle culture et nous avons partagé nos plats, notre langue et nos traditions avec fierté.',
    is_published: true
  },
  {
    id: 't3',
    author_name: '[Témoignage à venir — équipe de coordination ProGen Bénin]',
    author_role: 'Coordination générale du projet',
    edition: 'Édition 2025',
    content: 'Le Pont des Deux Rives incarne notre conviction : le volontourisme solidaire crée de véritables ponts fraternels entre les peuples. Les résultats de cette première édition nous motivent à accueillir de nouvelles promotions.',
    is_published: true
  }
];

export const INITIAL_PARTNERS: PartnerItem[] = [
  { id: 'part1', name: 'ProGen Bénin', partner_type: 'ONG Porteuse', description: 'Organisation non gouvernementale porteuse du projet.' },
  { id: 'part2', name: 'US-BWAA', partner_type: 'Partenaire international', description: 'Coopération internationale et développement éducatif.' },
  { id: 'part3', name: 'BeninviEducation', partner_type: 'Éducation', description: 'Réseau d\'appui à la scolarisation et au parrainage d\'enfants.' },
  { id: 'part4', name: 'Magic récré', partner_type: 'Animation & Jeunesse', description: 'Activités ludiques et animations socioculturelles.' },
  { id: 'part5', name: 'AppStates', partner_type: 'Universitaire', description: 'Partenariat académique et mobilité des étudiants.' },
  { id: 'part6', name: 'Collectivités territoriales', partner_type: 'Collectivité locale', description: 'Mairies et arrondissements d\'accueil au Bénin.' }
];

export const INITIAL_STATS: StatItem[] = [
  { id: 's1', label: 'Durée du programme', value: '1', suffix: ' mois (4 sem.)' },
  { id: 's2', label: 'Public visé', value: 'Diaspora', suffix: ' & Volontaires' },
  { id: 's3', label: 'Première vague', value: '15 Déc - 15 Jan', suffix: '' },
  { id: 's4', label: 'Partenaires engagés', value: '6', suffix: ' organisations' }
];
