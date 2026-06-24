import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, LogIn, Building2, Lock, User, ArrowRight } from 'lucide-react-native';
import { COLORS } from '@/data/theme';
import { setAuthenticated } from '@/hooks/useAuth';

function Orb({ size, style, color, delay }: { size: number; style: object; color: string; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 7000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 7000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const ty = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });
  const op = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.1, 0.2, 0.1] });
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style, { transform: [{ translateY: ty }], opacity: op }]}
    />
  );
}

function LoadingDots() {
  const a0 = useRef(new Animated.Value(0)).current;
  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const dot = (a: Animated.Value, d: number) =>
      Animated.loop(Animated.sequence([
        Animated.delay(d),
        Animated.timing(a, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 380, useNativeDriver: true }),
        Animated.delay(760),
      ]));
    dot(a0, 0).start();
    dot(a1, 190).start();
    dot(a2, 380).start();
  }, []);
  return (
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
      {[a0, a1, a2].map((a, i) => (
        <Animated.View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', opacity: a,
          transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }] }} />
      ))}
    </View>
  );
}

export default function LoginScreen() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cardY = useRef(new Animated.Value(40)).current;
  const cardOp = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOp = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardY, { toValue: 0, tension: 55, friction: 11, delay: 100, useNativeDriver: true }),
      Animated.timing(cardOp, { toValue: 1, duration: 600, delay: 100, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 10, delay: 250, useNativeDriver: true }),
      Animated.timing(logoOp, { toValue: 1, duration: 500, delay: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  const pressIn = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true, tension: 200, friction: 15 }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 15 }).start();

  const handleLogin = () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAuthenticated(true);
      router.replace('/(tabs)');
    }, 900);
  };

  const handleSSO = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAuthenticated(true);
      router.replace('/(tabs)');
    }, 900);
  };

  return (
    <View style={s.root}>
      <LinearGradient
        colors={['#0c1e0f', '#1a3d20', '#0e1f11', '#091408']}
        locations={[0, 0.38, 0.68, 1]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <Orb size={500} color={COLORS.primary} delay={0} style={{ top: -150, left: -120 }} />
      <Orb size={380} color={COLORS.primaryDark} delay={2200} style={{ bottom: -100, right: -80 }} />
      <Orb size={240} color={COLORS.accent} delay={1100} style={{ top: 60, right: 60 }} />
      <Orb size={200} color={COLORS.primaryLight} delay={3300} style={{ bottom: 100, left: 30 }} />

      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(pct => (
          <View key={`h${pct}`} style={[s.gridH, { top: `${pct}%` as any }]} />
        ))}
        {[9, 18, 27, 36, 45, 55, 64, 73, 82, 91].map(pct => (
          <View key={`v${pct}`} style={[s.gridV, { left: `${pct}%` as any }]} />
        ))}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[s.card, { transform: [{ translateY: cardY }], opacity: cardOp }]}>
            <View style={s.cardTopGlow} />

            <View style={s.cardHeader}>
              <Animated.View style={{ transform: [{ scale: logoScale }], opacity: logoOp, marginBottom: 16 }}>
                <View style={s.logoRing}>
                  <LinearGradient
                    colors={[COLORS.primaryLight, COLORS.primary, COLORS.primaryDark]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={s.logoGradient}
                  >
                    <Text style={s.logoLetter}>S</Text>
                  </LinearGradient>
                </View>
              </Animated.View>
              <Text style={s.brandName}>SYNERGICE</Text>
              <Text style={s.brandTag}>Pharma Intelligence Platform</Text>
              <View style={s.divider} />
              <Text style={s.welcomeTitle}>Welcome back</Text>
              <Text style={s.welcomeSub}>Sign in to access your dashboard</Text>
            </View>

            <View style={s.form}>
              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>Username</Text>
                <View style={[s.inputRow, !!error && !username.trim() && s.inputError]}>
                  <User size={14} color="rgba(255,255,255,0.3)" />
                  <TextInput
                    style={s.input}
                    value={username}
                    onChangeText={v => { setUsername(v); setError(''); }}
                    placeholder="Enter your username"
                    placeholderTextColor="rgba(255,255,255,0.22)"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>Password</Text>
                <View style={[s.inputRow, !!error && !password.trim() && s.inputError]}>
                  <Lock size={14} color="rgba(255,255,255,0.3)" />
                  <TextInput
                    style={[s.input, { flex: 1 }]}
                    value={password}
                    onChangeText={v => { setPassword(v); setError(''); }}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(255,255,255,0.22)"
                    secureTextEntry={!showPw}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity onPress={() => setShowPw(p => !p)} style={s.eyeBtn}>
                    {showPw ? <EyeOff size={14} color="rgba(255,255,255,0.35)" /> : <Eye size={14} color="rgba(255,255,255,0.35)" />}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={s.forgotRow} activeOpacity={0.7}>
                <Text style={s.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              {!!error && (
                <View style={s.errorBox}>
                  <View style={s.errorDot} />
                  <Text style={s.errorText}>{error}</Text>
                </View>
              )}

              <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                <TouchableOpacity activeOpacity={1} onPressIn={pressIn} onPressOut={pressOut} onPress={handleLogin} disabled={loading} style={s.loginWrap}>
                  <LinearGradient
                    colors={loading ? ['rgba(58,125,68,0.4)', 'rgba(38,92,46,0.4)'] : [COLORS.primary, COLORS.primaryDark]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={s.loginBtn}
                  >
                    {loading ? <LoadingDots /> : (
                      <>
                        <LogIn size={15} color="#fff" />
                        <Text style={s.loginText}>Sign In</Text>
                        <ArrowRight size={13} color="rgba(255,255,255,0.6)" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              <View style={s.orRow}>
                <View style={s.orLine} />
                <Text style={s.orText}>or continue with</Text>
                <View style={s.orLine} />
              </View>

              <TouchableOpacity style={s.ssoBtn} onPress={handleSSO} disabled={loading} activeOpacity={0.75}>
                <Building2 size={14} color="rgba(255,255,255,0.75)" />
                <Text style={s.ssoText}>Sign in with SSO</Text>
              </TouchableOpacity>
            </View>

            <View style={s.footer}>
              <Text style={s.footerText}>Secure enterprise access · v1.0</Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0c1e0f' },
  gridH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  gridV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  card: {
    width: '100%', maxWidth: 420,
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 40, shadowOffset: { width: 0, height: 20 },
  },
  cardTopGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(157,192,139,0.45)' },
  cardHeader: { alignItems: 'center', paddingTop: 34, paddingHorizontal: 28, paddingBottom: 22 },
  logoRing: { width: 62, height: 62, borderRadius: 17, padding: 2, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  logoGradient: { flex: 1, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  logoLetter: { fontSize: 25, fontFamily: 'Poppins-Bold', color: '#fff' },
  brandName: { fontSize: 17, fontFamily: 'Poppins-Bold', color: '#fff', letterSpacing: 4.5 },
  brandTag: { fontSize: 10, fontFamily: 'Poppins-Regular', color: 'rgba(255,255,255,0.38)', letterSpacing: 1.6, textTransform: 'uppercase', marginTop: 3 },
  divider: { width: 36, height: 1, backgroundColor: 'rgba(157,192,139,0.45)', marginTop: 16, marginBottom: 14 },
  welcomeTitle: { fontSize: 21, fontFamily: 'Poppins-Bold', color: '#fff', letterSpacing: -0.3 },
  welcomeSub: { fontSize: 12, fontFamily: 'Poppins-Regular', color: 'rgba(255,255,255,0.4)', marginTop: 4 },
  form: { paddingHorizontal: 26, paddingBottom: 6 },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.065)', borderRadius: 11,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
    paddingHorizontal: 13, paddingVertical: 12,
  },
  inputError: { borderColor: 'rgba(192,57,43,0.7)' },
  input: { flex: 1, fontSize: 13, fontFamily: 'Poppins-Regular', color: '#fff' },
  eyeBtn: { padding: 2 },
  forgotRow: { alignItems: 'flex-end', marginBottom: 18, marginTop: -4 },
  forgotText: { fontSize: 11, fontFamily: 'Poppins-Medium', color: COLORS.primaryLight },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(192,57,43,0.14)', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 9, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(192,57,43,0.28)',
  },
  errorDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.error },
  errorText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#f87171', flex: 1 },
  loginWrap: {
    borderRadius: 12, overflow: 'hidden',
    shadowColor: COLORS.primary, shadowOpacity: 0.55, shadowRadius: 14, shadowOffset: { width: 0, height: 5 },
    marginBottom: 18,
  },
  loginBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 20, minHeight: 48 },
  loginText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#fff', flex: 1, textAlign: 'center' },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  orLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.09)' },
  orText: { fontSize: 10, fontFamily: 'Poppins-Regular', color: 'rgba(255,255,255,0.28)' },
  ssoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 11,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)', marginBottom: 4,
  },
  ssoText: { fontSize: 13, fontFamily: 'Poppins-Medium', color: 'rgba(255,255,255,0.7)' },
  footer: { paddingVertical: 13, paddingHorizontal: 26, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', alignItems: 'center', marginTop: 8 },
  footerText: { fontSize: 10, fontFamily: 'Poppins-Regular', color: 'rgba(255,255,255,0.22)', letterSpacing: 0.4 },
});
