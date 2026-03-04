import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import Svg, { Circle, Path, G, Text as SvgText } from 'react-native-svg';
import { Search, X, TrendingDown, Shield, AlertCircle } from 'lucide-react-native';
import { COLORS, COMPANY_COLORS, CUSTOMERS_BY_COMPANY, CUSTOMER_PRODUCTS } from '@/data/mockData';

const { width: SW } = Dimensions.get('window');
const COMPANIES = ['All', 'Strides', 'Instapill', 'One Source', 'Naari', 'Solara'];

type CustomerProduct = typeof CUSTOMER_PRODUCTS[string][0];

function DonutChart({ segments, size = 80 }: { segments: { value: number; color: string; label: string }[]; size?: number }) {
  const r = size / 2 - 6, cx = size / 2, cy = size / 2;
  const total = segments.reduce((s, g) => s + g.value, 0);
  let cum = -Math.PI / 2;
  const arcs = segments.map(seg => {
    const a = (seg.value / total) * Math.PI * 2;
    const x1 = cx + r * Math.cos(cum), y1 = cy + r * Math.sin(cum);
    const x2 = cx + r * Math.cos(cum + a), y2 = cy + r * Math.sin(cum + a);
    const ir = r - 14;
    const xi1 = cx + ir * Math.cos(cum), yi1 = cy + ir * Math.sin(cum);
    const xi2 = cx + ir * Math.cos(cum + a), yi2 = cy + ir * Math.sin(cum + a);
    const lg = a > Math.PI ? 1 : 0;
    const d = `M${x1} ${y1} A${r} ${r} 0 ${lg} 1 ${x2} ${y2} L${xi2} ${yi2} A${ir} ${ir} 0 ${lg} 0 ${xi1} ${yi1}Z`;
    cum += a;
    return { d, color: seg.color, value: seg.value };
  });
  return (
    <Svg width={size} height={size}>
      {arcs.map((a, i) => <Path key={i} d={a.d} fill={a.color} />)}
      <SvgText x={cx} y={cy + 4} textAnchor="middle" fontSize={10} fontWeight="700" fill={COLORS.dark}>
        {total}%
      </SvgText>
    </Svg>
  );
}

function HorizontalBar({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <View style={hbStyles.row}>
      <Text style={hbStyles.label} numberOfLines={1}>{label}</Text>
      <View style={hbStyles.track}>
        <View style={[hbStyles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={[hbStyles.val, { color }]}>{value}%</Text>
    </View>
  );
}

const hbStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 },
  label: { width: 80, fontSize: 10, fontFamily: 'Poppins-Medium', color: COLORS.dark },
  track: { flex: 1, height: 8, backgroundColor: COLORS.gray100, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  val: { width: 36, fontSize: 10, fontFamily: 'Poppins-Bold', textAlign: 'right' },
});

const COMPETITOR_COLORS = [COLORS.error, COLORS.warning, COLORS.info, '#8a5fa8', '#4a7c59'];

function CustomerProductDetail({ code, products }: { code: string; products: CustomerProduct[] }) {
  const [activeProduct, setActiveProduct] = useState(0);
  const prod = products[activeProduct];
  if (!prod) return null;

  const stridesShare = 100 - prod.competitors.reduce((s, c) => s + c.share, 0);
  const donutData = [
    { value: stridesShare > 0 ? stridesShare : 5, color: COLORS.primary, label: 'Strides Group' },
    ...prod.competitors.slice(0, 4).map((c, i) => ({ value: c.share, color: COMPETITOR_COLORS[i], label: c.name })),
  ];

  return (
    <View style={styles.productDetail}>
      {products.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          <View style={styles.prodTabs}>
            {products.map((p, i) => (
              <TouchableOpacity
                key={i} activeOpacity={0.8}
                style={[styles.prodTab, activeProduct === i && styles.prodTabActive]}
                onPress={() => setActiveProduct(i)}
              >
                <Text style={[styles.prodTabText, activeProduct === i && styles.prodTabTextActive]} numberOfLines={1}>{p.product}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      <View style={styles.prodHero}>
        <View style={styles.prodHeroInfo}>
          <Text style={styles.prodName}>{prod.product}</Text>
          <Text style={styles.prodMeta}>{prod.category} · {prod.strength} · {prod.supplyType}</Text>
          <Text style={styles.prodVolume}>{prod.annualVolume.toLocaleString()} units/yr</Text>
        </View>
        <View style={styles.prodRevBadge}>
          <Text style={styles.prodRevLabel}>Annual Revenue</Text>
          <Text style={styles.prodRevVal}>${(prod.revenue / 1000).toFixed(0)}K</Text>
        </View>
      </View>

      <View style={styles.twoCol}>
        <View style={[styles.analysisCard, { flex: 1 }]}>
          <Text style={styles.analysisTitle}>Market Share</Text>
          <View style={styles.donutRow}>
            <DonutChart segments={donutData} size={80} />
            <View style={styles.legend}>
              {donutData.map((d, i) => (
                <View key={i} style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: d.color }]} />
                  <Text style={styles.legendLabel} numberOfLines={1}>{d.label}</Text>
                  <Text style={[styles.legendVal, { color: d.color }]}>{d.value}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.analysisCard}>
        <View style={styles.analysisTitleRow}>
          <TrendingDown size={13} color={COLORS.error} />
          <Text style={styles.analysisTitle}>Top 5 Competitors</Text>
        </View>
        {prod.competitors.map((c, i) => (
          <HorizontalBar key={i} label={c.name} value={c.share} maxValue={Math.max(...prod.competitors.map(x => x.share))} color={COMPETITOR_COLORS[i % COMPETITOR_COLORS.length]} />
        ))}
      </View>

      <View style={styles.analysisCard}>
        <View style={styles.analysisTitleRow}>
          <Shield size={13} color={COLORS.info} />
          <Text style={styles.analysisTitle}>Other Vendors Supplying This Customer</Text>
        </View>
        {prod.otherVendors.map((v, i) => (
          <View key={i} style={styles.vendorRow}>
            <View style={[styles.vendorInitial, { backgroundColor: COMPETITOR_COLORS[i % COMPETITOR_COLORS.length] + '18' }]}>
              <Text style={[styles.vendorInitialText, { color: COMPETITOR_COLORS[i % COMPETITOR_COLORS.length] }]}>
                {v.vendor.substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.vendorInfo}>
              <Text style={styles.vendorName}>{v.vendor}</Text>
              <Text style={styles.vendorProduct}>{v.product}</Text>
            </View>
            <View style={[styles.catBadge, { backgroundColor: COLORS.gray100 }]}>
              <Text style={styles.catText}>{v.category}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.analysisCard}>
        <View style={styles.analysisTitleRow}>
          <AlertCircle size={13} color={COLORS.success} />
          <Text style={styles.analysisTitle}>What Strides Group Supplies to This Customer</Text>
        </View>
        {prod.stridesSupply.map((s, i) => {
          const cc = COMPANY_COLORS[s.company] || COLORS.primary;
          return (
            <View key={i} style={[styles.stridesRow, { borderLeftColor: cc }]}>
              <View style={[styles.compBadge, { backgroundColor: cc + '18' }]}>
                <Text style={[styles.compBadgeText, { color: cc }]}>{s.company}</Text>
              </View>
              <View style={styles.stridesInfo}>
                <Text style={styles.stridesProduct}>{s.product}</Text>
                <Text style={styles.stridesCategory}>{s.category}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function CustomerCompetitorAnalysis() {
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState<{ code: string; name: string } | null>(null);

  const allCustomers = useMemo(() => {
    const result: { code: string; name: string; company: string; country: string; region: string; segment: string; revenue: number }[] = [];
    Object.entries(CUSTOMERS_BY_COMPANY).forEach(([company, customers]) => {
      customers.forEach(c => {
        result.push({ code: c.customerCode, name: c.customerName, company, country: c.country, region: c.region, segment: c.segment, revenue: c.totalRevenue });
      });
    });
    return result;
  }, []);

  const filtered = useMemo(() => {
    let items = allCustomers;
    if (selectedCompany !== 'All') items = items.filter(c => c.company === selectedCompany);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(c => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.region.toLowerCase().includes(q));
    }
    return items;
  }, [allCustomers, selectedCompany, search]);

  const selectedProducts = selectedCustomer ? (CUSTOMER_PRODUCTS[selectedCustomer.code] || []) : [];

  return (
    <View style={styles.root}>
      {!selectedCustomer ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.searchBox}>
            <Search size={14} color={COLORS.gray500} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search customers, countries..."
              placeholderTextColor={COLORS.gray400}
              value={search} onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <X size={13} color={COLORS.gray400} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
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

          {Object.entries(CUSTOMERS_BY_COMPANY)
            .filter(([company]) => selectedCompany === 'All' || company === selectedCompany)
            .map(([company, customers]) => {
              const cc = COMPANY_COLORS[company] || COLORS.primary;
              const filteredCustomers = customers.filter(c =>
                (search.trim() === '' || c.customerName.toLowerCase().includes(search.toLowerCase()) || c.country.toLowerCase().includes(search.toLowerCase()))
              );
              if (filteredCustomers.length === 0) return null;
              return (
                <View key={company} style={styles.companyGroup}>
                  <View style={[styles.companyGroupHeader, { backgroundColor: cc + '10', borderColor: cc + '30' }]}>
                    <View style={[styles.companyDot, { backgroundColor: cc }]} />
                    <Text style={[styles.companyGroupTitle, { color: cc }]}>{company}</Text>
                    <View style={[styles.countBadge, { backgroundColor: cc + '20' }]}>
                      <Text style={[styles.countText, { color: cc }]}>{filteredCustomers.length} customers</Text>
                    </View>
                  </View>
                  <View style={styles.customerGrid}>
                    {filteredCustomers.map((c) => {
                      const hasProducts = !!CUSTOMER_PRODUCTS[c.customerCode];
                      return (
                        <TouchableOpacity
                          key={c.customerCode} activeOpacity={0.85}
                          style={[styles.customerCard, { borderTopColor: cc }, !hasProducts && styles.customerCardDim]}
                          onPress={() => hasProducts ? setSelectedCustomer({ code: c.customerCode, name: c.customerName }) : null}
                        >
                          <View style={styles.custCardTop}>
                            <View style={[styles.custInitial, { backgroundColor: cc + '18' }]}>
                              <Text style={[styles.custInitialText, { color: cc }]}>{c.customerName.substring(0, 2).toUpperCase()}</Text>
                            </View>
                            <View style={styles.custInfo}>
                              <Text style={styles.custName} numberOfLines={1}>{c.customerName}</Text>
                              <Text style={styles.custCountry}>{c.country} · {c.region}</Text>
                            </View>
                          </View>
                          <View style={styles.custMeta}>
                            <View style={[styles.segBadge, { backgroundColor: COLORS.gray100 }]}>
                              <Text style={styles.segText}>{c.segment}</Text>
                            </View>
                            <Text style={[styles.revText, { color: cc }]}>${(c.totalRevenue / 1000).toFixed(0)}K</Text>
                          </View>
                          {hasProducts && (
                            <View style={[styles.analyzeBtn, { borderColor: cc + '50', backgroundColor: cc + '08' }]}>
                              <Text style={[styles.analyzeBtnText, { color: cc }]}>View Analysis</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedCustomer(null)} activeOpacity={0.8}>
            <Text style={styles.backText}>← Back to Customers</Text>
          </TouchableOpacity>
          <View style={styles.custHeader}>
            <Text style={styles.custHeaderName}>{selectedCustomer.name}</Text>
            <Text style={styles.custHeaderSub}>Competitor & Supply Analysis</Text>
          </View>
          {selectedProducts.length > 0 ? (
            <CustomerProductDetail code={selectedCustomer.code} products={selectedProducts} />
          ) : (
            <View style={styles.noData}>
              <Text style={styles.noDataText}>No detailed analysis available for this customer yet.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 14, paddingBottom: 32, gap: 12 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, gap: 8, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, fontSize: 13, fontFamily: 'Poppins-Regular', color: COLORS.dark, padding: 0 },
  filterRow: { flexDirection: 'row', gap: 6, paddingVertical: 2 },
  chip: { borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: COLORS.white },
  chipText: { fontSize: 11, fontFamily: 'Poppins-Medium', color: COLORS.gray700 },
  chipActive: { color: COLORS.white },
  companyGroup: { gap: 8 },
  companyGroupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 10, borderWidth: 1 },
  companyDot: { width: 8, height: 8, borderRadius: 4 },
  companyGroupTitle: { fontSize: 14, fontFamily: 'Poppins-Bold', flex: 1 },
  countBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  countText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  customerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  customerCard: { width: SW > 600 ? '31%' : '47%', backgroundColor: COLORS.white, borderRadius: 10, padding: 10, borderTopWidth: 3, borderWidth: 1, borderColor: COLORS.border, gap: 7 },
  customerCardDim: { opacity: 0.7 },
  custCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  custInitial: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  custInitialText: { fontSize: 12, fontFamily: 'Poppins-Bold' },
  custInfo: { flex: 1 },
  custName: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  custCountry: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  custMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  segBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  segText: { fontSize: 9, fontFamily: 'Poppins-Medium', color: COLORS.gray600 },
  revText: { fontSize: 11, fontFamily: 'Poppins-Bold' },
  analyzeBtn: { borderRadius: 6, borderWidth: 1, padding: 5, alignItems: 'center' },
  analyzeBtnText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  backBtn: { padding: 8, alignSelf: 'flex-start' },
  backText: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.primary },
  custHeader: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  custHeaderName: { fontSize: 16, fontFamily: 'Poppins-Bold', color: COLORS.dark },
  custHeaderSub: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray500, marginTop: 2 },
  productDetail: { gap: 10 },
  prodTabs: { flexDirection: 'row', gap: 6 },
  prodTab: { borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: COLORS.white },
  prodTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  prodTabText: { fontSize: 11, fontFamily: 'Poppins-Medium', color: COLORS.gray700 },
  prodTabTextActive: { color: COLORS.white },
  prodHero: { backgroundColor: COLORS.white, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  prodHeroInfo: { flex: 1, gap: 3 },
  prodName: { fontSize: 14, fontFamily: 'Poppins-Bold', color: COLORS.dark },
  prodMeta: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  prodVolume: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: COLORS.info },
  prodRevBadge: { alignItems: 'flex-end' },
  prodRevLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  prodRevVal: { fontSize: 18, fontFamily: 'Poppins-Bold', color: COLORS.success },
  twoCol: { flexDirection: 'row', gap: 8 },
  analysisCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border, gap: 4 },
  analysisTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  analysisTitle: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legend: { flex: 1, gap: 5 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  legendLabel: { flex: 1, fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.dark },
  legendVal: { fontSize: 10, fontFamily: 'Poppins-Bold' },
  vendorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  vendorInitial: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  vendorInitialText: { fontSize: 10, fontFamily: 'Poppins-Bold' },
  vendorInfo: { flex: 1 },
  vendorName: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  vendorProduct: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  catBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  catText: { fontSize: 9, fontFamily: 'Poppins-Medium', color: COLORS.gray600 },
  stridesRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5, paddingLeft: 8, borderLeftWidth: 3, borderRadius: 4, marginBottom: 4, backgroundColor: COLORS.bg },
  compBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  compBadgeText: { fontSize: 9, fontFamily: 'Poppins-SemiBold' },
  stridesInfo: { flex: 1 },
  stridesProduct: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  stridesCategory: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  noData: { alignItems: 'center', padding: 40 },
  noDataText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: COLORS.gray400, textAlign: 'center' },
});
