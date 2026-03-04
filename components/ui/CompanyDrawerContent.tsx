import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle, Path } from 'react-native-svg';
import {
  COLORS, companyMetrics, productPortfolio, revenueData,
  rdData, goLanzarData, monthlyRevenue, customerViewData,
} from '@/data/mockData';
import StatusBadge from './StatusBadge';

function formatCurrency(v: number) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

function MiniSparkLine({ data, color, height = 56 }: { data: number[]; color: string; height?: number }) {
  const [width, setWidth] = useState(0);
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 4;

  if (width === 0) {
    return <View style={{ height, width: '100%' }} onLayout={e => setWidth(e.nativeEvent.layout.width)} />;
  }

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = pad + ((max - v) / range) * (height - pad * 2);
    return `${x},${y}`;
  });
  const lastX = points[points.length - 1].split(',')[0];
  const lastY = points[points.length - 1].split(',')[1];
  return (
    <View style={{ width: '100%' }} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
      <Svg width={width} height={height}>
        <Polyline
          points={points.join(' ')}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={lastX} cy={lastY} r={3} fill={color} />
      </Svg>
    </View>
  );
}

function DonutChart({ segments, size = 72 }: { segments: { value: number; color: string }[]; size?: number }) {
  const r = size / 2 - 6;
  const cx = size / 2;
  const cy = size / 2;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let cumAngle = -Math.PI / 2;
  const arcs: { d: string; color: string }[] = [];
  segments.forEach(seg => {
    const angle = (seg.value / total) * Math.PI * 2;
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    const x2 = cx + r * Math.cos(cumAngle + angle);
    const y2 = cy + r * Math.sin(cumAngle + angle);
    const large = angle > Math.PI ? 1 : 0;
    const innerR = r - 18;
    const xi1 = cx + innerR * Math.cos(cumAngle);
    const yi1 = cy + innerR * Math.sin(cumAngle);
    const xi2 = cx + innerR * Math.cos(cumAngle + angle);
    const yi2 = cy + innerR * Math.sin(cumAngle + angle);
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${innerR} ${innerR} 0 ${large} 0 ${xi1} ${yi1} Z`;
    arcs.push({ d, color: seg.color });
    cumAngle += angle;
  });
  return (
    <Svg width={size} height={size}>
      {arcs.map((arc, i) => (
        <Path key={i} d={arc.d} fill={arc.color} />
      ))}
    </Svg>
  );
}

interface Props {
  name: string;
}

const COMPANY_FOCUS: Record<string, { primary: string; region: string; risk: string; riskLevel: string; insights: string[]; regions: { label: string; pct: number }[]; countries: string[] }> = {
  Strides: {
    primary: 'Cardiovascular & GI',
    region: 'Europe',
    risk: 'Regulatory shifts in European markets may impact timeline for Q4 launches.',
    riskLevel: 'Medium',
    insights: ['Generic portfolio expansion in EU', 'GI franchise strengthening in ME', 'Biosimilar pipeline diversification'],
    regions: [{ label: 'Europe', pct: 45 }, { label: 'Africa', pct: 20 }, { label: 'Asia Pacific', pct: 18 }, { label: 'Others', pct: 17 }],
    countries: ['Germany', 'France', 'Nigeria', 'Australia', 'UAE'],
  },
  Instapill: {
    primary: 'Diabetes & Metabolic',
    region: 'Asia Pacific',
    risk: 'Biosimilar price erosion in insulin segment may compress margins.',
    riskLevel: 'High',
    insights: ['Biosimilar insulin market leadership', 'SGLT2 inhibitor launch pipeline', 'Expansion into GLP-1 agonist space'],
    regions: [{ label: 'Asia Pacific', pct: 40 }, { label: 'North America', pct: 28 }, { label: 'ME', pct: 18 }, { label: 'Others', pct: 14 }],
    countries: ['India', 'Canada', 'Saudi Arabia', 'Spain', 'Kenya'],
  },
  'One Source': {
    primary: 'Antiretroviral',
    region: 'Africa',
    risk: 'Donor funding dependency creates revenue concentration risk.',
    riskLevel: 'Medium',
    insights: ['WHO PQ portfolio broadening', 'TLD FDC launch readiness', 'Sub-Saharan tender dominance'],
    regions: [{ label: 'Africa', pct: 62 }, { label: 'Asia Pacific', pct: 18 }, { label: 'Latin America', pct: 12 }, { label: 'Others', pct: 8 }],
    countries: ['South Africa', 'Ethiopia', 'Ghana', 'Philippines', 'Brazil'],
  },
  Naari: {
    primary: "Women's Health",
    region: 'Asia Pacific',
    risk: 'Regulatory approval delays in key markets may push revenue recognition.',
    riskLevel: 'Low',
    insights: ["Women's health specialist positioning", 'ME market penetration accelerating', 'FDC sachet innovation pipeline'],
    regions: [{ label: 'Asia Pacific', pct: 38 }, { label: 'Middle East', pct: 30 }, { label: 'Africa', pct: 20 }, { label: 'Europe', pct: 12 }],
    countries: ['India', 'Kuwait', 'Indonesia', 'Tanzania', 'Italy'],
  },
  Solara: {
    primary: 'CNS & Psychiatry',
    region: 'North America',
    risk: 'Generic competition intensifying in US CNS segment post-patent cliff.',
    riskLevel: 'Medium',
    insights: ['CNS extended-release portfolio', 'LATAM market entry strategy', 'Japan partnership for Donepezil'],
    regions: [{ label: 'North America', pct: 40 }, { label: 'Europe', pct: 28 }, { label: 'Asia Pacific', pct: 18 }, { label: 'Latin America', pct: 14 }],
    countries: ['USA', 'Netherlands', 'Japan', 'Mexico', 'Israel'],
  },
};

const THERAPEUTIC_COLORS = ['#3a7d44', '#4a90a4', '#df6d14', '#c9a84c', '#8a5fa8', '#c0392b'];

export default function CompanyDrawerContent({ name }: Props) {
  const m = companyMetrics[name as keyof typeof companyMetrics];
  const products = productPortfolio.filter(p => p.company === name);
  const pipeline = [...rdData, ...goLanzarData].filter(d => d.company === name);
  const companyRevenues = revenueData.filter(r => r.company === name);
  const customers = customerViewData.filter(c => c.company === name);
  const focus = COMPANY_FOCUS[name];

  const avgDifot = customers.length > 0
    ? (customers.reduce((s, c) => s + c.difotPercent, 0) / customers.length).toFixed(1)
    : 'N/A';

  const totalPipelineRev = pipeline.reduce((s, p) => s + p.totalRevenue, 0);

  const therapeuticCounts: Record<string, number> = {};
  products.forEach(p => {
    therapeuticCounts[p.therapeutic] = (therapeuticCounts[p.therapeutic] || 0) + 1;
  });
  const therapeuticSegments = Object.entries(therapeuticCounts).map(([label, count], i) => ({
    label,
    count,
    color: THERAPEUTIC_COLORS[i % THERAPEUTIC_COLORS.length],
  }));

  const companyMonthly = monthlyRevenue.slice(-6).map(m => {
    const key = name.toLowerCase().replace(' ', '') as keyof typeof m;
    return (m as any)[name === 'One Source' ? 'oneSource' : name === 'Instapill' ? 'instapill' : name === 'Strides' ? 'strides' : name === 'Naari' ? 'naari' : 'solara'] as number;
  });

  const riskColor = focus?.riskLevel === 'High' ? COLORS.error : focus?.riskLevel === 'Medium' ? COLORS.warning : COLORS.success;

  return (
    <View style={styles.root}>
      <View style={[styles.companyBanner, { backgroundColor: m.color + '12' }]}>
        <View style={[styles.companyLogoLg, { backgroundColor: m.color + '22' }]}>
          <Text style={[styles.companyLogoLgText, { color: m.color }]}>{name.substring(0, 2).toUpperCase()}</Text>
        </View>
        <View style={styles.companyBannerInfo}>
          <Text style={styles.companyBannerName}>{name}</Text>
          <Text style={styles.companyBannerSub}>Primary Region: {m.topRegion}</Text>
        </View>
      </View>

      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Annual Revenue</Text>
          <Text style={[styles.kpiValue, { color: m.color }]}>{formatCurrency(m.revenue)}</Text>
          <Text style={[styles.kpiSub, { color: COLORS.success }]}>+{m.growth}% vs LY</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Total Products</Text>
          <Text style={[styles.kpiValue, { color: COLORS.info }]}>{m.products}</Text>
          <Text style={styles.kpiSub}>Active Portfolio</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Pipeline Value</Text>
          <Text style={[styles.kpiValue, { color: COLORS.warning }]}>{formatCurrency(totalPipelineRev)}</Text>
          <Text style={styles.kpiSub}>{pipeline.length} Projects</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Avg DIFOT</Text>
          <Text style={[styles.kpiValue, { color: COLORS.success }]}>{avgDifot}%</Text>
          <Text style={styles.kpiSub}>On-time delivery</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: m.color }]}>Revenue Growth Trend</Text>
        </View>
        <View style={styles.sparkContainer}>
          <MiniSparkLine data={companyMonthly} color={m.color} height={60} />
          <View style={styles.sparkLabels}>
            {['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'].slice(0, companyMonthly.length).map((q, i) => (
              <Text key={i} style={styles.sparkLabel}>{q} 2025</Text>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.warning }]}>Therapeutic Areas</Text>
        <View style={styles.donutRow}>
          <DonutChart
            size={76}
            segments={therapeuticSegments.map(t => ({ value: t.count, color: t.color }))}
          />
          <View style={styles.legendList}>
            {therapeuticSegments.map((t, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: t.color }]} />
                <Text style={styles.legendLabel} numberOfLines={1}>{t.label}</Text>
                <Text style={[styles.legendCount, { color: t.color }]}>{t.count} Prod{t.count !== 1 ? 's' : ''}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.info }]}>Geographic Footprint</Text>
        <View style={styles.geoContent}>
          <View style={styles.geoRegions}>
            <Text style={styles.geoSubtitle}>Market Share by Region</Text>
            {focus?.regions.map((r, i) => (
              <View key={i} style={styles.geoRow}>
                <Text style={styles.geoLabel}>{r.label}</Text>
                <View style={styles.geoBarWrap}>
                  <View style={[styles.geoBar, { width: `${r.pct}%`, backgroundColor: m.color }]} />
                </View>
                <Text style={styles.geoPct}>{r.pct}%</Text>
              </View>
            ))}
          </View>
          <View style={styles.geoCountries}>
            <Text style={styles.geoSubtitle}>Key Countries</Text>
            <View style={styles.countryChips}>
              {focus?.countries.map((c, i) => (
                <View key={i} style={[styles.countryChip, { borderColor: m.color + '40' }]}>
                  <Text style={[styles.countryChipText, { color: m.color }]}>{c}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.primary }]}>Product Portfolio</Text>
        <View style={styles.productGrid}>
          {products.map(p => (
            <View key={p.productCode} style={styles.productCard}>
              <View style={styles.productTop}>
                <Text style={styles.productName} numberOfLines={1}>{p.product} {p.strength}</Text>
                <StatusBadge label={p.partnerStatus} type={p.partnerStatus === 'In-House' ? 'success' : p.partnerStatus === 'Partner' ? 'primary' : 'info'} size="sm" />
              </View>
              <Text style={styles.productMeta}>{p.molecules} · {p.dosage}</Text>
              <Text style={styles.productCountry}>{p.country} · {p.therapeutic}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.accent }]}>Pipeline ({pipeline.length} projects)</Text>
        {pipeline.map((r, i) => (
          <View key={i} style={styles.pipelineRow}>
            <View style={styles.pipelineLeft}>
              <Text style={styles.pipelineTitle} numberOfLines={1}>{r.summary}</Text>
              <Text style={styles.pipelineMeta}>{r.currentStatus} · GM {r.gm}%</Text>
            </View>
            <View style={styles.pipelineRight}>
              <Text style={[styles.pipelineRev, { color: m.color }]}>{formatCurrency(r.totalRevenue)}</Text>
              <StatusBadge label={r.priority} type={r.priority === 'Critical' ? 'error' : r.priority === 'High' ? 'warning' : 'neutral'} size="sm" />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.gold }]}>Strategic Insights</Text>
        <Text style={styles.insightCat}>STRATEGIC FOCUS</Text>
        {focus?.insights.map((ins, i) => (
          <View key={i} style={styles.insightRow}>
            <View style={[styles.insightDot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.insightText}>{ins}</Text>
          </View>
        ))}
        <Text style={[styles.insightCat, { marginTop: 12 }]}>RISK ASSESSMENT</Text>
        <View style={[styles.riskBox, { borderColor: riskColor + '40', backgroundColor: riskColor + '08' }]}>
          <Text style={[styles.riskLevel, { color: riskColor }]}>{focus?.riskLevel} Risk</Text>
          <Text style={styles.riskText}>{focus?.risk}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 0 },
  companyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  companyLogoLg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyLogoLgText: { fontSize: 16, fontFamily: 'Poppins-Bold' },
  companyBannerInfo: { flex: 1 },
  companyBannerName: { fontSize: 18, fontFamily: 'Poppins-Bold', color: COLORS.dark },
  companyBannerSub: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.cream,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  kpiLabel: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 },
  kpiValue: { fontSize: 20, fontFamily: 'Poppins-Bold', marginBottom: 2 },
  kpiSub: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  section: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 6 },
  sectionTitle: { fontSize: 13, fontFamily: 'Poppins-SemiBold', marginBottom: 10 },
  sparkContainer: {},
  sparkLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 4 },
  sparkLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: COLORS.gray400, flex: 1, textAlign: 'center' },
  twoCol: {},
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  legendList: { flex: 1, gap: 5 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendLabel: { flex: 1, fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.dark },
  legendCount: { fontSize: 11, fontFamily: 'Poppins-SemiBold' },
  geoContent: { gap: 14 },
  geoRegions: {},
  geoCountries: {},
  geoSubtitle: { fontSize: 10, fontFamily: 'Poppins-Medium', color: COLORS.gray500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 },
  geoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 7, gap: 6 },
  geoLabel: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.dark, width: 72 },
  geoBarWrap: { flex: 1, height: 6, backgroundColor: COLORS.gray100, borderRadius: 3, overflow: 'hidden' },
  geoBar: { height: 6, borderRadius: 3 },
  geoPct: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: COLORS.dark, width: 30, textAlign: 'right' },
  countryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  countryChip: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  countryChipText: { fontSize: 10, fontFamily: 'Poppins-Medium' },
  productGrid: { gap: 8 },
  productCard: {
    backgroundColor: COLORS.cream,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3, gap: 8 },
  productName: { flex: 1, fontSize: 12, fontFamily: 'Poppins-SemiBold', color: COLORS.dark },
  productMeta: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  productCountry: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray400 },
  pipelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    gap: 8,
  },
  pipelineLeft: { flex: 1 },
  pipelineTitle: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: COLORS.dark, marginBottom: 2 },
  pipelineMeta: { fontSize: 10, fontFamily: 'Poppins-Regular', color: COLORS.gray500 },
  pipelineRight: { alignItems: 'flex-end', gap: 4 },
  pipelineRev: { fontSize: 12, fontFamily: 'Poppins-Bold' },
  insightCat: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: COLORS.gray500, letterSpacing: 0.8, marginBottom: 8 },
  insightRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  insightDot: { width: 6, height: 6, borderRadius: 3 },
  insightText: { flex: 1, fontSize: 12, fontFamily: 'Poppins-Regular', color: COLORS.dark },
  riskBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    gap: 4,
  },
  riskLevel: { fontSize: 12, fontFamily: 'Poppins-SemiBold' },
  riskText: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.gray600 },
});
