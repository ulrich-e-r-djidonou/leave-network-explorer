export interface Duration {
  total: number | null;
  paid: number | null;
  wellPaid: number | null;
}

export interface BirthOrderVariation {
  exists: boolean;
  details_en: string;
  details_fr: string;
}

export interface LeavePolicy {
  exists: boolean;
  durationMonths: Duration;
  paymentRate: number | null;
  paymentType: "earnings-related" | "flat-rate" | "mixed" | "unpaid" | null;
  ceiling: boolean;
  obligatory: boolean;
  transferable: boolean;
  flexPartTime: boolean;
  flexBlocks: boolean;
  additionalForMultiple?: boolean;
  fundingSource: string | null;
  notes?: string;
  birthOrderVariation?: BirthOrderVariation;
}

export interface ParentalLeave extends LeavePolicy {
  entitlementType: "individual" | "family" | "mixed" | null;
  motherQuotaMonths: number | null;
  fatherQuotaMonths: number | null;
  sharedPortionMonths: number | null;
}

export interface ChildcareLeave {
  exists: boolean;
  durationMonths: number | null;
  paid: boolean;
  details: string | null;
}

export interface OtherMeasures {
  sickChildLeave: { exists: boolean; daysPerYear: number | null; paid: boolean };
  breastfeeding: { exists: boolean };
  flexibleWork: { rightToRequest: boolean };
  domesticViolenceLeave: { exists: boolean };
  bereavementLeave: { exists: boolean };
}

export interface PensionRights {
  continuesDuringLeave: boolean | null;
  details_en: string;
  details_fr: string;
}

export interface ECEC {
  universalEntitlement: boolean;
  entitlementAgeMonths: number | null;
  gapAfterLeaveMonths: number | null;
}

export interface RecentChange {
  type: "expansion" | "cutback" | "recalibration" | "introduction" | "abolition";
  leaveType: string;
  description: string;
}

export interface SubnationalEntity {
  name: string;
  code: string;
  type: "province" | "state" | "canton" | "entity" | "sector" | "region" | "municipality";
  variationType?: "full" | "supplement";
  maternity?: Partial<LeavePolicy> | null;
  paternity?: Partial<LeavePolicy> | null;
  parental?: Partial<ParentalLeave> | null;
  details?: string;
  notes?: string;
}

export interface Country {
  name: string;
  iso2: string;
  iso3: string;
  region: string;
  federal: boolean;
  subnationalVariations: string[];
  subnational?: SubnationalEntity[];
  maternity: LeavePolicy;
  paternity: LeavePolicy;
  parental: ParentalLeave;
  childcareLeave: ChildcareLeave;
  otherMeasures: OtherMeasures;
  pensionRights?: PensionRights;
  ecec: ECEC;
  recentChanges: RecentChange[];
}

export interface CountryData {
  metadata: {
    year: number;
    asOf: string;
    source: string;
    editors: string;
    totalCountries: number;
  };
  countries: Country[];
}

export type LeaveType = "maternity" | "paternity" | "parental";

export type MapIndicator =
  | "maternity_total"
  | "maternity_wellPaid"
  | "paternity_total"
  | "paternity_wellPaid"
  | "parental_total"
  | "parental_wellPaid"
  | "total_leave"
  | "gender_equality"
  | "generosity"
  | "pension";
