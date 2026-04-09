export const ROUTE_PATHS = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  STATISTIQUES: '/statistiques',
  ENREGISTRER: '/enregistrer',
  PERSONNEL: '/personnel',
  MERES_ENFANTS: '/meres-enfants',
  BENEFICIAIRES: '/beneficiaires',
  SUIVI: '/suivi',
  EVENEMENTS: '/evenements',
  CABINET_MEDICAL: '/cabinet-medical',
  MEDICAMENTS: '/medicaments',
  PARAMETRES: '/parametres',
  NOTIFICATIONS: '/notifications',
  ALERTES: '/alertes',
  EXPORTATION: '/exportation',
  RAPPORTS: '/rapports',
  LISTE_PRESENCE: '/liste-presence',
  MODE_KIOSQUE: '/kiosque',
} as const;

export type Role = 'Personnel' | 'Mère' | 'Enfant' | 'Bénéficiaire';

export type MethodePointage = 'Laser' | 'Manuel';

export type TypePointage = 'Entrée' | 'Sortie';

export type StatutPresence = 'Présent' | 'Absent' | 'Absent longue durée';

export type NiveauPriorite = 'Faible' | 'Moyen' | 'Élevé' | 'Critique';

export type TypeNotification = 'Badge' | 'Pharmacie' | 'Événement' | 'Absence' | 'Système';

export type TypeEvenement = 'Réunion' | 'Formation' | 'Activité' | 'Autre';

export interface User {
  id: string;
  email: string;
  role: 'Super-PDG';
  created_at: string;
}

export interface Membre {
  id: string;
  nom: string;
  prenom: string;
  role: Role;
  photo?: string;
  code_barre: string;
  date_inscription: string;
  status_sante_sociale?: string;
  famille_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MembreFormData {
  nom: string;
  prenom: string;
  role: Role;
  photo?: string;
  date_inscription: string;
  status_sante_sociale?: string;
  famille_id?: string;
}

export interface Pointage {
  id: string;
  membre_id: string;
  date_heure: string;
  type: TypePointage;
  methode: MethodePointage;
  created_at: string;
}

export interface PointageRecord extends Pointage {
  membre?: Membre;
}

export interface Medicament {
  id: string;
  nom: string;
  stock_actuel: number;
  seuil_alerte: number;
  unite: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface PharmacieItem extends Medicament {
  en_alerte: boolean;
}

export interface Consultation {
  id: string;
  membre_id: string;
  date_consultation: string;
  diagnostic: string;
  traitement: string;
  medicaments_prescrits?: string[];
  notes?: string;
  created_at: string;
}

export interface ConsultationRecord extends Consultation {
  membre?: Membre;
}

export interface Evenement {
  id: string;
  titre: string;
  description?: string;
  type: TypeEvenement;
  date_debut: string;
  date_fin?: string;
  lieu?: string;
  participants?: string[];
  created_at: string;
  updated_at: string;
}

export interface VieSociale {
  id: string;
  type: 'Cantine' | 'Gargote' | 'Réunion' | 'Réservation';
  membre_id?: string;
  date: string;
  details: string;
  montant?: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  auteur: string;
  action: string;
  details?: string;
  horodatage: string;
}

export interface Notification {
  id: string;
  type: TypeNotification;
  titre: string;
  message: string;
  priorite: NiveauPriorite;
  lu: boolean;
  membre_id?: string;
  created_at: string;
}

export interface Alerte {
  id: string;
  type: 'Absence' | 'Pharmacie' | 'Badge' | 'Événement';
  titre: string;
  description: string;
  priorite: NiveauPriorite;
  membre_id?: string;
  medicament_id?: string;
  evenement_id?: string;
  resolu: boolean;
  created_at: string;
  resolved_at?: string;
}

export interface Rapport {
  id: string;
  type: 'Présence' | 'Pharmacie' | 'Événements' | 'Général';
  titre: string;
  date_generation: string;
  periode_debut: string;
  periode_fin: string;
  fichier_url?: string;
  created_at: string;
}

export interface StatistiquePresence {
  total_membres: number;
  presents_aujourdhui: number;
  absents_3_jours: number;
  absents_longue_duree: number;
  taux_presence: number;
}

export interface StatistiqueRole {
  role: Role;
  total: number;
  presents: number;
  absents: number;
}

export interface StatistiquePointage {
  date: string;
  entrees: number;
  sorties: number;
  presents: number;
}

export const ROLES: Role[] = ['Personnel', 'Mère', 'Enfant', 'Bénéficiaire'];

export const METHODES_POINTAGE: MethodePointage[] = ['Laser', 'Manuel'];

export const TYPES_POINTAGE: TypePointage[] = ['Entrée', 'Sortie'];

export const TYPES_EVENEMENT: TypeEvenement[] = ['Réunion', 'Formation', 'Activité', 'Autre'];

export const NIVEAUX_PRIORITE: NiveauPriorite[] = ['Faible', 'Moyen', 'Élevé', 'Critique'];

export const TYPES_NOTIFICATION: TypeNotification[] = ['Badge', 'Pharmacie', 'Événement', 'Absence', 'Système'];

export const SEUIL_ABSENCE_ALERTE = 3;
export const SEUIL_ABSENCE_CRITIQUE = 7;

export const ADMIN_EMAIL = 'basedoner711@gmail.com';
export const ADMIN_PASSWORD = 'made@711';

export const BADGE_WIDTH_MM = 85;
export const BADGE_HEIGHT_MM = 55;
export const BADGES_PER_PAGE = 10;

export const RAPPORT_AUTO_HEURE = 18;

export const REFRESH_INTERVAL_MS = 30000;

export const KIOSQUE_FEEDBACK_DURATION_MS = 3000;