import * as XLSX from 'xlsx';
import type { Membre, PointageRecord, PharmacieItem, Role } from './index';

export function exportPresenceToExcel(
  membres: Membre[],
  pointages: PointageRecord[],
  date: string = new Date().toISOString().split('T')[0]
): void {
  const presentMembres = new Set(
    pointages
      .filter(p => p.type === 'Entrée' && p.date_heure.startsWith(date))
      .map(p => p.membre_id)
  );

  const sortedMembres = new Set(
    pointages
      .filter(p => p.type === 'Sortie' && p.date_heure.startsWith(date))
      .map(p => p.membre_id)
  );

  const data = membres.map(membre => ({
    'Nom': membre.nom,
    'Prénom': membre.prenom,
    'Rôle': membre.role,
    'Code-barres': membre.code_barre,
    'Statut': presentMembres.has(membre.id) && !sortedMembres.has(membre.id)
      ? 'Présent'
      : 'Absent',
    'Date': date
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  const colWidths = [
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 20 },
    { wch: 12 },
    { wch: 12 }
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Liste de Présence');

  const fileName = `liste_presence_${date}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportPointageToExcel(
  pointages: PointageRecord[],
  dateDebut?: string,
  dateFin?: string
): void {
  let filteredPointages = pointages;

  if (dateDebut) {
    filteredPointages = filteredPointages.filter(
      p => p.date_heure >= dateDebut
    );
  }

  if (dateFin) {
    filteredPointages = filteredPointages.filter(
      p => p.date_heure <= dateFin
    );
  }

  const data = filteredPointages.map(pointage => ({
    'Date/Heure': new Date(pointage.date_heure).toLocaleString('fr-FR'),
    'Nom': pointage.membre?.nom || '',
    'Prénom': pointage.membre?.prenom || '',
    'Rôle': pointage.membre?.role || '',
    'Type': pointage.type,
    'Méthode': pointage.methode,
    'Code-barres': pointage.membre?.code_barre || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  const colWidths = [
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 10 },
    { wch: 10 },
    { wch: 20 }
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rapport Pointage');

  const periode = dateDebut && dateFin
    ? `${dateDebut}_${dateFin}`
    : new Date().toISOString().split('T')[0];
  const fileName = `rapport_pointage_${periode}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportPharmacieToExcel(
  medicaments: PharmacieItem[]
): void {
  const data = medicaments.map(med => ({
    'Nom': med.nom,
    'Stock Actuel': med.stock_actuel,
    'Unité': med.unite,
    'Seuil Alerte': med.seuil_alerte,
    'Statut': med.en_alerte ? 'ALERTE' : 'OK',
    'Description': med.description || '',
    'Dernière MAJ': new Date(med.updated_at).toLocaleString('fr-FR')
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  const colWidths = [
    { wch: 30 },
    { wch: 15 },
    { wch: 10 },
    { wch: 15 },
    { wch: 12 },
    { wch: 40 },
    { wch: 20 }
  ];
  worksheet['!cols'] = colWidths;

  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    const statusCell = XLSX.utils.encode_cell({ r: R, c: 4 });
    if (worksheet[statusCell] && worksheet[statusCell].v === 'ALERTE') {
      worksheet[statusCell].s = {
        fill: { fgColor: { rgb: 'FFFF0000' } },
        font: { color: { rgb: 'FFFFFFFF' }, bold: true }
      };
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventaire Pharmacie');

  const fileName = `inventaire_pharmacie_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportStatistiquesRoleToExcel(
  membres: Membre[],
  pointages: PointageRecord[],
  date: string = new Date().toISOString().split('T')[0]
): void {
  const presentMembres = new Set(
    pointages
      .filter(p => p.type === 'Entrée' && p.date_heure.startsWith(date))
      .map(p => p.membre_id)
  );

  const sortedMembres = new Set(
    pointages
      .filter(p => p.type === 'Sortie' && p.date_heure.startsWith(date))
      .map(p => p.membre_id)
  );

  const roles: Role[] = ['Personnel', 'Mère', 'Enfant', 'Bénéficiaire'];
  
  const data = roles.map(role => {
    const membresRole = membres.filter(m => m.role === role);
    const presents = membresRole.filter(
      m => presentMembres.has(m.id) && !sortedMembres.has(m.id)
    ).length;
    const absents = membresRole.length - presents;
    const tauxPresence = membresRole.length > 0
      ? ((presents / membresRole.length) * 100).toFixed(1)
      : '0.0';

    return {
      'Rôle': role,
      'Total': membresRole.length,
      'Présents': presents,
      'Absents': absents,
      'Taux de Présence (%)': tauxPresence
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  const colWidths = [
    { wch: 20 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 20 }
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Statistiques par Rôle');

  const fileName = `statistiques_role_${date}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportConsultationsToExcel(
  consultations: any[],
  dateDebut?: string,
  dateFin?: string
): void {
  let filteredConsultations = consultations;

  if (dateDebut) {
    filteredConsultations = filteredConsultations.filter(
      c => c.date_consultation >= dateDebut
    );
  }

  if (dateFin) {
    filteredConsultations = filteredConsultations.filter(
      c => c.date_consultation <= dateFin
    );
  }

  const data = filteredConsultations.map(consultation => ({
    'Date': new Date(consultation.date_consultation).toLocaleDateString('fr-FR'),
    'Nom': consultation.membre?.nom || '',
    'Prénom': consultation.membre?.prenom || '',
    'Diagnostic': consultation.diagnostic,
    'Traitement': consultation.traitement,
    'Médicaments': consultation.medicaments_prescrits?.join(', ') || '',
    'Notes': consultation.notes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  const colWidths = [
    { wch: 12 },
    { wch: 20 },
    { wch: 20 },
    { wch: 30 },
    { wch: 30 },
    { wch: 30 },
    { wch: 40 }
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Consultations');

  const periode = dateDebut && dateFin
    ? `${dateDebut}_${dateFin}`
    : new Date().toISOString().split('T')[0];
  const fileName = `consultations_${periode}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
