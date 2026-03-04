export const COLORS = {
  primary: '#3a7d44',
  primaryLight: '#9dc08b',
  primaryDark: '#265c2e',
  accent: '#df6d14',
  accentLight: '#e8a84a',
  accentDark: '#b55510',
  gold: '#c9a84c',
  goldLight: '#e8d08a',
  goldDark: '#a07828',
  successMid: '#9dc08b',
  cream: '#f8f5e9',
  bg: '#fafafa',
  white: '#ffffff',
  dark: '#1a2e1e',
  gray900: '#1e2a22',
  gray800: '#2b3d30',
  gray700: '#3d5243',
  gray600: '#4e6455',
  gray500: '#6b8270',
  gray400: '#9ab0a0',
  gray300: '#c2d4c5',
  gray200: '#daeade',
  gray100: '#f0f7f1',
  error: '#c0392b',
  warning: '#df6d14',
  info: '#4a90a4',
  border: '#e0e8d8',
  shadow: 'rgba(0,0,0,0.07)',
  cardBg: '#ffffff',
  overlayBg: 'rgba(26,46,30,0.72)',
  success: '#3a7d44',
};

export const COMPANY_COLORS: Record<string, string> = {
  Strides: '#3a7d44',
  Instapill: '#df6d14',
  'One Source': '#c9a84c',
  Naari: '#4a90a4',
  Solara: '#8a5fa8',
};

export const COMPANIES = ['Strides', 'Instapill', 'One Source', 'Naari', 'Solara'] as const;
export type CompanyName = typeof COMPANIES[number];
