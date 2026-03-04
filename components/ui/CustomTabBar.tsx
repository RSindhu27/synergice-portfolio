import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Platform, useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/data/mockData';

const TAB_PADDING = 8;

interface TabItem {
  key: string;
  title: string;
  icon: (color: string, focused: boolean) => React.ReactNode;
}

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
  tabs: TabItem[];
}

function AnimatedTabItem({
  item,
  focused,
  onPress,
  tabHeight,
  isTablet,
}: {
  item: TabItem;
  focused: boolean;
  onPress: () => void;
  tabHeight: number;
  isTablet: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(focused ? 1.06 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(focused ? 1 : 0.55)).current;
  const indicatorAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.06 : 1,
        useNativeDriver: true,
        tension: 80,
        friction: 9,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0.55,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(indicatorAnim, {
        toValue: focused ? 1 : 0,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start();
  }, [focused]);

  const iconColor = focused ? COLORS.goldLight : COLORS.gray300;
  const labelColor = focused ? COLORS.goldLight : COLORS.gray400;

  const iconSize = isTablet ? 28 : 24;
  const iconRadius = isTablet ? 8 : 6;
  const labelSize = isTablet ? 10 : 9;

  return (
    <TouchableOpacity
      style={[styles.tabItem, { height: tabHeight }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Animated.View
        style={[
          styles.tabInner,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={[styles.iconBg, { width: iconSize, height: iconSize, borderRadius: iconRadius }, focused && styles.iconBgActive]}>
          {item.icon(iconColor, focused)}
        </View>
        <Text
          style={[
            styles.tabLabel,
            {
              fontSize: labelSize,
              color: labelColor,
              fontFamily: focused ? 'Poppins-SemiBold' : 'Poppins-Regular',
            },
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.indicator,
          {
            opacity: indicatorAnim,
            width: indicatorAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '55%'],
            }),
          },
        ]}
      />
    </TouchableOpacity>
  );
}

export default function CustomTabBar({ state, descriptors, navigation, tabs }: CustomTabBarProps) {
  const { width: SW } = useWindowDimensions();
  const isTablet = SW >= 768;
  const TAB_MIN_WIDTH = isTablet ? 90 : 72;
  const TAB_HEIGHT = isTablet ? 52 : 46;
  const scrollRef = useRef<ScrollView>(null);
  const totalMinWidth = tabs.length * TAB_MIN_WIDTH + TAB_PADDING * 2;
  const fitsScreen = totalMinWidth <= SW;
  const tabWidth = fitsScreen
    ? (SW - TAB_PADDING * 2) / tabs.length
    : Math.max(TAB_MIN_WIDTH, (SW - TAB_PADDING * 2) / Math.min(tabs.length, isTablet ? 7 : 5));

  useEffect(() => {
    if (!fitsScreen) {
      const activeIndex = state.index;
      const scrollToX = activeIndex * tabWidth - SW / 2 + tabWidth / 2;
      scrollRef.current?.scrollTo({ x: Math.max(0, scrollToX), animated: true });
    }
  }, [state.index, tabWidth, fitsScreen]);

  return (
    <LinearGradient
      colors={[COLORS.primaryDark, COLORS.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <View style={styles.topBorder} />
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={!fitsScreen}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: TAB_PADDING },
          fitsScreen && { flex: 1, justifyContent: 'center' },
        ]}
        decelerationRate="fast"
        snapToInterval={fitsScreen ? undefined : tabWidth}
        snapToAlignment="start"
      >
        {tabs.map((tab, index) => {
          const isFocused = state.index === index;
          const route = state.routes[index];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route?.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route?.name ?? tab.key);
            }
          };

          return (
            <View
              key={tab.key}
              style={[styles.tabWrapper, { height: TAB_HEIGHT }, fitsScreen ? { flex: 1 } : { width: tabWidth }]}
            >
              <AnimatedTabItem item={tab} focused={isFocused} onPress={onPress} tabHeight={TAB_HEIGHT} isTablet={isTablet} />
            </View>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Platform.OS === 'ios' ? 12 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 18,
  },
  topBorder: {
    height: 1,
    backgroundColor: COLORS.goldDark + '55',
    marginHorizontal: 0,
  },
  scrollContent: {
    alignItems: 'center',
  },
  tabWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    minWidth: 56,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconBg: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBgActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: COLORS.goldLight + '44',
  },
  tabLabel: {
    letterSpacing: 0.1,
  },
  indicator: {
    height: 2,
    backgroundColor: COLORS.goldLight,
    borderRadius: 2,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 2,
  },
});
