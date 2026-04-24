import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, useWindowDimensions, Modal,
  Animated, TouchableWithoutFeedback,
} from 'react-native';
import { Search, X, ChevronLeft, ChevronRight, Users, MapPin, TrendingUp, Package, Globe, ArrowUpRight } from 'lucide-react-native';
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

const COMPANIES = ['All', 'Strides', 'Instapill', 'One Source', 'Naari', 'Solara'];
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

        {/* SKU Details Table */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={csd.scrollContent}>
          <View style={csd.sectionHeader}>
            <Package size={12} color={N.muted} />
            <Text style={csd.sectionTitle}>SKU Details</Text>
            <View style={csd.sectionLine} />
          </View>

          <View style={csd.table}>
            <View style={csd.tableHead}>
              <Text style={[csd.tableH, { flex: 1 }]}>SKU</Text>
              <Text style={[csd.tableH, { flex: 2 }]}>Product</Text>
              <Text style={[csd.tableH, { flex: 1 }]}>Region</Text>
              <Text style={[csd.tableH, { flex: 1, textAlign: 'right' }]}>Revenue</Text>
            </View>
            {skus.length === 0 ? (
              <View style={csd.empty}>
                <Text style={csd.emptyText}>No SKU details available</Text>
              </View>
            ) : skus.map((s, i) => (
              <View key={s.sku} style={[csd.tableRow, i < skus.length - 1 && csd.tableRowBorder]}>
                <View style={{ flex: 1 }}>
                  <View style={csd.skuBadge}>
                    <Text style={csd.skuBadgeText} numberOfLines={1}>{s.sku}</Text>
                  </View>
                </View>
                <Text style={[csd.productText, { flex: 2 }]} numberOfLines={2}>{s.product}</Text>
                <Text style={[csd.regionText, { flex: 1 }]} numberOfLines={1}>{s.region}</Text>
                <Text style={[csd.revenueText, { flex: 1 }]}>{fmt(s.revenue)}</Text>
              </View>
            ))}
          </View>

          {/* Revenue Summary */}
          <View style={csd.sectionHeader}>
            <TrendingUp size={12} color={N.muted} />
            <Text style={csd.sectionTitle}>Revenue Summary</Text>
            <View style={csd.sectionLine} />
          </View>
          <View style={[csd.heroCard, { borderColor: cc + '40', backgroundColor: cc + '08' }]}>
            <View>
              <Text style={[csd.heroAmount, { color: cc }]}>{fmt(totalRev)}</Text>
              <Text style={csd.heroLabel}>Total Revenue</Text>
            </View>
            <View style={csd.heroRight}>
              <View style={csd.heroStat}>
                <Text style={csd.heroStatVal}>{skus.length}</Text>
                <Text style={csd.heroStatLabel}>{skus.length === 1 ? 'SKU' : 'SKUs'}</Text>
              </View>
              <View style={[csd.heroDivider]} />
              <View style={csd.heroStat}>
                <Text style={csd.heroStatVal}>{regions.length}</Text>
                <Text style={csd.heroStatLabel}>{regions.length === 1 ? 'Region' : 'Regions'}</Text>
              </View>
            </View>
          </View>

          {/* Region breakdown */}
          {regions.length > 0 && (
            <>
              <View style={csd.sectionHeader}>
                <Globe size={12} color={N.muted} />
                <Text style={csd.sectionTitle}>By Region</Text>
                <View style={csd.sectionLine} />
              </View>
              {regions.map(region => {
                const regionSkus = skus.filter(s => s.region === region);
                const regionRev = regionSkus.reduce((sum, s) => sum + s.revenue, 0);
                return (
                  <View key={region} style={csd.regionRow}>
                    <Globe size={11} color={N.muted} />
                    <Text style={csd.regionLabel}>{region}</Text>
                    <Text style={csd.regionSkuCount}>{regionSkus.length} SKU{regionSkus.length !== 1 ? 's' : ''}</Text>
                    <Text style={[csd.regionRev, { color: cc }]}>{fmt(regionRev)}</Text>
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>
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
  scrollContent: { padding: 12, paddingBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, marginBottom: 7 },
  sectionTitle: { fontSize: 9, fontFamily: 'Poppins-Bold', color: N.muted, textTransform: 'uppercase', letterSpacing: 0.7 },
  sectionLine: { flex: 1, height: 1, backgroundColor: N.border },
  table: { backgroundColor: N.cardBg, borderRadius: 8, borderWidth: 1, borderColor: N.border, overflow: 'hidden' },
  tableHead: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 7, backgroundColor: N.headBg, borderBottomWidth: 1, borderBottomColor: N.border },
  tableH: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: N.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 9, gap: 6 },
  tableRowBorder: { borderBottomWidth: 1, borderBottomColor: N.borderLt },
  skuBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: N.border, backgroundColor: N.headBg, alignSelf: 'flex-start' },
  skuBadgeText: { fontSize: 9, fontFamily: 'Poppins-SemiBold', color: N.mid },
  productText: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: N.dark },
  regionText: { fontSize: 10, fontFamily: 'Poppins-Regular', color: N.muted },
  revenueText: { fontSize: 11, fontFamily: 'Poppins-Bold', color: N.green, textAlign: 'right' },
  empty: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: N.faint },
  heroCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 8, padding: 14, marginBottom: 4 },
  heroAmount: { fontSize: 20, fontFamily: 'Poppins-Bold' },
  heroLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: N.muted, marginTop: 2 },
  heroRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroStat: { alignItems: 'center' },
  heroStatVal: { fontSize: 16, fontFamily: 'Poppins-Bold', color: N.dark },
  heroStatLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: N.muted },
  heroDivider: { width: 1, height: 28, backgroundColor: N.border },
  regionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: N.borderLt },
  regionLabel: { flex: 1, fontSize: 11, fontFamily: 'Poppins-Regular', color: N.dark },
  regionSkuCount: { fontSize: 10, fontFamily: 'Poppins-Regular', color: N.muted },
  regionRev: { fontSize: 11, fontFamily: 'Poppins-Bold', minWidth: 48, textAlign: 'right' },
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

  const allCustomerNames = useMemo(() => ['All', ...allCustomers.map(c => c.customerName)], [allCustomers]);

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

        {/* Header */}
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

        {/* Company filter */}
        <View style={cs.filterSection}>
          <Text style={cs.filterGroupLabel}>Companies</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={cs.filterRow}>
            {COMPANIES.map(c => {
              const active = companyFilter === c;
              const color = COMPANY_COLORS[c] || N.green;
              return (
                <TouchableOpacity
                  key={c}
                  style={[cs.filterChip, active && { backgroundColor: color, borderColor: color }]}
                  onPress={() => { setCompanyFilter(c); setPage(1); }}
                  activeOpacity={0.75}
                >
                  <Text style={[cs.filterChipText, active && { color: '#fff' }]}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Customer filter */}
        <View style={cs.filterSection}>
          <Text style={cs.filterGroupLabel}>Customers</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={cs.filterRow}>
            <TouchableOpacity
              style={[cs.filterChip, customerFilter.length === 0 && { backgroundColor: N.green, borderColor: N.green }]}
              onPress={() => { setCustomerFilter([]); setPage(1); }}
              activeOpacity={0.75}
            >
              <Text style={[cs.filterChipText, customerFilter.length === 0 && { color: '#fff' }]}>All</Text>
            </TouchableOpacity>
            {allCustomers
              .filter(c => companyFilter === 'All' || c.company === companyFilter)
              .map(c => {
                const active = customerFilter.includes(c.customerName);
                return (
                  <TouchableOpacity
                    key={c.customerCode}
                    style={[cs.filterChip, active && { backgroundColor: N.green, borderColor: N.green }]}
                    onPress={() => {
                      setCustomerFilter(prev =>
                        active ? prev.filter(n => n !== c.customerName) : [...prev, c.customerName]
                      );
                      setPage(1);
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={[cs.filterChipText, active && { color: '#fff' }]} numberOfLines={1}>{c.customerName}</Text>
                  </TouchableOpacity>
                );
              })}
          </ScrollView>
        </View>

        {/* Card grid */}
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
                return (
                  <View key={customer.customerCode} style={[cs.custCard, { borderLeftColor: cc, width: cardWidth }]}>
                    {/* Card header */}
                    <View style={cs.cardHead}>
                      <View style={[cs.cardIconWrap, { backgroundColor: cc + '18' }]}>
                        <Text style={[cs.cardInitials, { color: cc }]}>{customer.customerName.substring(0, 2).toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={cs.cardName} numberOfLines={1}>{customer.customerName}</Text>
                        <View style={cs.segChip}>
                          <MapPin size={8} color={N.muted} />
                          <Text style={cs.segChipText} numberOfLines={1}>{customer.country}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Stats row */}
                    <View style={cs.statsRow}>
                      {[
                        { val: skuCount, singular: 'SKU', plural: 'SKUs' },
                        { val: [...new Set((CUSTOMER_SKU_DETAILS[customer.customerCode] ?? []).map(s => s.region))].length || 1, singular: 'Region', plural: 'Regions' },
                        { val: customer.products.length, singular: 'Product', plural: 'Products' },
                      ].map((s, i, arr) => (
                        <React.Fragment key={s.singular}>
                          <View style={cs.statCell}>
                            <Text style={cs.statVal}>{s.val}</Text>
                            <Text style={cs.statLbl}>{s.val === 1 ? s.singular : s.plural}</Text>
                          </View>
                          {i < arr.length - 1 && <View style={cs.statDivider} />}
                        </React.Fragment>
                      ))}
                    </View>

                    {/* Revenue row */}
                    <View style={cs.revenueRow}>
                      <TrendingUp size={11} color={N.green} />
                      <Text style={cs.revenueLabel}>Revenue</Text>
                      <Text style={cs.revenueVal}>{fmt(customer.totalRevenue)}</Text>
                    </View>

                    {/* Company & segment badges */}
                    <View style={cs.compRow}>
                      <View style={[cs.compBadge, { borderColor: cc + '40', backgroundColor: cc + '0f' }]}>
                        <View style={[cs.compDot, { backgroundColor: cc }]} />
                        <Text style={[cs.compBadgeText, { color: cc }]} numberOfLines={1}>{customer.company}</Text>
                      </View>
                      <View style={cs.segBadge}>
                        <Text style={cs.segBadgeText} numberOfLines={1}>{customer.segment}</Text>
                      </View>
                    </View>

                    {/* More Details */}
                    <TouchableOpacity style={cs.detailBtn} onPress={() => openSidebar(customer)} activeOpacity={0.8}>
                      <Text style={cs.detailBtnText}>More Details</Text>
                      <ArrowUpRight size={10} color={N.muted} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={cs.pagination}>
              <TouchableOpacity
                style={[cs.pageBtn, safePage === 1 && cs.pageBtnDisabled]}
                onPress={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                activeOpacity={0.75}
              >
                <ChevronLeft size={14} color={safePage === 1 ? N.faint : N.mid} />
              </TouchableOpacity>
              <Text style={cs.pageInfo}>Page {safePage} of {totalPages}</Text>
              <TouchableOpacity
                style={[cs.pageBtn, safePage === totalPages && cs.pageBtnDisabled]}
                onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                activeOpacity={0.75}
              >
                <ChevronRight size={14} color={safePage === totalPages ? N.faint : N.mid} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

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
  scrollContent: { paddingBottom: 32 },
  header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 16 },
  headerTitle: { fontSize: 20, fontFamily: 'Poppins-Bold', color: '#fff' },
  headerSub: { fontSize: 11, fontFamily: 'Poppins-Regular', color: 'rgba(255,255,255,0.8)', marginTop: 3 },
  searchWrap: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: N.cardBg, borderBottomWidth: 1, borderBottomColor: N.border },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: N.pageBg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, gap: 8, borderWidth: 1, borderColor: N.border },
  searchInput: { flex: 1, fontSize: 13, fontFamily: 'Poppins-Regular', color: N.dark, padding: 0 },
  filterSection: { backgroundColor: N.cardBg, borderBottomWidth: 1, borderBottomColor: N.border, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 8 },
  filterGroupLabel: { fontSize: 9, fontFamily: 'Poppins-Bold', color: N.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  filterChip: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: N.border, backgroundColor: N.cardBg },
  filterChipText: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: N.mid },
  cardWrap: { padding: 14 },
  resultMeta: { fontSize: 11, fontFamily: 'Poppins-Regular', color: N.muted, marginBottom: 10 },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: N.faint },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  custCard: { backgroundColor: N.cardBg, borderRadius: 12, borderWidth: 1, borderLeftWidth: 3, borderColor: N.border, overflow: 'hidden' },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: N.borderLt },
  cardIconWrap: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  cardInitials: { fontSize: 12, fontFamily: 'Poppins-Bold' },
  cardName: { fontSize: 12, fontFamily: 'Poppins-Bold', color: N.dark, marginBottom: 3 },
  segChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  segChipText: { fontSize: 9, fontFamily: 'Poppins-Regular', color: N.muted },
  statsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: N.borderLt, paddingVertical: 8 },
  statCell: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 14, fontFamily: 'Poppins-Bold', color: N.dark },
  statLbl: { fontSize: 8, fontFamily: 'Poppins-Regular', color: N.muted, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: N.border, marginVertical: 4 },
  revenueRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: N.borderLt },
  revenueLabel: { flex: 1, fontSize: 10, fontFamily: 'Poppins-SemiBold', color: N.muted },
  revenueVal: { fontSize: 13, fontFamily: 'Poppins-Bold', color: N.green },
  compRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 10, paddingTop: 8, paddingBottom: 6, flexWrap: 'wrap' },
  compBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  compDot: { width: 5, height: 5, borderRadius: 2.5 },
  compBadgeText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  segBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20, borderWidth: 1, borderColor: N.border, backgroundColor: N.headBg },
  segBadgeText: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: N.mid },
  detailBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, margin: 10, marginTop: 6, paddingVertical: 7, borderRadius: 7, borderWidth: 1, borderColor: N.border, backgroundColor: N.headBg },
  detailBtnText: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: N.muted },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 16 },
  pageBtn: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, borderColor: N.border, backgroundColor: N.cardBg, alignItems: 'center', justifyContent: 'center' },
  pageBtnDisabled: { opacity: 0.4 },
  pageInfo: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: N.mid },
});
