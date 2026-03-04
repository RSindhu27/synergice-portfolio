import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Search, X, Calendar, Package, TrendingUp } from 'lucide-react-native';
import { COLORS, COMPANY_COLORS, UPCOMING_ORDERS } from '@/data/mockData';

const COMPANIES = ['All', 'Strides', 'Instapill', 'One Source', 'Naari', 'Solara'];
const STATUSES = ['All', 'Confirmed', 'In Production', 'QC Testing', 'Packing'];
const PRIORITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];

function fmtRev(v: number) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

function priorityColor(p: string) {
  if (p === 'Critical') return COLORS.error;
  if (p === 'High') return COLORS.warning;
  if (p === 'Medium') return COLORS.info;
  return COLORS.success;
}

function statusColor(s: string) {
  if (s === 'Confirmed') return COLORS.success;
  if (s === 'In Production') return '#df6d14';
  if (s === 'QC Testing') return COLORS.info;
  if (s === 'Packing') return '#8a5fa8';
  return COLORS.gray500;
}

function daysUntil(dateStr: string) {
  const today = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function CustomerUpcomingOrders() {
  const [search, setSearch] = useState('');
  const [company, setCompany] = useState('All');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const filtered = useMemo(() => {
    let items = UPCOMING_ORDERS;
    if (company !== 'All') items = items.filter(o => o.company === company);
    if (status !== 'All') items = items.filter(o => o.status === status);
    if (priority !== 'All') items = items.filter(o => o.priority === priority);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(o =>
        o.customerName.toLowerCase().includes(q) ||
        o.materialDesc.toLowerCase().includes(q) ||
        o.soNumber.toLowerCase().includes(q)
      );
    }
    return [...items].sort((a, b) => a.expectedDeliveryDate.localeCompare(b.expectedDeliveryDate));
  }, [search, company, status, priority]);

  const totalRevenue = filtered.reduce((s, o) => s + o.estimatedRevenue, 0);
  const totalQty = filtered.reduce((s, o) => s + o.soQty, 0);
  const criticalCount = filtered.filter(o => o.priority === 'Critical').length;

  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    UPCOMING_ORDERS.forEach(o => { map[o.status] = (map[o.status] || 0) + 1; });
    return map;
  }, []);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={14} color={COLORS.gray500} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders, customers..."
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

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterRow}>
          {COMPANIES.map(c => (
            <TouchableOpacity
              key={c} activeOpacity={0.8}
              style={[styles.chip, company === c && { backgroundColor: COMPANY_COLORS[c] || COLORS.primary, borderColor: COMPANY_COLORS[c] || COLORS.primary }]}
              onPress={() => setCompany(c)}
            >
              <Text style={[styles.chipText, company === c && styles.chipActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.row}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={styles.filterRow}>
            {STATUSES.map(s => (
              <TouchableOpacity
                key={s} activeOpacity={0.8}
                style={[styles.chip, status === s && { backgroundColor: statusColor(s), borderColor: statusColor(s) }]}
                onPress={() => setStatus(s)}
              >
                <Text style={[styles.chipText, status === s && styles.chipActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={styles.filterRow}>
            {PRIORITIES.map(p => (
              <TouchableOpacity
                key={p} activeOpacity={0.8}
                style={[styles.chip, priority === p && { backgroundColor: priorityColor(p), borderColor: priorityColor(p) }]}
                onPress={() => setPriority(p)}
              >
                <Text style={[styles.chipText, priority === p && styles.chipActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.kpiRow}>
        <View style={[styles.kpi, { borderLeftColor: COLORS.success }]}>
          <TrendingUp size={14} color={COLORS.success} />
          <Text style={styles.kpiLabel}>Est. Revenue</Text>
          <Text style={[styles.kpiVal, { color: COLORS.success }]}>{fmtRev(totalRevenue)}</Text>
        </View>
        <View style={[styles.kpi, { borderLeftColor: COLORS.info }]}>
          <Package size={14} color={COLORS.info} />
          <Text style={styles.kpiLabel}>Total Qty</Text>
          <Text style={[styles.kpiVal, { color: COLORS.info }]}>{totalQty.toLocaleString()}</Text>
        </View>
        <View style={[styles.kpi, { borderLeftColor: COLORS.error }]}>
          <Text style={styles.kpiLabel}>Critical</Text>
          <Text style={[styles.kpiVal, { color: COLORS.error }]}>{criticalCount}</Text>
        </View>
        <View style={[styles.kpi, { borderLeftColor: COLORS.primary }]}>
          <Text style={styles.kpiLabel}>Orders</Text>
          <Text style={[styles.kpiVal, { color: COLORS.primary }]}>{filtered.length}</Text>
        </View>
      </View>

      <View style={styles.statusBar}>
        {Object.entries(statusCounts).map(([s, count]) => {
          const maxCount = Math.max(...Object.values(statusCounts));
          const sc = statusColor(s);
          return (
            <TouchableOpacity key={s} style={styles.statusItem} activeOpacity={0.8} onPress={() => setStatus(status === s ? 'All' : s)}>
              <View style={styles.statusBarWrap}>
                <View style={[styles.statusBarFill, { height: `${(count / maxCount) * 100}%`, backgroundColor: sc }]} />
              </View>
              <Text style={[styles.statusCount, { color: sc }]}>{count}</Text>
              <Text style={styles.statusLabel} numberOfLines={2}>{s}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {filtered.map((o, i) => {
        const cc = COMPANY_COLORS[o.company] || COLORS.primary;
        const pc = priorityColor(o.priority);
        const sc = statusColor(o.status);
        const days = daysUntil(o.expectedDeliveryDate);
        const urgency = days <= 14 ? COLORS.error : days <= 30 ? COLORS.warning : COLORS.success;
        return (
          <View key={o.soNumber} style={[styles.card, { borderLeftColor: pc }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Text style={styles.soNum}>{o.soNumber}</Text>
                <View style={[styles.priBadge, { backgroundColor: pc + '18', borderColor: pc + '40' }]}>
                  <Text style={[styles.priText, { color: pc }]}>{o.priority}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: sc + '18', borderColor: sc + '40' }]}>
                <Text style={[styles.statusText, { color: sc }]}>{o.status}</Text>
              </View>
            </View>
            <Text style={styles.custName}>{o.customerName}</Text>
            <Text style={styles.matName}>{o.materialDesc}</Text>
            <View style={styles.cardFooter}>
              <View style={styles.footerLeft}>
                <View style={[styles.compTag, { backgroundColor: cc + '18' }]}>
                  <Text style={[styles.compTagText, { color: cc }]}>{o.company}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Calendar size={10} color={urgency} />
                  <Text style={[styles.metaText, { color: urgency }]}>{o.expectedDeliveryDate}</Text>
                  <Text style={[styles.daysText, { color: urgency }]}>({days}d)</Text>
                </View>
              </View>
              <View style={styles.footerRight}>
                <Text style={styles.qtyText}>{o.soQty.toLocaleString()} units</Text>
                <Text style={[styles.revText, { color: COLORS.success }]}>{fmtRev(o.estimatedRevenue)}</Text>
              </View>
            </View>
          </View>
        );
      })}
      {filtered.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No orders match your filters</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 14, paddingBottom: 32, gap: 10 },
  searchRow: {},
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, gap: 8, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, fontSize: 13, fontFamily: 'Poppins-Regular', color: COLORS.dark, padding: 0 },
  filterRow: { flexDirection: 'row', gap: 6, paddingVertical: 2 },
  row: { flexDirection: 'row', gap: 8 },
  chip: { borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: COLORS.white },
  chipText: { fontSize: 11, fontFamily: 'Poppins-Medium', color: COLORS.gray700 },
  chipActive: { color: COLORS.white },
  kpiRow: { flexDirection: 'row', gap: 6 },
  kpi: { flex: 1, backgroundColor: COLORS.white, borderRadius: 10, padding: 8, borderLeftWidth: 3, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', gap: 2 },
  kpiLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500, textAlign: 'center' },
  kpiVal: { fontSize: 14, fontFamily: 'Poppins-Bold' },
  statusBar: { backgroundColor: COLORS.white, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 100 },
  statusItem: { alignItems: 'center', gap: 3, flex: 1 },
  statusBarWrap: { width: 28, height: 50, backgroundColor: COLORS.gray100, borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  statusBarFill: { width: '100%', borderRadius: 4 },
  statusCount: { fontSize: 11, fontFamily: 'Poppins-Bold' },
  statusLabel: { fontSize: 8, fontFamily: 'Poppins-Regular', color: COLORS.gray500, textAlign: 'center' },
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 12, borderLeftWidth: 4, borderWidth: 1, borderColor: COLORS.border, gap: 5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  soNum: { fontSize: 12, fontFamily: 'Poppins-Bold', color: COLORS.dark },
  priBadge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 1 },
  priText: { fontSize: 10, fontFamily: 'Poppins-Bold' },
  statusBadge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  custName: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  matName: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerRight: { alignItems: 'flex-end' },
  compTag: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  compTagText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 10, fontFamily: 'Poppins-Medium' },
  daysText: { fontSize: 10, fontFamily: 'Poppins-Regular' },
  qtyText: { fontSize: 11, fontFamily: 'Poppins-Medium', color: COLORS.gray600 },
  revText: { fontSize: 12, fontFamily: 'Poppins-Bold' },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: COLORS.gray400 },
});
