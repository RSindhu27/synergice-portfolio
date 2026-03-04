import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/data/mockData';

interface BarItem {
  label: string;
  value: number;
  color?: string;
}

interface MiniBarChartProps {
  data: BarItem[];
  maxValue?: number;
  height?: number;
  showValues?: boolean;
  formatValue?: (v: number) => string;
}

export default function MiniBarChart({ data, maxValue, height = 80, showValues = true, formatValue }: MiniBarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));

  return (
    <View style={styles.container}>
      <View style={styles.barsRow}>
        {data.map((item, i) => {
          const pct = max > 0 ? (item.value / max) * 100 : 0;
          return (
            <View key={i} style={styles.barCol}>
              <View style={[styles.barTrack, { height }]}>
                <View style={[styles.barFill, { height: `${pct}%`, backgroundColor: item.color || COLORS.primary }]} />
              </View>
              {showValues && (
                <Text style={styles.barValue} numberOfLines={1}>
                  {formatValue ? formatValue(item.value) : item.value.toLocaleString()}
                </Text>
              )}
              <Text style={styles.barLabel} numberOfLines={1}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 4 },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    overflow: 'visible',
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    width: '100%',
    backgroundColor: COLORS.gray100,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  barValue: {
    fontSize: 9,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.dark,
    marginTop: 3,
  },
  barLabel: {
    fontSize: 9,
    fontFamily: 'Poppins-Regular',
    color: COLORS.gray500,
    textAlign: 'center',
  },
});
