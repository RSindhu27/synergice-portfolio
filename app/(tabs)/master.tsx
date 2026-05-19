import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, useWindowDimensions, Modal,
  Animated, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, X, ChevronLeft, ChevronRight, Upload, History, Pencil, Check, ChevronDown, Package, Briefcase, Clock, FileSpreadsheet, User, ArrowRight, Layers, Tag, MapPin, Building2, Activity } from 'lucide-react-native';
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

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({
  visible,
  fieldLabel,
  currentValue,
  onSave,
  onClose,
}: {
  visible: boolean;
  fieldLabel: string;
  currentValue: string;
  onSave: (val: string) => void;
  onClose: () => void;
}) {
  const [val, setVal] = useState(currentValue);
  useEffect(() => { setVal(currentValue); }, [currentValue]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={em.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1}>
          <View style={em.box}>
            <View style={em.header}>
              <Text style={em.title}>Edit Field</Text>
              <TouchableOpacity onPress={onClose} style={em.closeBtn}>
                <X size={16} color={N.muted} />
              </TouchableOpacity>
            </View>
            <Text style={em.label}>{fieldLabel}</Text>
            <TextInput
              style={em.input}
              value={val}
              onChangeText={setVal}
              autoFocus
              selectTextOnFocus
            />
            <View style={em.actions}>
              <TouchableOpacity style={em.cancelBtn} onPress={onClose}>
                <Text style={em.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={em.saveBtn} onPress={() => { onSave(val); onClose(); }}>
                <Check size={14} color="#fff" />
                <Text style={em.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const em = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  box: { backgroundColor: '#fff', borderRadius: 14, padding: 20, width: 320, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 20, shadowOffset: { width: 0, height: 8 } },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: N.dark },
  closeBtn: { padding: 4 },
  label: { fontSize: 11, fontFamily: 'Poppins-Medium', color: N.faint, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: N.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily: 'Poppins-Regular', color: N.dark, backgroundColor: N.headBg, marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 8, borderWidth: 1, borderColor: N.border },
  cancelText: { fontSize: 13, fontFamily: 'Poppins-Medium', color: N.muted },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 8, backgroundColor: COLORS.primary },
  saveText: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: '#fff' },
});

// ─── Audit Log Drawer ─────────────────────────────────────────────────────────
function AuditLogDrawer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);
  const { width: SW } = useWindowDimensions();
  const drawerW = Math.min(SW * 0.92, 480);

  useEffect(() => {
    if (visible) setMounted(true);
    Animated.spring(slideAnim, {
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start(() => {
      if (!visible) setMounted(false);
    });
  }, [visible]);

  const translateX = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [drawerW, 0] });

  if (!mounted) return null;

  const actionIcon = (a: AuditEntry['action']) => {
    if (a === 'upload') return <FileSpreadsheet size={15} color={N.blue} />;
    if (a === 'edit') return <Pencil size={15} color={N.amber} />;
    return <X size={15} color={N.red} />;
  };

  const actionColors = (a: AuditEntry['action']) => {
    if (a === 'upload') return { bg: N.blueBg, border: N.blueBdr, text: N.blue };
    if (a === 'edit') return { bg: N.amberBg, border: N.amberBdr, text: N.amber };
    return { bg: N.redBg, border: N.redBdr, text: N.red };
  };

  return (
    <Modal visible transparent animationType="none">
      <TouchableOpacity style={al.overlay} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[al.drawer, { width: drawerW, transform: [{ translateX }] }]}>
        {/* Header */}
        <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={al.drawerHeader}>
          <View style={al.drawerHeaderInner}>
            <View style={al.headerIconWrap}>
              <History size={18} color={COLORS.goldLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={al.drawerTitle}>Audit Log</Text>
              <Text style={al.drawerSub}>{auditLog.length} entries · All modules</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={al.closeBtn}>
              <X size={18} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={al.scroll} contentContainerStyle={al.scrollContent} showsVerticalScrollIndicator={false}>
          {auditLog.map((entry, idx) => {
            const ac = actionColors(entry.action);
            const isUpload = entry.action === 'upload';
            return (
              <View key={entry.id} style={al.entry}>
                {/* Timeline line */}
                {idx < auditLog.length - 1 && <View style={al.timelineLine} />}

                {/* Timeline dot */}
                <View style={[al.timelineDot, { backgroundColor: ac.bg, borderColor: ac.border }]}>
                  {actionIcon(entry.action)}
                </View>

                <View style={al.entryContent}>
                  {/* Top row */}
                  <View style={al.entryTop}>
                    <View style={[al.actionBadge, { backgroundColor: ac.bg, borderColor: ac.border }]}>
                      <Text style={[al.actionBadgeText, { color: ac.text }]}>
                        {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                      </Text>
                    </View>
                    <View style={[al.moduleBadge, { backgroundColor: entry.module === 'Products' ? N.greenBg : N.amberBg }]}>
                      <Text style={[al.moduleBadgeText, { color: entry.module === 'Products' ? N.green : N.amber }]}>
                        {entry.module}
                      </Text>
                    </View>
                    <Text style={al.timeAgo}>{timeAgo(entry.timestamp)}</Text>
                  </View>

                  {/* Record name */}
                  <Text style={al.entryName} numberOfLines={1}>
                    {isUpload ? entry.fileName : entry.recordName}
                  </Text>

                  {/* Meta row */}
                  <View style={al.entryMeta}>
                    <View style={al.metaItem}>
                      <User size={11} color={N.faint} />
                      <Text style={al.metaText}>{entry.user}</Text>
                    </View>
                    <View style={al.metaDivider} />
                    <View style={al.metaItem}>
                      <Clock size={11} color={N.faint} />
                      <Text style={al.metaText}>{formatTimestamp(entry.timestamp)}</Text>
                    </View>
                  </View>

                  {/* Upload stats */}
                  {isUpload && entry.rowsAffected !== undefined && (
                    <View style={al.uploadStats}>
                      <FileSpreadsheet size={13} color={N.blue} />
                      <Text style={al.uploadStatsText}>{entry.rowsAffected} rows imported successfully</Text>
                    </View>
                  )}

                  {/* Changes */}
                  {!isUpload && entry.changes.length > 0 && (
                    <View style={al.changesBox}>
                      <Text style={al.changesTitle}>Field Changes</Text>
                      {entry.changes.map((ch, ci) => (
                        <View key={ci} style={al.changeRow}>
                          <Text style={al.changeField} numberOfLines={1}>{ch.field}</Text>
                          <View style={al.changeArrow}>
                            <View style={al.changeBefore}>
                              <Text style={al.changeBeforeText} numberOfLines={1}>{ch.before}</Text>
                            </View>
                            <ArrowRight size={11} color={N.faint} />
                            <View style={al.changeAfter}>
                              <Text style={al.changeAfterText} numberOfLines={1}>{ch.after}</Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const al = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: N.pageBg,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: -4, height: 0 },
    elevation: 24,
  },
  drawerHeader: {
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  drawerHeaderInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  drawerTitle: { fontSize: 17, fontFamily: 'Poppins-Bold', color: '#fff' },
  drawerSub: { fontSize: 11, fontFamily: 'Poppins-Regular', color: 'rgba(255,255,255,0.65)', marginTop: 1 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 },
  entry: { flexDirection: 'row', gap: 12, marginBottom: 20, position: 'relative' },
  timelineLine: {
    position: 'absolute',
    left: 15,
    top: 36,
    width: 2,
    bottom: -20,
    backgroundColor: N.border,
    zIndex: 0,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
    zIndex: 1,
  },
  entryContent: {
    flex: 1,
    backgroundColor: N.cardBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: N.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  entryTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  actionBadge: {
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  actionBadgeText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  moduleBadge: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 },
  moduleBadgeText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  timeAgo: { fontSize: 10, fontFamily: 'Poppins-Regular', color: N.faint, marginLeft: 'auto' },
  entryName: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: N.dark, marginBottom: 6 },
  entryMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 10, fontFamily: 'Poppins-Regular', color: N.faint },
  metaDivider: { width: 3, height: 3, borderRadius: 2, backgroundColor: N.border },
  uploadStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: N.blueBg,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: N.blueBdr,
  },
  uploadStatsText: { fontSize: 11, fontFamily: 'Poppins-Medium', color: N.blue },
  changesBox: {
    backgroundColor: N.headBg,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: N.border,
    gap: 7,
  },
  changesTitle: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: N.faint, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  changeRow: { gap: 4 },
  changeField: { fontSize: 11, fontFamily: 'Poppins-Medium', color: N.mid },
  changeArrow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  changeBefore: { backgroundColor: N.redBg, borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: N.redBdr },
  changeBeforeText: { fontSize: 11, fontFamily: 'Poppins-Regular', color: N.red },
  changeAfter: { backgroundColor: N.greenBg, borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: N.greenBdr },
  changeAfterText: { fontSize: 11, fontFamily: 'Poppins-Regular', color: N.green },
});

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ item, labels, onEdit }: {
  item: MasterProduct;
  labels: typeof PRODUCT_FIELD_LABELS;
  onEdit: (field: string, label: string, value: string) => void;
}) {
  const sc = statusColor((item as any).fieldF);
  const dot = companyDot(item.company);
  const topFields: (keyof typeof labels)[] = ['fieldA', 'fieldB', 'fieldC', 'fieldD'];
  const midFields: (keyof typeof labels)[] = ['fieldE', 'fieldG', 'fieldH', 'fieldI'];
  const botFields: (keyof typeof labels)[] = ['fieldJ', 'fieldK', 'fieldL'];

  const FieldPill = ({ fkey }: { fkey: keyof typeof labels }) => (
    <View style={pc.pill}>
      <Text style={pc.pillLabel}>{labels[fkey]}</Text>
      <View style={pc.pillRow}>
        <Text style={pc.pillValue} numberOfLines={1}>{(item as any)[fkey]}</Text>
        <TouchableOpacity style={pc.editBtn} onPress={() => onEdit(fkey, labels[fkey], (item as any)[fkey])}>
          <Pencil size={10} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
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
        <View style={[pc.statusChip, { backgroundColor: sc.bg, borderColor: sc.border }]}>
          <Text style={[pc.statusText, { color: sc.text }]}>{item.fieldF}</Text>
        </View>
      </View>

      {/* Main fields grid */}
      <View style={pc.sectionDivider} />
      <View style={pc.fieldGrid}>
        {topFields.map(k => <FieldPill key={k} fkey={k} />)}
      </View>

      <View style={pc.sectionDivider} />
      <View style={pc.fieldGrid}>
        {midFields.map(k => <FieldPill key={k} fkey={k} />)}
      </View>

      <View style={pc.sectionDivider} />
      <View style={[pc.fieldGrid, pc.fieldGridBot]}>
        {botFields.map(k => <FieldPill key={k} fkey={k} />)}
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
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: N.headBg,
    borderBottomWidth: 1,
    borderBottomColor: N.border,
  },
  idBadge: { borderRadius: 7, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  idText: { fontSize: 10, fontFamily: 'Poppins-Bold', letterSpacing: 0.3 },
  productName: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: N.dark, marginBottom: 2 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  subText: { fontSize: 10, fontFamily: 'Poppins-Regular', color: N.faint },
  statusChip: { borderRadius: 7, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  statusText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  sectionDivider: { height: 1, backgroundColor: N.borderLt, marginHorizontal: 14 },
  fieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 0,
  },
  fieldGridBot: {},
  pill: {
    width: '50%',
    paddingHorizontal: 4,
    paddingVertical: 5,
  },
  pillLabel: { fontSize: 9, fontFamily: 'Poppins-Medium', color: N.faint, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pillValue: { flex: 1, fontSize: 12, fontFamily: 'Poppins-SemiBold', color: N.dark },
  editBtn: {
    width: 20,
    height: 20,
    borderRadius: 5,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
});

// ─── BD Card ──────────────────────────────────────────────────────────────────
function BDCard({ item, labels, onEdit }: {
  item: BDRecord;
  labels: typeof BD_FIELD_LABELS;
  onEdit: (field: string, label: string, value: string) => void;
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
          <View style={[bd.statusChip, { backgroundColor: sc.bg, borderColor: sc.border }]}>
            <Text style={[bd.statusText, { color: sc.text }]}>{item.fieldD}</Text>
          </View>
        </View>

        {/* Field cards row */}
        <View style={bd.fieldsRow}>
          {(Object.keys(labels) as (keyof typeof labels)[]).map(k => (
            <View key={k} style={bd.fieldCard}>
              <View style={bd.fieldCardTop}>
                {ICONS[k]}
                <Text style={bd.fieldCardLabel}>{labels[k]}</Text>
                <TouchableOpacity style={bd.editBtn} onPress={() => onEdit(k, labels[k], (item as any)[k])}>
                  <Pencil size={9} color={COLORS.primary} />
                </TouchableOpacity>
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
  accent: { width: 4, flexShrink: 0 },
  inner: { flex: 1, padding: 14 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  name: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: N.dark, marginBottom: 2 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  sub: { fontSize: 10, fontFamily: 'Poppins-Regular', color: N.faint },
  statusChip: { borderRadius: 7, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  statusText: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  fieldsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  editBtn: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
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

  const [editState, setEditState] = useState<{ field: string; label: string; value: string } | null>(null);
  const [products, setProducts] = useState<MasterProduct[]>(masterProducts);
  const [bdItems, setBdItems] = useState<BDRecord[]>(masterBD);

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
  const openEdit = (field: string, label: string, value: string) => {
    setEditState({ field, label, value });
  };

  const saveEdit = (newVal: string) => {
    if (!editState) return;
    // In a real app this would update the DB. For now we update local state.
    // We do nothing here since we don't know which record triggered it.
    // In production, pass recordId through.
  };

  // Audit button hover state (web)
  const [auditHovered, setAuditHovered] = useState(false);

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Combined header + filters bar ── */}
      <View style={s.filtersBar}>
        <View style={s.pageTitleWrap}>
          <Text style={s.pageTitle}>Master Data</Text>
        </View>
        <Dropdown label="Select Company" value={filterCompany} options={COMPANIES} onChange={v => { setFilterCompany(v); setProdPage(1); setBdPage(1); }} />
        <Dropdown label="Select Region" value={filterRegion} options={MASTER_REGIONS} onChange={v => { setFilterRegion(v); setProdPage(1); setBdPage(1); }} />
        {(filterCompany || filterRegion) && (
          <TouchableOpacity style={s.clearFilters} onPress={() => { setFilterCompany(''); setFilterRegion(''); }}>
            <X size={13} color={N.red} />
            <Text style={s.clearFiltersText}>Clear</Text>
          </TouchableOpacity>
        )}
        <View style={s.filtersSpacer} />
        {/* Audit Log button */}
        <TouchableOpacity
          style={[s.auditBtn, auditHovered && s.auditBtnHover]}
          onPress={() => setAuditVisible(true)}
          onPressIn={() => setAuditHovered(true)}
          onPressOut={() => setAuditHovered(false)}
        >
          <History size={15} color={auditHovered ? COLORS.primary : N.muted} />
          {auditHovered && (
            <Text style={s.auditBtnText}>Audit Log</Text>
          )}
        </TouchableOpacity>
        {/* Upload Excel */}
        <TouchableOpacity style={s.uploadBtn}>
          <Upload size={14} color="#fff" />
          <Text style={s.uploadText}>Upload Excel</Text>
        </TouchableOpacity>
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
        <View style={s.tabBarFill} />
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
                  onEdit={openEdit}
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
                  onEdit={openEdit}
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

      {/* ── Modals ── */}
      {editState && (
        <EditModal
          visible={!!editState}
          fieldLabel={editState.label}
          currentValue={editState.value}
          onSave={saveEdit}
          onClose={() => setEditState(null)}
        />
      )}

      <AuditLogDrawer visible={auditVisible} onClose={() => setAuditVisible(false)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: N.pageBg },

  pageTitleWrap: { justifyContent: 'center', marginRight: 4 },
  pageTitle: { fontSize: 15, fontFamily: 'Poppins-Bold', color: N.dark },

  auditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: N.border,
    backgroundColor: N.cardBg,
    minWidth: 36,
    justifyContent: 'center',
  },
  auditBtnHover: {
    borderColor: COLORS.primary + '60',
    backgroundColor: COLORS.primary + '08',
  },
  auditBtnText: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: COLORS.primary },

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
    backgroundColor: N.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: N.border,
    flexWrap: 'wrap',
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
    backgroundColor: N.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: N.border,
  },
  tabBarFill: { flex: 1 },
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
