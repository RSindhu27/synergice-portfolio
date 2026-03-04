export { COLORS, COMPANY_COLORS, COMPANIES } from './theme';
export type { CompanyName } from './theme';
export { productPortfolio, companyMetrics, CUSTOMERS_BY_COMPANY } from './portfolioData';
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
  'CUST-US-001': [
    {
      product: 'Zestril-S 10mg', materialCode: 'STR-005', company: 'Strides', category: 'Cardiovascular',
      strength: '10mg', supplyType: 'Finished Goods', annualVolume: 72000, revenue: 711760,
      competitors: [
        { name: 'Lupin', product: 'Lisinopril 10mg', share: 28 },
        { name: 'Teva', product: 'Lisinopril 10mg', share: 22 },
        { name: 'Aurobindo', product: 'Lisinopril 10mg', share: 18 },
        { name: 'Mylan', product: 'Lisinopril 10mg', share: 15 },
        { name: 'Sun Pharma', product: 'Lisinopril 10mg', share: 10 },
      ],
      otherVendors: [
        { vendor: 'Lupin', product: 'Lisinopril 10mg', category: 'Cardiovascular' },
        { vendor: 'Teva', product: 'Lisinopril 10mg', category: 'Cardiovascular' },
        { vendor: 'Aurobindo', product: 'Losartan 50mg', category: 'Cardiovascular' },
        { vendor: 'Mylan', product: 'Amlodipine 5mg', category: 'Cardiovascular' },
        { vendor: 'Amneal', product: 'Metoprolol 25mg', category: 'Cardiovascular' },
      ],
      stridesSupply: [
        { company: 'Strides', product: 'Zestril-S 10mg', category: 'Finished Goods' },
        { company: 'One Source', product: 'API Lisinopril', category: 'Raw Material' },
      ],
    },
  ],
  'CUST-IN-001': [
    {
      product: 'InsulGlar 100U/mL', materialCode: 'INS-001', company: 'Instapill', category: 'Diabetes',
      strength: '100U/mL', supplyType: 'Finished Goods', annualVolume: 96000, revenue: 2400000,
      competitors: [
        { name: 'Sanofi', product: 'Lantus 100U/mL', share: 35 },
        { name: 'Biocon', product: 'Basalog One', share: 20 },
        { name: 'Wockhardt', product: 'Wosulin G', share: 12 },
        { name: 'Novo Nordisk', product: 'Levemir', share: 18 },
        { name: 'Eli Lilly', product: 'Basaglar', share: 8 },
      ],
      otherVendors: [
        { vendor: 'Sanofi', product: 'Lantus 100U/mL', category: 'Biologics' },
        { vendor: 'Biocon', product: 'Basalog One', category: 'Biologics' },
        { vendor: 'Sun Pharma', product: 'Metformin 500mg', category: 'Diabetes' },
        { vendor: 'Cipla', product: 'Sitagliptin 100mg', category: 'Diabetes' },
        { vendor: "Dr. Reddy's", product: 'Omeprazole 20mg', category: 'GI' },
      ],
      stridesSupply: [
        { company: 'Instapill', product: 'InsulGlar 100U/mL', category: 'Biologics' },
        { company: 'Strides', product: 'Amoxil-S 500mg', category: 'Anti-infective' },
        { company: 'One Source', product: 'Viread-O 300mg', category: 'Antiretroviral' },
        { company: 'Naari', product: 'FolaCare 5mg', category: 'Womens Health' },
      ],
    },
  ],
  'CUST-ZA-001': [
    {
      product: 'Viread-O 300mg', materialCode: 'ONE-001', company: 'One Source', category: 'Antiretroviral',
      strength: '300mg', supplyType: 'Finished Goods', annualVolume: 120000, revenue: 950000,
      competitors: [
        { name: 'Gilead', product: 'Viread 300mg', share: 30 },
        { name: 'Cipla', product: 'Tenofovir 300mg', share: 25 },
        { name: 'Aspen', product: 'Tenofovir 300mg', share: 18 },
        { name: 'Aurobindo', product: 'Tenofovir 300mg', share: 15 },
        { name: 'Hetero', product: 'Tenofovir 300mg', share: 7 },
      ],
      otherVendors: [
        { vendor: 'Cipla', product: 'Tenofovir 300mg', category: 'Antiretroviral' },
        { vendor: 'Aspen', product: 'Lopinavir/Rit', category: 'Antiretroviral' },
        { vendor: 'Gilead', product: 'Dolutegravir 50mg', category: 'Antiretroviral' },
        { vendor: 'Aurobindo', product: 'Efavirenz 600mg', category: 'Antiretroviral' },
        { vendor: 'Lupin', product: 'Lamivudine 150mg', category: 'Antiretroviral' },
      ],
      stridesSupply: [
        { company: 'One Source', product: 'Viread-O 300mg', category: 'Antiretroviral' },
        { company: 'One Source', product: 'Tivicay-O 50mg', category: 'Antiretroviral' },
        { company: 'Strides', product: 'Amoxil-S 500mg', category: 'Anti-infective' },
      ],
    },
  ],
  'CUST-IN-002': [
    {
      product: 'FolaCare 5mg', materialCode: 'NAR-001', company: 'Naari', category: 'Womens Health',
      strength: '5mg', supplyType: 'Finished Goods', annualVolume: 180000, revenue: 444000,
      competitors: [
        { name: 'Sun Pharma', product: 'Folvite 5mg', share: 32 },
        { name: 'Cipla', product: 'Folicip 5mg', share: 22 },
        { name: 'Abbott', product: 'Folact 5mg', share: 18 },
        { name: 'Mankind', product: 'Folimax 5mg', share: 14 },
        { name: 'Zydus', product: 'Folitrax 5mg', share: 8 },
      ],
      otherVendors: [
        { vendor: 'Sun Pharma', product: 'Folvite 5mg', category: 'Womens Health' },
        { vendor: 'Abbott', product: 'Duphaston', category: 'Womens Health' },
        { vendor: 'Cipla', product: 'Metformin 500mg', category: 'Diabetes' },
        { vendor: 'Mankind', product: 'Amoxicillin 500mg', category: 'Anti-infective' },
        { vendor: 'Zydus', product: 'Pantoprazole 40mg', category: 'GI' },
      ],
      stridesSupply: [
        { company: 'Naari', product: 'FolaCare 5mg', category: 'Womens Health' },
        { company: 'Naari', product: 'Venofer-N 20mg/mL', category: 'Womens Health' },
        { company: 'Strides', product: 'Glucophage 500mg', category: 'Diabetes' },
        { company: 'One Source', product: 'Packaging Services', category: 'Packaging' },
      ],
    },
  ],
  'CUST-NL-001': [
    {
      product: 'Effexor-SL 75mg', materialCode: 'SOL-001', company: 'Solara', category: 'CNS',
      strength: '75mg', supplyType: 'Finished Goods', annualVolume: 33600, revenue: 420000,
      competitors: [
        { name: 'Pfizer', product: 'Effexor XR 75mg', share: 25 },
        { name: 'Teva', product: 'Venlafaxine 75mg', share: 30 },
        { name: 'Sandoz', product: 'Venlafaxine 75mg', share: 20 },
        { name: 'Aurobindo', product: 'Venlafaxine 75mg', share: 12 },
        { name: 'Mylan', product: 'Venlafaxine 75mg', share: 8 },
      ],
      otherVendors: [
        { vendor: 'Teva', product: 'Venlafaxine 75mg', category: 'CNS' },
        { vendor: 'Sandoz', product: 'Quetiapine 200mg', category: 'CNS' },
        { vendor: 'Pfizer', product: 'Pregabalin 150mg', category: 'CNS' },
        { vendor: 'Aurobindo', product: 'Escitalopram 10mg', category: 'CNS' },
        { vendor: 'Mylan', product: 'Sertraline 50mg', category: 'CNS' },
      ],
      stridesSupply: [
        { company: 'Solara', product: 'Effexor-SL 75mg', category: 'CNS' },
        { company: 'Strides', product: 'Lipitor-S 20mg', category: 'Cardiovascular' },
        { company: 'One Source', product: 'Packaging Services', category: 'Packaging' },
      ],
    },
  ],
  'CUST-CA-001': [
    {
      product: 'Jardiance-I 10mg', materialCode: 'INS-004', company: 'Instapill', category: 'Diabetes',
      strength: '10mg', supplyType: 'Finished Goods', annualVolume: 18000, revenue: 825000,
      competitors: [
        { name: 'Boehringer', product: 'Jardiance 10mg', share: 40 },
        { name: 'AstraZeneca', product: 'Farxiga 10mg', share: 28 },
        { name: 'J&J', product: 'Invokana 100mg', share: 15 },
        { name: 'Novo Nordisk', product: 'Ozempic 0.5mg', share: 10 },
        { name: 'Sanofi', product: 'Toujeo 300U', share: 5 },
      ],
      otherVendors: [
        { vendor: 'AstraZeneca', product: 'Farxiga 10mg', category: 'Diabetes' },
        { vendor: 'Boehringer', product: 'Trajenta 5mg', category: 'Diabetes' },
        { vendor: 'Novo Nordisk', product: 'Victoza 6mg/mL', category: 'Diabetes' },
        { vendor: 'Sanofi', product: 'Lantus 100U/mL', category: 'Diabetes' },
        { vendor: 'Sandoz', product: 'Metformin 500mg', category: 'Diabetes' },
      ],
      stridesSupply: [
        { company: 'Instapill', product: 'Jardiance-I 10mg', category: 'Finished Goods' },
        { company: 'Strides', product: 'Zestril-S 10mg', category: 'Cardiovascular' },
      ],
    },
  ],
  'CUST-KW-001': [
    {
      product: 'Utrogestan-N 200mg', materialCode: 'NAR-002', company: 'Naari', category: 'Womens Health',
      strength: '200mg', supplyType: 'Finished Goods', annualVolume: 36000, revenue: 357600,
      competitors: [
        { name: 'Besins', product: 'Utrogestan 200mg', share: 45 },
        { name: 'Abbott', product: 'Duphaston 10mg', share: 28 },
        { name: 'Merck', product: 'Crinone 8%', share: 12 },
        { name: 'Sun Pharma', product: 'Susten 200mg', share: 10 },
        { name: 'Watson', product: 'Progesterone 200mg', share: 5 },
      ],
      otherVendors: [
        { vendor: 'Besins', product: 'Utrogestan 200mg', category: 'Womens Health' },
        { vendor: 'Abbott', product: 'Duphaston 10mg', category: 'Womens Health' },
        { vendor: 'Merck', product: 'Estradiol Gel', category: 'Womens Health' },
        { vendor: 'Sanofi', product: 'Clomid 50mg', category: 'Womens Health' },
        { vendor: 'Bayer', product: 'Yasmin OC', category: 'Womens Health' },
      ],
      stridesSupply: [
        { company: 'Naari', product: 'Utrogestan-N 200mg', category: 'Womens Health' },
        { company: 'Strides', product: 'Pantop-S 40mg', category: 'GI' },
        { company: 'One Source', product: 'Packaging Services', category: 'Packaging' },
      ],
    },
  ],
  'CUST-US-002': [
    {
      product: 'Seroquel-SL 200mg', materialCode: 'SOL-002', company: 'Solara', category: 'CNS',
      strength: '200mg', supplyType: 'Finished Goods', annualVolume: 24000, revenue: 680000,
      competitors: [
        { name: 'AstraZeneca', product: 'Seroquel 200mg', share: 22 },
        { name: 'Teva', product: 'Quetiapine 200mg', share: 28 },
        { name: 'Lupin', product: 'Quetiapine 200mg', share: 18 },
        { name: 'Sandoz', product: 'Quetiapine 200mg', share: 15 },
        { name: 'Aurobindo', product: 'Quetiapine 200mg', share: 12 },
      ],
      otherVendors: [
        { vendor: 'Teva', product: 'Quetiapine 200mg', category: 'CNS' },
        { vendor: 'Aurobindo', product: 'Olanzapine 10mg', category: 'CNS' },
        { vendor: 'Lupin', product: 'Aripiprazole 10mg', category: 'CNS' },
        { vendor: 'Sandoz', product: 'Risperidone 2mg', category: 'CNS' },
        { vendor: 'Mylan', product: 'Clonazepam 0.5mg', category: 'CNS' },
      ],
      stridesSupply: [
        { company: 'Solara', product: 'Seroquel-SL 200mg', category: 'CNS' },
        { company: 'Strides', product: 'Zestril-S 10mg', category: 'Cardiovascular' },
      ],
    },
  ],
  'CUST-KE-001': [
    {
      product: 'Glucomet-I 850mg', materialCode: 'INS-002', company: 'Instapill', category: 'Diabetes',
      strength: '850mg', supplyType: 'Finished Goods', annualVolume: 144000, revenue: 960000,
      competitors: [
        { name: 'Cipla Quality', product: 'Metformin 850mg', share: 30 },
        { name: 'Aspen', product: 'Glucophage 850mg', share: 25 },
        { name: 'Cosmos', product: 'Metformin 850mg', share: 20 },
        { name: 'Dawa Ltd', product: 'Metformin 850mg', share: 12 },
        { name: 'Raptakos', product: 'Glycomet 850mg', share: 8 },
      ],
      otherVendors: [
        { vendor: 'Cipla Quality', product: 'Metformin 850mg', category: 'Diabetes' },
        { vendor: 'Aspen', product: 'Glibenclamide 5mg', category: 'Diabetes' },
        { vendor: 'Cosmos', product: 'Amoxicillin 500mg', category: 'Anti-infective' },
        { vendor: 'Dawa Ltd', product: 'Cotrimoxazole', category: 'Anti-infective' },
        { vendor: 'Laborex', product: 'Paracetamol 500mg', category: 'Analgesic' },
      ],
      stridesSupply: [
        { company: 'Instapill', product: 'Glucomet-I 850mg', category: 'Finished Goods' },
        { company: 'Strides', product: 'Amoxil-S 500mg', category: 'Anti-infective' },
        { company: 'Naari', product: 'FolaCare 5mg', category: 'Womens Health' },
      ],
    },
  ],
  'CUST-DE-001': [
    {
      product: 'Glucophage 500mg', materialCode: 'STR-001', company: 'Strides', category: 'Diabetes',
      strength: '500mg', supplyType: 'Finished Goods', annualVolume: 60000, revenue: 485000,
      competitors: [
        { name: 'Merck KGaA', product: 'Glucophage 500mg', share: 35 },
        { name: 'Sanofi', product: 'Metformin 500mg', share: 22 },
        { name: 'Ratiopharm', product: 'Metformin 500mg', share: 18 },
        { name: 'Hexal', product: 'Metformin 500mg', share: 14 },
        { name: 'Teva', product: 'Metformin 500mg', share: 6 },
      ],
      otherVendors: [
        { vendor: 'Merck KGaA', product: 'Glucophage 500mg', category: 'Diabetes' },
        { vendor: 'Ratiopharm', product: 'Atorvastatin 20mg', category: 'Cardiovascular' },
        { vendor: 'Hexal', product: 'Amlodipine 5mg', category: 'Cardiovascular' },
        { vendor: 'Sandoz', product: 'Omeprazole 20mg', category: 'GI' },
        { vendor: 'Stada', product: 'Pantoprazole 40mg', category: 'GI' },
      ],
      stridesSupply: [
        { company: 'Strides', product: 'Glucophage 500mg', category: 'Finished Goods' },
        { company: 'Strides', product: 'Lipitor-S 20mg', category: 'Cardiovascular' },
        { company: 'One Source', product: 'Primary Packaging', category: 'Packaging' },
      ],
    },
  ],
  'CUST-PH-001': [
    {
      product: 'Sustiva-O 600mg', materialCode: 'ONE-003', company: 'One Source', category: 'Antiretroviral',
      strength: '600mg', supplyType: 'Finished Goods', annualVolume: 60000, revenue: 1225000,
      competitors: [
        { name: 'Gilead', product: 'Sustiva 600mg', share: 28 },
        { name: 'Cipla', product: 'Efavirenz 600mg', share: 32 },
        { name: 'Aurobindo', product: 'Efavirenz 600mg', share: 20 },
        { name: 'Hetero', product: 'Efavirenz 600mg', share: 12 },
        { name: 'Mylan', product: 'Efavirenz 600mg', share: 5 },
      ],
      otherVendors: [
        { vendor: 'Cipla', product: 'Efavirenz 600mg', category: 'Antiretroviral' },
        { vendor: 'Aurobindo', product: 'Tenofovir 300mg', category: 'Antiretroviral' },
        { vendor: 'Hetero', product: 'Lamivudine 150mg', category: 'Antiretroviral' },
        { vendor: 'Gilead', product: 'Dolutegravir 50mg', category: 'Antiretroviral' },
        { vendor: 'Mylan', product: 'TDF/3TC FDC', category: 'Antiretroviral' },
      ],
      stridesSupply: [
        { company: 'One Source', product: 'Sustiva-O 600mg', category: 'Antiretroviral' },
        { company: 'One Source', product: 'Epivir-O 150mg', category: 'Antiretroviral' },
        { company: 'One Source', product: 'Secondary Packaging', category: 'Packaging' },
      ],
    },
  ],
};
