import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView,
} from 'react-native';
import { ShieldAlert, Search, X, ChevronDown, ChevronUp, BarChart2, FileText } from 'lucide-react-native';
import { COLORS, regulatoryData, customerViewData } from '@/data/mockData';
import { LinearGradient } from 'expo-linear-gradient';
import DrawerModal from '@/components/ui/DrawerModal';
import SectionHeader from '@/components/ui/SectionHeader';
import FilterChip from '@/components/ui/FilterChip';
import StatusBadge from '@/components/ui/StatusBadge';

const THEME_CLUSTERS: Record<string, string[]> = {
  'Data & Documentation': ['Data Integrity', 'Batch Release', 'Change Control', 'Label Reconciliation'],
  'Quality Systems': ['OOS Investigation', 'CAPA Effectiveness', 'Process Validation'],
  'Storage & Environment': ['Temperature Excursion', 'Environmental Monitoring'],
  'Suppliers & Supply Chain': ['Vendor Qualification', 'Cleaning Validation'],
  'Compliance Programs': ['Stability Program'],
};

function ObservationCard({ item, onPress }: { item: typeof regulatoryData[0]; onPress: () => void }) {
  const getTheme = (short: string) => {
    for (const [theme, items] of Object.entries(THEME_CLUSTERS)) {
      if (items.includes(short)) return theme;
    }
    return 'Other';
  };

  const theme = getTheme(item.shortDescription);
  const frequencyLevel = item.frequency >= 12 ? 'High' : item.frequency >= 8 ? 'Medium' : 'Low';
  const freqColor = frequencyLevel === 'High' ? COLORS.error : frequencyLevel === 'Medium' ? COLORS.warning : COLORS.success;

  return (
    <TouchableOpacity style={styles.obsCard} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.obsFreqBar, { height: `${(item.frequency / 15) * 100}%`, backgroundColor: freqColor }]} />
      <View style={styles.obsContent}>
        <View style={styles.obsTop}>
          <View style={styles.obsTitleWrap}>
            <Text style={styles.obsShort}>{item.shortDescription}</Text>
            <Text style={styles.obsRef}>{item.referenceNumber}</Text>
          </View>
          <View style={styles.obsFreqWrap}>
            <Text style={[styles.obsFreqNum, { color: freqColor }]}>{item.frequency}</Text>
            <Text style={styles.obsFreqLabel}>freq</Text>
          </View>
        </View>
        <View style={styles.obsMeta}>
          <View style={styles.obsThemeTag}>
            <Text style={styles.obsThemeText}>{theme}</Text>
          </View>
          <StatusBadge label={frequencyLevel + ' Risk'} type={frequencyLevel === 'High' ? 'error' : frequencyLevel === 'Medium' ? 'warning' : 'success'} size="sm" />
        </View>
        <Text style={styles.obsCustomer}>{item.customerName}</Text>
      </View>
    </TouchableOpacity>
  );
}

function DIFOTCard({ item }: { item: typeof customerViewData[0] }) {
  const difot = item.difotPercent;
  const color = difot >= 95 ? COLORS.success : difot >= 85 ? COLORS.warning : COLORS.error;
  return (
    <View style={styles.difotCard}>
      <View style={styles.difotTop}>
        <View>
          <Text style={styles.difotCustomer}>{item.customerName}</Text>
          <Text style={styles.difotSo}>{item.soNumber} · {item.materialDesc}</Text>
        </View>
        <View style={[styles.difotScore, { borderColor: color }]}>
          <Text style={[styles.difotScoreText, { color }]}>{difot}%</Text>
        </View>
      </View>
      <View style={styles.difotBar}>
        <View style={[styles.difotBarFill, { width: `${difot}%`, backgroundColor: color }]} />
      </View>
      <View style={styles.difotMeta}>
        <Text style={styles.difotMetaText}>SO: {item.soQty.toLocaleString()} · Billed: {item.billedQty.toLocaleString()}</Text>
        <Text style={[styles.difotCompany, { color: COLORS.primary }]}>{item.company}</Text>
      </View>
    </View>
  );
}

export default function RegulatoryMining() {
  const [search, setSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('All');
  const [selectedObs, setSelectedObs] = useState<typeof regulatoryData[0] | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'observations' | 'difot'>('observations');
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'frequency' | 'customer'>('frequency');

  const customers = ['All', ...new Set(regulatoryData.map(d => d.customerName))];

  const filtered = useMemo(() => {
    let items = regulatoryData;
    if (customerFilter !== 'All') items = items.filter(d => d.customerName === customerFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(d =>
        d.shortDescription.toLowerCase().includes(q) ||
        d.longDescription.toLowerCase().includes(q) ||
        d.referenceNumber.toLowerCase().includes(q) ||
        d.customerName.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'frequency') return [...items].sort((a, b) => b.frequency - a.frequency);
    return [...items].sort((a, b) => a.customerName.localeCompare(b.customerName));
  }, [search, customerFilter, sortBy]);

  const topObservations = [...regulatoryData].sort((a, b) => b.frequency - a.frequency).slice(0, 3);

  const themeGroups = useMemo(() => {
    const result: Record<string, typeof regulatoryData> = {};
    filtered.forEach(item => {
      const theme = Object.entries(THEME_CLUSTERS).find(([, items]) => items.includes(item.shortDescription))?.[0] || 'Other';
      if (!result[theme]) result[theme] = [];
      result[theme].push(item);
    });
    return Object.entries(result).sort(([, a], [, b]) =>
      b.reduce((s, d) => s + d.frequency, 0) - a.reduce((s, d) => s + d.frequency, 0)
    );
  }, [filtered]);

  const avgDifot = customerViewData.reduce((s, d) => s + d.difotPercent, 0) / customerViewData.length;
  const below95 = customerViewData.filter(d => d.difotPercent < 95).length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentPad}>
          <LinearGradient colors={[COLORS.primaryDark, COLORS.primary, '#4a8f55']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
            <Text style={styles.headerTitle}>Regulatory Mining</Text>
            <Text style={styles.headerSub}>{regulatoryData.length} observations · {customers.length - 1} customers</Text>
            <View style={styles.headerGoldLine} />
          </LinearGradient>

          <View style={styles.alertStrip}>
            <ShieldAlert size={14} color={COLORS.warning} />
            <Text style={styles.alertText}>
              Top risk: <Text style={{ fontFamily: 'Poppins-SemiBold', color: COLORS.error }}>OOS Investigation</Text> — 15 occurrences
            </Text>
          </View>

          <View style={styles.tabRow}>
            {[
              { key: 'observations', label: `Observations (${regulatoryData.length})` },
              { key: 'difot', label: `DIFOT (${customerViewData.length})` },
            ].map(t => (
              <TouchableOpacity
                key={t.key}
                style={[styles.tab, activeTab === t.key && styles.tabActive]}
                onPress={() => setActiveTab(t.key as any)}
              >
                <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 'observations' && (
            <>
              <View style={styles.searchBar}>
                <Search size={14} color={COLORS.gray500} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search observations, references..."
                  placeholderTextColor={COLORS.gray400}
                  value={search}
                  onChangeText={setSearch}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <X size={14} color={COLORS.gray400} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.filterBar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
                  <Text style={styles.filterLabel}>Customer:</Text>
                  {customers.map(c => (
                    <FilterChip key={c} label={c === 'All' ? 'All' : c.split(' ').slice(0, 2).join(' ')} active={customerFilter === c} onPress={() => setCustomerFilter(c)} />
                  ))}
                </ScrollView>
              </View>

              <View style={styles.sortRow}>
                <Text style={styles.sortLabel}>Sort:</Text>
                {[
                  { key: 'frequency', label: 'By Frequency' },
                  { key: 'customer', label: 'By Customer' },
                ].map(s => (
                  <TouchableOpacity
                    key={s.key}
                    style={[styles.sortBtn, sortBy === s.key && styles.sortBtnActive]}
                    onPress={() => setSortBy(s.key as any)}
                  >
                    <Text style={[styles.sortBtnText, sortBy === s.key && styles.sortBtnTextActive]}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {activeTab === 'difot' && (
            <View style={styles.difotSummary}>
            <View style={styles.difotSumKpi}>
              <Text style={[styles.difotSumValue, { color: avgDifot >= 95 ? COLORS.success : COLORS.warning }]}>{avgDifot.toFixed(1)}%</Text>
              <Text style={styles.difotSumLabel}>Avg DIFOT</Text>
            </View>
            <View style={styles.difotSumKpi}>
              <Text style={[styles.difotSumValue, { color: below95 > 0 ? COLORS.error : COLORS.success }]}>{below95}</Text>
              <Text style={styles.difotSumLabel}>Below 95%</Text>
            </View>
            <View style={styles.difotSumKpi}>
              <Text style={[styles.difotSumValue, { color: COLORS.primary }]}>{customerViewData.length}</Text>
              <Text style={styles.difotSumLabel}>Customers</Text>
            </View>
          </View>
          )}

          {activeTab === 'observations' && (
            <View style={{ paddingHorizontal: 16 }}>
              <SectionHeader title="Top Recurring Risks" subtitle="By Frequency" accent={COLORS.error} />
              <View style={styles.topRisksRow}>
                {topObservations.map((obs, i) => (
                  <TouchableOpacity
                    key={obs.referenceNumber}
                    style={[styles.topRiskCard, i === 0 && { borderColor: COLORS.error + '60' }]}
                    onPress={() => { setSelectedObs(obs); setDrawerVisible(true); }}
                    activeOpacity={0.8}
                  >
                    {i === 0 && <View style={styles.topRiskCrown}><Text style={{ fontSize: 10 }}>🔥</Text></View>}
                    <Text style={[styles.topRiskFreq, { color: i === 0 ? COLORS.error : i === 1 ? COLORS.warning : COLORS.primary }]}>{obs.frequency}</Text>
                    <Text style={styles.topRiskLabel}>{obs.shortDescription}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <SectionHeader title="Theme Clusters" subtitle={`${filtered.length} total observations`} accent={COLORS.primary} />
              {themeGroups.map(([theme, items]) => {
                const totalFreq = items.reduce((s, d) => s + d.frequency, 0);
                const isExpanded = expandedTheme === theme;
                return (
                  <View key={theme} style={styles.themeBlock}>
                    <TouchableOpacity
                      style={styles.themeHeader}
                      onPress={() => setExpandedTheme(isExpanded ? null : theme)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.themeHeaderLeft}>
                        <Text style={styles.themeTitle}>{theme}</Text>
                        <Text style={styles.themeSub}>{items.length} observations</Text>
                      </View>
                      <View style={styles.themeHeaderRight}>
                        <View style={styles.themeFreqBadge}>
                          <Text style={styles.themeFreqText}>Σ {totalFreq}</Text>
                        </View>
                        {isExpanded ? <ChevronUp size={16} color={COLORS.gray500} /> : <ChevronDown size={16} color={COLORS.gray500} />}
                      </View>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.themeItems}>
                        {items.map(obs => (
                          <ObservationCard
                            key={obs.referenceNumber}
                            item={obs}
                            onPress={() => { setSelectedObs(obs); setDrawerVisible(true); }}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}

              {expandedTheme === null && (
                <>
                  <SectionHeader title="All Observations" subtitle="Sorted by frequency" accent={COLORS.primary} />
                  {filtered.map(obs => (
                    <ObservationCard
                      key={obs.referenceNumber}
                      item={obs}
                      onPress={() => { setSelectedObs(obs); setDrawerVisible(true); }}
                    />
                  ))}
                </>
              )}
            </View>
          )}

          {activeTab === 'difot' && (
            <View style={{ paddingHorizontal: 16 }}>
              <SectionHeader title="Customer DIFOT Performance" subtitle="Delivery In Full On Time" accent={COLORS.success} />
              {customerViewData
                .sort((a, b) => a.difotPercent - b.difotPercent)
                .map((item, i) => (
                  <DIFOTCard key={i} item={item} />
                ))}
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>

      {selectedObs && (
        <DrawerModal
          visible={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          title={selectedObs.shortDescription}
        >
          <View>
            <View style={styles.obsDetailTop}>
              <View>
                <Text style={styles.obsDetailRef}>{selectedObs.referenceNumber}</Text>
                <Text style={styles.obsDetailCustomer}>{selectedObs.customerName}</Text>
              </View>
              <View style={styles.obsDetailFreq}>
                <Text style={styles.obsDetailFreqNum}>{selectedObs.frequency}</Text>
                <Text style={styles.obsDetailFreqLabel}>occurrences</Text>
              </View>
            </View>

            <Text style={styles.drawerSectionTitle}>Short Description</Text>
            <View style={styles.descBlock}>
              <Text style={styles.descText}>{selectedObs.shortDescription}</Text>
            </View>

            <Text style={styles.drawerSectionTitle}>Detailed Description</Text>
            <View style={styles.descBlock}>
              <Text style={styles.descLongText}>{selectedObs.longDescription}</Text>
            </View>

            <Text style={styles.drawerSectionTitle}>Theme Classification</Text>
            {(() => {
              const theme = Object.entries(THEME_CLUSTERS).find(([, items]) => items.includes(selectedObs.shortDescription))?.[0] || 'Other';
              return (
                <View style={styles.themeClassBlock}>
                  <Text style={styles.themeClassName}>{theme}</Text>
                  <Text style={styles.themeClassSub}>
                    Related: {THEME_CLUSTERS[theme]?.join(', ') || 'N/A'}
                  </Text>
                </View>
              );
            })()}

            <Text style={styles.drawerSectionTitle}>Risk Assessment</Text>
            <View style={styles.riskAssessGrid}>
              {[
                { label: 'Frequency', value: selectedObs.frequency.toString(), color: selectedObs.frequency >= 12 ? COLORS.error : selectedObs.frequency >= 8 ? COLORS.warning : COLORS.success },
                { label: 'Risk Level', value: selectedObs.frequency >= 12 ? 'High' : selectedObs.frequency >= 8 ? 'Medium' : 'Low', color: selectedObs.frequency >= 12 ? COLORS.error : selectedObs.frequency >= 8 ? COLORS.warning : COLORS.success },
              ].map(r => (
                <View key={r.label} style={styles.riskAssessItem}>
                  <Text style={[styles.riskAssessValue, { color: r.color }]}>{r.value}</Text>
                  <Text style={styles.riskAssessLabel}>{r.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </DrawerModal>
      )}
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
  alertStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.warning + '15',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.warning + '30',
  },
  alertText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: COLORS.dark },
  tabRow: { flexDirection: 'row', backgroundColor: COLORS.cream, paddingHorizontal: 16, paddingVertical: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', backgroundColor: COLORS.gray100 },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 12, fontFamily: 'Poppins-Medium', color: COLORS.gray600 },
  tabTextActive: { color: COLORS.white },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Poppins-Regular', color: COLORS.dark, padding: 0 },
  filterBar: { backgroundColor: COLORS.cream, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  filterContent: { paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center' },
  filterLabel: { fontSize: 11, fontFamily: 'Poppins-Medium', color: COLORS.gray500, marginRight: 4 },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.cream,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 8,
  },
  sortLabel: { fontSize: 11, fontFamily: 'Poppins-Medium', color: COLORS.gray500 },
  sortBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  sortBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  sortBtnText: { fontSize: 11, fontFamily: 'Poppins-Medium', color: COLORS.gray600 },
  sortBtnTextActive: { color: COLORS.white },
  difotSummary: { flexDirection: 'row', backgroundColor: COLORS.cream, paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  difotSumKpi: { flex: 1, alignItems: 'center' },
  difotSumValue: { fontSize: 18, fontFamily: 'Poppins-Bold' },
  difotSumLabel: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  content: { flex: 1, backgroundColor: COLORS.bg },
  contentPad: { paddingBottom: 24 },
  topRisksRow: { flexDirection: 'row', gap: 10, marginBottom: 16, marginHorizontal: 0 },
  topRiskCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topRiskCrown: { position: 'absolute', top: 6, right: 6 },
  topRiskFreq: { fontSize: 26, fontFamily: 'Poppins-Bold' },
  topRiskLabel: { fontSize: 10, fontFamily: 'Poppins-Medium', color: COLORS.dark, textAlign: 'center', marginTop: 4 },
  themeBlock: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  themeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  themeHeaderLeft: {},
  themeTitle: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  themeSub: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  themeHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  themeFreqBadge: { backgroundColor: COLORS.primary + '18', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  themeFreqText: { fontSize: 11, fontFamily: 'Poppins-Bold', color: COLORS.primary },
  themeItems: { paddingHorizontal: 12, paddingBottom: 12, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 8 },
  obsCard: {
    backgroundColor: COLORS.cream,
    borderRadius: 10,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 0,
    marginTop: 8,
  },
  obsFreqBar: { width: 5, position: 'absolute', left: 0, bottom: 0 },
  obsContent: { flex: 1, padding: 12, paddingLeft: 14 },
  obsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  obsTitleWrap: { flex: 1 },
  obsShort: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  obsRef: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500, marginTop: 1 },
  obsFreqWrap: { alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.border },
  obsFreqNum: { fontSize: 18, fontFamily: 'Poppins-Bold' },
  obsFreqLabel: { fontSize: 8, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  obsMeta: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' },
  obsThemeTag: { backgroundColor: COLORS.gray100, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  obsThemeText: { fontSize: 9, fontFamily: 'Poppins-Medium', color: COLORS.gray600 },
  obsCustomer: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  difotCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  difotTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  difotCustomer: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  difotSo: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  difotScore: { borderRadius: 8, borderWidth: 2, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' },
  difotScoreText: { fontSize: 15, fontFamily: 'Poppins-Bold' },
  difotBar: { height: 6, backgroundColor: COLORS.gray100, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  difotBarFill: { height: 6, borderRadius: 3 },
  difotMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  difotMetaText: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  difotCompany: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  obsDetailTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 14,
    backgroundColor: COLORS.cream,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  obsDetailRef: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: COLORS.primary, marginBottom: 4 },
  obsDetailCustomer: { fontSize: 13, fontFamily: 'Poppins-Regular', color: COLORS.dark },
  obsDetailFreq: { alignItems: 'center' },
  obsDetailFreqNum: { fontSize: 32, fontFamily: 'Poppins-Bold', color: COLORS.error },
  obsDetailFreqLabel: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  drawerSectionTitle: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark, marginTop: 16, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 6 },
  descBlock: { backgroundColor: COLORS.cream, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  descText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  descLongText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: COLORS.dark, lineHeight: 20 },
  themeClassBlock: { backgroundColor: COLORS.cream, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  themeClassName: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: COLORS.primary, marginBottom: 4 },
  themeClassSub: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  riskAssessGrid: { flexDirection: 'row', gap: 8 },
  riskAssessItem: { flex: 1, backgroundColor: COLORS.cream, borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  riskAssessValue: { fontSize: 22, fontFamily: 'Poppins-Bold', marginBottom: 4 },
  riskAssessLabel: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
});
