import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, useWindowDimensions, Modal,
  Animated, TouchableWithoutFeedback, Platform,
} from 'react-native';
import Svg, { Polyline, Circle, Rect, Line } from 'react-native-svg';
import { Search, X, ChevronLeft, ChevronRight, FlaskConical, Globe, Users, TrendingUp, MapPin, Building2, Pill, ChartBar as BarChart2, ChevronDown, ChevronUp, ArrowUpRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  COLORS, COMPANY_COLORS, productPortfolio, companyMetrics,
  rdData, goLanzarData, revenueData, customerViewData, monthlyRevenue,
} from '@/data/mockData';
import StatusBadge from '@/components/ui/StatusBadge';
import FilterChip from '@/components/ui/FilterChip';
import CustomerStatusTab from '@/components/ui/CustomerStatusTab';

const TOP_TABS = ['Product Portfolio', 'Customer Details'];
const COMPANIES = ['All', 'Strides', 'Instapill', 'One Source', 'Naari', 'Solara'];
const PAGE_SIZE = 6;

const THERAPEUTIC_COLORS: Record<string, string> = {
  Diabetes: '#3a7d44',
  Cardiovascular: '#c0392b',
  'Anti-infective': '#df6d14',
  GI: '#4a90a4',
  Antiretroviral: '#c9a84c',
  "Women's Health": '#d63384',
  CNS: '#7952b3',
};
const tColor = (t: string) => THERAPEUTIC_COLORS[t] || '#607D8B';

function fmt(v: number) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
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

function SparkLine({ data, color, h = 40 }: { data: number[]; color: string; h?: number }) {
  const [w, setW] = useState(0);
  if (!data || data.length < 2) return null;
  const mx = Math.max(...data), mn = Math.min(...data), range = mx - mn || 1, pad = 4;
  if (w === 0) return <View style={{ height: h }} onLayout={e => setW(e.nativeEvent.layout.width)} />;
  const pts = data.map((v, i) => `${pad + (i / (data.length - 1)) * (w - pad * 2)},${pad + ((mx - v) / range) * (h - pad * 2)}`);
  const [lx, ly] = pts[pts.length - 1].split(',');
  return (
    <View onLayout={e => setW(e.nativeEvent.layout.width)}>
      <Svg width={w} height={h}>
        <Polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={lx} cy={ly} r={3.5} fill={color} />
      </Svg>
    </View>
  );
}

function BarChart({ data, color, h = 48 }: { data: { label: string; value: number }[]; color: string; h?: number }) {
  const [w, setW] = useState(0);
  if (w === 0) return <View style={{ height: h }} onLayout={e => setW(e.nativeEvent.layout.width)} />;
  const max = Math.max(...data.map(d => d.value)) || 1;
  const barW = (w - (data.length - 1) * 4) / data.length;
  return (
    <View onLayout={e => setW(e.nativeEvent.layout.width)}>
      <Svg width={w} height={h}>
        {data.map((d, i) => {
          const bh = Math.max(2, (d.value / max) * (h - 4));
          return <Rect key={i} x={i * (barW + 4)} y={h - 4 - bh} width={barW} height={bh} rx={2} fill={color + 'CC'} />;
        })}
      </Svg>
    </View>
  );
}

function DifotGauge({ pct, color }: { pct: number; color: string }) {
  const bg = color + '20';
  const fill = pct >= 95 ? COLORS.success : pct >= 80 ? COLORS.warning : COLORS.error;
  return (
    <View style={gauge.wrap}>
      <View style={[gauge.track, { backgroundColor: bg }]}>
        <View style={[gauge.fill, { width: `${pct}%`, backgroundColor: fill }]} />
      </View>
      <Text style={[gauge.pct, { color: fill }]}>{pct.toFixed(1)}%</Text>
    </View>
  );
}
const gauge = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  pct: { fontSize: 11, fontFamily: 'Poppins-SemiBold', width: 38, textAlign: 'right' },
});

// ─── Molecule Sidebar ──────────────────────────────────────────────────────────

const SIDEBAR_TABS = ['Region', 'Customer', 'Revenue'] as const;
type SidebarTab = typeof SIDEBAR_TABS[number];

function RegionTab({ group }: { group: MolGroup }) {
  const [regionFilter, setRegionFilter] = useState('All');
  const [companyFilter, setCompanyFilter] = useState('All');

  const allRegions = ['All', ...group.regions];
  const allCompanies = ['All', ...group.companies];

  const filtered = group.products.filter(p =>
    (regionFilter === 'All' || p.region === regionFilter) &&
    (companyFilter === 'All' || p.company === companyFilter)
  );

  const regionStats = useMemo(() => {
    const map: Record<string, { skus: number; companies: Set<string>; revenue: number }> = {};
    filtered.forEach(p => {
      if (!map[p.region]) map[p.region] = { skus: 0, companies: new Set(), revenue: 0 };
      map[p.region].skus++;
      map[p.region].companies.add(p.company);
      const inv = revenueData.find(r => r.material === p.productCode);
      map[p.region].revenue += inv ? inv.invoiceValLC : 0;
    });
    return Object.entries(map).map(([region, v]) => ({ region, skus: v.skus, companies: v.companies.size, revenue: v.revenue }));
  }, [filtered]);

  const pipeline = [...rdData, ...goLanzarData].filter(p =>
    p.molecule.toLowerCase().includes(group.molecule.toLowerCase()) ||
    group.molecule.toLowerCase().includes(p.molecule.toLowerCase())
  );

  return (
    <View style={sb.tabContent}>
      <View style={sb.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={sb.filterChips}>
          {allRegions.map(r => (
            <TouchableOpacity key={r} style={[sb.chip, regionFilter === r && { backgroundColor: COLORS.primary }]} onPress={() => setRegionFilter(r)}>
              <Text style={[sb.chipText, regionFilter === r && { color: '#fff' }]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={sb.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={sb.filterChips}>
          {allCompanies.map(c => {
            const cc = COMPANY_COLORS[c] || COLORS.primary;
            return (
              <TouchableOpacity key={c} style={[sb.chip, companyFilter === c && { backgroundColor: cc }]} onPress={() => setCompanyFilter(c)}>
                <Text style={[sb.chipText, companyFilter === c && { color: '#fff' }]}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <Text style={sb.sectionLabel}>Region Overview</Text>
      {regionStats.map(rs => (
        <View key={rs.region} style={sb.regionCard}>
          <View style={sb.regionCardHead}>
            <View style={sb.regionIcon}><Globe size={13} color={COLORS.info} /></View>
            <Text style={sb.regionName}>{rs.region}</Text>
            {rs.revenue > 0 && <Text style={[sb.regionRev, { color: COLORS.success }]}>{fmt(rs.revenue)}</Text>}
          </View>
          <View style={sb.regionStats}>
            <View style={sb.regionStat}><Text style={sb.regionStatVal}>{rs.skus}</Text><Text style={sb.regionStatLabel}>SKUs</Text></View>
            <View style={sb.regionStat}><Text style={sb.regionStatVal}>{rs.companies}</Text><Text style={sb.regionStatLabel}>Companies</Text></View>
          </View>
        </View>
      ))}

      <Text style={[sb.sectionLabel, { marginTop: 16 }]}>SKU Details</Text>
      {filtered.map(p => {
        const cc = COMPANY_COLORS[p.company] || COLORS.primary;
        return (
          <View key={p.productCode} style={sb.skuRow}>
            <View style={[sb.skuDot, { backgroundColor: cc }]} />
            <View style={sb.skuLeft}>
              <Text style={sb.skuName}>{p.product}</Text>
              <Text style={sb.skuMeta}>{p.strength} · {p.dosage}</Text>
              <View style={sb.skuTags}>
                <View style={[sb.tag, { borderColor: cc + '60', backgroundColor: cc + '10' }]}><Text style={[sb.tagText, { color: cc }]}>{p.company}</Text></View>
                <View style={sb.tag}><MapPin size={9} color={COLORS.gray500} /><Text style={sb.tagText}>{p.region}</Text></View>
                <View style={[sb.tag, { borderColor: tColor(p.therapeutic) + '60', backgroundColor: tColor(p.therapeutic) + '10' }]}>
                  <Text style={[sb.tagText, { color: tColor(p.therapeutic) }]}>{p.therapeutic}</Text>
                </View>
              </View>
            </View>
            <StatusBadge label={p.partnerStatus} type={p.partnerStatus === 'In-House' ? 'success' : p.partnerStatus === 'Partner' ? 'primary' : 'info'} size="sm" />
          </View>
        );
      })}

      {pipeline.length > 0 && (
        <>
          <Text style={[sb.sectionLabel, { marginTop: 16 }]}>Pipeline Products</Text>
          {pipeline.map((p, i) => (
            <View key={i} style={sb.pipeRow}>
              <View style={sb.pipeLeft}>
                <Text style={sb.pipeName} numberOfLines={1}>{p.summary}</Text>
                <Text style={sb.pipeMeta}>{p.currentStatus} · {p.referenceMarket}</Text>
              </View>
              <View style={sb.pipeRight}>
                <Text style={[sb.pipeRev, { color: COMPANY_COLORS[p.company] || COLORS.primary }]}>{fmt(p.totalRevenue)}</Text>
                <StatusBadge label={p.priority} type={p.priority === 'Critical' ? 'error' : p.priority === 'High' ? 'warning' : 'neutral'} size="sm" />
              </View>
            </View>
          ))}
        </>
      )}
    </View>
  );
}

function CustomerTab({ group }: { group: MolGroup }) {
  const customers = customerViewData.filter(cv =>
    group.products.some(p => p.productCode === cv.materialCode)
  );

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
      <View style={sb.tabContent}>
        <View style={sb.empty}><Users size={28} color={COLORS.gray300} /><Text style={sb.emptyText}>No customer data</Text></View>
      </View>
    );
  }

  return (
    <View style={sb.tabContent}>
      <View style={sb.summaryRow}>
        <View style={sb.summaryCard}>
          <Text style={[sb.summaryVal, { color: COLORS.primary }]}>{byCustomer.length}</Text>
          <Text style={sb.summaryLabel}>Customers</Text>
        </View>
        <View style={sb.summaryCard}>
          <Text style={[sb.summaryVal, { color: COLORS.success }]}>{fmt(byCustomer.reduce((s, c) => s + c.revenue, 0))}</Text>
          <Text style={sb.summaryLabel}>Total Revenue</Text>
        </View>
        <View style={sb.summaryCard}>
          <Text style={[sb.summaryVal, { color: COLORS.info }]}>{(byCustomer.reduce((s, c) => s + c.avgDifot, 0) / byCustomer.length).toFixed(1)}%</Text>
          <Text style={sb.summaryLabel}>Avg DIFOT</Text>
        </View>
      </View>

      {byCustomer.map(({ name, rows, revenue, avgDifot, company }) => {
        const cc = COMPANY_COLORS[company] || COLORS.primary;
        return (
          <View key={name} style={sb.custCard}>
            <View style={sb.custHead}>
              <View style={[sb.custIcon, { backgroundColor: cc + '18' }]}>
                <Text style={[sb.custIconText, { color: cc }]}>{name.substring(0, 2).toUpperCase()}</Text>
              </View>
              <View style={sb.custHeadRight}>
                <Text style={sb.custName}>{name}</Text>
                <View style={[sb.compTag, { backgroundColor: cc + '15', borderColor: cc + '40' }]}>
                  <View style={[sb.compDot, { backgroundColor: cc }]} /><Text style={[sb.compTagText, { color: cc }]}>{company}</Text>
                </View>
              </View>
              {revenue > 0 && <Text style={[sb.custRev, { color: COLORS.success }]}>{fmt(revenue)}</Text>}
            </View>
            <View style={sb.custDifot}>
              <Text style={sb.difotLabel}>DIFOT</Text>
              <DifotGauge pct={avgDifot} color={cc} />
            </View>
            <Text style={sb.skuWiseLabel}>SKU Wise DIFOT & Revenue</Text>
            {rows.map((r, i) => {
              const inv = revenueData.find(rv => rv.material === r.materialCode && rv.customerName === name);
              return (
                <View key={i} style={[sb.skuLine, i < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: COLORS.gray100 }]}>
                  <View style={sb.skuLineLeft}>
                    <Text style={sb.skuLineName} numberOfLines={1}>{r.materialDesc}</Text>
                    <Text style={sb.skuLineMeta}>{r.materialCode} · DIFOT {r.difotPercent}%</Text>
                  </View>
                  <Text style={[sb.skuLineRev, { color: cc }]}>{inv ? fmt(inv.invoiceValLC) : '—'}</Text>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const YEAR_FILTERS = ['CY', 'PY'];
const PERIOD_FILTERS = ['Monthly', 'Quarterly', 'HY', 'Yearly'];

function RevenueTab({ group }: { group: MolGroup }) {
  const [yearFilter, setYearFilter] = useState('CY');
  const [periodFilter, setPeriodFilter] = useState('Quarterly');

  const productCodes = group.products.map(p => p.productCode);
  const invoices = revenueData.filter(r => productCodes.includes(r.material));

  const totalRevenue = invoices.reduce((s, r) => s + r.invoiceValLC, 0);

  const byRegion = useMemo(() => {
    const map: Record<string, number> = {};
    invoices.forEach(inv => {
      const p = group.products.find(pp => pp.productCode === inv.material);
      const region = p?.region || 'Unknown';
      map[region] = (map[region] || 0) + inv.invoiceValLC;
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

  const sparkData = useMemo(() => {
    return monthlyRevenue.slice(-8).map(row => {
      const total = group.companies.reduce((s, c) => {
        const k = c === 'One Source' ? 'oneSource' : c === 'Instapill' ? 'instapill' : c.toLowerCase() as any;
        return s + ((row as any)[k] || 0);
      }, 0);
      return total;
    });
  }, [group.companies]);

  const quarterlyData = useMemo(() => {
    const map: Record<string, number> = {};
    invoices.forEach(inv => { map[inv.quarter] = (map[inv.quarter] || 0) + inv.invoiceValLC; });
    return Object.entries(map).map(([label, value]) => ({ label: label.replace(' 2024', ''), value }));
  }, [invoices]);

  const chartData = periodFilter === 'Quarterly' ? quarterlyData
    : monthlyRevenue.slice(-6).map(row => ({
        label: row.month.replace(' 24', ''),
        value: group.companies.reduce((s, c) => {
          const k = c === 'One Source' ? 'oneSource' : c === 'Instapill' ? 'instapill' : c.toLowerCase() as any;
          return s + ((row as any)[k] || 0);
        }, 0),
      }));

  const maxReg = Math.max(...byRegion.map(r => r[1])) || 1;

  return (
    <View style={sb.tabContent}>
      <View style={sb.revHeader}>
        <View>
          <Text style={sb.revTotal}>{fmt(totalRevenue)}</Text>
          <Text style={sb.revTotalLabel}>Total Revenue</Text>
        </View>
        <View style={sb.revFilters}>
          {YEAR_FILTERS.map(f => (
            <TouchableOpacity key={f} style={[sb.revChip, yearFilter === f && { backgroundColor: COLORS.primary }]} onPress={() => setYearFilter(f)}>
              <Text style={[sb.revChipText, yearFilter === f && { color: '#fff' }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={sb.periodRow}>
        {PERIOD_FILTERS.map(f => (
          <TouchableOpacity key={f} style={[sb.periodChip, periodFilter === f && { backgroundColor: COLORS.info }]} onPress={() => setPeriodFilter(f)}>
            <Text style={[sb.periodText, periodFilter === f && { color: '#fff' }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {sparkData.some(v => v > 0) && (
        <View style={sb.chartCard}>
          <Text style={sb.chartTitle}>Revenue Trend</Text>
          <SparkLine data={sparkData} color={COLORS.primary} h={50} />
        </View>
      )}

      {chartData.length > 0 && chartData.some(d => d.value > 0) && (
        <View style={sb.chartCard}>
          <Text style={sb.chartTitle}>{periodFilter} Breakdown</Text>
          <BarChart data={chartData} color={COLORS.info} h={52} />
          <View style={sb.barLabels}>
            {chartData.map((d, i) => <Text key={i} style={sb.barLabel}>{d.label}</Text>)}
          </View>
        </View>
      )}

      <Text style={sb.sectionLabel}>By Region</Text>
      {byRegion.map(([region, rev]) => (
        <View key={region} style={sb.revRow}>
          <View style={sb.revRowLeft}>
            <Globe size={11} color={COLORS.gray500} />
            <Text style={sb.revRowLabel}>{region}</Text>
          </View>
          <View style={sb.revBarWrap}>
            <View style={[sb.revBar, { width: `${(rev / maxReg) * 100}%`, backgroundColor: COLORS.info }]} />
          </View>
          <Text style={[sb.revRowVal, { color: COLORS.info }]}>{fmt(rev)}</Text>
        </View>
      ))}

      {byCustomer.length > 0 && (
        <>
          <Text style={[sb.sectionLabel, { marginTop: 16 }]}>By Customer</Text>
          {byCustomer.map(([cust, rev]) => (
            <View key={cust} style={sb.revRow}>
              <View style={sb.revRowLeft}>
                <Users size={11} color={COLORS.gray500} />
                <Text style={sb.revRowLabel} numberOfLines={1}>{cust}</Text>
              </View>
              <Text style={[sb.revRowVal, { color: COLORS.success }]}>{fmt(rev)}</Text>
            </View>
          ))}
        </>
      )}

      {byCompany.length > 0 && (
        <>
          <Text style={[sb.sectionLabel, { marginTop: 16 }]}>By Company</Text>
          {byCompany.map(([comp, rev]) => {
            const cc = COMPANY_COLORS[comp] || COLORS.primary;
            return (
              <View key={comp} style={sb.revRow}>
                <View style={sb.revRowLeft}>
                  <View style={[sb.compDot, { backgroundColor: cc }]} />
                  <Text style={sb.revRowLabel}>{comp}</Text>
                </View>
                <Text style={[sb.revRowVal, { color: cc }]}>{fmt(rev)}</Text>
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}

function MoleculeSidebar({ group, visible, onClose }: { group: MolGroup | null; visible: boolean; onClose: () => void }) {
  const { width: sw } = useWindowDimensions();
  const drawerW = Math.min(sw * 0.92, 480);
  const slideAnim = useRef(new Animated.Value(drawerW)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState<SidebarTab>('Region');

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 12 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: drawerW, duration: 200, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!group) return null;
  const tc = tColor(group.therapeutic);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[sid.overlay, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>
      <Animated.View style={[sid.drawer, { width: drawerW, transform: [{ translateX: slideAnim }] }]}>
        <LinearGradient colors={[tc + 'EE', tc + 'AA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={sid.header}>
          <View style={sid.headerInner}>
            <View style={sid.headerLeft}>
              <View style={sid.molIcon}><FlaskConical size={18} color="#fff" /></View>
              <View>
                <Text style={sid.molName}>{group.molecule}</Text>
                <Text style={sid.molTherapy}>{group.therapeutic}</Text>
              </View>
            </View>
            <TouchableOpacity style={sid.closeBtn} onPress={onClose} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <X size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={sid.headerStats}>
            <View style={sid.hStat}><Text style={sid.hStatVal}>{group.products.length}</Text><Text style={sid.hStatLabel}>SKUs</Text></View>
            <View style={sid.hStatDiv} />
            <View style={sid.hStat}><Text style={sid.hStatVal}>{group.companies.length}</Text><Text style={sid.hStatLabel}>Companies</Text></View>
            <View style={sid.hStatDiv} />
            <View style={sid.hStat}><Text style={sid.hStatVal}>{group.regions.length}</Text><Text style={sid.hStatLabel}>Regions</Text></View>
            <View style={sid.hStatDiv} />
            <View style={sid.hStat}><Text style={sid.hStatVal}>{group.dosageForms.length}</Text><Text style={sid.hStatLabel}>Forms</Text></View>
          </View>
        </LinearGradient>

        <View style={sid.tabBar}>
          {SIDEBAR_TABS.map(t => (
            <TouchableOpacity key={t} style={[sid.tabBtn, activeTab === t && [sid.tabBtnActive, { borderBottomColor: tc }]]} onPress={() => setActiveTab(t)} activeOpacity={0.8}>
              {t === 'Region' && <Globe size={13} color={activeTab === t ? tc : COLORS.gray500} />}
              {t === 'Customer' && <Users size={13} color={activeTab === t ? tc : COLORS.gray500} />}
              {t === 'Revenue' && <TrendingUp size={13} color={activeTab === t ? tc : COLORS.gray500} />}
              <Text style={[sid.tabText, activeTab === t && { color: tc }]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={sid.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={sid.scrollContent}>
          {activeTab === 'Region' && <RegionTab group={group} />}
          {activeTab === 'Customer' && <CustomerTab group={group} />}
          {activeTab === 'Revenue' && <RevenueTab group={group} />}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const sid = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(26,46,30,0.65)' },
  drawer: { position: 'absolute', right: 0, top: 0, bottom: 0, backgroundColor: COLORS.bg, shadowColor: '#000', shadowOffset: { width: -4, height: 0 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 24 },
  header: { paddingTop: 20, paddingBottom: 16, paddingHorizontal: 20 },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  molIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  molName: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#fff' },
  molTherapy: { fontSize: 11, fontFamily: 'Poppins-Regular', color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingVertical: 10 },
  hStat: { flex: 1, alignItems: 'center' },
  hStatVal: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#fff' },
  hStatLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' },
  hStatDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: 4 },
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 13, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: {},
  tabText: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.gray500 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
});

const sb = StyleSheet.create({
  tabContent: { padding: 16, gap: 0 },
  sectionLabel: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: COLORS.gray500, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8, marginTop: 4 },
  filterRow: { marginBottom: 8 },
  filterChips: { gap: 6, paddingVertical: 2 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  chipText: { fontSize: 11, fontFamily: 'Poppins-Medium', color: COLORS.gray600 },
  regionCard: { backgroundColor: COLORS.white, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, padding: 12, marginBottom: 8 },
  regionCardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  regionIcon: { width: 26, height: 26, borderRadius: 8, backgroundColor: COLORS.info + '15', alignItems: 'center', justifyContent: 'center' },
  regionName: { flex: 1, fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  regionRev: { fontSize: 12, fontFamily: 'Poppins-Bold' },
  regionStats: { flexDirection: 'row', gap: 12 },
  regionStat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  regionStatVal: { fontSize: 14, fontFamily: 'Poppins-Bold', color: COLORS.dark },
  regionStatLabel: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  skuRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  skuDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  skuLeft: { flex: 1 },
  skuName: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: COLORS.dark, marginBottom: 1 },
  skuMeta: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500, marginBottom: 4 },
  skuTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.gray100 },
  tagText: { fontSize: 9, fontFamily: 'Poppins-Medium', color: COLORS.gray600 },
  pipeRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.gray100, gap: 8 },
  pipeLeft: { flex: 1 },
  pipeName: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: COLORS.dark, marginBottom: 2 },
  pipeMeta: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  pipeRight: { alignItems: 'flex-end', gap: 3 },
  pipeRev: { fontSize: 11, fontFamily: 'Poppins-Bold' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: COLORS.gray400 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  summaryCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, padding: 10, alignItems: 'center' },
  summaryVal: { fontSize: 16, fontFamily: 'Poppins-Bold' },
  summaryLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500, textTransform: 'uppercase', marginTop: 2 },
  custCard: { backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 12, marginBottom: 10 },
  custHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  custIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  custIconText: { fontSize: 13, fontFamily: 'Poppins-Bold' },
  custHeadRight: { flex: 1 },
  custName: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: COLORS.dark, marginBottom: 3 },
  compTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 12, borderWidth: 1, alignSelf: 'flex-start' },
  compDot: { width: 6, height: 6, borderRadius: 3 },
  compTagText: { fontSize: 9, fontFamily: 'Poppins-Medium' },
  custRev: { fontSize: 13, fontFamily: 'Poppins-Bold' },
  custDifot: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  difotLabel: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: COLORS.gray500, width: 38 },
  skuWiseLabel: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  skuLine: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 8 },
  skuLineLeft: { flex: 1 },
  skuLineName: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  skuLineMeta: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  skuLineRev: { fontSize: 11, fontFamily: 'Poppins-Bold' },
  revHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  revTotal: { fontSize: 24, fontFamily: 'Poppins-Bold', color: COLORS.dark },
  revTotalLabel: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  revFilters: { flexDirection: 'row', gap: 6 },
  revChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  revChipText: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: COLORS.gray600 },
  periodRow: { flexDirection: 'row', gap: 6, marginBottom: 14, flexWrap: 'wrap' },
  periodChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  periodText: { fontSize: 11, fontFamily: 'Poppins-Medium', color: COLORS.gray600 },
  chartCard: { backgroundColor: COLORS.white, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, padding: 12, marginBottom: 14 },
  chartTitle: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: COLORS.gray500, textTransform: 'uppercase', marginBottom: 8 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  barLabel: { flex: 1, fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray400, textAlign: 'center' },
  revRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: COLORS.gray100, gap: 8 },
  revRowLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  revRowLabel: { fontSize: 12, fontFamily: 'Poppins-Regular', color: COLORS.dark, flex: 1 },
  revBarWrap: { width: 80, height: 6, backgroundColor: COLORS.gray100, borderRadius: 3, overflow: 'hidden' },
  revBar: { height: 6, borderRadius: 3 },
  revRowVal: { fontSize: 12, fontFamily: 'Poppins-Bold', width: 56, textAlign: 'right' },
});

// ─── Molecule Chip ─────────────────────────────────────────────────────────────

function MolChip({ group, active, onPress }: { group: MolGroup; active: boolean; onPress: () => void }) {
  const tc = tColor(group.therapeutic);
  return (
    <TouchableOpacity
      style={[mch.chip, active ? { backgroundColor: tc, borderColor: tc } : { borderColor: tc + '60' }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <FlaskConical size={10} color={active ? '#fff' : tc} />
      <Text style={[mch.label, { color: active ? '#fff' : tc }]}>{group.molecule}</Text>
      <View style={[mch.badge, { backgroundColor: active ? 'rgba(255,255,255,0.3)' : tc + '20' }]}>
        <Text style={[mch.badgeText, { color: active ? '#fff' : tc }]}>{group.companies.length}</Text>
      </View>
    </TouchableOpacity>
  );
}

const mch = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingLeft: 10, paddingRight: 6, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, backgroundColor: 'transparent' },
  label: { fontSize: 11, fontFamily: 'Poppins-SemiBold' },
  badge: { minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { fontSize: 9, fontFamily: 'Poppins-Bold' },
});

// ─── Main portfolio view ───────────────────────────────────────────────────────

function ProductPortfolioView() {
  const [companyFilter, setCompanyFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState<MolGroup | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const filteredProducts = useMemo(() => {
    let items = productPortfolio;
    if (companyFilter !== 'All') items = items.filter(p => p.company === companyFilter);
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
  }, [companyFilter, search]);

  const groups = useMemo(() => buildGroups(filteredProducts), [filteredProducts]);
  const totalPages = Math.max(1, Math.ceil(groups.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageGroups = groups.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openSidebar = (group: MolGroup) => { setSelectedGroup(group); setSidebarVisible(true); };

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={[COLORS.primaryDark, COLORS.primary, '#4a8f55']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <Text style={styles.headerTitle}>Product Portfolio</Text>
          <Text style={styles.headerSub}>{groups.length} molecules · {filteredProducts.length} SKUs across {new Set(filteredProducts.map(p => p.company)).size} companies</Text>
          <View style={styles.headerGoldLine} />
        </LinearGradient>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={15} color={COLORS.gray500} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search molecules, companies..."
              placeholderTextColor={COLORS.gray400}
              value={search}
              onChangeText={v => { setSearch(v); setPage(1); }}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => { setSearch(''); setPage(1); }} hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}>
                <X size={14} color={COLORS.gray400} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.companyFilter}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.companyFilterContent}>
            {COMPANIES.map(c => (
              <FilterChip key={c} label={c} active={companyFilter === c} onPress={() => { setCompanyFilter(c); setPage(1); }} color={c === 'All' ? COLORS.dark : COMPANY_COLORS[c] || COLORS.primary} />
            ))}
          </ScrollView>
        </View>

        {groups.length === 0 ? (
          <View style={styles.empty}>
            <FlaskConical size={36} color={COLORS.gray300} />
            <Text style={styles.emptyText}>No molecules found</Text>
          </View>
        ) : (
          <View style={styles.listWrap}>
            <View style={styles.pageInfo}>
              <Text style={styles.pageInfoText}>Showing {pageGroups.length} of {groups.length} molecules</Text>
            </View>
            {pageGroups.map(group => {
              const tc = tColor(group.therapeutic);
              return (
                <View key={group.molecule} style={styles.molCard}>
                  <View style={[styles.molCardTop, { backgroundColor: tc + '10' }]}>
                    <View style={styles.molCardTopLeft}>
                      <View style={[styles.molIconWrap, { backgroundColor: tc + '20' }]}>
                        <FlaskConical size={16} color={tc} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.molName}>{group.molecule}</Text>
                        <View style={[styles.taTag, { backgroundColor: tc + '18' }]}>
                          <Text style={[styles.taText, { color: tc }]}>{group.therapeutic}</Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity style={[styles.detailBtn, { borderColor: tc }]} onPress={() => openSidebar(group)} activeOpacity={0.8}>
                      <Text style={[styles.detailBtnText, { color: tc }]}>Details</Text>
                      <ArrowUpRight size={12} color={tc} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.molStats}>
                    <View style={styles.molStat}><Text style={styles.molStatVal}>{group.products.length}</Text><Text style={styles.molStatLabel}>SKUs</Text></View>
                    <View style={styles.molStatDiv} />
                    <View style={styles.molStat}><Text style={styles.molStatVal}>{group.regions.length}</Text><Text style={styles.molStatLabel}>Regions</Text></View>
                    <View style={styles.molStatDiv} />
                    <View style={styles.molStat}><Text style={styles.molStatVal}>{group.dosageForms.length}</Text><Text style={styles.molStatLabel}>Forms</Text></View>
                    <View style={styles.molStatDiv} />
                    <View style={styles.molStat}><Text style={styles.molStatVal}>{group.companies.length}</Text><Text style={styles.molStatLabel}>Companies</Text></View>
                  </View>

                  <View style={styles.molChipsSection}>
                    <Text style={styles.molChipsSectionLabel}>Companies</Text>
                    <View style={styles.molChipsRow}>
                      {group.companies.map(c => {
                        const cc = COMPANY_COLORS[c] || COLORS.primary;
                        return (
                          <View key={c} style={[styles.compChip, { backgroundColor: cc + '14', borderColor: cc + '45' }]}>
                            <View style={[styles.compChipDot, { backgroundColor: cc }]} />
                            <Text style={[styles.compChipText, { color: cc }]}>{c}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.molDivider}>
                    <View style={styles.molDivLine} />
                    <Text style={styles.molDivText}>Molecules</Text>
                    <View style={styles.molDivLine} />
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.molChipsScroll}>
                    {group.products.map(p => {
                      const cc = COMPANY_COLORS[p.company] || COLORS.primary;
                      return (
                        <TouchableOpacity key={p.productCode} style={[styles.molProdChip, { borderColor: cc + '55' }]} onPress={() => openSidebar(group)} activeOpacity={0.75}>
                          <Text style={[styles.molProdChipName, { color: cc }]}>{p.product}</Text>
                          <Text style={styles.molProdChipSub}>{p.strength} · {p.dosage}</Text>
                          <Text style={styles.molProdChipCountry}>{p.country}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {groups.length > 0 && (
        <View style={styles.pagination}>
          <TouchableOpacity style={[styles.pgBtn, safePage === 1 && styles.pgBtnDisabled]} onPress={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>
            <ChevronLeft size={16} color={safePage === 1 ? COLORS.gray300 : COLORS.dark} />
            <Text style={[styles.pgText, safePage === 1 && styles.pgTextDisabled]}>Prev</Text>
          </TouchableOpacity>
          <Text style={styles.pgInfo}>Page <Text style={styles.pgNum}>{safePage}</Text> of <Text style={styles.pgNum}>{totalPages}</Text></Text>
          <TouchableOpacity style={[styles.pgBtn, safePage === totalPages && styles.pgBtnDisabled]} onPress={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
            <Text style={[styles.pgText, safePage === totalPages && styles.pgTextDisabled]}>Next</Text>
            <ChevronRight size={16} color={safePage === totalPages ? COLORS.gray300 : COLORS.dark} />
          </TouchableOpacity>
        </View>
      )}

      <MoleculeSidebar group={selectedGroup} visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
    </View>
  );
}

export default function PortfolioExplorer() {
  const [topTab, setTopTab] = useState(0);
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topTabBar}>
        {TOP_TABS.map((tab, i) => (
          <TouchableOpacity key={tab} activeOpacity={0.85} style={[styles.topTab, topTab === i && styles.topTabActive]} onPress={() => setTopTab(i)}>
            <Text style={[styles.topTabText, topTab === i && styles.topTabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {topTab === 0 ? <ProductPortfolioView /> : <CustomerStatusTab />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  topTabBar: { flexDirection: 'row', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingHorizontal: 16, paddingTop: 8 },
  topTab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  topTabActive: { borderBottomColor: COLORS.primary },
  topTabText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: COLORS.gray500 },
  topTabTextActive: { color: COLORS.primary },
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 6 },
  headerGoldLine: { height: 2, backgroundColor: COLORS.gold, opacity: 0.5, marginTop: 10 },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins-Bold', color: COLORS.white },
  headerSub: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.goldLight, marginTop: 2, opacity: 0.85 },
  searchRow: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: COLORS.bg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, gap: 10, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Poppins-Regular', color: COLORS.dark, padding: 0 },
  companyFilter: { backgroundColor: COLORS.bg, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: 8 },
  companyFilterContent: { paddingHorizontal: 16, gap: 6, alignItems: 'center' },
  listWrap: { paddingHorizontal: 16, paddingTop: 10 },
  pageInfo: { marginBottom: 8 },
  pageInfoText: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: COLORS.gray400 },
  molCard: { backgroundColor: COLORS.cardBg, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  molCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, paddingBottom: 10 },
  molCardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  molIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  molName: { fontSize: 15, fontFamily: 'Poppins-Bold', color: COLORS.dark, marginBottom: 3 },
  taTag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  taText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  detailBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1.5 },
  detailBtnText: { fontSize: 11, fontFamily: 'Poppins-SemiBold' },
  molStats: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  molStat: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  molStatVal: { fontSize: 18, fontFamily: 'Poppins-Bold', color: COLORS.dark },
  molStatLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500, textTransform: 'uppercase', letterSpacing: 0.4 },
  molStatDiv: { width: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  molChipsSection: { paddingHorizontal: 14, paddingTop: 10 },
  molChipsSectionLabel: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: COLORS.gray500, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  molChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  compChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  compChipDot: { width: 6, height: 6, borderRadius: 3 },
  compChipText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  molDivider: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 14, marginTop: 12 },
  molDivLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  molDivText: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: 0.5 },
  molChipsScroll: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  molProdChip: { borderWidth: 1, borderRadius: 10, padding: 10, minWidth: 130, backgroundColor: COLORS.white },
  molProdChipName: { fontSize: 11, fontFamily: 'Poppins-SemiBold', marginBottom: 2 },
  molProdChipSub: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500, marginBottom: 1 },
  molProdChipCountry: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray400 },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  pgBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  pgBtnDisabled: { borderColor: COLORS.gray100, backgroundColor: COLORS.gray100 },
  pgText: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  pgTextDisabled: { color: COLORS.gray300 },
  pgInfo: { fontSize: 12, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  pgNum: { fontFamily: 'Poppins-Bold', color: COLORS.dark },
});
