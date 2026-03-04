import React from 'react';
import { Tabs } from 'expo-router';
import {
  LayoutDashboard, Layers, Globe, DollarSign,
  Activity, BarChart2, ShieldAlert,
} from 'lucide-react-native';
import { COLORS } from '@/data/mockData';
import CustomTabBar from '@/components/ui/CustomTabBar';

const ICON_SIZE = 16;

const TAB_DEFINITIONS = [
  {
    key: 'index',
    title: 'Overview',
    icon: (color: string) => <LayoutDashboard size={ICON_SIZE} color={color} />,
  },
  {
    key: 'portfolio',
    title: 'Portfolio',
    icon: (color: string) => <Layers size={ICON_SIZE} color={color} />,
  },
  {
    key: 'geo',
    title: 'Geo Intel',
    icon: (color: string) => <Globe size={ICON_SIZE} color={color} />,
  },
  {
    key: 'revenue',
    title: 'Revenue',
    icon: (color: string) => <DollarSign size={ICON_SIZE} color={color} />,
  },
  {
    key: 'pipeline',
    title: 'Pipeline',
    icon: (color: string) => <Activity size={ICON_SIZE} color={color} />,
  },
  {
    key: 'competitor',
    title: 'Competitor',
    icon: (color: string) => <BarChart2 size={ICON_SIZE} color={color} />,
  },
  {
    key: 'regulatory',
    title: 'Regulatory',
    icon: (color: string) => <ShieldAlert size={ICON_SIZE} color={color} />,
  },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <CustomTabBar {...props} tabs={TAB_DEFINITIONS} />
      )}
    >
      <Tabs.Screen name="index" options={{ title: 'Overview' }} />
      <Tabs.Screen name="portfolio" options={{ title: 'Portfolio' }} />
      <Tabs.Screen name="geo" options={{ title: 'Geo Intel' }} />
      <Tabs.Screen name="revenue" options={{ title: 'Revenue' }} />
      <Tabs.Screen name="pipeline" options={{ title: 'Pipeline' }} />
      <Tabs.Screen name="competitor" options={{ title: 'Competitor' }} />
      <Tabs.Screen name="regulatory" options={{ title: 'Regulatory' }} />
    </Tabs>
  );
}
