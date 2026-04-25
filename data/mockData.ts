export { COLORS, COMPANY_COLORS, COMPANIES } from './theme';
export type { CompanyName } from './theme';
export { productPortfolio, companyMetrics, CUSTOMERS_BY_COMPANY, CUSTOMER_SKU_DETAILS } from './portfolioData';
export type { CustomerSKUDetail } from './portfolioData';
export { revenueData, monthlyRevenue } from './revenueData';
export { rdData, goLanzarData } from './pipelineData';
export { imsData } from './competitorData';
export {
  regulatoryData, customerViewData,
  DIFOT_MONTHLY, DIFOT_PLANT,
  BACKORDERS, UPCOMING_ORDERS,
} from './regulatoryData';
export { newsData } from './overviewData';

export const CUSTOMER_PRODUCTS: Record<string, {
  product: string;
  materialCode: string;
  company: string;
  category: string;
  strength: string;
  supplyType: string;
  annualVolume: number;
  revenue: number;
  competitors: { name: string; product: string; share: number }[];
  otherVendors: { vendor: string; product: string; category: string }[];
  stridesSupply: { company: string; product: string; category: string }[];
}[]> = {
  'CUST-A1-001': [
    {
      product: 'Product A1-α 10mg', materialCode: 'CPA-005', company: 'Company A', category: 'Therapeutic Area B',
      strength: '10mg', supplyType: 'Finished Goods', annualVolume: 72000, revenue: 711760,
      competitors: [
        { name: 'Competitor Co. I', product: 'Product X1 10mg', share: 28 },
        { name: 'Competitor Co. B', product: 'Product X1 10mg', share: 22 },
        { name: 'Competitor Co. J', product: 'Product X1 10mg', share: 18 },
        { name: 'Competitor Co. K', product: 'Product X1 10mg', share: 15 },
        { name: 'Competitor Co. L', product: 'Product X1 10mg', share: 10 },
      ],
      otherVendors: [
        { vendor: 'Vendor A1', product: 'Product V1 10mg', category: 'Therapeutic Area B' },
        { vendor: 'Vendor A2', product: 'Product V2 10mg', category: 'Therapeutic Area B' },
        { vendor: 'Vendor A3', product: 'Product V3 50mg', category: 'Therapeutic Area B' },
        { vendor: 'Vendor A4', product: 'Product V4 5mg', category: 'Therapeutic Area B' },
        { vendor: 'Vendor A5', product: 'Product V5 25mg', category: 'Therapeutic Area B' },
      ],
      stridesSupply: [
        { company: 'Company A', product: 'Product A1-α 10mg', category: 'Finished Goods' },
        { company: 'Company C', product: 'API Molecule R', category: 'Raw Material' },
      ],
    },
  ],
  'CUST-B1-001': [
    {
      product: 'Product B1-α 100U/mL', materialCode: 'CPB-001', company: 'Company B', category: 'Therapeutic Area A',
      strength: '100U/mL', supplyType: 'Finished Goods', annualVolume: 96000, revenue: 2400000,
      competitors: [
        { name: 'Competitor Co. D', product: 'Product X4 100U/mL', share: 35 },
        { name: 'Competitor Co. M', product: 'Biosimilar C1', share: 20 },
        { name: 'Competitor Co. N', product: 'Biosimilar C2', share: 12 },
        { name: 'Competitor Co. O', product: 'Biosimilar C3', share: 18 },
        { name: 'Competitor Co. P', product: 'Biosimilar C4', share: 8 },
      ],
      otherVendors: [
        { vendor: 'Vendor B1', product: 'Product V6 100U/mL', category: 'Therapeutic Area A' },
        { vendor: 'Vendor B2', product: 'Biosimilar B1', category: 'Therapeutic Area A' },
        { vendor: 'Vendor B3', product: 'Product V7 500mg', category: 'Therapeutic Area A' },
        { vendor: 'Vendor B4', product: 'Product V8 100mg', category: 'Therapeutic Area A' },
        { vendor: 'Vendor B5', product: 'Product V9 20mg', category: 'Therapeutic Area F' },
      ],
      stridesSupply: [
        { company: 'Company B', product: 'Product B1-α 100U/mL', category: 'Therapeutic Area A' },
        { company: 'Company A', product: 'Product A3-γ 500mg', category: 'Therapeutic Area F' },
        { company: 'Company C', product: 'Product C1-α 300mg', category: 'Therapeutic Area C' },
        { company: 'Company D', product: 'Product D1-α 5mg', category: 'Therapeutic Area D' },
      ],
    },
  ],
  'CUST-C1-001': [
    {
      product: 'Product C1-α 300mg', materialCode: 'CPC-001', company: 'Company C', category: 'Therapeutic Area C',
      strength: '300mg', supplyType: 'Finished Goods', annualVolume: 120000, revenue: 950000,
      competitors: [
        { name: 'Competitor Co. F', product: 'Product X6 300mg', share: 30 },
        { name: 'Competitor Co. Q', product: 'Generic C1 300mg', share: 25 },
        { name: 'Competitor Co. R', product: 'Generic C2 300mg', share: 18 },
        { name: 'Competitor Co. J', product: 'Generic C3 300mg', share: 15 },
        { name: 'Competitor Co. S', product: 'Generic C4 300mg', share: 7 },
      ],
      otherVendors: [
        { vendor: 'Vendor C1', product: 'Generic C1 300mg', category: 'Therapeutic Area C' },
        { vendor: 'Vendor C2', product: 'Compound C1', category: 'Therapeutic Area C' },
        { vendor: 'Vendor C3', product: 'Product V10 50mg', category: 'Therapeutic Area C' },
        { vendor: 'Vendor C4', product: 'Product V11 600mg', category: 'Therapeutic Area C' },
        { vendor: 'Vendor C5', product: 'Product V12 150mg', category: 'Therapeutic Area C' },
      ],
      stridesSupply: [
        { company: 'Company C', product: 'Product C1-α 300mg', category: 'Therapeutic Area C' },
        { company: 'Company C', product: 'Product C2-β 50mg', category: 'Therapeutic Area C' },
        { company: 'Company A', product: 'Product A3-γ 500mg', category: 'Therapeutic Area F' },
      ],
    },
  ],
  'CUST-B2-001': [
    {
      product: 'Product D1-α 5mg', materialCode: 'CPD-001', company: 'Company D', category: 'Therapeutic Area D',
      strength: '5mg', supplyType: 'Finished Goods', annualVolume: 180000, revenue: 444000,
      competitors: [
        { name: 'Competitor Co. T', product: 'Product V13 5mg', share: 32 },
        { name: 'Competitor Co. Q', product: 'Product V14 5mg', share: 22 },
        { name: 'Competitor Co. U', product: 'Product V15 5mg', share: 18 },
        { name: 'Competitor Co. V', product: 'Product V16 5mg', share: 14 },
        { name: 'Competitor Co. W', product: 'Product V17 5mg', share: 8 },
      ],
      otherVendors: [
        { vendor: 'Vendor D1', product: 'Product V13 5mg', category: 'Therapeutic Area D' },
        { vendor: 'Vendor D2', product: 'Compound D1', category: 'Therapeutic Area D' },
        { vendor: 'Vendor D3', product: 'Product V7 500mg', category: 'Therapeutic Area A' },
        { vendor: 'Vendor D4', product: 'Product Q1 500mg', category: 'Therapeutic Area F' },
        { vendor: 'Vendor D5', product: 'Product V18 40mg', category: 'Therapeutic Area F' },
      ],
      stridesSupply: [
        { company: 'Company D', product: 'Product D1-α 5mg', category: 'Therapeutic Area D' },
        { company: 'Company D', product: 'Product D2-β 20mg/mL', category: 'Therapeutic Area D' },
        { company: 'Company A', product: 'Product A1-α 500mg', category: 'Therapeutic Area A' },
        { company: 'Company C', product: 'Packaging Services', category: 'Packaging' },
      ],
    },
  ],
  'CUST-B3-001': [
    {
      product: 'Product E1-α 75mg', materialCode: 'CPE-001', company: 'Company E', category: 'Therapeutic Area E',
      strength: '75mg', supplyType: 'Finished Goods', annualVolume: 33600, revenue: 420000,
      competitors: [
        { name: 'Competitor Co. B', product: 'Product X2 75mg', share: 25 },
        { name: 'Competitor Co. X', product: 'Generic E1 75mg', share: 30 },
        { name: 'Competitor Co. Y', product: 'Generic E2 75mg', share: 20 },
        { name: 'Competitor Co. J', product: 'Generic E3 75mg', share: 12 },
        { name: 'Competitor Co. K', product: 'Generic E4 75mg', share: 8 },
      ],
      otherVendors: [
        { vendor: 'Vendor E1', product: 'Generic E1 75mg', category: 'Therapeutic Area E' },
        { vendor: 'Vendor E2', product: 'Product V19 200mg', category: 'Therapeutic Area E' },
        { vendor: 'Vendor E3', product: 'Product V20 150mg', category: 'Therapeutic Area E' },
        { vendor: 'Vendor E4', product: 'Product V21 10mg', category: 'Therapeutic Area E' },
        { vendor: 'Vendor E5', product: 'Product V22 50mg', category: 'Therapeutic Area E' },
      ],
      stridesSupply: [
        { company: 'Company E', product: 'Product E1-α 75mg', category: 'Therapeutic Area E' },
        { company: 'Company A', product: 'Product A2-β 20mg', category: 'Therapeutic Area B' },
        { company: 'Company C', product: 'Packaging Services', category: 'Packaging' },
      ],
    },
  ],
  'CUST-B4-001': [
    {
      product: 'Product B2-β 10mg', materialCode: 'CPB-004', company: 'Company B', category: 'Therapeutic Area A',
      strength: '10mg', supplyType: 'Finished Goods', annualVolume: 18000, revenue: 825000,
      competitors: [
        { name: 'Competitor Co. Z', product: 'Brand A1 10mg', share: 40 },
        { name: 'Competitor Co. E', product: 'Brand B1 10mg', share: 28 },
        { name: 'Competitor Co. AA', product: 'Brand C1 100mg', share: 15 },
        { name: 'Competitor Co. O', product: 'Brand D1 0.5mg', share: 10 },
        { name: 'Competitor Co. D', product: 'Brand E1 300U', share: 5 },
      ],
      otherVendors: [
        { vendor: 'Vendor B6', product: 'Brand B1 10mg', category: 'Therapeutic Area A' },
        { vendor: 'Vendor B7', product: 'Brand F1 5mg', category: 'Therapeutic Area A' },
        { vendor: 'Vendor B8', product: 'Brand G1 6mg/mL', category: 'Therapeutic Area A' },
        { vendor: 'Vendor B9', product: 'Brand H1 100U/mL', category: 'Therapeutic Area A' },
        { vendor: 'Vendor B10', product: 'Product V7 500mg', category: 'Therapeutic Area A' },
      ],
      stridesSupply: [
        { company: 'Company B', product: 'Product B2-β 10mg', category: 'Finished Goods' },
        { company: 'Company A', product: 'Product A1-α 10mg', category: 'Therapeutic Area B' },
      ],
    },
  ],
  'CUST-E1-001': [
    {
      product: 'Product D2-β 200mg', materialCode: 'CPD-002', company: 'Company D', category: 'Therapeutic Area D',
      strength: '200mg', supplyType: 'Finished Goods', annualVolume: 36000, revenue: 357600,
      competitors: [
        { name: 'Competitor Co. BB', product: 'Brand I1 200mg', share: 45 },
        { name: 'Competitor Co. U', product: 'Brand J1 10mg', share: 28 },
        { name: 'Competitor Co. A', product: 'Brand K1 8%', share: 12 },
        { name: 'Competitor Co. T', product: 'Brand L1 200mg', share: 10 },
        { name: 'Competitor Co. CC', product: 'Generic D1 200mg', share: 5 },
      ],
      otherVendors: [
        { vendor: 'Vendor D6', product: 'Brand I1 200mg', category: 'Therapeutic Area D' },
        { vendor: 'Vendor D7', product: 'Brand J1 10mg', category: 'Therapeutic Area D' },
        { vendor: 'Vendor D8', product: 'Compound D2 Gel', category: 'Therapeutic Area D' },
        { vendor: 'Vendor D9', product: 'Compound D3 50mg', category: 'Therapeutic Area D' },
        { vendor: 'Vendor D10', product: 'Brand M1 OC', category: 'Therapeutic Area D' },
      ],
      stridesSupply: [
        { company: 'Company D', product: 'Product D2-β 200mg', category: 'Therapeutic Area D' },
        { company: 'Company A', product: 'Product A5-ε 40mg', category: 'Therapeutic Area F' },
        { company: 'Company C', product: 'Packaging Services', category: 'Packaging' },
      ],
    },
  ],
  'CUST-A2-001': [
    {
      product: 'Product E2-β 200mg', materialCode: 'CPE-002', company: 'Company E', category: 'Therapeutic Area E',
      strength: '200mg', supplyType: 'Finished Goods', annualVolume: 24000, revenue: 680000,
      competitors: [
        { name: 'Competitor Co. E', product: 'Brand N1 200mg', share: 22 },
        { name: 'Competitor Co. X', product: 'Generic G1 200mg', share: 28 },
        { name: 'Competitor Co. I', product: 'Generic G2 200mg', share: 18 },
        { name: 'Competitor Co. Y', product: 'Generic G3 200mg', share: 15 },
        { name: 'Competitor Co. J', product: 'Generic G4 200mg', share: 12 },
      ],
      otherVendors: [
        { vendor: 'Vendor E6', product: 'Generic G1 200mg', category: 'Therapeutic Area E' },
        { vendor: 'Vendor E7', product: 'Generic H1 10mg', category: 'Therapeutic Area E' },
        { vendor: 'Vendor E8', product: 'Generic I1 10mg', category: 'Therapeutic Area E' },
        { vendor: 'Vendor E9', product: 'Generic J1 2mg', category: 'Therapeutic Area E' },
        { vendor: 'Vendor E10', product: 'Generic K1 0.5mg', category: 'Therapeutic Area E' },
      ],
      stridesSupply: [
        { company: 'Company E', product: 'Product E2-β 200mg', category: 'Therapeutic Area E' },
        { company: 'Company A', product: 'Product A1-α 10mg', category: 'Therapeutic Area B' },
      ],
    },
  ],
  'CUST-C2-001': [
    {
      product: 'Product B3-γ 850mg', materialCode: 'CPB-002', company: 'Company B', category: 'Therapeutic Area A',
      strength: '850mg', supplyType: 'Finished Goods', annualVolume: 144000, revenue: 960000,
      competitors: [
        { name: 'Competitor Co. Q', product: 'Generic A1 850mg', share: 30 },
        { name: 'Competitor Co. R', product: 'Brand P1 850mg', share: 25 },
        { name: 'Competitor Co. DD', product: 'Generic A2 850mg', share: 20 },
        { name: 'Competitor Co. EE', product: 'Generic A3 850mg', share: 12 },
        { name: 'Competitor Co. FF', product: 'Generic A4 850mg', share: 8 },
      ],
      otherVendors: [
        { vendor: 'Vendor C6', product: 'Generic A1 850mg', category: 'Therapeutic Area A' },
        { vendor: 'Vendor C7', product: 'Generic L1 5mg', category: 'Therapeutic Area A' },
        { vendor: 'Vendor C8', product: 'Generic Q1 500mg', category: 'Therapeutic Area F' },
        { vendor: 'Vendor C9', product: 'Generic M1 cotrimoxazole', category: 'Therapeutic Area F' },
        { vendor: 'Vendor C10', product: 'Generic N1 500mg', category: 'Analgesic' },
      ],
      stridesSupply: [
        { company: 'Company B', product: 'Product B3-γ 850mg', category: 'Finished Goods' },
        { company: 'Company A', product: 'Product A3-γ 500mg', category: 'Therapeutic Area F' },
        { company: 'Company D', product: 'Product D1-α 5mg', category: 'Therapeutic Area D' },
      ],
    },
  ],
  'CUST-B5-001': [
    {
      product: 'Product A1-α 500mg', materialCode: 'CPA-001', company: 'Company A', category: 'Therapeutic Area A',
      strength: '500mg', supplyType: 'Finished Goods', annualVolume: 60000, revenue: 485000,
      competitors: [
        { name: 'Competitor Co. A', product: 'Brand Q1 500mg', share: 35 },
        { name: 'Competitor Co. D', product: 'Generic A5 500mg', share: 22 },
        { name: 'Competitor Co. GG', product: 'Generic A6 500mg', share: 18 },
        { name: 'Competitor Co. HH', product: 'Generic A7 500mg', share: 14 },
        { name: 'Competitor Co. B', product: 'Generic A8 500mg', share: 6 },
      ],
      otherVendors: [
        { vendor: 'Vendor A6', product: 'Brand Q1 500mg', category: 'Therapeutic Area A' },
        { vendor: 'Vendor A7', product: 'Generic B2 20mg', category: 'Therapeutic Area B' },
        { vendor: 'Vendor A8', product: 'Generic O1 5mg', category: 'Therapeutic Area B' },
        { vendor: 'Vendor A9', product: 'Generic P1 20mg', category: 'Therapeutic Area F' },
        { vendor: 'Vendor A10', product: 'Generic P2 40mg', category: 'Therapeutic Area F' },
      ],
      stridesSupply: [
        { company: 'Company A', product: 'Product A1-α 500mg', category: 'Finished Goods' },
        { company: 'Company A', product: 'Product A2-β 20mg', category: 'Therapeutic Area B' },
        { company: 'Company C', product: 'Primary Packaging', category: 'Packaging' },
      ],
    },
  ],
  'CUST-C3-001': [
    {
      product: 'Product C3-γ 600mg', materialCode: 'CPC-003', company: 'Company C', category: 'Therapeutic Area C',
      strength: '600mg', supplyType: 'Finished Goods', annualVolume: 60000, revenue: 1225000,
      competitors: [
        { name: 'Competitor Co. F', product: 'Brand R1 600mg', share: 28 },
        { name: 'Competitor Co. Q', product: 'Generic C5 600mg', share: 32 },
        { name: 'Competitor Co. J', product: 'Generic C6 600mg', share: 20 },
        { name: 'Competitor Co. S', product: 'Generic C7 600mg', share: 12 },
        { name: 'Competitor Co. K', product: 'Generic C8 600mg', share: 5 },
      ],
      otherVendors: [
        { vendor: 'Vendor C11', product: 'Generic C5 600mg', category: 'Therapeutic Area C' },
        { vendor: 'Vendor C12', product: 'Generic C9 300mg', category: 'Therapeutic Area C' },
        { vendor: 'Vendor C13', product: 'Product V10 150mg', category: 'Therapeutic Area C' },
        { vendor: 'Vendor C14', product: 'Generic D2 50mg', category: 'Therapeutic Area C' },
        { vendor: 'Vendor C15', product: 'Generic E5 FDC', category: 'Therapeutic Area C' },
      ],
      stridesSupply: [
        { company: 'Company C', product: 'Product C3-γ 600mg', category: 'Therapeutic Area C' },
        { company: 'Company C', product: 'Product C4-δ 150mg', category: 'Therapeutic Area C' },
        { company: 'Company C', product: 'Secondary Packaging', category: 'Packaging' },
      ],
    },
  ],
};
