import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { COLORS } from '@/data/mockData';

interface KPICardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: number;
  onPress?: () => void;
  accent?: string;
  icon?: React.ReactNode;
  compact?: boolean;
}

export default function KPICard({ label, value, subValue, trend, onPress, accent = COLORS.primary, icon, compact }: KPICardProps) {
  const trendPositive = trend !== undefined && trend >= 0;

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <View style={styles.inner}>
        {icon && <View style={styles.iconWrap}>{icon}</View>}
        <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text>
        <Text style={[styles.value, compact && styles.valueCompact, { color: accent }]}>{value}</Text>
        {(subValue || trend !== undefined) && (
          <View style={styles.footer}>
            {subValue && <Text style={styles.subValue}>{subValue}</Text>}
            {trend !== undefined && (
              <View style={styles.trendRow}>
                {trendPositive
                  ? <TrendingUp size={12} color={COLORS.success} />
                  : <TrendingDown size={12} color={COLORS.error} />}
                <Text style={[styles.trendText, { color: trendPositive ? COLORS.success : COLORS.error }]}>
                  {trendPositive ? '+' : ''}{trend}%
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardCompact: {
    borderRadius: 10,
  },
  accentBar: {
    width: 4,
  },
  inner: {
    flex: 1,
    padding: 14,
  },
  iconWrap: {
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: COLORS.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  labelCompact: {
    fontSize: 10,
  },
  value: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  valueCompact: {
    fontSize: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 4,
  },
  subValue: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: COLORS.gray500,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
  },
});
