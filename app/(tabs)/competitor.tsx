import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { BarChart2, Globe, TrendingUp, TrendingDown, Star, Shield } from 'lucide-react-native';
import { COLORS, COMPANY_COLORS, imsData, productPortfolio, revenueData } from '@/data/mockData';
import { LinearGradient } from 'expo-linear-gradient';
import DrawerModal from '@/components/ui/DrawerModal';
import SectionHeader from '@/components/ui/SectionHeader';
import FilterChip from '@/components/ui/FilterChip';
import StatusBadge from '@/components/ui/StatusBadge';

function formatCurrency(v: number) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

function GrowthIndicator({ v2022, v2024 }: { v2022: number; v2024: number }) {
  const pct = v2022 > 0 ? ((v2024 - v2022) / v2022 * 100) : 0;
  const positive = pct >= 0;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {positive ? <TrendingUp size={10} color={COLORS.success} /> : <TrendingDown size={10} color={COLORS.error} />}
      <Text style={{ fontSize: 10, fontFamily: 'Poppins-SemiBold', color: positive ? COLORS.success : COLORS.error }}>
        {positive ? '+' : ''}{pct.toFixed(1)}%
      </Text>
    </View>
  );
}

function MATBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <View style={{ marginBottom: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
        <Text style={{ fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500 }}>{label}</Text>
        <Text style={{ fontSize: 9, fontFamily: 'Poppins-SemiBold', color: COLORS.dark }}>{formatCurrency(value)}</Text>
      </View>
      <View style={{ height: 5, backgroundColor: COLORS.gray100, borderRadius: 3, overflow: 'hidden' }}>
        <View style={{ width: `${pct}%`, height: 5, backgroundColor: COLORS.primary, borderRadius: 3 }} />
      </View>
    </View>
  );
}

export default function CompetitorAnalysis() {
  const [regionFilter, setRegionFilter] = useState('All');
  const [selectedCorp, setSelectedCorp] = useState<any>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'corporations' | 'market'>('corporations');

  const regions = ['All', ...new Set(imsData.map(d => d.region))];

  const filteredIms = useMemo(() => {
    if (regionFilter === 'All') return imsData;
    return imsData.filter(d => d.region === regionFilter);
  }, [regionFilter]);

  const corporationMap = useMemo(() => {
    const map: Record<string, {
      products: typeof imsData;
      regions: Set<string>;
      totalMAT2022: number;
      totalMAT2023: number;
      totalMAT2024: number;
      specialtyCount: number;
    }> = {};
    filteredIms.forEach(d => {
      if (!map[d.corporation]) {
        map[d.corporation] = { products: [], regions: new Set(), totalMAT2022: 0, totalMAT2023: 0, totalMAT2024: 0, specialtyCount: 0 };
      }
      map[d.corporation].products.push(d);
      map[d.corporation].regions.add(d.region);
      map[d.corporation].totalMAT2022 += d.matQ2_2022_USD;
      map[d.corporation].totalMAT2023 += d.matQ2_2023_USD;
      map[d.corporation].totalMAT2024 += d.matQ2_2024_USD;
      if (d.specialtyProduct) map[d.corporation].specialtyCount++;
    });
    return Object.entries(map).sort(([, a], [, b]) => b.totalMAT2024 - a.totalMAT2024);
  }, [filteredIms]);

  const maxMAT = corporationMap[0]?.[1]?.totalMAT2024 || 1;

  const openCorpDetail = (name: string, data: typeof corporationMap[0][1]) => {
    setSelectedCorp({ name, ...data });
    setDrawerVisible(true);
  };

  const ourPresence = useMemo(() => {
    return filteredIms.map(d => {
      const ourProduct = productPortfolio.find(p =>
        p.molecules.toLowerCase().includes(d.moleculeList.toLowerCase().split('/')[0]) &&
        p.country === d.country
      );
      const ourRevenue = ourProduct
        ? revenueData.filter(r => r.customerCountry === d.country).reduce((s, r) => s + r.invoiceValFC, 0)
        : 0;
      return { ...d, ourProduct, ourRevenue };
    });
  }, [filteredIms]);

  const ourMolecules = new Set(productPortfolio.map(p => p.molecules.toLowerCase().split(' ')[0]));

  const marketShareData = useMemo(() => {
    const total2024 = filteredIms.reduce((s, d) => s + d.matQ2_2024_USD, 0);
    return corporationMap.slice(0, 6).map(([name, data]) => ({
      name,
      share: total2024 > 0 ? (data.totalMAT2024 / total2024 * 100) : 0,
      mat: data.totalMAT2024,
      growth: data.totalMAT2022 > 0 ? ((data.totalMAT2024 - data.totalMAT2022) / data.totalMAT2022 * 100) : 0,
    }));
  }, [corporationMap, filteredIms]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentPad}>
          <LinearGradient colors={[COLORS.primaryDark, COLORS.primary, '#4a8f55']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
            <Text style={styles.headerTitle}>Competitor Analysis</Text>
            <Text style={styles.headerSub}>IMS Data · {filteredIms.length} market records</Text>
            <View style={styles.headerGoldLine} />
          </LinearGradient>

          <View style={styles.kpiStrip}>
            {[
              { label: 'Competitors', value: corporationMap.length.toString(), color: COLORS.primary },
              { label: 'Total Market (2024)', value: formatCurrency(filteredIms.reduce((s, d) => s + d.matQ2_2024_USD, 0)), color: COLORS.success },
              { label: 'Specialty Products', value: filteredIms.filter(d => d.specialtyProduct).length.toString(), color: COLORS.info },
              { label: 'Our Coverage', value: `${ourPresence.filter(d => d.ourProduct).length}/${ourPresence.length}`, color: COLORS.warning },
            ].map(k => (
              <View key={k.label} style={styles.kpiItem}>
                <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
                <Text style={styles.kpiLabel}>{k.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.tabRow}>
            {['corporations', 'market'].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab as any)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'corporations' ? 'Corporations' : 'Market Share'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionFilter} contentContainerStyle={styles.regionFilterContent}>
            {regions.map(r => (
              <FilterChip key={r} label={r} active={regionFilter === r} onPress={() => setRegionFilter(r)} />
            ))}
          </ScrollView>
          {activeTab === 'corporations' && (
            <>
              <View style={{ paddingHorizontal: 16 }}>
              <SectionHeader title="Corporation Rankings" subtitle="By MAT Q2 2024 Revenue" accent={COLORS.primary} />
              </View>
              {corporationMap.map(([name, data], i) => {
                const pct = maxMAT > 0 ? (data.totalMAT2024 / maxMAT) * 100 : 0;
                return (
                  <TouchableOpacity
                    key={name}
                    style={styles.corpCard}
                    onPress={() => openCorpDetail(name, data)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.corpRank}>
                      <Text style={styles.corpRankText}>{i + 1}</Text>
                    </View>
                    <View style={styles.corpContent}>
                      <View style={styles.corpTop}>
                        <Text style={styles.corpName}>{name}</Text>
                        <View style={styles.corpBadges}>
                          {data.specialtyCount > 0 && <StatusBadge label={`${data.specialtyCount} Specialty`} type="info" size="sm" />}
                          {Array.from(data.regions).slice(0, 2).map(r => (
                            <StatusBadge key={r} label={r} type="neutral" size="sm" />
                          ))}
                        </View>
                      </View>
                      <View style={styles.corpMatRow}>
                        <View style={styles.corpBar}>
                          <View style={[styles.corpBarFill, { width: `${pct}%` }]} />
                        </View>
                        <Text style={styles.corpMatValue}>{formatCurrency(data.totalMAT2024)}</Text>
                        <GrowthIndicator v2022={data.totalMAT2022} v2024={data.totalMAT2024} />
                      </View>
                      <View style={styles.corpYoY}>
                        {[
                          { year: '2022', value: data.totalMAT2022 },
                          { year: '2023', value: data.totalMAT2023 },
                          { year: '2024', value: data.totalMAT2024 },
                        ].map(y => (
                          <View key={y.year} style={styles.corpYear}>
                            <Text style={styles.corpYearLabel}>{y.year}</Text>
                            <Text style={styles.corpYearValue}>{formatCurrency(y.value)}</Text>
                          </View>
                        ))}
                        <Text style={styles.corpProducts}>{data.products.length} products</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          {activeTab === 'market' && (
            <>
              <SectionHeader title="Market Share Analysis" subtitle="MAT Q2 2022 vs 2024" accent={COLORS.success} />
              <View style={styles.shareCard}>
                {marketShareData.map((d, i) => (
                  <View key={d.name} style={styles.shareRow}>
                    <Text style={styles.shareName} numberOfLines={1}>{d.name}</Text>
                    <View style={styles.shareBarWrap}>
                      <View style={[styles.shareBar, { width: `${d.share}%`, backgroundColor: i === 0 ? COLORS.primary : i === 1 ? COLORS.success : COLORS.info }]} />
                    </View>
                    <Text style={styles.shareValue}>{d.share.toFixed(1)}%</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: 45 }}>
                      {d.growth >= 0 ? <TrendingUp size={9} color={COLORS.success} /> : <TrendingDown size={9} color={COLORS.error} />}
                      <Text style={{ fontSize: 9, fontFamily: 'Poppins-SemiBold', color: d.growth >= 0 ? COLORS.success : COLORS.error }}>
                        {d.growth >= 0 ? '+' : ''}{d.growth.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={{ marginTop: 16 }}><SectionHeader title="Our Portfolio vs Market" subtitle="Molecule overlap analysis" accent={COLORS.primary} /></View>
              <View style={styles.presenceCard}>
                {ourPresence.map((d, i) => (
                  <View key={i} style={styles.presenceRow}>
                    <View style={styles.presenceLeft}>
                      <Text style={styles.presenceMolecule}>{d.moleculeList}</Text>
                      <Text style={styles.presenceCountry}>{d.country} · {d.corporation}</Text>
                    </View>
                    <View style={styles.presenceRight}>
                      {d.ourProduct ? (
                        <View style={styles.ourPresenceBadge}>
                          <Shield size={10} color={COLORS.success} />
                          <Text style={styles.ourPresenceText}>Present</Text>
                        </View>
                      ) : (
                        <View style={styles.gapBadge}>
                          <Text style={styles.gapText}>Gap</Text>
                        </View>
                      )}
                      <Text style={[styles.presenceRev, { color: COLORS.primary }]}>{formatCurrency(d.matQ2_2024_USD)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>

      <DrawerModal
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        title={selectedCorp?.name || 'Corporation Detail'}
      >
        {selectedCorp && (
          <View>
            <View style={styles.corpDetailKpis}>
              {[
                { label: 'MAT 2022', value: formatCurrency(selectedCorp.totalMAT2022), color: COLORS.gray600 },
                { label: 'MAT 2023', value: formatCurrency(selectedCorp.totalMAT2023), color: COLORS.info },
                { label: 'MAT 2024', value: formatCurrency(selectedCorp.totalMAT2024), color: COLORS.success },
              ].map(k => (
                <View key={k.label} style={styles.corpDetailKpi}>
                  <Text style={[styles.corpDetailKpiValue, { color: k.color }]}>{k.value}</Text>
                  <Text style={styles.corpDetailKpiLabel}>{k.label}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.drawerSectionTitle}>Products in Portfolio</Text>
            {selectedCorp.products.map((p: any, i: number) => (
              <View key={i} style={styles.corpDetailProduct}>
                <View style={styles.corpDetailProductTop}>
                  <Text style={styles.corpDetailProductName}>{p.intlProduct}</Text>
                  {p.specialtyProduct && <StatusBadge label="Specialty" type="info" size="sm" />}
                </View>
                <Text style={styles.corpDetailProductSub}>{p.moleculeList} · {p.country} · {p.sector}</Text>
                <View style={styles.matBars}>
                  <MATBar value={p.matQ2_2022_USD} max={Math.max(p.matQ2_2022_USD, p.matQ2_2023_USD, p.matQ2_2024_USD)} label="2022" />
                  <MATBar value={p.matQ2_2023_USD} max={Math.max(p.matQ2_2022_USD, p.matQ2_2023_USD, p.matQ2_2024_USD)} label="2023" />
                  <MATBar value={p.matQ2_2024_USD} max={Math.max(p.matQ2_2022_USD, p.matQ2_2023_USD, p.matQ2_2024_USD)} label="2024" />
                </View>
                {p.innovationInsights && (
                  <Text style={styles.innovInsight}>💡 {p.innovationInsights}</Text>
                )}
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
  header: { paddingHorizontal: 20, paddingTop: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 6 },
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
  kpiValue: { fontSize: 13, fontFamily: 'Poppins-Bold' },
  kpiLabel: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500, textAlign: 'center' },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', backgroundColor: COLORS.gray100 },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 12, fontFamily: 'Poppins-Medium', color: COLORS.gray600 },
  tabTextActive: { color: COLORS.white },
  regionFilter: { backgroundColor: COLORS.bg, borderBottomWidth: 1, borderBottomColor: COLORS.border, maxHeight: 48, marginBottom: 8 },
  regionFilterContent: { paddingHorizontal: 16, paddingVertical: 8 },
  content: { flex: 1, backgroundColor: COLORS.bg },
  contentPad: { paddingBottom: 24 },
  corpCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  corpRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  corpRankText: { fontSize: 12, fontFamily: 'Poppins-Bold', color: COLORS.primary },
  corpContent: { flex: 1 },
  corpTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  corpName: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: COLORS.dark, flex: 1 },
  corpBadges: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  corpMatRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  corpBar: { flex: 1, height: 6, backgroundColor: COLORS.gray100, borderRadius: 3, overflow: 'hidden' },
  corpBarFill: { height: 6, backgroundColor: COLORS.primary, borderRadius: 3 },
  corpMatValue: { fontSize: 12, fontFamily: 'Poppins-Bold', color: COLORS.dark },
  corpYoY: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  corpYear: { backgroundColor: COLORS.cream, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  corpYearLabel: { fontSize: 8, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  corpYearValue: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  corpProducts: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500, marginLeft: 'auto' as any },
  shareCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  shareRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  shareName: { width: 70, fontSize: 11, fontFamily: 'Poppins-Medium', color: COLORS.dark },
  shareBarWrap: { flex: 1, height: 8, backgroundColor: COLORS.gray100, borderRadius: 4, overflow: 'hidden' },
  shareBar: { height: 8, borderRadius: 4 },
  shareValue: { width: 38, fontSize: 11, fontFamily: 'Poppins-Bold', color: COLORS.dark, textAlign: 'right' },
  presenceCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  presenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  presenceLeft: { flex: 1 },
  presenceMolecule: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  presenceCountry: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  presenceRight: { alignItems: 'flex-end', gap: 3 },
  ourPresenceBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.success + '15', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  ourPresenceText: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: COLORS.success },
  gapBadge: { backgroundColor: COLORS.error + '15', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  gapText: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: COLORS.error },
  presenceRev: { fontSize: 10, fontFamily: 'Poppins-Medium' },
  corpDetailKpis: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  corpDetailKpi: { flex: 1, backgroundColor: COLORS.cream, borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  corpDetailKpiValue: { fontSize: 14, fontFamily: 'Poppins-Bold' },
  corpDetailKpiLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  drawerSectionTitle: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark, marginTop: 8, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 6 },
  corpDetailProduct: { backgroundColor: COLORS.cream, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  corpDetailProductTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  corpDetailProductName: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  corpDetailProductSub: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray500, marginBottom: 8 },
  matBars: {},
  innovInsight: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.info, fontStyle: 'italic', marginTop: 6 },
});
