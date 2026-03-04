import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, useWindowDimensions,
} from 'react-native';
import { Globe, MapPin, Package, DollarSign, ChevronRight, ChevronDown } from 'lucide-react-native';
import { COLORS, productPortfolio, revenueData, imsData } from '@/data/mockData';
import { LinearGradient } from 'expo-linear-gradient';
import DrawerModal from '@/components/ui/DrawerModal';
import StatusBadge from '@/components/ui/StatusBadge';
import SectionHeader from '@/components/ui/SectionHeader';
import FilterChip from '@/components/ui/FilterChip';

const REGIONS = ['All Regions', 'Europe', 'Africa', 'Asia Pacific', 'North America', 'Middle East', 'Latin America'];

const REGION_COLORS: Record<string, string> = {
  Europe: COLORS.primaryDark,
  Africa: COLORS.success,
  'Asia Pacific': COLORS.primary,
  'North America': COLORS.accent,
  'Middle East': COLORS.accentDark,
  'Latin America': COLORS.accentLight,
};

const REGION_ICONS: Record<string, string> = {
  Europe: '🇪🇺',
  Africa: '🌍',
  'Asia Pacific': '🌏',
  'North America': '🌎',
  'Middle East': '🌅',
  'Latin America': '🌎',
};

function formatCurrency(v: number) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

function CountryNode({ country, products, revenue, competitors, onPress, isTablet }: {
  country: string;
  products: typeof productPortfolio;
  revenue: number;
  competitors: string[];
  onPress: () => void;
  isTablet?: boolean;
}) {
  return (
    <TouchableOpacity style={[styles.countryNode, isTablet && { width: '48%' }]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.countryNodeTop}>
        <MapPin size={14} color={COLORS.primary} />
        <Text style={styles.countryName}>{country}</Text>
      </View>
      <View style={styles.countryStats}>
        <View style={styles.countryStat}>
          <Package size={10} color={COLORS.gray500} />
          <Text style={styles.countryStatText}>{products.length} products</Text>
        </View>
        <View style={styles.countryStat}>
          <DollarSign size={10} color={COLORS.success} />
          <Text style={[styles.countryStatText, { color: COLORS.success }]}>{formatCurrency(revenue)}</Text>
        </View>
      </View>
      {products.slice(0, 2).map(p => (
        <View key={p.productCode} style={styles.countryProductTag}>
          <Text style={styles.countryProductText} numberOfLines={1}>{p.product}</Text>
        </View>
      ))}
      {products.length > 2 && (
        <Text style={styles.moreProducts}>+{products.length - 2} more</Text>
      )}
      <ChevronRight size={12} color={COLORS.gray400} style={styles.countryArrow} />
    </TouchableOpacity>
  );
}

function RegionBlock({ region, expanded, onToggle, onCountryPress }: {
  region: string;
  expanded: boolean;
  onToggle: () => void;
  onCountryPress: (country: string) => void;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const isTablet = screenWidth >= 768;
  const color = REGION_COLORS[region] || COLORS.primary;
  const icon = REGION_ICONS[region] || '🌐';

  const products = productPortfolio.filter(p => p.region === region);
  const countries = [...new Set(products.map(p => p.country))];
  const totalRevenue = revenueData
    .filter(r => products.some(p => p.productCode === r.material || p.country === r.customerCountry))
    .reduce((s, r) => s + r.invoiceValFC, 0);

  const ims = imsData.filter(d => d.region === region);

  return (
    <View style={[styles.regionBlock, { borderColor: color + '40' }]}>
      <TouchableOpacity style={styles.regionHeader} onPress={onToggle} activeOpacity={0.8}>
        <View style={[styles.regionIconWrap, { backgroundColor: color + '18' }]}>
          <Text style={styles.regionIcon}>{icon}</Text>
        </View>
        <View style={styles.regionInfo}>
          <Text style={styles.regionTitle}>{region}</Text>
          <Text style={styles.regionSubtitle}>{countries.length} countries · {products.length} products</Text>
        </View>
        <View style={styles.regionRightMeta}>
          <Text style={[styles.regionRevenue, { color }]}>{formatCurrency(totalRevenue)}</Text>
          {expanded ? <ChevronDown size={16} color={COLORS.gray500} /> : <ChevronRight size={16} color={COLORS.gray500} />}
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.regionContent}>
          <View style={styles.regionKpiRow}>
            {[
              { label: 'Countries', value: countries.length.toString(), color },
              { label: 'Products', value: products.length.toString(), color: COLORS.success },
              { label: 'Market Signals', value: ims.length.toString(), color: COLORS.info },
            ].map(kpi => (
              <View key={kpi.label} style={styles.regionKpi}>
                <Text style={[styles.regionKpiValue, { color: kpi.color }]}>{kpi.value}</Text>
                <Text style={styles.regionKpiLabel}>{kpi.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.overlayToggles}>
            <Text style={styles.overlayLabel}>Overlays:</Text>
            {['Revenue', 'Competitors', 'Pipeline'].map(o => (
              <View key={o} style={styles.overlayTag}>
                <Text style={styles.overlayTagText}>{o}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.countriesGrid, isTablet && { flexDirection: 'row', flexWrap: 'wrap' }]}>
            {countries.map(country => {
              const countryProducts = products.filter(p => p.country === country);
              const countryRevenue = revenueData
                .filter(r => r.customerCountry === country)
                .reduce((s, r) => s + r.invoiceValFC, 0);
              const countryCompetitors = imsData
                .filter(d => d.country === country)
                .map(d => d.corporation);
              return (
                <CountryNode
                  key={country}
                  country={country}
                  products={countryProducts}
                  revenue={countryRevenue}
                  competitors={countryCompetitors}
                  onPress={() => onCountryPress(country)}
                  isTablet={isTablet}
                />
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

export default function GeoIntelligence() {
  const [selectedRegion, setSelectedRegion] = useState<string>('All Regions');
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const toggleRegion = (region: string) => {
    setExpandedRegions(prev => {
      const next = new Set(prev);
      if (next.has(region)) next.delete(region);
      else next.add(region);
      return next;
    });
  };

  const openCountryDrawer = (country: string) => {
    setSelectedCountry(country);
    setDrawerVisible(true);
  };

  const allRegions = REGIONS.filter(r => r !== 'All Regions');
  const displayRegions = selectedRegion === 'All Regions' ? allRegions : [selectedRegion];

  const countryProducts = selectedCountry ? productPortfolio.filter(p => p.country === selectedCountry) : [];
  const countryRevenue = selectedCountry ? revenueData.filter(r => r.customerCountry === selectedCountry) : [];
  const countryIms = selectedCountry ? imsData.filter(d => d.country === selectedCountry) : [];

  const globalStats = {
    countries: [...new Set(productPortfolio.map(p => p.country))].length,
    products: productPortfolio.length,
    revenue: revenueData.reduce((s, r) => s + r.invoiceValFC, 0),
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
          <LinearGradient colors={[COLORS.primaryDark, COLORS.primary, '#4a8f55']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
            <View style={styles.headerInner}>
              <View>
                <Text style={styles.headerTitle}>Geo Intelligence</Text>
                <Text style={styles.headerSub}>Global footprint across {globalStats.countries} countries</Text>
              </View>
              <View style={styles.headerStats}>
                <View style={styles.headerStat}>
                  <Globe size={14} color={COLORS.white} />
                  <Text style={styles.headerStatText}>{globalStats.countries}</Text>
                </View>
              </View>
            </View>
            <View style={styles.headerGoldLine} />
          </LinearGradient>

          <View style={styles.globalSummary}>
            {[
              { label: 'Countries', value: globalStats.countries.toString(), color: COLORS.primary },
              { label: 'Products', value: globalStats.products.toString(), color: COLORS.success },
              { label: 'Total Revenue', value: formatCurrency(globalStats.revenue), color: COLORS.info },
              { label: 'Regions', value: '6', color: COLORS.warning },
            ].map(s => (
              <View key={s.label} style={styles.globalStat}>
                <Text style={[styles.globalStatValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.globalStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionFilter} contentContainerStyle={styles.regionFilterContent}>
            {REGIONS.map(r => (
              <FilterChip
                key={r}
                label={r === 'All Regions' ? 'All' : r}
                active={selectedRegion === r}
                onPress={() => setSelectedRegion(r)}
                color={r === 'All Regions' ? COLORS.dark : REGION_COLORS[r] || COLORS.primary}
              />
            ))}
          </ScrollView>
          {displayRegions.map(region => (
            <RegionBlock
              key={region}
              region={region}
              expanded={expandedRegions.has(region)}
              onToggle={() => toggleRegion(region)}
              onCountryPress={openCountryDrawer}
            />
          ))}
          <View style={{ height: 24 }} />
        </ScrollView>
      </View>

      <DrawerModal
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        title={`${selectedCountry} — Country Intelligence`}
      >
        {selectedCountry && (
          <View>
            <View style={styles.countryHero}>
              <MapPin size={20} color={COLORS.primary} />
              <Text style={styles.countryHeroTitle}>{selectedCountry}</Text>
            </View>

            <View style={styles.countryStatsRow}>
              {[
                { label: 'Products', value: countryProducts.length.toString(), color: COLORS.primary },
                { label: 'Revenue', value: formatCurrency(countryRevenue.reduce((s, r) => s + r.invoiceValFC, 0)), color: COLORS.success },
                { label: 'Market Signals', value: countryIms.length.toString(), color: COLORS.info },
              ].map(s => (
                <View key={s.label} style={styles.countryStatBlock}>
                  <Text style={[styles.countryStatBlockValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.countryStatBlockLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {countryProducts.length > 0 && (
              <>
                <Text style={styles.drawerSectionTitle}>Products in {selectedCountry}</Text>
                {countryProducts.map(p => (
                  <View key={p.productCode} style={styles.drawerListItem}>
                    <View style={styles.drawerListLeft}>
                      <Text style={styles.drawerListTitle}>{p.product} {p.strength}</Text>
                      <Text style={styles.drawerListSub}>{p.molecules} · {p.dosage} · {p.therapeutic}</Text>
                    </View>
                    <StatusBadge label={p.partnerStatus} type={p.partnerStatus === 'In-House' ? 'success' : 'primary'} size="sm" />
                  </View>
                ))}
              </>
            )}

            {countryRevenue.length > 0 && (
              <>
                <Text style={styles.drawerSectionTitle}>Revenue Transactions</Text>
                {countryRevenue.map((r, i) => (
                  <View key={i} style={styles.drawerListItem}>
                    <View style={styles.drawerListLeft}>
                      <Text style={styles.drawerListTitle}>{r.materialDesc}</Text>
                      <Text style={styles.drawerListSub}>{r.customerName} · {r.quarter}</Text>
                    </View>
                    <Text style={[styles.drawerListValue, { color: COLORS.success }]}>{formatCurrency(r.invoiceValFC)}</Text>
                  </View>
                ))}
              </>
            )}

            {countryIms.length > 0 && (
              <>
                <Text style={styles.drawerSectionTitle}>Market Intelligence (IMS)</Text>
                {countryIms.map((d, i) => (
                  <View key={i} style={styles.imsItem}>
                    <View style={styles.imsItemTop}>
                      <Text style={styles.imsCorpName}>{d.corporation}</Text>
                      {d.specialtyProduct && <StatusBadge label="Specialty" type="info" size="sm" />}
                    </View>
                    <Text style={styles.imsProductName}>{d.intlProduct} · {d.moleculeList}</Text>
                    <View style={styles.imsMatRow}>
                      {[
                        { label: '2022', value: d.matQ2_2022_USD },
                        { label: '2023', value: d.matQ2_2023_USD },
                        { label: '2024', value: d.matQ2_2024_USD },
                      ].map(m => (
                        <View key={m.label} style={styles.imsMat}>
                          <Text style={styles.imsMatLabel}>{m.label}</Text>
                          <Text style={styles.imsMatValue}>{formatCurrency(m.value)}</Text>
                        </View>
                      ))}
                    </View>
                    <Text style={styles.imsInsight}>{d.innovationInsights}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        )}
      </DrawerModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingTop: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 6 },
  headerInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  headerGoldLine: { height: 2, backgroundColor: COLORS.gold, opacity: 0.5, marginTop: 16 },
  headerTitle: { fontSize: 20, fontFamily: 'Poppins-Bold', color: COLORS.white },
  headerSub: { fontSize: 12, fontFamily: 'Poppins-Regular', color: COLORS.goldLight, marginTop: 2, opacity: 0.85 },
  headerStats: { flexDirection: 'row', gap: 8 },
  headerStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerStatText: { fontSize: 14, fontFamily: 'Poppins-Bold', color: COLORS.white },
  globalSummary: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 6,
  },
  globalStat: { flex: 1, alignItems: 'center', gap: 4 },
  globalStatValue: { fontSize: 15, fontFamily: 'Poppins-Bold' },
  globalStatLabel: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500, textAlign: 'center' },
  regionFilter: {
    backgroundColor: COLORS.cream,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    maxHeight: 50,
  },
  regionFilterContent: { paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center', gap: 6 },
  content: { flex: 1, backgroundColor: COLORS.bg },
  contentContainer: { paddingBottom: 24 },
  regionBlock: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  regionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  regionIconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  regionIcon: { fontSize: 20 },
  regionInfo: { flex: 1 },
  regionTitle: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  regionSubtitle: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  regionRightMeta: { alignItems: 'flex-end', gap: 4 },
  regionRevenue: { fontSize: 13, fontFamily: 'Poppins-Bold' },
  regionContent: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  regionKpiRow: { flexDirection: 'row', gap: 8, paddingVertical: 12 },
  regionKpi: {
    flex: 1,
    backgroundColor: COLORS.cream,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  regionKpiValue: { fontSize: 18, fontFamily: 'Poppins-Bold' },
  regionKpiLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  overlayToggles: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, flexWrap: 'wrap' },
  overlayLabel: { fontSize: 11, fontFamily: 'Poppins-Medium', color: COLORS.gray500 },
  overlayTag: { backgroundColor: COLORS.gray100, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: COLORS.border },
  overlayTagText: { fontSize: 10, fontFamily: 'Poppins-Medium', color: COLORS.gray600 },
  countriesGrid: { gap: 8 },
  countryNode: {
    backgroundColor: COLORS.cream,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  countryNodeTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  countryName: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark, flex: 1 },
  countryStats: { flexDirection: 'row', gap: 12, marginBottom: 6 },
  countryStat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  countryStatText: { fontSize: 10, fontFamily: 'Poppins-Medium', color: COLORS.gray600 },
  countryProductTag: { backgroundColor: COLORS.primary + '12', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 2, alignSelf: 'flex-start' },
  countryProductText: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.primary },
  moreProducts: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray400, marginTop: 2 },
  countryArrow: { position: 'absolute', right: 10, top: '50%' },
  countryHero: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, padding: 16, backgroundColor: COLORS.cream, borderRadius: 12 },
  countryHeroTitle: { fontSize: 20, fontFamily: 'Poppins-Bold', color: COLORS.dark },
  countryStatsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  countryStatBlock: { flex: 1, backgroundColor: COLORS.cream, borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  countryStatBlockValue: { fontSize: 16, fontFamily: 'Poppins-Bold' },
  countryStatBlockLabel: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  drawerSectionTitle: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark, marginTop: 16, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 6 },
  drawerListItem: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: COLORS.gray100, gap: 8 },
  drawerListLeft: { flex: 1 },
  drawerListTitle: { fontSize: 13, fontFamily: 'Poppins-Medium', color: COLORS.dark, marginBottom: 2 },
  drawerListSub: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  drawerListValue: { fontSize: 13, fontFamily: 'Poppins-SemiBold' },
  imsItem: { backgroundColor: COLORS.cream, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  imsItemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  imsCorpName: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  imsProductName: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray600, marginBottom: 8 },
  imsMatRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  imsMat: { flex: 1, backgroundColor: COLORS.white, borderRadius: 6, padding: 6, alignItems: 'center' },
  imsMatLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  imsMatValue: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  imsInsight: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.info, fontStyle: 'italic' },
});
