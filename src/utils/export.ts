import type { Country } from "../types";
import {
  getTotalLeaveMonths,
  getGenderEqualityScore,
  getGenerosityScore,
} from "./calculations";

/** Export countries data as CSV and trigger download */
export function exportToCSV(countries: Country[], filename = "leave_network_data.csv") {
  const headers = [
    "Pays",
    "ISO2",
    "Region",
    "Federal",
    "Maternite (mois total)",
    "Maternite (mois paye)",
    "Maternite (mois bien paye)",
    "Maternite taux (%)",
    "Maternite obligatoire",
    "Maternite transferable",
    "Paternite (mois total)",
    "Paternite (mois paye)",
    "Paternite (mois bien paye)",
    "Paternite taux (%)",
    "Paternite obligatoire",
    "Parental (mois total)",
    "Parental (mois paye)",
    "Parental (mois bien paye)",
    "Parental taux (%)",
    "Parental type droit",
    "Parental quota pere (mois)",
    "Parental transferable",
    "Parental temps partiel",
    "Total conges payes (mois)",
    "Score generosite",
    "Score egalite genres",
    "Conge enfant malade (jours/an)",
    "Travail flexible",
    "ECEC universel",
    "ECEC age (mois)",
    "Ecart conge-ECEC (mois)",
    "Nb variations infranationales",
  ];

  const rows = countries.map((c) => [
    c.name,
    c.iso2,
    c.region,
    c.federal ? "Oui" : "Non",
    c.maternity?.durationMonths?.total ?? "",
    c.maternity?.durationMonths?.paid ?? "",
    c.maternity?.durationMonths?.wellPaid ?? "",
    c.maternity?.paymentRate ?? "",
    c.maternity?.obligatory ? "Oui" : "Non",
    c.maternity?.transferable ? "Oui" : "Non",
    c.paternity?.durationMonths?.total ?? "",
    c.paternity?.durationMonths?.paid ?? "",
    c.paternity?.durationMonths?.wellPaid ?? "",
    c.paternity?.paymentRate ?? "",
    c.paternity?.obligatory ? "Oui" : "Non",
    c.parental?.durationMonths?.total ?? "",
    c.parental?.durationMonths?.paid ?? "",
    c.parental?.durationMonths?.wellPaid ?? "",
    c.parental?.paymentRate ?? "",
    c.parental?.entitlementType ?? "",
    c.parental?.fatherQuotaMonths ?? "",
    c.parental?.transferable ? "Oui" : "Non",
    c.parental?.flexPartTime ? "Oui" : "Non",
    getTotalLeaveMonths(c),
    getGenerosityScore(c),
    getGenderEqualityScore(c) ?? "N/A",
    c.otherMeasures?.sickChildLeave?.daysPerYear ?? "",
    c.otherMeasures?.flexibleWork?.rightToRequest ? "Oui" : "Non",
    c.ecec?.universalEntitlement ? "Oui" : "Non",
    c.ecec?.entitlementAgeMonths ?? "",
    c.ecec?.gapAfterLeaveMonths ?? "",
    c.subnational?.length ?? 0,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const str = String(cell);
          return str.includes(",") || str.includes('"')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
