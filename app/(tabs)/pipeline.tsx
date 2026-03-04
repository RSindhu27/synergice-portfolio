import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, useWindowDimensions,
} from 'react-native';
import { Activity, AlertTriangle, TrendingUp, Clock, ChevronRight, Flame } from 'lucide-react-native';
import { COLORS, rdData, goLanzarData } from '@/data/mockData';
import { LinearGradient } from 'expo-linear-gradient';
import DrawerModal from '@/components/ui/DrawerModal';
import StatusBadge from '@/components/ui/StatusBadge';
import SectionHeader from '@/components/ui/SectionHeader';
import FilterChip from '@/components/ui/FilterChip';

function formatCurrency(v: number) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

const STATUS_TYPE: Record<string, 'error' | 'warning' | 'info' | 'success' | 'neutral'> = {
  'Phase I': 'info',
  'Phase II': 'info',
  'Phase III': 'warning',
  'Submission': 'warning',
  'Approval': 'primary' as any,
  'Launch Ready': 'success',
  'Pre-Launch': 'success',
  'Launch Prep': 'success',
  'Launched': 'success',
  'Development': 'info',
};

const PRIORITY_TYPE: Record<string, any> = {
  Critical: 'error',
  High: 'warning',
  Medium: 'info',
  Low: 'neutral',
};

function PipelineCard({ item, onPress, source }: { item: any; onPress: () => void; source: string }) {
  const today = new Date();
  const due = new Date(item.dueDate);
  const isOverdue = due < today && item.currentPhase !== 'Launched';
  const isAtRisk = isOverdue || item.gm < 55 || (item.totalProjectCost > 2000000 && item.totalRevenue < 10000000);

  const companyColors: Record<string, string> = {
    Strides: COLORS.primary, Instapill: COLORS.success, 'One Source': COLORS.primaryDark, Naari: COLORS.accentDark, Solara: COLORS.primaryLight,
  };
  const color = companyColors[item.company] || COLORS.primary;

  return (
    <TouchableOpacity style={[styles.pipeCard, isAtRisk && styles.pipeCardRisk]} onPress={onPress} activeOpacity={0.8}>
      {isAtRisk && (
        <View style={styles.riskBadgeWrap}>
          <AlertTriangle size={10} color={COLORS.error} />
          <Text style={styles.riskBadgeText}>At Risk</Text>
        </View>
      )}
      <View style={styles.pipeCardTop}>
        <View style={styles.pipeCardTitleWrap}>
          <Text style={styles.pipeCardTitle} numberOfLines={2}>{item.summary}</Text>
          <View style={{ flexDirection: 'row', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
            <StatusBadge label={item.priority} type={PRIORITY_TYPE[item.priority] || 'neutral'} size="sm" />
            <StatusBadge label={source} type="neutral" size="sm" />
          </View>
        </View>
        <View style={[styles.pipePhase, { backgroundColor: color + '18' }]}>
          <Text style={[styles.pipePhaseText, { color }]}>{item.currentPhase}</Text>
        </View>
      </View>

      <View style={styles.pipeMoleculeRow}>
        <Text style={styles.pipeMolecule}>{item.molecule}</Text>
        <Text style={styles.pipeDosage}>{item.dosageForm} · {item.strength}</Text>
      </View>

      <View style={styles.pipeMetaRow}>
        <View style={styles.pipeMeta}>
          <Clock size={10} color={isOverdue ? COLORS.error : COLORS.gray500} />
          <Text style={[styles.pipeMetaText, isOverdue && { color: COLORS.error }]}>
            {item.endMonthYear}
          </Text>
        </View>
        <View style={styles.pipeMeta}>
          <Text style={styles.pipeMetaLabel}>Rev: </Text>
          <Text style={[styles.pipeMetaText, { color: COLORS.success }]}>{item.valueInMn ? `${item.valueInMn}Mn` : formatCurrency(item.totalRevenue)}</Text>
        </View>
        <View style={styles.pipeMeta}>
          <Text style={styles.pipeMetaLabel}>GM: </Text>
          <Text style={[styles.pipeMetaText, { color: item.gm >= 60 ? COLORS.success : item.gm >= 50 ? COLORS.warning : COLORS.error }]}>{item.gm}%</Text>
        </View>
      </View>

      <View style={styles.pipeFooter}>
        <View style={[styles.companyBadge, { backgroundColor: color + '15' }]}>
          <Text style={[styles.companyBadgeText, { color }]}>{item.company}</Text>
        </View>
        <View style={styles.pipeFooterRight}>
          <Text style={styles.pipeRefMkt}>{item.referenceMarket}</Text>
          {item.beStudyRequired === 'Yes' && <StatusBadge label="BE Required" type="warning" size="sm" />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const QUARTER_GROUPS = [
  { label: 'Q4 2024', months: ['Oct 2024', 'Nov 2024', 'Dec 2024'] },
  { label: 'Q1 2025', months: ['Jan 2025', 'Feb 2025', 'Mar 2025'] },
  { label: 'Q2 2025', months: ['Apr 2025', 'May 2025', 'Jun 2025'] },
  { label: 'Q3 2025', months: ['Jul 2025', 'Aug 2025', 'Sep 2025'] },
  { label: 'Q4 2025 +', months: ['Oct 2025', 'Nov 2025', 'Dec 2025'] },
  { label: 'Launched', months: [] },
];

export default function PipelineLaunches() {
  const { width: screenWidth } = useWindowDimensions();
  const isTablet = screenWidth >= 768;
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [phaseFilter, setPhaseFilter] = useState('All');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeView, setActiveView] = useState<'timeline' | 'risk'>('timeline');

  const allItems = useMemo(() => [
    ...rdData.map(d => ({ ...d, source: 'R&D' })),
    ...goLanzarData.map(d => ({ ...d, source: 'Go-Lanzar' })),
  ], []);

  const filtered = useMemo(() => {
    let items = allItems;
    if (priorityFilter !== 'All') items = items.filter(d => d.priority === priorityFilter);
    if (phaseFilter !== 'All') items = items.filter(d => d.currentPhase === phaseFilter);
    if (companyFilter !== 'All') items = items.filter(d => d.company === companyFilter);
    return items;
  }, [allItems, priorityFilter, phaseFilter, companyFilter]);

  const atRisk = useMemo(() => {
    const today = new Date();
    return filtered.filter(item => {
      const due = new Date(item.dueDate);
      const isOverdue = due < today && item.currentPhase !== 'Launched';
      const lowGM = item.gm < 55;
      const highCostLowRev = item.totalProjectCost > 2000000 && item.totalRevenue < 10000000;
      return isOverdue || lowGM || highCostLowRev;
    });
  }, [filtered]);

  const totalPipelineValue = filtered.reduce((s, d) => s + d.totalRevenue, 0);
  const avgGM = filtered.length > 0 ? filtered.reduce((s, d) => s + d.gm, 0) / filtered.length : 0;

  const openDetail = (item: any) => {
    setSelectedItem(item);
    setDrawerVisible(true);
  };

  const phases = ['All', ...new Set(allItems.map(d => d.currentPhase))];
  const companies = ['All', 'Strides', 'Instapill', 'One Source', 'Naari', 'Solara'];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentPad}>
          <LinearGradient colors={[COLORS.primaryDark, COLORS.primary, '#4a8f55']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
            <Text style={styles.headerTitle}>Launches & Pipeline</Text>
            <Text style={styles.headerSub}>{allItems.length} projects · R&D + Go-Lanzar</Text>
            <View style={styles.headerGoldLine} />
          </LinearGradient>

          <View style={styles.kpiStrip}>
            {[
              { label: 'Pipeline Value', value: formatCurrency(totalPipelineValue), color: COLORS.success },
              { label: 'Avg GM%', value: `${avgGM.toFixed(1)}%`, color: COLORS.primary },
              { label: 'At Risk', value: atRisk.length.toString(), color: COLORS.error },
              { label: 'Active', value: filtered.length.toString(), color: COLORS.info },
            ].map(k => (
              <View key={k.label} style={styles.kpiItem}>
                <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
                <Text style={styles.kpiLabel}>{k.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.viewToggleRow}>
            <TouchableOpacity
              style={[styles.viewBtn, activeView === 'timeline' && styles.viewBtnActive]}
              onPress={() => setActiveView('timeline')}
            >
              <Activity size={13} color={activeView === 'timeline' ? COLORS.white : COLORS.gray600} />
              <Text style={[styles.viewBtnText, activeView === 'timeline' && styles.viewBtnTextActive]}>Timeline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewBtn, activeView === 'risk' && styles.viewBtnActive, { borderColor: COLORS.error }]}
              onPress={() => setActiveView('risk')}
            >
              <Flame size={13} color={activeView === 'risk' ? COLORS.white : COLORS.error} />
              <Text style={[styles.viewBtnText, activeView === 'risk' && styles.viewBtnTextActive, { color: activeView === 'risk' ? COLORS.white : COLORS.error }]}>
                At Risk ({atRisk.length})
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
              <Text style={styles.filterLabel}>Priority:</Text>
              {['All', 'Critical', 'High', 'Medium', 'Low'].map(p => (
                <FilterChip key={p} label={p} active={priorityFilter === p} onPress={() => setPriorityFilter(p)}
                  color={p === 'Critical' ? COLORS.error : p === 'High' ? COLORS.warning : COLORS.primary} />
              ))}
            </ScrollView>
          </View>

          <View style={[styles.filterBar, { marginBottom: 8 }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
              <Text style={styles.filterLabel}>Company:</Text>
              {companies.map(c => (
                <FilterChip key={c} label={c} active={companyFilter === c} onPress={() => setCompanyFilter(c)} />
              ))}
            </ScrollView>
          </View>
          {activeView === 'risk' ? (
            <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
              <SectionHeader title="At-Risk Projects" subtitle="Overdue / Low GM / High Cost" accent={COLORS.error} />
              {atRisk.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No at-risk projects with current filters</Text>
                </View>
              ) : (
                atRisk.map((item, i) => (
                  <PipelineCard key={i} item={item} source={(item as any).source} onPress={() => openDetail(item)} />
                ))
              )}
            </View>
          ) : (
            QUARTER_GROUPS.map(qg => {
              const items = qg.label === 'Launched'
                ? filtered.filter(d => d.currentPhase === 'Launched')
                : filtered.filter(d => qg.months.some(m => (d.endMonthYear || '').includes(m)));

              if (items.length === 0) return null;

              return (
                <View key={qg.label} style={styles.quarterGroup}>
                  <View style={styles.quarterHeader}>
                    <Text style={styles.quarterLabel}>{qg.label}</Text>
                    <View style={styles.quarterBadge}>
                      <Text style={styles.quarterBadgeText}>{items.length} projects</Text>
                    </View>
                    <Text style={styles.quarterValue}>
                      {formatCurrency(items.reduce((s, d) => s + d.totalRevenue, 0))}
                    </Text>
                  </View>
                  <View style={[styles.quarterItems, isTablet && { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }]}>
                    {items.map((item, i) => (
                      <View key={i} style={isTablet ? { width: '48%' } : {}}>
                        <PipelineCard item={item} source={(item as any).source} onPress={() => openDetail(item)} />
                      </View>
                    ))}
                  </View>
                </View>
              );
            })
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      </View>

      <DrawerModal
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        title={selectedItem?.summary || 'Project Detail'}
      >
        {selectedItem && (
          <View>
            <View style={styles.detailHero}>
              <StatusBadge label={selectedItem.priority} type={PRIORITY_TYPE[selectedItem.priority]} />
              <StatusBadge label={selectedItem.currentPhase} type={STATUS_TYPE[selectedItem.currentPhase] || 'info'} />
              <StatusBadge label={(selectedItem as any).source} type="neutral" />
            </View>

            <View style={styles.detailGrid}>
              {[
                { label: 'Molecule', value: selectedItem.molecule },
                { label: 'Strength', value: selectedItem.strength },
                { label: 'Dosage Form', value: selectedItem.dosageForm },
                { label: 'Pack Size', value: selectedItem.packSize },
                { label: 'Category', value: selectedItem.category },
                { label: 'Company', value: selectedItem.company },
                { label: 'Plant', value: selectedItem.plant },
                { label: 'Market', value: selectedItem.referenceMarket },
                { label: 'Tender/Retail', value: selectedItem.tenderRetail },
                { label: 'BE Study', value: selectedItem.beStudyRequired },
                { label: 'Start Date', value: selectedItem.startDate },
                { label: 'Due Date', value: selectedItem.dueDate },
              ].map(({ label, value }) => (
                <View key={label} style={styles.detailItem}>
                  <Text style={styles.detailLabel}>{label}</Text>
                  <Text style={styles.detailValue}>{value}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.drawerSectionTitle}>Financial Summary</Text>
            <View style={styles.finRow}>
              {[
                { label: 'Total Revenue', value: formatCurrency(selectedItem.totalRevenue), color: COLORS.success },
                { label: 'Project Cost', value: formatCurrency(selectedItem.totalProjectCost), color: COLORS.error },
                { label: 'Gross Margin', value: `${selectedItem.gm}%`, color: selectedItem.gm >= 60 ? COLORS.success : COLORS.warning },
                { label: 'Value (Mn)', value: `${selectedItem.valueInMn}Mn`, color: COLORS.primary },
              ].map(f => (
                <View key={f.label} style={styles.finItem}>
                  <Text style={[styles.finValue, { color: f.color }]}>{f.value}</Text>
                  <Text style={styles.finLabel}>{f.label}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.drawerSectionTitle}>Current Status</Text>
            <View style={styles.statusBlock}>
              <Text style={styles.statusCategory}>{selectedItem.currentStatusCategory}</Text>
              <Text style={styles.statusCurrent}>{selectedItem.currentStatus}</Text>
            </View>
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
  kpiValue: { fontSize: 14, fontFamily: 'Poppins-Bold' },
  kpiLabel: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500, textAlign: 'center' },
  viewToggleRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  viewBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  viewBtnText: { fontSize: 12, fontFamily: 'Poppins-Medium', color: COLORS.gray600 },
  viewBtnTextActive: { color: COLORS.white },
  filterBar: {
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 0,
  },
  filterContent: { paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center' },
  filterLabel: { fontSize: 11, fontFamily: 'Poppins-Medium', color: COLORS.gray500, marginRight: 4, alignSelf: 'center' },
  content: { flex: 1, backgroundColor: COLORS.bg },
  contentPad: { paddingBottom: 24 },
  quarterGroup: { marginBottom: 20, paddingHorizontal: 16, marginTop: 12 },
  quarterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary + '30',
  },
  quarterLabel: { fontSize: 14, fontFamily: 'Poppins-Bold', color: COLORS.dark },
  quarterBadge: { backgroundColor: COLORS.primary + '18', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  quarterBadgeText: { fontSize: 10, fontFamily: 'Poppins-Medium', color: COLORS.primary },
  quarterValue: { marginLeft: 'auto' as any, fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.success },
  quarterItems: { gap: 8 },
  pipeCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pipeCardRisk: { borderColor: COLORS.error + '60', borderWidth: 1.5 },
  riskBadgeWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  riskBadgeText: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: COLORS.error },
  pipeCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  pipeCardTitleWrap: { flex: 1 },
  pipeCardTitle: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  pipePhase: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  pipePhaseText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  pipeMoleculeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  pipeMolecule: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  pipeDosage: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  pipeMetaRow: { flexDirection: 'row', gap: 10, marginBottom: 8, flexWrap: 'wrap' },
  pipeMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  pipeMetaLabel: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  pipeMetaText: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  pipeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  companyBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  companyBadgeText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  pipeFooterRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pipeRefMkt: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  emptyState: { padding: 30, alignItems: 'center' },
  emptyText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: COLORS.gray400 },
  detailHero: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 16 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  detailItem: {
    width: '47%',
    backgroundColor: COLORS.cream,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500, marginBottom: 2 },
  detailValue: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  drawerSectionTitle: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark, marginTop: 16, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 6 },
  finRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  finItem: { flex: 1, minWidth: 80, backgroundColor: COLORS.cream, borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  finValue: { fontSize: 15, fontFamily: 'Poppins-Bold' },
  finLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500, textAlign: 'center' },
  statusBlock: { backgroundColor: COLORS.cream, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  statusCategory: { fontSize: 11, fontFamily: 'Poppins-Medium', color: COLORS.gray500, marginBottom: 4 },
  statusCurrent: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
});
