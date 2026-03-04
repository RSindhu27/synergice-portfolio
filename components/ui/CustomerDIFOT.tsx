import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Rect, Text as SvgText, G, Line } from 'react-native-svg';
import { COLORS, COMPANY_COLORS, DIFOT_MONTHLY, DIFOT_PLANT, customerViewData } from '@/data/mockData';

const { width: SW } = Dimensions.get('window');
const COMPANIES = ['All', 'Strides', 'Instapill', 'One Source', 'Naari', 'Solara'];
const PLANTS = ['All', 'Chandapura', 'KRSG', 'Pondy'];

function fmtPct(v: number) { return `${v.toFixed(2)}%`; }

const EXTENDED_CUSTOMER_DATA = [
  ...customerViewData,
  { customerName: 'Haltons Kenya', customerCode: 'CUST-KE-001', soNumber: 'SO-24013', materialCode: 'INS-002', materialDesc: 'Glucomet-I 850mg', soQty: 14000, billedQty: 14000, reqDeliveryDate: '2024-10-12', difotPercent: 100, company: 'Instapill' },
  { customerName: 'Farmacías Guadalajara', customerCode: 'CUST-MX-001', soNumber: 'SO-24014', materialCode: 'SOL-004', materialDesc: 'Lexapro-SL 10mg', soQty: 4200, billedQty: 3800, reqDeliveryDate: '2024-12-18', difotPercent: 90.5, company: 'Solara' },
  { customerName: 'Emzor Pharma NG', customerCode: 'CUST-NG-001', soNumber: 'SO-24015', materialCode: 'STR-003', materialDesc: 'Amoxil-S 500mg', soQty: 22000, billedQty: 19000, reqDeliveryDate: '2024-09-20', difotPercent: 86.4, company: 'Strides' },
  { customerName: 'Farmacia Milano', customerCode: 'CUST-IT-001', soNumber: 'SO-24016', materialCode: 'NAR-003', materialDesc: 'Estraderm-N 50mcg', soQty: 2000, billedQty: 1800, reqDeliveryDate: '2024-11-18', difotPercent: 90.0, company: 'Naari' },
  { customerName: 'MoH Ethiopia', customerCode: 'CUST-ET-001', soNumber: 'SO-24017', materialCode: 'ONE-002', materialDesc: 'Epivir-O 150mg', soQty: 18000, billedQty: 16200, reqDeliveryDate: '2024-07-15', difotPercent: 90.0, company: 'One Source' },
  { customerName: 'Apotex Pty Ltd', customerCode: 'CUST-AU-001', soNumber: 'SO-24018', materialCode: 'STR-004', materialDesc: 'Losec-S 20mg', soQty: 6000, billedQty: 5400, reqDeliveryDate: '2024-06-28', difotPercent: 90.0, company: 'Strides' },
  { customerName: 'Al Dawaa KW', customerCode: 'CUST-KW-002', soNumber: 'SO-24019', materialCode: 'INS-005', materialDesc: 'Victoza-I 6mg/mL', soQty: 1200, billedQty: 1200, reqDeliveryDate: '2024-05-30', difotPercent: 100, company: 'Instapill' },
  { customerName: 'Farmanguinhos Brazil', customerCode: 'CUST-BR-001', soNumber: 'SO-24020', materialCode: 'ONE-004', materialDesc: 'Reyataz-O 300mg', soQty: 8000, billedQty: 7200, reqDeliveryDate: '2024-08-20', difotPercent: 90.0, company: 'One Source' },
  { customerName: 'PEPFAR Ghana', customerCode: 'CUST-GH-001', soNumber: 'SO-24021', materialCode: 'ONE-005', materialDesc: 'Tivicay-O 50mg', soQty: 10000, billedQty: 8500, reqDeliveryDate: '2024-07-10', difotPercent: 85.0, company: 'One Source' },
  { customerName: 'Kimia Farma ID', customerCode: 'CUST-ID-001', soNumber: 'SO-24022', materialCode: 'NAR-004', materialDesc: 'Venofer-N 20mg/mL', soQty: 3000, billedQty: 2700, reqDeliveryDate: '2024-09-05', difotPercent: 90.0, company: 'Naari' },
  { customerName: 'Astellia Japan', customerCode: 'CUST-JP-001', soNumber: 'SO-24023', materialCode: 'SOL-003', materialDesc: 'Aricept-SL 10mg', soQty: 1800, billedQty: 1800, reqDeliveryDate: '2024-10-22', difotPercent: 100, company: 'Solara' },
  { customerName: 'Teva Israel', customerCode: 'CUST-IL-001', soNumber: 'SO-24024', materialCode: 'SOL-005', materialDesc: 'Lamictal-SL 100mg', soQty: 2500, billedQty: 2250, reqDeliveryDate: '2024-11-30', difotPercent: 90.0, company: 'Solara' },
  { customerName: 'Sante Pharma SA', customerCode: 'CUST-FR-001', soNumber: 'SO-24025', materialCode: 'STR-002', materialDesc: 'Lipitor-S 20mg', soQty: 3500, billedQty: 3360, reqDeliveryDate: '2024-02-12', difotPercent: 96.0, company: 'Strides' },
  { customerName: 'Farmacia Central ES', customerCode: 'CUST-ES-001', soNumber: 'SO-24026', materialCode: 'INS-003', materialDesc: 'Januvia-I 100mg', soQty: 4000, billedQty: 3600, reqDeliveryDate: '2024-04-08', difotPercent: 90.0, company: 'Instapill' },
  { customerName: 'MEDS Tanzania', customerCode: 'CUST-TZ-001', soNumber: 'SO-24027', materialCode: 'NAR-005', materialDesc: 'Mifeprex-N 200mg', soQty: 5000, billedQty: 4200, reqDeliveryDate: '2024-08-14', difotPercent: 84.0, company: 'Naari' },
  { customerName: 'Apotheek Noord BV', customerCode: 'CUST-NL-001', soNumber: 'SO-24028', materialCode: 'SOL-001', materialDesc: 'Effexor-SL 75mg', soQty: 3200, billedQty: 3200, reqDeliveryDate: '2024-05-20', difotPercent: 100, company: 'Solara' },
];

function MonthBarChart({ data, color }: { data: typeof DIFOT_MONTHLY; color: string }) {
  const availW = SW - 28;
  const BAR_SLOT = 52;
  const chartW = Math.max(data.length * BAR_SLOT + 40, availW);
  const chartH = 230;
  const padL = 10, padR = 16, padT = 48, padB = 44;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const slot = plotW / data.length;
  const barW = Math.min(32, slot - 8);

  const totalDel = data.reduce((s, d) => s + d.delivered, 0);
  const totalAll = data.reduce((s, d) => s + d.total, 0);
  const overallPct = totalAll > 0 ? (totalDel / totalAll) * 100 : 0;

  return (
    <View style={styles.chartWrap}>
      <View style={styles.chartHeaderRow}>
        <View>
          <Text style={styles.chartTitle}>Month On Month</Text>
          <Text style={styles.chartSub}>Based on RDD</Text>
        </View>
        <View style={[styles.totalBadge, { backgroundColor: color + '18', borderColor: color + '40' }]}>
          <Text style={[styles.totalBadgeCount, { color: COLORS.dark }]}>{totalDel}/{totalAll}</Text>
          <Text style={[styles.totalBadgePct, { color }]}>{fmtPct(overallPct)}</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false}>
        <Svg width={chartW} height={chartH}>
          {[25, 50, 75, 100].map(v => {
            const y = padT + plotH - (v / 100) * plotH;
            return (
              <G key={v}>
                <Line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke={COLORS.gray200} strokeWidth={1} />
                <SvgText x={padL} y={y - 2} fontSize={7} fill={COLORS.gray400} textAnchor="start">{v}%</SvgText>
              </G>
            );
          })}
          {data.map((d, i) => {
            const x = padL + i * slot + (slot - barW) / 2;
            const barH = Math.max(2, (d.pct / 100) * plotH);
            const y = padT + plotH - barH;
            const isHigh = d.pct >= 90;
            const barColor = isHigh ? color : d.pct >= 70 ? COLORS.warning : COLORS.error;
            return (
              <G key={i}>
                <Rect x={x} y={y} width={barW} height={barH} fill={barColor} rx={3} opacity={0.88} />
                <SvgText x={x + barW / 2} y={y - 16} fontSize={7.5} fill={COLORS.dark} textAnchor="middle" fontWeight="700">
                  {d.delivered}/{d.total}
                </SvgText>
                <SvgText x={x + barW / 2} y={y - 6} fontSize={7} fill={barColor} textAnchor="middle" fontWeight="600">
                  {fmtPct(d.pct)}
                </SvgText>
                <SvgText
                  x={x + barW / 2} y={padT + plotH + 14}
                  fontSize={8} fill={COLORS.gray600} textAnchor="middle"
                  transform={`rotate(-38, ${x + barW / 2}, ${padT + plotH + 14})`}
                >{d.month}</SvgText>
              </G>
            );
          })}
        </Svg>
      </ScrollView>
    </View>
  );
}

function PlantBarChart({ data }: { data: typeof DIFOT_PLANT }) {
  const availW = SW - 28;
  const chartH = 220;
  const padL = 10, padR = 16, padT = 48, padB = 44;
  const plotW = availW - padL - padR;
  const plotH = chartH - padT - padB;
  const slot = plotW / data.length;
  const barW = Math.min(80, slot - 20);

  const totalDel = data.reduce((s, d) => s + d.delivered, 0);
  const totalAll = data.reduce((s, d) => s + d.total, 0);
  const overallPct = totalAll > 0 ? (totalDel / totalAll) * 100 : 0;

  return (
    <View style={styles.chartWrap}>
      <View style={styles.chartHeaderRow}>
        <Text style={styles.chartTitle}>Plant Wise</Text>
        <View style={[styles.totalBadge, { backgroundColor: COLORS.info + '18', borderColor: COLORS.info + '40' }]}>
          <Text style={[styles.totalBadgeCount, { color: COLORS.dark }]}>{totalDel}/{totalAll}</Text>
          <Text style={[styles.totalBadgePct, { color: COLORS.info }]}>{fmtPct(overallPct)}</Text>
        </View>
      </View>
      <Svg width={availW} height={chartH}>
        {[25, 50, 75, 100].map(v => {
          const y = padT + plotH - (v / 100) * plotH;
          return (
            <G key={v}>
              <Line x1={padL} y1={y} x2={availW - padR} y2={y} stroke={COLORS.gray200} strokeWidth={1} />
              <SvgText x={padL} y={y - 2} fontSize={7} fill={COLORS.gray400} textAnchor="start">{v}%</SvgText>
            </G>
          );
        })}
        {data.map((d, i) => {
          const x = padL + i * slot + (slot - barW) / 2;
          const barH = Math.max(2, (d.pct / 100) * plotH);
          const y = padT + plotH - barH;
          return (
            <G key={i}>
              <Rect x={x} y={y} width={barW} height={barH} fill={d.color} rx={4} opacity={0.9} />
              <SvgText x={x + barW / 2} y={y - 16} fontSize={9} fill={COLORS.dark} textAnchor="middle" fontWeight="700">
                {d.delivered}/{d.total}
              </SvgText>
              <SvgText x={x + barW / 2} y={y - 5} fontSize={8.5} fill={COLORS.gray700} textAnchor="middle" fontWeight="600">
                {fmtPct(d.pct)}
              </SvgText>
              <SvgText x={x + barW / 2} y={padT + plotH + 20} fontSize={11} fill={COLORS.dark} textAnchor="middle" fontWeight="500">
                {d.plant}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

export default function CustomerDIFOT() {
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedPlant, setSelectedPlant] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState('All');

  const accentColor = selectedCompany !== 'All' ? (COMPANY_COLORS[selectedCompany] || COLORS.primary) : '#3d6bb5';

  const customers = useMemo(() => {
    if (selectedCompany !== 'All') return EXTENDED_CUSTOMER_DATA.filter(c => c.company === selectedCompany);
    return EXTENDED_CUSTOMER_DATA;
  }, [selectedCompany]);

  const customerNames = useMemo(() => ['All', ...Array.from(new Set(customers.map(c => c.customerName)))], [customers]);

  const filteredCustomers = useMemo(() => {
    let list = customers;
    if (selectedCustomer !== 'All') list = list.filter(c => c.customerName === selectedCustomer);
    return list;
  }, [customers, selectedCustomer]);

  const overallDifot = useMemo(() => {
    if (filteredCustomers.length === 0) return 0;
    return filteredCustomers.reduce((s, c) => s + c.difotPercent, 0) / filteredCustomers.length;
  }, [filteredCustomers]);

  const difotColor = overallDifot >= 95 ? COLORS.success : overallDifot >= 80 ? COLORS.warning : COLORS.error;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.filterSection}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Company</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {COMPANIES.map(c => (
                <TouchableOpacity
                  key={c} activeOpacity={0.8}
                  style={[styles.chip, selectedCompany === c && { backgroundColor: COMPANY_COLORS[c] || COLORS.primary, borderColor: COMPANY_COLORS[c] || COLORS.primary }]}
                  onPress={() => { setSelectedCompany(c); setSelectedCustomer('All'); }}
                >
                  <Text style={[styles.chipText, selectedCompany === c && styles.chipActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.filterRow2}>
          <View style={[styles.filterGroup, { flex: 1 }]}>
            <Text style={styles.filterLabel}>Customer</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {customerNames.map(n => (
                  <TouchableOpacity
                    key={n} activeOpacity={0.8}
                    style={[styles.chip, selectedCustomer === n && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
                    onPress={() => setSelectedCustomer(n)}
                  >
                    <Text style={[styles.chipText, selectedCustomer === n && styles.chipActive]} numberOfLines={1}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
          <View style={[styles.filterGroup, { width: 200 }]}>
            <Text style={styles.filterLabel}>Plant</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {PLANTS.map(p => (
                  <TouchableOpacity
                    key={p} activeOpacity={0.8}
                    style={[styles.chip, selectedPlant === p && { backgroundColor: COLORS.info, borderColor: COLORS.info }]}
                    onPress={() => setSelectedPlant(p)}
                  >
                    <Text style={[styles.chipText, selectedPlant === p && styles.chipActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>

      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { borderLeftColor: difotColor }]}>
          <Text style={styles.kpiLabel}>Overall DIFOT</Text>
          <Text style={[styles.kpiVal, { color: difotColor }]}>{overallDifot.toFixed(1)}%</Text>
          <Text style={styles.kpiSub}>{filteredCustomers.length} customers</Text>
        </View>
        <View style={[styles.kpiCard, { borderLeftColor: COLORS.info }]}>
          <Text style={styles.kpiLabel}>Total SO Qty</Text>
          <Text style={[styles.kpiVal, { color: COLORS.info }]}>{filteredCustomers.reduce((s, c) => s + c.soQty, 0).toLocaleString()}</Text>
          <Text style={styles.kpiSub}>Orders placed</Text>
        </View>
        <View style={[styles.kpiCard, { borderLeftColor: COLORS.success }]}>
          <Text style={styles.kpiLabel}>Billed Qty</Text>
          <Text style={[styles.kpiVal, { color: COLORS.success }]}>{filteredCustomers.reduce((s, c) => s + c.billedQty, 0).toLocaleString()}</Text>
          <Text style={styles.kpiSub}>Delivered</Text>
        </View>
        <View style={[styles.kpiCard, { borderLeftColor: COLORS.warning }]}>
          <Text style={styles.kpiLabel}>On-Time Rate</Text>
          <Text style={[styles.kpiVal, { color: COLORS.warning }]}>
            {filteredCustomers.length > 0
              ? `${((filteredCustomers.filter(c => c.difotPercent >= 95).length / filteredCustomers.length) * 100).toFixed(0)}%`
              : '–'}
          </Text>
          <Text style={styles.kpiSub}>≥95% DIFOT</Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <MonthBarChart data={DIFOT_MONTHLY} color={accentColor} />
      </View>

      <View style={styles.chartCard}>
        <PlantBarChart data={DIFOT_PLANT} />
      </View>

      <View style={styles.tableCard}>
        <Text style={styles.sectionTitle}>Customer DIFOT Breakdown</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.thCell, { flex: 2 }]}>Customer</Text>
          <Text style={[styles.thCell, { flex: 1.6 }]}>Material</Text>
          <Text style={[styles.thCell, { flex: 0.85, textAlign: 'right' }]}>SO Qty</Text>
          <Text style={[styles.thCell, { flex: 0.85, textAlign: 'right' }]}>Billed</Text>
          <Text style={[styles.thCell, { flex: 1, textAlign: 'right' }]}>DIFOT</Text>
        </View>
        {filteredCustomers.map((c, i) => {
          const difot = c.difotPercent;
          const col = difot >= 95 ? COLORS.success : difot >= 80 ? COLORS.warning : COLORS.error;
          return (
            <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
              <View style={{ flex: 2 }}>
                <Text style={styles.tdMain} numberOfLines={1}>{c.customerName}</Text>
                <Text style={styles.tdSub}>{c.company}</Text>
              </View>
              <Text style={[styles.tdCell, { flex: 1.6 }]} numberOfLines={1}>{c.materialDesc}</Text>
              <Text style={[styles.tdCell, { flex: 0.85, textAlign: 'right' }]}>{c.soQty.toLocaleString()}</Text>
              <Text style={[styles.tdCell, { flex: 0.85, textAlign: 'right' }]}>{c.billedQty.toLocaleString()}</Text>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <View style={[styles.difotBadge, { backgroundColor: col + '18', borderColor: col + '40' }]}>
                  <Text style={[styles.difotText, { color: col }]}>{difot}%</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 14, paddingBottom: 32, gap: 12 },
  filterSection: { gap: 8 },
  filterGroup: { gap: 4 },
  filterRow2: { flexDirection: 'row', gap: 10 },
  filterLabel: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: COLORS.gray500, textTransform: 'uppercase', letterSpacing: 0.4 },
  chipRow: { flexDirection: 'row', gap: 6 },
  chip: { borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: COLORS.white },
  chipText: { fontSize: 11, fontFamily: 'Poppins-Medium', color: COLORS.gray700 },
  chipActive: { color: COLORS.white },
  kpiRow: { flexDirection: 'row', gap: 7 },
  kpiCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: 10, padding: 9, borderLeftWidth: 3, borderWidth: 1, borderColor: COLORS.border },
  kpiLabel: { fontSize: 8.5, fontFamily: 'Poppins-Regular', color: COLORS.gray500, textTransform: 'uppercase', marginBottom: 1 },
  kpiVal: { fontSize: 15, fontFamily: 'Poppins-Bold', marginBottom: 1 },
  kpiSub: { fontSize: 8.5, fontFamily: 'Poppins-Regular', color: COLORS.gray400 },
  chartCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  chartWrap: { gap: 6 },
  chartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  chartTitle: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  chartSub: { fontSize: 9.5, fontFamily: 'Poppins-Regular', color: COLORS.gray500, fontStyle: 'italic', marginTop: 1 },
  totalBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, alignItems: 'flex-end' },
  totalBadgeCount: { fontSize: 12, fontFamily: 'Poppins-Bold' },
  totalBadgePct: { fontSize: 11, fontFamily: 'Poppins-Bold' },
  tableCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark, marginBottom: 10 },
  tableHeader: { flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 2, borderBottomColor: COLORS.border, marginBottom: 2 },
  thCell: { fontSize: 9.5, fontFamily: 'Poppins-SemiBold', color: COLORS.gray500, textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderRadius: 6 },
  tableRowAlt: { backgroundColor: COLORS.bg },
  tdMain: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  tdSub: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  tdCell: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.dark },
  difotBadge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2 },
  difotText: { fontSize: 11, fontFamily: 'Poppins-Bold' },
});
