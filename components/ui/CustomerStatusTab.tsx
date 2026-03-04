import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, Dimensions,
} from 'react-native';
import { Search, X, ChevronRight, MapPin, Users, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, COMPANY_COLORS, CUSTOMERS_BY_COMPANY, CUSTOMER_PRODUCTS } from '@/data/mockData';
import DrawerModal from '@/components/ui/DrawerModal';
import CustomerDIFOT from '@/components/ui/CustomerDIFOT';
import CustomerBackorders from '@/components/ui/CustomerBackorders';
import CustomerUpcomingOrders from '@/components/ui/CustomerUpcomingOrders';
import CustomerCompetitorAnalysis from '@/components/ui/CustomerCompetitorAnalysis';

const { width: SW } = Dimensions.get('window');
const isTablet = SW >= 768;
const COMPANIES = ['All', 'Strides', 'Instapill', 'One Source', 'Naari', 'Solara'];
const SUB_TABS = ['Customers', 'DIFOT', 'Backorders', 'Upcoming Orders', 'Competitor Analysis'];

function fmt(v: number) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

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

function CustomerCard({ item, color, onPress }: { item: CustomerEntry; color: string; onPress: () => void }) {
  const hasProducts = !!CUSTOMER_PRODUCTS[item.customerCode];
  return (
    <TouchableOpacity style={[styles.custCard, { borderTopColor: color }]} activeOpacity={0.88} onPress={onPress}>
      <View style={styles.custCardInner}>
        <View style={[styles.custInitial, { backgroundColor: color + '18' }]}>
          <Text style={[styles.custInitialText, { color }]}>{item.customerName.substring(0, 2).toUpperCase()}</Text>
        </View>
        <View style={styles.custInfo}>
          <Text style={styles.custName} numberOfLines={1}>{item.customerName}</Text>
          <View style={styles.custMetaRow}>
            <MapPin size={10} color={COLORS.gray500} />
            <Text style={styles.custMeta} numberOfLines={1}>{item.country} · {item.region}</Text>
          </View>
          <View style={styles.custBottom}>
            <View style={[styles.segBadge, { backgroundColor: color + '12' }]}>
              <Text style={[styles.segText, { color }]} numberOfLines={1}>{item.segment}</Text>
            </View>
            <Text style={[styles.revText, { color }]}>{fmt(item.totalRevenue)}</Text>
          </View>
        </View>
        <View style={styles.custArrow}>
          <Text style={styles.prodCount}>{item.products.length} SKU{item.products.length !== 1 ? 's' : ''}</Text>
          {hasProducts && <ChevronRight size={14} color={COLORS.gray400} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

type CustomerDetailProduct = {
  product: string;
  materialCode: string;
  company: string;
  category: string;
  strength: string;
  supplyType: string;
  annualVolume: number;
  revenue: number;
  competitors: { name: string; product: string; share: number }[];
  otherVendors: { vendor: string; product: string; category: string }[];
  stridesSupply: { company: string; product: string; category: string }[];
};

function CustomerDetailDrawer({ item, color }: { item: CustomerEntry; color: string }) {
  const products: CustomerDetailProduct[] = CUSTOMER_PRODUCTS[item.customerCode] || [];
  const [activeSection, setActiveSection] = useState<'products' | 'competitors' | 'supply'>('products');

  return (
    <View style={dd.root}>
      <View style={[dd.header, { backgroundColor: color + '10' }]}>
        <View style={[dd.initial, { backgroundColor: color + '22' }]}>
          <Text style={[dd.initText, { color }]}>{item.customerName.substring(0, 2).toUpperCase()}</Text>
        </View>
        <View style={dd.headerInfo}>
          <Text style={dd.name}>{item.customerName}</Text>
          <Text style={dd.sub}>{item.country} · {item.region} · {item.segment}</Text>
        </View>
      </View>

      <View style={dd.kpiRow}>
        <View style={dd.kpi}>
          <Text style={dd.kpiLabel}>Revenue</Text>
          <Text style={[dd.kpiVal, { color }]}>{fmt(item.totalRevenue)}</Text>
        </View>
        <View style={dd.kpi}>
          <Text style={dd.kpiLabel}>Products</Text>
          <Text style={[dd.kpiVal, { color: COLORS.info }]}>{item.products.length}</Text>
        </View>
        <View style={dd.kpi}>
          <Text style={dd.kpiLabel}>Company</Text>
          <Text style={[dd.kpiVal, { color }]} numberOfLines={1}>{item.company}</Text>
        </View>
      </View>

      <View style={dd.sectionTabs}>
        {([['products', 'Products'], ['competitors', 'Competitors'], ['supply', 'Supply']] as const).map(([key, label]) => (
          <TouchableOpacity
            key={key} activeOpacity={0.8}
            style={[dd.sectionTab, activeSection === key && { backgroundColor: color, borderColor: color }]}
            onPress={() => setActiveSection(key)}
          >
            <Text style={[dd.sectionTabText, activeSection === key && dd.sectionTabActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeSection === 'products' && (
        <View style={dd.section}>
          {products.length > 0 ? (
            products.map((p, i) => (
              <View key={i} style={[dd.productRow, { borderLeftColor: color }]}>
                <View style={dd.prodInfo}>
                  <Text style={dd.prodName}>{p.product}</Text>
                  <Text style={dd.prodMeta}>{p.category} · {p.strength} · {p.supplyType}</Text>
                  <Text style={dd.prodVol}>{p.annualVolume.toLocaleString()} units/yr</Text>
                </View>
                <View style={dd.prodRight}>
                  <Text style={[dd.prodRev, { color }]}>{fmt(p.revenue)}</Text>
                  <Text style={dd.prodCode}>{p.materialCode}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={dd.noData}>Product details available on demand</Text>
          )}
        </View>
      )}

      {activeSection === 'competitors' && (
        <View style={dd.section}>
          {products.flatMap((p, pi) => (
            <View key={pi} style={{ marginBottom: 12 }}>
              <Text style={dd.prodHeader}>{p.product} — Top Competitors</Text>
              {p.competitors.map((c, ci) => (
                <View key={ci} style={dd.compRow}>
                  <Text style={dd.compRank}>#{ci + 1}</Text>
                  <View style={dd.compInfo}>
                    <Text style={dd.compName}>{c.name}</Text>
                    <Text style={dd.compProduct}>{c.product}</Text>
                  </View>
                  <View style={dd.shareBar}>
                    <View style={[dd.shareBarFill, { width: `${c.share}%`, backgroundColor: COLORS.error + 'AA' }]} />
                  </View>
                  <Text style={[dd.shareVal, { color: COLORS.error }]}>{c.share}%</Text>
                </View>
              ))}
              {p.otherVendors.length > 0 && (
                <>
                  <Text style={[dd.prodHeader, { marginTop: 10 }]}>Other Vendors Buying From</Text>
                  {p.otherVendors.map((v, vi) => (
                    <View key={vi} style={dd.vendorRow}>
                      <View style={[dd.vendorDot, { backgroundColor: COLORS.info }]} />
                      <Text style={dd.vendorName}>{v.vendor}</Text>
                      <Text style={dd.vendorProduct}>{v.product}</Text>
                      <View style={dd.catBadge}>
                        <Text style={dd.catText}>{v.category}</Text>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>
          ))}
          {products.length === 0 && <Text style={dd.noData}>No competitor data available</Text>}
        </View>
      )}

      {activeSection === 'supply' && (
        <View style={dd.section}>
          <Text style={dd.sectionDesc}>Everything the Strides Group companies supply to this customer:</Text>
          {products.flatMap((p, pi) => p.stridesSupply.map((s, si) => {
            const sc = COMPANY_COLORS[s.company] || COLORS.primary;
            return (
              <View key={`${pi}-${si}`} style={[dd.supplyRow, { borderLeftColor: sc }]}>
                <View style={[dd.supplyCompBadge, { backgroundColor: sc + '18' }]}>
                  <Text style={[dd.supplyCompText, { color: sc }]}>{s.company}</Text>
                </View>
                <View style={dd.supplyInfo}>
                  <Text style={dd.supplyProduct}>{s.product}</Text>
                  <Text style={dd.supplyCategory}>{s.category}</Text>
                </View>
              </View>
            );
          }))}
          {products.length === 0 && <Text style={dd.noData}>No supply data available</Text>}
        </View>
      )}
    </View>
  );
}

const dd = StyleSheet.create({
  root: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 14 },
  initial: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  initText: { fontSize: 16, fontFamily: 'Poppins-Bold' },
  headerInfo: { flex: 1 },
  name: { fontSize: 15, fontFamily: 'Poppins-Bold', color: COLORS.dark },
  sub: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray500, marginTop: 2 },
  kpiRow: { flexDirection: 'row', gap: 8 },
  kpi: { flex: 1, backgroundColor: COLORS.cream, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  kpiLabel: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500, textTransform: 'uppercase', marginBottom: 4 },
  kpiVal: { fontSize: 14, fontFamily: 'Poppins-Bold' },
  sectionTabs: { flexDirection: 'row', gap: 8 },
  sectionTab: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 10, alignItems: 'center', backgroundColor: COLORS.white },
  sectionTabText: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: COLORS.gray600 },
  sectionTabActive: { color: COLORS.white },
  section: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 4 },
  sectionDesc: { fontSize: 12, fontFamily: 'Poppins-Regular', color: COLORS.gray500, marginBottom: 8 },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingLeft: 12, borderLeftWidth: 3, borderRadius: 4, marginBottom: 8, backgroundColor: COLORS.bg },
  prodInfo: { flex: 1, gap: 3 },
  prodName: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  prodMeta: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  prodVol: { fontSize: 11, fontFamily: 'Poppins-Medium', color: COLORS.info },
  prodRight: { alignItems: 'flex-end', gap: 3, paddingLeft: 8 },
  prodRev: { fontSize: 13, fontFamily: 'Poppins-Bold' },
  prodCode: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray400 },
  noData: { fontSize: 13, fontFamily: 'Poppins-Regular', color: COLORS.gray400, padding: 16, textAlign: 'center' },
  prodHeader: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: COLORS.gray700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  compRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  compRank: { width: 20, fontSize: 11, fontFamily: 'Poppins-Bold', color: COLORS.gray400 },
  compInfo: { flex: 1 },
  compName: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  compProduct: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  shareBar: { width: 64, height: 6, backgroundColor: COLORS.gray100, borderRadius: 3, overflow: 'hidden' },
  shareBarFill: { height: 6, borderRadius: 3 },
  shareVal: { width: 36, fontSize: 11, fontFamily: 'Poppins-Bold', textAlign: 'right' },
  vendorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  vendorDot: { width: 7, height: 7, borderRadius: 4 },
  vendorName: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: COLORS.dark, flex: 1 },
  vendorProduct: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray500, flex: 1 },
  catBadge: { borderRadius: 6, backgroundColor: COLORS.gray100, paddingHorizontal: 7, paddingVertical: 3 },
  catText: { fontSize: 10, fontFamily: 'Poppins-Medium', color: COLORS.gray600 },
  supplyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 12, paddingVertical: 8, borderLeftWidth: 3, borderRadius: 4, marginBottom: 6, backgroundColor: COLORS.bg },
  supplyCompBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  supplyCompText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  supplyInfo: { flex: 1 },
  supplyProduct: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  supplyCategory: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
});

export default function CustomerStatusTab() {
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerEntry | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const allCustomers = useMemo(() => {
    const result: CustomerEntry[] = [];
    Object.entries(CUSTOMERS_BY_COMPANY).forEach(([company, customers]) => {
      customers.forEach(c => result.push({ ...c, company }));
    });
    return result;
  }, []);

  const filtered = useMemo(() => {
    let items = allCustomers;
    if (companyFilter !== 'All') items = items.filter(c => c.company === companyFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(c =>
        c.customerName.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        c.segment.toLowerCase().includes(q)
      );
    }
    return items;
  }, [allCustomers, search, companyFilter]);

  const totalRevenue = filtered.reduce((s, c) => s + c.totalRevenue, 0);

  const groupedByCompany = useMemo(() => {
    const map: Record<string, CustomerEntry[]> = {};
    filtered.forEach(c => {
      if (!map[c.company]) map[c.company] = [];
      map[c.company].push(c);
    });
    return Object.entries(map);
  }, [filtered]);

  const openCustomer = (item: CustomerEntry) => {
    setSelectedCustomer(item);
    setDrawerVisible(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary, '#4a8f55']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Customer Details</Text>
        <Text style={styles.headerSub}>
          {allCustomers.length} customers · {Object.keys(CUSTOMERS_BY_COMPANY).length} companies · {fmt(allCustomers.reduce((s, c) => s + c.totalRevenue, 0))} total revenue
        </Text>
        <View style={styles.headerGoldLine} />
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subTabsScroll} contentContainerStyle={styles.subTabsContent}>
        {SUB_TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab} activeOpacity={0.8}
            style={[styles.subTab, activeSubTab === i && styles.subTabActive]}
            onPress={() => setActiveSubTab(i)}
          >
            <Text style={[styles.subTabText, activeSubTab === i && styles.subTabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {activeSubTab === 0 && (
        <>
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Search size={15} color={COLORS.gray500} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search customers, countries, regions..."
                placeholderTextColor={COLORS.gray400}
                value={search} onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <X size={14} color={COLORS.gray400} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.companyFilterScroll} contentContainerStyle={styles.companyFilterContent}>
            {COMPANIES.map(c => (
              <TouchableOpacity
                key={c} activeOpacity={0.8}
                style={[styles.compChip, companyFilter === c && { backgroundColor: COMPANY_COLORS[c] || COLORS.primary, borderColor: COMPANY_COLORS[c] || COLORS.primary }]}
                onPress={() => setCompanyFilter(c)}
              >
                <Text style={[styles.compChipText, companyFilter === c && styles.compChipActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Users size={14} color={COLORS.primary} />
              <Text style={styles.summaryVal}>{filtered.length}</Text>
              <Text style={styles.summaryLabel}>Customers</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <TrendingUp size={14} color={COLORS.success} />
              <Text style={styles.summaryVal}>{fmt(totalRevenue)}</Text>
              <Text style={styles.summaryLabel}>Total Revenue</Text>
            </View>
          </View>

          <ScrollView style={styles.listScroll} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {groupedByCompany.map(([company, customers]) => {
              const cc = COMPANY_COLORS[company] || COLORS.primary;
              return (
                <View key={company} style={styles.compGroup}>
                  <View style={styles.compGroupHeader}>
                    <View style={[styles.compGroupDot, { backgroundColor: cc }]} />
                    <Text style={[styles.compGroupName, { color: cc }]}>{company}</Text>
                    <View style={[styles.compGroupBadge, { backgroundColor: cc + '20' }]}>
                      <Text style={[styles.compGroupCount, { color: cc }]}>{customers.length}</Text>
                    </View>
                    <Text style={[styles.compGroupRev, { color: cc }]}>{fmt(customers.reduce((s, c) => s + c.totalRevenue, 0))}</Text>
                  </View>
                  <View style={styles.custGrid}>
                    {customers.map(c => (
                      <CustomerCard key={c.customerCode} item={c} color={cc} onPress={() => openCustomer(c)} />
                    ))}
                  </View>
                </View>
              );
            })}
            {filtered.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No customers match your search</Text>
              </View>
            )}
          </ScrollView>
        </>
      )}

      {activeSubTab === 1 && <CustomerDIFOT />}
      {activeSubTab === 2 && <CustomerBackorders />}
      {activeSubTab === 3 && <CustomerUpcomingOrders />}
      {activeSubTab === 4 && <CustomerCompetitorAnalysis />}

      {selectedCustomer && (
        <DrawerModal
          visible={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          title={`${selectedCustomer.customerName} — ${selectedCustomer.company}`}
        >
          <CustomerDetailDrawer
            item={selectedCustomer}
            color={COMPANY_COLORS[selectedCustomer.company] || COLORS.primary}
          />
        </DrawerModal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  headerGoldLine: { height: 2, backgroundColor: COLORS.gold, opacity: 0.5, marginTop: 12 },
  headerTitle: { fontSize: 20, fontFamily: 'Poppins-Bold', color: COLORS.white },
  headerSub: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.goldLight, marginTop: 2, opacity: 0.85 },
  subTabsScroll: {
    maxHeight: 48,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  subTabsContent: { paddingHorizontal: 14, paddingVertical: 8, gap: 6, alignItems: 'center' },
  subTab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  subTabActive: { backgroundColor: COLORS.primary },
  subTabText: { fontSize: 13, fontFamily: 'Poppins-Medium', color: COLORS.gray600 },
  subTabTextActive: { color: COLORS.white },
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Poppins-Regular', color: COLORS.dark, padding: 0 },
  companyFilterScroll: {
    maxHeight: 50,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  companyFilterContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, alignItems: 'center' },
  compChip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: COLORS.white,
  },
  compChipText: { fontSize: 12, fontFamily: 'Poppins-Medium', color: COLORS.gray700 },
  compChipActive: { color: COLORS.white },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.cream,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  summaryVal: { fontSize: 15, fontFamily: 'Poppins-Bold', color: COLORS.dark },
  summaryLabel: { fontSize: 12, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  summaryDivider: { width: 1, height: 24, backgroundColor: COLORS.border, marginHorizontal: 16 },
  listScroll: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 32, gap: 16 },
  compGroup: { gap: 10 },
  compGroupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  compGroupDot: { width: 10, height: 10, borderRadius: 5 },
  compGroupName: { fontSize: 14, fontFamily: 'Poppins-Bold', flex: 1 },
  compGroupBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  compGroupCount: { fontSize: 11, fontFamily: 'Poppins-Bold' },
  compGroupRev: { fontSize: 12, fontFamily: 'Poppins-SemiBold' },
  custGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  custCard: {
    width: isTablet ? '31%' : '100%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  custCardInner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  custInitial: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  custInitialText: { fontSize: 13, fontFamily: 'Poppins-Bold' },
  custInfo: { flex: 1, gap: 4 },
  custName: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  custMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  custMeta: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray500, flex: 1 },
  custBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  segBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  segText: { fontSize: 10, fontFamily: 'Poppins-Medium' },
  revText: { fontSize: 12, fontFamily: 'Poppins-Bold' },
  custArrow: { alignItems: 'center', gap: 4, paddingLeft: 4 },
  prodCount: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray400 },
  empty: { alignItems: 'center', padding: 48 },
  emptyText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: COLORS.gray400 },
});
