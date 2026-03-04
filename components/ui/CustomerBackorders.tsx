import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Search, X, AlertTriangle, Clock } from 'lucide-react-native';
import { COLORS, COMPANY_COLORS, BACKORDERS } from '@/data/mockData';

const COMPANIES = ['All', 'Strides', 'Instapill', 'One Source', 'Naari', 'Solara'];

function fmt(v: number) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

function delayColor(days: number) {
  if (days >= 45) return COLORS.error;
  if (days >= 25) return COLORS.warning;
  return '#4a90a4';
}

export default function CustomerBackorders() {
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [sortBy, setSortBy] = useState<'delay' | 'qty' | 'date'>('delay');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let items = BACKORDERS;
    if (selectedCompany !== 'All') items = items.filter(b => b.company === selectedCompany);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(b =>
        b.customerName.toLowerCase().includes(q) ||
        b.materialDesc.toLowerCase().includes(q) ||
        b.soNumber.toLowerCase().includes(q) ||
        b.reason.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'delay') return [...items].sort((a, b) => b.delayDays - a.delayDays);
    if (sortBy === 'qty') return [...items].sort((a, b) => b.pendingQty - a.pendingQty);
    return [...items].sort((a, b) => a.revisedDeliveryDate.localeCompare(b.revisedDeliveryDate));
  }, [search, selectedCompany, sortBy]);

  const totalPendingQty = filtered.reduce((s, b) => s + b.pendingQty, 0);
  const avgDelay = filtered.length > 0 ? filtered.reduce((s, b) => s + b.delayDays, 0) / filtered.length : 0;
  const criticalCount = filtered.filter(b => b.delayDays >= 45).length;

  const companyGroups = useMemo(() => {
    const map: Record<string, typeof BACKORDERS> = {};
    BACKORDERS.forEach(b => { if (!map[b.company]) map[b.company] = []; map[b.company].push(b); });
    return map;
  }, []);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={14} color={COLORS.gray500} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders, customers, materials..."
            placeholderTextColor={COLORS.gray400}
            value={search} onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={13} color={COLORS.gray400} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.companyScroll}>
        <View style={styles.chipRow}>
          {COMPANIES.map(c => (
            <TouchableOpacity
              key={c} activeOpacity={0.8}
              style={[styles.chip, selectedCompany === c && { backgroundColor: COMPANY_COLORS[c] || COLORS.primary, borderColor: COMPANY_COLORS[c] || COLORS.primary }]}
              onPress={() => setSelectedCompany(c)}
            >
              <Text style={[styles.chipText, selectedCompany === c && styles.chipActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.kpiRow}>
        <View style={[styles.kpi, { borderLeftColor: COLORS.error }]}>
          <AlertTriangle size={14} color={COLORS.error} />
          <Text style={styles.kpiLabel}>Critical ≥45d</Text>
          <Text style={[styles.kpiVal, { color: COLORS.error }]}>{criticalCount}</Text>
        </View>
        <View style={[styles.kpi, { borderLeftColor: COLORS.warning }]}>
          <Clock size={14} color={COLORS.warning} />
          <Text style={styles.kpiLabel}>Avg Delay</Text>
          <Text style={[styles.kpiVal, { color: COLORS.warning }]}>{avgDelay.toFixed(0)}d</Text>
        </View>
        <View style={[styles.kpi, { borderLeftColor: COLORS.info }]}>
          <Text style={styles.kpiLabel}>Pending Qty</Text>
          <Text style={[styles.kpiVal, { color: COLORS.info }]}>{totalPendingQty.toLocaleString()}</Text>
        </View>
        <View style={[styles.kpi, { borderLeftColor: COLORS.success }]}>
          <Text style={styles.kpiLabel}>Orders</Text>
          <Text style={[styles.kpiVal, { color: COLORS.success }]}>{filtered.length}</Text>
        </View>
      </View>

      <View style={styles.companyBars}>
        {Object.entries(companyGroups).map(([company, orders]) => {
          const color = COMPANY_COLORS[company] || COLORS.primary;
          const totalPend = orders.reduce((s, b) => s + b.pendingQty, 0);
          const maxQty = Math.max(...Object.values(companyGroups).map(g => g.reduce((s, b) => s + b.pendingQty, 0)));
          return (
            <TouchableOpacity
              key={company} activeOpacity={0.8}
              style={[styles.companyBar, selectedCompany === company && { backgroundColor: color + '10', borderColor: color + '40' }]}
              onPress={() => setSelectedCompany(selectedCompany === company ? 'All' : company)}
            >
              <Text style={[styles.companyName, { color }]}>{company}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${(totalPend / maxQty) * 100}%`, backgroundColor: color }]} />
              </View>
              <Text style={[styles.barQty, { color }]}>{totalPend.toLocaleString()}</Text>
              <View style={[styles.countBadge, { backgroundColor: color + '18' }]}>
                <Text style={[styles.countText, { color }]}>{orders.length}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {(['delay', 'qty', 'date'] as const).map(s => (
          <TouchableOpacity key={s} style={[styles.sortBtn, sortBy === s && styles.sortBtnActive]} onPress={() => setSortBy(s)}>
            <Text style={[styles.sortText, sortBy === s && styles.sortTextActive]}>
              {s === 'delay' ? 'Delay' : s === 'qty' ? 'Pending Qty' : 'ETA'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.map((b, i) => {
        const dc = delayColor(b.delayDays);
        const pct = Math.round((b.billedQty / b.soQty) * 100);
        const expanded = expandedRow === b.soNumber;
        const cc = COMPANY_COLORS[b.company] || COLORS.primary;
        return (
          <TouchableOpacity
            key={b.soNumber} activeOpacity={0.92}
            style={[styles.card, { borderLeftColor: dc }]}
            onPress={() => setExpandedRow(expanded ? null : b.soNumber)}
          >
            <View style={styles.cardTop}>
              <View style={styles.cardLeft}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.soNum}>{b.soNumber}</Text>
                  <View style={[styles.delayBadge, { backgroundColor: dc + '18', borderColor: dc + '40' }]}>
                    <Text style={[styles.delayText, { color: dc }]}>+{b.delayDays}d delay</Text>
                  </View>
                </View>
                <Text style={styles.custName}>{b.customerName}</Text>
                <Text style={styles.matName} numberOfLines={1}>{b.materialDesc}</Text>
              </View>
              <View style={styles.cardRight}>
                <View style={[styles.compTag, { backgroundColor: cc + '18' }]}>
                  <Text style={[styles.compTagText, { color: cc }]}>{b.company}</Text>
                </View>
                <Text style={styles.pendQty}>{b.pendingQty.toLocaleString()} pending</Text>
              </View>
            </View>
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: pct >= 80 ? COLORS.success : pct >= 50 ? COLORS.warning : COLORS.error }]} />
              </View>
              <Text style={styles.progressText}>{pct}% billed</Text>
            </View>
            {expanded && (
              <View style={styles.expandSection}>
                <View style={styles.expandGrid}>
                  {[
                    { label: 'Original ETA', value: b.originalDeliveryDate },
                    { label: 'Revised ETA', value: b.revisedDeliveryDate },
                    { label: 'SO Qty', value: b.soQty.toLocaleString() },
                    { label: 'Billed Qty', value: b.billedQty.toLocaleString() },
                    { label: 'Pending Qty', value: b.pendingQty.toLocaleString() },
                    { label: 'Plant', value: b.plant },
                  ].map(({ label, value }) => (
                    <View key={label} style={styles.expandItem}>
                      <Text style={styles.expandLabel}>{label}</Text>
                      <Text style={styles.expandValue}>{value}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.reasonBox}>
                  <Text style={styles.reasonLabel}>DELAY REASON</Text>
                  <Text style={styles.reasonText}>{b.reason}</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
      {filtered.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No backorders match your filters</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 14, paddingBottom: 32, gap: 10 },
  searchRow: { marginBottom: 2 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, gap: 8, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, fontSize: 13, fontFamily: 'Poppins-Regular', color: COLORS.dark, padding: 0 },
  companyScroll: { maxHeight: 40 },
  chipRow: { flexDirection: 'row', gap: 6, paddingVertical: 2 },
  chip: { borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: COLORS.white },
  chipText: { fontSize: 11, fontFamily: 'Poppins-Medium', color: COLORS.gray700 },
  chipActive: { color: COLORS.white },
  kpiRow: { flexDirection: 'row', gap: 6 },
  kpi: { flex: 1, backgroundColor: COLORS.white, borderRadius: 10, padding: 8, borderLeftWidth: 3, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', gap: 2 },
  kpiLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500, textAlign: 'center' },
  kpiVal: { fontSize: 15, fontFamily: 'Poppins-Bold' },
  companyBars: { backgroundColor: COLORS.white, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  companyBar: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 8, padding: 6, borderWidth: 1, borderColor: 'transparent' },
  companyName: { width: 80, fontSize: 11, fontFamily: 'Poppins-SemiBold' },
  barTrack: { flex: 1, height: 8, backgroundColor: COLORS.gray100, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  barQty: { fontSize: 10, fontFamily: 'Poppins-SemiBold', width: 52, textAlign: 'right' },
  countBadge: { borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  countText: { fontSize: 10, fontFamily: 'Poppins-Bold' },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sortLabel: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: COLORS.gray500 },
  sortBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  sortBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  sortText: { fontSize: 11, fontFamily: 'Poppins-Medium', color: COLORS.gray600 },
  sortTextActive: { color: COLORS.white },
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 12, borderLeftWidth: 4, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLeft: { flex: 1, gap: 2 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  soNum: { fontSize: 12, fontFamily: 'Poppins-Bold', color: COLORS.dark },
  delayBadge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 1 },
  delayText: { fontSize: 10, fontFamily: 'Poppins-Bold' },
  custName: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  matName: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  compTag: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  compTagText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  pendQty: { fontSize: 10, fontFamily: 'Poppins-Medium', color: COLORS.gray500 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack: { flex: 1, height: 5, backgroundColor: COLORS.gray100, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 5, borderRadius: 3 },
  progressText: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: COLORS.gray600, width: 60, textAlign: 'right' },
  expandSection: { gap: 8, paddingTop: 4, borderTopWidth: 1, borderTopColor: COLORS.border },
  expandGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  expandItem: { width: '46%', backgroundColor: COLORS.bg, borderRadius: 8, padding: 8, borderWidth: 1, borderColor: COLORS.border },
  expandLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500, textTransform: 'uppercase', marginBottom: 2 },
  expandValue: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  reasonBox: { backgroundColor: COLORS.error + '08', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: COLORS.error + '30' },
  reasonLabel: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: COLORS.error, textTransform: 'uppercase', marginBottom: 3 },
  reasonText: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.dark },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: COLORS.gray400 },
});
