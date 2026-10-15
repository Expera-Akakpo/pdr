-- ============================================================
-- SCHÉMA DE BASE DE DONNÉES NEON POSTGRESQL DÉDIÉ
-- PROJET : PONT DES DEUX RIVES (PROGEN BÉNIN)
-- ============================================================
-- Ce script est idempotent et prêt à être exécuté dans
-- la console SQL Neon (https://console.neon.tech).

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TYPES ENUM (création sécurisée idempotente)
DO $$ BEGIN
    CREATE TYPE program_module_status AS ENUM ('a-venir', 'en-cours', 'termine');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE circuit_region AS ENUM ('sud', 'centre', 'nord');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE realisation_status AS ENUM ('en-cours', 'termine', 'a-venir');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE inscription_status AS ENUM ('nouveau', 'en_revision', 'accepte', 'refuse');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contact_status AS ENUM ('nouveau', 'traite', 'archive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. FONCTION TRIGGER POUR LE CHAMP updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. TABLES

-- Table 4.1 : Les Piliers du programme
CREATE TABLE IF NOT EXISTS pilars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table 4.2 : Semaines du programme (déroulement 4 semaines)
CREATE TABLE IF NOT EXISTS program_weeks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    highlights TEXT[] DEFAULT '{}',
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table 4.3 : Circuits touristiques
CREATE TABLE IF NOT EXISTS circuits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(120) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    region circuit_region NOT NULL DEFAULT 'sud',
    city VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    full_description TEXT,
    duration VARCHAR(100) NOT NULL,
    highlights TEXT[] DEFAULT '{}',
    cover_image TEXT NOT NULL,
    gallery TEXT[] DEFAULT '{}',
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table 4.4 : Itinéraires types
CREATE TABLE IF NOT EXISTS circuit_itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    circuits_ids UUID[] DEFAULT '{}',
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table 4.5 : Réalisations
CREATE TABLE IF NOT EXISTS realisations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(150) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    edition VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    full_description TEXT,
    highlights TEXT[] DEFAULT '{}',
    participants_count INT DEFAULT 1,
    zones TEXT[] DEFAULT '{}',
    cover_image TEXT NOT NULL,
    status realisation_status NOT NULL DEFAULT 'termine',
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table 4.6 : Médias des réalisations
CREATE TABLE IF NOT EXISTS realisation_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    realisation_id UUID NOT NULL REFERENCES realisations(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'image',
    caption TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table 4.7 : Témoignages
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_name VARCHAR(150) NOT NULL,
    author_role VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    photo_url TEXT,
    edition VARCHAR(100),
    display_order INT DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table 4.8 : Partenaires
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    description TEXT,
    partner_type VARCHAR(100),
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table 4.9 : Inscriptions
CREATE TABLE IF NOT EXISTS inscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(100) NOT NULL,
    age INT,
    motivation TEXT,
    consent_contact BOOLEAN DEFAULT true,
    status inscription_status NOT NULL DEFAULT 'nouveau',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table 4.10 : Messages de contact
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(100),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    newsletter_optin BOOLEAN DEFAULT false,
    status contact_status NOT NULL DEFAULT 'nouveau',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table 4.11 : Chiffres clés (Stats)
CREATE TABLE IF NOT EXISTS stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label VARCHAR(150) NOT NULL,
    value VARCHAR(50) NOT NULL,
    suffix VARCHAR(20) DEFAULT '',
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table 4.12 : Abonnés newsletter
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(150),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. INDEX POUR LA PERFORMANCE ET L'UNICITÉ
CREATE INDEX IF NOT EXISTS idx_circuits_slug ON circuits(slug);
CREATE INDEX IF NOT EXISTS idx_circuits_region ON circuits(region);
CREATE INDEX IF NOT EXISTS idx_realisations_slug ON realisations(slug);
CREATE INDEX IF NOT EXISTS idx_realisations_edition ON realisations(edition);
CREATE INDEX IF NOT EXISTS idx_realisations_status ON realisations(status);
CREATE INDEX IF NOT EXISTS idx_inscriptions_email ON inscriptions(email);
CREATE INDEX IF NOT EXISTS idx_inscriptions_status ON inscriptions(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_published ON testimonials(is_published);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- 6. TRIGGERS updated_at
DROP TRIGGER IF EXISTS trg_pilars_updated_at ON pilars;
CREATE TRIGGER trg_pilars_updated_at BEFORE UPDATE ON pilars
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_circuits_updated_at ON circuits;
CREATE TRIGGER trg_circuits_updated_at BEFORE UPDATE ON circuits
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_realisations_updated_at ON realisations;
CREATE TRIGGER trg_realisations_updated_at BEFORE UPDATE ON realisations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_inscriptions_updated_at ON inscriptions;
CREATE TRIGGER trg_inscriptions_updated_at BEFORE UPDATE ON inscriptions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 7. SEED DATA (DONNÉES DE DÉMONSTRATION OFFICIELLES)

-- 7.1 Piliers
INSERT INTO pilars (slug, title, description, image_url, display_order)
VALUES
('activites-benevoles', 'Activités bénévoles', 'Mettez vos compétences au service des communautés béninoises : éducation, santé, environnement, entrepreneuriat.', 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80', 1),
('famille-accueil', 'Famille d''accueil', 'Vivez au rythme d''une famille béninoise et découvrez la culture de l''intérieur dans un cadre bienveillant.', 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=800&q=80', 2),
('circuit-touristique', 'Circuit touristique', 'Explorez les sites historiques et naturels majeurs du Bénin, du sud au centre du pays.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', 3)
ON CONFLICT (slug) DO NOTHING;

-- 7.2 Semaines du programme
INSERT INTO program_weeks (week_number, title, description, highlights, display_order)
VALUES
(1, 'Semaine 1 — Découverte et intégration', 'Accueil des volontaires, repérage et immersion dans les richesses historiques et institutionnelles béninoises.', ARRAY[
    'Visite des sites historiques et culturels de Bohicon, du Palais Royal, du site souterrain d''Agouinguinto et du marché central.',
    'Initiation à la bonne citoyenneté : activités communautaires et ateliers de sensibilisation (santé sexuelle et reproductive, entrepreneuriat).',
    'Rencontres institutionnelles et société civile : échanges avec les membres d''ONG et associations locales.'
], 1),
(2, 'Semaine 2 — Immersion familiale et culturelle', 'Partage du quotidien au sein d''une famille d''accueil béninoise et découverte des traditions locales de l''intérieur.', ARRAY[
    'Séjour au sein d''une famille béninoise : cuisine traditionnelle, tâches quotidiennes et travaux agricoles.',
    'Participation aux événements sportifs, concerts et fêtes culturelles locales.',
    'Apprentissage de la langue fon : échanges interactifs avec les enfants béninois et séances audiovisuelles éducatives.'
], 2),
(3, 'Semaine 3 — Découverte du patrimoine et engagement', 'Grand voyage dans le sud historique et implication dans un chantier d''intérêt public.', ARRAY[
    'Voyage découverte du sud du Bénin : Porto-Novo, Ouidah (la Route des Esclaves), Grand-Popo et Possotomé.',
    'Rencontre avec les artisans : poterie à Abomey, vannerie à Ganvié, tissage à Djidja, sculpture sur bois à Saclo.',
    'Chantier communautaire : sensibilisation santé publique/hygiène et appui aux infrastructures scolaires ou de soins.'
], 3),
(4, 'Semaine 4 — Bilan et citoyenneté active', 'Synthèse des apprentissages, valorisation des acquis et projection vers l''avenir.', ARRAY[
    'Élaboration et restitution du projet personnel de citoyenneté active.',
    'Bilan individuel et collectif, préparation du retour avec l''équipe pédagogique.',
    'Soirée d''au revoir avec les familles d''accueil et les partenaires.',
    'Remise officielle du certificat de participation ProGen Bénin.'
], 4)
ON CONFLICT DO NOTHING;

-- 7.3 Chiffres clés
INSERT INTO stats (label, value, suffix, display_order)
VALUES
('Durée du programme', '1', ' mois (4 sem.)', 1),
('Public cible', 'Diaspora', ' & Volontaires', 2),
('Première vague', '15 Déc - 15 Jan', '', 3),
('Partenaires engagés', '6', ' organisations', 4)
ON CONFLICT DO NOTHING;

-- 7.4 Circuits touristiques (10 circuits documentés)
INSERT INTO circuits (slug, title, region, city, description, full_description, duration, highlights, cover_image, gallery, display_order)
VALUES
('ganvie-cite-lacustre', 'Ganvié — La cité lacustre', 'sud', 'Ganvié (Lac Nokoué)', 'Un village entièrement bâti sur pilotis sur le lac Nokoué, où la vie s''organise en pirogue : marchés, écoles et habitations traditionnelles.', 'Surnommée la Venise de l''Afrique, Ganvié offre une traversée inoubliable en pirogue à la rencontre des pêcheurs Toffinou. Observez le marché flottant aux premières lueurs du jour, les techniques de pêche ancestrale (acadjas) et l''artisanat lacustre unique.', '1 journée', ARRAY['Marché flottant', 'Navigation en pirogue', 'Habitat sur pilotis', 'Culture Toffinou'], 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80', ARRAY['https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80'], 1),

('ouidah-route-des-esclaves', 'Ouidah — La route des esclaves', 'sud', 'Ouidah', 'Haut lieu de mémoire et berceau spirituel, marqué par la Porte du Non-Retour, le Temple des Pythons et le Musée d''Histoire.', 'Ouidah est une ville emblématique chargée d''émotion. Le parcours retrace la marche des captifs jusqu''à la Porte du Non-Retour sur la plage de l''Atlantique. Visite du Fort Portugais, de la Forêt Sacrée de Kpassè et découverte du culte Vodun au Temple des Pythons.', '1 journée', ARRAY['Porte du Non-Retour', 'Temple des Pythons', 'Musée d''histoire', 'Forêt sacrée'], 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', ARRAY['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'], 2),

('abomey-palais-royaux', 'Abomey — Les Palais Royaux', 'centre', 'Abomey', 'Ancienne capitale du puissant royaume du Danhomè, classée au patrimoine mondial de l''UNESCO, réputée pour ses bas-reliefs et trônes royaux.', 'Plongez au cœur de l''épopée des rois d''Abomey et des célèbres Amazones (Agoodjié). Le musée historique conserve les trônes montés sur crânes, les tentures appliquées royales et les armes forgées par les maîtres artisans locaux.', '1 journée', ARRAY['Palais Royaux UNESCO', 'Musée historique', 'Bas-reliefs polychromes', 'Histoire des Amazones'], 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80', ARRAY['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'], 3),

('bohicon-marche-agouinguinto', 'Bohicon — Le marché et le site souterrain', 'centre', 'Bohicon', 'Un grand carrefour commercial d''Afrique de l''Ouest doublé d''un mystérieux réseau souterrain de refuges fortifiés datant du XVIIe siècle.', 'Visite du grand marché de Bohicon où convergent tous les produits du pays, suivie de la descente dans le village souterrain d''Agouinguinto, ingénieux système de galeries et de pièces creusées par les guerriers pour surprendre l''ennemi.', '1/2 journée', ARRAY['Site souterrain Agouinguinto', 'Grand marché de Bohicon', 'Histoire défensive', 'Artisanat local'], 'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&w=1200&q=80', ARRAY['https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&w=1200&q=80'], 4),

('porto-novo-capitale-patrimoniale', 'Porto-Novo — La capitale patrimoniale', 'sud', 'Porto-Novo', 'Capitale officielle du Bénin, célèbre pour son architecture afro-brésilienne, sa Grande Mosquée et le Musée Ethnographique Alexandre Sènou Adandé.', 'Flânez dans les ruelles ombragées de la ville aux trois noms (Hogbonou, Adjatchè, Porto-Novo). Découvrez le patrimoine colonial et afro-brésilien restauré, le jardin des plantes et de la nature, ainsi que les masques Zangbéto.', '1 journée', ARRAY['Architecture afro-brésilienne', 'Grande Mosquée', 'Musée ethnographique', 'Jardin botanique'], 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80', ARRAY['https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80'], 5),

('grand-popo-possotome', 'Grand-Popo & Possotomé — Plages et nature', 'sud', 'Grand-Popo / Lac Ahémé', 'Plages sauvages de sable fin bordées de cocotiers, embouchure de la Bouche du Roy et écotourisme au bord du paisible lac Ahémé.', 'Grand-Popo offre une parenthèse apaisante au confluent du fleuve Mono et de l''océan Atlantique. À Possotomé, randonnée guidée à la découverte des divinités de l''eau, dégustation de poissons frais et observation des oiseaux migrateurs.', '2 jours', ARRAY['Bouche du Roy', 'Plages de l''Atlantique', 'Lac Ahémé', 'Écotourisme villageois'], 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', ARRAY['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'], 6),

('cotonou-ville-en-mouvement', 'Cotonou — La ville en mouvement', 'sud', 'Cotonou', 'Métropole vibrante avec l''incontournable statue de l''Amazone géante, le marché international Dantokpa et les galeries artistiques contemporaines.', 'Découverte de l''énergie urbaine du Bénin moderne : la majestueuse statue de l''Amazone face à l''océan, le port autonome, les fresques murales d''art urbain et le marché Dantokpa, le plus vaste marché d''Afrique de l''Ouest.', '1/2 journée', ARRAY['Place de l''Amazone', 'Marché Dantokpa', 'Street art & galeries', 'Boulevard de la Marina'], 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80', ARRAY['https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80'], 7),

('abomey-calavi-artisanat', 'Abomey-Calavi — Artisanat et vie locale', 'sud', 'Abomey-Calavi', 'Siège de ProGen Bénin, cité universitaire dynamique, ateliers d''ébénisterie, marchés de quartier et embarcadère vers Ganvié.', 'Calavi est une ville chaleureuse, carrefour entre terre et eau. Découverte du campus universitaire d''Abomey-Calavi, immersion dans les coopératives artisanales et rencontre avec les jeunes créateurs d''initiatives sociales.', '1/2 journée', ARRAY['Siège ProGen Bénin', 'Ateliers d''artisans', 'Campus universitaire', 'Vie citoyenne'], 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80', ARRAY['https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80'], 8),

('djidja-saclo-savoir-faire', 'Djidja & Saclo — Savoir-faire traditionnels', 'centre', 'Djidja / Saclo', 'À la rencontre des maîtres tisserands de bandes de coton de Djidja et des maîtres sculpteurs sur bois d''Iroko de Saclo.', 'Une journée dédiée aux métiers d''art transmis de génération en génération. Les participants s''initient au maniement du métier à tisser traditionnel et assistent à la taille sur bois des masques et bas-reliefs rituels.', '1 journée', ARRAY['Tissage artisanal de Djidja', 'Sculpture sur bois à Saclo', 'Atelier pratique', 'Échanges intergénérationnels'], 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=80', ARRAY['https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=80'], 9),

('za-kpota-immersion-communautaire', 'Za-Kpota — Immersion communautaire', 'centre', 'Za-Kpota', 'Visite d''écoles rurales partenaires, échange avec les groupements de femmes et participation aux activités de reboisement et d''alphabétisation.', 'Une journée forte en émotions humaines dans les villages ruraux de Za-Kpota. Les volontaires participent à la distribution de fournitures scolaires, à des séances de lecture contée et découvrent l''agriculture vivrière locale.', '1 journée', ARRAY['Écoles rurales partenaires', 'Groupements communautaires', 'Actions solidaires', 'Pique-nique champêtre'], 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80', ARRAY['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80'], 10)
ON CONFLICT (slug) DO NOTHING;

-- 7.5 Partenaires
INSERT INTO partners (name, description, partner_type, display_order)
VALUES
('ProGen Bénin', 'Organisation non gouvernementale porteuse et coordonnatrice générale.', 'ONG Porteuse', 1),
('US-BWAA', 'Partenaire institutionnel pour la promotion de l''interculturalité et de l''éducation.', 'Institutionnel', 2),
('BeninviEducation', 'Réseau d''appui éducatif et de parrainage pour les enfants béninois.', 'Éducation', 3),
('Magic récré', 'Association dédiée à l''animation socio-éducative et culturelle des jeunes.', 'Animation', 4),
('AppStates', 'Coopération académique et mise en relation internationale.', 'Universitaire', 5),
('Collectivités territoriales', 'Mairies et arrondissements partenaires accueillant les initiatives de terrain.', 'Collectivité', 6)
ON CONFLICT DO NOTHING;

-- 7.6 Réalisations (Première édition 2025)
INSERT INTO realisations (slug, title, edition, description, full_description, highlights, participants_count, zones, cover_image, status, date)
VALUES
('premiere-edition-2025', 'Première édition du programme — 2025', 'Édition 2025', 'La première édition du programme Pont des Deux Rives a accueilli une volontaire tunisienne pendant un mois d''immersion, de découverte et d''engagement aux côtés des communautés béninoises.',
'La toute première édition du programme Pont des Deux Rives a marqué le lancement officiel de notre initiative de volontourisme interculturel. Accueillie au sein d''une famille d''accueil d''Abomey-Calavi, la participante a pleinement partagé la vie quotidienne, appris les rudiments de la langue fon et noué des liens fraternels indélébiles.

Sur le plan de l''engagement civique, elle est intervenue dans des ateliers de sensibilisation à l''éducation des jeunes filles et à l''hygiène communautaire, tout en explorant les joyaux historiques du Sud et du Centre du Bénin. À l''issue du séjour, elle a élaboré et présenté son projet personnel de citoyenneté active devant l''équipe et les partenaires réunis lors d''une chaleureuse soirée d''au revoir.',
ARRAY[
    'Immersion authentique de 30 jours au sein d''une famille d''accueil béninoise',
    'Sensibilisation communautaire et appui aux écoles partenaires',
    'Visites patrimoniales : Ganvié, Ouidah, Abomey et Porto-Novo',
    'Élaboration d''un projet personnel de citoyenneté active présenté lors de la soirée de clôture'
], 1, ARRAY['Abomey-Calavi', 'Ganvié', 'Ouidah', 'Abomey', 'Porto-Novo'],
'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
'termine', '2025-01-15')
ON CONFLICT (slug) DO NOTHING;

-- 7.7 Témoignages
INSERT INTO testimonials (author_name, author_role, content, edition, display_order, is_published)
VALUES
('Participant(e) Première Édition', 'Volontaire internationale (Tunisie)', 'Cette immersion au Bénin a totalement transformé ma vision de la solidarité. Entre la chaleur de ma famille d''accueil à Calavi et les échanges avec les enfants, chaque jour a été une leçon d''humanité et de partage.', 'Édition 2025', 1, true),
('Famille d''accueil d''Abomey-Calavi', 'Famille d''accueil partenaire', 'Ouvrir notre porte et notre table à une jeune volontaire a été un véritable enrichissement pour toute la maisonnée. Nos enfants gardent un souvenir merveilleux de ces quatre semaines de vie commune.', 'Édition 2025', 2, true),
('Représentant ProGen Bénin', 'Coordination du programme', 'Le Pont des Deux Rives prouve que la jeunesse mondiale a soif d''authenticité et d''utilité sociale. Les retours de cette première édition confortent notre engagement pour les promotions à venir.', 'Édition 2025', 3, true)
ON CONFLICT DO NOTHING;

-- 7.8 Itinéraires types
INSERT INTO circuit_itineraries (title, duration, description, display_order)
VALUES
('Itinéraire Sud', '7 jours', 'Cotonou, la cité lacustre de Ganvié, Ouidah et sa Route des Esclaves, détente à Grand-Popo et Possotomé.', 1),
('Itinéraire Centre', '7 jours', 'Le carrefour de Bohicon, les Palais Royaux d''Abomey (UNESCO), les tisserands de Djidja et sculpteurs de Saclo.', 2),
('Itinéraire Combiné', '14 jours', 'La grande traversée Sud + Centre pour une immersion patrimoniale et humaine intégrale.', 3)
ON CONFLICT DO NOTHING;
