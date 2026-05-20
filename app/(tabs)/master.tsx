import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, useWindowDimensions, Modal,
  Animated, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, X, ChevronLeft, ChevronRight, Upload, History, Pencil, Check, ChevronDown, Package, Briefcase, Clock, FileSpreadsheet, User, ArrowRight, Layers, Tag, MapPin, Building2, Activity, Plus } from 'lucide-react-native';
import { COLORS, COMPANY_COLORS } from '@/data/mockData';
import {
  masterProducts, masterBD, auditLog,
  MASTER_REGIONS, PRODUCT_FIELD_LABELS, BD_FIELD_LABELS,
  MasterProduct, BDRecord, AuditEntry,
} from '@/data/masterData';

// ─── Neutral palette ──────────────────────────────────────────────────────────
const N = {
  cardBg:   '#ffffff',
  pageBg:   '#f2f4f7',
  border:   '#dde0e5',
  borderLt: '#eaecf0',
  headBg:   '#f6f7f9',
  dark:     '#111827',
  mid:      '#374151',
  muted:    '#4b5563',
  faint:    '#6b7280',
  green:    '#2d6a35',
  greenBg:  '#eaf4ec',
  greenBdr: '#b6d8bc',
  amber:    '#b45309',
  amberBg:  '#fef3c7',
  amberBdr: '#fcd34d',
  red:      '#b91c1c',
  redBg:    '#fef2f2',
  redBdr:   '#fca5a5',
  blue:     '#1d4ed8',
  blueBg:   '#eff6ff',
  blueBdr:  '#93c5fd',
};

const COMPANIES = ['Company A', 'Company B', 'Company C', 'Company D', 'Company E'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function companyDot(c: string) {
  return COMPANY_COLORS[c] || '#607D8B';
}

function statusColor(s: string) {
  if (s === 'Active') return { bg: N.greenBg, border: N.greenBdr, text: N.green };
  if (s === 'Inactive' || s === 'Closed') return { bg: N.redBg, border: N.redBdr, text: N.red };
  if (s === 'Pending' || s === 'Negotiation') return { bg: N.amberBg, border: N.amberBdr, text: N.amber };
  return { bg: N.headBg, border: N.border, text: N.mid };
}

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(ts: string) {
  const now = Date.now();
  const diff = now - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const PAGE_SIZE = 6;

// ─── Edit All Fields Modal ────────────────────────────────────────────────────
type EditRecord = MasterProduct | BDRecord;

function EditAllModal({
  visible,
  record,
  labels,
  onSave,
  onClose,
}: {
  visible: boolean;
  record: EditRecord | null;
  labels: Record<string, string>;
  onSave: (updated: Record<string, string>) => void;
  onClose: () => void;
}) {
  const [vals, setVals] = useState<Record<string, string>>({});
  const { width: SW } = useWindowDimensions();

  useEffect(() => {
    if (record) {
      const init: Record<string, string> = {};
      Object.keys(labels).forEach(k => { init[k] = (record as any)[k] ?? ''; });
      setVals(init);
    }
  }, [record]);

  if (!record) return null;

  const dot = companyDot(record.company);
  const name = (record as any).fieldA ?? record.id;
  const fieldKeys = Object.keys(labels);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={em.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={onClose} />
        <View style={[em.sheet, { width: Math.min(SW * 0.94, 520) }]}>
          {/* Header */}
          <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={em.sheetHeader}>
            <View style={[em.headerDot, { backgroundColor: dot }]} />
            <View style={{ flex: 1 }}>
              <Text style={em.sheetTitle} numberOfLines={1}>Edit Record</Text>
              <Text style={em.sheetSub} numberOfLines={1}>{name} · {record.id}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={em.closeBtn}>
              <X size={16} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Fields */}
          <ScrollView style={em.scroll} contentContainerStyle={em.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={em.fieldGrid}>
              {fieldKeys.map((k, i) => (
                <View key={k} style={em.fieldWrap}>
                  <Text style={em.fieldLabel}>{labels[k]}</Text>
                  <TextInput
                    style={em.input}
                    value={vals[k] ?? ''}
                    onChangeText={v => setVals(prev => ({ ...prev, [k]: v }))}
                    selectTextOnFocus
                    autoFocus={i === 0}
                  />
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={em.footer}>
            <TouchableOpacity style={em.cancelBtn} onPress={onClose}>
              <Text style={em.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={em.saveBtn} onPress={() => { onSave(vals); onClose(); }}>
              <Check size={14} color="#fff" />
              <Text style={em.saveText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const em = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  sheet: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  headerDot: { width: 10, height: 10, borderRadius: 5 },
  sheetTitle: { fontSize: 15, fontFamily: 'Poppins-Bold', color: '#fff' },
  sheetSub: { fontSize: 11, fontFamily: 'Poppins-Regular', color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  closeBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { flexShrink: 1 },
  scrollContent: { padding: 16 },
  fieldGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
  fieldWrap: { width: '50%', paddingHorizontal: 6, paddingVertical: 6 },
  fieldLabel: { fontSize: 10, fontFamily: 'Poppins-Medium', color: N.faint, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: N.border, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8,
    fontSize: 13, fontFamily: 'Poppins-Regular', color: N.dark,
    backgroundColor: N.headBg,
  },
  footer: {
    flexDirection: 'row', gap: 10, justifyContent: 'flex-end',
    paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: N.border,
    backgroundColor: '#fff',
  },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 8, borderWidth: 1, borderColor: N.border },
  cancelText: { fontSize: 13, fontFamily: 'Poppins-Medium', color: N.muted },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 8, backgroundColor: COLORS.primary },
  saveText: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: '#fff' },
});

// ─── Audit Log Drawer ─────────────────────────────────────────────────────────
function AuditLogDrawer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);
  const { width: SW } = useWindowDimensions();
  const drawerW = Math.min(SW * 0.88, 460);

  useEffect(() => {
    if (visible) setMounted(true);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: visible ? 1 : 0,
        useNativeDriver: true,
        tension: 70,
        friction: 12,
      }),
      Animated.timing(overlayAnim, {
        toValue: visible ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => { if (!visible) setMounted(false); });
  }, [visible]);

  const translateX = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [drawerW, 0] });

  if (!mounted) return null;

  const uploadCount = auditLog.filter(e => e.action === 'upload').length;
  const editCount = auditLog.filter(e => e.action === 'edit').length;
  const totalRows = auditLog.reduce((s, e) => s + (e.rowsAffected || 0), 0);

  const actionMeta = (a: AuditEntry['action']) => {
    if (a === 'upload') return { icon: <FileSpreadsheet size={14} color={N.blue} />, bg: N.blueBg, border: N.blueBdr, text: N.blue, label: 'Upload' };
    if (a === 'edit') return { icon: <Pencil size={14} color={N.amber} />, bg: N.amberBg, border: N.amberBdr, text: N.amber, label: 'Edit' };
    return { icon: <X size={14} color={N.red} />, bg: N.redBg, border: N.redBdr, text: N.red, label: 'Delete' };
  };

  return (
    <Modal visible transparent animationType="none">
      <Animated.View style={[al.overlay, { opacity: overlayAnim }]} pointerEvents="box-none">
        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[al.drawer, { width: drawerW, transform: [{ translateX }] }]}>

        {/* ── Gradient header ── */}
        <LinearGradient colors={[COLORS.primaryDark, COLORS.primary, '#3d8b4a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={al.drawerHeader}>
          <View style={al.drawerHeaderTop}>
            <View style={al.headerIconCircle}>
              <History size={18} color={COLORS.goldLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={al.drawerTitle}>Audit Trail</Text>
              <Text style={al.drawerSub}>Complete change history · Master Data</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={al.closeBtn}>
              <X size={16} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
          </View>

          {/* Stats strip */}
          <View style={al.statsStrip}>
            <View style={al.statItem}>
              <Text style={al.statNum}>{auditLog.length}</Text>
              <Text style={al.statLabel}>Total Events</Text>
            </View>
            <View style={al.statDivider} />
            <View style={al.statItem}>
              <Text style={al.statNum}>{uploadCount}</Text>
              <Text style={al.statLabel}>Uploads</Text>
            </View>
            <View style={al.statDivider} />
            <View style={al.statItem}>
              <Text style={al.statNum}>{editCount}</Text>
              <Text style={al.statLabel}>Field Edits</Text>
            </View>
            <View style={al.statDivider} />
            <View style={al.statItem}>
              <Text style={al.statNum}>{totalRows}</Text>
              <Text style={al.statLabel}>Rows Imported</Text>
            </View>
          </View>

          <View style={al.headerGoldLine} />
        </LinearGradient>

        {/* ── Timeline entries ── */}
        <ScrollView style={al.scroll} contentContainerStyle={al.scrollContent} showsVerticalScrollIndicator={false}>
          {auditLog.map((entry, idx) => {
            const am = actionMeta(entry.action);
            const isUpload = entry.action === 'upload';
            const isLast = idx === auditLog.length - 1;
            return (
              <View key={entry.id} style={al.entryRow}>
                {/* Timeline column */}
                <View style={al.timelineCol}>
                  <View style={[al.timelineDot, { backgroundColor: am.bg, borderColor: am.border }]}>
                    {am.icon}
                  </View>
                  {!isLast && <View style={al.timelineLine} />}
                </View>

                {/* Card */}
                <View style={[al.card, isUpload && al.cardUpload]}>
                  {/* Left accent bar */}
                  <View style={[al.cardAccent, { backgroundColor: am.text }]} />

                  <View style={al.cardBody}>
                    {/* Row 1: badges + timestamp */}
                    <View style={al.cardTopRow}>
                      <View style={[al.badge, { backgroundColor: am.bg, borderColor: am.border }]}>
                        <Text style={[al.badgeText, { color: am.text }]}>{am.label}</Text>
                      </View>
                      <View style={[al.modBadge, { backgroundColor: entry.module === 'Products' ? N.greenBg : N.amberBg }]}>
                        <Text style={[al.modBadgeText, { color: entry.module === 'Products' ? N.green : N.amber }]}>
                          {entry.module}
                        </Text>
                      </View>
                      <View style={al.spacer} />
                      <Text style={al.timeAgo}>{timeAgo(entry.timestamp)}</Text>
                    </View>

                    {/* Row 2: record name */}
                    <Text style={al.cardName} numberOfLines={1}>
                      {isUpload ? entry.fileName : entry.recordName}
                    </Text>

                    {/* Row 3: meta */}
                    <View style={al.metaRow}>
                      <View style={al.metaPill}>
                        <User size={10} color={N.faint} />
                        <Text style={al.metaText}>{entry.user}</Text>
                      </View>
                      <View style={al.metaSep} />
                      <View style={al.metaPill}>
                        <Clock size={10} color={N.faint} />
                        <Text style={al.metaText}>{formatTimestamp(entry.timestamp)}</Text>
                      </View>
                    </View>

                    {/* Upload pill */}
                    {isUpload && entry.rowsAffected !== undefined && (
                      <View style={al.uploadPill}>
                        <FileSpreadsheet size={12} color={N.blue} />
                        <Text style={al.uploadPillText}>{entry.rowsAffected} rows imported successfully</Text>
                        <View style={al.uploadCheck}>
                          <Check size={10} color={N.green} />
                        </View>
                      </View>
                    )}

                    {/* Field changes */}
                    {!isUpload && entry.changes.length > 0 && (
                      <View style={al.changesWrap}>
                        <View style={al.changesHeader}>
                          <Pencil size={10} color={N.faint} />
                          <Text style={al.changesHeaderText}>{entry.changes.length} field{entry.changes.length > 1 ? 's' : ''} changed</Text>
                        </View>
                        {entry.changes.map((ch, ci) => (
                          <View key={ci} style={al.changeItem}>
                            <Text style={al.changeFieldName} numberOfLines={1}>{ch.field}</Text>
                            <View style={al.changeValues}>
                              <View style={al.valueBefore}>
                                <Text style={al.valueBeforeText} numberOfLines={1}>{ch.before}</Text>
                              </View>
                              <ArrowRight size={10} color={N.faint} />
                              <View style={al.valueAfter}>
                                <Text style={al.valueAfterText} numberOfLines={1}>{ch.after}</Text>
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
          {/* End of trail */}
          <View style={al.endMark}>
            <View style={al.endDot} />
            <Text style={al.endText}>End of audit trail</Text>
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const al = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#f4f6f9',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 28,
    shadowOffset: { width: -6, height: 0 },
    elevation: 28,
  },

  // Header
  drawerHeader: {
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingBottom: 0,
    paddingHorizontal: 20,
  },
  drawerHeaderTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  drawerTitle: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#fff', letterSpacing: -0.3 },
  drawerSub: { fontSize: 11, fontFamily: 'Poppins-Regular', color: COLORS.goldLight, marginTop: 2, opacity: 0.9 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  // Stats strip
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 1 },
  statNum: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#fff' },
  statLabel: { fontSize: 9, fontFamily: 'Poppins-Regular', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.4 },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)' },
  headerGoldLine: { height: 2, backgroundColor: COLORS.gold, opacity: 0.55 },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 },

  // Entry row layout
  entryRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  timelineCol: { width: 32, alignItems: 'center', paddingTop: 2 },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    backgroundColor: '#fff',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: N.border,
    marginTop: 6,
    marginBottom: -4,
    borderRadius: 1,
  },

  // Card
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: N.border,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardUpload: {
    borderColor: N.blueBdr,
    backgroundColor: '#fafcff',
  },
  cardAccent: { width: 3, flexShrink: 0 },
  cardBody: { flex: 1, padding: 12, gap: 6 },

  // Card internals
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  badge: {
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 10, fontFamily: 'Poppins-Bold', letterSpacing: 0.2 },
  modBadge: { borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  modBadgeText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  spacer: { flex: 1 },
  timeAgo: { fontSize: 10, fontFamily: 'Poppins-Regular', color: N.faint },
  cardName: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: N.dark },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 10, fontFamily: 'Poppins-Regular', color: N.faint },
  metaSep: { width: 3, height: 3, borderRadius: 2, backgroundColor: N.border },

  // Upload pill
  uploadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: N.blueBg,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: N.blueBdr,
    marginTop: 2,
  },
  uploadPillText: { flex: 1, fontSize: 11, fontFamily: 'Poppins-Medium', color: N.blue },
  uploadCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: N.greenBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: N.greenBdr,
  },

  // Changes
  changesWrap: {
    backgroundColor: '#f8f9fb',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: N.border,
    gap: 6,
    marginTop: 2,
  },
  changesHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  changesHeaderText: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: N.faint, textTransform: 'uppercase', letterSpacing: 0.5 },
  changeItem: { gap: 3 },
  changeFieldName: { fontSize: 11, fontFamily: 'Poppins-Medium', color: N.mid },
  changeValues: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  valueBefore: {
    backgroundColor: '#fff0f0',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  valueBeforeText: { fontSize: 11, fontFamily: 'Poppins-Regular', color: N.red },
  valueAfter: {
    backgroundColor: N.greenBg,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: N.greenBdr,
  },
  valueAfterText: { fontSize: 11, fontFamily: 'Poppins-Regular', color: N.green },

  // End mark
  endMark: { alignItems: 'center', gap: 6, paddingTop: 8 },
  endDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: N.border },
  endText: { fontSize: 11, fontFamily: 'Poppins-Regular', color: N.faint },
});

// ─── Add Field Modal ──────────────────────────────────────────────────────────
function AddFieldModal({
  visible,
  onAdd,
  onClose,
}: {
  visible: boolean;
  onAdd: (name: string, value: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const nameRef = useRef<any>(null);

  useEffect(() => {
    if (visible) { setName(''); setValue(''); }
  }, [visible]);

  const canSave = name.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={af.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={onClose} />
        <View style={af.box}>
          <View style={af.header}>
            <View style={af.iconCircle}>
              <Plus size={14} color={COLORS.primary} />
            </View>
            <Text style={af.title}>Add Custom Field</Text>
            <TouchableOpacity onPress={onClose} style={af.closeBtn}>
              <X size={15} color={N.muted} />
            </TouchableOpacity>
          </View>
          <View style={af.body}>
            <View style={af.fieldWrap}>
              <Text style={af.label}>Field Name</Text>
              <TextInput
                ref={nameRef}
                style={af.input}
                placeholder="e.g. Batch Number"
                placeholderTextColor={N.faint}
                value={name}
                onChangeText={setName}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={() => {}}
              />
            </View>
            <View style={af.fieldWrap}>
              <Text style={af.label}>Value</Text>
              <TextInput
                style={af.input}
                placeholder="e.g. BN-2024-001"
                placeholderTextColor={N.faint}
                value={value}
                onChangeText={setValue}
                returnKeyType="done"
                onSubmitEditing={() => { if (canSave) { onAdd(name.trim(), value.trim()); onClose(); } }}
              />
            </View>
          </View>
          <View style={af.footer}>
            <TouchableOpacity style={af.cancelBtn} onPress={onClose}>
              <Text style={af.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[af.addBtn, !canSave && af.addBtnDisabled]}
              onPress={() => { if (canSave) { onAdd(name.trim(), value.trim()); onClose(); } }}
            >
              <Plus size={13} color="#fff" />
              <Text style={af.addText}>Add Field</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const af = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  box: {
    backgroundColor: '#fff', borderRadius: 14, width: 320,
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: N.border,
    backgroundColor: N.headBg,
  },
  iconCircle: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: COLORS.primary + '12',
    borderWidth: 1, borderColor: COLORS.primary + '30',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { flex: 1, fontSize: 14, fontFamily: 'Poppins-SemiBold', color: N.dark },
  closeBtn: { padding: 2 },
  body: { padding: 16, gap: 12 },
  fieldWrap: { gap: 5 },
  label: { fontSize: 10, fontFamily: 'Poppins-Medium', color: N.faint, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1, borderColor: N.border, borderRadius: 8,
    paddingHorizontal: 11, paddingVertical: 9,
    fontSize: 13, fontFamily: 'Poppins-Regular', color: N.dark,
    backgroundColor: N.headBg,
  },
  footer: {
    flexDirection: 'row', gap: 8, justifyContent: 'flex-end',
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: N.border,
  },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 7, borderWidth: 1, borderColor: N.border },
  cancelText: { fontSize: 12, fontFamily: 'Poppins-Medium', color: N.muted },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 7, backgroundColor: COLORS.primary },
  addBtnDisabled: { opacity: 0.4 },
  addText: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: '#fff' },
});

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ item, labels, customFields, onEdit, onAddField }: {
  item: MasterProduct;
  labels: typeof PRODUCT_FIELD_LABELS;
  customFields: { name: string; value: string }[];
  onEdit: (item: MasterProduct) => void;
  onAddField: (item: MasterProduct) => void;
}) {
  const dot = companyDot(item.company);
  const allFields = Object.keys(labels) as (keyof typeof labels)[];

  const FieldPill = ({ label, value }: { label: string; value: string }) => (
    <View style={pc.pill}>
      <Text style={pc.pillLabel}>{label}</Text>
      <Text style={pc.pillValue} numberOfLines={1}>{value}</Text>
    </View>
  );

  return (
    <View style={pc.card}>
      {/* Card header */}
      <View style={pc.cardHeader}>
        <View style={[pc.idBadge, { borderColor: dot + '40', backgroundColor: dot + '10' }]}>
          <Text style={[pc.idText, { color: dot }]}>{item.id}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={pc.productName} numberOfLines={1}>{item.fieldA}</Text>
          <View style={pc.subRow}>
            <View style={[pc.dot, { backgroundColor: dot }]} />
            <Text style={pc.subText}>{item.company}</Text>
            <MapPin size={10} color={N.faint} />
            <Text style={pc.subText}>{item.region}</Text>
          </View>
        </View>
        <View style={pc.headerBtns}>
          <TouchableOpacity style={pc.addBtn} onPress={() => onAddField(item)}>
            <Plus size={12} color={COLORS.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={pc.editBtn} onPress={() => onEdit(item)}>
            <Pencil size={12} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Fields grid */}
      <View style={pc.fieldGrid}>
        {allFields.map(k => (
          <FieldPill key={k} label={labels[k]} value={(item as any)[k]} />
        ))}
        {customFields.map((cf, i) => (
          <FieldPill key={`custom-${i}`} label={cf.name} value={cf.value} />
        ))}
      </View>
    </View>
  );
}

const pc = StyleSheet.create({
  card: {
    backgroundColor: N.cardBg,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: N.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: N.headBg,
    borderBottomWidth: 1,
    borderBottomColor: N.border,
  },
  idBadge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
  idText: { fontSize: 9, fontFamily: 'Poppins-Bold', letterSpacing: 0.3 },
  productName: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: N.dark, marginBottom: 1 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  subText: { fontSize: 10, fontFamily: 'Poppins-Regular', color: N.faint },
  fieldGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, paddingVertical: 8, gap: 0 },
  pill: { width: '33.33%', paddingHorizontal: 5, paddingVertical: 4 },
  pillLabel: { fontSize: 9, fontFamily: 'Poppins-Medium', color: N.faint, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 1 },
  pillValue: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: N.dark },
  headerBtns: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addBtn: {
    width: 28, height: 28, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.accent + '15',
    borderWidth: 1, borderColor: COLORS.accent + '40',
  },
  editBtn: {
    width: 28, height: 28, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary + '12',
    borderWidth: 1, borderColor: COLORS.primary + '30',
  },
});

// ─── BD Card ──────────────────────────────────────────────────────────────────
function BDCard({ item, labels, onEdit }: {
  item: BDRecord;
  labels: typeof BD_FIELD_LABELS;
  onEdit: (item: BDRecord) => void;
}) {
  const sc = statusColor((item as any).fieldD);
  const dot = companyDot(item.company);

  const ICONS: Record<string, React.ReactNode> = {
    fieldA: <Briefcase size={13} color={dot} />,
    fieldB: <Building2 size={13} color={COLORS.info} />,
    fieldC: <Layers size={13} color={COLORS.accent} />,
    fieldD: <Activity size={13} color={sc.text} />,
    fieldE: <Clock size={13} color={COLORS.gold} />,
    fieldF: <Tag size={13} color={N.green} />,
  };

  return (
    <View style={bd.card}>
      <View style={[bd.accent, { backgroundColor: dot }]} />
      <View style={bd.inner}>
        {/* Header */}
        <View style={bd.header}>
          <View style={{ flex: 1 }}>
            <Text style={bd.name} numberOfLines={1}>{item.fieldA}</Text>
            <View style={bd.subRow}>
              <View style={[bd.dot, { backgroundColor: dot }]} />
              <Text style={bd.sub}>{item.company} · {item.region}</Text>
            </View>
          </View>
          <TouchableOpacity style={bd.editBtn} onPress={() => onEdit(item)}>
            <Pencil size={12} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Field cards row */}
        <View style={bd.fieldsRow}>
          {(Object.keys(labels) as (keyof typeof labels)[]).map(k => (
            <View key={k} style={bd.fieldCard}>
              <View style={bd.fieldCardTop}>
                {ICONS[k]}
                <Text style={bd.fieldCardLabel}>{labels[k]}</Text>
              </View>
              <Text style={bd.fieldCardValue} numberOfLines={1}>{(item as any)[k]}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const bd = StyleSheet.create({
  card: {
    backgroundColor: N.cardBg,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: N.border,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  accent: { width: 3, flexShrink: 0 },
  inner: { flex: 1, padding: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  name: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: N.dark, marginBottom: 1 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  sub: { fontSize: 10, fontFamily: 'Poppins-Regular', color: N.faint },
  statusChip: { borderRadius: 7, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  editBtn: {
    width: 28, height: 28, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary + '12',
    borderWidth: 1, borderColor: COLORS.primary + '30',
  },
  fieldsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  fieldCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: N.headBg,
    borderRadius: 9,
    padding: 9,
    borderWidth: 1,
    borderColor: N.border,
  },
  fieldCardTop: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 5 },
  fieldCardLabel: { flex: 1, fontSize: 9, fontFamily: 'Poppins-Medium', color: N.faint, textTransform: 'uppercase', letterSpacing: 0.3 },
  fieldCardValue: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: N.dark },
});

// ─── Dropdown ─────────────────────────────────────────────────────────────────
function Dropdown({
  label, value, options, onChange,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={dd.wrap}>
      <TouchableOpacity style={dd.btn} onPress={() => setOpen(o => !o)}>
        <Text style={dd.label} numberOfLines={1}>{value || label}</Text>
        <ChevronDown size={13} color={N.faint} />
      </TouchableOpacity>
      {open && (
        <View style={dd.menu}>
          <TouchableOpacity style={dd.opt} onPress={() => { onChange(''); setOpen(false); }}>
            <Text style={dd.optText}>All</Text>
          </TouchableOpacity>
          {options.map(o => (
            <TouchableOpacity key={o} style={dd.opt} onPress={() => { onChange(o); setOpen(false); }}>
              <Text style={[dd.optText, value === o && dd.optActive]}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const dd = StyleSheet.create({
  wrap: { position: 'relative', zIndex: 10 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: N.cardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: N.border,
    minWidth: 140,
  },
  label: { flex: 1, fontSize: 12, fontFamily: 'Poppins-Medium', color: N.mid },
  menu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: N.cardBg,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: N.border,
    marginTop: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    zIndex: 20,
  },
  opt: { paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: N.borderLt },
  optText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: N.mid },
  optActive: { fontFamily: 'Poppins-SemiBold', color: COLORS.primary },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MasterDataScreen() {
  const { width: SW } = useWindowDimensions();
  const isTablet = SW >= 768;

  const [activeTab, setActiveTab] = useState<'products' | 'bd'>('products');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [searchProd, setSearchProd] = useState('');
  const [searchBD, setSearchBD] = useState('');
  const [prodPage, setProdPage] = useState(1);
  const [bdPage, setBdPage] = useState(1);
  const [auditVisible, setAuditVisible] = useState(false);

  const [editRecord, setEditRecord] = useState<{ record: EditRecord; type: 'product' | 'bd' } | null>(null);
  const [products, setProducts] = useState<MasterProduct[]>(masterProducts);
  const [bdItems, setBdItems] = useState<BDRecord[]>(masterBD);
  const [customFields, setCustomFields] = useState<Record<string, { name: string; value: string }[]>>({});
  const [addFieldTarget, setAddFieldTarget] = useState<MasterProduct | null>(null);

  const tabAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(tabAnim, { toValue: activeTab === 'products' ? 0 : 1, useNativeDriver: true, tension: 80, friction: 12 }).start();
  }, [activeTab]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (filterCompany && p.company !== filterCompany) return false;
      if (filterRegion && p.region !== filterRegion) return false;
      if (searchProd) {
        const q = searchProd.toLowerCase();
        return Object.values(p).some(v => String(v).toLowerCase().includes(q));
      }
      return true;
    });
  }, [products, filterCompany, filterRegion, searchProd]);

  const prodTotal = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const prodSlice = filteredProducts.slice((prodPage - 1) * PAGE_SIZE, prodPage * PAGE_SIZE);

  // Filtered BD
  const filteredBD = useMemo(() => {
    return bdItems.filter(b => {
      if (filterCompany && b.company !== filterCompany) return false;
      if (filterRegion && b.region !== filterRegion) return false;
      if (searchBD) {
        const q = searchBD.toLowerCase();
        return Object.values(b).some(v => String(v).toLowerCase().includes(q));
      }
      return true;
    });
  }, [bdItems, filterCompany, filterRegion, searchBD]);

  const bdTotal = Math.ceil(filteredBD.length / PAGE_SIZE);
  const bdSlice = filteredBD.slice((bdPage - 1) * PAGE_SIZE, bdPage * PAGE_SIZE);

  // Edit handlers
  const openProductEdit = (item: MasterProduct) => setEditRecord({ record: item, type: 'product' });
  const openBDEdit = (item: BDRecord) => setEditRecord({ record: item, type: 'bd' });

  const handleAddField = (name: string, value: string) => {
    if (!addFieldTarget) return;
    setCustomFields(prev => ({
      ...prev,
      [addFieldTarget.id]: [...(prev[addFieldTarget.id] ?? []), { name, value }],
    }));
  };

  const saveEdit = (updated: Record<string, string>) => {
    if (!editRecord) return;
    if (editRecord.type === 'product') {
      setProducts(prev => prev.map(p => p.id === editRecord.record.id ? { ...p, ...updated } : p));
    } else {
      setBdItems(prev => prev.map(b => b.id === editRecord.record.id ? { ...b, ...updated } : b));
    }
  };

  // Audit button hover state (web)
  const [auditTooltip, setAuditTooltip] = useState(false);

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Page header — matches other pages ── */}
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary, '#4a8f55']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <Text style={s.headerTitle}>Master Data</Text>
        <Text style={s.headerSub}>Centralized product &amp; BD repository</Text>
        <View style={s.headerGoldLine} />
      </LinearGradient>

      {/* ── Global Filters row ── */}
      <View style={s.filtersBar}>
        <Dropdown label="Select Company" value={filterCompany} options={COMPANIES} onChange={v => { setFilterCompany(v); setProdPage(1); setBdPage(1); }} />
        <Dropdown label="Select Region" value={filterRegion} options={MASTER_REGIONS} onChange={v => { setFilterRegion(v); setProdPage(1); setBdPage(1); }} />
        {(filterCompany || filterRegion) && (
          <TouchableOpacity style={s.clearFilters} onPress={() => { setFilterCompany(''); setFilterRegion(''); }}>
            <X size={13} color={N.red} />
            <Text style={s.clearFiltersText}>Clear</Text>
          </TouchableOpacity>
        )}
        <View style={s.filtersSpacer} />
        {/* Upload Excel */}
        <TouchableOpacity style={s.uploadBtn}>
          <Upload size={14} color="#fff" />
          <Text style={s.uploadText}>Upload Excel</Text>
        </TouchableOpacity>
        {/* Audit Log button — icon only with tooltip */}
        <View style={s.auditWrap}>
          {auditTooltip && (
            <View style={s.tooltip} pointerEvents="none">
              <Text style={s.tooltipText}>Audit Log</Text>
              <View style={s.tooltipArrow} />
            </View>
          )}
          <TouchableOpacity
            style={s.auditBtn}
            onPress={() => { setAuditVisible(true); setAuditTooltip(false); }}
            onPressIn={() => setAuditTooltip(true)}
            onPressOut={() => setAuditTooltip(false)}
          >
            <History size={15} color={N.muted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Tab bar ── */}
      <View style={s.tabBar}>
        {(['products', 'bd'] as const).map(tab => {
          const focused = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[s.tabBtn, focused && s.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              {tab === 'products' ? (
                <Package size={14} color={focused ? COLORS.primary : N.faint} />
              ) : (
                <Briefcase size={14} color={focused ? COLORS.primary : N.faint} />
              )}
              <Text style={[s.tabLabel, focused && s.tabLabelActive]}>
                {tab === 'products' ? 'Products' : 'Business Development'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Content ── */}
      {activeTab === 'products' ? (
        <View style={{ flex: 1 }}>
          {/* Search */}
          <View style={s.searchWrap}>
            <Search size={14} color={N.faint} />
            <TextInput
              style={s.searchInput}
              placeholder="Search products, SKUs, molecules..."
              placeholderTextColor={N.faint}
              value={searchProd}
              onChangeText={v => { setSearchProd(v); setProdPage(1); }}
            />
            {searchProd.length > 0 && (
              <TouchableOpacity onPress={() => setSearchProd('')}>
                <X size={13} color={N.faint} />
              </TouchableOpacity>
            )}
          </View>

          {/* Summary bar */}
          <View style={s.summaryBar}>
            <Text style={s.summaryText}>
              <Text style={s.summaryCount}>{filteredProducts.length}</Text> product{filteredProducts.length !== 1 ? 's' : ''} · Page {prodPage} of {Math.max(prodTotal, 1)}
            </Text>
          </View>

          {/* Cards */}
          <ScrollView style={{ flex: 1 }} contentContainerStyle={s.cardList} showsVerticalScrollIndicator={false}>
            {prodSlice.length === 0 ? (
              <View style={s.emptyState}>
                <Package size={32} color={N.border} />
                <Text style={s.emptyText}>No products match your filters</Text>
              </View>
            ) : (
              prodSlice.map(item => (
                <ProductCard
                  key={item.id}
                  item={item}
                  labels={PRODUCT_FIELD_LABELS}
                  customFields={customFields[item.id] ?? []}
                  onEdit={openProductEdit}
                  onAddField={setAddFieldTarget}
                />
              ))
            )}
          </ScrollView>

          {/* Pagination */}
          <View style={s.pagination}>
            <TouchableOpacity
              style={[s.pageBtn, prodPage <= 1 && s.pageBtnDisabled]}
              onPress={() => setProdPage(p => Math.max(1, p - 1))}
              disabled={prodPage <= 1}
            >
              <ChevronLeft size={14} color={prodPage <= 1 ? N.border : N.mid} />
              <Text style={[s.pageBtnText, prodPage <= 1 && s.pageBtnTextDisabled]}>Prev</Text>
            </TouchableOpacity>
            <Text style={s.pageInfo}>Page {prodPage} / {Math.max(prodTotal, 1)}</Text>
            <TouchableOpacity
              style={[s.pageBtn, prodPage >= prodTotal && s.pageBtnDisabled]}
              onPress={() => setProdPage(p => Math.min(prodTotal, p + 1))}
              disabled={prodPage >= prodTotal}
            >
              <Text style={[s.pageBtnText, prodPage >= prodTotal && s.pageBtnTextDisabled]}>Next</Text>
              <ChevronRight size={14} color={prodPage >= prodTotal ? N.border : N.mid} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Search */}
          <View style={s.searchWrap}>
            <Search size={14} color={N.faint} />
            <TextInput
              style={s.searchInput}
              placeholder="Search BD records, partners, deal types..."
              placeholderTextColor={N.faint}
              value={searchBD}
              onChangeText={v => { setSearchBD(v); setBdPage(1); }}
            />
            {searchBD.length > 0 && (
              <TouchableOpacity onPress={() => setSearchBD('')}>
                <X size={13} color={N.faint} />
              </TouchableOpacity>
            )}
          </View>

          {/* Summary bar */}
          <View style={s.summaryBar}>
            <Text style={s.summaryText}>
              <Text style={s.summaryCount}>{filteredBD.length}</Text> record{filteredBD.length !== 1 ? 's' : ''} · Page {bdPage} of {Math.max(bdTotal, 1)}
            </Text>
          </View>

          {/* Cards */}
          <ScrollView style={{ flex: 1 }} contentContainerStyle={s.cardList} showsVerticalScrollIndicator={false}>
            {bdSlice.length === 0 ? (
              <View style={s.emptyState}>
                <Briefcase size={32} color={N.border} />
                <Text style={s.emptyText}>No records match your filters</Text>
              </View>
            ) : (
              bdSlice.map(item => (
                <BDCard
                  key={item.id}
                  item={item}
                  labels={BD_FIELD_LABELS}
                  onEdit={openBDEdit}
                />
              ))
            )}
          </ScrollView>

          {/* Pagination */}
          <View style={s.pagination}>
            <TouchableOpacity
              style={[s.pageBtn, bdPage <= 1 && s.pageBtnDisabled]}
              onPress={() => setBdPage(p => Math.max(1, p - 1))}
              disabled={bdPage <= 1}
            >
              <ChevronLeft size={14} color={bdPage <= 1 ? N.border : N.mid} />
              <Text style={[s.pageBtnText, bdPage <= 1 && s.pageBtnTextDisabled]}>Prev</Text>
            </TouchableOpacity>
            <Text style={s.pageInfo}>Page {bdPage} / {Math.max(bdTotal, 1)}</Text>
            <TouchableOpacity
              style={[s.pageBtn, bdPage >= bdTotal && s.pageBtnDisabled]}
              onPress={() => setBdPage(p => Math.min(bdTotal, p + 1))}
              disabled={bdPage >= bdTotal}
            >
              <Text style={[s.pageBtnText, bdPage >= bdTotal && s.pageBtnTextDisabled]}>Next</Text>
              <ChevronRight size={14} color={bdPage >= bdTotal ? N.border : N.mid} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Add Field Modal ── */}
      <AddFieldModal
        visible={!!addFieldTarget}
        onAdd={handleAddField}
        onClose={() => setAddFieldTarget(null)}
      />

      {/* ── Edit All Modal ── */}
      <EditAllModal
        visible={!!editRecord}
        record={editRecord?.record ?? null}
        labels={editRecord?.type === 'bd' ? BD_FIELD_LABELS : PRODUCT_FIELD_LABELS}
        onSave={saveEdit}
        onClose={() => setEditRecord(null)}
      />

      <AuditLogDrawer visible={auditVisible} onClose={() => setAuditVisible(false)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: { paddingHorizontal: 20, paddingTop: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 6 },
  headerTitle: { fontSize: 20, fontFamily: 'Poppins-Bold', color: COLORS.white },
  headerSub: { fontSize: 12, fontFamily: 'Poppins-Regular', color: COLORS.goldLight, marginTop: 2, opacity: 0.85 },
  headerGoldLine: { height: 2, backgroundColor: COLORS.gold, opacity: 0.5, marginTop: 16 },

  auditWrap: { position: 'relative' },
  auditBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: N.border,
    backgroundColor: N.cardBg,
  },
  tooltip: {
    position: 'absolute',
    bottom: 40,
    left: '50%',
    transform: [{ translateX: -36 }],
    backgroundColor: '#1a1a2e',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 99,
    alignItems: 'center',
    minWidth: 72,
  },
  tooltipText: { fontSize: 11, fontFamily: 'Poppins-Medium', color: '#fff', textAlign: 'center' },
  tooltipArrow: {
    position: 'absolute',
    bottom: -5,
    left: '50%',
    transform: [{ translateX: -5 }],
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#1a1a2e',
  },

  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  uploadText: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: '#fff' },

  filtersBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.cream,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexWrap: 'nowrap',
    zIndex: 10,
  },
  filtersSpacer: { flex: 1 },
  clearFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: N.redBg,
    borderWidth: 1,
    borderColor: N.redBdr,
  },
  clearFiltersText: { fontSize: 12, fontFamily: 'Poppins-Medium', color: N.red },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.cream,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabBtnActive: { borderBottomColor: COLORS.primary },
  tabLabel: { fontSize: 13, fontFamily: 'Poppins-Medium', color: N.faint },
  tabLabelActive: { color: COLORS.primary, fontFamily: 'Poppins-SemiBold' },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: N.cardBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: N.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: N.dark,
    paddingVertical: 0,
  },

  summaryBar: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  summaryText: { fontSize: 11, fontFamily: 'Poppins-Regular', color: N.faint },
  summaryCount: { fontFamily: 'Poppins-SemiBold', color: N.mid },

  cardList: { paddingHorizontal: 12, paddingBottom: 8 },

  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 13, fontFamily: 'Poppins-Medium', color: N.faint },

  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: N.cardBg,
    borderTopWidth: 1,
    borderTopColor: N.border,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: N.border,
    backgroundColor: N.cardBg,
  },
  pageBtnDisabled: { backgroundColor: N.headBg, borderColor: N.borderLt },
  pageBtnText: { fontSize: 12, fontFamily: 'Poppins-Medium', color: N.mid },
  pageBtnTextDisabled: { color: N.border },
  pageInfo: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: N.mid },
});
