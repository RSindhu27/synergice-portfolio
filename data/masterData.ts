export interface MasterProduct {
  id: string;
  company: string;
  region: string;
  molecule: string;
  therapeutic: string;
  skuName: string;
  product: string;
  comparator: string;
  country: string;
  strength: string;
  dosage: string;
  // legacy fields kept for backward compat
  fieldA: string;
  fieldB: string;
  fieldC: string;
  fieldD: string;
  fieldE: string;
  fieldF: string;
  fieldG: string;
  fieldH: string;
  fieldI: string;
  fieldJ: string;
  fieldK: string;
  fieldL: string;
}

export interface BDRecord {
  id: string;
  company: string;
  region: string;
  molecule: string;
  partner: string;
  status: string;
  // legacy
  fieldA: string;
  fieldB: string;
  fieldC: string;
  fieldD: string;
  fieldE: string;
  fieldF: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: 'upload' | 'edit' | 'delete';
  module: 'Products' | 'BD';
  recordId: string;
  recordName: string;
  changes: { field: string; before: string; after: string }[];
  fileName?: string;
  rowsAffected?: number;
}

export const masterProducts: MasterProduct[] = [
  { id: 'MP-001', company: 'Company A', region: 'Region A', molecule: 'Molecule A', therapeutic: 'Therapeutic Area A', skuName: 'Alpha-1 500mg Tab', product: 'Product Alpha-1', comparator: 'Comparator X', country: 'Country A', strength: '500mg', dosage: 'Tablet', fieldA: 'Product Alpha-1', fieldB: 'SKU-A001', fieldC: 'Tablet', fieldD: '500mg', fieldE: 'Molecule A', fieldF: 'Active', fieldG: 'Q1 2025', fieldH: 'Plant Alpha', fieldI: 'Retail', fieldJ: 'Therapeutic Area A', fieldK: '12 months', fieldL: 'Tier 1' },
  { id: 'MP-002', company: 'Company A', region: 'Region A', molecule: 'Molecule B', therapeutic: 'Therapeutic Area B', skuName: 'Alpha-2 250mg Cap', product: 'Product Alpha-2', comparator: 'Comparator Y', country: 'Country A', strength: '250mg', dosage: 'Capsule', fieldA: 'Product Alpha-2', fieldB: 'SKU-A002', fieldC: 'Capsule', fieldD: '250mg', fieldE: 'Molecule B', fieldF: 'Active', fieldG: 'Q2 2025', fieldH: 'Plant Beta', fieldI: 'Both', fieldJ: 'Therapeutic Area B', fieldK: '18 months', fieldL: 'Tier 2' },
  { id: 'MP-003', company: 'Company A', region: 'Region B', molecule: 'Molecule C', therapeutic: 'Therapeutic Area A', skuName: 'Alpha-3 100mg/mL Inj', product: 'Product Alpha-3', comparator: 'Comparator Z', country: 'Country B', strength: '100mg/mL', dosage: 'Injection', fieldA: 'Product Alpha-3', fieldB: 'SKU-A003', fieldC: 'Injection', fieldD: '100mg/mL', fieldE: 'Molecule C', fieldF: 'Inactive', fieldG: 'Q3 2025', fieldH: 'Plant Gamma', fieldI: 'Tender', fieldJ: 'Therapeutic Area A', fieldK: '24 months', fieldL: 'Tier 1' },
  { id: 'MP-004', company: 'Company B', region: 'Region B', molecule: 'Molecule A', therapeutic: 'Therapeutic Area A', skuName: 'Beta-1 850mg Tab', product: 'Product Beta-1', comparator: 'Comparator X', country: 'Country B', strength: '850mg', dosage: 'Tablet', fieldA: 'Product Beta-1', fieldB: 'SKU-B001', fieldC: 'Tablet', fieldD: '850mg', fieldE: 'Molecule A', fieldF: 'Active', fieldG: 'Q1 2025', fieldH: 'Plant Alpha', fieldI: 'Retail', fieldJ: 'Therapeutic Area A', fieldK: '12 months', fieldL: 'Tier 1' },
  { id: 'MP-005', company: 'Company B', region: 'Region C', molecule: 'Molecule D', therapeutic: 'Therapeutic Area A', skuName: 'Beta-2 100U/mL Syr', product: 'Product Beta-2', comparator: 'Comparator W', country: 'Country C', strength: '100U/mL', dosage: 'Syringe', fieldA: 'Product Beta-2', fieldB: 'SKU-B002', fieldC: 'Syringe', fieldD: '100U/mL', fieldE: 'Molecule D', fieldF: 'Active', fieldG: 'Q4 2024', fieldH: 'Plant Beta', fieldI: 'Both', fieldJ: 'Therapeutic Area A', fieldK: '30 months', fieldL: 'Tier 1' },
  { id: 'MP-006', company: 'Company B', region: 'Region D', molecule: 'Molecule E', therapeutic: 'Therapeutic Area B', skuName: 'Beta-3 10mg FTab', product: 'Product Beta-3', comparator: 'Comparator V', country: 'Country D', strength: '10mg', dosage: 'Film Tablet', fieldA: 'Product Beta-3', fieldB: 'SKU-B003', fieldC: 'Film Tablet', fieldD: '10mg', fieldE: 'Molecule E', fieldF: 'Pending', fieldG: 'Q2 2025', fieldH: 'Plant Alpha', fieldI: 'Retail', fieldJ: 'Therapeutic Area B', fieldK: '12 months', fieldL: 'Tier 3' },
  { id: 'MP-007', company: 'Company C', region: 'Region C', molecule: 'Molecule F', therapeutic: 'Therapeutic Area C', skuName: 'Gamma-1 300mg Tab', product: 'Product Gamma-1', comparator: 'Comparator X', country: 'Country C', strength: '300mg', dosage: 'Tablet', fieldA: 'Product Gamma-1', fieldB: 'SKU-C001', fieldC: 'Tablet', fieldD: '300mg', fieldE: 'Molecule F', fieldF: 'Active', fieldG: 'Q3 2024', fieldH: 'Plant Gamma', fieldI: 'Tender', fieldJ: 'Therapeutic Area C', fieldK: '36 months', fieldL: 'Tier 1' },
  { id: 'MP-008', company: 'Company C', region: 'Region B', molecule: 'Molecule G', therapeutic: 'Therapeutic Area C', skuName: 'Gamma-2 50mg/5mL Sol', product: 'Product Gamma-2', comparator: 'Comparator Y', country: 'Country B', strength: '50mg/5mL', dosage: 'Oral Solution', fieldA: 'Product Gamma-2', fieldB: 'SKU-C002', fieldC: 'Oral Solution', fieldD: '50mg/5mL', fieldE: 'Molecule G', fieldF: 'Active', fieldG: 'Q1 2025', fieldH: 'Plant Beta', fieldI: 'Tender', fieldJ: 'Therapeutic Area C', fieldK: '24 months', fieldL: 'Tier 2' },
  { id: 'MP-009', company: 'Company D', region: 'Region D', molecule: 'Molecule H', therapeutic: 'Therapeutic Area D', skuName: 'Delta-1 Combo Sach', product: 'Product Delta-1', comparator: 'Comparator Z', country: 'Country D', strength: '5mg+100mg', dosage: 'Sachet', fieldA: 'Product Delta-1', fieldB: 'SKU-D001', fieldC: 'Sachet', fieldD: '5mg+100mg', fieldE: 'Molecule H', fieldF: 'Active', fieldG: 'Q2 2025', fieldH: 'Plant Alpha', fieldI: 'Both', fieldJ: 'Therapeutic Area D', fieldK: '12 months', fieldL: 'Tier 2' },
  { id: 'MP-010', company: 'Company D', region: 'Region E', molecule: 'Molecule I', therapeutic: 'Therapeutic Area D', skuName: 'Delta-2 400mg Tab', product: 'Product Delta-2', comparator: 'Comparator W', country: 'Country E', strength: '400mg', dosage: 'Tablet', fieldA: 'Product Delta-2', fieldB: 'SKU-D002', fieldC: 'Tablet', fieldD: '400mg', fieldE: 'Molecule I', fieldF: 'Inactive', fieldG: 'Q4 2024', fieldH: 'Plant Gamma', fieldI: 'Retail', fieldJ: 'Therapeutic Area D', fieldK: '18 months', fieldL: 'Tier 3' },
  { id: 'MP-011', company: 'Company E', region: 'Region E', molecule: 'Molecule J', therapeutic: 'Therapeutic Area E', skuName: 'Epsilon-1 200mg ER', product: 'Product Epsilon-1', comparator: 'Comparator X', country: 'Country E', strength: '200mg', dosage: 'ER Tablet', fieldA: 'Product Epsilon-1', fieldB: 'SKU-E001', fieldC: 'ER Tablet', fieldD: '200mg', fieldE: 'Molecule J', fieldF: 'Active', fieldG: 'Q1 2025', fieldH: 'Plant Beta', fieldI: 'Retail', fieldJ: 'Therapeutic Area E', fieldK: '24 months', fieldL: 'Tier 1' },
  { id: 'MP-012', company: 'Company E', region: 'Region F', molecule: 'Molecule K', therapeutic: 'Therapeutic Area E', skuName: 'Epsilon-2 150mg Cap', product: 'Product Epsilon-2', comparator: 'Comparator V', country: 'Country F', strength: '150mg', dosage: 'Capsule', fieldA: 'Product Epsilon-2', fieldB: 'SKU-E002', fieldC: 'Capsule', fieldD: '150mg', fieldE: 'Molecule K', fieldF: 'Active', fieldG: 'Q3 2025', fieldH: 'Plant Alpha', fieldI: 'Both', fieldJ: 'Therapeutic Area E', fieldK: '12 months', fieldL: 'Tier 2' },
  { id: 'MP-013', company: 'Company E', region: 'Region A', molecule: 'Molecule L', therapeutic: 'Therapeutic Area E', skuName: 'Epsilon-3 20mg FTab', product: 'Product Epsilon-3', comparator: 'Comparator Y', country: 'Country A', strength: '20mg', dosage: 'Film Tablet', fieldA: 'Product Epsilon-3', fieldB: 'SKU-E003', fieldC: 'Film Tablet', fieldD: '20mg', fieldE: 'Molecule L', fieldF: 'Pending', fieldG: 'Q4 2025', fieldH: 'Plant Gamma', fieldI: 'Retail', fieldJ: 'Therapeutic Area E', fieldK: '18 months', fieldL: 'Tier 3' },
  { id: 'MP-014', company: 'Company A', region: 'Region C', molecule: 'Molecule M', therapeutic: 'Therapeutic Area B', skuName: 'Alpha-4 200mg DTab', product: 'Product Alpha-4', comparator: 'Comparator Z', country: 'Country C', strength: '200mg', dosage: 'Dispersible Tablet', fieldA: 'Product Alpha-4', fieldB: 'SKU-A004', fieldC: 'Dispersible Tablet', fieldD: '200mg', fieldE: 'Molecule M', fieldF: 'Active', fieldG: 'Q2 2025', fieldH: 'Plant Beta', fieldI: 'Tender', fieldJ: 'Therapeutic Area B', fieldK: '30 months', fieldL: 'Tier 1' },
  { id: 'MP-015', company: 'Company B', region: 'Region A', molecule: 'Molecule N', therapeutic: 'Therapeutic Area A', skuName: 'Beta-4 25mg Tab', product: 'Product Beta-4', comparator: 'Comparator W', country: 'Country A', strength: '25mg', dosage: 'Tablet', fieldA: 'Product Beta-4', fieldB: 'SKU-B004', fieldC: 'Tablet', fieldD: '25mg', fieldE: 'Molecule N', fieldF: 'Active', fieldG: 'Q3 2025', fieldH: 'Plant Alpha', fieldI: 'Both', fieldJ: 'Therapeutic Area A', fieldK: '12 months', fieldL: 'Tier 2' },
];

export const masterBD: BDRecord[] = [
  { id: 'BD-001', company: 'Company A', region: 'Region A', molecule: 'Molecule A', partner: 'Partner X1', status: 'Active', fieldA: 'BD Record A1', fieldB: 'Partner X1', fieldC: 'License', fieldD: 'Active', fieldE: 'Q2 2025', fieldF: '$2.5M' },
  { id: 'BD-002', company: 'Company A', region: 'Region B', molecule: 'Molecule B', partner: 'Partner X2', status: 'Negotiation', fieldA: 'BD Record A2', fieldB: 'Partner X2', fieldC: 'Co-Develop', fieldD: 'Negotiation', fieldE: 'Q4 2025', fieldF: '$5.0M' },
  { id: 'BD-003', company: 'Company B', region: 'Region C', molecule: 'Molecule D', partner: 'Partner Y1', status: 'Active', fieldA: 'BD Record B1', fieldB: 'Partner Y1', fieldC: 'Distribution', fieldD: 'Active', fieldE: 'Q1 2025', fieldF: '$1.8M' },
  { id: 'BD-004', company: 'Company B', region: 'Region D', molecule: 'Molecule E', partner: 'Partner Y2', status: 'Active', fieldA: 'BD Record B2', fieldB: 'Partner Y2', fieldC: 'License', fieldD: 'Active', fieldE: 'Q3 2025', fieldF: '$3.2M' },
  { id: 'BD-005', company: 'Company C', region: 'Region B', molecule: 'Molecule F', partner: 'Partner Z1', status: 'Active', fieldA: 'BD Record C1', fieldB: 'Partner Z1', fieldC: 'Supply', fieldD: 'Active', fieldE: 'Q1 2025', fieldF: '$4.1M' },
  { id: 'BD-006', company: 'Company C', region: 'Region C', molecule: 'Molecule G', partner: 'Partner Z2', status: 'Pending', fieldA: 'BD Record C2', fieldB: 'Partner Z2', fieldC: 'Co-Promote', fieldD: 'Pending', fieldE: 'Q2 2025', fieldF: '$1.5M' },
  { id: 'BD-007', company: 'Company D', region: 'Region D', molecule: 'Molecule H', partner: 'Partner W1', status: 'Active', fieldA: 'BD Record D1', fieldB: 'Partner W1', fieldC: 'License', fieldD: 'Active', fieldE: 'Q4 2024', fieldF: '$2.9M' },
  { id: 'BD-008', company: 'Company D', region: 'Region E', molecule: 'Molecule I', partner: 'Partner W2', status: 'Negotiation', fieldA: 'BD Record D2', fieldB: 'Partner W2', fieldC: 'Distribution', fieldD: 'Negotiation', fieldE: 'Q3 2025', fieldF: '$1.2M' },
  { id: 'BD-009', company: 'Company E', region: 'Region E', molecule: 'Molecule J', partner: 'Partner V1', status: 'Active', fieldA: 'BD Record E1', fieldB: 'Partner V1', fieldC: 'Co-Develop', fieldD: 'Active', fieldE: 'Q2 2025', fieldF: '$6.0M' },
  { id: 'BD-010', company: 'Company E', region: 'Region F', molecule: 'Molecule K', partner: 'Partner V2', status: 'Active', fieldA: 'BD Record E2', fieldB: 'Partner V2', fieldC: 'License', fieldD: 'Active', fieldE: 'Q1 2025', fieldF: '$3.5M' },
  { id: 'BD-011', company: 'Company A', region: 'Region D', molecule: 'Molecule C', partner: 'Partner X3', status: 'Closed', fieldA: 'BD Record A3', fieldB: 'Partner X3', fieldC: 'Supply', fieldD: 'Closed', fieldE: 'Q4 2024', fieldF: '$0.8M' },
  { id: 'BD-012', company: 'Company B', region: 'Region F', molecule: 'Molecule N', partner: 'Partner Y3', status: 'Active', fieldA: 'BD Record B3', fieldB: 'Partner Y3', fieldC: 'Co-Develop', fieldD: 'Active', fieldE: 'Q4 2025', fieldF: '$7.2M' },
];

export const auditLog: AuditEntry[] = [
  {
    id: 'AUD-001',
    timestamp: '2025-05-19T09:14:32Z',
    user: 'User A',
    action: 'upload',
    module: 'Products',
    recordId: '',
    recordName: 'master_products_may2025.xlsx',
    changes: [],
    fileName: 'master_products_may2025.xlsx',
    rowsAffected: 15,
  },
  {
    id: 'AUD-002',
    timestamp: '2025-05-18T14:52:10Z',
    user: 'User B',
    action: 'edit',
    module: 'Products',
    recordId: 'MP-005',
    recordName: 'Product Beta-2',
    changes: [
      { field: 'Status', before: 'Pending', after: 'Active' },
      { field: 'Strength', before: '50U/mL', after: '100U/mL' },
    ],
  },
  {
    id: 'AUD-003',
    timestamp: '2025-05-17T11:03:45Z',
    user: 'User A',
    action: 'edit',
    module: 'BD',
    recordId: 'BD-006',
    recordName: 'BD Record C2',
    changes: [
      { field: 'Status', before: 'Active', after: 'Pending' },
    ],
  },
  {
    id: 'AUD-004',
    timestamp: '2025-05-15T08:30:00Z',
    user: 'User C',
    action: 'upload',
    module: 'BD',
    recordId: '',
    recordName: 'bd_records_q2_2025.xlsx',
    changes: [],
    fileName: 'bd_records_q2_2025.xlsx',
    rowsAffected: 12,
  },
  {
    id: 'AUD-005',
    timestamp: '2025-05-12T16:22:18Z',
    user: 'User B',
    action: 'edit',
    module: 'Products',
    recordId: 'MP-013',
    recordName: 'Product Epsilon-3',
    changes: [
      { field: 'Product', before: 'Epsilon-3 Old', after: 'Product Epsilon-3' },
      { field: 'Strength', before: '10mg', after: '20mg' },
    ],
  },
  {
    id: 'AUD-006',
    timestamp: '2025-05-10T10:05:55Z',
    user: 'User A',
    action: 'upload',
    module: 'Products',
    recordId: '',
    recordName: 'master_products_apr2025.xlsx',
    changes: [],
    fileName: 'master_products_apr2025.xlsx',
    rowsAffected: 13,
  },
  {
    id: 'AUD-007',
    timestamp: '2025-05-08T13:44:29Z',
    user: 'User D',
    action: 'edit',
    module: 'BD',
    recordId: 'BD-011',
    recordName: 'BD Record A3',
    changes: [
      { field: 'Status', before: 'Active', after: 'Closed' },
    ],
  },
  {
    id: 'AUD-008',
    timestamp: '2025-05-05T09:00:00Z',
    user: 'User C',
    action: 'edit',
    module: 'Products',
    recordId: 'MP-010',
    recordName: 'Product Delta-2',
    changes: [
      { field: 'Status', before: 'Active', after: 'Inactive' },
    ],
  },
  {
    id: 'AUD-009',
    timestamp: '2025-04-28T14:17:33Z',
    user: 'User A',
    action: 'upload',
    module: 'Products',
    recordId: '',
    recordName: 'master_products_mar2025.xlsx',
    changes: [],
    fileName: 'master_products_mar2025.xlsx',
    rowsAffected: 11,
  },
  {
    id: 'AUD-010',
    timestamp: '2025-04-22T10:45:00Z',
    user: 'User B',
    action: 'edit',
    module: 'Products',
    recordId: 'MP-001',
    recordName: 'Product Alpha-1',
    changes: [
      { field: 'Comparator', before: 'Comparator Y', after: 'Comparator X' },
      { field: 'Country', before: 'Country B', after: 'Country A' },
    ],
  },
  {
    id: 'AUD-011',
    timestamp: '2025-04-18T09:30:12Z',
    user: 'User D',
    action: 'upload',
    module: 'BD',
    recordId: '',
    recordName: 'bd_pipeline_q1_2025.xlsx',
    changes: [],
    fileName: 'bd_pipeline_q1_2025.xlsx',
    rowsAffected: 9,
  },
  {
    id: 'AUD-012',
    timestamp: '2025-04-10T16:05:44Z',
    user: 'User C',
    action: 'edit',
    module: 'BD',
    recordId: 'BD-009',
    recordName: 'BD Record E1',
    changes: [
      { field: 'Partner', before: 'Partner V0', after: 'Partner V1' },
    ],
  },
  {
    id: 'AUD-013',
    timestamp: '2025-04-03T11:22:09Z',
    user: 'User A',
    action: 'edit',
    module: 'Products',
    recordId: 'MP-007',
    recordName: 'Product Gamma-1',
    changes: [
      { field: 'Strength', before: '200mg', after: '300mg' },
      { field: 'Molecule', before: 'Molecule E', after: 'Molecule F' },
    ],
  },
  {
    id: 'AUD-014',
    timestamp: '2025-03-27T08:55:00Z',
    user: 'User B',
    action: 'upload',
    module: 'Products',
    recordId: '',
    recordName: 'master_products_feb2025.xlsx',
    changes: [],
    fileName: 'master_products_feb2025.xlsx',
    rowsAffected: 10,
  },
];

export const MASTER_REGIONS = ['Region A', 'Region B', 'Region C', 'Region D', 'Region E', 'Region F'];

export const PRODUCT_FIELD_LABELS: Record<string, string> = {
  molecule: 'Molecule',
  therapeutic: 'Therapeutic Area',
  skuName: 'SKU Name',
  product: 'Product',
  comparator: 'Comparator',
  region: 'Region',
  country: 'Country',
  strength: 'Strength',
  dosage: 'Dosage Form',
};

export const BD_FIELD_LABELS: Record<string, string> = {
  molecule: 'Molecule',
  partner: 'Partner',
  status: 'Status',
};
