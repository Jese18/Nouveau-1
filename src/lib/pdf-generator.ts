import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { IMAGES } from "@/assets/images";
import { generateBarcode } from "./barcode";
import {
  Membre,
  PointageRecord,
  PharmacieItem,
  BADGE_WIDTH_MM,
  BADGE_HEIGHT_MM,
  BADGES_PER_PAGE,
} from "./index";

const BRAND_COLORS = {
  black: "#000000",
  orange: "#FF6600",
  white: "#FFFFFF",
};

const LOGO_WIDTH = 30;
const LOGO_HEIGHT = 30;

function addHeader(doc: jsPDF, title: string) {
  doc.setFillColor(BRAND_COLORS.black);
  doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");

  try {
    doc.addImage(IMAGES.MADE_LOGO_20260408_011427_37, "PNG", 15, 5, LOGO_WIDTH, LOGO_HEIGHT);
  } catch (error) {
    console.error("Erreur chargement logo:", error);
  }

  doc.setTextColor(BRAND_COLORS.white);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(title, doc.internal.pageSize.width / 2, 25, { align: "center" });

  doc.setTextColor(BRAND_COLORS.orange);
  doc.setFontSize(10);
  doc.text("ONG MADE - Antananarivo, Madagascar", doc.internal.pageSize.width / 2, 33, { align: "center" });
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(BRAND_COLORS.black);
    doc.rect(0, pageHeight - 15, pageWidth, 15, "F");

    doc.setTextColor(BRAND_COLORS.white);
    doc.setFontSize(8);
    doc.text(
      `© 2026 ONG MADE - Page ${i}/${pageCount}`,
      pageWidth / 2,
      pageHeight - 7,
      { align: "center" }
    );
  }
}

export function generateBadgePDF(membre: Membre): void {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [BADGE_WIDTH_MM, BADGE_HEIGHT_MM],
  });

  doc.setFillColor(BRAND_COLORS.black);
  doc.rect(0, 0, BADGE_WIDTH_MM, BADGE_HEIGHT_MM, "F");

  doc.setDrawColor(BRAND_COLORS.orange);
  doc.setLineWidth(1);
  doc.rect(2, 2, BADGE_WIDTH_MM - 4, BADGE_HEIGHT_MM - 4);

  try {
    doc.addImage(IMAGES.MADE_LOGO_20260408_011427_37, "PNG", 5, 5, 15, 15);
  } catch (error) {
    console.error("Erreur chargement logo badge:", error);
  }

  if (membre.photo) {
    try {
      doc.addImage(membre.photo, "PNG", BADGE_WIDTH_MM - 22, 5, 17, 17);
    } catch (error) {
      console.error("Erreur chargement photo membre:", error);
    }
  }

  doc.setTextColor(BRAND_COLORS.white);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`${membre.prenom} ${membre.nom}`, BADGE_WIDTH_MM / 2, 28, { align: "center" });

  doc.setTextColor(BRAND_COLORS.orange);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(membre.role, BADGE_WIDTH_MM / 2, 33, { align: "center" });

  const barcodeImage = generateBarcode(membre.code_barre);
  if (barcodeImage) {
    try {
      doc.addImage(barcodeImage, "PNG", 10, 37, 65, 15);
    } catch (error) {
      console.error("Erreur ajout code-barres:", error);
    }
  }

  doc.save(`badge_${membre.nom}_${membre.prenom}.pdf`);
}

export function generatePresenceListPDF(membres: Membre[], date: string): void {
  const doc = new jsPDF();

  addHeader(doc, "Liste de Présence");

  doc.setTextColor(BRAND_COLORS.black);
  doc.setFontSize(12);
  doc.text(`Date: ${new Date(date).toLocaleDateString("fr-FR")}`, 15, 50);

  const tableData = membres.map((m) => [
    `${m.prenom} ${m.nom}`,
    m.role,
    m.code_barre,
    "",
  ]);

  autoTable(doc, {
    startY: 60,
    head: [["Nom Complet", "Rôle", "Code Badge", "Signature"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: BRAND_COLORS.orange,
      textColor: BRAND_COLORS.white,
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      textColor: BRAND_COLORS.black,
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: "#f5f5f5",
    },
    margin: { top: 60, bottom: 20 },
  });

  addFooter(doc);

  doc.save(`liste_presence_${date}.pdf`);
}

export function generateRapportPointagePDF(
  pointages: PointageRecord[],
  dateDebut: string,
  dateFin: string
): void {
  const doc = new jsPDF();

  addHeader(doc, "Rapport de Pointage");

  doc.setTextColor(BRAND_COLORS.black);
  doc.setFontSize(12);
  doc.text(
    `Période: ${new Date(dateDebut).toLocaleDateString("fr-FR")} - ${new Date(dateFin).toLocaleDateString("fr-FR")}`,
    15,
    50
  );

  const tableData = pointages.map((p) => [
    new Date(p.date_heure).toLocaleDateString("fr-FR"),
    new Date(p.date_heure).toLocaleTimeString("fr-FR"),
    p.membre ? `${p.membre.prenom} ${p.membre.nom}` : "N/A",
    p.membre?.role || "N/A",
    p.type,
    p.methode,
  ]);

  autoTable(doc, {
    startY: 60,
    head: [["Date", "Heure", "Membre", "Rôle", "Type", "Méthode"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: BRAND_COLORS.orange,
      textColor: BRAND_COLORS.white,
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      textColor: BRAND_COLORS.black,
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: "#f5f5f5",
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 20 },
      2: { cellWidth: 45 },
      3: { cellWidth: 30 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
    },
    margin: { top: 60, bottom: 20 },
  });

  const entrees = pointages.filter((p) => p.type === "Entrée").length;
  const sorties = pointages.filter((p) => p.type === "Sortie").length;

  const finalY = (doc as any).lastAutoTable.finalY || 60;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(BRAND_COLORS.black);
  doc.text("Statistiques:", 15, finalY + 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Total pointages: ${pointages.length}`, 15, finalY + 22);
  doc.text(`Entrées: ${entrees}`, 15, finalY + 29);
  doc.text(`Sorties: ${sorties}`, 15, finalY + 36);

  addFooter(doc);

  doc.save(`rapport_pointage_${dateDebut}_${dateFin}.pdf`);
}

export function generateInventairePharmaciePDF(medicaments: PharmacieItem[]): void {
  const doc = new jsPDF();

  addHeader(doc, "Inventaire Pharmacie");

  doc.setTextColor(BRAND_COLORS.black);
  doc.setFontSize(12);
  doc.text(`Date: ${new Date().toLocaleDateString("fr-FR")}`, 15, 50);

  const tableData = medicaments.map((m) => [
    m.nom,
    `${m.stock_actuel} ${m.unite}`,
    `${m.seuil_alerte} ${m.unite}`,
    m.en_alerte ? "⚠️ ALERTE" : "✓ OK",
  ]);

  autoTable(doc, {
    startY: 60,
    head: [["Médicament", "Stock Actuel", "Seuil Alerte", "Statut"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: BRAND_COLORS.orange,
      textColor: BRAND_COLORS.white,
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      textColor: BRAND_COLORS.black,
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: "#f5f5f5",
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 35 },
      2: { cellWidth: 35 },
      3: { cellWidth: 40 },
    },
    didParseCell: (data) => {
      if (data.column.index === 3 && data.cell.text[0].includes("ALERTE")) {
        data.cell.styles.textColor = "#FF0000";
        data.cell.styles.fontStyle = "bold";
      }
    },
    margin: { top: 60, bottom: 20 },
  });

  const enAlerte = medicaments.filter((m) => m.en_alerte).length;

  const finalY = (doc as any).lastAutoTable.finalY || 60;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(BRAND_COLORS.black);
  doc.text("Statistiques:", 15, finalY + 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Total médicaments: ${medicaments.length}`, 15, finalY + 22);
  doc.text(`Médicaments en alerte: ${enAlerte}`, 15, finalY + 29);

  addFooter(doc);

  doc.save(`inventaire_pharmacie_${new Date().toISOString().split("T")[0]}.pdf`);
}

export function generateEvacuationPDF(membresPresents: Membre[]): void {
  const doc = new jsPDF();

  doc.setFillColor("#FF0000");
  doc.rect(0, 0, doc.internal.pageSize.width, 50, "F");

  doc.setTextColor(BRAND_COLORS.white);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("⚠️ ÉVACUATION D'URGENCE", doc.internal.pageSize.width / 2, 25, { align: "center" });

  doc.setFontSize(12);
  doc.text(
    `Date/Heure: ${new Date().toLocaleString("fr-FR")}`,
    doc.internal.pageSize.width / 2,
    40,
    { align: "center" }
  );

  doc.setTextColor(BRAND_COLORS.black);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Personnes présentes: ${membresPresents.length}`, 15, 60);

  const tableData = membresPresents.map((m, index) => [
    (index + 1).toString(),
    `${m.prenom} ${m.nom}`,
    m.role,
    m.code_barre,
  ]);

  autoTable(doc, {
    startY: 70,
    head: [["#", "Nom Complet", "Rôle", "Code Badge"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: "#FF0000",
      textColor: BRAND_COLORS.white,
      fontStyle: "bold",
      fontSize: 11,
    },
    bodyStyles: {
      textColor: BRAND_COLORS.black,
      fontSize: 10,
    },
    alternateRowStyles: {
      fillColor: "#ffe6e6",
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 70 },
      2: { cellWidth: 40 },
      3: { cellWidth: 55 },
    },
    margin: { top: 70, bottom: 20 },
  });

  addFooter(doc);

  doc.save(`evacuation_urgence_${new Date().toISOString().replace(/[:.]/g, "-")}.pdf`);
}

export function generateBadgePlanchePDF(membres: Membre[]): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 10;
  const cols = 2;
  const rows = 5;
  const badgeWidth = (pageWidth - margin * (cols + 1)) / cols;
  const badgeHeight = (pageHeight - margin * (rows + 1)) / rows;

  let currentPage = 0;
  let badgeIndex = 0;

  membres.forEach((membre, index) => {
    if (index > 0 && index % BADGES_PER_PAGE === 0) {
      doc.addPage();
      currentPage++;
      badgeIndex = 0;
    }

    const col = badgeIndex % cols;
    const row = Math.floor(badgeIndex / cols);
    const x = margin + col * (badgeWidth + margin);
    const y = margin + row * (badgeHeight + margin);

    doc.setFillColor(BRAND_COLORS.black);
    doc.rect(x, y, badgeWidth, badgeHeight, "F");

    doc.setDrawColor(BRAND_COLORS.orange);
    doc.setLineWidth(0.5);
    doc.rect(x + 1, y + 1, badgeWidth - 2, badgeHeight - 2);

    try {
      doc.addImage(IMAGES.MADE_LOGO_20260408_011427_37, "PNG", x + 3, y + 3, 12, 12);
    } catch (error) {
      console.error("Erreur logo planche:", error);
    }

    if (membre.photo) {
      try {
        doc.addImage(membre.photo, "PNG", x + badgeWidth - 15, y + 3, 12, 12);
      } catch (error) {
        console.error("Erreur photo planche:", error);
      }
    }

    doc.setTextColor(BRAND_COLORS.white);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${membre.prenom} ${membre.nom}`, x + badgeWidth / 2, y + 20, { align: "center" });

    doc.setTextColor(BRAND_COLORS.orange);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(membre.role, x + badgeWidth / 2, y + 25, { align: "center" });

    const barcodeImage = generateBarcode(membre.code_barre);
    if (barcodeImage) {
      try {
        doc.addImage(barcodeImage, "PNG", x + 5, y + 28, badgeWidth - 10, 12);
      } catch (error) {
        console.error("Erreur code-barres planche:", error);
      }
    }

    badgeIndex++;
  });

  addFooter(doc);

  doc.save(`planche_badges_${new Date().toISOString().split("T")[0]}.pdf`);
}
