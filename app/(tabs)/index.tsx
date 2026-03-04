import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Platform, SafeAreaView,
} from 'react-native';
import {
  LayoutDashboard, TrendingUp, Layers, Globe,
  DollarSign, Activity, ShieldCheck, Users,
  ChevronRight, ArrowUpRight,
} from 'lucide-react-native';
import {
  COLORS, COMPANIES, COMPANY_COLORS, companyMetrics, productPortfolio,
  revenueData, rdData, goLanzarData, monthlyRevenue,
} from '@/data/mockData';
import { LinearGradient } from 'expo-linear-gradient';
import SparkLine from '@/components/ui/SparkLine';
import DrawerModal from '@/components/ui/DrawerModal';
import SectionHeader from '@/components/ui/SectionHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import NewsTicker from '@/components/ui/NewsTicker';
import MiniBarChart from '@/components/ui/MiniBarChart';
import CompanyDrawerContent from '@/components/ui/CompanyDrawerContent';

function useWindowWidth() {
  const [width, setWidth] = useState(() => Dimensions.get('window').width);
  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => setWidth(window.width));
    return () => sub.remove();
  }, []);
  return width;
}

function formatCurrency(v: number) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

function CompanyTile({ name, onPress }: { name: string; onPress: () => void }) {
  const windowWidth = useWindowWidth();
  const isTablet = windowWidth >= 768;
  const metrics = companyMetrics[name as keyof typeof companyMetrics];
  if (!metrics) return null;
  return (
    <TouchableOpacity style={styles.companyTile} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.companyAccent, { backgroundColor: metrics.color }]} />
      <View style={styles.companyInner}>
        <View style={styles.companyTop}>
          <View style={[styles.companyLogo, { backgroundColor: metrics.color + '20' }]}>
            <Text style={[styles.companyLogoText, { color: metrics.color }]}>{name.substring(0, 2).toUpperCase()}</Text>
          </View>
          <View style={styles.companyGrowth}>
            <ArrowUpRight size={12} color={COLORS.success} />
            <Text style={styles.companyGrowthText}>+{metrics.growth}%</Text>
          </View>
        </View>
        <Text style={styles.companyName} numberOfLines={1}>{name}</Text>
        <Text style={[styles.companyRevenue, { color: metrics.color }]}>{formatCurrency(metrics.revenue)}</Text>
        <View style={styles.companyMeta}>
          <Text style={styles.companyMetaText}>{metrics.products} Products</Text>
        </View>
        <SparkLine data={metrics.sparkline} width={isTablet ? 90 : 70} height={28} color={metrics.color} />
        <View style={styles.companyKpi}>
          <Text style={styles.companyKpiLabel}>Top Region</Text>
          <Text style={styles.companyKpiValue} numberOfLines={1}>{metrics.topRegion}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function CompanyTileDesktop({ name, onPress }: { name: string; onPress: () => void }) {
  const metrics = companyMetrics[name as keyof typeof companyMetrics];
  if (!metrics) return null;
  return (
    <TouchableOpacity style={styles.companyTileDesktop} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.companyAccent, { backgroundColor: metrics.color }]} />
      <View style={styles.companyInner}>
        <View style={styles.companyTop}>
          <View style={[styles.companyLogo, { backgroundColor: metrics.color + '20' }]}>
            <Text style={[styles.companyLogoText, { color: metrics.color }]}>{name.substring(0, 2).toUpperCase()}</Text>
          </View>
          <View style={styles.companyGrowth}>
            <ArrowUpRight size={12} color={COLORS.success} />
            <Text style={styles.companyGrowthText}>+{metrics.growth}%</Text>
          </View>
        </View>
        <Text style={styles.companyName} numberOfLines={1}>{name}</Text>
        <Text style={[styles.companyRevenue, { color: metrics.color }]}>{formatCurrency(metrics.revenue)}</Text>
        <View style={styles.companyMeta}>
          <Text style={styles.companyMetaText}>{metrics.products} Products</Text>
        </View>
        <SparkLine data={metrics.sparkline} width={100} height={28} color={metrics.color} />
        <View style={styles.companyKpi}>
          <Text style={styles.companyKpiLabel}>Top Region</Text>
          <Text style={styles.companyKpiValue} numberOfLines={1}>{metrics.topRegion}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function RevenueRow({ month, value, prev }: { month: string; value: number; prev: number }) {
  const pct = prev > 0 ? Math.round(((value - prev) / prev) * 100) : 0;
  const max = Math.max(value, prev);
  return (
    <View style={styles.revRow}>
      <Text style={styles.revMonth}>{month}</Text>
      <View style={styles.revBarWrap}>
        <View style={[styles.revBar, { width: `${(value / 200000) * 100}%` }]} />
      </View>
      <Text style={styles.revValue}>{formatCurrency(value)}</Text>
      <Text style={[styles.revPct, { color: pct >= 0 ? COLORS.success : COLORS.error }]}>
        {pct >= 0 ? '+' : ''}{pct}%
      </Text>
    </View>
  );
}

export default function ExecutiveOverview() {
  const windowWidth = useWindowWidth();
  const isTablet = windowWidth >= 768;
  const isDesktop = windowWidth >= 1100;

  const [drawerTitle, setDrawerTitle] = useState('');
  const [drawerContent, setDrawerContent] = useState<React.ReactNode>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const openDrawer = useCallback((title: string, content: React.ReactNode) => {
    setDrawerTitle(title);
    setDrawerContent(content);
    setDrawerVisible(true);
  }, []);

  const openCompanyDrawer = useCallback((name: string) => {
    setSelectedCompany(name);
    openDrawer(`${name} — Company Snapshot`, <CompanyDrawerContent name={name} />);
  }, [openDrawer]);

  const openRevenueDrawer = useCallback(() => {
    const top5 = [...revenueData]
      .sort((a, b) => b.invoiceValFC - a.invoiceValFC)
      .slice(0, 10);
    openDrawer('Revenue Detail — All Materials', (
      <View>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, { flex: 2 }]}>Material</Text>
          <Text style={styles.tableCell}>Country</Text>
          <Text style={styles.tableCell}>Value (FC)</Text>
          <Text style={styles.tableCell}>Company</Text>
        </View>
        {top5.map((r, i) => (
          <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
            <View style={{ flex: 2 }}>
              <Text style={styles.tableCellText}>{r.materialDesc}</Text>
              <Text style={styles.tableCellSub}>{r.invoiceNo}</Text>
            </View>
            <Text style={styles.tableCellText}>{r.customerCountry}</Text>
            <Text style={[styles.tableCellText, { color: COLORS.success }]}>{formatCurrency(r.invoiceValFC)}</Text>
            <Text style={styles.tableCellText}>{r.company}</Text>
          </View>
        ))}
      </View>
    ));
  }, [openDrawer]);

  const openLaunchesDrawer = useCallback(() => {
    const upcoming = [...rdData, ...goLanzarData]
      .filter(d => d.currentPhase !== 'Launched')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 8);
    openDrawer('Upcoming Launches by Quarter', (
      <View>
        {upcoming.map((item, i) => (
          <View key={i} style={styles.pipelineCard}>
            <View style={styles.pipelineCardTop}>
              <Text style={styles.pipelineCardTitle}>{item.summary}</Text>
              <StatusBadge label={item.priority} type={item.priority === 'Critical' ? 'error' : item.priority === 'High' ? 'warning' : 'neutral'} size="sm" />
            </View>
            <View style={styles.pipelineCardMeta}>
              <Text style={styles.pipelineCardMetaText}>{item.molecule} · {item.dosageForm}</Text>
              <Text style={styles.pipelineCardMetaText}>Due: {item.endMonthYear}</Text>
            </View>
            <View style={styles.pipelineCardFooter}>
              <Text style={styles.pipelineCardRev}>Rev: {formatCurrency(item.totalRevenue)}</Text>
              <Text style={styles.pipelineCardGm}>GM: {item.gm}%</Text>
              <StatusBadge label={item.currentPhase} type="info" size="sm" />
            </View>
          </View>
        ))}
      </View>
    ));
  }, [openDrawer]);

  const openRegDrawer = useCallback(() => {
    const pending = [...rdData, ...goLanzarData]
      .filter(d => d.currentStatusCategory === 'Regulatory' || d.currentStatusCategory === 'Approval');
    openDrawer('Regulatory Approvals & Filings', (
      <View>
        {pending.map((item, i) => (
          <View key={i} style={styles.drawerListItem}>
            <View style={styles.drawerListLeft}>
              <Text style={styles.drawerListTitle}>{item.summary}</Text>
              <Text style={styles.drawerListSub}>{item.currentStatus} · {item.referenceMarket}</Text>
              <Text style={styles.drawerListSub}>Due: {item.endMonthYear} · {item.company}</Text>
            </View>
            <StatusBadge label={item.currentPhase} type="info" size="sm" />
          </View>
        ))}
      </View>
    ));
  }, [openDrawer]);

  const totalRevenue = Object.values(companyMetrics).reduce((s, m) => s + m.revenue, 0);
  const totalProducts = productPortfolio.length;
  const pipelineCount = rdData.length + goLanzarData.length;
  const pendingApprovals = [...rdData, ...goLanzarData].filter(d => d.currentStatusCategory === 'Regulatory' || d.currentStatusCategory === 'Approval').length;

  const top5Products = revenueData
    .sort((a, b) => b.invoiceValFC - a.invoiceValFC)
    .slice(0, 5)
    .map(r => ({ label: r.material, value: r.invoiceValFC, color: COLORS.primary }));

  const revenueSlice = monthlyRevenue.slice(-6);

  const layoutColumns = isDesktop ? 3 : isTablet ? 2 : 1;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <LinearGradient
            colors={[COLORS.primaryDark, COLORS.primary, '#4a8f55']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.topBar}
          >
            <View style={styles.topBarInner}>
              <View>
                <Text style={styles.greeting}>Good Morning, Executive</Text>
                <Text style={styles.appTitle}>Synergice Portfolio</Text>
              </View>
            </View>
            <View style={styles.headerGoldLine} />
          </LinearGradient>

          <View style={styles.globalKpiRow}>
            {[
              { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: <DollarSign size={14} color={COLORS.primary} />, color: COLORS.primary },
              { label: 'Products', value: totalProducts.toString(), icon: <Layers size={14} color={COLORS.success} />, color: COLORS.success },
              { label: 'Pipeline', value: pipelineCount.toString(), icon: <Activity size={14} color={COLORS.info} />, color: COLORS.info },
              { label: 'Pending Approvals', value: pendingApprovals.toString(), icon: <ShieldCheck size={14} color={COLORS.warning} />, color: COLORS.warning },
            ].map((kpi, i) => (
              <View key={i} style={styles.globalKpi}>
                <View style={[styles.globalKpiIcon, { backgroundColor: kpi.color + '18' }]}>{kpi.icon}</View>
                <Text style={[styles.globalKpiValue, { color: kpi.color }]}>{kpi.value}</Text>
                <Text style={styles.globalKpiLabel}>{kpi.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.pageContent}>
          <SectionHeader title="Portfolio Companies" subtitle="5 Companies · Tap to explore" accent={COLORS.primary} />
          {isDesktop ? (
            <View style={styles.companiesRowDesktop}>
              {COMPANIES.map(name => (
                <CompanyTileDesktop key={name} name={name} onPress={() => openCompanyDrawer(name)} />
              ))}
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.companiesRow}>
              {COMPANIES.map(name => (
                <CompanyTile key={name} name={name} onPress={() => openCompanyDrawer(name)} />
              ))}
            </ScrollView>
          )}

          <View style={[styles.gridRow, { flexDirection: isTablet ? 'row' : 'column' }]}>
              <View style={[styles.gridCell, isTablet && { flex: 1 }]}>
                <SectionHeader title="Revenue by Product" subtitle="Top 5 Materials" onSeeAll={openRevenueDrawer} accent={COLORS.primary} />
                <MiniBarChart
                  data={top5Products}
                  height={90}
                  formatValue={v => `$${(v / 1000).toFixed(0)}K`}
                />
              </View>
              <View style={[styles.gridCell, isTablet && { flex: 1 }]}>
                <SectionHeader title="Launches by Quarter" subtitle="Upcoming pipeline" onSeeAll={openLaunchesDrawer} accent={COLORS.success} />
                <View style={styles.launchGrid}>
                  {['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'].map(q => {
                    const count = [...rdData, ...goLanzarData].filter(d => {
                      const em = d.endMonthYear || '';
                      if (q === 'Q1 2025') return em.includes('Jan 2025') || em.includes('Feb 2025') || em.includes('Mar 2025');
                      if (q === 'Q2 2025') return em.includes('Apr 2025') || em.includes('May 2025') || em.includes('Jun 2025');
                      if (q === 'Q3 2025') return em.includes('Jul 2025') || em.includes('Aug 2025') || em.includes('Sep 2025');
                      return em.includes('Oct 2025') || em.includes('Nov 2025') || em.includes('Dec 2025');
                    }).length;
                    return (
                      <TouchableOpacity key={q} style={styles.launchTile} onPress={openLaunchesDrawer} activeOpacity={0.8}>
                        <Text style={styles.launchQ}>{q}</Text>
                        <Text style={styles.launchCount}>{count}</Text>
                        <Text style={styles.launchLabel}>launches</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

          <View style={[styles.gridRow, { flexDirection: isTablet ? 'row' : 'column' }]}>
              <View style={[styles.gridCell, isTablet && { flex: 1.4 }]}>
                <SectionHeader title="Revenue Trend" subtitle="Last 6 months" accent={COLORS.success} />
                {revenueSlice.map((m, i) => (
                  <RevenueRow key={m.month} month={m.month} value={m.value} prev={i > 0 ? revenueSlice[i - 1].value : m.value} />
                ))}
              </View>
              <View style={[styles.gridCell, isTablet && { flex: 1 }]}>
                <SectionHeader title="Pending Regulatory" onSeeAll={openRegDrawer} accent={COLORS.warning} />
                {[...rdData, ...goLanzarData]
                  .filter(d => d.currentStatusCategory === 'Regulatory' || d.currentStatusCategory === 'Approval')
                  .slice(0, 4)
                  .map((item, i) => (
                    <View key={i} style={styles.regItem}>
                      <View style={[styles.regDot, { backgroundColor: item.priority === 'Critical' ? COLORS.error : COLORS.warning }]} />
                      <View style={styles.regContent}>
                        <Text style={styles.regTitle} numberOfLines={1}>{item.summary}</Text>
                        <Text style={styles.regSub}>{item.company} · {item.endMonthYear}</Text>
                      </View>
                    </View>
                  ))}
              </View>
            </View>

          <View style={styles.newsSection}>
              <SectionHeader title="Live Intelligence Feed" accent={COLORS.primary} />
              <View style={{ height: 320 }}>
                <NewsTicker />
              </View>
            </View>

          <View style={{ height: 24 }} />
          </View>
        </ScrollView>
      </View>

      <DrawerModal visible={drawerVisible} onClose={() => setDrawerVisible(false)} title={drawerTitle}>
        {drawerContent}
      </DrawerModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  root: { flex: 1, backgroundColor: COLORS.bg },
  topBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  topBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerGoldLine: {
    height: 2,
    backgroundColor: COLORS.gold,
    opacity: 0.5,
  },
  greeting: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: COLORS.goldLight,
    opacity: 0.8,
  },
  appTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  globalKpiRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  globalKpi: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  globalKpiIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  globalKpiValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  globalKpiLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: COLORS.gray500,
    textAlign: 'center',
  },
  scroll: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { paddingBottom: 16 },
  pageContent: { paddingHorizontal: 16, paddingTop: 16 },
  companiesRow: {
    paddingBottom: 8,
    gap: 12,
    paddingRight: 8,
  },
  companiesRowDesktop: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  companyTileDesktop: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  companyTile: {
    width: 155,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  companyAccent: { width: 4 },
  companyInner: { flex: 1, padding: 12 },
  companyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  companyLogo: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  companyLogoText: { fontSize: 11, fontFamily: 'Poppins-Bold' },
  companyGrowth: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  companyGrowthText: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: COLORS.success },
  companyName: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark, marginBottom: 2 },
  companyRevenue: { fontSize: 16, fontFamily: 'Poppins-Bold', marginBottom: 2 },
  companyMeta: { marginBottom: 6 },
  companyMetaText: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  companyKpi: { marginTop: 6 },
  companyKpiLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray400 },
  companyKpiValue: { fontSize: 10, fontFamily: 'Poppins-Medium', color: COLORS.dark },
  gridRow: { gap: 12, marginBottom: 16 },
  gridCell: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 0,
  },
  launchGrid: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  launchTile: {
    flex: 1,
    minWidth: 60,
    backgroundColor: COLORS.cream,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  launchQ: { fontSize: 9, fontFamily: 'Poppins-Medium', color: COLORS.gray500, marginBottom: 2 },
  launchCount: { fontSize: 22, fontFamily: 'Poppins-Bold', color: COLORS.success },
  launchLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  revRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  revMonth: { fontSize: 11, fontFamily: 'Poppins-Medium', color: COLORS.gray600, width: 44 },
  revBarWrap: { flex: 1, height: 8, backgroundColor: COLORS.gray100, borderRadius: 4, overflow: 'hidden' },
  revBar: { height: 8, backgroundColor: COLORS.success, borderRadius: 4 },
  revValue: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: COLORS.dark, width: 52, textAlign: 'right' },
  revPct: { fontSize: 10, fontFamily: 'Poppins-Medium', width: 36, textAlign: 'right' },
  regItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  regDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  regContent: { flex: 1 },
  regTitle: { fontSize: 12, fontFamily: 'Poppins-Medium', color: COLORS.dark },
  regSub: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  newsSection: { marginBottom: 8 },
  drawerMetaRow: { flexDirection: 'row', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  drawerMetaBlock: {
    flex: 1,
    minWidth: 80,
    backgroundColor: COLORS.cream,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  drawerMetaLabel: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500, marginBottom: 4, textAlign: 'center' },
  drawerMetaValue: { fontSize: 18, fontFamily: 'Poppins-Bold' },
  drawerSectionTitle: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark, marginTop: 16, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 6 },
  drawerListItem: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: COLORS.gray100, gap: 8 },
  drawerListLeft: { flex: 1 },
  drawerListTitle: { fontSize: 13, fontFamily: 'Poppins-Medium', color: COLORS.dark, marginBottom: 2 },
  drawerListSub: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  tableHeader: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 8, backgroundColor: COLORS.cream, borderRadius: 6, marginBottom: 4 },
  tableCell: { flex: 1, fontSize: 10, fontFamily: 'Poppins-SemiBold', color: COLORS.gray500, textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: COLORS.gray100, alignItems: 'center' },
  tableRowAlt: { backgroundColor: COLORS.gray100 + '40' },
  tableCellText: { flex: 1, fontSize: 12, fontFamily: 'Poppins-Regular', color: COLORS.dark },
  tableCellSub: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray400 },
  pipelineCard: {
    backgroundColor: COLORS.cream,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pipelineCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 8 },
  pipelineCardTitle: { flex: 1, fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  pipelineCardMeta: { marginBottom: 8 },
  pipelineCardMetaText: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  pipelineCardFooter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pipelineCardRev: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: COLORS.success },
  pipelineCardGm: { fontSize: 12, fontFamily: 'Poppins-Medium', color: COLORS.primary },
});
