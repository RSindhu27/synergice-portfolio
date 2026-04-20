import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, useWindowDimensions, Modal,
  Animated, TouchableWithoutFeedback,
} from 'react-native';
import Svg, { Polyline, Circle, Rect } from 'react-native-svg';
import { Search, X, ChevronLeft, ChevronRight, FlaskConical, Globe, Users, TrendingUp, MapPin, ArrowUpRight, Beaker, Package, Zap, Clock, CircleCheck as CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  COLORS, COMPANY_COLORS, productPortfolio,
  rdData, goLanzarData, revenueData, customerViewData, monthlyRevenue,
} from '@/data/mockData';
import StatusBadge from '@/components/ui/StatusBadge';
import FilterChip from '@/components/ui/FilterChip';
import CustomerStatusTab from '@/components/ui/CustomerStatusTab';

// ─── Neutral palette — no therapeutic/company hues ────────────────────────────
const N = {
  cardBg:   '#ffffff',
  pageBg:   '#f2f4f7',
  border:   '#dde0e5',
  borderLt: '#eaecf0',
  headBg:   '#f6f7f9',
  cream:    '#f2f4f7',
  dark:     '#111827',
  mid:      '#374151',
  muted:    '#4b5563',
  faint:    '#6b7280',
  green:    '#2d6a35',
  greenBg:  '#eaf4ec',
  greenBdr: '#b6d8bc',
  amber:    '#b45309',
  red:      '#b91c1c',
};

// Therapeutic dot colors only — used as tiny accent, never as backgrounds
const TCOL: Record<string, string> = {
  Diabetes:        '#3a7d44',
  Cardiovascular:  '#c0392b',
  'Anti-infective':'#df6d14',
  GI:              '#4a90a4',
  Antiretroviral:  '#c9a84c',
  "Women's Health":'#d63384',
  CNS:             '#7952b3',
};
const tcDot = (t: string) => TCOL[t] || '#607D8B';

// Keep tc() for MolBanner — but now uses neutral bg
const tc = (t: string) => ({
  bg: N.headBg,
  border: N.border,
  text: N.dark,
  dot: tcDot(t),
});

// Company colors used only as tiny dot indicator
const cp = (_c: string) => ({ bg: N.headBg, border: N.border, text: N.mid });

function fmt(v: number) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}
function fmtMn(v: number) {
  return `${(v / 1000000).toFixed(1)}MN`;
}

type Product = typeof productPortfolio[0];

interface MolGroup {
  molecule: string;
  therapeutic: string;
  companies: string[];
  products: Product[];
  regions: string[];
  dosageForms: string[];
}

function buildGroups(items: Product[]): MolGroup[] {
  const map: Record<string, MolGroup> = {};
  items.forEach(p => {
    if (!map[p.molecules]) map[p.molecules] = { molecule: p.molecules, therapeutic: p.therapeutic, companies: [], products: [], regions: [], dosageForms: [] };
    const g = map[p.molecules];
    g.products.push(p);
    if (!g.companies.includes(p.company)) g.companies.push(p.company);
    if (!g.regions.includes(p.region)) g.regions.push(p.region);
    if (!g.dosageForms.includes(p.dosage)) g.dosageForms.push(p.dosage);
  });
  return Object.values(map).sort((a, b) => a.molecule.localeCompare(b.molecule));
}

// ─── Mini charts ──────────────────────────────────────────────────────────────
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

// ─── DIFOT bar ────────────────────────────────────────────────────────────────
function DifotBar({ pct }: { pct: number }) {
  const fill = pct >= 95 ? N.green : pct >= 80 ? N.amber : N.red;
  return (
    <View style={dg.wrap}>
      <View style={dg.track}>
        <View style={[dg.fill, { width: `${Math.min(pct, 100)}%`, backgroundColor: fill }]} />
      </View>
      <Text style={[dg.label, { color: fill }]}>{pct.toFixed(1)}%</Text>
    </View>
  );
}
const dg = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  track: { flex: 1, height: 3, borderRadius: 2, overflow: 'hidden', backgroundColor: N.borderLt },
  fill: { height: 3, borderRadius: 2 },
  label: { fontSize: 10, fontFamily: 'Poppins-SemiBold', minWidth: 36, textAlign: 'right' },
});

// ─── Filter pill ──────────────────────────────────────────────────────────────
function Pill({ label, active, color, onPress }: { label: string; active: boolean; color?: string; onPress: () => void }) {
  const bg = active ? (color || N.green) : N.cardBg;
  const border = active ? (color || N.green) : N.border;
  const textCol = active ? '#fff' : N.mid;
  return (
    <TouchableOpacity style={[pl.pill, { backgroundColor: bg, borderColor: border }]} onPress={onPress} activeOpacity={0.75}>
      <Text style={[pl.text, { color: textCol }]}>{label}</Text>
    </TouchableOpacity>
  );
}
const pl = StyleSheet.create({
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, marginRight: 5 },
  text: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
});

// ─── Section header inside sidebar ────────────────────────────────────────────
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

// ─── Molecule name banner inside tab ─────────────────────────────────────────
function MolBanner({ group }: { group: MolGroup }) {
  const dot = tcDot(group.therapeutic);
  return (
    <View style={mb.wrap}>
      <View style={[mb.dot, { backgroundColor: dot }]} />
      <View style={{ flex: 1 }}>
        <Text style={mb.name}>{group.molecule}</Text>
        <Text style={mb.ta}>{group.therapeutic}</Text>
      </View>
    </View>
  );
}
const mb = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: N.border, backgroundColor: N.headBg, marginBottom: 8 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  name: { fontSize: 13, fontFamily: 'Poppins-Bold', color: N.dark },
  ta: { fontSize: 10, fontFamily: 'Poppins-Regular', color: N.muted },
});

// ─────────────────────────────────────────────────────────────────────────────
// REGION TAB
// ─────────────────────────────────────────────────────────────────────────────
function RegionTab({ group }: { group: MolGroup }) {
  const [regionFilter, setRegionFilter] = useState('All');
  const [companyFilter, setCompanyFilter] = useState('All');

  const filtered = useMemo(() => group.products.filter(p =>
    (regionFilter === 'All' || p.region === regionFilter) &&
    (companyFilter === 'All' || p.company === companyFilter)
  ), [group.products, regionFilter, companyFilter]);

  const regionDist = useMemo(() => {
    const map: Record<string, { skus: Product[]; companies: Set<string>; revenue: number }> = {};
    filtered.forEach(p => {
      if (!map[p.region]) map[p.region] = { skus: [], companies: new Set(), revenue: 0 };
      map[p.region].skus.push(p);
      map[p.region].companies.add(p.company);
      const inv = revenueData.find(r => r.material === p.productCode);
      map[p.region].revenue += inv ? inv.invoiceValLC : 0;
    });
    return Object.entries(map).sort((a, b) => b[1].revenue - a[1].revenue);
  }, [filtered]);

  const pipeline = useMemo(() =>
    [...rdData, ...goLanzarData].filter(p =>
      p.molecule.toLowerCase().includes(group.molecule.toLowerCase()) ||
      group.molecule.toLowerCase().includes(p.molecule.toLowerCase())
    ), [group.molecule]);

  const pipelineByRegion = useMemo(() => {
    const map: Record<string, typeof rdData> = {};
    pipeline.forEach(p => {
      const reg = p.referenceMarket || 'Global';
      if (!map[reg]) map[reg] = [];
      map[reg].push(p);
    });
    return map;
  }, [pipeline]);

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={rt.content}>
      <MolBanner group={group} />

      {/* Filters */}
      <View style={rt.filterBlock}>
        <Text style={rt.filterLabel}>Region</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={rt.filterRow}>
          {['All', ...group.regions].map(r => (
            <Pill key={r} label={r} active={regionFilter === r} color={N.green} onPress={() => setRegionFilter(r)} />
          ))}
        </ScrollView>
        <Text style={[rt.filterLabel, { marginTop: 8 }]}>Company</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={rt.filterRow}>
          {['All', ...group.companies].map(c => (
            <Pill key={c} label={c} active={companyFilter === c} color={N.green} onPress={() => setCompanyFilter(c)} />
          ))}
        </ScrollView>
      </View>

      <SH label="Region Distribution" icon={<Globe size={12} color={COLORS.gray500} />} />

      {regionDist.length === 0 ? (
        <View style={rt.empty}><Text style={rt.emptyTxt}>No data for selected filters</Text></View>
      ) : regionDist.map(([region, info]) => {
        const companiesList = [...info.companies].map(c => (
          <View key={c} style={rt.compBadge}>
            <View style={[rt.compDot, { backgroundColor: COMPANY_COLORS[c] || N.green }]} />
            <Text style={rt.compBadgeText}>{c}</Text>
          </View>
        ));
        return (
          <View key={region} style={rt.regionCard}>
            <View style={rt.regionCardHead}>
              <View style={rt.regionIconWrap}><Globe size={14} color={N.muted} /></View>
              <Text style={rt.regionCardTitle}>{region}</Text>
              <View style={rt.regionCardRight}>
                <Text style={rt.regionSkuCount}>{info.skus.length} SKU{info.skus.length > 1 ? 's' : ''}</Text>
                {info.revenue > 0 && <Text style={rt.regionRev}>{fmt(info.revenue)}</Text>}
              </View>
            </View>
            <View style={rt.compBadgeRow}>{companiesList}</View>

            {/* SKU-level details */}
            <View style={rt.skuTable}>
              <View style={rt.skuTableHead}>
                <Text style={[rt.skuTableH, { flex: 2 }]}>SKU Name</Text>
                <Text style={[rt.skuTableH, { flex: 1 }]}>Technology</Text>
                <Text style={[rt.skuTableH, { flex: 1, textAlign: 'right' }]}>Revenue</Text>
              </View>
              {info.skus.map((p, i) => {
                const inv = revenueData.find(r => r.material === p.productCode);
                return (
                  <View key={p.productCode} style={[rt.skuRow, i < info.skus.length - 1 && rt.skuRowBorder]}>
                    <View style={{ flex: 2 }}>
                      <Text style={rt.skuName} numberOfLines={1}>{p.product}</Text>
                      <Text style={rt.skuSub}>{p.strength} · {p.region}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={rt.techBadge}>
                        <Text style={rt.techText}>{p.dosage}</Text>
                      </View>
                    </View>
                    <Text style={[rt.skuRev, { flex: 1 }]}>{inv ? fmt(inv.invoiceValLC) : '—'}</Text>
                  </View>
                );
              })}
            </View>

            {/* Pipeline for this region */}
            {pipelineByRegion[region] && (
              <View style={rt.pipeSect}>
                <View style={rt.pipeHeader}>
                  <Beaker size={11} color={N.muted} />
                  <Text style={rt.pipeHeaderText}>Pipeline · {region}</Text>
                </View>
                {pipelineByRegion[region].map((pp, j) => {
                  const isGoLive = (pp as any).currentStatusCategory?.includes('Go') || (pp as any).currentStatusCategory?.includes('Launch');
                  const accentColor = isGoLive ? N.green : N.muted;
                  const priorityColor = pp.priority === 'Critical' ? N.red : pp.priority === 'High' ? N.amber : N.muted;
                  return (
                    <View key={j} style={[rt.pipeCard, { borderLeftColor: accentColor }]}>
                      <View style={rt.pipeCardTop}>
                        <Text style={rt.pipeCardName} numberOfLines={1}>{pp.summary}</Text>
                        <View style={rt.phaseBadge}>
                          <Text style={rt.phaseText}>{pp.currentStatus}</Text>
                        </View>
                      </View>
                      <View style={rt.pipeCardRow}>
                        <Text style={rt.pipeCardMeta}>{pp.strength} · {pp.dosageForm}</Text>
                        <Text style={[rt.pipeCardRev, { color: N.green }]}>{fmt(pp.totalRevenue)}</Text>
                      </View>
                      <View style={rt.pipeCardRow}>
                        <Text style={rt.pipeCardCo}>{pp.company}</Text>
                        <Text style={[rt.priorityBadge, { color: priorityColor }]}>{pp.priority}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}

      {/* Pipeline for non-matched regions */}
      {pipeline.length > 0 && Object.keys(pipelineByRegion).filter(r => !regionDist.find(([reg]) => reg === r)).length > 0 && (
        <>
          <SH label="Pipeline (Other Regions)" icon={<Beaker size={12} color={COLORS.gray500} />} />
          {Object.entries(pipelineByRegion).filter(([r]) => !regionDist.find(([reg]) => reg === r)).map(([region, pipes]) =>
            pipes.map((pp, j) => {
              const isGoLive = (pp as any).currentStatusCategory?.includes('Go') || (pp as any).currentStatusCategory?.includes('Launch');
              return (
                <View key={`${region}-${j}`} style={[rt.pipeCard, { borderLeftColor: isGoLive ? N.green : N.muted, marginBottom: 8 }]}>
                  <View style={rt.pipeCardTop}>
                    <Text style={rt.pipeCardName} numberOfLines={1}>{pp.summary}</Text>
                    <View style={rt.phaseBadge}>
                      <Text style={rt.phaseText}>{region}</Text>
                    </View>
                  </View>
                  <View style={rt.pipeCardRow}>
                    <Text style={rt.pipeCardMeta}>{pp.currentStatus} · {pp.dosageForm}</Text>
                    <Text style={[rt.pipeCardRev, { color: N.green }]}>{fmt(pp.totalRevenue)}</Text>
                  </View>
                </View>
              );
            })
          )}
        </>
      )}
    </ScrollView>
  );
}

const rt = StyleSheet.create({
  content: { padding: 10, paddingBottom: 32 },
  filterBlock: { backgroundColor: N.headBg, borderRadius: 8, borderWidth: 1, borderColor: N.border, padding: 8, marginBottom: 4 },
  filterLabel: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: N.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 },
  filterRow: { flexDirection: 'row', alignItems: 'center' },
  empty: { paddingVertical: 20, alignItems: 'center' },
  emptyTxt: { fontSize: 12, fontFamily: 'Poppins-Regular', color: N.faint },
  regionCard: { backgroundColor: N.cardBg, borderRadius: 8, borderWidth: 1, borderColor: N.border, padding: 10, marginBottom: 8 },
  regionCardHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 7 },
  regionIconWrap: { width: 24, height: 24, borderRadius: 6, backgroundColor: N.headBg, borderWidth: 1, borderColor: N.border, alignItems: 'center', justifyContent: 'center' },
  regionCardTitle: { flex: 1, fontSize: 12, fontFamily: 'Poppins-Bold', color: N.dark },
  regionCardRight: { alignItems: 'flex-end' },
  regionSkuCount: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: N.muted },
  regionRev: { fontSize: 11, fontFamily: 'Poppins-Bold', color: N.green },
  compBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
  compBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20, borderWidth: 1, borderColor: N.border, backgroundColor: N.headBg },
  compDot: { width: 5, height: 5, borderRadius: 2.5 },
  compBadgeText: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: N.mid },
  skuTable: { backgroundColor: N.cardBg, borderRadius: 6, borderWidth: 1, borderColor: N.border, overflow: 'hidden' },
  skuTableHead: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 5, backgroundColor: N.headBg, borderBottomWidth: 1, borderBottomColor: N.border },
  skuTableH: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: N.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  skuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 7, gap: 5 },
  skuRowBorder: { borderBottomWidth: 1, borderBottomColor: N.borderLt },
  skuName: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: N.dark },
  skuSub: { fontSize: 9, fontFamily: 'Poppins-Regular', color: N.muted },
  techBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5, borderWidth: 1, borderColor: N.border, backgroundColor: N.headBg, alignSelf: 'flex-start' },
  techText: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: N.mid },
  skuRev: { fontSize: 11, fontFamily: 'Poppins-Bold', color: N.green, textAlign: 'right' },
  pipeSect: { marginTop: 8 },
  pipeHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 5 },
  pipeHeaderText: { fontSize: 9, fontFamily: 'Poppins-Bold', color: N.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  pipeCard: { borderLeftWidth: 3, borderRadius: 6, padding: 8, marginBottom: 5, backgroundColor: N.headBg, borderWidth: 1, borderColor: N.border },
  pipeCardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4, marginBottom: 3 },
  pipeCardName: { flex: 1, fontSize: 11, fontFamily: 'Poppins-SemiBold', color: N.dark },
  phaseBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8, borderWidth: 1, borderColor: N.border, backgroundColor: N.cardBg },
  phaseText: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: N.muted },
  pipeCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  pipeCardMeta: { fontSize: 10, fontFamily: 'Poppins-Regular', color: N.muted },
  pipeCardRev: { fontSize: 11, fontFamily: 'Poppins-Bold' },
  pipeCardCo: { fontSize: 9, fontFamily: 'Poppins-Regular', color: N.muted },
  priorityBadge: { fontSize: 9, fontFamily: 'Poppins-Bold' },
});

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER TAB
// ─────────────────────────────────────────────────────────────────────────────
function CustomerTab({ group }: { group: MolGroup }) {
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  const customers = useMemo(() => customerViewData.filter(cv =>
    group.products.some(p => p.productCode === cv.materialCode)
  ), [group.products]);

  const byCustomer = useMemo(() => {
    const map: Record<string, typeof customers> = {};
    customers.forEach(c => {
      if (!map[c.customerName]) map[c.customerName] = [];
      map[c.customerName].push(c);
    });
    return Object.entries(map).map(([name, rows]) => {
      const inv = revenueData.filter(r => rows.some(ro => ro.materialCode === r.material && r.customerName === name));
      const revenue = inv.reduce((s, r) => s + r.invoiceValLC, 0);
      const avgDifot = rows.reduce((s, r) => s + r.difotPercent, 0) / rows.length;
      return { name, rows, revenue, avgDifot, company: rows[0].company };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [customers]);

  if (byCustomer.length === 0) {
    return (
      <View style={cu.emptyWrap}>
        <Users size={30} color={COLORS.gray300} />
        <Text style={cu.emptyText}>No customer data for this molecule</Text>
      </View>
    );
  }

  const totalRev = byCustomer.reduce((s, c) => s + c.revenue, 0);
  const avgDifot = byCustomer.reduce((s, c) => s + c.avgDifot, 0) / byCustomer.length;
  const difotColor = avgDifot >= 95 ? COLORS.primary : avgDifot >= 80 ? COLORS.gold : COLORS.error;

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={cu.content}>
      <MolBanner group={group} />

      {/* Summary KPI strip — matches Pipeline's kpiStrip */}
      <View style={cu.kpiRow}>
        <View style={cu.kpi}>
          <Text style={[cu.kpiVal, { color: N.dark }]}>{byCustomer.length}</Text>
          <Text style={cu.kpiLabel}>Customers</Text>
        </View>
        <View style={[cu.kpiDivider]} />
        <View style={cu.kpi}>
          <Text style={[cu.kpiVal, { color: N.green }]}>{fmt(totalRev)}</Text>
          <Text style={cu.kpiLabel}>Total Revenue</Text>
        </View>
        <View style={[cu.kpiDivider]} />
        <View style={cu.kpi}>
          <Text style={[cu.kpiVal, { color: difotColor }]}>{avgDifot.toFixed(1)}%</Text>
          <Text style={cu.kpiLabel}>Avg DIFOT</Text>
        </View>
      </View>

      <SH label="Customer Details" icon={<Users size={12} color={N.muted} />} />

      {byCustomer.map(({ name, rows, revenue, avgDifot: difot, company }) => {
        const cc = COMPANY_COLORS[company] || N.green;
        const expanded = expandedCustomer === name;
        const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

        return (
          <View key={name} style={cu.custCard}>
            <TouchableOpacity style={cu.custHead} onPress={() => setExpandedCustomer(expanded ? null : name)} activeOpacity={0.8}>
              <View style={[cu.avatar, { backgroundColor: N.headBg, borderWidth: 1, borderColor: N.border }]}>
                <Text style={[cu.avatarText, { color: N.mid }]}>{initials}</Text>
              </View>
              <View style={cu.custInfo}>
                <Text style={cu.custName}>{name}</Text>
                <View style={cu.custMeta}>
                  <View style={cu.compTag}>
                    <View style={[cu.compDot, { backgroundColor: cc }]} />
                    <Text style={cu.compTagText}>{company}</Text>
                  </View>
                  <Text style={cu.skuCountText}>{rows.length} SKU{rows.length > 1 ? 's' : ''}</Text>
                </View>
              </View>
              <View style={cu.custRight}>
                {revenue > 0 && <Text style={cu.custRev}>{fmt(revenue)}</Text>}
                <Text style={cu.custRevLabel}>Revenue</Text>
              </View>
            </TouchableOpacity>

            <View style={cu.difotRow}>
              <Text style={cu.difotLabel}>DIFOT</Text>
              <DifotBar pct={difot} />
            </View>

            <TouchableOpacity
              style={cu.toggleRow}
              onPress={() => setExpandedCustomer(expanded ? null : name)}
              activeOpacity={0.75}
            >
              <Text style={cu.toggleText}>{expanded ? 'Hide SKU Details' : 'View SKU Details'}</Text>
              <ChevronRight size={12} color={N.muted} style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }} />
            </TouchableOpacity>

            {expanded && (
              <View style={cu.skuSection}>
                <View style={cu.skuTableHead}>
                  <Text style={[cu.skuTableH, { flex: 2 }]}>SKU / Technology</Text>
                  <Text style={[cu.skuTableH, { flex: 1, textAlign: 'center' }]}>DIFOT</Text>
                  <Text style={[cu.skuTableH, { flex: 1, textAlign: 'right' }]}>Revenue</Text>
                </View>
                {rows.map((r, i) => {
                  const inv = revenueData.find(rv => rv.material === r.materialCode && rv.customerName === name);
                  const dColor = r.difotPercent >= 95 ? N.green : r.difotPercent >= 80 ? N.amber : N.red;
                  const product = group.products.find(p => p.productCode === r.materialCode);
                  return (
                    <View key={i} style={[cu.skuRow, i < rows.length - 1 && cu.skuRowBorder]}>
                      <View style={{ flex: 2 }}>
                        <Text style={cu.skuRowName} numberOfLines={1}>{r.materialDesc}</Text>
                        <Text style={cu.skuRowSub}>{product?.dosage || '—'} · {product?.strength || ''}</Text>
                      </View>
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={[cu.skuDifot, { color: dColor }]}>{r.difotPercent}%</Text>
                      </View>
                      <Text style={cu.skuRev}>{inv ? fmt(inv.invoiceValLC) : '—'}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const cu = StyleSheet.create({
  content: { padding: 10, paddingBottom: 32 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 40 },
  emptyText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: N.faint },
  kpiRow: { flexDirection: 'row', backgroundColor: N.cardBg, borderRadius: 8, borderWidth: 1, borderColor: N.border, paddingVertical: 10, paddingHorizontal: 6, marginBottom: 4, gap: 0 },
  kpi: { flex: 1, alignItems: 'center', gap: 2 },
  kpiDivider: { width: 1, backgroundColor: N.border, marginVertical: 4 },
  kpiVal: { fontSize: 15, fontFamily: 'Poppins-Bold' },
  kpiLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: N.muted, textAlign: 'center' },
  custCard: { backgroundColor: N.cardBg, borderRadius: 8, borderWidth: 1, borderColor: N.border, marginBottom: 7, overflow: 'hidden' },
  custHead: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, paddingBottom: 8 },
  avatar: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontFamily: 'Poppins-Bold' },
  custInfo: { flex: 1 },
  custName: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: N.dark, marginBottom: 3 },
  custMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  compTag: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, backgroundColor: N.headBg, borderWidth: 1, borderColor: N.border },
  compDot: { width: 5, height: 5, borderRadius: 2.5 },
  compTagText: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: N.mid },
  skuCountText: { fontSize: 9, fontFamily: 'Poppins-Regular', color: N.muted },
  custRight: { alignItems: 'flex-end', gap: 1 },
  custRev: { fontSize: 13, fontFamily: 'Poppins-Bold', color: N.green },
  custRevLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: N.faint },
  difotRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingBottom: 8, borderTopWidth: 1, borderTopColor: N.border, paddingTop: 8 },
  difotLabel: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: N.muted, width: 36 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 7, borderTopWidth: 1, borderTopColor: N.border },
  toggleText: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: N.muted },
  skuSection: { borderTopWidth: 1, borderTopColor: N.border },
  skuTableHead: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 5, backgroundColor: N.headBg, borderBottomWidth: 1, borderBottomColor: N.border },
  skuTableH: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: N.muted, textTransform: 'uppercase', letterSpacing: 0.3 },
  skuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, gap: 5 },
  skuRowBorder: { borderBottomWidth: 1, borderBottomColor: N.borderLt },
  skuRowName: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: N.dark, marginBottom: 1 },
  skuRowSub: { fontSize: 9, fontFamily: 'Poppins-Regular', color: N.muted },
  skuDifot: { fontSize: 11, fontFamily: 'Poppins-Bold' },
  skuRev: { flex: 1, fontSize: 11, fontFamily: 'Poppins-Bold', color: N.green, textAlign: 'right' },
});

// ─────────────────────────────────────────────────────────────────────────────
// REVENUE TAB
// ─────────────────────────────────────────────────────────────────────────────
const YEAR_OPTS = ['CY', 'PY'];
const PERIOD_OPTS = ['Monthly', 'Quarterly', 'Half Yearly', 'Yearly'];

function RevenueTab({ group }: { group: MolGroup }) {
  const [year, setYear] = useState('CY');
  const [period, setPeriod] = useState('Quarterly');

  const productCodes = group.products.map(p => p.productCode);
  const invoices = revenueData.filter(r => productCodes.includes(r.material));
  const totalRev = invoices.reduce((s, r) => s + r.invoiceValLC, 0);

  const byRegion = useMemo(() => {
    const map: Record<string, number> = {};
    invoices.forEach(inv => {
      const p = group.products.find(pp => pp.productCode === inv.material);
      const reg = p?.region || 'Unknown';
      map[reg] = (map[reg] || 0) + inv.invoiceValLC;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [invoices]);

  const byCustomer = useMemo(() => {
    const map: Record<string, number> = {};
    invoices.forEach(inv => { map[inv.customerName] = (map[inv.customerName] || 0) + inv.invoiceValLC; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [invoices]);

  const byCompany = useMemo(() => {
    const map: Record<string, number> = {};
    invoices.forEach(inv => { map[inv.company] = (map[inv.company] || 0) + inv.invoiceValLC; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [invoices]);

  const sparkData = useMemo(() =>
    monthlyRevenue.slice(-8).map(row =>
      group.companies.reduce((s, c) => {
        const k = c === 'One Source' ? 'oneSource' : c === 'Instapill' ? 'instapill' : c.toLowerCase() as any;
        return s + ((row as any)[k] || 0);
      }, 0)
    ), [group.companies]);

  const quarterlyData = useMemo(() => {
    const map: Record<string, number> = {};
    invoices.forEach(inv => { map[inv.quarter] = (map[inv.quarter] || 0) + inv.invoiceValLC; });
    return Object.entries(map).map(([label, value]) => ({ label: label.replace(' 2024', ''), value }));
  }, [invoices]);

  const chartData = useMemo(() => {
    if (period === 'Quarterly') return quarterlyData;
    const base = monthlyRevenue.slice(-6).map(row => ({
      label: row.month.replace(' 24', ''),
      value: group.companies.reduce((s, c) => {
        const k = c === 'One Source' ? 'oneSource' : c === 'Instapill' ? 'instapill' : c.toLowerCase() as any;
        return s + ((row as any)[k] || 0);
      }, 0),
    }));
    if (period === 'Monthly') return base;
    if (period === 'Half Yearly') return [
      { label: 'H1', value: base.slice(0, 3).reduce((s, d) => s + d.value, 0) },
      { label: 'H2', value: base.slice(3).reduce((s, d) => s + d.value, 0) },
    ];
    return [{ label: 'Yearly', value: base.reduce((s, d) => s + d.value, 0) }];
  }, [period, quarterlyData, group.companies]);

  const maxReg = Math.max(...byRegion.map(r => r[1])) || 1;

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={rv.content}>
      <MolBanner group={group} />

      {/* Total revenue hero */}
      <View style={rv.heroCard}>
        <View style={rv.heroLeft}>
          <Text style={rv.heroAmount}>{fmt(totalRev)}</Text>
          <Text style={rv.heroLabel}>Total Revenue</Text>
        </View>
        <View style={rv.yearFilters}>
          {YEAR_OPTS.map(y => (
            <TouchableOpacity key={y} style={[rv.yearChip, year === y && rv.yearChipActive]} onPress={() => setYear(y)}>
              <Text style={[rv.yearChipText, year === y && rv.yearChipTextActive]}>{y}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Period filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={rv.periodRow}>
        {PERIOD_OPTS.map(p => (
          <Pill key={p} label={p} active={period === p} color={N.green} onPress={() => setPeriod(p)} />
        ))}
      </ScrollView>

      {/* Trend chart */}
      {sparkData.some(v => v > 0) && (
        <View style={rv.chartCard}>
          <Text style={rv.chartTitle}>Revenue Trend (Last 8 Months)</Text>
          <SparkLine data={sparkData} color={COLORS.primary} h={52} />
        </View>
      )}

      {/* Period bar chart */}
      {chartData.length > 0 && chartData.some(d => d.value > 0) && (
        <View style={rv.chartCard}>
          <Text style={rv.chartTitle}>{period} Breakdown</Text>
          <MiniBar data={chartData} color={COLORS.primary} h={52} />
          <View style={rv.barLabelRow}>
            {chartData.map((d, i) => <Text key={i} style={rv.barLabel}>{d.label}</Text>)}
          </View>
        </View>
      )}

      <SH label="By Region" icon={<Globe size={12} color={COLORS.gray500} />} />
      {byRegion.map(([region, rev]) => (
        <View key={region} style={rv.listRow}>
          <View style={rv.listIcon}>
            <Globe size={11} color={N.muted} />
          </View>
          <Text style={rv.listLabel} numberOfLines={1}>{region}</Text>
          <View style={rv.barTrack}>
            <View style={[rv.barFill, { width: `${(rev / maxReg) * 100}%` }]} />
          </View>
          <Text style={rv.listVal}>{fmt(rev)}</Text>
        </View>
      ))}

      <SH label="By Customer" icon={<Users size={12} color={COLORS.gray500} />} />
      {byCustomer.map(([cust, rev]) => {
        const pct = totalRev > 0 ? (rev / totalRev) * 100 : 0;
        return (
          <View key={cust} style={rv.listRow}>
            <View style={rv.listIcon}>
              <Users size={11} color={N.muted} />
            </View>
            <Text style={rv.listLabel} numberOfLines={1}>{cust}</Text>
            <View style={rv.barTrack}>
              <View style={[rv.barFill, { width: `${pct}%` }]} />
            </View>
            <Text style={rv.listVal}>{fmt(rev)}</Text>
          </View>
        );
      })}

      <SH label="By Company" icon={<Package size={12} color={COLORS.gray500} />} />
      {byCompany.map(([comp, rev]) => {
        const cc = COMPANY_COLORS[comp] || N.green;
        const pct = totalRev > 0 ? (rev / totalRev) * 100 : 0;
        return (
          <View key={comp} style={rv.listRow}>
            <View style={rv.listIcon}>
              <View style={[rv.compCircle, { backgroundColor: cc }]} />
            </View>
            <Text style={rv.listLabel}>{comp}</Text>
            <View style={rv.barTrack}>
              <View style={[rv.barFill, { width: `${pct}%` }]} />
            </View>
            <Text style={rv.listVal}>{fmt(rev)}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const rv = StyleSheet.create({
  content: { padding: 10, paddingBottom: 32 },
  heroCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: N.greenBg, borderWidth: 1, borderColor: N.greenBdr, borderRadius: 8, padding: 12, marginBottom: 8 },
  heroLeft: {},
  heroAmount: { fontSize: 22, fontFamily: 'Poppins-Bold', color: N.green },
  heroLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: N.muted, marginTop: 1 },
  yearFilters: { flexDirection: 'row', gap: 5 },
  yearChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: N.greenBdr, backgroundColor: '#fff' },
  yearChipActive: { backgroundColor: N.green, borderColor: N.green },
  yearChipText: { fontSize: 10, fontFamily: 'Poppins-Bold', color: N.green },
  yearChipTextActive: { color: '#fff' },
  periodRow: { flexDirection: 'row', paddingBottom: 8 },
  chartCard: { backgroundColor: N.cardBg, borderRadius: 8, borderWidth: 1, borderColor: N.border, padding: 10, marginBottom: 8 },
  chartTitle: { fontSize: 9, fontFamily: 'Poppins-Bold', color: N.muted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  barLabel: { flex: 1, fontSize: 9, fontFamily: 'Poppins-Regular', color: N.faint, textAlign: 'center' },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: N.borderLt, gap: 7 },
  listIcon: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: N.border, backgroundColor: N.headBg, alignItems: 'center', justifyContent: 'center' },
  compCircle: { width: 7, height: 7, borderRadius: 3.5 },
  listLabel: { flex: 1, fontSize: 11, fontFamily: 'Poppins-Regular', color: N.dark },
  barTrack: { width: 60, height: 4, backgroundColor: N.borderLt, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: 4, borderRadius: 2, backgroundColor: N.green + '99' },
  listVal: { fontSize: 11, fontFamily: 'Poppins-Bold', minWidth: 48, textAlign: 'right', color: N.green },
});

// ─────────────────────────────────────────────────────────────────────────────
// MOLECULE SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
const SIDEBAR_TABS = ['Region', 'Customer', 'Revenue'] as const;
type SidebarTab = typeof SIDEBAR_TABS[number];

function MoleculeSidebar({ group, visible, onClose }: { group: MolGroup | null; visible: boolean; onClose: () => void }) {
  const { width: sw } = useWindowDimensions();
  const drawerW = Math.min(sw * 0.94, 500);
  const slideAnim = useRef(new Animated.Value(drawerW)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState<SidebarTab>('Region');

  useEffect(() => {
    slideAnim.setValue(drawerW);
  }, [drawerW]);

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

  if (!group) return null;
  const dot = tcDot(group.therapeutic);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[sid.overlay, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>
      <Animated.View style={[sid.drawer, { width: drawerW, transform: [{ translateX: slideAnim }] }]}>

        {/* Header */}
        <View style={sid.header}>
          <View style={sid.headerTop}>
            <View style={[sid.molIconWrap, { backgroundColor: dot + '15' }]}>
              <FlaskConical size={18} color={dot} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={sid.molName}>{group.molecule}</Text>
              <View style={sid.taBadge}>
                <View style={[sid.taDot, { backgroundColor: dot }]} />
                <Text style={sid.taText}>{group.therapeutic}</Text>
              </View>
            </View>
            <TouchableOpacity style={sid.closeBtn} onPress={onClose} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <X size={16} color={N.muted} />
            </TouchableOpacity>
          </View>
          {/* Stats row */}
          <View style={sid.statsRow}>
            {[
              { val: group.products.length, lbl: 'SKUs' },
              { val: group.companies.length, lbl: 'Companies' },
              { val: group.regions.length, lbl: 'Regions' },
              { val: group.dosageForms.length, lbl: 'Forms' },
            ].map((s, i, arr) => (
              <React.Fragment key={s.lbl}>
                <View style={sid.stat}>
                  <Text style={[sid.statVal, { color: dot }]}>{s.val}</Text>
                  <Text style={sid.statLabel}>{s.lbl}</Text>
                </View>
                {i < arr.length - 1 && <View style={sid.statDiv} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Tab bar */}
        <View style={sid.tabBar}>
          {SIDEBAR_TABS.map(t => {
            const isActive = activeTab === t;
            return (
              <TouchableOpacity key={t} style={[sid.tabBtn, isActive && { borderBottomColor: N.green }]} onPress={() => setActiveTab(t)} activeOpacity={0.8}>
                {t === 'Region' && <Globe size={13} color={isActive ? N.green : N.faint} />}
                {t === 'Customer' && <Users size={13} color={isActive ? N.green : N.faint} />}
                {t === 'Revenue' && <TrendingUp size={13} color={isActive ? N.green : N.faint} />}
                <Text style={[sid.tabText, isActive && { color: N.green }]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab content */}
        <View style={{ flex: 1 }}>
          {activeTab === 'Region' && <RegionTab group={group} />}
          {activeTab === 'Customer' && <CustomerTab group={group} />}
          {activeTab === 'Revenue' && <RevenueTab group={group} />}
        </View>
      </Animated.View>
    </Modal>
  );
}

const sid = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,20,10,0.45)' },
  drawer: { position: 'absolute', right: 0, top: 0, bottom: 0, backgroundColor: N.pageBg, shadowColor: '#000', shadowOffset: { width: -4, height: 0 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 24 },
  header: { paddingTop: 14, paddingBottom: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: N.border, backgroundColor: N.cardBg },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  molIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  molName: { fontSize: 15, fontFamily: 'Poppins-Bold', color: N.dark, marginBottom: 3 },
  taBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: N.border, backgroundColor: N.headBg },
  taDot: { width: 5, height: 5, borderRadius: 2.5 },
  taText: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: N.mid },
  closeBtn: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, borderColor: N.border, backgroundColor: N.cardBg, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', borderRadius: 8, borderWidth: 1, borderColor: N.border, paddingVertical: 8, backgroundColor: N.headBg },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 14, fontFamily: 'Poppins-Bold' },
  statLabel: { fontSize: 8, fontFamily: 'Poppins-Regular', color: N.muted, textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 1 },
  statDiv: { width: 1, backgroundColor: N.border, marginVertical: 4 },
  tabBar: { flexDirection: 'row', backgroundColor: N.cardBg, borderBottomWidth: 1, borderBottomColor: N.border },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: N.faint },
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PRODUCT PORTFOLIO VIEW
// ─────────────────────────────────────────────────────────────────────────────
const COMPANIES = ['All', 'Strides', 'Instapill', 'One Source', 'Naari', 'Solara'];
const PAGE_SIZE = 6;
const TOP_TABS = ['Product Portfolio', 'Customer Details'];

function ProductPortfolioView() {
  const [companyFilter, setCompanyFilter] = useState('All');
  const [moleculeFilter, setMoleculeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState<MolGroup | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const allGroups = useMemo(() => buildGroups(productPortfolio), []);
  const allMolecules = useMemo(() => ['All', ...allGroups.map(g => g.molecule)], [allGroups]);

  const filteredProducts = useMemo(() => {
    let items = productPortfolio;
    if (companyFilter !== 'All') items = items.filter(p => p.company === companyFilter);
    if (moleculeFilter !== 'All') items = items.filter(p => p.molecules === moleculeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(p =>
        p.molecules.toLowerCase().includes(q) ||
        p.product.toLowerCase().includes(q) ||
        p.company.toLowerCase().includes(q) ||
        p.therapeutic.toLowerCase().includes(q)
      );
    }
    return items;
  }, [companyFilter, moleculeFilter, search]);

  const groups = useMemo(() => buildGroups(filteredProducts), [filteredProducts]);
  const totalPages = Math.max(1, Math.ceil(groups.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageGroups = groups.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openSidebar = (group: MolGroup) => { setSelectedGroup(group); setSidebarVisible(true); };

  return (
    <View style={main.root}>
      <ScrollView style={main.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={main.scrollContent}>

        {/* Header */}
        <LinearGradient colors={[COLORS.primaryDark, COLORS.primary, '#4a8f55']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={main.header}>
          <Text style={main.headerTitle}>Product Portfolio</Text>
          <Text style={main.headerSub}>{groups.length} molecules · {filteredProducts.length} SKUs · {new Set(filteredProducts.map(p => p.company)).size} companies</Text>
        </LinearGradient>

        {/* Search */}
        <View style={main.searchWrap}>
          <View style={main.searchBox}>
            <Search size={15} color={COLORS.gray400} />
            <TextInput
              style={main.searchInput}
              placeholder="Search molecules, products, companies..."
              placeholderTextColor={COLORS.gray400}
              value={search}
              onChangeText={v => { setSearch(v); setPage(1); setMoleculeFilter('All'); }}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => { setSearch(''); setPage(1); }} hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}>
                <X size={14} color={COLORS.gray400} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Company filter */}
        <View style={main.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={main.filterBarContent}>
            {COMPANIES.map(c => (
              <FilterChip
                key={c}
                label={c}
                active={companyFilter === c}
                onPress={() => { setCompanyFilter(c); setPage(1); }}
                color={c === 'All' ? COLORS.dark : COMPANY_COLORS[c] || COLORS.primary}
              />
            ))}
          </ScrollView>
        </View>

        {/* Molecule filter */}
        <View style={main.molFilterBar}>
          <Text style={main.molFilterTitle}>Molecules</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={main.molFilterScroll}>
            {allMolecules.map(m => {
              const grp = allGroups.find(g => g.molecule === m);
              const isActive = moleculeFilter === m;
              const dot = grp ? tcDot(grp.therapeutic) : N.muted;
              return (
                <TouchableOpacity
                  key={m}
                  style={[main.molChip, isActive ? main.molChipActive : {}]}
                  onPress={() => { setMoleculeFilter(m); setPage(1); }}
                  activeOpacity={0.78}
                >
                  {m !== 'All' && <View style={[main.molChipDot, { backgroundColor: isActive ? 'rgba(255,255,255,0.8)' : dot }]} />}
                  <Text style={[main.molChipText, { color: isActive ? '#fff' : N.mid }]}>{m}</Text>
                  {grp && (
                    <View style={[main.molChipBadge, { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : N.border }]}>
                      <Text style={[main.molChipBadgeText, { color: isActive ? '#fff' : N.muted }]}>{grp.products.length}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Cards */}
        <View style={main.cardWrap}>
          <Text style={main.resultMeta}>Showing {pageGroups.length} of {groups.length} molecules</Text>

          {groups.length === 0 ? (
            <View style={main.empty}>
              <FlaskConical size={36} color={COLORS.gray300} />
              <Text style={main.emptyText}>No molecules match the current filters</Text>
            </View>
          ) : pageGroups.map(group => {
            const dot = tcDot(group.therapeutic);
            return (
              <View key={group.molecule} style={[main.molCard, { borderLeftColor: dot }]}>
                {/* Card header */}
                <View style={main.cardHead}>
                  <View style={[main.cardIconWrap, { backgroundColor: dot + '15' }]}>
                    <FlaskConical size={16} color={dot} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={main.cardMolName}>{group.molecule}</Text>
                    <View style={main.taChip}>
                      <View style={[main.taDot, { backgroundColor: dot }]} />
                      <Text style={main.taChipText}>{group.therapeutic}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={main.detailBtn}
                    onPress={() => openSidebar(group)}
                    activeOpacity={0.8}
                  >
                    <Text style={main.detailBtnText}>Details</Text>
                    <ArrowUpRight size={11} color={N.muted} />
                  </TouchableOpacity>
                </View>

                {/* Stats row */}
                <View style={main.statsRow}>
                  {[
                    { val: group.products.length, lbl: 'SKUs' },
                    { val: group.regions.length, lbl: 'Regions' },
                    { val: group.dosageForms.length, lbl: 'Forms' },
                    { val: group.companies.length, lbl: 'Companies' },
                  ].map((s, i, arr) => (
                    <React.Fragment key={s.lbl}>
                      <View style={main.statCell}>
                        <Text style={main.statVal}>{s.val}</Text>
                        <Text style={main.statLbl}>{s.lbl}</Text>
                      </View>
                      {i < arr.length - 1 && <View style={main.statDivider} />}
                    </React.Fragment>
                  ))}
                </View>

                {/* Company badges */}
                <View style={main.compRow}>
                  {group.companies.map(c => (
                    <View key={c} style={main.compBadge}>
                      <View style={[main.compDot, { backgroundColor: COMPANY_COLORS[c] || N.green }]} />
                      <Text style={main.compBadgeText}>{c}</Text>
                    </View>
                  ))}
                </View>

                {/* Products horizontal scroll */}
                <View style={main.prodDivider}>
                  <View style={main.prodDivLine} />
                  <Text style={main.prodDivLabel}>Products</Text>
                  <View style={main.prodDivLine} />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={main.prodScroll}>
                  {group.products.map(p => (
                    <TouchableOpacity
                      key={p.productCode}
                      style={main.prodChip}
                      onPress={() => openSidebar(group)}
                      activeOpacity={0.78}
                    >
                      <Text style={main.prodChipName} numberOfLines={1}>{p.product}</Text>
                      <Text style={main.prodChipSub}>{p.strength} · {p.dosage}</Text>
                      <Text style={main.prodChipCountry}>{p.country}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Pagination */}
      {groups.length > PAGE_SIZE && (
        <View style={main.pagination}>
          <TouchableOpacity style={[main.pgBtn, safePage === 1 && main.pgBtnDis]} onPress={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>
            <ChevronLeft size={15} color={safePage === 1 ? COLORS.gray300 : COLORS.dark} />
            <Text style={[main.pgText, safePage === 1 && { color: COLORS.gray300 }]}>Prev</Text>
          </TouchableOpacity>
          <Text style={main.pgInfo}>Page <Text style={main.pgNum}>{safePage}</Text> / <Text style={main.pgNum}>{totalPages}</Text></Text>
          <TouchableOpacity style={[main.pgBtn, safePage === totalPages && main.pgBtnDis]} onPress={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
            <Text style={[main.pgText, safePage === totalPages && { color: COLORS.gray300 }]}>Next</Text>
            <ChevronRight size={15} color={safePage === totalPages ? COLORS.gray300 : COLORS.dark} />
          </TouchableOpacity>
        </View>
      )}

      <MoleculeSidebar group={selectedGroup} visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
    </View>
  );
}

const main = StyleSheet.create({
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
  molFilterBar: { backgroundColor: N.cardBg, borderBottomWidth: 1, borderBottomColor: N.border, paddingVertical: 7, paddingHorizontal: 12 },
  molFilterTitle: { fontSize: 8, fontFamily: 'Poppins-Bold', color: N.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  molFilterScroll: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  molChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 8, paddingRight: 6, paddingVertical: 4, borderRadius: 20, borderWidth: 1, backgroundColor: N.headBg, borderColor: N.border },
  molChipActive: { backgroundColor: N.dark, borderColor: N.dark },
  molChipDot: { width: 5, height: 5, borderRadius: 2.5 },
  molChipText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  molChipBadge: { minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  molChipBadgeText: { fontSize: 8, fontFamily: 'Poppins-Bold' },
  cardWrap: { padding: 10 },
  resultMeta: { fontSize: 10, fontFamily: 'Poppins-Regular', color: N.muted, marginBottom: 7 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: N.faint, textAlign: 'center' },
  molCard: { backgroundColor: N.cardBg, borderRadius: 10, borderWidth: 1, borderLeftWidth: 3, borderColor: N.border, marginBottom: 8, overflow: 'hidden' },
  cardHead: { flexDirection: 'row', alignItems: 'center', padding: 10, paddingBottom: 8, gap: 8, backgroundColor: N.cardBg },
  cardIconWrap: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  cardMolName: { fontSize: 13, fontFamily: 'Poppins-Bold', color: N.dark, marginBottom: 3 },
  taChip: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, borderWidth: 1, borderColor: N.border, backgroundColor: N.headBg },
  taDot: { width: 5, height: 5, borderRadius: 2.5 },
  taChipText: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: N.mid },
  detailBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: N.border, backgroundColor: N.headBg },
  detailBtnText: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: N.mid },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: N.borderLt, backgroundColor: N.headBg },
  statCell: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  statVal: { fontSize: 15, fontFamily: 'Poppins-Bold', color: N.dark },
  statLbl: { fontSize: 8, fontFamily: 'Poppins-Regular', color: N.muted, textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 1 },
  statDivider: { width: 1, backgroundColor: N.borderLt, marginVertical: 6 },
  compRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, paddingHorizontal: 10, paddingTop: 7 },
  compBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20, borderWidth: 1, borderColor: N.border, backgroundColor: N.headBg },
  compDot: { width: 5, height: 5, borderRadius: 2.5 },
  compBadgeText: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: N.mid },
  prodDivider: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 10, marginTop: 8 },
  prodDivLine: { flex: 1, height: 1, backgroundColor: N.borderLt },
  prodDivLabel: { fontSize: 8, fontFamily: 'Poppins-SemiBold', color: N.faint, textTransform: 'uppercase', letterSpacing: 0.4 },
  prodScroll: { paddingHorizontal: 10, paddingVertical: 7, gap: 6 },
  prodChip: { borderWidth: 1, borderRadius: 8, padding: 8, minWidth: 112, borderColor: N.border, backgroundColor: N.headBg },
  prodChipName: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: N.dark, marginBottom: 1 },
  prodChipSub: { fontSize: 9, fontFamily: 'Poppins-Regular', color: N.muted },
  prodChipCountry: { fontSize: 9, fontFamily: 'Poppins-Regular', color: N.faint },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 9, backgroundColor: N.cardBg, borderTopWidth: 1, borderTopColor: N.border },
  pgBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 7, borderWidth: 1, borderColor: N.border },
  pgBtnDis: { borderColor: N.borderLt, backgroundColor: N.headBg },
  pgText: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: N.dark },
  pgInfo: { fontSize: 11, fontFamily: 'Poppins-Regular', color: N.muted },
  pgNum: { fontFamily: 'Poppins-Bold', color: N.dark },
});

// ─────────────────────────────────────────────────────────────────────────────
// ROOT EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function PortfolioExplorer() {
  const [topTab, setTopTab] = useState(0);
  return (
    <SafeAreaView style={root.safe}>
      <View style={root.tabBar}>
        {TOP_TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            style={[root.tab, topTab === i && root.tabActive]}
            onPress={() => setTopTab(i)}
            activeOpacity={0.85}
          >
            <Text style={[root.tabText, topTab === i && root.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {topTab === 0 ? <ProductPortfolioView /> : <CustomerStatusTab />}
    </SafeAreaView>
  );
}

const root = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f4f6f9' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingHorizontal: 16, paddingTop: 8 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2.5, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: COLORS.gray400 },
  tabTextActive: { color: COLORS.primary },
});
