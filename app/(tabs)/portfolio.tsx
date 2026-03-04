import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, Dimensions, useWindowDimensions,
} from 'react-native';
import Svg, { Polyline, Circle, Path } from 'react-native-svg';
import { Search, X, Globe, FlaskConical, Heart } from 'lucide-react-native';
import {
  COLORS, COMPANY_COLORS, productPortfolio, companyMetrics,
  rdData, goLanzarData, monthlyRevenue, customerViewData,
} from '@/data/mockData';
import { LinearGradient } from 'expo-linear-gradient';
import DrawerModal from '@/components/ui/DrawerModal';
import StatusBadge from '@/components/ui/StatusBadge';
import FilterChip from '@/components/ui/FilterChip';
import CustomerStatusTab from '@/components/ui/CustomerStatusTab';

const TOP_TABS = ['Product Portfolio', 'Customer Details'];
const TABS = ['Region', 'Country', 'Molecule', 'Therapeutic', 'Partner Status'];
const COMPANIES = ['All', 'Strides', 'Instapill', 'One Source', 'Naari', 'Solara'];

const THERAPEUTIC_COLORS = ['#3a7d44', '#4a90a4', '#df6d14', '#c9a84c', '#8a5fa8', '#c0392b'];

const COMPANY_FOCUS: Record<string, {
  primary: string; riskLevel: string; risk: string;
  insights: string[];
  regions: { label: string; pct: number }[];
  countries: string[];
}> = {
  Strides: {
    primary: 'Cardiovascular & GI', riskLevel: 'Medium',
    risk: 'Regulatory shifts in European markets may impact timeline for Q4 launches.',
    insights: ['Generic portfolio expansion in EU', 'GI franchise strengthening in ME', 'Biosimilar pipeline diversification'],
    regions: [{ label: 'Europe', pct: 45 }, { label: 'Africa', pct: 20 }, { label: 'Asia Pacific', pct: 18 }, { label: 'Others', pct: 17 }],
    countries: ['Germany', 'France', 'Nigeria', 'Australia', 'UAE'],
  },
  Instapill: {
    primary: 'Diabetes & Metabolic', riskLevel: 'High',
    risk: 'Biosimilar price erosion in insulin segment may compress margins.',
    insights: ['Biosimilar insulin market leadership', 'SGLT2 inhibitor launch pipeline', 'Expansion into GLP-1 agonist space'],
    regions: [{ label: 'Asia Pacific', pct: 40 }, { label: 'North America', pct: 28 }, { label: 'ME', pct: 18 }, { label: 'Others', pct: 14 }],
    countries: ['India', 'Canada', 'Saudi Arabia', 'Spain', 'Kenya'],
  },
  'One Source': {
    primary: 'Antiretroviral', riskLevel: 'Medium',
    risk: 'Donor funding dependency creates revenue concentration risk.',
    insights: ['WHO PQ portfolio broadening', 'TLD FDC launch readiness', 'Sub-Saharan tender dominance'],
    regions: [{ label: 'Africa', pct: 62 }, { label: 'Asia Pacific', pct: 18 }, { label: 'Latin America', pct: 12 }, { label: 'Others', pct: 8 }],
    countries: ['South Africa', 'Ethiopia', 'Ghana', 'Philippines', 'Brazil'],
  },
  Naari: {
    primary: "Women's Health", riskLevel: 'Low',
    risk: 'Regulatory approval delays in key markets may push revenue recognition.',
    insights: ["Women's health specialist positioning", 'ME market penetration accelerating', 'FDC sachet innovation pipeline'],
    regions: [{ label: 'Asia Pacific', pct: 38 }, { label: 'Middle East', pct: 30 }, { label: 'Africa', pct: 20 }, { label: 'Europe', pct: 12 }],
    countries: ['India', 'Kuwait', 'Indonesia', 'Tanzania', 'Italy'],
  },
  Solara: {
    primary: 'CNS & Psychiatry', riskLevel: 'Medium',
    risk: 'Generic competition intensifying in US CNS segment post-patent cliff.',
    insights: ['CNS extended-release portfolio', 'LATAM market entry strategy', 'Japan partnership for Donepezil'],
    regions: [{ label: 'North America', pct: 40 }, { label: 'Europe', pct: 28 }, { label: 'Asia Pacific', pct: 18 }, { label: 'Latin America', pct: 14 }],
    countries: ['USA', 'Netherlands', 'Japan', 'Mexico', 'Israel'],
  },
};

function fmt(v: number) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

function SparkLine({ data, color, w = 0, h = 56 }: { data: number[]; color: string; w?: number; h?: number }) {
  const [containerW, setContainerW] = React.useState(w || 0);
  const effectiveW = w > 0 ? w : containerW;

  if (!data || data.length < 2) return null;
  const mx = Math.max(...data), range = mx - Math.min(...data) || 1, pad = 4;

  if (effectiveW === 0) {
    return <View style={{ height: h, width: '100%' }} onLayout={e => setContainerW(e.nativeEvent.layout.width)} />;
  }

  const pts = data.map((v, i) => `${pad + (i / (data.length - 1)) * (effectiveW - pad * 2)},${pad + ((mx - v) / range) * (h - pad * 2)}`);
  const [lx, ly] = pts[pts.length - 1].split(',');
  return (
    <View style={{ width: '100%' }} onLayout={e => { if (!w) setContainerW(e.nativeEvent.layout.width); }}>
      <Svg width={effectiveW} height={h}>
        <Polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={lx} cy={ly} r={3} fill={color} />
      </Svg>
    </View>
  );
}

function DonutChart({ segments, size = 68 }: { segments: { value: number; color: string }[]; size?: number }) {
  const r = size / 2 - 5, cx = size / 2, cy = size / 2, total = segments.reduce((s, g) => s + g.value, 0);
  let cum = -Math.PI / 2;
  const arcs = segments.map(seg => {
    const a = (seg.value / total) * Math.PI * 2;
    const x1 = cx + r * Math.cos(cum), y1 = cy + r * Math.sin(cum);
    const x2 = cx + r * Math.cos(cum + a), y2 = cy + r * Math.sin(cum + a);
    const ir = r - 16;
    const xi1 = cx + ir * Math.cos(cum), yi1 = cy + ir * Math.sin(cum);
    const xi2 = cx + ir * Math.cos(cum + a), yi2 = cy + ir * Math.sin(cum + a);
    const lg = a > Math.PI ? 1 : 0;
    const d = `M${x1} ${y1} A${r} ${r} 0 ${lg} 1 ${x2} ${y2} L${xi2} ${yi2} A${ir} ${ir} 0 ${lg} 0 ${xi1} ${yi1}Z`;
    cum += a;
    return { d, color: seg.color };
  });
  return <Svg width={size} height={size}>{arcs.map((a, i) => <Path key={i} d={a.d} fill={a.color} />)}</Svg>;
}

function CompanyOverview({ companyName }: { companyName: string }) {
  const m = companyMetrics[companyName as keyof typeof companyMetrics];
  const focus = COMPANY_FOCUS[companyName];
  const allProducts = productPortfolio.filter(p => p.company === companyName);
  const pipeline = [...rdData, ...goLanzarData].filter(d => d.company === companyName);
  const customers = customerViewData.filter(c => c.company === companyName);

  const avgDifot = customers.length > 0
    ? (customers.reduce((s, c) => s + c.difotPercent, 0) / customers.length).toFixed(1) : 'N/A';
  const pipelineRev = pipeline.reduce((s, p) => s + p.totalRevenue, 0);

  const therapeutic: Record<string, number> = {};
  allProducts.forEach(p => { therapeutic[p.therapeutic] = (therapeutic[p.therapeutic] || 0) + 1; });
  const tSegs = Object.entries(therapeutic).map(([label, count], i) => ({
    label, count, color: THERAPEUTIC_COLORS[i % THERAPEUTIC_COLORS.length],
  }));

  const keyName = companyName === 'One Source' ? 'oneSource'
    : companyName === 'Instapill' ? 'instapill'
    : companyName === 'Strides' ? 'strides'
    : companyName === 'Naari' ? 'naari' : 'solara';
  const sparkData = monthlyRevenue.slice(-6).map(row => (row as any)[keyName] as number);
  const months = monthlyRevenue.slice(-6).map(row => row.month.replace(' 24', ''));

  const riskColor = focus?.riskLevel === 'High' ? COLORS.error : focus?.riskLevel === 'Medium' ? COLORS.warning : COLORS.success;

  return (
    <View style={ov.root}>
      <View style={[ov.banner, { backgroundColor: m.color + '12' }]}>
        <View style={[ov.logo, { backgroundColor: m.color + '22' }]}>
          <Text style={[ov.logoText, { color: m.color }]}>{companyName.substring(0, 2).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={ov.companyName}>{companyName}</Text>
          <Text style={ov.companyRegion}>Primary Region: {m.topRegion} · {focus?.primary}</Text>
        </View>
      </View>

      <View style={ov.kpiRow}>
        <View style={ov.kpi}>
          <Text style={ov.kpiLabel}>Annual Revenue</Text>
          <Text style={[ov.kpiVal, { color: m.color }]}>{fmt(m.revenue)}</Text>
          <Text style={[ov.kpiSub, { color: COLORS.success }]}>+{m.growth}% vs LY</Text>
        </View>
        <View style={ov.kpi}>
          <Text style={ov.kpiLabel}>Products</Text>
          <Text style={[ov.kpiVal, { color: COLORS.info }]}>{m.products}</Text>
          <Text style={ov.kpiSub}>Active</Text>
        </View>
        <View style={ov.kpi}>
          <Text style={ov.kpiLabel}>Pipeline</Text>
          <Text style={[ov.kpiVal, { color: COLORS.warning }]}>{fmt(pipelineRev)}</Text>
          <Text style={ov.kpiSub}>{pipeline.length} Projects</Text>
        </View>
        <View style={ov.kpi}>
          <Text style={ov.kpiLabel}>Avg DIFOT</Text>
          <Text style={[ov.kpiVal, { color: COLORS.success }]}>{avgDifot}%</Text>
          <Text style={ov.kpiSub}>On-time</Text>
        </View>
      </View>

      <View style={ov.card}>
        <Text style={[ov.cardTitle, { color: m.color }]}>Revenue Growth Trend</Text>
        <SparkLine data={sparkData} color={m.color} />
        <View style={ov.sparkLabels}>
          {months.map((mn, i) => <Text key={i} style={ov.sparkLabel}>{mn}</Text>)}
        </View>
      </View>

      <View style={ov.card}>
        <Text style={[ov.cardTitle, { color: COLORS.warning }]}>Therapeutic Areas</Text>
        <View style={ov.donutRow}>
          <DonutChart segments={tSegs.map(t => ({ value: t.count, color: t.color }))} />
          <View style={ov.legend}>
            {tSegs.map((t, i) => (
              <View key={i} style={ov.legendItem}>
                <View style={[ov.dot, { backgroundColor: t.color }]} />
                <Text style={ov.legendLabel} numberOfLines={1}>{t.label}</Text>
                <Text style={[ov.legendCount, { color: t.color }]}>{t.count}P</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={ov.card}>
        <Text style={[ov.cardTitle, { color: COLORS.info }]}>Geographic Footprint</Text>
        <View style={ov.geoRow}>
          <View style={ov.geoLeft}>
            {focus?.regions.map((r, i) => (
              <View key={i} style={ov.geoItem}>
                <Text style={ov.geoLabel}>{r.label}</Text>
                <View style={ov.barWrap}>
                  <View style={[ov.bar, { width: `${r.pct}%`, backgroundColor: m.color }]} />
                </View>
                <Text style={ov.geoPct}>{r.pct}%</Text>
              </View>
            ))}
          </View>
          <View style={ov.geoRight}>
            <Text style={ov.geoSubtitle}>Key Countries</Text>
            {focus?.countries.map((c, i) => (
              <View key={i} style={[ov.chip, { borderColor: m.color + '50' }]}>
                <Text style={[ov.chipText, { color: m.color }]}>{c}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={ov.card}>
        <Text style={[ov.cardTitle, { color: COLORS.primary }]}>Pipeline ({pipeline.length} Projects)</Text>
        {pipeline.map((p, i) => (
          <View key={i} style={ov.pipeRow}>
            <View style={ov.pipeLeft}>
              <Text style={ov.pipeTitle} numberOfLines={1}>{p.summary}</Text>
              <Text style={ov.pipeMeta}>{p.currentStatus} · GM {p.gm}%</Text>
            </View>
            <View style={ov.pipeRight}>
              <Text style={[ov.pipeRev, { color: m.color }]}>{fmt(p.totalRevenue)}</Text>
              <StatusBadge label={p.priority} type={p.priority === 'Critical' ? 'error' : p.priority === 'High' ? 'warning' : 'neutral'} size="sm" />
            </View>
          </View>
        ))}
      </View>

      <View style={ov.card}>
        <Text style={[ov.cardTitle, { color: COLORS.gold }]}>Strategic Insights</Text>
        <Text style={ov.insightCat}>STRATEGIC FOCUS</Text>
        {focus?.insights.map((ins, i) => (
          <View key={i} style={ov.insightRow}>
            <View style={[ov.dot, { backgroundColor: COLORS.success }]} />
            <Text style={ov.insightText}>{ins}</Text>
          </View>
        ))}
        <Text style={[ov.insightCat, { marginTop: 10 }]}>RISK ASSESSMENT</Text>
        <View style={[ov.riskBox, { borderColor: riskColor + '40', backgroundColor: riskColor + '0D' }]}>
          <Text style={[ov.riskLevel, { color: riskColor }]}>{focus?.riskLevel} Risk</Text>
          <Text style={ov.riskText}>{focus?.risk}</Text>
        </View>
      </View>
    </View>
  );
}

const ov = StyleSheet.create({
  root: { gap: 10 },
  banner: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, gap: 12 },
  logo: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 14, fontFamily: 'Poppins-Bold' },
  companyName: { fontSize: 16, fontFamily: 'Poppins-Bold', color: COLORS.dark },
  companyRegion: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  kpiRow: { flexDirection: 'row', gap: 6 },
  kpi: { flex: 1, backgroundColor: COLORS.cream, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: COLORS.border },
  kpiLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500, textTransform: 'uppercase', marginBottom: 3 },
  kpiVal: { fontSize: 16, fontFamily: 'Poppins-Bold', marginBottom: 1 },
  kpiSub: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  card: { backgroundColor: COLORS.cardBg, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { fontSize: 12, fontFamily: 'Poppins-SemiBold', marginBottom: 10 },
  sparkLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, width: '100%' },
  sparkLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray400, flex: 1, textAlign: 'center' },
  twoCol: {},
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  legend: { flex: 1, gap: 5 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  legendLabel: { flex: 1, fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.dark },
  legendCount: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  geoRow: { flexDirection: 'row', gap: 10 },
  geoLeft: { flex: 1.4 },
  geoRight: { flex: 1 },
  geoSubtitle: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: COLORS.gray500, textTransform: 'uppercase', marginBottom: 6 },
  geoItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 7, gap: 6 },
  geoLabel: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.dark, width: 72 },
  barWrap: { flex: 1, height: 6, backgroundColor: COLORS.gray100, borderRadius: 3, overflow: 'hidden' },
  bar: { height: 6, borderRadius: 3 },
  geoPct: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: COLORS.dark, width: 28, textAlign: 'right' },
  chip: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 3, marginBottom: 5, alignSelf: 'flex-start' },
  chipText: { fontSize: 10, fontFamily: 'Poppins-Medium' },
  pipeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.gray100, gap: 8 },
  pipeLeft: { flex: 1 },
  pipeTitle: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: COLORS.dark, marginBottom: 2 },
  pipeMeta: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  pipeRight: { alignItems: 'flex-end', gap: 3 },
  pipeRev: { fontSize: 11, fontFamily: 'Poppins-Bold' },
  insightCat: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: COLORS.gray500, letterSpacing: 0.6, marginBottom: 6, textTransform: 'uppercase' },
  insightRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  insightText: { flex: 1, fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.dark },
  riskBox: { borderRadius: 8, borderWidth: 1, padding: 10, gap: 3 },
  riskLevel: { fontSize: 12, fontFamily: 'Poppins-SemiBold' },
  riskText: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray600 },
});

function ProductCard({ item, onPress, isTablet }: { item: typeof productPortfolio[0]; onPress: () => void; isTablet?: boolean }) {
  const color = COMPANY_COLORS[item.company] || COLORS.primary;
  return (
    <TouchableOpacity style={[styles.productCard, isTablet && { width: '48%' }]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.cardLeftBorder, { backgroundColor: color }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardProduct}>{item.product}</Text>
            <Text style={[styles.cardStrength, { color }]}>{item.strength}</Text>
          </View>
          <StatusBadge label={item.partnerStatus} type={item.partnerStatus === 'In-House' ? 'success' : item.partnerStatus === 'Partner' ? 'primary' : 'info'} size="sm" />
        </View>
        <Text style={styles.cardMolecule}>{item.molecules}</Text>
        <View style={styles.cardMeta}>
          <View style={styles.cardMetaItem}><Globe size={10} color={COLORS.gray500} /><Text style={styles.cardMetaText}>{item.country}</Text></View>
          <View style={styles.cardMetaItem}><FlaskConical size={10} color={COLORS.gray500} /><Text style={styles.cardMetaText}>{item.dosage}</Text></View>
          <View style={styles.cardMetaItem}><Heart size={10} color={COLORS.gray500} /><Text style={styles.cardMetaText}>{item.therapeutic}</Text></View>
        </View>
        <View style={styles.cardFooter}>
          <View style={[styles.companyTag, { backgroundColor: color + '18' }]}>
            <Text style={[styles.companyTagText, { color }]}>{item.company}</Text>
          </View>
          <Text style={styles.productCode}>{item.productCode}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function GroupedList({ items, groupKey, onSelect, isTablet }: { items: typeof productPortfolio; groupKey: keyof typeof productPortfolio[0]; onSelect: (item: typeof productPortfolio[0]) => void; isTablet: boolean }) {
  const groups = useMemo(() => {
    const map: Record<string, typeof productPortfolio> = {};
    items.forEach(item => {
      const key = String(item[groupKey]);
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [items, groupKey]);

  return (
    <View style={styles.groupedContent}>
      {groups.map(([group, products]) => (
        <View key={group} style={styles.group}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupTitle}>{group}</Text>
            <View style={styles.groupCount}><Text style={styles.groupCountText}>{products.length}</Text></View>
          </View>
          <View style={[styles.groupItems, isTablet && { flexDirection: 'row', flexWrap: 'wrap' }]}>
            {products.map(p => <ProductCard key={p.productCode} item={p} onPress={() => onSelect(p)} isTablet={isTablet} />)}
          </View>
        </View>
      ))}
    </View>
  );
}

function ProductPortfolioView() {
  const { width: screenWidth } = useWindowDimensions();
  const isTablet = screenWidth >= 768;
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<typeof productPortfolio[0] | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const filtered = useMemo(() => {
    let items = productPortfolio;
    if (companyFilter !== 'All') items = items.filter(p => p.company === companyFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(p =>
        p.product.toLowerCase().includes(q) ||
        p.molecules.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q) ||
        p.therapeutic.toLowerCase().includes(q) ||
        p.productCode.toLowerCase().includes(q)
      );
    }
    return items;
  }, [search, companyFilter]);

  const groupKeyMap: Record<number, keyof typeof productPortfolio[0]> = {
    0: 'region', 1: 'country', 2: 'molecules', 3: 'therapeutic', 4: 'partnerStatus',
  };

  const openProduct = (item: typeof productPortfolio[0]) => {
    setSelectedProduct(item);
    setDrawerVisible(true);
  };

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={[COLORS.primaryDark, COLORS.primary, '#4a8f55']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <Text style={styles.headerTitle}>Product Portfolio</Text>
          <Text style={styles.headerSub}>{filtered.length} products · {companyFilter === 'All' ? '5 companies' : companyFilter}</Text>
          <View style={styles.headerGoldLine} />
        </LinearGradient>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={15} color={COLORS.gray500} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products, molecules, countries..."
              placeholderTextColor={COLORS.gray400}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}>
                <X size={14} color={COLORS.gray400} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.companyFilterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.companyFilterContent}>
            {COMPANIES.map(c => (
              <FilterChip key={c} label={c} active={companyFilter === c} onPress={() => setCompanyFilter(c)} color={c === 'All' ? COLORS.dark : COMPANY_COLORS[c] || COLORS.primary} />
            ))}
          </ScrollView>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
          {TABS.map((tab, i) => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === i && styles.tabActive]} onPress={() => setActiveTab(i)} activeOpacity={0.8}>
              <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <GroupedList items={filtered} groupKey={groupKeyMap[activeTab]} onSelect={openProduct} isTablet={isTablet} />
      </ScrollView>

      {selectedProduct && (
        <DrawerModal
          visible={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          title={`${selectedProduct.product} — ${selectedProduct.company}`}
        >
          <View style={styles.drawerInner}>
            <View style={[styles.productHero, { backgroundColor: (COMPANY_COLORS[selectedProduct.company] || COLORS.primary) + '12' }]}>
              <View style={styles.productHeroTop}>
                <View>
                  <Text style={styles.heroProduct}>{selectedProduct.product}</Text>
                  <Text style={[styles.heroStrength, { color: COMPANY_COLORS[selectedProduct.company] || COLORS.primary }]}>{selectedProduct.strength}</Text>
                </View>
                <StatusBadge label={selectedProduct.partnerStatus} type={selectedProduct.partnerStatus === 'In-House' ? 'success' : selectedProduct.partnerStatus === 'Partner' ? 'primary' : 'info'} />
              </View>
              <View style={styles.productMetaGrid}>
                {[
                  { label: 'Molecule', value: selectedProduct.molecules },
                  { label: 'Dosage Form', value: selectedProduct.dosage },
                  { label: 'Therapeutic', value: selectedProduct.therapeutic },
                  { label: 'Country', value: selectedProduct.country },
                  { label: 'Region', value: selectedProduct.region },
                  { label: 'Code', value: selectedProduct.productCode },
                ].map(({ label, value }) => (
                  <View key={label} style={styles.metaItem}>
                    <Text style={styles.metaLabel}>{label}</Text>
                    <Text style={styles.metaValue}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: (COMPANY_COLORS[selectedProduct.company] || COLORS.primary) + '30' }]} />
              <Text style={[styles.dividerText, { color: COMPANY_COLORS[selectedProduct.company] || COLORS.primary }]}>Company Overview · {selectedProduct.company}</Text>
              <View style={[styles.dividerLine, { backgroundColor: (COMPANY_COLORS[selectedProduct.company] || COLORS.primary) + '30' }]} />
            </View>

            <CompanyOverview companyName={selectedProduct.company} />
          </View>
        </DrawerModal>
      )}
    </View>
  );
}

export default function PortfolioExplorer() {
  const [topTab, setTopTab] = useState(0);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topTabBar}>
        {TOP_TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab} activeOpacity={0.85}
            style={[styles.topTab, topTab === i && styles.topTabActive]}
            onPress={() => setTopTab(i)}
          >
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
  topTabBar: { flexDirection: 'row', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 0 },
  topTab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  topTabActive: { borderBottomColor: COLORS.primary },
  topTabText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: COLORS.gray500 },
  topTabTextActive: { color: COLORS.primary },
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { paddingBottom: 24 },
  header: { paddingHorizontal: 20, paddingTop: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 6 },
  headerGoldLine: { height: 2, backgroundColor: COLORS.gold, opacity: 0.5, marginTop: 10 },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins-Bold', color: COLORS.white },
  headerSub: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.goldLight, marginTop: 1, opacity: 0.85 },
  searchRow: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: COLORS.bg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, gap: 10, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Poppins-Regular', color: COLORS.dark, padding: 0 },
  companyFilterRow: { backgroundColor: COLORS.bg, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: 0 },
  companyFilterContent: { paddingHorizontal: 16, paddingVertical: 8 },
  tabsScroll: { backgroundColor: COLORS.bg, maxHeight: 46, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabsContent: { paddingHorizontal: 14, paddingVertical: 7, gap: 6, alignItems: 'center' },
  tab: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, fontFamily: 'Poppins-Medium', color: COLORS.gray600 },
  tabTextActive: { color: COLORS.white },
  groupedContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  group: { marginBottom: 10 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  groupTitle: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  groupCount: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 1 },
  groupCountText: { fontSize: 10, fontFamily: 'Poppins-Bold', color: COLORS.white },
  groupItems: { gap: 6 },
  productCard: { backgroundColor: COLORS.cardBg, borderRadius: 10, flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardLeftBorder: { width: 4 },
  cardContent: { flex: 1, padding: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
  cardTitleRow: { flex: 1, marginRight: 8 },
  cardProduct: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  cardStrength: { fontSize: 11, fontFamily: 'Poppins-Medium' },
  cardMolecule: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray600, marginBottom: 4 },
  cardMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  cardMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardMetaText: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  companyTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  companyTagText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  productCode: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray400 },
  drawerInner: { gap: 12 },
  productHero: { borderRadius: 12, padding: 14 },
  productHeroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  heroProduct: { fontSize: 18, fontFamily: 'Poppins-Bold', color: COLORS.dark },
  heroStrength: { fontSize: 14, fontFamily: 'Poppins-SemiBold', marginTop: 2 },
  productMetaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaItem: { width: '47%', backgroundColor: COLORS.white + 'CC', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: COLORS.border },
  metaLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500, textTransform: 'uppercase', marginBottom: 2 },
  metaValue: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 11, fontFamily: 'Poppins-SemiBold', textAlign: 'center' },
});
