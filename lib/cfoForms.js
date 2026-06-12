/**
 * CFO Form Field Definitions
 * ตามแบบฟอร์ม อบก. (Fr-01 ถึง Fr-05) + Net Zero
 *
 * ใช้สำหรับสร้างฟอร์มกรอกข้อมูลอัตโนมัติ
 * และใช้สำหรับ Import Excel TGO Template
 */

// ─── Fr-01: ข้อมูลทั่วไปขององค์กร ────────────────────────────────
export const ORG_INFO_FIELDS = [
  { id: 'orgName', label: 'ชื่อองค์กร', type: 'text', required: true },
  { id: 'orgAddress', label: 'ที่อยู่', type: 'text', required: false },
  { id: 'orgTaxId', label: 'เลขประจำตัวผู้เสียภาษี', type: 'text', required: false },
  { id: 'reportingYear', label: 'ปีที่รายงาน (พ.ศ.)', type: 'number', required: true, placeholder: '2569' },
  { id: 'baseYear', label: 'ปีฐาน (Base Year)', type: 'number', required: true, placeholder: '2561', default: 2561 },
  { id: 'startDate', label: 'วันเริ่มต้นรอบบัญชี', type: 'date', required: true },
  { id: 'endDate', label: 'วันสิ้นสุดรอบบัญชี', type: 'date', required: true },
  { id: 'boundaryMethod', label: 'วิธีการกำหนดขอบเขต', type: 'select', required: true, options: [
    { value: 'control', label: 'Control Approach (อำนาจควบคุม)' },
    { value: 'equityShare', label: 'Equity Share Approach (ส่วนแบ่งทุน)' },
  ]},
  { id: 'responsiblePerson', label: 'ผู้รับผิดชอบข้อมูล', type: 'text', required: true },
  { id: 'responsibleEmail', label: 'อีเมลผู้ติดต่อ', type: 'email', required: true },
  { id: 'responsiblePhone', label: 'โทรศัพท์', type: 'text', required: false },
  { id: 'orgDescription', label: 'ลักษณะกิจการโดยย่อ', type: 'textarea', required: false },
];

// ─── Fr-03.1: Stationary Combustion ──────────────────────────────
export const STATIONARY_FUEL_TYPES = {
  diesel: { label: 'ดีเซล', unit: 'ลิตร (L)', ef: 2.6993 },
  gasoline: { label: 'เบนซิน', unit: 'ลิตร (L)', ef: 2.1866 },
  lpg_l: { label: 'LPG (ลิตร)', unit: 'ลิตร (L)', ef: 1.6812 },
  lpg_kg: { label: 'LPG (กิโลกรัม)', unit: 'กก. (kg)', ef: 3.1133 },
  ng_scf: { label: 'ก๊าซธรรมชาติ SCF', unit: 'SCF', ef: 0.05728 },
  ng_mj: { label: 'ก๊าซธรรมชาติ MJ', unit: 'MJ', ef: 0.05615 },
  fuel_oil_a: { label: 'น้ำมันเตา A', unit: 'ลิตร (L)', ef: 3.0927 },
  fuel_oil_c: { label: 'น้ำมันเตา C', unit: 'ลิตร (L)', ef: 3.2634 },
  kerosene: { label: 'น้ำมันก๊าด', unit: 'ลิตร (L)', ef: 2.5285 },
  biomass_wood: { label: 'ชีวมวล - เศษไม้', unit: 'กก. (kg)', ef: 0, isBiogenic: true },
  biomass_husk: { label: 'ชีวมวล - แกลบ', unit: 'กก. (kg)', ef: 0, isBiogenic: true },
  biomass_pellet: { label: 'ชีวมวล - อัดเม็ด', unit: 'กก. (kg)', ef: 0, isBiogenic: true },
  biogas: { label: 'ก๊าซชีวภาพ (Biogas)', unit: 'ลบ.ม. (m³)', ef: 0, isBiogenic: true },
  diesel_b7: { label: 'ดีเซล B7', unit: 'ลิตร (L)', ef: 2.5103 },
  gasohol_e10: { label: 'แก๊สโซฮอล์ E10', unit: 'ลิตร (L)', ef: 1.9679 },
};

export const createStationaryRow = () => ({
  fuelType: 'diesel',
  quantity: 0,
  unit: 'L',
  isBiogenic: false,
  sourceReference: '',
  note: '',
});

// ─── Fr-03.2: Mobile Combustion ──────────────────────────────────
export const VEHICLE_CATEGORIES = [
  { id: 'motorcycle_small', label: 'รถจักรยานยนต์ < 150cc', fuelType: 'gasoline' },
  { id: 'motorcycle_large', label: 'รถจักรยานยนต์ ≥ 150cc', fuelType: 'gasoline' },
  { id: 'passenger_car_gasoline', label: 'รถยนต์นั่ง เบนซิน', fuelType: 'gasoline' },
  { id: 'passenger_car_diesel', label: 'รถยนต์นั่ง ดีเซล', fuelType: 'diesel' },
  { id: 'pickup_diesel', label: 'รถกระบะ ดีเซล', fuelType: 'diesel' },
  { id: 'van_diesel', label: 'รถตู้ ดีเซล', fuelType: 'diesel' },
  { id: 'truck_4wd', label: 'รถบรรทุก 4 ล้อ', fuelType: 'diesel' },
  { id: 'truck_6wd', label: 'รถบรรทุก 6 ล้อ', fuelType: 'diesel' },
  { id: 'employee_car', label: 'รถพนักงาน (เฉลี่ย)', fuelType: 'mixed' },
];

export const createMobileRow = () => ({
  vehicleType: 'pickup_diesel',
  distanceKm: 0,
  fuelQuantity: 0,
  fuelType: 'diesel',
  count: 1,
  loadTon: 0,
  sourceReference: '',
  note: '',
});

// ─── Fr-03.2: Fugitive Emissions ─────────────────────────────────
export const REFRIGERANT_TYPES = [
  { id: 'r_22', label: 'R-22 (HCFC-22)', gwp: 1810 },
  { id: 'r_410a', label: 'R-410A', gwp: 2088 },
  { id: 'r_32', label: 'R-32', gwp: 675 },
  { id: 'r_134a', label: 'R-134A (HFC-134a)', gwp: 1430 },
  { id: 'r_404a', label: 'R-404A', gwp: 3943 },
  { id: 'r_407c', label: 'R-407C', gwp: 1774 },
  { id: 'r_123', label: 'R-123', gwp: 77 },
  { id: 'r_290', label: 'R-290 (โพรเพน)', gwp: 3 },
  { id: 'r_507', label: 'R-507', gwp: 3985 },
  { id: 'r_717', label: 'R-717 (แอมโมเนีย)', gwp: 0 },
  { id: 'r_744', label: 'R-744 (CO₂)', gwp: 1 },
];

export const createRefrigerantRow = () => ({
  refrigerantId: 'r_410a',
  leakKg: 0,
  sourceReference: '',
  note: '',
});

// ─── Fr-04.1: Purchased Electricity ──────────────────────────────
export const GRID_AREA_OPTIONS = [
  { value: 'MEA', label: 'การไฟฟ้านครหลวง (MEA) - กรุงเทพฯ' },
  { value: 'PEA', label: 'การไฟฟ้าส่วนภูมิภาค (PEA) - ต่างจังหวัด' },
];

export const MONTHS_TH = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

export const createMonthlyElectricity = () => ({
  monthlyKwh: Array(12).fill(0),
  gridArea: 'MEA',
});

// ─── Fr-05: Waste & Wastewater ──────────────────────────────────
export const createWasteRow = () => ({
  landfillKg: 0,
  recycleKg: 0,
  incinerationKg: 0,
  organicKg: 0,
  hazardKg: 0,
});

export const WASTEWATER_METHOD_OPTIONS = [
  { value: 'septic', label: 'ถังเกรอะ (Septic Tank)' },
  { value: 'aerobic', label: 'ระบบเติมอากาศ (Aerobic)' },
  { value: 'anaerobic', label: 'ระบบไม่ใช้ออกซิเจน (Anaerobic)' },
  { value: 'none', label: 'ไม่มีระบบบำบัด' },
];

export const createWastewaterRow = () => ({
  volumeM3: 0,
  treatmentMethod: 'septic',
});

// ─── Biogenic Emissions ─────────────────────────────────────────
export const createBiogenicRow = () => ({
  biomassKg: 0,
  biogasM3: 0,
  woodChipKg: 0,
});

// ─── Net Zero Targets ───────────────────────────────────────────
export const createNetZeroTargets = () => ({
  baseYear: 2561,
  shortTerm: { year: 2573, reductionPercent: 50 },
  netZero: { year: 2593, reductionPercent: 100 },
  carbonOffsets: {
    purchasedCredits: 0,
    retiredCredits: 0,
    source: '',
    certification: '',
  },
});

// ─── Assumptions Log ───────────────────────────────────────────
export const createAssumptionRow = () => ({
  id: Date.now(),
  description: '',
  date: new Date().toISOString().slice(0, 10),
  category: 'general',
  author: '',
});

// ─── Default Empty Entry ────────────────────────────────────────
export const createEmptyEntry = (year = new Date().getFullYear()) => ({
  reportingYear: year,
  baseYear: 2561,
  
  // Fr-01
  orgInfo: {
    orgName: '',
    boundaryMethod: 'control',
    responsiblePerson: '',
    responsibleEmail: '',
    startDate: '',
    endDate: '',
    orgDescription: '',
  },
  
  // Fr-03.1
  stationaryCombustion: [],
  
  // Fr-03.2
  mobileCombustion: [],
  fugitiveEmissions: {
    refrigerants: [],
    co2ExtinguisherKg: 0,
  },
  
  // Fr-04.1
  purchasedElectricity: {
    monthlyKwh: Array(12).fill(0),
    gridArea: 'MEA',
  },
  
  // Fr-05
  wasteGeneration: {
    landfillKg: 0,
    recycleKg: 0,
    incinerationKg: 0,
    organicKg: 0,
    hazardKg: 0,
  },
  wastewater: {
    volumeM3: 0,
    treatmentMethod: 'septic',
  },
  
  // Biogenic
  biogenicEmissions: {
    biomassKg: 0,
    biogasM3: 0,
    woodChipKg: 0,
  },
  
  // Net Zero
  netZeroTargets: {
    shortTerm: { year: 2030, reductionPercent: 50 },
    longTerm: { year: 2050, reductionPercent: 100 },
  },
  carbonOffsets: {
    purchasedCredits: 0,
    retiredCredits: 0,
    source: '',
    certification: '',
  },
  
  // Audit
  assumptionsLog: [],
  
  // Metadata
  documents: [],
  notes: '',
  recordedBy: '',
  recordedAt: new Date().toISOString(),
});

// ─── TGO Form References ────────────────────────────────────────
export const TGO_FORMS = {
  'Fr-01': { name: 'ข้อมูลทั่วไปขององค์กร', nameEn: 'Organization Information', version: '07' },
  'Fr-02': { name: 'ขอบเขตองค์กร', nameEn: 'Organizational Boundary', version: '07' },
  'Fr-03.1': { name: 'Scope 1 - Stationary Combustion', nameEn: 'Stationary Combustion', version: '07' },
  'Fr-03.2': { name: 'Scope 1 - Mobile & Fugitive', nameEn: 'Mobile Combustion & Fugitive', version: '07' },
  'Fr-04.1': { name: 'Scope 2 - Purchased Electricity', nameEn: 'Purchased Electricity', version: '07' },
  'Fr-04.2': { name: 'Scope 2 - Other Energy', nameEn: 'Other Energy (Steam/Heat/Cooling)', version: '07' },
  'Fr-05': { name: 'Scope 3 - Waste & Wastewater', nameEn: 'Waste & Wastewater', version: '07' },
};

// ─── Validation ──────────────────────────────────────────────────
export function validateEntry(entry) {
  const errors = [];

  if (!entry.orgInfo?.orgName) errors.push('กรุณากรอกชื่อองค์กร');
  if (!entry.orgInfo?.responsiblePerson) errors.push('กรุณากรอกผู้รับผิดชอบข้อมูล');
  if (!entry.orgInfo?.responsibleEmail) errors.push('กรุณากรอกอีเมลผู้ติดต่อ');
  if (!entry.reportingYear) errors.push('กรุณาเลือกปีที่รายงาน');
  if (!entry.baseYear) errors.push('กรุณากรอกปีฐาน (Base Year)');

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default {
  ORG_INFO_FIELDS,
  STATIONARY_FUEL_TYPES,
  VEHICLE_CATEGORIES,
  REFRIGERANT_TYPES,
  GRID_AREA_OPTIONS,
  MONTHS_TH,
  WASTEWATER_METHOD_OPTIONS,
  TGO_FORMS,
  createEmptyEntry,
  createStationaryRow,
  createMobileRow,
  createRefrigerantRow,
  createWasteRow,
  createWastewaterRow,
  createBiogenicRow,
  createNetZeroTargets,
  createAssumptionRow,
  validateEntry,
};