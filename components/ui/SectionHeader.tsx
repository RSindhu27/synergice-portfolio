import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { COLORS } from '@/data/mockData';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
  seeAllLabel?: string;
  accent?: string;
}

export default function SectionHeader({ title, subtitle, onSeeAll, seeAllLabel = 'See All', accent = COLORS.primary }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={[styles.dot, { backgroundColor: accent }]} />
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {onSeeAll && (
        <TouchableOpacity style={styles.seeAll} onPress={onSeeAll} activeOpacity={0.7}>
          <Text style={[styles.seeAllText, { color: accent }]}>{seeAllLabel}</Text>
          <ChevronRight size={14} color={accent} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dot: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.dark,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: COLORS.gray500,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingLeft: 8,
  },
  seeAllText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
});
