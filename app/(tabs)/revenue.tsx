import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, useWindowDimensions,
} from 'react-native';
import { DollarSign, TrendingUp, Package, Globe, Building, Search } from 'lucide-react-native';
import { COLORS, revenueData, monthlyRevenue } from '@/data/mockData';
import { LinearGradient } from 'expo-linear-gradient';
import DrawerModal from '@/components/ui/DrawerModal';
import SectionHeader from '@/components/ui/SectionHeader';
import FilterChip from '@/components/ui/FilterChip';
import StatusBadge from '@/components/ui/StatusBadge';
import MiniBarChart from '@/components/ui/MiniBarChart';

const DRILLDOWN_TABS = ['By Material', 'By Customer', 'By Country', 'By Plant'];

function formatCurrency(v: number) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(2)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

function RevenueBar({ value, max, color = COLORS.primary }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <View style={revStyles.barWrap}>
      <View style={[revStyles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

const revStyles = StyleSheet.create({
  barWrap: { flex: 1, height: 6, backgroundColor: COLORS.gray100, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
});

const CHART_HEIGHT = 72;

function TrendChart({ data }: { data: typeof monthlyRevenue }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <View style={styles.trendChart}>
      {data.map((d, i) => {
        const barH = max > 0 ? Math.max(3, (d.value / max) * CHART_HEIGHT) : 3;
        const isLast = i === data.length - 1;
        return (
          <View key={d.month} style={styles.trendCol}>
            <View style={[styles.trendBarWrap, { height: CHART_HEIGHT }]}>
              <View style={[styles.trendBar, { height: barH, backgroundColor: isLast ? COLORS.primary : COLORS.success + 'aa' }]} />
            </View>
            <Text style={styles.trendMonth}>{d.month.replace(' 24', '')}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function RevenueAnalytics() {
  const { width: screenWidth } = useWindowDimensions();
  const isTablet = screenWidth >= 768;
  const [drilldownTab, setDrilldownTab] = useState(0);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [quarterFilter, setQuarterFilter] = useState('All');

  const quarters = ['All', 'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'];

  const filteredRevenue = useMemo(() => {
    if (quarterFilter === 'All') return revenueData;
    return revenueData.filter(r => r.quarter === quarterFilter);
  }, [quarterFilter]);

  const totalRevenue = filteredRevenue.reduce((s, r) => s + r.invoiceValFC, 0);
  const totalCost = filteredRevenue.reduce((s, r) => s + r.materialCost, 0);
  const grossMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue * 100) : 0;

  const byMaterial = useMemo(() => {
    const map: Record<string, { desc: string; value: number; cost: number; count: number; company: string }> = {};
    filteredRevenue.forEach(r => {
      if (!map[r.material]) map[r.material] = { desc: r.materialDesc, value: 0, cost: 0, count: 0, company: r.company };
      map[r.material].value += r.invoiceValFC;
      map[r.material].cost += r.materialCost;
      map[r.material].count += 1;
    });
    return Object.entries(map).sort(([, a], [, b]) => b.value - a.value);
  }, [filteredRevenue]);

  const byCustomer = useMemo(() => {
    const map: Record<string, { country: string; value: number; count: number; company: string }> = {};
    filteredRevenue.forEach(r => {
      if (!map[r.customerName]) map[r.customerName] = { country: r.customerCountry, value: 0, count: 0, company: r.company };
      map[r.customerName].value += r.invoiceValFC;
      map[r.customerName].count += 1;
    });
    return Object.entries(map).sort(([, a], [, b]) => b.value - a.value);
  }, [filteredRevenue]);

  const byCountry = useMemo(() => {
    const map: Record<string, { value: number; count: number }> = {};
    filteredRevenue.forEach(r => {
      if (!map[r.customerCountry]) map[r.customerCountry] = { value: 0, count: 0 };
      map[r.customerCountry].value += r.invoiceValFC;
      map[r.customerCountry].count += 1;
    });
    return Object.entries(map).sort(([, a], [, b]) => b.value - a.value);
  }, [filteredRevenue]);

  const byPlant = useMemo(() => {
    const map: Record<string, { value: number; count: number }> = {};
    filteredRevenue.forEach(r => {
      if (!map[r.plant]) map[r.plant] = { value: 0, count: 0 };
      map[r.plant].value += r.invoiceValFC;
      map[r.plant].count += 1;
    });
    return Object.entries(map).sort(([, a], [, b]) => b.value - a.value);
  }, [filteredRevenue]);

  const maxMat = byMaterial[0]?.[1]?.value || 1;
  const maxCust = byCustomer[0]?.[1]?.value || 1;
  const maxCountry = byCountry[0]?.[1]?.value || 1;
  const maxPlant = byPlant[0]?.[1]?.value || 1;

  const openDetail = (row: any) => {
    setSelectedRow(row);
    setDrawerVisible(true);
  };

  const companyColorMap: Record<string, string> = {
    Strides: COLORS.primary, Instapill: COLORS.success, 'One Source': COLORS.primaryDark, Naari: COLORS.accentDark, Solara: COLORS.primaryLight,
  };

  const quarterRevenue = quarters.slice(1).map(q => ({
    label: q.replace(' 2024', ''),
    value: revenueData.filter(r => r.quarter === q).reduce((s, r) => s + r.invoiceValFC, 0),
    color: COLORS.primary,
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentPad}>
          <LinearGradient colors={[COLORS.primaryDark, COLORS.primary, '#4a8f55']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
            <Text style={styles.headerTitle}>Revenue Analytics</Text>
            <Text style={styles.headerSub}>FY 2024 · {revenueData.length} invoices</Text>
            <View style={styles.headerGoldLine} />
          </LinearGradient>

          <View style={styles.kpiStrip}>
            {[
              { label: 'Total Revenue', value: formatCurrency(totalRevenue), color: COLORS.primary, icon: <DollarSign size={14} color={COLORS.primary} /> },
              { label: 'Total Cost', value: formatCurrency(totalCost), color: COLORS.error, icon: <Package size={14} color={COLORS.error} /> },
              { label: 'Gross Margin', value: `${grossMargin.toFixed(1)}%`, color: COLORS.success, icon: <TrendingUp size={14} color={COLORS.success} /> },
              { label: 'Invoices', value: filteredRevenue.length.toString(), color: COLORS.info, icon: <Building size={14} color={COLORS.info} /> },
            ].map(k => (
              <View key={k.label} style={styles.kpiItem}>
                <View style={[styles.kpiIcon, { backgroundColor: k.color + '18' }]}>{k.icon}</View>
                <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
                <Text style={styles.kpiLabel}>{k.label}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.chartRow, isTablet && { flexDirection: 'row', gap: 12 }]}>
            <View style={[styles.chartCard, isTablet && { flex: 1.5 }]}>
              <SectionHeader title="Monthly Trend" subtitle="Last 12 months · All Companies" accent={COLORS.success} />
              <TrendChart data={monthlyRevenue} />
              <View style={styles.trendTotalRow}>
                <Text style={styles.trendTotalLabel}>12-Month Total</Text>
                <Text style={[styles.trendTotalValue, { color: COLORS.success }]}>
                  {formatCurrency(monthlyRevenue.reduce((s, m) => s + m.value, 0))}
                </Text>
              </View>
            </View>
            <View style={[styles.chartCard, isTablet && { flex: 1 }]}>
              <SectionHeader title="By Quarter" subtitle="FY 2024" accent={COLORS.primary} />
              <MiniBarChart data={quarterRevenue} height={80} formatValue={formatCurrency} />
            </View>
          </View>

          <View style={styles.filterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
              {quarters.map(q => (
                <FilterChip key={q} label={q} active={quarterFilter === q} onPress={() => setQuarterFilter(q)} color={COLORS.primary} />
              ))}
            </ScrollView>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.drillTabs} contentContainerStyle={styles.drillTabsContent}>
            {DRILLDOWN_TABS.map((t, i) => (
              <TouchableOpacity key={t} style={[styles.drillTab, drilldownTab === i && styles.drillTabActive]} onPress={() => setDrilldownTab(i)}>
                <Text style={[styles.drillTabText, drilldownTab === i && styles.drillTabTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {drilldownTab === 0 && (
            <View style={styles.tableCard}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHCell, { flex: 2 }]}>Material</Text>
                <Text style={styles.tableHCell}>Revenue</Text>
                <Text style={styles.tableHCell}>Margin</Text>
              </View>
              {byMaterial.map(([code, data], i) => {
                const gm = data.value > 0 ? ((data.value - data.cost) / data.value * 100) : 0;
                return (
                  <TouchableOpacity key={code} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]} onPress={() => openDetail({ type: 'material', code, data })}>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.tableCell}>{data.desc}</Text>
                      <View style={{ flexDirection: 'row', gap: 4, marginTop: 2, alignItems: 'center' }}>
                        <Text style={[styles.tableSub, { color: companyColorMap[data.company] || COLORS.gray500 }]}>{data.company}</Text>
                        <RevenueBar value={data.value} max={maxMat} color={companyColorMap[data.company] || COLORS.primary} />
                      </View>
                    </View>
                    <Text style={[styles.tableCell, { color: COLORS.primary }]}>{formatCurrency(data.value)}</Text>
                    <Text style={[styles.tableCell, { color: gm >= 50 ? COLORS.success : COLORS.warning }]}>{gm.toFixed(1)}%</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {drilldownTab === 1 && (
            <View style={styles.tableCard}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHCell, { flex: 2 }]}>Customer</Text>
                <Text style={styles.tableHCell}>Country</Text>
                <Text style={styles.tableHCell}>Revenue</Text>
              </View>
              {byCustomer.map(([name, data], i) => (
                <TouchableOpacity key={name} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]} onPress={() => openDetail({ type: 'customer', name, data })}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.tableCell}>{name}</Text>
                    <RevenueBar value={data.value} max={maxCust} />
                  </View>
                  <Text style={styles.tableCell}>{data.country}</Text>
                  <Text style={[styles.tableCell, { color: COLORS.success }]}>{formatCurrency(data.value)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {drilldownTab === 2 && (
            <View style={styles.tableCard}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHCell, { flex: 2 }]}>Country</Text>
                <Text style={styles.tableHCell}>Invoices</Text>
                <Text style={styles.tableHCell}>Revenue</Text>
              </View>
              {byCountry.map(([country, data], i) => (
                <TouchableOpacity key={country} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]} onPress={() => openDetail({ type: 'country', country, data })}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.tableCell}>{country}</Text>
                    <RevenueBar value={data.value} max={maxCountry} color={COLORS.success} />
                  </View>
                  <Text style={styles.tableCell}>{data.count}</Text>
                  <Text style={[styles.tableCell, { color: COLORS.success }]}>{formatCurrency(data.value)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {drilldownTab === 3 && (
            <View style={styles.tableCard}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHCell, { flex: 2 }]}>Plant</Text>
                <Text style={styles.tableHCell}>Invoices</Text>
                <Text style={styles.tableHCell}>Revenue</Text>
              </View>
              {byPlant.map(([plant, data], i) => (
                <TouchableOpacity key={plant} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]} onPress={() => openDetail({ type: 'plant', plant, data })}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.tableCell}>{plant}</Text>
                    <RevenueBar value={data.value} max={maxPlant} color={COLORS.info} />
                  </View>
                  <Text style={styles.tableCell}>{data.count}</Text>
                  <Text style={[styles.tableCell, { color: COLORS.info }]}>{formatCurrency(data.value)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>

      <DrawerModal
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        title="Invoice Detail"
      >
        {selectedRow && (
          <View>
            {filteredRevenue
              .filter(r => {
                if (selectedRow.type === 'material') return r.material === selectedRow.code;
                if (selectedRow.type === 'customer') return r.customerName === selectedRow.name;
                if (selectedRow.type === 'country') return r.customerCountry === selectedRow.country;
                if (selectedRow.type === 'plant') return r.plant === selectedRow.plant;
                return true;
              })
              .map((r, i) => (
                <View key={i} style={styles.invoiceCard}>
                  <View style={styles.invoiceTop}>
                    <Text style={styles.invoiceNo}>{r.invoiceNo}</Text>
                    <Text style={styles.invoiceDate}>{r.invoiceDt}</Text>
                  </View>
                  <Text style={styles.invoiceProduct}>{r.materialDesc}</Text>
                  <View style={styles.invoiceStats}>
                    <View style={styles.invoiceStat}>
                      <Text style={styles.invoiceStatLabel}>FC Value</Text>
                      <Text style={[styles.invoiceStatValue, { color: COLORS.success }]}>{formatCurrency(r.invoiceValFC)}</Text>
                    </View>
                    <View style={styles.invoiceStat}>
                      <Text style={styles.invoiceStatLabel}>LC Value</Text>
                      <Text style={styles.invoiceStatValue}>{r.currency} {r.invoiceValLC.toLocaleString()}</Text>
                    </View>
                    <View style={styles.invoiceStat}>
                      <Text style={styles.invoiceStatLabel}>Qty</Text>
                      <Text style={styles.invoiceStatValue}>{r.salesQty.toLocaleString()}</Text>
                    </View>
                  </View>
                  <View style={styles.invoiceMeta}>
                    <Text style={styles.invoiceMetaText}>{r.customerName} · {r.customerCountry}</Text>
                    <Text style={styles.invoiceMetaText}>ExRate: {r.exRate} · Plant: {r.plant}</Text>
                  </View>
                </View>
              ))}
          </View>
        )}
      </DrawerModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 6 },
  headerGoldLine: { height: 2, backgroundColor: COLORS.gold, opacity: 0.5, marginTop: 16 },
  headerTitle: { fontSize: 20, fontFamily: 'Poppins-Bold', color: COLORS.white },
  headerSub: { fontSize: 12, fontFamily: 'Poppins-Regular', color: COLORS.goldLight, marginTop: 2, opacity: 0.85 },
  kpiStrip: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 6,
  },
  kpiItem: { flex: 1, alignItems: 'center', gap: 4 },
  kpiIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  kpiValue: { fontSize: 13, fontFamily: 'Poppins-Bold' },
  kpiLabel: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500, textAlign: 'center' },
  content: { flex: 1, backgroundColor: COLORS.bg },
  contentPad: { paddingBottom: 24 },
  chartRow: { marginBottom: 12, paddingHorizontal: 16, marginTop: 12 },
  chartCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  trendChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    marginBottom: 8,
  },
  trendCol: { flex: 1, alignItems: 'center' },
  trendBarWrap: {
    width: '80%',
    backgroundColor: COLORS.gray100,
    borderRadius: 3,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  trendBar: { width: '100%', borderRadius: 3 },
  trendMonth: { fontSize: 8, fontFamily: 'Poppins-Regular', color: COLORS.gray500, marginTop: 3 },
  trendTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  trendTotalLabel: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  trendTotalValue: { fontSize: 14, fontFamily: 'Poppins-Bold' },
  filterRow: { marginBottom: 12, paddingHorizontal: 16 },
  filterContent: { gap: 6 },
  drillTabs: { marginBottom: 12, maxHeight: 48, paddingHorizontal: 16 },
  drillTabsContent: { gap: 8, paddingVertical: 6, alignItems: 'center' },
  drillTab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  drillTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  drillTabText: { fontSize: 12, fontFamily: 'Poppins-Medium', color: COLORS.gray600 },
  drillTabTextActive: { color: COLORS.white },
  tableCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 8,
    marginHorizontal: 16,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.cream,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableHCell: { flex: 1, fontSize: 10, fontFamily: 'Poppins-SemiBold', color: COLORS.gray500, textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: COLORS.gray100, alignItems: 'center' },
  tableRowAlt: { backgroundColor: COLORS.gray100 + '30' },
  tableCell: { flex: 1, fontSize: 12, fontFamily: 'Poppins-Medium', color: COLORS.dark },
  tableSub: { fontSize: 10, fontFamily: 'Poppins-Regular' },
  invoiceCard: {
    backgroundColor: COLORS.cream,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  invoiceTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  invoiceNo: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  invoiceDate: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  invoiceProduct: { fontSize: 13, fontFamily: 'Poppins-Medium', color: COLORS.primary, marginBottom: 8 },
  invoiceStats: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  invoiceStat: { flex: 1, backgroundColor: COLORS.white, borderRadius: 6, padding: 6 },
  invoiceStatLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  invoiceStatValue: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  invoiceMeta: { marginTop: 2 },
  invoiceMetaText: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
});
