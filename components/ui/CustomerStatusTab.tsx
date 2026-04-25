import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, useWindowDimensions, Modal,
  Animated, TouchableWithoutFeedback,
} from 'react-native';
import { Search, X, ChevronLeft, ChevronRight, Users, MapPin, TrendingUp, Package, Globe, ArrowUpRight, ChartBar as BarChart2 } from 'lucide-react-native';
import Svg, { Polyline, Circle, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import {
  COLORS, COMPANY_COLORS, CUSTOMERS_BY_COMPANY, CUSTOMER_SKU_DETAILS,
} from '@/data/mockData';
import type { CustomerSKUDetail } from '@/data/mockData';

// ─── Palette ──────────────────────────────────────────────────────────────────
const N = {
  cardBg:   '#ffffff',
  pageBg:   '#f2f4f7',
  border:   '#dde0e5',
  borderLt: '#eaecf0',
  headBg:   '#f6f7f9',
  dark:     '#111827',
  mid:      '#374151',
  muted:    '#4b5563',
  faint:    '#6b7280',
  green:    '#2d6a35',
  greenBg:  '#eaf4ec',
  greenBdr: '#b6d8bc',
};

function fmt(v: number) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

const COMPANIES = ['All', 'Company A', 'Company B', 'Company C', 'Company D', 'Company E'];
const PAGE_SIZE = 6;

type CustomerEntry = {
  customerName: string;
  customerCode: string;
  country: string;
  region: string;
  segment: string;
  totalRevenue: number;
  products: string[];
  company: string;
};

const SIDEBAR_TABS = ['SKU', 'Region', 'Products', 'Revenue'] as const;
type SidebarTab = typeof SIDEBAR_TABS[number];

// ─── Shared pill ──────────────────────────────────────────────────────────────
function Pill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[pl.pill, active && pl.pillActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[pl.text, active && pl.textActive]}>{label}</Text>
    </TouchableOpacity>
  );
}
const pl = StyleSheet.create({
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: N.border, backgroundColor: N.cardBg, marginRight: 5 },
  pillActive: { backgroundColor: N.green, borderColor: N.green },
  text: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: N.mid },
  textActive: { color: '#fff' },
});

// ─── Section header ───────────────────────────────────────────────────────────
function SH({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <View style={sh.row}>
      {icon && <View style={sh.icon}>{icon}</View>}
      <Text style={sh.text}>{label}</Text>
      <View style={sh.line} />
    </View>
  );
}
const sh = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, marginBottom: 6 },
  icon: { opacity: 0.6 },
  text: { fontSize: 9, fontFamily: 'Poppins-Bold', color: N.muted, textTransform: 'uppercase', letterSpacing: 0.7 },
  line: { flex: 1, height: 1, backgroundColor: N.border },
});

// ─── Spark line ───────────────────────────────────────────────────────────────
function SparkLine({ data, color, h = 40 }: { data: number[]; color: string; h?: number }) {
  const [w, setW] = useState(0);
  if (!data || data.length < 2) return null;
  const mx = Math.max(...data), mn = Math.min(...data), range = mx - mn || 1, pad = 4;
  if (w === 0) return <View style={{ height: h }} onLayout={e => setW(e.nativeEvent.layout.width)} />;
  const pts = data.map((v, i) => `${pad + (i / (data.length - 1)) * (w - pad * 2)},${pad + ((mx - v) / range) * (h - pad * 2)}`);
  const last = pts[pts.length - 1].split(',');
  return (
    <View onLayout={e => setW(e.nativeEvent.layout.width)}>
      <Svg width={w} height={h}>
        <Polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={last[0]} cy={last[1]} r={3.5} fill={color} />
      </Svg>
    </View>
  );
}

function MiniBar({ data, color, h = 44 }: { data: { label: string; value: number }[]; color: string; h?: number }) {
  const [w, setW] = useState(0);
  if (w === 0) return <View style={{ height: h }} onLayout={e => setW(e.nativeEvent.layout.width)} />;
  const max = Math.max(...data.map(d => d.value)) || 1;
  const gap = 4, barW = (w - gap * (data.length - 1)) / data.length;
  return (
    <View onLayout={e => setW(e.nativeEvent.layout.width)}>
      <Svg width={w} height={h}>
        {data.map((d, i) => {
          const bh = Math.max(3, (d.value / max) * (h - 4));
          return <Rect key={i} x={i * (barW + gap)} y={h - 4 - bh} width={barW} height={bh} rx={3} fill={color} opacity={0.75} />;
        })}
      </Svg>
    </View>
  );
}

// ─── Customer banner shown inside each tab ────────────────────────────────────
function CustomerBanner({ customer, cc }: { customer: CustomerEntry; cc: string }) {
  return (
    <View style={cb.wrap}>
      <View style={[cb.avatar, { backgroundColor: cc + '18' }]}>
        <Text style={[cb.initials, { color: cc }]}>{customer.customerName.substring(0, 2).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={cb.name}>{customer.customerName}</Text>
        <View style={cb.meta}>
          <MapPin size={9} color={N.muted} />
          <Text style={cb.metaText}>{customer.country} · {customer.region}</Text>
        </View>
      </View>
    </View>
  );
}
const cb = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: N.border, backgroundColor: N.headBg, marginBottom: 8 },
  avatar: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 11, fontFamily: 'Poppins-Bold' },
  name: { fontSize: 13, fontFamily: 'Poppins-Bold', color: N.dark },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  metaText: { fontSize: 9, fontFamily: 'Poppins-Regular', color: N.muted },
});

// ─── SKU Tab ──────────────────────────────────────────────────────────────────
function SkuTab({ customer, cc, skus }: { customer: CustomerEntry; cc: string; skus: CustomerSKUDetail[] }) {
  const [regionFilter, setRegionFilter] = useState('All');
  const regions = useMemo(() => [...new Set(skus.map(s => s.region))], [skus]);
  const filtered = useMemo(() => skus.filter(s => regionFilter === 'All' || s.region === regionFilter), [skus, regionFilter]);

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={st.content}>
      <CustomerBanner customer={customer} cc={cc} />

      <View style={st.filterBlock}>
        <Text style={st.filterLabel}>Region</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.filterRow}>
          {['All', ...regions].map(r => (
            <Pill key={r} label={r} active={regionFilter === r} onPress={() => setRegionFilter(r)} />
          ))}
        </ScrollView>
      </View>

      <SH label={`${filtered.length} SKU${filtered.length !== 1 ? 's' : ''}`} icon={<Package size={12} color={COLORS.gray500} />} />

      <View style={st.table}>
        <View style={st.tableHead}>
          <Text style={[st.tableH, { flex: 1 }]}>SKU</Text>
          <Text style={[st.tableH, { flex: 2 }]}>Product</Text>
          <Text style={[st.tableH, { flex: 1 }]}>Region</Text>
          <Text style={[st.tableH, { flex: 1, textAlign: 'right' }]}>Revenue</Text>
        </View>
        {filtered.length === 0 ? (
          <View style={st.empty}><Text style={st.emptyText}>No SKUs for selected region</Text></View>
        ) : filtered.map((s, i) => (
          <View key={s.sku} style={[st.row, i < filtered.length - 1 && st.rowBorder]}>
            <View style={{ flex: 1 }}>
              <View style={st.skuBadge}>
                <Text style={st.skuBadgeText} numberOfLines={1}>{s.sku}</Text>
              </View>
            </View>
            <Text style={[st.productText, { flex: 2 }]} numberOfLines={2}>{s.product}</Text>
            <Text style={[st.regionText, { flex: 1 }]} numberOfLines={1}>{s.region}</Text>
            <Text style={[st.revenueText, { flex: 1 }]}>{fmt(s.revenue)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
const st = StyleSheet.create({
  content: { padding: 10, paddingBottom: 32 },
  filterBlock: { backgroundColor: N.headBg, borderRadius: 8, borderWidth: 1, borderColor: N.border, padding: 8, marginBottom: 4 },
  filterLabel: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: N.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 },
  filterRow: { flexDirection: 'row', alignItems: 'center' },
  table: { backgroundColor: N.cardBg, borderRadius: 8, borderWidth: 1, borderColor: N.border, overflow: 'hidden' },
  tableHead: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 7, backgroundColor: N.headBg, borderBottomWidth: 1, borderBottomColor: N.border },
  tableH: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: N.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 9, gap: 6 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: N.borderLt },
  skuBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: N.border, backgroundColor: N.headBg, alignSelf: 'flex-start' },
  skuBadgeText: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: N.mid },
  productText: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: N.dark },
  regionText: { fontSize: 10, fontFamily: 'Poppins-Regular', color: N.muted },
  revenueText: { fontSize: 11, fontFamily: 'Poppins-Bold', color: N.green, textAlign: 'right' },
  empty: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: N.faint },
});

// ─── Region Tab ───────────────────────────────────────────────────────────────
function RegionTab({ customer, cc, skus }: { customer: CustomerEntry; cc: string; skus: CustomerSKUDetail[] }) {
  const regionDist = useMemo(() => {
    const map: Record<string, { skus: CustomerSKUDetail[]; revenue: number }> = {};
    skus.forEach(s => {
      if (!map[s.region]) map[s.region] = { skus: [], revenue: 0 };
      map[s.region].skus.push(s);
      map[s.region].revenue += s.revenue;
    });
    return Object.entries(map).sort((a, b) => b[1].revenue - a[1].revenue);
  }, [skus]);

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={rgt.content}>
      <CustomerBanner customer={customer} cc={cc} />
      <SH label="Region Distribution" icon={<Globe size={12} color={COLORS.gray500} />} />
      {regionDist.length === 0 ? (
        <View style={rgt.empty}><Text style={rgt.emptyText}>No region data available</Text></View>
      ) : regionDist.map(([region, info]) => (
        <View key={region} style={rgt.regionCard}>
          <View style={rgt.regionHead}>
            <View style={rgt.regionIconWrap}><Globe size={14} color={N.muted} /></View>
            <Text style={rgt.regionTitle}>{region}</Text>
            <View style={rgt.regionRight}>
              <Text style={rgt.regionSkuCount}>{info.skus.length} SKU{info.skus.length !== 1 ? 's' : ''}</Text>
              <Text style={[rgt.regionRev, { color: cc }]}>{fmt(info.revenue)}</Text>
            </View>
          </View>
          <View style={rgt.skuTable}>
            <View style={rgt.skuTableHead}>
              <Text style={[rgt.skuTableH, { flex: 1 }]}>SKU</Text>
              <Text style={[rgt.skuTableH, { flex: 2 }]}>Product</Text>
              <Text style={[rgt.skuTableH, { flex: 1, textAlign: 'right' }]}>Revenue</Text>
            </View>
            {info.skus.map((s, i) => (
              <View key={s.sku} style={[rgt.skuRow, i < info.skus.length - 1 && rgt.skuRowBorder]}>
                <View style={{ flex: 1 }}>
                  <View style={rgt.skuBadge}>
                    <Text style={rgt.skuBadgeText} numberOfLines={1}>{s.sku}</Text>
                  </View>
                </View>
                <Text style={[rgt.skuProductText, { flex: 2 }]} numberOfLines={1}>{s.product}</Text>
                <Text style={[rgt.skuRevText, { flex: 1 }]}>{fmt(s.revenue)}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const rgt = StyleSheet.create({
  content: { padding: 10, paddingBottom: 32 },
  empty: { paddingVertical: 20, alignItems: 'center' },
  emptyText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: N.faint },
  regionCard: { backgroundColor: N.cardBg, borderRadius: 8, borderWidth: 1, borderColor: N.border, padding: 10, marginBottom: 8 },
  regionHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  regionIconWrap: { width: 24, height: 24, borderRadius: 6, backgroundColor: N.headBg, borderWidth: 1, borderColor: N.border, alignItems: 'center', justifyContent: 'center' },
  regionTitle: { flex: 1, fontSize: 12, fontFamily: 'Poppins-Bold', color: N.dark },
  regionRight: { alignItems: 'flex-end', gap: 1 },
  regionSkuCount: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: N.muted },
  regionRev: { fontSize: 12, fontFamily: 'Poppins-Bold' },
  skuTable: { backgroundColor: N.cardBg, borderRadius: 6, borderWidth: 1, borderColor: N.border, overflow: 'hidden' },
  skuTableHead: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 5, backgroundColor: N.headBg, borderBottomWidth: 1, borderBottomColor: N.border },
  skuTableH: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: N.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  skuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 7, gap: 6 },
  skuRowBorder: { borderBottomWidth: 1, borderBottomColor: N.borderLt },
  skuBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: N.border, backgroundColor: N.headBg, alignSelf: 'flex-start' },
  skuBadgeText: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: N.mid },
  skuProductText: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: N.dark },
  skuRevText: { fontSize: 11, fontFamily: 'Poppins-Bold', color: N.green, textAlign: 'right' },
});

// ─── Products Tab ─────────────────────────────────────────────────────────────
function ProductsTab({ customer, cc, skus }: { customer: CustomerEntry; cc: string; skus: CustomerSKUDetail[] }) {
  const productDist = useMemo(() => {
    const map: Record<string, { skus: CustomerSKUDetail[]; revenue: number }> = {};
    skus.forEach(s => {
      if (!map[s.product]) map[s.product] = { skus: [], revenue: 0 };
      map[s.product].skus.push(s);
      map[s.product].revenue += s.revenue;
    });
    return Object.entries(map).sort((a, b) => b[1].revenue - a[1].revenue);
  }, [skus]);

  const totalRev = skus.reduce((s, r) => s + r.revenue, 0) || customer.totalRevenue;

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={pt.content}>
      <CustomerBanner customer={customer} cc={cc} />
      <View style={pt.kpiRow}>
        <View style={pt.kpi}>
          <Text style={[pt.kpiVal, { color: N.dark }]}>{productDist.length}</Text>
          <Text style={pt.kpiLabel}>Products</Text>
        </View>
        <View style={pt.kpiDivider} />
        <View style={pt.kpi}>
          <Text style={[pt.kpiVal, { color: N.dark }]}>{skus.length}</Text>
          <Text style={pt.kpiLabel}>SKUs</Text>
        </View>
        <View style={pt.kpiDivider} />
        <View style={pt.kpi}>
          <Text style={[pt.kpiVal, { color: cc }]}>{fmt(totalRev)}</Text>
          <Text style={pt.kpiLabel}>Revenue</Text>
        </View>
      </View>
      <SH label="Products" icon={<Package size={12} color={COLORS.gray500} />} />
      {productDist.length === 0 ? (
        <View style={pt.empty}><Text style={pt.emptyText}>No product data available</Text></View>
      ) : productDist.map(([product, info]) => {
        const pct = totalRev > 0 ? (info.revenue / totalRev) * 100 : 0;
        return (
          <View key={product} style={pt.productCard}>
            <View style={pt.productHead}>
              <View style={[pt.productIconWrap, { backgroundColor: cc + '18' }]}>
                <Package size={13} color={cc} />
              </View>
              <Text style={pt.productName} numberOfLines={1}>{product}</Text>
              <Text style={[pt.productRev, { color: cc }]}>{fmt(info.revenue)}</Text>
            </View>
            <View style={pt.progressRow}>
              <View style={pt.progressTrack}>
                <View style={[pt.progressFill, { width: `${pct}%`, backgroundColor: cc + 'aa' }]} />
              </View>
              <Text style={pt.progressPct}>{pct.toFixed(0)}%</Text>
            </View>
            <View style={pt.skuTagRow}>
              {info.skus.map(s => (
                <View key={s.sku} style={pt.skuTag}>
                  <Text style={pt.skuTagText}>{s.sku}</Text>
                </View>
              ))}
              <Text style={pt.skuTagMeta}>{info.skus.length} SKU{info.skus.length !== 1 ? 's' : ''} · {[...new Set(info.skus.map(s => s.region))].join(', ')}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
const pt = StyleSheet.create({
  content: { padding: 10, paddingBottom: 32 },
  kpiRow: { flexDirection: 'row', backgroundColor: N.cardBg, borderRadius: 8, borderWidth: 1, borderColor: N.border, paddingVertical: 10, paddingHorizontal: 6, marginBottom: 4 },
  kpi: { flex: 1, alignItems: 'center', gap: 2 },
  kpiDivider: { width: 1, backgroundColor: N.border, marginVertical: 4 },
  kpiVal: { fontSize: 15, fontFamily: 'Poppins-Bold' },
  kpiLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: N.muted, textAlign: 'center' },
  empty: { paddingVertical: 20, alignItems: 'center' },
  emptyText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: N.faint },
  productCard: { backgroundColor: N.cardBg, borderRadius: 8, borderWidth: 1, borderColor: N.border, padding: 10, marginBottom: 8 },
  productHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  productIconWrap: { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  productName: { flex: 1, fontSize: 12, fontFamily: 'Poppins-SemiBold', color: N.dark },
  productRev: { fontSize: 12, fontFamily: 'Poppins-Bold' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  progressTrack: { flex: 1, height: 4, backgroundColor: N.borderLt, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },
  progressPct: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: N.muted, minWidth: 30, textAlign: 'right' },
  skuTagRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  skuTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: N.border, backgroundColor: N.headBg },
  skuTagText: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: N.mid },
  skuTagMeta: { fontSize: 9, fontFamily: 'Poppins-Regular', color: N.faint },
});

// ─── Revenue Tab ──────────────────────────────────────────────────────────────
function RevenueTab({ customer, cc, skus }: { customer: CustomerEntry; cc: string; skus: CustomerSKUDetail[] }) {
  const totalRev = skus.reduce((s, r) => s + r.revenue, 0) || customer.totalRevenue;

  const byRegion = useMemo(() => {
    const map: Record<string, number> = {};
    skus.forEach(s => { map[s.region] = (map[s.region] || 0) + s.revenue; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [skus]);

  const byProduct = useMemo(() => {
    const map: Record<string, number> = {};
    skus.forEach(s => { map[s.product] = (map[s.product] || 0) + s.revenue; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [skus]);

  const sparkData = skus.map(s => s.revenue);
  const barData = byProduct.slice(0, 6).map(([label, value]) => ({ label: label.split(' ')[1] || label, value }));
  const maxReg = Math.max(...byRegion.map(r => r[1])) || 1;

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={rvt.content}>
      <CustomerBanner customer={customer} cc={cc} />

      <View style={[rvt.heroCard, { borderColor: cc + '40', backgroundColor: cc + '08' }]}>
        <View>
          <Text style={[rvt.heroAmount, { color: cc }]}>{fmt(totalRev)}</Text>
          <Text style={rvt.heroLabel}>Total Revenue</Text>
        </View>
        <View style={rvt.heroStats}>
          <View style={rvt.heroStat}>
            <Text style={rvt.heroStatVal}>{skus.length}</Text>
            <Text style={rvt.heroStatLabel}>{skus.length === 1 ? 'SKU' : 'SKUs'}</Text>
          </View>
          <View style={rvt.heroDivider} />
          <View style={rvt.heroStat}>
            <Text style={rvt.heroStatVal}>{byRegion.length}</Text>
            <Text style={rvt.heroStatLabel}>{byRegion.length === 1 ? 'Region' : 'Regions'}</Text>
          </View>
        </View>
      </View>

      {sparkData.length > 1 && (
        <View style={rvt.chartCard}>
          <Text style={rvt.chartTitle}>Revenue by SKU</Text>
          <SparkLine data={sparkData} color={cc} h={48} />
        </View>
      )}

      {barData.length > 0 && (
        <View style={rvt.chartCard}>
          <Text style={rvt.chartTitle}>Top Products</Text>
          <MiniBar data={barData} color={cc} h={48} />
          <View style={rvt.barLabelRow}>
            {barData.map((d, i) => <Text key={i} style={rvt.barLabel} numberOfLines={1}>{d.label}</Text>)}
          </View>
        </View>
      )}

      <SH label="By Region" icon={<Globe size={12} color={COLORS.gray500} />} />
      {byRegion.map(([region, rev]) => (
        <View key={region} style={rvt.listRow}>
          <View style={rvt.listIcon}><Globe size={11} color={N.muted} /></View>
          <Text style={rvt.listLabel} numberOfLines={1}>{region}</Text>
          <View style={rvt.barTrack}>
            <View style={[rvt.barFill, { width: `${(rev / maxReg) * 100}%`, backgroundColor: cc + '99' }]} />
          </View>
          <Text style={[rvt.listVal, { color: cc }]}>{fmt(rev)}</Text>
        </View>
      ))}

      <SH label="By Product" icon={<Package size={12} color={COLORS.gray500} />} />
      {byProduct.map(([prod, rev]) => {
        const pct = totalRev > 0 ? (rev / totalRev) * 100 : 0;
        return (
          <View key={prod} style={rvt.listRow}>
            <View style={rvt.listIcon}><Package size={11} color={N.muted} /></View>
            <Text style={rvt.listLabel} numberOfLines={1}>{prod}</Text>
            <View style={rvt.barTrack}>
              <View style={[rvt.barFill, { width: `${pct}%`, backgroundColor: cc + '99' }]} />
            </View>
            <Text style={[rvt.listVal, { color: cc }]}>{fmt(rev)}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}
const rvt = StyleSheet.create({
  content: { padding: 10, paddingBottom: 32 },
  heroCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 8, padding: 14, marginBottom: 8 },
  heroAmount: { fontSize: 20, fontFamily: 'Poppins-Bold' },
  heroLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: N.muted, marginTop: 2 },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroStat: { alignItems: 'center' },
  heroStatVal: { fontSize: 16, fontFamily: 'Poppins-Bold', color: N.dark },
  heroStatLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: N.muted },
  heroDivider: { width: 1, height: 28, backgroundColor: N.border },
  chartCard: { backgroundColor: N.cardBg, borderRadius: 8, borderWidth: 1, borderColor: N.border, padding: 10, marginBottom: 8 },
  chartTitle: { fontSize: 9, fontFamily: 'Poppins-Bold', color: N.muted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  barLabel: { flex: 1, fontSize: 9, fontFamily: 'Poppins-Regular', color: N.faint, textAlign: 'center' },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: N.borderLt, gap: 7 },
  listIcon: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: N.border, backgroundColor: N.headBg, alignItems: 'center', justifyContent: 'center' },
  listLabel: { flex: 1, fontSize: 11, fontFamily: 'Poppins-Regular', color: N.dark },
  barTrack: { width: 60, height: 4, backgroundColor: N.borderLt, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: 4, borderRadius: 2 },
  listVal: { fontSize: 11, fontFamily: 'Poppins-Bold', minWidth: 48, textAlign: 'right' },
});

// ─── Customer Sidebar ─────────────────────────────────────────────────────────
function CustomerSidebar({ customer, visible, onClose }: {
  customer: CustomerEntry | null;
  visible: boolean;
  onClose: () => void;
}) {
  const { width: sw } = useWindowDimensions();
  const drawerW = Math.min(sw * 0.94, 500);
  const slideAnim = useRef(new Animated.Value(drawerW)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState<SidebarTab>('SKU');

  useEffect(() => { slideAnim.setValue(drawerW); }, [drawerW]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 68, friction: 12 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: drawerW, duration: 200, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!customer) return null;
  const cc = COMPANY_COLORS[customer.company] || N.green;
  const skus: CustomerSKUDetail[] = CUSTOMER_SKU_DETAILS[customer.customerCode] || [];
  const totalRev = skus.reduce((s, r) => s + r.revenue, 0) || customer.totalRevenue;
  const regions = [...new Set(skus.map(s => s.region))];

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[csd.overlay, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>
      <Animated.View style={[csd.drawer, { width: drawerW, transform: [{ translateX: slideAnim }] }]}>

        {/* Header */}
        <View style={csd.header}>
          <View style={csd.headerTop}>
            <View style={[csd.avatar, { backgroundColor: cc + '18' }]}>
              <Text style={[csd.avatarText, { color: cc }]}>{customer.customerName.substring(0, 2).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={csd.custName}>{customer.customerName}</Text>
              <View style={csd.metaRow}>
                <MapPin size={10} color={N.muted} />
                <Text style={csd.metaText}>{customer.country} · {customer.region}</Text>
              </View>
            </View>
            <TouchableOpacity style={csd.closeBtn} onPress={onClose} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <X size={16} color={N.muted} />
            </TouchableOpacity>
          </View>

          {/* Stats row */}
          <View style={csd.statsRow}>
            {[
              { val: skus.length, lbl: skus.length === 1 ? 'SKU' : 'SKUs' },
              { val: customer.products.length, lbl: customer.products.length === 1 ? 'Product' : 'Products' },
              { val: regions.length, lbl: regions.length === 1 ? 'Region' : 'Regions' },
              { val: fmt(totalRev), lbl: 'Revenue' },
            ].map((s, i, arr) => (
              <React.Fragment key={s.lbl}>
                <View style={csd.stat}>
                  <Text style={[csd.statVal, { color: cc }]}>{s.val}</Text>
                  <Text style={csd.statLabel}>{s.lbl}</Text>
                </View>
                {i < arr.length - 1 && <View style={csd.statDiv} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Company & Segment tags */}
        <View style={csd.tagRow}>
          <View style={[csd.compTag, { borderColor: cc + '40', backgroundColor: cc + '10' }]}>
            <View style={[csd.compDot, { backgroundColor: cc }]} />
            <Text style={[csd.compTagText, { color: cc }]}>{customer.company}</Text>
          </View>
          <View style={csd.segTag}>
            <Text style={csd.segTagText}>{customer.segment}</Text>
          </View>
        </View>

        {/* Tab bar */}
        <View style={csd.tabBar}>
          {SIDEBAR_TABS.map(t => {
            const isActive = activeTab === t;
            return (
              <TouchableOpacity
                key={t}
                style={[csd.tabBtn, isActive && { borderBottomColor: cc }]}
                onPress={() => setActiveTab(t)}
                activeOpacity={0.8}
              >
                {t === 'SKU' && <Package size={13} color={isActive ? cc : N.faint} />}
                {t === 'Region' && <Globe size={13} color={isActive ? cc : N.faint} />}
                {t === 'Products' && <BarChart2 size={13} color={isActive ? cc : N.faint} />}
                {t === 'Revenue' && <TrendingUp size={13} color={isActive ? cc : N.faint} />}
                <Text style={[csd.tabText, isActive && { color: cc }]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab content */}
        <View style={{ flex: 1 }}>
          {activeTab === 'SKU' && <SkuTab customer={customer} cc={cc} skus={skus} />}
          {activeTab === 'Region' && <RegionTab customer={customer} cc={cc} skus={skus} />}
          {activeTab === 'Products' && <ProductsTab customer={customer} cc={cc} skus={skus} />}
          {activeTab === 'Revenue' && <RevenueTab customer={customer} cc={cc} skus={skus} />}
        </View>
      </Animated.View>
    </Modal>
  );
}

const csd = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,20,10,0.45)' },
  drawer: { position: 'absolute', right: 0, top: 0, bottom: 0, backgroundColor: N.pageBg, shadowColor: '#000', shadowOffset: { width: -4, height: 0 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 24 },
  header: { paddingTop: 14, paddingBottom: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: N.border, backgroundColor: N.cardBg },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontFamily: 'Poppins-Bold' },
  custName: { fontSize: 14, fontFamily: 'Poppins-Bold', color: N.dark, marginBottom: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 10, fontFamily: 'Poppins-Regular', color: N.muted },
  closeBtn: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, borderColor: N.border, backgroundColor: N.cardBg, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', borderRadius: 8, borderWidth: 1, borderColor: N.border, paddingVertical: 8, backgroundColor: N.headBg },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 13, fontFamily: 'Poppins-Bold' },
  statLabel: { fontSize: 8, fontFamily: 'Poppins-Regular', color: N.muted, textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 1 },
  statDiv: { width: 1, backgroundColor: N.border, marginVertical: 4 },
  tagRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: N.cardBg, borderBottomWidth: 1, borderBottomColor: N.border },
  compTag: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  compDot: { width: 6, height: 6, borderRadius: 3 },
  compTagText: { fontSize: 11, fontFamily: 'Poppins-SemiBold' },
  segTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: N.border, backgroundColor: N.headBg },
  segTagText: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: N.mid },
  tabBar: { flexDirection: 'row', backgroundColor: N.cardBg, borderBottomWidth: 1, borderBottomColor: N.border },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: N.faint },
});

// ─── Main Customer Details View ───────────────────────────────────────────────
export default function CustomerStatusTab() {
  const [companyFilter, setCompanyFilter] = useState('All');
  const [customerFilter, setCustomerFilter] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerEntry | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { width: screenWidth } = useWindowDimensions();
  const cols = screenWidth < 480 ? 1 : screenWidth < 768 ? 2 : 3;
  const cardWidth = cols === 1 ? '100%' : cols === 2 ? '48%' : '31%';

  const allCustomers = useMemo((): CustomerEntry[] => {
    const result: CustomerEntry[] = [];
    Object.entries(CUSTOMERS_BY_COMPANY).forEach(([company, customers]) => {
      customers.forEach(c => result.push({ ...c, company }));
    });
    return result;
  }, []);

  const filtered = useMemo(() => {
    let items = allCustomers;
    if (companyFilter !== 'All') items = items.filter(c => c.company === companyFilter);
    if (customerFilter.length > 0) items = items.filter(c => customerFilter.includes(c.customerName));
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(c =>
        c.customerName.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        c.segment.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q)
      );
    }
    return items;
  }, [allCustomers, companyFilter, customerFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageCustomers = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const totalRevenue = filtered.reduce((s, c) => s + c.totalRevenue, 0);

  const openSidebar = (customer: CustomerEntry) => {
    setSelectedCustomer(customer);
    setSidebarVisible(true);
  };

  return (
    <View style={cs.root}>
      <ScrollView style={cs.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={cs.scrollContent}>

        {/* Header — matches Product Portfolio exactly */}
        <LinearGradient colors={[COLORS.primaryDark, COLORS.primary, '#4a8f55']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={cs.header}>
          <Text style={cs.headerTitle}>Customer Details</Text>
          <Text style={cs.headerSub}>{filtered.length} customer{filtered.length !== 1 ? 's' : ''} · {Object.keys(CUSTOMERS_BY_COMPANY).length} companies · {fmt(totalRevenue)}</Text>
        </LinearGradient>

        {/* Search */}
        <View style={cs.searchWrap}>
          <View style={cs.searchBox}>
            <Search size={15} color={COLORS.gray400} />
            <TextInput
              style={cs.searchInput}
              placeholder="Search customers, countries, regions..."
              placeholderTextColor={COLORS.gray400}
              value={search}
              onChangeText={v => { setSearch(v); setPage(1); setCustomerFilter([]); }}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => { setSearch(''); setPage(1); }} hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}>
                <X size={14} color={COLORS.gray400} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Company filter chips */}
        <View style={cs.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={cs.filterBarContent}>
            {COMPANIES.map(c => {
              const active = companyFilter === c;
              const color = c === 'All' ? N.dark : (COMPANY_COLORS[c] || N.green);
              return (
                <TouchableOpacity
                  key={c}
                  style={[cs.filterChip, active && { backgroundColor: color, borderColor: color }]}
                  onPress={() => { setCompanyFilter(c); setPage(1); }}
                  activeOpacity={0.75}
                >
                  {c !== 'All' && !active && <View style={[cs.filterChipDot, { backgroundColor: COMPANY_COLORS[c] || N.green }]} />}
                  <Text style={[cs.filterChipText, active && { color: '#fff' }]}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Customer name chips — mirrors molecule filter */}
        <View style={cs.molFilterBar}>
          <Text style={cs.molFilterTitle}>Customers</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={cs.molFilterScroll}>
            {(['All', ...allCustomers.filter(c => companyFilter === 'All' || c.company === companyFilter).map(c => c.customerName)] as string[]).map(name => {
              const isAllChip = name === 'All';
              const isActive = isAllChip ? customerFilter.length === 0 : customerFilter.includes(name);
              const custEntry = allCustomers.find(c => c.customerName === name);
              const cc = custEntry ? (COMPANY_COLORS[custEntry.company] || N.green) : N.green;
              return (
                <TouchableOpacity
                  key={name}
                  style={[cs.molChip, isActive && cs.molChipActive]}
                  onPress={() => {
                    setPage(1);
                    if (isAllChip) { setCustomerFilter([]); }
                    else { setCustomerFilter(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]); }
                  }}
                  activeOpacity={0.78}
                >
                  {!isAllChip && <View style={[cs.molChipDot, { backgroundColor: isActive ? 'rgba(255,255,255,0.8)' : cc }]} />}
                  <Text style={[cs.molChipText, { color: isActive ? '#fff' : N.mid }]}>{name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Cards */}
        <View style={cs.cardWrap}>
          <Text style={cs.resultMeta}>Showing {pageCustomers.length} of {filtered.length} customer{filtered.length !== 1 ? 's' : ''}</Text>

          {filtered.length === 0 ? (
            <View style={cs.empty}>
              <Users size={36} color={COLORS.gray300} />
              <Text style={cs.emptyText}>No customers match the current filters</Text>
            </View>
          ) : (
            <View style={cs.cardGrid}>
              {pageCustomers.map(customer => {
                const cc = COMPANY_COLORS[customer.company] || N.green;
                const skuCount = CUSTOMER_SKU_DETAILS[customer.customerCode]?.length ?? customer.products.length;
                const regionCount = [...new Set((CUSTOMER_SKU_DETAILS[customer.customerCode] ?? []).map(s => s.region))].length || 1;
                return (
                  <View key={customer.customerCode} style={[cs.custCard, { borderLeftColor: cc, width: cardWidth }]}>
                    {/* Card header */}
                    <View style={cs.cardHead}>
                      <View style={[cs.cardIconWrap, { backgroundColor: cc + '18' }]}>
                        <Text style={[cs.cardInitials, { color: cc }]}>{customer.customerName.substring(0, 2).toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[cs.cardName, cols === 1 && { fontSize: 15, lineHeight: 20 }]} numberOfLines={1}>{customer.customerName}</Text>
                        <View style={cs.locChip}>
                          <MapPin size={cols === 1 ? 10 : 8} color={N.muted} />
                          <Text style={[cs.locChipText, cols === 1 && { fontSize: 11 }]} numberOfLines={1}>{customer.country}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Stats row — matches molecule card exactly */}
                    <View style={cs.statsRow}>
                      {[
                        { val: skuCount, singular: 'SKU', plural: 'SKUs' },
                        { val: regionCount, singular: 'Region', plural: 'Regions' },
                        { val: customer.products.length, singular: 'Product', plural: 'Products' },
                      ].map((s, i, arr) => (
                        <React.Fragment key={s.singular}>
                          <View style={[cs.statCell, cols === 1 && { paddingVertical: 10 }]}>
                            <Text style={[cs.statVal, cols === 1 && { fontSize: 18 }]}>{s.val}</Text>
                            <Text style={[cs.statLbl, cols === 1 && { fontSize: 10 }]}>{s.val === 1 ? s.singular : s.plural}</Text>
                          </View>
                          {i < arr.length - 1 && <View style={cs.statDivider} />}
                        </React.Fragment>
                      ))}
                    </View>

                    {/* Revenue row — matches pipeline row style */}
                    <View style={cs.revenueRow}>
                      <TrendingUp size={cols === 1 ? 13 : 11} color={N.green} />
                      <Text style={[cs.revenueLabel, cols === 1 && { fontSize: 12 }]}>Revenue</Text>
                      <Text style={[cs.revenueVal, cols === 1 && { fontSize: 16 }]}>{fmt(customer.totalRevenue)}</Text>
                    </View>

                    {/* Company & segment badges */}
                    <View style={[cs.compRow, cols === 1 && { paddingHorizontal: 12, paddingTop: 10, gap: 6 }]}>
                      <View style={[cs.compBadge, { borderColor: cc + '40', backgroundColor: cc + '0f' }, cols === 1 && { paddingHorizontal: 8, paddingVertical: 4 }]}>
                        <View style={[cs.compDot, { backgroundColor: cc }]} />
                        <Text style={[cs.compBadgeText, { color: cc }, cols === 1 && { fontSize: 11 }]} numberOfLines={1}>{customer.company}</Text>
                      </View>
                      <View style={[cs.segBadge, cols === 1 && { paddingHorizontal: 8, paddingVertical: 4 }]}>
                        <Text style={[cs.segBadgeText, cols === 1 && { fontSize: 11 }]} numberOfLines={1}>{customer.segment}</Text>
                      </View>
                    </View>

                    {/* More Details */}
                    <TouchableOpacity
                      style={[cs.detailBtn, cols === 1 && { paddingVertical: 10, margin: 12, marginTop: 10 }]}
                      onPress={() => openSidebar(customer)}
                      activeOpacity={0.8}
                    >
                      <Text style={[cs.detailBtnText, cols === 1 && { fontSize: 12 }]}>More Details</Text>
                      <ArrowUpRight size={cols === 1 ? 12 : 10} color={N.muted} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Pagination — pinned to bottom, matches Product Portfolio */}
      {filtered.length > PAGE_SIZE && (
        <View style={cs.pagination}>
          <TouchableOpacity style={[cs.pgBtn, safePage === 1 && cs.pgBtnDis]} onPress={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>
            <ChevronLeft size={15} color={safePage === 1 ? COLORS.gray300 : N.dark} />
            <Text style={[cs.pgText, safePage === 1 && { color: COLORS.gray300 }]}>Prev</Text>
          </TouchableOpacity>
          <Text style={cs.pgInfo}>Page <Text style={cs.pgNum}>{safePage}</Text> / <Text style={cs.pgNum}>{totalPages}</Text></Text>
          <TouchableOpacity style={[cs.pgBtn, safePage === totalPages && cs.pgBtnDis]} onPress={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
            <Text style={[cs.pgText, safePage === totalPages && { color: COLORS.gray300 }]}>Next</Text>
            <ChevronRight size={15} color={safePage === totalPages ? COLORS.gray300 : N.dark} />
          </TouchableOpacity>
        </View>
      )}

      <CustomerSidebar
        customer={selectedCustomer}
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />
    </View>
  );
}

const cs = StyleSheet.create({
  root: { flex: 1, backgroundColor: N.pageBg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 },
  headerTitle: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#fff' },
  headerSub: { fontSize: 10, fontFamily: 'Poppins-Regular', color: 'rgba(255,255,255,0.80)', marginTop: 2 },
  searchWrap: { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: N.cardBg, borderBottomWidth: 1, borderBottomColor: N.border },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: N.headBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, gap: 7, borderWidth: 1, borderColor: N.border },
  searchInput: { flex: 1, fontSize: 12, fontFamily: 'Poppins-Regular', color: N.dark, padding: 0 },
  filterBar: { backgroundColor: N.cardBg, borderBottomWidth: 1, borderBottomColor: N.border, paddingVertical: 6 },
  filterBarContent: { paddingHorizontal: 12, gap: 5, alignItems: 'center' },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: N.border, backgroundColor: N.cardBg },
  filterChipDot: { width: 5, height: 5, borderRadius: 2.5 },
  filterChipText: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: N.mid },
  molFilterBar: { backgroundColor: N.cardBg, borderBottomWidth: 1, borderBottomColor: N.border, paddingVertical: 7, paddingHorizontal: 12 },
  molFilterTitle: { fontSize: 8, fontFamily: 'Poppins-Bold', color: N.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  molFilterScroll: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  molChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 8, paddingRight: 6, paddingVertical: 4, borderRadius: 20, borderWidth: 1, backgroundColor: N.headBg, borderColor: N.border },
  molChipActive: { backgroundColor: N.dark, borderColor: N.dark },
  molChipDot: { width: 5, height: 5, borderRadius: 2.5 },
  molChipText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  cardWrap: { padding: 10 },
  resultMeta: { fontSize: 10, fontFamily: 'Poppins-Regular', color: N.muted, marginBottom: 7 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: N.faint, textAlign: 'center' },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  custCard: { backgroundColor: N.cardBg, borderRadius: 12, borderWidth: 1, borderLeftWidth: 3, borderColor: N.border, overflow: 'hidden', width: '31%', flexGrow: 1 },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', padding: 10, paddingBottom: 8, gap: 8, backgroundColor: N.cardBg },
  cardIconWrap: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  cardInitials: { fontSize: 11, fontFamily: 'Poppins-Bold' },
  cardName: { fontSize: 12, fontFamily: 'Poppins-Bold', color: N.dark, marginBottom: 4, lineHeight: 16 },
  locChip: { flexDirection: 'row', alignItems: 'center', gap: 3, alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, borderWidth: 1, borderColor: N.border, backgroundColor: N.headBg },
  locChipText: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: N.mid },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: N.borderLt, backgroundColor: N.headBg },
  statCell: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  statVal: { fontSize: 14, fontFamily: 'Poppins-Bold', color: N.dark },
  statLbl: { fontSize: 8, fontFamily: 'Poppins-Regular', color: N.muted, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: N.borderLt, marginVertical: 6 },
  revenueRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: N.greenBdr, backgroundColor: N.greenBg },
  revenueLabel: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: N.green, flex: 1 },
  revenueVal: { fontSize: 14, fontFamily: 'Poppins-Bold', color: N.green },
  compRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, paddingHorizontal: 10, paddingTop: 7 },
  compBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  compDot: { width: 5, height: 5, borderRadius: 2.5 },
  compBadgeText: { fontSize: 9, fontFamily: 'Poppins-SemiBold' },
  segBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 20, borderWidth: 1, borderColor: N.border, backgroundColor: N.headBg },
  segBadgeText: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: N.mid },
  detailBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, margin: 10, marginTop: 8, paddingVertical: 7, borderRadius: 7, borderWidth: 1, borderColor: N.border, backgroundColor: N.headBg },
  detailBtnText: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: N.mid },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 9, backgroundColor: N.cardBg, borderTopWidth: 1, borderTopColor: N.border },
  pgBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 7, borderWidth: 1, borderColor: N.border },
  pgBtnDis: { borderColor: N.borderLt, backgroundColor: N.headBg },
  pgText: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: N.dark },
  pgInfo: { fontSize: 11, fontFamily: 'Poppins-Regular', color: N.muted },
  pgNum: { fontFamily: 'Poppins-Bold', color: N.dark },
});
