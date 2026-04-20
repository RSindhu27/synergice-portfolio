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

// ─── Pastel palette (overlays on white, subtle + elegant) ─────────────────────
const PASTEL = {
  greenBg: '#eef7f0',
  greenBorder: '#c8e6cc',
  greenText: '#2d6a35',
  blueBg: '#eaf4fb',
  blueBorder: '#b8d9ef',
  blueText: '#1a5f85',
  amberBg: '#fdf6e8',
  amberBorder: '#f5dfa0',
  amberText: '#8a6010',
  roseBg: '#fdf0f3',
  roseBorder: '#f5c6d0',
  roseText: '#8b2038',
  tealBg: '#e8f6f5',
  tealBorder: '#b2dbd8',
  tealText: '#1a5f5a',
  lavBg: '#f2eefb',
  lavBorder: '#d4c5f0',
  lavText: '#4a2d8a',
  slateBg: '#f0f4f8',
  slateBorder: '#c8d4e0',
  slateText: '#3a4f62',
};

// ─── Therapeutic colours (pastel-shifted) ─────────────────────────────────────
const TCOL: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  Diabetes:        { bg: '#eef7f0', border: '#b8dcbf', text: '#2d6a35', dot: '#3a7d44' },
  Cardiovascular:  { bg: '#fdf0f0', border: '#f5bcbc', text: '#8b2020', dot: '#c0392b' },
  'Anti-infective':{ bg: '#fdf6e8', border: '#f5dfa0', text: '#8a6010', dot: '#df6d14' },
  GI:              { bg: '#eaf4fb', border: '#b8d9ef', text: '#1a5f85', dot: '#4a90a4' },
  Antiretroviral:  { bg: '#fdf9e8', border: '#f0dfa0', text: '#7a6010', dot: '#c9a84c' },
  "Women's Health":{ bg: '#fdf0f6', border: '#f5bcd8', text: '#8b1050', dot: '#d63384' },
  CNS:             { bg: '#f2eefb', border: '#d4c5f0', text: '#4a2d8a', dot: '#7952b3' },
};
const tc = (t: string) => TCOL[t] || { bg: '#f0f4f8', border: '#c8d4e0', text: '#3a4f62', dot: '#607D8B' };

const COMPANY_PASTEL: Record<string, { bg: string; border: string; text: string }> = {
  Strides:      { bg: '#eef7f0', border: '#b8dcbf', text: '#2d6a35' },
  Instapill:    { bg: '#fdf6e8', border: '#f5dfa0', text: '#8a6010' },
  'One Source': { bg: '#fdf9e8', border: '#f0dfa0', text: '#7a6010' },
  Naari:        { bg: '#eaf4fb', border: '#b8d9ef', text: '#1a5f85' },
  Solara:       { bg: '#f2eefb', border: '#d4c5f0', text: '#4a2d8a' },
};
const cp = (c: string) => COMPANY_PASTEL[c] || { bg: PASTEL.slateBg, border: PASTEL.slateBorder, text: PASTEL.slateText };

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
  const fill = pct >= 95 ? COLORS.primary : pct >= 80 ? COLORS.gold : COLORS.error;
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
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  track: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden', backgroundColor: COLORS.gray100 },
  fill: { height: 4, borderRadius: 2 },
  label: { fontSize: 11, fontFamily: 'Poppins-SemiBold', minWidth: 40, textAlign: 'right' },
});

// ─── Filter pill ──────────────────────────────────────────────────────────────
function Pill({ label, active, color, onPress }: { label: string; active: boolean; color?: string; onPress: () => void }) {
  const bg = active ? (color || COLORS.primary) : COLORS.white;
  const border = active ? (color || COLORS.primary) : COLORS.border;
  const textCol = active ? '#fff' : COLORS.gray600;
  return (
    <TouchableOpacity style={[pl.pill, { backgroundColor: bg, borderColor: border }]} onPress={onPress} activeOpacity={0.75}>
      <Text style={[pl.text, { color: textCol }]}>{label}</Text>
    </TouchableOpacity>
  );
}
const pl = StyleSheet.create({
  pill: { paddingHorizontal: 13, paddingVertical: 5, borderRadius: 20, borderWidth: 1.2, marginRight: 7 },
  text: { fontSize: 11, fontFamily: 'Poppins-SemiBold' },
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 18, marginBottom: 10 },
  icon: { opacity: 0.6 },
  text: { fontSize: 10, fontFamily: 'Poppins-Bold', color: COLORS.gray500, textTransform: 'uppercase', letterSpacing: 0.8 },
  line: { flex: 1, height: 1, backgroundColor: COLORS.border },
});

// ─── Molecule name banner inside tab ─────────────────────────────────────────
function MolBanner({ group }: { group: MolGroup }) {
  const col = tc(group.therapeutic);
  return (
    <View style={[mb.wrap, { backgroundColor: col.bg, borderColor: col.border }]}>
      <View style={[mb.dot, { backgroundColor: col.dot }]} />
      <View style={{ flex: 1 }}>
        <Text style={[mb.name, { color: col.text }]}>{group.molecule}</Text>
        <Text style={[mb.ta, { color: col.text }]}>{group.therapeutic}</Text>
      </View>
    </View>
  );
}
const mb = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 14 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  name: { fontSize: 14, fontFamily: 'Poppins-Bold' },
  ta: { fontSize: 10, fontFamily: 'Poppins-Regular', opacity: 0.75, marginTop: 1 },
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
            <Pill key={r} label={r} active={regionFilter === r} color={COLORS.info} onPress={() => setRegionFilter(r)} />
          ))}
        </ScrollView>
        <Text style={[rt.filterLabel, { marginTop: 8 }]}>Company</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={rt.filterRow}>
          {['All', ...group.companies].map(c => (
            <Pill key={c} label={c} active={companyFilter === c} color={COMPANY_COLORS[c] || COLORS.primary} onPress={() => setCompanyFilter(c)} />
          ))}
        </ScrollView>
      </View>

      <SH label="Region Distribution" icon={<Globe size={12} color={COLORS.gray500} />} />

      {regionDist.length === 0 ? (
        <View style={rt.empty}><Text style={rt.emptyTxt}>No data for selected filters</Text></View>
      ) : regionDist.map(([region, info]) => {
        const companiesList = [...info.companies].map(c => {
          const cpStyle = cp(c);
          return (
            <View key={c} style={[rt.compBadge, { backgroundColor: cpStyle.bg, borderColor: cpStyle.border }]}>
              <View style={[rt.compDot, { backgroundColor: COMPANY_COLORS[c] || COLORS.primary }]} />
              <Text style={[rt.compBadgeText, { color: cpStyle.text }]}>{c}</Text>
            </View>
          );
        });
        return (
          <View key={region} style={rt.regionCard}>
            <View style={rt.regionCardHead}>
              <View style={rt.regionIconWrap}><Globe size={14} color={COLORS.info} /></View>
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
                const cpStyle = cp(p.company);
                const inv = revenueData.find(r => r.material === p.productCode);
                return (
                  <View key={p.productCode} style={[rt.skuRow, i < info.skus.length - 1 && rt.skuRowBorder]}>
                    <View style={{ flex: 2 }}>
                      <Text style={rt.skuName} numberOfLines={1}>{p.product}</Text>
                      <Text style={rt.skuSub}>{p.strength} · {p.region}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={[rt.techBadge, { backgroundColor: cpStyle.bg, borderColor: cpStyle.border }]}>
                        <Text style={[rt.techText, { color: cpStyle.text }]}>{p.dosage}</Text>
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
                  <Beaker size={11} color='#7952b3' />
                  <Text style={rt.pipeHeaderText}>Pipeline · {region}</Text>
                </View>
                {pipelineByRegion[region].map((pp, j) => {
                  const isGoLive = (pp as any).currentStatusCategory?.includes('Go') || (pp as any).currentStatusCategory?.includes('Launch');
                  const phaseColor = isGoLive ? '#2d6a35' : '#1a5f85';
                  const phaseBg = isGoLive ? PASTEL.greenBg : PASTEL.blueBg;
                  return (
                    <View key={j} style={[rt.pipeCard, { borderLeftColor: phaseColor, backgroundColor: phaseBg }]}>
                      <View style={rt.pipeCardTop}>
                        <Text style={rt.pipeCardName} numberOfLines={1}>{pp.summary}</Text>
                        <View style={[rt.phaseBadge, { backgroundColor: isGoLive ? PASTEL.greenBg : PASTEL.lavBg, borderColor: isGoLive ? PASTEL.greenBorder : PASTEL.lavBorder }]}>
                          <Text style={[rt.phaseText, { color: isGoLive ? PASTEL.greenText : PASTEL.lavText }]}>{pp.currentStatus}</Text>
                        </View>
                      </View>
                      <View style={rt.pipeCardRow}>
                        <Text style={rt.pipeCardMeta}>{pp.strength} · {pp.dosageForm}</Text>
                        <Text style={[rt.pipeCardRev, { color: phaseColor }]}>{fmt(pp.totalRevenue)}</Text>
                      </View>
                      <View style={rt.pipeCardRow}>
                        <Text style={rt.pipeCardCo}>{pp.company}</Text>
                        <Text style={[rt.priorityBadge, {
                          color: pp.priority === 'Critical' ? '#8b2020' : pp.priority === 'High' ? '#8a6010' : '#3a4f62',
                          backgroundColor: pp.priority === 'Critical' ? '#fdf0f0' : pp.priority === 'High' ? '#fdf6e8' : PASTEL.slateBg,
                        }]}>{pp.priority}</Text>
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
              const phaseColor = isGoLive ? '#2d6a35' : '#1a5f85';
              const phaseBg = isGoLive ? PASTEL.greenBg : PASTEL.blueBg;
              return (
                <View key={`${region}-${j}`} style={[rt.pipeCard, { borderLeftColor: phaseColor, backgroundColor: phaseBg, marginBottom: 8 }]}>
                  <View style={rt.pipeCardTop}>
                    <Text style={rt.pipeCardName} numberOfLines={1}>{pp.summary}</Text>
                    <View style={[rt.phaseBadge, { backgroundColor: isGoLive ? PASTEL.greenBg : PASTEL.lavBg, borderColor: isGoLive ? PASTEL.greenBorder : PASTEL.lavBorder }]}>
                      <Text style={[rt.phaseText, { color: isGoLive ? PASTEL.greenText : PASTEL.lavText }]}>{region}</Text>
                    </View>
                  </View>
                  <View style={rt.pipeCardRow}>
                    <Text style={rt.pipeCardMeta}>{pp.currentStatus} · {pp.dosageForm}</Text>
                    <Text style={[rt.pipeCardRev, { color: phaseColor }]}>{fmt(pp.totalRevenue)}</Text>
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
  content: { padding: 16, paddingBottom: 48 },
  filterBlock: { backgroundColor: '#f8f9fb', borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, padding: 12, marginBottom: 4 },
  filterLabel: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: COLORS.gray500, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 7 },
  filterRow: { flexDirection: 'row', alignItems: 'center' },
  empty: { paddingVertical: 24, alignItems: 'center' },
  emptyTxt: { fontSize: 12, fontFamily: 'Poppins-Regular', color: COLORS.gray400 },
  regionCard: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  regionCardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  regionIconWrap: { width: 28, height: 28, borderRadius: 8, backgroundColor: PASTEL.blueBg, borderWidth: 1, borderColor: PASTEL.blueBorder, alignItems: 'center', justifyContent: 'center' },
  regionCardTitle: { flex: 1, fontSize: 13, fontFamily: 'Poppins-Bold', color: COLORS.dark },
  regionCardRight: { alignItems: 'flex-end' },
  regionSkuCount: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: COLORS.gray600 },
  regionRev: { fontSize: 11, fontFamily: 'Poppins-Bold', color: '#2d6a35', marginTop: 2 },
  compBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 12 },
  compBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  compDot: { width: 5, height: 5, borderRadius: 2.5 },
  compBadgeText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  skuTable: { backgroundColor: '#fafbfc', borderRadius: 8, borderWidth: 1, borderColor: '#eef0f3', overflow: 'hidden' },
  skuTableHead: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#f2f4f7', borderBottomWidth: 1, borderBottomColor: '#eef0f3' },
  skuTableH: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: COLORS.gray500, textTransform: 'uppercase', letterSpacing: 0.5 },
  skuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 9, gap: 6 },
  skuRowBorder: { borderBottomWidth: 1, borderBottomColor: '#eef0f3' },
  skuName: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  skuSub: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500, marginTop: 1 },
  techBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, alignSelf: 'flex-start' },
  techText: { fontSize: 9, fontFamily: 'Poppins-SemiBold' },
  skuRev: { fontSize: 11, fontFamily: 'Poppins-Bold', color: '#2d6a35', textAlign: 'right' },
  pipeSect: { marginTop: 12 },
  pipeHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  pipeHeaderText: { fontSize: 10, fontFamily: 'Poppins-Bold', color: '#4a2d8a', textTransform: 'uppercase', letterSpacing: 0.6 },
  pipeCard: { borderLeftWidth: 3, borderRadius: 8, padding: 10, marginBottom: 6 },
  pipeCardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 5 },
  pipeCardName: { flex: 1, fontSize: 11, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  phaseBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
  phaseText: { fontSize: 9, fontFamily: 'Poppins-SemiBold' },
  pipeCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  pipeCardMeta: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  pipeCardRev: { fontSize: 11, fontFamily: 'Poppins-Bold' },
  pipeCardCo: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  priorityBadge: { fontSize: 9, fontFamily: 'Poppins-Bold', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
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
          <Text style={[cu.kpiVal, { color: COLORS.primary }]}>{byCustomer.length}</Text>
          <Text style={cu.kpiLabel}>Customers</Text>
        </View>
        <View style={[cu.kpiDivider]} />
        <View style={cu.kpi}>
          <Text style={[cu.kpiVal, { color: COLORS.success }]}>{fmt(totalRev)}</Text>
          <Text style={cu.kpiLabel}>Total Revenue</Text>
        </View>
        <View style={[cu.kpiDivider]} />
        <View style={cu.kpi}>
          <Text style={[cu.kpiVal, { color: difotColor }]}>{avgDifot.toFixed(1)}%</Text>
          <Text style={cu.kpiLabel}>Avg DIFOT</Text>
        </View>
      </View>

      <SH label="Customer Details" icon={<Users size={12} color={COLORS.gray500} />} />

      {byCustomer.map(({ name, rows, revenue, avgDifot: difot, company }) => {
        const cc = COMPANY_COLORS[company] || COLORS.primary;
        const expanded = expandedCustomer === name;
        const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

        return (
          <View key={name} style={cu.custCard}>
            {/* Header row */}
            <TouchableOpacity style={cu.custHead} onPress={() => setExpandedCustomer(expanded ? null : name)} activeOpacity={0.8}>
              <View style={[cu.avatar, { backgroundColor: cc + '18' }]}>
                <Text style={[cu.avatarText, { color: cc }]}>{initials}</Text>
              </View>
              <View style={cu.custInfo}>
                <Text style={cu.custName}>{name}</Text>
                <View style={cu.custMeta}>
                  <View style={[cu.compTag, { backgroundColor: cc + '15' }]}>
                    <View style={[cu.compDot, { backgroundColor: cc }]} />
                    <Text style={[cu.compTagText, { color: cc }]}>{company}</Text>
                  </View>
                  <Text style={cu.skuCountText}>{rows.length} SKU{rows.length > 1 ? 's' : ''}</Text>
                </View>
              </View>
              <View style={cu.custRight}>
                {revenue > 0 && <Text style={cu.custRev}>{fmt(revenue)}</Text>}
                <Text style={cu.custRevLabel}>Revenue</Text>
              </View>
            </TouchableOpacity>

            {/* DIFOT bar */}
            <View style={cu.difotRow}>
              <Text style={cu.difotLabel}>DIFOT</Text>
              <DifotBar pct={difot} />
            </View>

            {/* Expand toggle */}
            <TouchableOpacity
              style={cu.toggleRow}
              onPress={() => setExpandedCustomer(expanded ? null : name)}
              activeOpacity={0.75}
            >
              <Text style={cu.toggleText}>{expanded ? 'Hide SKU Details' : 'View SKU Details'}</Text>
              <ChevronRight size={13} color={COLORS.gray500} style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }} />
            </TouchableOpacity>

            {/* SKU wise detail (collapsible) */}
            {expanded && (
              <View style={cu.skuSection}>
                {/* Table header */}
                <View style={cu.skuTableHead}>
                  <Text style={[cu.skuTableH, { flex: 2 }]}>SKU / Technology</Text>
                  <Text style={[cu.skuTableH, { flex: 1, textAlign: 'center' }]}>DIFOT</Text>
                  <Text style={[cu.skuTableH, { flex: 1, textAlign: 'right' }]}>Revenue</Text>
                </View>
                {rows.map((r, i) => {
                  const inv = revenueData.find(rv => rv.material === r.materialCode && rv.customerName === name);
                  const dColor = r.difotPercent >= 95 ? COLORS.primary : r.difotPercent >= 80 ? COLORS.gold : COLORS.error;
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
  content: { padding: 16, paddingBottom: 48 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 60 },
  emptyText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: COLORS.gray400 },
  kpiRow: { flexDirection: 'row', backgroundColor: COLORS.cardBg, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 14, paddingHorizontal: 8, marginBottom: 4, gap: 0 },
  kpi: { flex: 1, alignItems: 'center', gap: 4 },
  kpiDivider: { width: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  kpiVal: { fontSize: 16, fontFamily: 'Poppins-Bold' },
  kpiLabel: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500, textAlign: 'center' },
  custCard: { backgroundColor: COLORS.cardBg, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  custHead: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, paddingBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontFamily: 'Poppins-Bold' },
  custInfo: { flex: 1 },
  custName: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark, marginBottom: 5 },
  custMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  compTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  compDot: { width: 5, height: 5, borderRadius: 2.5 },
  compTagText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  skuCountText: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  custRight: { alignItems: 'flex-end', gap: 2 },
  custRev: { fontSize: 14, fontFamily: 'Poppins-Bold', color: COLORS.success },
  custRevLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray400 },
  difotRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingBottom: 10, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
  difotLabel: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: COLORS.gray600, width: 40 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 9, borderTopWidth: 1, borderTopColor: COLORS.border },
  toggleText: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: COLORS.gray600 },
  skuSection: { borderTopWidth: 1, borderTopColor: COLORS.border },
  skuTableHead: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 7, backgroundColor: COLORS.cream, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  skuTableH: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: COLORS.gray500, textTransform: 'uppercase', letterSpacing: 0.4 },
  skuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, gap: 6 },
  skuRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  skuRowName: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: COLORS.dark, marginBottom: 2 },
  skuRowSub: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  skuDifot: { fontSize: 12, fontFamily: 'Poppins-Bold' },
  skuRev: { flex: 1, fontSize: 12, fontFamily: 'Poppins-Bold', color: COLORS.success, textAlign: 'right' },
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
          <Pill key={p} label={p} active={period === p} color={COLORS.info} onPress={() => setPeriod(p)} />
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
          <View style={[rv.listIcon, { backgroundColor: PASTEL.blueBg, borderColor: PASTEL.blueBorder }]}>
            <Globe size={11} color={PASTEL.blueText} />
          </View>
          <Text style={rv.listLabel} numberOfLines={1}>{region}</Text>
          <View style={rv.barTrack}>
            <View style={[rv.barFill, { width: `${(rev / maxReg) * 100}%`, backgroundColor: COLORS.info + 'AA' }]} />
          </View>
          <Text style={[rv.listVal, { color: PASTEL.blueText }]}>{fmt(rev)}</Text>
        </View>
      ))}

      <SH label="By Customer" icon={<Users size={12} color={COLORS.gray500} />} />
      {byCustomer.map(([cust, rev]) => {
        const pct = totalRev > 0 ? (rev / totalRev) * 100 : 0;
        return (
          <View key={cust} style={rv.listRow}>
            <View style={[rv.listIcon, { backgroundColor: PASTEL.tealBg, borderColor: PASTEL.tealBorder }]}>
              <Users size={11} color={PASTEL.tealText} />
            </View>
            <Text style={rv.listLabel} numberOfLines={1}>{cust}</Text>
            <View style={rv.barTrack}>
              <View style={[rv.barFill, { width: `${pct}%`, backgroundColor: '#4a90a4AA' }]} />
            </View>
            <Text style={[rv.listVal, { color: PASTEL.tealText }]}>{fmt(rev)}</Text>
          </View>
        );
      })}

      <SH label="By Company" icon={<Package size={12} color={COLORS.gray500} />} />
      {byCompany.map(([comp, rev]) => {
        const cc = COMPANY_COLORS[comp] || COLORS.primary;
        const cpStyle = cp(comp);
        const pct = totalRev > 0 ? (rev / totalRev) * 100 : 0;
        return (
          <View key={comp} style={rv.listRow}>
            <View style={[rv.listIcon, { backgroundColor: cpStyle.bg, borderColor: cpStyle.border }]}>
              <View style={[rv.compCircle, { backgroundColor: cc }]} />
            </View>
            <Text style={rv.listLabel}>{comp}</Text>
            <View style={rv.barTrack}>
              <View style={[rv.barFill, { width: `${pct}%`, backgroundColor: cc + '80' }]} />
            </View>
            <Text style={[rv.listVal, { color: cpStyle.text }]}>{fmt(rev)}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const rv = StyleSheet.create({
  content: { padding: 16, paddingBottom: 48 },
  heroCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: PASTEL.greenBg, borderWidth: 1, borderColor: PASTEL.greenBorder, borderRadius: 12, padding: 16, marginBottom: 12 },
  heroLeft: {},
  heroAmount: { fontSize: 26, fontFamily: 'Poppins-Bold', color: PASTEL.greenText },
  heroLabel: { fontSize: 10, fontFamily: 'Poppins-Regular', color: '#5a8f62', marginTop: 2 },
  yearFilters: { flexDirection: 'row', gap: 6 },
  yearChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: PASTEL.greenBorder, backgroundColor: '#fff' },
  yearChipActive: { backgroundColor: PASTEL.greenText, borderColor: PASTEL.greenText },
  yearChipText: { fontSize: 11, fontFamily: 'Poppins-Bold', color: PASTEL.greenText },
  yearChipTextActive: { color: '#fff' },
  periodRow: { flexDirection: 'row', paddingBottom: 12 },
  chartCard: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 12 },
  chartTitle: { fontSize: 10, fontFamily: 'Poppins-Bold', color: COLORS.gray500, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  barLabel: { flex: 1, fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray400, textAlign: 'center' },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f2f4f7', gap: 8 },
  listIcon: { width: 24, height: 24, borderRadius: 7, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  compCircle: { width: 8, height: 8, borderRadius: 4 },
  listLabel: { flex: 1, fontSize: 12, fontFamily: 'Poppins-Regular', color: COLORS.dark },
  barTrack: { width: 70, height: 5, backgroundColor: '#f0f2f5', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 5, borderRadius: 3 },
  listVal: { fontSize: 12, fontFamily: 'Poppins-Bold', minWidth: 52, textAlign: 'right' },
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
  const col = tc(group.therapeutic);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[sid.overlay, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>
      <Animated.View style={[sid.drawer, { width: drawerW, transform: [{ translateX: slideAnim }] }]}>

        {/* Header */}
        <View style={[sid.header, { backgroundColor: col.bg, borderBottomColor: col.border }]}>
          <View style={sid.headerTop}>
            <View style={[sid.molIconWrap, { backgroundColor: col.dot + '22', borderColor: col.border }]}>
              <FlaskConical size={18} color={col.dot} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[sid.molName, { color: col.text }]}>{group.molecule}</Text>
              <View style={[sid.taBadge, { backgroundColor: col.dot + '15', borderColor: col.dot + '40' }]}>
                <Text style={[sid.taText, { color: col.dot }]}>{group.therapeutic}</Text>
              </View>
            </View>
            <TouchableOpacity style={[sid.closeBtn, { borderColor: col.border }]} onPress={onClose} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <X size={16} color={col.text} />
            </TouchableOpacity>
          </View>
          {/* Stats row */}
          <View style={[sid.statsRow, { backgroundColor: '#fff', borderColor: col.border }]}>
            {[
              { val: group.products.length, lbl: 'SKUs' },
              { val: group.companies.length, lbl: 'Companies' },
              { val: group.regions.length, lbl: 'Regions' },
              { val: group.dosageForms.length, lbl: 'Forms' },
            ].map((s, i, arr) => (
              <React.Fragment key={s.lbl}>
                <View style={sid.stat}>
                  <Text style={[sid.statVal, { color: col.text }]}>{s.val}</Text>
                  <Text style={sid.statLabel}>{s.lbl}</Text>
                </View>
                {i < arr.length - 1 && <View style={[sid.statDiv, { backgroundColor: col.border }]} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Tab bar */}
        <View style={sid.tabBar}>
          {SIDEBAR_TABS.map(t => {
            const isActive = activeTab === t;
            return (
              <TouchableOpacity key={t} style={[sid.tabBtn, isActive && { borderBottomColor: col.dot }]} onPress={() => setActiveTab(t)} activeOpacity={0.8}>
                {t === 'Region' && <Globe size={13} color={isActive ? col.dot : COLORS.gray400} />}
                {t === 'Customer' && <Users size={13} color={isActive ? col.dot : COLORS.gray400} />}
                {t === 'Revenue' && <TrendingUp size={13} color={isActive ? col.dot : COLORS.gray400} />}
                <Text style={[sid.tabText, isActive && { color: col.dot }]}>{t}</Text>
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
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,35,25,0.55)' },
  drawer: { position: 'absolute', right: 0, top: 0, bottom: 0, backgroundColor: '#f8f9fb', shadowColor: '#000', shadowOffset: { width: -6, height: 0 }, shadowOpacity: 0.14, shadowRadius: 24, elevation: 28 },
  header: { paddingTop: 18, paddingBottom: 14, paddingHorizontal: 18, borderBottomWidth: 1 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  molIconWrap: { width: 42, height: 42, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  molName: { fontSize: 17, fontFamily: 'Poppins-Bold', marginBottom: 4 },
  taBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  taText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  closeBtn: { width: 32, height: 32, borderRadius: 10, borderWidth: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, paddingVertical: 10 },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 16, fontFamily: 'Poppins-Bold' },
  statLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 1 },
  statDiv: { width: 1, marginVertical: 4 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 12, borderBottomWidth: 2.5, borderBottomColor: 'transparent' },
  tabText: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: COLORS.gray400 },
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
              const col = grp ? tc(grp.therapeutic) : { bg: PASTEL.slateBg, border: PASTEL.slateBorder, text: PASTEL.slateText, dot: '#607D8B' };
              const isActive = moleculeFilter === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[main.molChip,
                    isActive
                      ? { backgroundColor: m === 'All' ? COLORS.dark : col.dot, borderColor: m === 'All' ? COLORS.dark : col.dot }
                      : { backgroundColor: m === 'All' ? '#f8f9fb' : col.bg, borderColor: m === 'All' ? COLORS.border : col.border }
                  ]}
                  onPress={() => { setMoleculeFilter(m); setPage(1); }}
                  activeOpacity={0.78}
                >
                  {m !== 'All' && <FlaskConical size={9} color={isActive ? '#fff' : col.dot} />}
                  <Text style={[main.molChipText, { color: isActive ? '#fff' : m === 'All' ? COLORS.gray600 : col.text }]}>{m}</Text>
                  {grp && (
                    <View style={[main.molChipBadge, { backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : col.dot + '20' }]}>
                      <Text style={[main.molChipBadgeText, { color: isActive ? '#fff' : col.dot }]}>{grp.products.length}</Text>
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
            const col = tc(group.therapeutic);
            return (
              <View key={group.molecule} style={[main.molCard, { borderLeftColor: col.dot, borderLeftWidth: 3 }]}>
                {/* Card header */}
                <View style={[main.cardHead, { backgroundColor: col.bg }]}>
                  <View style={[main.cardIconWrap, { backgroundColor: col.dot + '20', borderColor: col.border }]}>
                    <FlaskConical size={16} color={col.dot} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[main.cardMolName, { color: col.text }]}>{group.molecule}</Text>
                    <View style={[main.taChip, { backgroundColor: col.dot + '15', borderColor: col.dot + '40' }]}>
                      <Text style={[main.taChipText, { color: col.dot }]}>{group.therapeutic}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[main.detailBtn, { borderColor: col.dot, backgroundColor: '#fff' }]}
                    onPress={() => openSidebar(group)}
                    activeOpacity={0.8}
                  >
                    <Text style={[main.detailBtnText, { color: col.dot }]}>Details</Text>
                    <ArrowUpRight size={11} color={col.dot} />
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
                        <Text style={[main.statVal, { color: col.dot }]}>{s.val}</Text>
                        <Text style={main.statLbl}>{s.lbl}</Text>
                      </View>
                      {i < arr.length - 1 && <View style={main.statDivider} />}
                    </React.Fragment>
                  ))}
                </View>

                {/* Company badges */}
                <View style={main.compRow}>
                  {group.companies.map(c => {
                    const cpStyle = cp(c);
                    return (
                      <View key={c} style={[main.compBadge, { backgroundColor: cpStyle.bg, borderColor: cpStyle.border }]}>
                        <View style={[main.compDot, { backgroundColor: COMPANY_COLORS[c] || COLORS.primary }]} />
                        <Text style={[main.compBadgeText, { color: cpStyle.text }]}>{c}</Text>
                      </View>
                    );
                  })}
                </View>

                {/* Products horizontal scroll */}
                <View style={main.prodDivider}>
                  <View style={main.prodDivLine} />
                  <Text style={main.prodDivLabel}>Products</Text>
                  <View style={main.prodDivLine} />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={main.prodScroll}>
                  {group.products.map(p => {
                    const cpStyle = cp(p.company);
                    return (
                      <TouchableOpacity
                        key={p.productCode}
                        style={[main.prodChip, { borderColor: cpStyle.border, backgroundColor: cpStyle.bg }]}
                        onPress={() => openSidebar(group)}
                        activeOpacity={0.78}
                      >
                        <Text style={[main.prodChipName, { color: cpStyle.text }]} numberOfLines={1}>{p.product}</Text>
                        <Text style={main.prodChipSub}>{p.strength} · {p.dosage}</Text>
                        <Text style={main.prodChipCountry}>{p.country}</Text>
                      </TouchableOpacity>
                    );
                  })}
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
  root: { flex: 1, backgroundColor: '#f4f6f9' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#fff' },
  headerSub: { fontSize: 11, fontFamily: 'Poppins-Regular', color: 'rgba(255,255,255,0.75)', marginTop: 3 },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fb', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 9, gap: 9, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, fontSize: 13, fontFamily: 'Poppins-Regular', color: COLORS.dark, padding: 0 },
  filterBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: 8 },
  filterBarContent: { paddingHorizontal: 16, gap: 6, alignItems: 'center' },
  molFilterBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: 10, paddingHorizontal: 16 },
  molFilterTitle: { fontSize: 9, fontFamily: 'Poppins-Bold', color: COLORS.gray500, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 },
  molFilterScroll: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  molChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingLeft: 10, paddingRight: 7, paddingVertical: 5, borderRadius: 20, borderWidth: 1.2 },
  molChipText: { fontSize: 11, fontFamily: 'Poppins-SemiBold' },
  molChipBadge: { minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  molChipBadgeText: { fontSize: 9, fontFamily: 'Poppins-Bold' },
  cardWrap: { padding: 16 },
  resultMeta: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray500, marginBottom: 10 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 56, gap: 12 },
  emptyText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: COLORS.gray400, textAlign: 'center' },
  molCard: { backgroundColor: '#fff', borderRadius: 13, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardHead: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingBottom: 12, gap: 10 },
  cardIconWrap: { width: 38, height: 38, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  cardMolName: { fontSize: 15, fontFamily: 'Poppins-Bold', marginBottom: 4 },
  taChip: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 7, borderWidth: 1 },
  taChipText: { fontSize: 9, fontFamily: 'Poppins-Bold' },
  detailBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5 },
  detailBtnText: { fontSize: 11, fontFamily: 'Poppins-SemiBold' },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f0f2f5', backgroundColor: '#fafbfc' },
  statCell: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  statVal: { fontSize: 17, fontFamily: 'Poppins-Bold' },
  statLbl: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 1 },
  statDivider: { width: 1, backgroundColor: '#f0f2f5', marginVertical: 8 },
  compRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 14, paddingTop: 10 },
  compBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  compDot: { width: 6, height: 6, borderRadius: 3 },
  compBadgeText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  prodDivider: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 14, marginTop: 12 },
  prodDivLine: { flex: 1, height: 1, backgroundColor: '#f0f2f5' },
  prodDivLabel: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: 0.5 },
  prodScroll: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  prodChip: { borderWidth: 1, borderRadius: 10, padding: 10, minWidth: 128 },
  prodChipName: { fontSize: 11, fontFamily: 'Poppins-SemiBold', marginBottom: 2 },
  prodChipSub: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500, marginBottom: 1 },
  prodChipCountry: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray400 },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border },
  pgBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  pgBtnDis: { borderColor: '#f0f2f5', backgroundColor: '#f8f9fb' },
  pgText: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  pgInfo: { fontSize: 12, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  pgNum: { fontFamily: 'Poppins-Bold', color: COLORS.dark },
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
