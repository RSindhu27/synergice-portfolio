import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Radio, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react-native';
import { COLORS, newsData } from '@/data/mockData';
import FilterChip from './FilterChip';

const CAT_ICONS: Record<string, React.ReactNode> = {
  regulatory: <AlertCircle size={12} color="#2577c9" />,
  pharma: <TrendingUp size={12} color={COLORS.success} />,
  competitor: <Radio size={12} color={COLORS.primary} />,
};

const CAT_COLORS: Record<string, string> = {
  regulatory: '#2577c9',
  pharma: COLORS.success,
  competitor: COLORS.primary,
};

export default function NewsTicker() {
  const [filter, setFilter] = useState<string>('all');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === 'all' ? newsData : newsData.filter(n => n.category === filter);
  const displayed = filtered.slice(0, 6);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.liveDot} />
          <Text style={styles.headerTitle}>Live Intelligence</Text>
        </View>
        <TouchableOpacity onPress={() => setTick(t => t + 1)} hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}>
          <RefreshCw size={14} color={COLORS.gray500} />
        </TouchableOpacity>
      </View>
      <View style={styles.chips}>
        {['all', 'regulatory', 'pharma', 'competitor'].map(cat => (
          <FilterChip key={cat} label={cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)} active={filter === cat} onPress={() => setFilter(cat)} color={cat === 'all' ? COLORS.dark : CAT_COLORS[cat]} />
        ))}
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
        {displayed.map(item => (
          <TouchableOpacity key={item.id} style={styles.newsItem} activeOpacity={0.7}>
            <View style={[styles.catDot, { backgroundColor: CAT_COLORS[item.category] || COLORS.gray300 }]} />
            <View style={styles.newsContent}>
              <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
              <View style={styles.newsMeta}>
                <Text style={styles.newsSource}>{item.source}</Text>
                <Text style={styles.newsTime}>{item.time}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.cream,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  headerTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.dark,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },
  list: { flex: 1 },
  newsItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    gap: 10,
  },
  catDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 5,
    flexShrink: 0,
  },
  newsContent: { flex: 1 },
  newsTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: COLORS.dark,
    lineHeight: 17,
    marginBottom: 3,
  },
  newsMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsSource: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: COLORS.gray500,
  },
  newsTime: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: COLORS.gray400,
  },
});
