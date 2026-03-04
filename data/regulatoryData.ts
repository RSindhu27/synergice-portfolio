export const regulatoryData = [
  { customerName: 'MoH South Africa', referenceNumber: 'FDA-483-001', shortDescription: 'Data Integrity', longDescription: 'Electronic records not meeting 21 CFR Part 11 requirements. Audit trails were not activated for all computerized systems used in production and quality control.', frequency: 12 },
  { customerName: 'Apollo Pharmacy', referenceNumber: 'CDSCO-OBS-002', shortDescription: 'Temperature Excursion', longDescription: 'Cold chain storage temperature excursions observed during transport of biologics. Continuous monitoring devices not calibrated within required intervals.', frequency: 8 },
  { customerName: 'Cardinal Health USA', referenceNumber: 'FDA-483-003', shortDescription: 'OOS Investigation', longDescription: 'Out-of-specification investigation procedures not followed correctly. Assignable cause not established before initiating retesting. Documentation gaps in investigation reports.', frequency: 15 },
  { customerName: 'McKesson Canada', referenceNumber: 'HC-OBS-004', shortDescription: 'Cleaning Validation', longDescription: 'Cleaning validation studies not covering worst-case scenarios. Swab sampling locations not representative of hardest to clean areas.', frequency: 6 },
  { customerName: 'MoH South Africa', referenceNumber: 'FDA-483-005', shortDescription: 'Batch Release', longDescription: 'Batch release checklist incomplete. QA sign-off not obtained for critical manufacturing deviations before product release to market.', frequency: 10 },
  { customerName: 'Apollo Pharmacy', referenceNumber: 'CDSCO-OBS-006', shortDescription: 'Change Control', longDescription: 'Change control procedure not effectively implemented. Changes to critical process parameters were made without formal change control documentation and risk assessment.', frequency: 9 },
  { customerName: 'AmerisourceBergen', referenceNumber: 'FDA-483-007', shortDescription: 'CAPA Effectiveness', longDescription: 'CAPA system showing recurring failures for the same root cause. Effectiveness checks not performed after CAPA implementation.', frequency: 11 },
  { customerName: 'Haltons Kenya', referenceNumber: 'PPB-OBS-008', shortDescription: 'Label Reconciliation', longDescription: 'Label reconciliation records incomplete. Printed labels not accounted for during packaging operations creating risk of label mix-up.', frequency: 4 },
  { customerName: 'Aster UAE', referenceNumber: 'MOH-UAE-009', shortDescription: 'Environmental Monitoring', longDescription: 'Environmental monitoring program not adequately detecting contamination trends. Alert and action limits not supported by historical data.', frequency: 7 },
  { customerName: 'Cardinal Health USA', referenceNumber: 'FDA-483-010', shortDescription: 'Stability Program', longDescription: 'Stability program not including required time points. Statistical analysis methods not validated for the stability indicating assays.', frequency: 13 },
  { customerName: 'McKesson Canada', referenceNumber: 'HC-OBS-011', shortDescription: 'Vendor Qualification', longDescription: 'Critical raw material suppliers not adequately qualified. Supplier audits not performed on schedule and audit reports not reviewed by QA.', frequency: 5 },
  { customerName: 'AmerisourceBergen', referenceNumber: 'FDA-483-012', shortDescription: 'Process Validation', longDescription: 'Process validation studies not using statistically appropriate sampling plans. Three batch validation not completed before commercial distribution.', frequency: 8 },
];

export const customerViewData = [
  { customerName: 'Apollo Pharmacy', customerCode: 'CUST-IN-001', soNumber: 'SO-24001', materialCode: 'INS-001', materialDesc: 'InsulGlar 100U/mL', soQty: 10000, billedQty: 8000, reqDeliveryDate: '2024-01-25', difotPercent: 80, company: 'Instapill' },
  { customerName: 'Cardinal Health USA', customerCode: 'CUST-US-001', soNumber: 'SO-24002', materialCode: 'STR-005', materialDesc: 'Zestril-S 10mg', soQty: 6000, billedQty: 5980, reqDeliveryDate: '2024-04-20', difotPercent: 99.7, company: 'Strides' },
  { customerName: 'MoH South Africa', customerCode: 'CUST-ZA-001', soNumber: 'SO-24003', materialCode: 'ONE-001', materialDesc: 'Viread-O 300mg', soQty: 10000, billedQty: 10000, reqDeliveryDate: '2024-03-07', difotPercent: 100, company: 'One Source' },
  { customerName: 'Medplus India', customerCode: 'CUST-IN-002', soNumber: 'SO-24004', materialCode: 'NAR-001', materialDesc: 'FolaCare 5mg', soQty: 15000, billedQty: 14800, reqDeliveryDate: '2024-03-01', difotPercent: 95, company: 'Naari' },
  { customerName: 'Apotheek Noord BV', customerCode: 'CUST-NL-001', soNumber: 'SO-24005', materialCode: 'SOL-001', materialDesc: 'Effexor-SL 75mg', soQty: 3000, billedQty: 2800, reqDeliveryDate: '2024-04-15', difotPercent: 93.3, company: 'Solara' },
  { customerName: 'McKesson Canada', customerCode: 'CUST-CA-001', soNumber: 'SO-24006', materialCode: 'INS-004', materialDesc: 'Jardiance-I 10mg', soQty: 1500, billedQty: 1500, reqDeliveryDate: '2024-05-10', difotPercent: 100, company: 'Instapill' },
  { customerName: 'Al-Dawaa KW', customerCode: 'CUST-KW-001', soNumber: 'SO-24007', materialCode: 'NAR-002', materialDesc: 'Utrogestan-N 200mg', soQty: 3000, billedQty: 2980, reqDeliveryDate: '2024-05-25', difotPercent: 99.3, company: 'Naari' },
  { customerName: 'Aster UAE', customerCode: 'CUST-AE-001', soNumber: 'SO-24008', materialCode: 'STR-007', materialDesc: 'Pantop-S 40mg', soQty: 5000, billedQty: 4200, reqDeliveryDate: '2024-06-10', difotPercent: 84, company: 'Strides' },
  { customerName: 'AmerisourceBergen', customerCode: 'CUST-US-002', soNumber: 'SO-24009', materialCode: 'SOL-002', materialDesc: 'Seroquel-SL 200mg', soQty: 2000, billedQty: 2000, reqDeliveryDate: '2024-07-12', difotPercent: 100, company: 'Solara' },
  { customerName: 'Haltons Kenya', customerCode: 'CUST-KE-001', soNumber: 'SO-24010', materialCode: 'INS-002', materialDesc: 'Glucomet-I 850mg', soQty: 12000, billedQty: 12000, reqDeliveryDate: '2024-10-10', difotPercent: 100, company: 'Instapill' },
  { customerName: 'Pharmacia Distrib GmbH', customerCode: 'CUST-DE-001', soNumber: 'SO-24011', materialCode: 'STR-001', materialDesc: 'Glucophage 500mg', soQty: 5000, billedQty: 4980, reqDeliveryDate: '2024-01-18', difotPercent: 99.6, company: 'Strides' },
  { customerName: 'PhilHealth Procurement', customerCode: 'CUST-PH-001', soNumber: 'SO-24012', materialCode: 'ONE-003', materialDesc: 'Sustiva-O 600mg', soQty: 5000, billedQty: 4900, reqDeliveryDate: '2024-08-08', difotPercent: 98, company: 'One Source' },
];

export const DIFOT_MONTHLY = [
  { month: 'Nov-23', delivered: 13, total: 23, pct: 56.52 },
  { month: 'Dec-23', delivered: 36, total: 46, pct: 78.26 },
  { month: 'Jan-24', delivered: 24, total: 42, pct: 57.14 },
  { month: 'Feb-24', delivered: 18, total: 23, pct: 78.26 },
  { month: 'Mar-24', delivered: 32, total: 40, pct: 80.00 },
  { month: 'Apr-24', delivered: 24, total: 34, pct: 70.59 },
  { month: 'May-24', delivered: 24, total: 42, pct: 57.14 },
  { month: 'Jun-24', delivered: 18, total: 30, pct: 60.00 },
  { month: 'Jul-24', delivered: 21, total: 26, pct: 80.77 },
  { month: 'Aug-24', delivered: 31, total: 45, pct: 68.89 },
  { month: 'Sep-24', delivered: 21, total: 26, pct: 80.77 },
  { month: 'Oct-24', delivered: 31, total: 45, pct: 68.89 },
  { month: 'Nov-24', delivered: 173, total: 215, pct: 80.47 },
  { month: 'Dec-24', delivered: 155, total: 221, pct: 70.14 },
  { month: 'Jan-25', delivered: 334, total: 470, pct: 71.06 },
  { month: 'Feb-25', delivered: 1, total: 1, pct: 100.00 },
];

export const DIFOT_PLANT = [
  { plant: 'Chandapura', delivered: 173, total: 215, pct: 80.47, color: '#f9c784' },
  { plant: 'KRSG', delivered: 6, total: 34, pct: 17.65, color: '#aee4b8' },
  { plant: 'Pondy', delivered: 155, total: 221, pct: 70.14, color: '#acd9f5' },
];

export const BACKORDERS = [
  { soNumber: 'SO-25001', customerName: 'Cardinal Health USA', customerCode: 'CUST-US-001', materialCode: 'STR-005', materialDesc: 'Zestril-S 10mg', soQty: 8000, billedQty: 3200, pendingQty: 4800, originalDeliveryDate: '2025-01-10', revisedDeliveryDate: '2025-02-28', delayDays: 49, reason: 'Raw material shortage', company: 'Strides', plant: 'PLT-NA-01' },
  { soNumber: 'SO-25002', customerName: 'Apollo Pharmacy', customerCode: 'CUST-IN-001', materialCode: 'INS-001', materialDesc: 'InsulGlar 100U/mL', soQty: 12000, billedQty: 5000, pendingQty: 7000, originalDeliveryDate: '2025-01-20', revisedDeliveryDate: '2025-03-05', delayDays: 44, reason: 'Batch failure – rework in progress', company: 'Instapill', plant: 'PLT-AS-01' },
  { soNumber: 'SO-25003', customerName: 'MoH South Africa', customerCode: 'CUST-ZA-001', materialCode: 'ONE-001', materialDesc: 'Viread-O 300mg', soQty: 15000, billedQty: 0, pendingQty: 15000, originalDeliveryDate: '2025-01-15', revisedDeliveryDate: '2025-02-20', delayDays: 36, reason: 'Regulatory clearance pending', company: 'One Source', plant: 'PLT-AF-01' },
  { soNumber: 'SO-25004', customerName: 'Medplus India', customerCode: 'CUST-IN-002', materialCode: 'NAR-001', materialDesc: 'FolaCare 5mg', soQty: 20000, billedQty: 12000, pendingQty: 8000, originalDeliveryDate: '2025-01-25', revisedDeliveryDate: '2025-02-15', delayDays: 21, reason: 'Capacity constraint', company: 'Naari', plant: 'PLT-AS-01' },
  { soNumber: 'SO-25005', customerName: 'AmerisourceBergen', customerCode: 'CUST-US-002', materialCode: 'SOL-002', materialDesc: 'Seroquel-SL 200mg', soQty: 3000, billedQty: 1200, pendingQty: 1800, originalDeliveryDate: '2025-01-18', revisedDeliveryDate: '2025-03-01', delayDays: 42, reason: 'API supply disruption', company: 'Solara', plant: 'PLT-NA-01' },
  { soNumber: 'SO-25006', customerName: 'Pharma Distrib GmbH', customerCode: 'CUST-DE-001', materialCode: 'STR-001', materialDesc: 'Glucophage 500mg', soQty: 7000, billedQty: 4000, pendingQty: 3000, originalDeliveryDate: '2025-02-01', revisedDeliveryDate: '2025-02-25', delayDays: 24, reason: 'Quality hold', company: 'Strides', plant: 'PLT-EU-01' },
  { soNumber: 'SO-25007', customerName: 'McKesson Canada', customerCode: 'CUST-CA-001', materialCode: 'INS-004', materialDesc: 'Jardiance-I 10mg', soQty: 2000, billedQty: 800, pendingQty: 1200, originalDeliveryDate: '2025-02-05', revisedDeliveryDate: '2025-03-10', delayDays: 33, reason: 'Customs clearance delay', company: 'Instapill', plant: 'PLT-NA-01' },
  { soNumber: 'SO-25008', customerName: 'Al-Dawaa KW', customerCode: 'CUST-KW-001', materialCode: 'NAR-002', materialDesc: 'Utrogestan-N 200mg', soQty: 4000, billedQty: 1500, pendingQty: 2500, originalDeliveryDate: '2025-01-28', revisedDeliveryDate: '2025-02-22', delayDays: 25, reason: 'Import documentation issue', company: 'Naari', plant: 'PLT-ME-01' },
  { soNumber: 'SO-25009', customerName: 'Apotheek Noord BV', customerCode: 'CUST-NL-001', materialCode: 'SOL-001', materialDesc: 'Effexor-SL 75mg', soQty: 3500, billedQty: 2000, pendingQty: 1500, originalDeliveryDate: '2025-02-10', revisedDeliveryDate: '2025-02-28', delayDays: 18, reason: 'Production schedule overrun', company: 'Solara', plant: 'PLT-EU-01' },
  { soNumber: 'SO-25010', customerName: 'PhilHealth Procurement', customerCode: 'CUST-PH-001', materialCode: 'ONE-003', materialDesc: 'Sustiva-O 600mg', soQty: 6000, billedQty: 2000, pendingQty: 4000, originalDeliveryDate: '2025-01-22', revisedDeliveryDate: '2025-03-15', delayDays: 52, reason: 'Stability testing hold', company: 'One Source', plant: 'PLT-AS-01' },
];

export const UPCOMING_ORDERS = [
  { soNumber: 'SO-25011', customerName: 'Cardinal Health USA', customerCode: 'CUST-US-001', materialCode: 'STR-005', materialDesc: 'Zestril-S 10mg', soQty: 10000, expectedDeliveryDate: '2025-03-15', status: 'Confirmed', priority: 'High', company: 'Strides', plant: 'PLT-NA-01', estimatedRevenue: 120000 },
  { soNumber: 'SO-25012', customerName: 'Apollo Pharmacy', customerCode: 'CUST-IN-001', materialCode: 'INS-001', materialDesc: 'InsulGlar 100U/mL', soQty: 15000, expectedDeliveryDate: '2025-03-20', status: 'In Production', priority: 'Critical', company: 'Instapill', plant: 'PLT-AS-01', estimatedRevenue: 450000 },
  { soNumber: 'SO-25013', customerName: 'MoH South Africa', customerCode: 'CUST-ZA-001', materialCode: 'ONE-001', materialDesc: 'Viread-O 300mg', soQty: 20000, expectedDeliveryDate: '2025-03-30', status: 'Packing', priority: 'High', company: 'One Source', plant: 'PLT-AF-01', estimatedRevenue: 190000 },
  { soNumber: 'SO-25014', customerName: 'Medplus India', customerCode: 'CUST-IN-002', materialCode: 'NAR-001', materialDesc: 'FolaCare 5mg', soQty: 25000, expectedDeliveryDate: '2025-04-05', status: 'Confirmed', priority: 'Medium', company: 'Naari', plant: 'PLT-AS-01', estimatedRevenue: 74000 },
  { soNumber: 'SO-25015', customerName: 'AmerisourceBergen', customerCode: 'CUST-US-002', materialCode: 'SOL-002', materialDesc: 'Seroquel-SL 200mg', soQty: 4000, expectedDeliveryDate: '2025-04-10', status: 'QC Testing', priority: 'High', company: 'Solara', plant: 'PLT-NA-01', estimatedRevenue: 136000 },
  { soNumber: 'SO-25016', customerName: 'Haltons Kenya', customerCode: 'CUST-KE-001', materialCode: 'INS-002', materialDesc: 'Glucomet-I 850mg', soQty: 18000, expectedDeliveryDate: '2025-04-15', status: 'In Production', priority: 'Medium', company: 'Instapill', plant: 'PLT-AF-01', estimatedRevenue: 144000 },
  { soNumber: 'SO-25017', customerName: 'Pharma Distrib GmbH', customerCode: 'CUST-DE-001', materialCode: 'STR-001', materialDesc: 'Glucophage 500mg', soQty: 8000, expectedDeliveryDate: '2025-04-20', status: 'Confirmed', priority: 'Medium', company: 'Strides', plant: 'PLT-EU-01', estimatedRevenue: 78000 },
  { soNumber: 'SO-25018', customerName: 'McKesson Canada', customerCode: 'CUST-CA-001', materialCode: 'INS-004', materialDesc: 'Jardiance-I 10mg', soQty: 2500, expectedDeliveryDate: '2025-04-25', status: 'Confirmed', priority: 'High', company: 'Instapill', plant: 'PLT-NA-01', estimatedRevenue: 137500 },
  { soNumber: 'SO-25019', customerName: 'PhilHealth Procurement', customerCode: 'CUST-PH-001', materialCode: 'ONE-003', materialDesc: 'Sustiva-O 600mg', soQty: 8000, expectedDeliveryDate: '2025-05-01', status: 'In Production', priority: 'High', company: 'One Source', plant: 'PLT-AS-01', estimatedRevenue: 196000 },
  { soNumber: 'SO-25020', customerName: 'Apotheek Noord BV', customerCode: 'CUST-NL-001', materialCode: 'SOL-001', materialDesc: 'Effexor-SL 75mg', soQty: 4000, expectedDeliveryDate: '2025-05-10', status: 'Confirmed', priority: 'Low', company: 'Solara', plant: 'PLT-EU-01', estimatedRevenue: 60000 },
];
