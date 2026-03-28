import jsPDF from "jspdf";

interface DonorInfo {
  name: string;
  email: string;
}

interface DonationForReceipt {
  id: string;
  amount: number;
  created_at: string;
  beneficiaryName: string;
  beneficiaryRegion: string;
}

const ASSOCIATION_NAME = "CashForCause";
const ASSOCIATION_ADDRESS = "Association loi 1901 – Paris, France";
const TAX_RATE = 0.66;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} €`;
}

function addHeader(doc: jsPDF, y: number): number {
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(ASSOCIATION_NAME, 105, y, { align: "center" });
  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(ASSOCIATION_ADDRESS, 105, y, { align: "center" });
  doc.setTextColor(0, 0, 0);
  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, 190, y);
  return y + 10;
}

function addLegalFooter(doc: jsPDF, y: number): number {
  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, 190, y);
  y += 8;
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Article 200 du Code Général des Impôts — Réduction d'impôt égale à 66 % du montant des dons,",
    20,
    y
  );
  y += 4;
  doc.text(
    "dans la limite de 20 % du revenu imposable. Le donateur reconnaît ne recevoir aucune contrepartie directe.",
    20,
    y
  );
  y += 4;
  doc.text(
    `Ce document est généré par ${ASSOCIATION_NAME} et tient lieu d'attestation fiscale.`,
    20,
    y
  );
  doc.setTextColor(0, 0, 0);
  return y + 10;
}

export function generateIndividualReceipt(
  donation: DonationForReceipt,
  donor: DonorInfo
) {
  const doc = new jsPDF();
  let y = 25;

  y = addHeader(doc, y);

  // Title
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("Attestation de don", 105, y, { align: "center" });
  y += 12;

  // Donor info
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Donateur", 20, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(`Nom : ${donor.name}`, 20, y);
  y += 5;
  doc.text(`Email : ${donor.email}`, 20, y);
  y += 10;

  // Donation details
  doc.setFont("helvetica", "bold");
  doc.text("Détails du don", 20, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(`Date : ${formatDate(donation.created_at)}`, 20, y);
  y += 5;
  doc.text(`Référence : ${donation.id.slice(0, 8).toUpperCase()}`, 20, y);
  y += 5;
  doc.text(
    `Bénéficiaire : ${donation.beneficiaryName} — ${donation.beneficiaryRegion}`,
    20,
    y
  );
  y += 10;

  // Amount box
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(20, y, 170, 28, 3, 3, "F");
  y += 8;
  doc.setFontSize(11);
  doc.text(`Montant du don :`, 28, y);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(donation.amount), 160, y, { align: "right" });
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(34, 139, 34);
  doc.text(`Déduction fiscale (66 %) :`, 28, y);
  doc.setFont("helvetica", "bold");
  doc.text(`- ${formatCurrency(donation.amount * TAX_RATE)}`, 160, y, {
    align: "right",
  });
  y += 7;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(`Coût réel après réduction :`, 28, y);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(donation.amount * (1 - TAX_RATE)), 160, y, {
    align: "right",
  });
  y += 15;

  y = addLegalFooter(doc, y);

  doc.save(
    `attestation_${donation.id.slice(0, 8)}_${formatDate(donation.created_at).replace(/\s/g, "_")}.pdf`
  );
}

export function generateAnnualReceipt(
  donations: DonationForReceipt[],
  donor: DonorInfo,
  year: number
) {
  const doc = new jsPDF();
  let y = 25;

  y = addHeader(doc, y);

  // Title
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(`Attestation fiscale annuelle — ${year}`, 105, y, {
    align: "center",
  });
  y += 12;

  // Donor info
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Donateur", 20, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(`Nom : ${donor.name}`, 20, y);
  y += 5;
  doc.text(`Email : ${donor.email}`, 20, y);
  y += 10;

  // Summary box
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
  const taxDeduction = totalAmount * TAX_RATE;

  doc.setFillColor(245, 247, 250);
  doc.roundedRect(20, y, 170, 22, 3, 3, "F");
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`${donations.length} don${donations.length > 1 ? "s" : ""} en ${year}`, 28, y);
  doc.text(`Total : ${formatCurrency(totalAmount)}`, 160, y, { align: "right" });
  y += 7;
  doc.setTextColor(34, 139, 34);
  doc.text(`Déduction fiscale totale : - ${formatCurrency(taxDeduction)}`, 160, y, {
    align: "right",
  });
  doc.setTextColor(0, 0, 0);
  y += 15;

  // Table header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setFillColor(235, 237, 240);
  doc.rect(20, y - 4, 170, 8, "F");
  doc.text("Date", 24, y);
  doc.text("Bénéficiaire", 60, y);
  doc.text("Montant", 145, y, { align: "right" });
  doc.text("Déduction", 175, y, { align: "right" });
  y += 8;

  // Table rows
  doc.setFont("helvetica", "normal");
  for (const d of donations) {
    if (y > 265) {
      doc.addPage();
      y = 20;
    }
    doc.text(formatDate(d.created_at), 24, y);
    doc.text(`${d.beneficiaryName} (${d.beneficiaryRegion})`.slice(0, 40), 60, y);
    doc.text(formatCurrency(d.amount), 145, y, { align: "right" });
    doc.setTextColor(34, 139, 34);
    doc.text(`- ${formatCurrency(d.amount * TAX_RATE)}`, 175, y, {
      align: "right",
    });
    doc.setTextColor(0, 0, 0);
    y += 6;
  }

  y += 5;
  // Total row
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, 190, y);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Total", 24, y);
  doc.text(formatCurrency(totalAmount), 145, y, { align: "right" });
  doc.setTextColor(34, 139, 34);
  doc.text(`- ${formatCurrency(taxDeduction)}`, 175, y, { align: "right" });
  doc.setTextColor(0, 0, 0);
  y += 12;

  y = addLegalFooter(doc, y);

  doc.save(`attestation_annuelle_${year}.pdf`);
}
