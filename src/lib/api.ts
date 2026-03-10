import type { ChecklistItem } from "./types";

const BASE = "/api";

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

export const api = {
  auth: {
    me: () => request<{ user: string | null }>("/auth/me"),
    login: (name: string, password: string) => request<{ user: string }>("/auth/login", { method: "POST", body: JSON.stringify({ name, password }) }),
  },
  houses: {
    list: (p?: Record<string, string>) => request<House[]>(`/houses${p ? "?" + new URLSearchParams(p) : ""}`),
    get: (id: string) => request<House>(`/houses/${id}`),
    create: (d: Partial<House>) => request<House>("/houses", { method: "POST", body: JSON.stringify(d) }),
    update: (id: string, d: Partial<House>) => request<House>(`/houses/${id}`, { method: "PUT", body: JSON.stringify(d) }),
    delete: (id: string) => request(`/houses/${id}`, { method: "DELETE" }),
    import: (url: string, user?: string) => request<House>("/houses/import", { method: "POST", body: JSON.stringify({ url, user }) }),
  },
  bids: {
    list: (hid: string) => request<Bid[]>(`/houses/${hid}/bids`),
    create: (hid: string, d: Partial<Bid>) => request<Bid>(`/houses/${hid}/bids`, { method: "POST", body: JSON.stringify(d) }),
    sync: (hid: string) => request(`/houses/${hid}/bids/sync`, { method: "POST" }),
  },
  actions: {
    list: (p?: Record<string, string>) => request<ActionItem[]>(`/actions${p ? "?" + new URLSearchParams(p) : ""}`),
    create: (d: Partial<ActionItem>) => request<ActionItem>("/actions", { method: "POST", body: JSON.stringify(d) }),
    update: (id: string, d: Partial<ActionItem>) => request<ActionItem>(`/actions/${id}`, { method: "PUT", body: JSON.stringify(d) }),
    delete: (id: string) => request(`/actions/${id}`, { method: "DELETE" }),
  },
  mortgage: {
    list: () => request<Mortgage[]>("/mortgage"),
    create: (d: Partial<Mortgage>) => request<Mortgage>("/mortgage", { method: "POST", body: JSON.stringify(d) }),
    update: (id: string, d: Partial<Mortgage>) => request<Mortgage>(`/mortgage/${id}`, { method: "PUT", body: JSON.stringify(d) }),
    seedDocs: (mid: string) => request(`/mortgage/${mid}/documents`, { method: "POST" }),
    getDocs: (mid: string) => request<MortgageDoc[]>(`/mortgage/${mid}/documents`),
    updateDoc: (mid: string, did: string, d: Partial<MortgageDoc>) => request<MortgageDoc>(`/mortgage/${mid}/documents/${did}`, { method: "PUT", body: JSON.stringify(d) }),
  },
  estimates: {
    list: (hid: string) => request<Estimate[]>(`/houses/${hid}/estimates`),
    create: (hid: string, d: Partial<Estimate>) => request<Estimate>(`/houses/${hid}/estimates`, { method: "POST", body: JSON.stringify(d) }),
    generate: (hid: string) => request<Estimate[]>(`/houses/${hid}/estimates/generate`, { method: "POST" }),
  },
  media: {
    list: (hid: string) => request<Media[]>(`/houses/${hid}/media`),
    upload: async (hid: string, file: File, type = "photo") => {
      const form = new FormData(); form.append("file", file); form.append("type", type);
      const res = await fetch(`${BASE}/houses/${hid}/media`, { method: "POST", body: form });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      return res.json() as Promise<Media>;
    },
    delete: (hid: string, mid: string) => request(`/houses/${hid}/media/${mid}`, { method: "DELETE" }),
    url: (fp: string) => `${BASE}/media/${fp.split("/").pop()}`,
  },
  checklists: {
    list: (hid: string) => request<Checklist[]>(`/houses/${hid}/checklists`),
    create: (hid: string, d?: { templateId?: string }) => request<Checklist>(`/houses/${hid}/checklists`, { method: "POST", body: JSON.stringify(d || {}) }),
    update: (hid: string, cid: string, d: { items: ChecklistItem[] }) => request<Checklist>(`/houses/${hid}/checklists/${cid}`, { method: "PUT", body: JSON.stringify({ items: d.items }) }),
  },
  checklistTemplates: {
    list: () => request<ChecklistTemplate[]>("/checklist-templates"),
    create: (d: { name: string; items: string[]; isDefault?: boolean }) => request<ChecklistTemplate>("/checklist-templates", { method: "POST", body: JSON.stringify(d) }),
  },
  activity: { list: (limit = 50) => request<ActivityLog[]>(`/activity?limit=${limit}`) },
  seed: () => request<{ message: string }>("/seed", { method: "POST" }),
  // New endpoints
  profile: {
    get: () => request<BuyerProfile | null>("/profile"),
    update: (d: Partial<BuyerProfile>) => request<BuyerProfile>("/profile", { method: "PUT", body: JSON.stringify(d) }),
  },
  schemes: {
    eligibility: () => request<SchemeEligibility>("/schemes/eligibility"),
    list: () => request<SchemeRecord[]>("/schemes"),
    update: (scheme: string, d: Partial<SchemeRecord>) => request<SchemeRecord>(`/schemes/${scheme}`, { method: "PUT", body: JSON.stringify(d) }),
  },
  stampDuty: (price: number, newBuild: boolean) => request<{ stampableAmount: number; stampDuty: number }>(`/stamp-duty?price=${price}&newBuild=${newBuild}`),
  totalCost: {
    get: (hid: string) => request<TotalCost | null>(`/houses/${hid}/total-cost`),
    update: (hid: string, d: Partial<TotalCost>) => request<TotalCost>(`/houses/${hid}/total-cost`, { method: "PUT", body: JSON.stringify(d) }),
  },
  conveyancing: {
    get: (hid: string) => request<Conveyancing | null>(`/houses/${hid}/conveyancing`),
    create: (hid: string) => request<Conveyancing>(`/houses/${hid}/conveyancing`, { method: "POST" }),
    update: (hid: string, d: Record<string, unknown>) => request<Conveyancing>(`/houses/${hid}/conveyancing`, { method: "PUT", body: JSON.stringify(d) }),
    updateMilestone: (hid: string, mid: string, d: Record<string, unknown>) => request(`/houses/${hid}/conveyancing/milestones/${mid}`, { method: "PUT", body: JSON.stringify(d) }),
  },
  apartment: {
    get: (hid: string) => request<ApartmentDetail | null>(`/houses/${hid}/apartment`),
    update: (hid: string, d: Record<string, unknown>) => request<ApartmentDetail>(`/houses/${hid}/apartment`, { method: "PUT", body: JSON.stringify(d) }),
  },
  defectiveBlocks: {
    get: (hid: string) => request<DefBlocks | null>(`/houses/${hid}/defective-blocks`),
    update: (hid: string, d: Record<string, unknown>) => request<DefBlocks>(`/houses/${hid}/defective-blocks`, { method: "PUT", body: JSON.stringify(d) }),
  },
  calculator: {
    borrowing: (i1: number, i2: number, ftb: boolean) => request<BorrowingLimits>(`/calculator/borrowing?income1=${i1}&income2=${i2}&ftb=${ftb}`),
    planning: (type: string, size: number, garden?: number) => request<PlanningResult>(`/calculator/planning?type=${type}&size=${size}${garden ? `&gardenSize=${garden}` : ""}`),
  },
  biddingStrategy: {
    get: (hid: string) => request<BiddingStrategyRecord | null>(`/houses/${hid}/bidding-strategy`),
    update: (hid: string, d: Record<string, unknown>) => request<BiddingStrategyRecord>(`/houses/${hid}/bidding-strategy`, { method: "PUT", body: JSON.stringify(d) }),
  },
  comms: {
    list: (p?: Record<string, string>) => request<CommLogRecord[]>(`/comms${p ? "?" + new URLSearchParams(p) : ""}`),
    create: (d: Record<string, unknown>) => request<CommLogRecord>("/comms", { method: "POST", body: JSON.stringify(d) }),
    update: (id: string, d: Record<string, unknown>) => request<CommLogRecord>(`/comms/${id}`, { method: "PUT", body: JSON.stringify(d) }),
  },
  surveyFindings: {
    list: (hid: string) => request<SurveyFindingRecord[]>(`/houses/${hid}/survey-findings`),
    create: (hid: string, d: Record<string, unknown>) => request<SurveyFindingRecord>(`/houses/${hid}/survey-findings`, { method: "POST", body: JSON.stringify(d) }),
    update: (hid: string, fid: string, d: Record<string, unknown>) => request<SurveyFindingRecord>(`/houses/${hid}/survey-findings/${fid}`, { method: "PUT", body: JSON.stringify(d) }),
    delete: (hid: string, fid: string) => request(`/houses/${hid}/survey-findings/${fid}`, { method: "DELETE" }),
  },
  fallThrough: {
    list: (hid: string) => request<FallThroughRec[]>(`/houses/${hid}/fall-through`),
    create: (hid: string, d: Record<string, unknown>) => request(`/houses/${hid}/fall-through`, { method: "POST", body: JSON.stringify(d) }),
  },
  contractReadiness: {
    get: () => request<{ items: ReadinessItem[]; readyPct: number }>("/contract-readiness"),
    update: (d: Record<string, unknown>) => request("/contract-readiness", { method: "PUT", body: JSON.stringify(d) }),
  },
  snags: {
    list: (hid: string) => request<SnagRecord[]>(`/houses/${hid}/snags`),
    seed: (hid: string) => request<SnagRecord[]>(`/houses/${hid}/snags`, { method: "POST", body: JSON.stringify({ seedDefaults: true }) }),
    create: (hid: string, d: Record<string, unknown>) => request<SnagRecord>(`/houses/${hid}/snags`, { method: "POST", body: JSON.stringify(d) }),
    update: (hid: string, sid: string, d: Record<string, unknown>) => request<SnagRecord>(`/houses/${hid}/snags/${sid}`, { method: "PUT", body: JSON.stringify(d) }),
  },
  berImpact: {
    get: (hid: string) => request<BerImpactResult | null>(`/houses/${hid}/ber-impact`),
  },
  sellerIntel: {
    get: (hid: string) => request<SellerIntelRecord | null>(`/houses/${hid}/seller-intel`),
    update: (hid: string, d: Record<string, unknown>) => request<SellerIntelRecord>(`/houses/${hid}/seller-intel`, { method: "PUT", body: JSON.stringify(d) }),
  },
  newBuildCompliance: {
    get: (hid: string) => request<NewBuildComplianceRecord | null>(`/houses/${hid}/new-build-compliance`),
    update: (hid: string, d: Record<string, unknown>) => request<NewBuildComplianceRecord>(`/houses/${hid}/new-build-compliance`, { method: "PUT", body: JSON.stringify(d) }),
  },
  journal: {
    list: (houseId?: string) => request<JournalRecord[]>(`/journal${houseId ? `?houseId=${houseId}` : ""}`),
    create: (d: Record<string, unknown>) => request<JournalRecord>("/journal", { method: "POST", body: JSON.stringify(d) }),
  },
};

// Types
export interface House { id: string; address: string; eircode?: string; neighbourhood?: string; askingPrice?: number; currentBid?: number; listingUrl?: string; offrUrl?: string; status: string; bedrooms?: number; bathrooms?: number; propertyType?: string; ber?: string; isNewBuild?: boolean; squareMetres?: number; notes?: string; pros?: string; cons?: string; viewingDate?: string; addedBy?: string; createdAt: string; updatedAt: string; media: Media[]; bids: Bid[]; actionItems: ActionItem[]; renovationEstimates: Estimate[]; viewingChecklists: Checklist[]; totalCostEstimate?: TotalCost | null; conveyancing?: Conveyancing | null; apartmentDetails?: ApartmentDetail | null; defectiveBlocks?: DefBlocks | null; biddingStrategy?: BiddingStrategyRecord | null; sellerIntel?: SellerIntelRecord | null; newBuildCompliance?: NewBuildComplianceRecord | null; surveyFindings?: SurveyFindingRecord[]; snagItems?: SnagRecord[]; }
export interface Media { id: string; houseId: string; type: string; filePath: string; caption?: string; }
export interface Bid { id: string; houseId: string; amount: number; bidDate: string; source: string; isOurs: boolean; notes?: string; }
export interface ActionItem { id: string; houseId?: string; title: string; description?: string; dueDate?: string; assignedTo?: string; status: string; category: string; house?: { address: string }; }
export interface Mortgage { id: string; lender: string; approvalAmount?: number; approvalExpiry?: string; interestRate?: number; fixedPeriod?: number; term?: number; monthlyRepayment?: number; status: string; notes?: string; documents: MortgageDoc[]; }
export interface MortgageDoc { id: string; mortgageId: string; name: string; required: boolean; uploaded: boolean; perPerson: boolean; person?: string; filePath?: string; }
export interface Estimate { id: string; houseId: string; item: string; estimatedCostLow?: number; estimatedCostHigh?: number; source: string; notes?: string; }
export interface Checklist { id: string; houseId: string; items: string; createdAt: string; }
export interface ChecklistTemplate { id: string; name: string; items: string; isDefault: boolean; }
export interface ActivityLog { id: string; user: string; action: string; entity: string; entityId?: string; detail?: string; createdAt: string; }
export interface BuyerProfile { id: string; name1: string; name2: string; isFirstTimeBuyer: boolean; grossIncome1: number; grossIncome2: number; existingMonthlyDebt: number; totalSavings: number; taxPaid4Years1: number; taxPaid4Years2: number; workplaceAddress1?: string; workplaceAddress2?: string; }
export interface SchemeEligibility { htb: { eligible: boolean; reason: string; maxRefund: number }; fhs: { eligible: boolean; reason: string; maxEquity: number }; lahl: { eligible: boolean; reason: string; maxLoan: number }; }
export interface SchemeRecord { id: string; scheme: string; eligible: boolean; estimatedAmount?: number; applicationStatus: string; notes?: string; }
export interface TotalCost { id: string; houseId: string; purchasePrice: number; deposit: number; stampDuty: number; legalFees: number; landRegistryFees: number; surveyFee: number; valuationFee: number; mortgageProtection: number; homeInsurance: number; movingCosts: number; otherCosts: number; totalUpfront?: number; cashNeededAtClosing?: number; }
export interface Conveyancing { id: string; houseId: string; solicitorName?: string; solicitorFirm?: string; solicitorPhone?: string; solicitorEmail?: string; estimatedClosingDate?: string; status: string; milestones: Milestone[]; }
export interface Milestone { id: string; step: string; stepOrder: number; status: string; completedDate?: string; notes?: string; blockerReason?: string; }
export interface ApartmentDetail { id: string; houseId: string; managementCompany?: string; annualServiceCharge?: number; sinkingFundBalance?: number; sinkingFundAdequacy?: string; fireSafetyCompliant: boolean; parkingIncluded: boolean; parkingDetails?: string; storageIncluded: boolean; commonAreaCondition?: string; numberOfUnits?: number; yearBuilt?: number; omcChecklist?: string; }
export interface DefBlocks { id: string; houseId: string; buildYear?: number; inRiskPeriod: boolean; pyriteTestResult: string; is398Certificate: boolean; micaRisk: boolean; remediationEligible: boolean; structuralEngineerReport: boolean; notes?: string; }
export interface BorrowingLimits { combinedIncome: number; multiplier: number; maxLTI: number; maxPropertyPrice: number; minDeposit: number; monthlyAt4pct: number; monthlyAt6pct: number; }

// New types (persona audit features)
export interface BiddingStrategyRecord { id: string; houseId: string; hardCeiling: number; coolingOffMinutes: number; warningThresholdPct: number; pprMedianAtBidTime?: number; }
export interface CommLogRecord { id: string; houseId?: string; professional: string; contactName: string; direction: string; method: string; summary: string; responseNeeded: boolean; respondedAt?: string; createdAt: string; }
export interface SurveyFindingRecord { id: string; houseId: string; category: string; location: string; description: string; estimatedCostLow?: number; estimatedCostHigh?: number; action: string; }
export interface FallThroughRec { id: string; houseId: string; reason: string; notes?: string; costsIncurred?: number; occurredAt: string; }
export interface ReadinessItem { item: string; status: boolean; auto: boolean; detail?: string; }
export interface SnagRecord { id: string; houseId: string; room: string; category: string; description: string; status: string; priority: string; }
export interface BerImpactResult { ber: string; sqm: number; estimatedAnnualHeating: number; retrofitCostLow: number; retrofitCostHigh: number; seaiGrantsAvailable: number; netRetrofitLow: number; netRetrofitHigh: number; tenYearSaving: number; }
export interface SellerIntelRecord { id: string; houseId: string; inChain?: boolean; isProbate?: boolean; solicitorAppointed?: boolean; motivationLevel?: string; timelineExpectation?: string; reasonForSelling?: string; notes?: string; }
export interface NewBuildComplianceRecord { id: string; houseId: string; warrantyProvider?: string; warrantyRegistrationNo?: string; bcarCommencementNotice: boolean; assignedCertifier?: string; certOfCompliance: boolean; }
export interface JournalRecord { id: string; houseId?: string; type: string; gutRating?: number; content: string; createdAt: string; house?: { address: string }; }
export interface PlanningResult { exempt: boolean; reason: string; conditions?: string[]; }
