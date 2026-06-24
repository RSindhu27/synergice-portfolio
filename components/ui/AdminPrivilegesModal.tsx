import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  ScrollView, Animated, TouchableWithoutFeedback,
  useWindowDimensions,
} from 'react-native';
import { X, ShieldCheck } from 'lucide-react-native';
import { COLORS } from '@/data/theme';

type Perm = { view: boolean; edit: boolean; delete: boolean };
type PermKey = keyof Perm;
type ScopeKey = 'modules' | 'regions' | 'companies';
type AllPerms = Record<string, Record<ScopeKey, Record<string, Perm>>>;

const USERS = [
  { id: 'u1', name: 'Sarah Chen',    initials: 'SC', role: 'Regional Director' },
  { id: 'u2', name: 'Marcus Webb',   initials: 'MW', role: 'Portfolio Mgr'     },
  { id: 'u3', name: 'Priya Nair',    initials: 'PN', role: 'Reg. Analyst'      },
  { id: 'u4', name: 'James Okafor',  initials: 'JO', role: 'Revenue Lead'      },
  { id: 'u5', name: 'Elena Rossi',   initials: 'ER', role: 'Pipeline Analyst'  },
  { id: 'u6', name: 'Tom Bradley',   initials: 'TB', role: 'Data Steward'      },
];

const MODULES   = ['Overview', 'Portfolio', 'Geo Intel', 'Revenue', 'Pipeline', 'Competitor', 'Regulatory', 'Master Data'];
const REGIONS   = ['Region A', 'Region B', 'Region C', 'Region D', 'Region E'];
const CO_NAMES  = ['Company A', 'Company B', 'Company C', 'Company D', 'Company E'];

const SCOPE_TABS: { key: ScopeKey; label: string }[] = [
  { key: 'modules',   label: 'Modules'   },
  { key: 'regions',   label: 'Regions'   },
  { key: 'companies', label: 'Companies' },
];

const PERM_COLORS: Record<PermKey, string> = {
  view:   '#4a90a4',
  edit:   '#c9a84c',
  delete: '#c0392b',
};

const AVATAR_COLORS = [
  COLORS.primary, COLORS.accent, '#4a90a4', COLORS.gold, '#5f7fbf', COLORS.primaryDark,
];

function mkPerm(v = true, e = false, d = false): Perm {
  return { view: v, edit: e, delete: d };
}

function buildInitial(): AllPerms {
  const out: AllPerms = {};
  for (const u of USERS) {
    const isDir   = u.role === 'Regional Director';
    const canEdit = isDir || u.role === 'Portfolio Mgr' || u.role === 'Revenue Lead';
    out[u.id] = {
      modules:   Object.fromEntries(MODULES.map(m  => [m,  mkPerm(true, canEdit)])),
      regions:   Object.fromEntries(REGIONS.map(r  => [r,  mkPerm(true, isDir)])),
      companies: Object.fromEntries(CO_NAMES.map(c => [c,  mkPerm(true, isDir)])),
    };
  }
  return out;
}

const ITEM_COL_W = 130;
const COL_W      = 82;

interface AdminPrivilegesModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AdminPrivilegesModal({ visible, onClose }: AdminPrivilegesModalProps) {
  const { width: sw, height: sh } = useWindowDimensions();
  const [scope, setScope] = useState<ScopeKey>('modules');
  const [perms, setPerms] = useState<AllPerms>(buildInitial);

  const scaleAnim   = useRef(new Animated.Value(0.94)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim,   { toValue: 1, tension: 65, friction: 11, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim,   { toValue: 0.94, duration: 180, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0,    duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const toggle = (userId: string, item: string, pk: PermKey) => {
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

  const scopeItems = scope === 'modules' ? MODULES : scope === 'regions' ? REGIONS : CO_NAMES;
  const modalW     = Math.min(sw * 0.93, 900);
  const modalH     = Math.min(sh * 0.88, 700);
  const tableMinW  = ITEM_COL_W + USERS.length * COL_W + 32;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[s.overlay, { opacity: opacityAnim }]} />
      </TouchableWithoutFeedback>

      <View style={s.centeredWrap} pointerEvents="box-none">
        <Animated.View
          style={[
            s.modal,
            { width: modalW, height: modalH, opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* ── Header ─────────────────────────────────────────── */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <View style={s.headerIconWrap}>
                <ShieldCheck size={17} color={COLORS.primary} />
              </View>
              <View>
                <Text style={s.headerTitle}>User Privileges</Text>
                <Text style={s.headerSub}>Manage access across modules, regions & companies</Text>
              </View>
            </View>
            <TouchableOpacity
              style={s.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <X size={18} color={COLORS.gray600} />
            </TouchableOpacity>
          </View>

          {/* ── Scope tabs + legend ─────────────────────────────── */}
          <View style={s.scopeBar}>
            {SCOPE_TABS.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[s.scopeTab, scope === t.key && s.scopeTabActive]}
                onPress={() => setScope(t.key)}
                activeOpacity={0.7}
              >
                <Text style={[s.scopeTabText, scope === t.key && s.scopeTabTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={s.scopeSpacer} />

            {(['view', 'edit', 'delete'] as PermKey[]).map(pk => (
              <View key={pk} style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: PERM_COLORS[pk] }]} />
                <Text style={s.legendText}>
                  {pk === 'view' ? 'V = View' : pk === 'edit' ? 'E = Edit' : 'D = Delete'}
                </Text>
              </View>
            ))}
          </View>

          {/* ── Permission table ────────────────────────────────── */}
          <ScrollView style={s.tableScroll} showsVerticalScrollIndicator={false}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ minWidth: tableMinW }}>

                {/* Column headers */}
                <View style={[s.colHeaderRow, { paddingLeft: ITEM_COL_W + 16 }]}>
                  {USERS.map((u, i) => (
                    <View key={u.id} style={[s.userHeader, { width: COL_W }]}>
                      <View style={[s.avatar, { backgroundColor: AVATAR_COLORS[i] + '28' }]}>
                        <Text style={[s.avatarText, { color: AVATAR_COLORS[i] }]}>{u.initials}</Text>
                      </View>
                      <Text style={s.userName} numberOfLines={1}>{u.name.split(' ')[0]}</Text>
                      <Text style={s.userRole} numberOfLines={1}>{u.role}</Text>
                      <View style={s.permLabelRow}>
                        {(['view', 'edit', 'delete'] as PermKey[]).map(pk => (
                          <Text key={pk} style={[s.permLabel, { color: PERM_COLORS[pk] }]}>
                            {pk[0].toUpperCase()}
                          </Text>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>

                {/* Data rows */}
                {scopeItems.map((item, rowIdx) => (
                  <View key={item} style={[s.dataRow, rowIdx % 2 === 1 && s.dataRowAlt]}>
                    <View style={[s.itemCell, { width: ITEM_COL_W }]}>
                      <View style={[s.itemDot, { backgroundColor: COLORS.primary }]} />
                      <Text style={s.itemName} numberOfLines={1}>{item}</Text>
                    </View>
                    {USERS.map(u => {
                      const perm = perms[u.id][scope][item];
                      return (
                        <View key={u.id} style={[s.toggleCell, { width: COL_W }]}>
                          {(['view', 'edit', 'delete'] as PermKey[]).map(pk => (
                            <TouchableOpacity
                              key={pk}
                              style={[
                                s.chip,
                                perm[pk]
                                  ? { backgroundColor: PERM_COLORS[pk] }
                                  : s.chipOff,
                              ]}
                              onPress={() => toggle(u.id, item, pk)}
                              activeOpacity={0.65}
                            >
                              <Text style={[s.chipText, perm[pk] ? s.chipTextOn : s.chipTextOff]}>
                                {pk[0].toUpperCase()}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      );
                    })}
                  </View>
                ))}

              </View>
            </ScrollView>
          </ScrollView>

          {/* ── Footer ─────────────────────────────────────────── */}
          <View style={s.footer}>
            <Text style={s.footerHint}>Changes apply immediately · In-session only</Text>
            <TouchableOpacity style={s.saveBtn} onPress={onClose} activeOpacity={0.8}>
              <ShieldCheck size={13} color="#fff" />
              <Text style={s.saveBtnText}>Save & Close</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

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
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 24,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.cream,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: COLORS.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '35',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.dark,
  },
  headerSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: COLORS.gray500,
    marginTop: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scope bar
  scopeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  scopeSpacer: { flex: 1 },
  scopeTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scopeTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  scopeTabText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: COLORS.gray600,
  },
  scopeTabTextActive: {
    color: '#fff',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: COLORS.gray500,
  },

  // Table
  tableScroll: { flex: 1 },
  colHeaderRow: {
    flexDirection: 'row',
    paddingTop: 14,
    paddingBottom: 10,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.cream,
  },
  userHeader: {
    alignItems: 'center',
    gap: 2,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  avatarText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
  },
  userName: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.dark,
    textAlign: 'center',
  },
  userRole: {
    fontSize: 9,
    fontFamily: 'Poppins-Regular',
    color: COLORS.gray400,
    textAlign: 'center',
    marginBottom: 2,
  },
  permLabelRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  permLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    width: 22,
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    minHeight: 52,
  },
  dataRowAlt: {
    backgroundColor: COLORS.gray100 + '60',
  },
  itemCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  itemDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    opacity: 0.5,
  },
  itemName: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: COLORS.dark,
  },
  toggleCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  chip: {
    width: 22,
    height: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOff: {
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: {
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
  },
  chipTextOn:  { color: '#fff' },
  chipTextOff: { color: COLORS.gray400 },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.cream,
  },
  footerHint: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: COLORS.gray400,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
});
