import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, useWindowDimensions,
} from 'react-native';
import { Search, X, ChevronLeft, ChevronRight, FlaskConical, Building2, Globe, Pill, Tag, MapPin } from 'lucide-react-native';
import {
  COLORS, COMPANY_COLORS, productPortfolio, companyMetrics,
  rdData, goLanzarData, monthlyRevenue, customerViewData,
} from '@/data/mockData';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polyline, Circle, Path } from 'react-native-svg';
import DrawerModal from '@/components/ui/DrawerModal';
import StatusBadge from '@/components/ui/StatusBadge';
import FilterChip from '@/components/ui/FilterChip';
import CustomerStatusTab from '@/components/ui/CustomerStatusTab';

const TOP_TABS = ['Product Portfolio', 'Customer Details'];
const PAGE_SIZE = 6;

const THERAPEUTIC_COLORS: Record<string, string> = {
  'Diabetes': '#3a7d44',
  'Cardiovascular': '#c0392b',
  'Anti-infective': '#df6d14',
  'GI': '#4a90a4',
  'Antiretroviral': '#c9a84c',
  "Women's Health": '#e91e8c',
  'CNS': '#8a5fa8',
};

function therapeuticColor(t: string) {
  return THERAPEUTIC_COLORS[t] || '#607D8B';
}

function fmt(v: number) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

function SparkLine({ data, color, h = 44 }: { data: number[]; color: string; h?: number }) {
  const [w, setW] = React.useState(0);
  if (!data || data.length < 2) return null;
  const mx = Math.max(...data), range = mx - Math.min(...data) || 1, pad = 3;
  if (w === 0) {
    return <View style={{ height: h, width: '100%' }} onLayout={e => setW(e.nativeEvent.layout.width)} />;
  }
  const pts = data.map((v, i) => `${pad + (i / (data.length - 1)) * (w - pad * 2)},${pad + ((mx - v) / range) * (h - pad * 2)}`);
  const [lx, ly] = pts[pts.length - 1].split(',');
  return (
    <View style={{ width: '100%' }} onLayout={e => setW(e.nativeEvent.layout.width)}>
      <Svg width={w} height={h}>
        <Polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={lx} cy={ly} r={3} fill={color} />
      </Svg>
    </View>
  );
}

function DonutMini({ segments, size = 56 }: { segments: { value: number; color: string }[]; size?: number }) {
  const r = size / 2 - 5, cx = size / 2, cy = size / 2;
  const total = segments.reduce((s, g) => s + g.value, 0);
  let cum = -Math.PI / 2;
  const arcs = segments.map(seg => {
    const a = (seg.value / total) * Math.PI * 2;
    const x1 = cx + r * Math.cos(cum), y1 = cy + r * Math.sin(cum);
    const x2 = cx + r * Math.cos(cum + a), y2 = cy + r * Math.sin(cum + a);
    const ir = r - 13;
    const xi1 = cx + ir * Math.cos(cum), yi1 = cy + ir * Math.sin(cum);
    const xi2 = cx + ir * Math.cos(cum + a), yi2 = cy + ir * Math.sin(cum + a);
    const lg = a > Math.PI ? 1 : 0;
    const d = `M${x1} ${y1} A${r} ${r} 0 ${lg} 1 ${x2} ${y2} L${xi2} ${yi2} A${ir} ${ir} 0 ${lg} 0 ${xi1} ${yi1}Z`;
    cum += a;
    return { d, color: seg.color };
  });
  return <Svg width={size} height={size}>{arcs.map((a, i) => <Path key={i} d={a.d} fill={a.color} />)}</Svg>;
}

type ProductEntry = typeof productPortfolio[0];

interface MoleculeGroup {
  molecule: string;
  therapeutic: string;
  companies: string[];
  products: ProductEntry[];
  regions: string[];
  dosageForms: string[];
  strengths: string[];
}

function buildMoleculeGroups(items: ProductEntry[]): MoleculeGroup[] {
  const map: Record<string, MoleculeGroup> = {};
  items.forEach(item => {
    if (!map[item.molecules]) {
      map[item.molecules] = {
        molecule: item.molecules,
        therapeutic: item.therapeutic,
        companies: [],
        products: [],
        regions: [],
        dosageForms: [],
        strengths: [],
      };
    }
    const g = map[item.molecules];
    g.products.push(item);
    if (!g.companies.includes(item.company)) g.companies.push(item.company);
    if (!g.regions.includes(item.region)) g.regions.push(item.region);
    if (!g.dosageForms.includes(item.dosage)) g.dosageForms.push(item.dosage);
    if (!g.strengths.includes(item.strength)) g.strengths.push(item.strength);
  });
  return Object.values(map).sort((a, b) => a.molecule.localeCompare(b.molecule));
}

function CompanyRow({ entry, onPress }: { entry: ProductEntry; onPress: () => void }) {
  const color = COMPANY_COLORS[entry.company] || COLORS.primary;
  const statusType = entry.partnerStatus === 'In-House' ? 'success' : entry.partnerStatus === 'Partner' ? 'primary' : 'info';
  return (
    <TouchableOpacity style={cr.row} onPress={onPress} activeOpacity={0.75}>
      <View style={[cr.dot, { backgroundColor: color }]} />
      <View style={cr.left}>
        <View style={cr.topRow}>
          <Text style={[cr.company, { color }]}>{entry.company}</Text>
          <StatusBadge label={entry.partnerStatus} type={statusType} size="sm" />
        </View>
        <Text style={cr.product}>{entry.product} · {entry.strength}</Text>
        <View style={cr.meta}>
          <View style={cr.metaItem}><Pill size={9} color={COLORS.gray500} /><Text style={cr.metaText}>{entry.dosage}</Text></View>
          <View style={cr.metaItem}><MapPin size={9} color={COLORS.gray500} /><Text style={cr.metaText}>{entry.country}</Text></View>
          <View style={cr.metaItem}><Globe size={9} color={COLORS.gray500} /><Text style={cr.metaText}>{entry.region}</Text></View>
        </View>
      </View>
      <Text style={[cr.code, { color: COLORS.gray400 }]}>{entry.productCode}</Text>
    </TouchableOpacity>
  );
}

const cr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  left: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  company: { fontSize: 12, fontFamily: 'Poppins-SemiBold' },
  product: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.dark, marginBottom: 3 },
  meta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  code: { fontSize: 9, fontFamily: 'Poppins-Regular', marginTop: 3 },
});

function MoleculeCard({ group, onSelectProduct }: { group: MoleculeGroup; onSelectProduct: (p: ProductEntry) => void }) {
  const tColor = therapeuticColor(group.therapeutic);
  const companyColors = group.companies.map(c => COMPANY_COLORS[c] || COLORS.gray400);

  return (
    <View style={mc.card}>
      <View style={[mc.topBar, { backgroundColor: tColor + '12' }]}>
        <View style={mc.topLeft}>
          <View style={[mc.iconWrap, { backgroundColor: tColor + '20' }]}>
            <FlaskConical size={16} color={tColor} />
          </View>
          <View>
            <Text style={mc.molecule}>{group.molecule}</Text>
            <View style={[mc.taTag, { backgroundColor: tColor + '18' }]}>
              <Text style={[mc.taText, { color: tColor }]}>{group.therapeutic}</Text>
            </View>
          </View>
        </View>
        <View style={mc.topRight}>
          <DonutMini segments={group.companies.map((c, i) => ({ value: 1, color: companyColors[i] }))} size={48} />
          <Text style={mc.companyCount}>{group.companies.length} co.</Text>
        </View>
      </View>

      <View style={mc.statsRow}>
        <View style={mc.stat}>
          <Text style={mc.statVal}>{group.products.length}</Text>
          <Text style={mc.statLabel}>SKUs</Text>
        </View>
        <View style={mc.statDiv} />
        <View style={mc.stat}>
          <Text style={mc.statVal}>{group.regions.length}</Text>
          <Text style={mc.statLabel}>Regions</Text>
        </View>
        <View style={mc.statDiv} />
        <View style={mc.stat}>
          <Text style={mc.statVal}>{group.dosageForms.length}</Text>
          <Text style={mc.statLabel}>Forms</Text>
        </View>
        <View style={mc.statDiv} />
        <View style={mc.stat}>
          <Text style={mc.statVal}>{group.strengths.length}</Text>
          <Text style={mc.statLabel}>Strengths</Text>
        </View>
      </View>

      <View style={mc.tagsSection}>
        <View style={mc.tagRow}>
          <Building2 size={10} color={COLORS.gray500} />
          <Text style={mc.tagLabel}>Companies</Text>
        </View>
        <View style={mc.chips}>
          {group.companies.map(c => {
            const cc = COMPANY_COLORS[c] || COLORS.primary;
            return (
              <View key={c} style={[mc.chip, { backgroundColor: cc + '15', borderColor: cc + '40' }]}>
                <View style={[mc.chipDot, { backgroundColor: cc }]} />
                <Text style={[mc.chipText, { color: cc }]}>{c}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={mc.tagsSection}>
        <View style={mc.tagRow}>
          <Pill size={10} color={COLORS.gray500} />
          <Text style={mc.tagLabel}>Dosage Forms</Text>
        </View>
        <View style={mc.chips}>
          {group.dosageForms.map(d => (
            <View key={d} style={[mc.chip, { backgroundColor: COLORS.gray100, borderColor: COLORS.border }]}>
              <Text style={[mc.chipText, { color: COLORS.gray600 }]}>{d}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={mc.tagsSection}>
        <View style={mc.tagRow}>
          <Globe size={10} color={COLORS.gray500} />
          <Text style={mc.tagLabel}>Regions</Text>
        </View>
        <View style={mc.chips}>
          {group.regions.map(r => (
            <View key={r} style={[mc.chip, { backgroundColor: COLORS.gray100, borderColor: COLORS.border }]}>
              <Text style={[mc.chipText, { color: COLORS.gray600 }]}>{r}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={mc.dividerRow}>
        <View style={mc.divLine} />
        <Text style={mc.divText}>Products by Company</Text>
        <View style={mc.divLine} />
      </View>

      <View style={mc.productList}>
        {group.products.map(p => (
          <CompanyRow key={p.productCode} entry={p} onPress={() => onSelectProduct(p)} />
        ))}
      </View>
    </View>
  );
}

const mc = StyleSheet.create({
  card: { backgroundColor: COLORS.cardBg, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, paddingBottom: 10 },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  molecule: { fontSize: 15, fontFamily: 'Poppins-Bold', color: COLORS.dark, marginBottom: 3 },
  taTag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  taText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  topRight: { alignItems: 'center', gap: 2 },
  companyCount: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: COLORS.gray500 },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  statVal: { fontSize: 18, fontFamily: 'Poppins-Bold', color: COLORS.dark },
  statLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500, textTransform: 'uppercase', letterSpacing: 0.4 },
  statDiv: { width: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  tagsSection: { paddingHorizontal: 14, paddingTop: 10 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  tagLabel: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: COLORS.gray500, textTransform: 'uppercase', letterSpacing: 0.5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontSize: 10, fontFamily: 'Poppins-Medium' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 14, marginTop: 12, marginBottom: 0 },
  divLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  divText: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: COLORS.gray400 },
  productList: { paddingHorizontal: 14, paddingBottom: 4 },
});

function ProductDetailDrawer({ product, onClose, visible }: { product: ProductEntry; onClose: () => void; visible: boolean }) {
  const color = COMPANY_COLORS[product.company] || COLORS.primary;
  const tColor = therapeuticColor(product.therapeutic);
  const m = companyMetrics[product.company];
  const keyName = product.company === 'One Source' ? 'oneSource'
    : product.company === 'Instapill' ? 'instapill'
    : product.company === 'Strides' ? 'strides'
    : product.company === 'Naari' ? 'naari' : 'solara';
  const sparkData = monthlyRevenue.slice(-6).map(row => (row as any)[keyName] as number);
  const months = monthlyRevenue.slice(-6).map(row => row.month.replace(' 24', ''));

  return (
    <DrawerModal visible={visible} onClose={onClose} title={`${product.product} — ${product.company}`}>
      <View style={dd.root}>
        <View style={[dd.hero, { backgroundColor: color + '10' }]}>
          <View style={dd.heroTop}>
            <View>
              <Text style={dd.heroProduct}>{product.product}</Text>
              <Text style={[dd.heroStrength, { color }]}>{product.strength}</Text>
            </View>
            <StatusBadge
              label={product.partnerStatus}
              type={product.partnerStatus === 'In-House' ? 'success' : product.partnerStatus === 'Partner' ? 'primary' : 'info'}
            />
          </View>
          <View style={dd.grid}>
            {([
              { label: 'Molecule', value: product.molecules },
              { label: 'Dosage Form', value: product.dosage },
              { label: 'Therapeutic', value: product.therapeutic },
              { label: 'Country', value: product.country },
              { label: 'Region', value: product.region },
              { label: 'Product Code', value: product.productCode },
            ] as { label: string; value: string }[]).map(({ label, value }) => (
              <View key={label} style={dd.gridItem}>
                <Text style={dd.gridLabel}>{label}</Text>
                <Text style={dd.gridVal}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[dd.section, { backgroundColor: color + '08', borderColor: color + '25' }]}>
          <View style={dd.sectionHead}>
            <View style={[dd.sectionDot, { backgroundColor: color }]} />
            <Text style={[dd.sectionTitle, { color }]}>{product.company} — Company Overview</Text>
          </View>
          <View style={dd.kpiRow}>
            <View style={dd.kpi}><Text style={[dd.kpiVal, { color }]}>{fmt(m.revenue)}</Text><Text style={dd.kpiLabel}>Revenue</Text></View>
            <View style={dd.kpi}><Text style={[dd.kpiVal, { color: COLORS.success }]}>+{m.growth}%</Text><Text style={dd.kpiLabel}>Growth</Text></View>
            <View style={dd.kpi}><Text style={[dd.kpiVal, { color: COLORS.info }]}>{m.products}</Text><Text style={dd.kpiLabel}>Products</Text></View>
          </View>
          <Text style={dd.sparkTitle}>Revenue Trend (6M)</Text>
          <SparkLine data={sparkData} color={color} />
          <View style={dd.sparkLabels}>
            {months.map((mn, i) => <Text key={i} style={dd.sparkLabel}>{mn}</Text>)}
          </View>
        </View>
      </View>
    </DrawerModal>
  );
}

const dd = StyleSheet.create({
  root: { gap: 12 },
  hero: { borderRadius: 12, padding: 14 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  heroProduct: { fontSize: 18, fontFamily: 'Poppins-Bold', color: COLORS.dark },
  heroStrength: { fontSize: 13, fontFamily: 'Poppins-SemiBold', marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridItem: { width: '47%', backgroundColor: COLORS.white + 'CC', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: COLORS.border },
  gridLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500, textTransform: 'uppercase', marginBottom: 2 },
  gridVal: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  section: { borderRadius: 12, padding: 14, borderWidth: 1 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 12, fontFamily: 'Poppins-SemiBold' },
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  kpi: { flex: 1, alignItems: 'center', backgroundColor: COLORS.white + 'BB', borderRadius: 8, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border },
  kpiVal: { fontSize: 15, fontFamily: 'Poppins-Bold' },
  kpiLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500, marginTop: 2 },
  sparkTitle: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: COLORS.gray500, marginBottom: 6 },
  sparkLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  sparkLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray400, flex: 1, textAlign: 'center' },
});

function Pagination({ page, total, onPrev, onNext }: { page: number; total: number; onPrev: () => void; onNext: () => void }) {
  return (
    <View style={pg.row}>
      <TouchableOpacity style={[pg.btn, page === 1 && pg.btnDisabled]} onPress={onPrev} disabled={page === 1}>
        <ChevronLeft size={16} color={page === 1 ? COLORS.gray300 : COLORS.dark} />
        <Text style={[pg.btnText, page === 1 && pg.btnTextDisabled]}>Prev</Text>
      </TouchableOpacity>
      <View style={pg.center}>
        <Text style={pg.pageText}>Page <Text style={pg.pageNum}>{page}</Text> of <Text style={pg.pageNum}>{total}</Text></Text>
      </View>
      <TouchableOpacity style={[pg.btn, page === total && pg.btnDisabled]} onPress={onNext} disabled={page === total}>
        <Text style={[pg.btnText, page === total && pg.btnTextDisabled]}>Next</Text>
        <ChevronRight size={16} color={page === total ? COLORS.gray300 : COLORS.dark} />
      </TouchableOpacity>
    </View>
  );
}

const pg = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  btnDisabled: { borderColor: COLORS.gray100, backgroundColor: COLORS.gray100 },
  btnText: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  btnTextDisabled: { color: COLORS.gray300 },
  center: { alignItems: 'center' },
  pageText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  pageNum: { fontFamily: 'Poppins-Bold', color: COLORS.dark },
});

const ALL_MOLECULES = Array.from(new Set(productPortfolio.map(p => p.molecules))).sort();

function ProductPortfolioView() {
  const [search, setSearch] = useState('');
  const [moleculeFilter, setMoleculeFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<ProductEntry | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const filteredProducts = useMemo(() => {
    let items = productPortfolio;
    if (moleculeFilter !== 'All') items = items.filter(p => p.molecules === moleculeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(p =>
        p.molecules.toLowerCase().includes(q) ||
        p.product.toLowerCase().includes(q) ||
        p.company.toLowerCase().includes(q) ||
        p.therapeutic.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q)
      );
    }
    return items;
  }, [search, moleculeFilter]);

  const groups = useMemo(() => buildMoleculeGroups(filteredProducts), [filteredProducts]);
  const totalPages = Math.max(1, Math.ceil(groups.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageGroups = groups.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearchChange = (v: string) => { setSearch(v); setPage(1); };
  const handleMoleculeFilter = (m: string) => { setMoleculeFilter(m); setPage(1); };

  const openProduct = (item: ProductEntry) => {
    setSelectedProduct(item);
    setDrawerVisible(true);
  };

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
              placeholder="Search molecules, products, companies..."
              placeholderTextColor={COLORS.gray400}
              value={search}
              onChangeText={handleSearchChange}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => handleSearchChange('')} hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}>
                <X size={14} color={COLORS.gray400} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.filterSection}>
          <View style={styles.filterLabel}>
            <FlaskConical size={12} color={COLORS.gray500} />
            <Text style={styles.filterLabelText}>Filter by Molecule</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
            <FilterChip label="All" active={moleculeFilter === 'All'} onPress={() => handleMoleculeFilter('All')} color={COLORS.dark} />
            {ALL_MOLECULES.map(m => (
              <FilterChip key={m} label={m} active={moleculeFilter === m} onPress={() => handleMoleculeFilter(m)} color={therapeuticColor(productPortfolio.find(p => p.molecules === m)?.therapeutic || '')} />
            ))}
          </ScrollView>
        </View>

        {groups.length === 0 ? (
          <View style={styles.empty}>
            <FlaskConical size={36} color={COLORS.gray300} />
            <Text style={styles.emptyText}>No molecules found</Text>
          </View>
        ) : (
          <View style={styles.listContent}>
            <View style={styles.pageInfo}>
              <Text style={styles.pageInfoText}>Showing {pageGroups.length} of {groups.length} molecules</Text>
            </View>
            {pageGroups.map(group => (
              <MoleculeCard key={group.molecule} group={group} onSelectProduct={openProduct} />
            ))}
          </View>
        )}
      </ScrollView>

      {groups.length > 0 && (
        <Pagination
          page={safePage}
          total={totalPages}
          onPrev={() => setPage(p => Math.max(1, p - 1))}
          onNext={() => setPage(p => Math.min(totalPages, p + 1))}
        />
      )}

      {selectedProduct && (
        <ProductDetailDrawer
          product={selectedProduct}
          visible={drawerVisible}
          onClose={() => setDrawerVisible(false)}
        />
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
  filterSection: { backgroundColor: COLORS.bg, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingTop: 10, paddingBottom: 6 },
  filterLabel: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 16, marginBottom: 6 },
  filterLabelText: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: COLORS.gray500, textTransform: 'uppercase', letterSpacing: 0.5 },
  filterContent: { paddingHorizontal: 16, gap: 6, alignItems: 'center' },
  listContent: { paddingHorizontal: 16, paddingTop: 10 },
  pageInfo: { marginBottom: 8 },
  pageInfoText: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: COLORS.gray400 },
});
