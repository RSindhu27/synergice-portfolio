import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  ScrollView, Animated, TouchableWithoutFeedback,
  useWindowDimensions,
} from 'react-native';
import { X, ShieldCheck, Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/data/theme';

// ─── Types ────────────────────────────────────────────────────────────
type PermKey  = 'view' | 'edit' | 'delete';
type PermScope = 'modules' | 'regions' | 'companies';
type Perm     = Record<PermKey, boolean>;
type UserPerms = Record<PermScope, Record<string, Perm>>;
type AllPerms  = Record<string, UserPerms>;

interface User {
  id: string; name: string; initials: string; role: string; color: string;
}

// ─── Static data ─────────────────────────────────────────────────────
const USERS: User[] = [
  { id: 'u1', name: 'Sarah Chen',   initials: 'SC', role: 'Regional Director',  color: COLORS.primary     },
  { id: 'u2', name: 'Marcus Webb',  initials: 'MW', role: 'Portfolio Manager',  color: COLORS.accent      },
  { id: 'u3', name: 'Priya Nair',   initials: 'PN', role: 'Reg. Analyst',       color: '#4a90a4'          },
  { id: 'u4', name: 'James Okafor', initials: 'JO', role: 'Revenue Lead',       color: COLORS.gold        },
  { id: 'u5', name: 'Elena Rossi',  initials: 'ER', role: 'Pipeline Analyst',   color: '#5f7fbf'          },
  { id: 'u6', name: 'Tom Bradley',  initials: 'TB', role: 'Data Steward',       color: COLORS.primaryDark },
];

const MODULES  = ['Overview', 'Portfolio', 'Geo Intel', 'Revenue', 'Pipeline', 'Competitor', 'Regulatory', 'Master Data'];
const REGIONS  = ['Region A', 'Region B', 'Region C', 'Region D', 'Region E'];
const CO_NAMES = ['Company A', 'Company B', 'Company C', 'Company D', 'Company E'];

const GROUPS: { scope: PermScope; label: string; items: string[]; color: string }[] = [
  { scope: 'modules',   label: 'Modules',   items: MODULES,  color: COLORS.primary },
  { scope: 'regions',   label: 'Regions',   items: REGIONS,  color: '#4a90a4'      },
  { scope: 'companies', label: 'Companies', items: CO_NAMES, color: COLORS.accent  },
];

const PERM_META: { key: PermKey; label: string; color: string }[] = [
  { key: 'view',   label: 'V', color: '#4a90a4'     },
  { key: 'edit',   label: 'E', color: COLORS.gold    },
  { key: 'delete', label: 'D', color: COLORS.error   },
];

// ─── Initial permissions ─────────────────────────────────────────────
function mkPerm(v = true, e = false, d = false): Perm { return { view: v, edit: e, delete: d }; }

function buildInitial(): AllPerms {
  const out: AllPerms = {};
  for (const u of USERS) {
    const isDir   = u.role === 'Regional Director';
    const canEdit = isDir || u.role === 'Portfolio Manager' || u.role === 'Revenue Lead';
    out[u.id] = {
      modules:   Object.fromEntries(MODULES.map(m  => [m,  mkPerm(true, canEdit)])),
      regions:   Object.fromEntries(REGIONS.map(r  => [r,  mkPerm(true, isDir)])),
      companies: Object.fromEntries(CO_NAMES.map(c => [c,  mkPerm(true, isDir)])),
    };
  }
  return out;
}

function countActive(userId: string, perms: AllPerms) {
  const u = perms[userId];
  let n = 0;
  for (const scope of ['modules', 'regions', 'companies'] as PermScope[]) {
    for (const p of Object.values(u[scope])) {
      if (p.view)   n++;
      if (p.edit)   n++;
      if (p.delete) n++;
    }
  }
  return n;
}

const TOTAL = (MODULES.length + REGIONS.length + CO_NAMES.length) * 3;

// ─── Sub-components ───────────────────────────────────────────────────
function Checkbox({ checked, color, onPress }: { checked: boolean; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[s.checkbox, checked && { backgroundColor: color, borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
    >
      {checked && <Check size={11} color="#fff" strokeWidth={3} />}
    </TouchableOpacity>
  );
}

// ─── Main component ──────────────────────────────────────────────────
interface Props { visible: boolean; onClose: () => void; }

export default function AdminPrivilegesModal({ visible, onClose }: Props) {
  const { width: sw, height: sh } = useWindowDimensions();
  const [perms,        setPerms]        = useState<AllPerms>(buildInitial);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dropOpen,     setDropOpen]     = useState(false);

  const scaleAnim   = useRef(new Animated.Value(0.94)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim,   { toValue: 1,    tension: 65, friction: 11, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1,    duration: 220,            useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim,   { toValue: 0.94, duration: 180, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0,    duration: 180, useNativeDriver: true }),
      ]).start();
      setDropOpen(false);
    }
  }, [visible]);

  // ── Toggle a single checkbox
  const toggle = (userId: string, scope: PermScope, item: string, pk: PermKey) => {
    setPerms(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [scope]: {
          ...prev[userId][scope],
          [item]: { ...prev[userId][scope][item], [pk]: !prev[userId][scope][item][pk] },
        },
      },
    }));
  };

  // ── Quick-set helpers
  const quickSet = (mode: 'all' | 'view' | 'clear') => {
    if (!selectedUser) return;
    setPerms(prev => {
      const uid  = selectedUser.id;
      const next: UserPerms = { modules: {}, regions: {}, companies: {} };
      for (const { scope, items } of GROUPS) {
        for (const item of items) {
          next[scope][item] = {
            view:   mode !== 'clear',
            edit:   mode === 'all',
            delete: mode === 'all',
          };
        }
      }
      return { ...prev, [uid]: next };
    });
  };

  const modalW    = Math.min(sw * 0.93, 880);
  const modalH    = Math.min(sh * 0.88, 700);
  const sideLayout = modalW >= 600;
  const LEFT_W    = 248;

  const activeCount = selectedUser ? countActive(selectedUser.id, perms) : 0;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[s.overlay, { opacity: opacityAnim }]} />
      </TouchableWithoutFeedback>

      <View style={s.centeredWrap} pointerEvents="box-none">
        <Animated.View
          style={[s.modal, { width: modalW, height: modalH, opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}
        >
          {/* ── Gradient header ────────────────────────────────── */}
          <LinearGradient
            colors={[COLORS.primaryDark, COLORS.primary]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.header}
          >
            <View style={s.headerLeft}>
              <View style={s.headerIconWrap}>
                <ShieldCheck size={17} color="#fff" />
              </View>
              <View>
                <Text style={s.headerTitle}>User Privileges</Text>
                <Text style={s.headerSub}>Manage access per user across modules, regions &amp; companies</Text>
              </View>
            </View>
            <TouchableOpacity style={s.closeBtn} onPress={onClose} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <X size={17} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </LinearGradient>

          {/* ── Body ───────────────────────────────────────────── */}
          <View style={[s.body, sideLayout ? s.bodyRow : s.bodyCol]}>

            {/* ── Left panel: User selector ───────────────── */}
            <View style={[s.leftPanel, sideLayout ? { width: LEFT_W } : s.leftPanelFull]}>
              <Text style={s.leftSectionLabel}>SELECT USER</Text>

              {/* Dropdown trigger */}
              <TouchableOpacity
                style={[s.dropTrigger, dropOpen && s.dropTriggerOpen]}
                onPress={() => setDropOpen(v => !v)}
                activeOpacity={0.8}
              >
                <Text style={[s.dropTriggerText, !selectedUser && s.dropTriggerPlaceholder]} numberOfLines={1}>
                  {selectedUser ? selectedUser.name : 'Choose a user…'}
                </Text>
                {dropOpen
                  ? <ChevronUp  size={15} color={COLORS.gray500} />
                  : <ChevronDown size={15} color={COLORS.gray500} />}
              </TouchableOpacity>

              {/* Dropdown list */}
              {dropOpen && (
                <View style={s.dropList}>
                  {USERS.map(u => (
                    <TouchableOpacity
                      key={u.id}
                      style={[s.dropOption, selectedUser?.id === u.id && s.dropOptionActive]}
                      onPress={() => { setSelectedUser(u); setDropOpen(false); }}
                      activeOpacity={0.75}
                    >
                      <View style={[s.dropAvatar, { backgroundColor: u.color + '22' }]}>
                        <Text style={[s.dropAvatarText, { color: u.color }]}>{u.initials}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.dropName, selectedUser?.id === u.id && { color: COLORS.primary }]}>{u.name}</Text>
                        <Text style={s.dropRole}>{u.role}</Text>
                      </View>
                      {selectedUser?.id === u.id && <Check size={13} color={COLORS.primary} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Selected user chip */}
              {selectedUser && !dropOpen && (
                <View style={s.userChip}>
                  <View style={[s.chipAvatar, { backgroundColor: selectedUser.color + '22' }]}>
                    <Text style={[s.chipAvatarText, { color: selectedUser.color }]}>{selectedUser.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.chipName}>{selectedUser.name}</Text>
                    <Text style={s.chipRole}>{selectedUser.role}</Text>
                  </View>
                  <View style={s.chipBadge}>
                    <Text style={s.chipBadgeText}>{activeCount}</Text>
                    <Text style={s.chipBadgeLabel}>active</Text>
                  </View>
                </View>
              )}

              {!selectedUser && !dropOpen && (
                <View style={s.leftEmptyHint}>
                  <ShieldCheck size={28} color={COLORS.gray200} />
                  <Text style={s.leftEmptyText}>Select a user to{'\n'}manage their access</Text>
                </View>
              )}
            </View>

            {/* ── Right panel: Privilege table ────────────── */}
            <View style={[s.rightPanel, sideLayout ? { flex: 1 } : s.rightPanelFull]}>
              {selectedUser ? (
                <>
                  {/* Privileges header */}
                  <View style={s.privHeader}>
                    <View style={s.privHeaderLeft}>
                      <ShieldCheck size={14} color={COLORS.primary} />
                      <Text style={s.privHeaderTitle}>Add Privileges</Text>
                      <Text style={s.privHeaderSub}>Set access level per module and section</Text>
                    </View>
                    <View style={s.quickSet}>
                      <Text style={s.quickSetLabel}>Quick set:</Text>
                      {[
                        { label: 'All Access', mode: 'all'   as const },
                        { label: 'View Only',  mode: 'view'  as const },
                        { label: 'Clear All',  mode: 'clear' as const },
                      ].map(({ label, mode }) => (
                        <TouchableOpacity key={mode} style={s.quickBtn} onPress={() => quickSet(mode)} activeOpacity={0.7}>
                          <Text style={s.quickBtnText}>{label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Column headers */}
                  <View style={s.colHeader}>
                    <Text style={[s.colHeaderItem, { flex: 1 }]}>MODULE / SECTION</Text>
                    {PERM_META.map(pm => (
                      <View key={pm.key} style={s.colHeaderCell}>
                        <View style={[s.colHeaderDot, { backgroundColor: pm.color }]} />
                        <Text style={[s.colHeaderLabel, { color: pm.color }]}>{pm.label}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Rows */}
                  <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                    {GROUPS.map(({ scope, label, items, color }) => (
                      <View key={scope}>
                        {/* Group header */}
                        <View style={s.groupHeader}>
                          <View style={[s.groupDot, { backgroundColor: color }]} />
                          <Text style={s.groupLabel}>{label.toUpperCase()}</Text>
                          <View style={s.groupLine} />
                          <Text style={s.groupCount}>{items.length} items</Text>
                        </View>

                        {/* Item rows */}
                        {items.map((item, idx) => (
                          <View key={item} style={[s.dataRow, idx % 2 === 1 && s.dataRowAlt]}>
                            <View style={s.dataRowDot}>
                              <View style={[s.rowDot, { backgroundColor: color }]} />
                            </View>
                            <Text style={s.dataRowName} numberOfLines={1}>{item}</Text>
                            {PERM_META.map(pm => (
                              <View key={pm.key} style={s.dataRowCell}>
                                <Checkbox
                                  checked={perms[selectedUser.id][scope][item][pm.key]}
                                  color={pm.color}
                                  onPress={() => toggle(selectedUser.id, scope, item, pm.key)}
                                />
                              </View>
                            ))}
                          </View>
                        ))}
                      </View>
                    ))}
                    <View style={{ height: 16 }} />
                  </ScrollView>
                </>
              ) : (
                <View style={s.rightEmpty}>
                  <ShieldCheck size={40} color={COLORS.gray200} />
                  <Text style={s.rightEmptyTitle}>No user selected</Text>
                  <Text style={s.rightEmptyText}>Choose a user from the left panel to{'\n'}configure their access privileges.</Text>
                </View>
              )}
            </View>
          </View>

          {/* ── Footer ─────────────────────────────────────────── */}
          <View style={s.footer}>
            <Text style={s.footerHint}>
              {selectedUser
                ? `${activeCount} of ${TOTAL} privileges active for ${selectedUser.name}`
                : 'Select a user to manage privileges'}
            </Text>
            <TouchableOpacity style={[s.saveBtn, !selectedUser && s.saveBtnDisabled]} onPress={onClose} activeOpacity={0.8}>
              <ShieldCheck size={13} color="#fff" />
              <Text style={s.saveBtnText}>Save &amp; Close</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────
const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,46,30,0.75)',
  },
  centeredWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.28,
    shadowRadius: 40,
    elevation: 24,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  headerSub: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255,255,255,0.65)',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Body layout
  body: { flex: 1 },
  bodyRow: { flexDirection: 'row' },
  bodyCol: { flexDirection: 'column' },

  // Left panel
  leftPanel: {
    backgroundColor: COLORS.bg,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    padding: 18,
    gap: 12,
  },
  leftPanelFull: {
    width: '100%',
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 14,
  },
  leftSectionLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.gray500,
    letterSpacing: 0.8,
  },

  // Dropdown
  dropTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
    gap: 8,
  },
  dropTriggerOpen: {
    borderColor: COLORS.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropTriggerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: COLORS.dark,
  },
  dropTriggerPlaceholder: {
    color: COLORS.gray400,
  },
  dropList: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: COLORS.primary,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
    zIndex: 100,
    marginTop: -12,
  },
  dropOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  dropOptionActive: {
    backgroundColor: COLORS.primary + '0d',
  },
  dropAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropAvatarText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
  },
  dropName: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.dark,
  },
  dropRole: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: COLORS.gray400,
  },

  // User chip
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  chipAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipAvatarText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  chipName: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.dark,
  },
  chipRole: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: COLORS.gray500,
    marginTop: 1,
  },
  chipBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  chipBadgeText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: COLORS.primary,
  },
  chipBadgeLabel: {
    fontSize: 8,
    fontFamily: 'Poppins-Regular',
    color: COLORS.primary,
  },

  // Left empty state
  leftEmptyHint: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    gap: 10,
  },
  leftEmptyText: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: COLORS.gray400,
    textAlign: 'center',
    lineHeight: 17,
  },

  // Right panel
  rightPanel: {
    backgroundColor: COLORS.cardBg,
  },
  rightPanelFull: {
    flex: 1,
  },
  rightEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
  },
  rightEmptyTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.gray500,
  },
  rightEmptyText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: COLORS.gray400,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Privileges header
  privHeader: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  privHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  privHeaderTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.dark,
  },
  privHeaderSub: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: COLORS.gray400,
    flex: 1,
  },
  quickSet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  quickSetLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: COLORS.gray500,
    marginRight: 2,
  },
  quickBtn: {
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  quickBtnText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: COLORS.gray600,
  },

  // Column headers
  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: COLORS.cream,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  colHeaderItem: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.gray500,
    letterSpacing: 0.5,
  },
  colHeaderCell: {
    width: 46,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 3,
  },
  colHeaderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  colHeaderLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 0.3,
  },

  // Group header
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 7,
  },
  groupDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  groupLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: COLORS.gray600,
    letterSpacing: 0.9,
  },
  groupLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  groupCount: {
    fontSize: 9,
    fontFamily: 'Poppins-Regular',
    color: COLORS.gray400,
  },

  // Data rows
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    minHeight: 44,
  },
  dataRowAlt: {
    backgroundColor: COLORS.gray100 + '55',
  },
  dataRowDot: {
    width: 16,
    alignItems: 'center',
  },
  rowDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    opacity: 0.55,
  },
  dataRowName: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: COLORS.dark,
    paddingRight: 8,
  },
  dataRowCell: {
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Checkbox
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLORS.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.cream,
  },
  footerHint: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: COLORS.gray400,
    flex: 1,
    marginRight: 16,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnDisabled: {
    backgroundColor: COLORS.gray300,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
});
