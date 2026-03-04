import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/data/mockData';

interface StatusBadgeProps {
  label: string;
  type?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
  size?: 'sm' | 'md';
}

const TYPE_CONFIG = {
  success: { bg: '#e8f5eb', text: COLORS.success, border: '#c8e6cc' },
  warning: { bg: '#fff8e1', text: '#b8870a', border: '#ffe082' },
  error: { bg: '#fce8e8', text: COLORS.error, border: '#f5c6c6' },
  info: { bg: '#e3f0fd', text: '#2577c9', border: '#bbd8f8' },
  neutral: { bg: COLORS.gray100, text: COLORS.gray600, border: COLORS.gray300 },
  primary: { bg: '#fdf0e6', text: COLORS.primary, border: '#f5d0a9' },
};

export default function StatusBadge({ label, type = 'neutral', size = 'md' }: StatusBadgeProps) {
  const config = TYPE_CONFIG[type];
  return (
    <View style={[styles.badge, size === 'sm' && styles.badgeSm, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Text style={[styles.text, size === 'sm' && styles.textSm, { color: config.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  text: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
  },
  textSm: {
    fontSize: 10,
  },
});
