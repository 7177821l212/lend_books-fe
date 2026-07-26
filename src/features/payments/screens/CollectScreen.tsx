/**
 * CollectScreen — paid/missed toggle, quick-amount chips, mode picker.
 */
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import {
  Banknote,
  Building2,
  Camera,
  Check,
  ChevronLeft,
  RefreshCw,
  Smartphone,
  X,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CollectorStackParamList } from '@/app/navigation/TodayNavigator';
import {
  Avatar,
  Button,
  Card,
  GradientBackground,
  IconButton,
  Screen,
  SkeletonLoader,
  Text,
  useToast,
} from '@/components/ui';
import { useLoan } from '@/features/loans/hooks/useLoans';
import { useCollect, useMarkMissed } from '@/features/payments/hooks/usePayments';
import { useT } from '@/i18n';
import { uploadPhoto } from '@/lib/uploadPhoto';
import { useColors, fontFamily, layout, radii, spacing } from '@/theme';
import type { PaymentMode } from '@/types';

type Nav = NativeStackNavigationProp<CollectorStackParamList, 'Collect'>;
type Route = RouteProp<CollectorStackParamList, 'Collect'>;

const MODE_ICONS: Record<PaymentMode, typeof Banknote> = {
  CASH: Banknote, UPI: Smartphone, BANK: Building2,
};

const MISSED_REASONS = [
  'Customer unavailable',
  'Customer refused',
  'Shop closed',
  'Promised later',
  'Wrong address',
  'Medical issue',
  'Other',
] as const;

type MissedReason = typeof MISSED_REASONS[number];

export function CollectScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const REASON_LABEL: Record<MissedReason, string> = {
    'Customer unavailable': t('customer_unavailable'),
    'Customer refused': t('customer_refused'),
    'Shop closed': t('shop_closed'),
    'Promised later': t('promised_later'),
    'Wrong address': t('wrong_address'),
    'Medical issue': t('medical_issue'),
    'Other': t('other'),
  };
  const nav = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const toast = useToast();
  const { data: loan } = useLoan(params.loanId);
  const collect = useCollect();
  const markMissed = useMarkMissed();

  const targetInstallment = useMemo(() => {
    if (!loan) return undefined;
    if (params.scheduleId)
      return loan.installments?.find((i) => i.id === params.scheduleId);
    return loan.installments?.find(
      (i) =>
        i.status === 'pending' ||
        i.status === 'partial' ||
        i.status === 'overdue' ||
        i.status === 'due_today'
    );
  }, [loan, params.scheduleId]);

  const targetRemaining = targetInstallment
    ? targetInstallment.due_amount - targetInstallment.paid_amount
    : loan?.installment_amount ?? 0;

  const [mode, setMode] = useState<'PAID' | 'MISSED'>('PAID');
  const [amount, setAmount] = useState<string>(targetRemaining ? String(targetRemaining) : '');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [notes, setNotes] = useState<string>('');
  const [reason, setReason] = useState<string>(MISSED_REASONS[0]);
  const [proofUri, setProofUri] = useState<string | undefined>(undefined);
  const [uploadingProof, setUploadingProof] = useState(false);

  const captureProof = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      toast.warning('Camera permission needed to capture proof');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled) setProofUri(result.assets[0].uri);
  };

  const submit = async () => {
    if (!loan || !targetInstallment) return;
    try {
      if (mode === 'PAID') {
        const amt = parseInt(amount, 10);
        if (!Number.isFinite(amt) || amt <= 0) {
          toast.warning('Enter a valid amount');
          return;
        }
        let proofObjectName: string | undefined;
        if (proofUri) {
          setUploadingProof(true);
          try {
            const uploaded = await uploadPhoto(proofUri);
            proofObjectName = uploaded.objectName;
          } finally {
            setUploadingProof(false);
          }
        }
        await collect.mutateAsync({
          loan_id: loan.id,
          amount: amt,
          mode: paymentMode,
          schedule_id: targetInstallment.id,
          notes: notes.trim() || undefined,
          proof_photo_url: proofObjectName,
        });
        toast.success(`Collected ₹${amt.toLocaleString('en-IN')}`);
      } else {
        await markMissed.mutateAsync({
          loan_id: loan.id,
          schedule_id: targetInstallment.id,
          reason,
          notes: notes.trim() || undefined,
        });
        toast.info('Marked missed');
      }
      nav.goBack();
    } catch (e) {
      const detail =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Could not save entry';
      toast.error(typeof detail === 'string' ? detail : 'Failed');
    }
  };

  if (!loan || !targetInstallment) {
    return <CollectSkeleton insetsTop={insets.top} onBack={() => nav.goBack()} />;
  }

  return (
    <Screen padded={false} background="default" edges={[]} scroll={false}>
      <GradientBackground
        gradient="hero"
        style={{
          paddingTop: insets.top + spacing[2],
          paddingHorizontal: layout.screenPaddingX,
          paddingBottom: spacing[5],
          borderBottomLeftRadius: radii['3xl'],
          borderBottomRightRadius: radii['3xl'],
        }}
      >
        <View style={styles.topRow}>
          <IconButton
            icon={<ChevronLeft size={20} color={colors.white} />}
            variant="glass"
            onPress={() => nav.goBack()}
            accessibilityLabel="Back"
          />
          <View style={{ flex: 1, marginLeft: spacing[2] }}>
            <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
              {t('collect').toUpperCase()}
            </Text>
            <Text variant="title" color="onDark" numberOfLines={1}>
              {loan.customer_name}
            </Text>
          </View>
        </View>

        <View style={styles.heroRow}>
          <Avatar
            name={loan.customer_name}
            id={loan.customer_id}
            size="lg"
            ring="none"
          />
          <View style={{ flex: 1, marginLeft: spacing[3] }}>
            <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
              {t('installment').toUpperCase()} #{targetInstallment.sequence}
            </Text>
            <Text variant="h2" color="onDark">
              ₹{targetRemaining.toLocaleString('en-IN')}
            </Text>
            <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
              Due {targetInstallment.due_date}
            </Text>
          </View>
        </View>
      </GradientBackground>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.toggleRow}>
            <Pressable
              onPress={() => setMode('PAID')}
              style={[
                styles.toggle,
                { backgroundColor: colors.card, borderColor: colors.border.default },
                mode === 'PAID' && { backgroundColor: colors.success, borderColor: colors.success },
              ]}
            >
              <Check size={16} color={mode === 'PAID' ? colors.white : colors.success} />
              <Text
                variant="bodyStrong"
                color={mode === 'PAID' ? 'onBrand' : colors.success}
                style={{ marginLeft: 6 }}
              >
                {t('collected')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode('MISSED')}
              style={[
                styles.toggle,
                { backgroundColor: colors.card, borderColor: colors.border.default },
                mode === 'MISSED' && { backgroundColor: colors.danger, borderColor: colors.danger },
              ]}
            >
              <X size={16} color={mode === 'MISSED' ? colors.white : colors.danger} />
              <Text
                variant="bodyStrong"
                color={mode === 'MISSED' ? 'onBrand' : colors.danger}
                style={{ marginLeft: 6 }}
              >
                {t('missed')}
              </Text>
            </Pressable>
          </View>

          {mode === 'PAID' ? (
            <>
              <Card padding={4} style={styles.section}>
                <Text variant="caption" color="secondary" style={{ marginBottom: spacing[2] }}>
                  {t('amount').toUpperCase()}
                </Text>
                <View style={styles.amountWrap}>
                  <Text color="secondary" style={styles.amountSymbol}>₹</Text>
                  <TextInput
                    style={[styles.amountInput, { color: colors.text.primary }]}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    selectionColor={colors.brand[600]}
                  />
                </View>
                <View style={styles.chipRow}>
                  {[
                    { label: 'Full', value: targetRemaining },
                    { label: '½', value: Math.round(targetRemaining / 2) },
                    { label: 'All loan', value: loan.outstanding },
                  ].map((c) => (
                    <Pressable
                      key={c.label}
                      onPress={() => setAmount(String(c.value))}
                      style={[styles.chip, { backgroundColor: colors.slate[50] }]}
                    >
                      <Text variant="label" color="secondary">
                        {c.label}
                      </Text>
                      <Text variant="caption" color="tertiary">
                        ₹{c.value.toLocaleString('en-IN')}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Card>

              <Card padding={4} style={styles.section}>
                <Text variant="caption" color="secondary" style={{ marginBottom: spacing[2] }}>
                  {t('payment_mode').toUpperCase()}
                </Text>
                <View style={styles.modeRow}>
                  {([
                    { key: 'CASH' as PaymentMode, label: t('cash') },
                    { key: 'UPI' as PaymentMode, label: t('upi') },
                    { key: 'BANK' as PaymentMode, label: t('bank') },
                  ] as const).map((m) => {
                    const Icon = MODE_ICONS[m.key];
                    const selected = paymentMode === m.key;
                    return (
                      <Pressable
                        key={m.key}
                        onPress={() => setPaymentMode(m.key)}
                        style={[
                          styles.modeCard,
                          { backgroundColor: colors.slate[50] },
                          selected && {
                            backgroundColor: colors.brand[50],
                            borderColor: colors.brand[600],
                          },
                        ]}
                      >
                        <Icon
                          size={20}
                          color={selected ? colors.brand[600] : colors.slate[400]}
                        />
                        <Text
                          variant="label"
                          color={selected ? 'primary' : 'secondary'}
                          style={{ marginTop: 6 }}
                        >
                          {m.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Card>

              <Card padding={4} style={styles.section}>
                <Text variant="caption" color="secondary" style={{ marginBottom: spacing[2] }}>
                  {t('notes').toUpperCase()} (OPTIONAL)
                </Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Anything to add?"
                  placeholderTextColor={colors.text.placeholder}
                  style={[
                    styles.notesInput,
                    { color: colors.text.primary, backgroundColor: colors.slate[50] },
                  ]}
                  multiline
                />
              </Card>

              <Card padding={4} style={styles.section}>
                <Text variant="caption" color="secondary" style={{ marginBottom: spacing[2] }}>
                  PROOF OF PAYMENT (OPTIONAL)
                </Text>
                {proofUri ? (
                  <View style={styles.proofPreviewWrap}>
                    <Image source={{ uri: proofUri }} style={styles.proofPreview} />
                    <Pressable
                      onPress={() => void captureProof()}
                      style={[styles.proofRetakeBtn, { backgroundColor: colors.card }]}
                    >
                      <RefreshCw size={14} color={colors.brand[600]} />
                      <Text variant="label" style={{ color: colors.brand[600], marginLeft: 4 }}>
                        Retake
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setProofUri(undefined)}
                      style={[styles.proofRemoveBtn, { backgroundColor: colors.card }]}
                      hitSlop={8}
                    >
                      <X size={14} color={colors.danger} />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => void captureProof()}
                    style={[styles.proofCaptureBtn, { borderColor: colors.border.default }]}
                  >
                    <Camera size={20} color={colors.brand[600]} />
                    <Text variant="label" style={{ color: colors.brand[600], marginTop: spacing[1] }}>
                      Capture photo proof
                    </Text>
                    <Text variant="caption" color="tertiary" style={{ marginTop: 2 }}>
                      e.g. cash in hand, receipt, UPI screen
                    </Text>
                  </Pressable>
                )}
              </Card>
            </>
          ) : (
            <>
              <Card padding={4} style={styles.section}>
                <Text variant="caption" color="secondary" style={{ marginBottom: spacing[2] }}>
                  {t('why_missed').toUpperCase()}
                </Text>
                <View style={{ gap: spacing[2] }}>
                  {MISSED_REASONS.map((r) => {
                    const selected = reason === r;
                    return (
                      <Pressable
                        key={r}
                        onPress={() => setReason(r)}
                        style={[
                          styles.reasonRow,
                          { backgroundColor: colors.slate[50] },
                          selected && {
                            backgroundColor: colors.brand[50],
                            borderColor: colors.brand[600],
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.radio,
                            { borderColor: colors.slate[300] },
                            selected && { borderColor: colors.brand[600] },
                          ]}
                        >
                          {selected ? (
                            <View style={[styles.radioDot, { backgroundColor: colors.brand[600] }]} />
                          ) : null}
                        </View>
                        <Text variant="body" style={{ marginLeft: spacing[2] }}>
                          {REASON_LABEL[r]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Card>

              <Card padding={4} style={styles.section}>
                <Text variant="caption" color="secondary" style={{ marginBottom: spacing[2] }}>
                  {t('notes').toUpperCase()}
                </Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add detail…"
                  placeholderTextColor={colors.text.placeholder}
                  style={[
                    styles.notesInput,
                    { color: colors.text.primary, backgroundColor: colors.slate[50] },
                  ]}
                  multiline
                />
              </Card>
            </>
          )}

          <Button
            label={mode === 'PAID' ? t('save_collection') : t('mark_as_missed')}
            fullWidth
            size="lg"
            variant={mode === 'PAID' ? 'primary' : 'danger'}
            loading={collect.isPending || markMissed.isPending || uploadingProof}
            onPress={submit}
            hapticFeedback={mode === 'PAID' ? 'success' : 'medium'}
            style={{ marginTop: spacing[5] }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/** Mirrors the loaded screen's shape: gradient hero, toggle row, amount + mode cards. */
function CollectSkeleton({ insetsTop, onBack }: { insetsTop: number; onBack: () => void }) {
  const colors = useColors();
  return (
    <Screen padded={false} background="default" edges={[]} scroll={false}>
      <GradientBackground
        gradient="hero"
        style={{
          paddingTop: insetsTop + spacing[2],
          paddingHorizontal: layout.screenPaddingX,
          paddingBottom: spacing[5],
          borderBottomLeftRadius: radii['3xl'],
          borderBottomRightRadius: radii['3xl'],
        }}
      >
        <View style={styles.topRow}>
          <IconButton
            icon={<ChevronLeft size={20} color={colors.white} />}
            variant="glass"
            onPress={onBack}
            accessibilityLabel="Back"
          />
          <View style={{ flex: 1, marginLeft: spacing[2], gap: spacing[1.5] }}>
            <SkeletonLoader width={70} height={10} delay={0} />
            <SkeletonLoader width="50%" height={16} delay={1} />
          </View>
        </View>

        <View style={styles.heroRow}>
          <SkeletonLoader width={48} height={48} radius={radii.full} />
          <View style={{ flex: 1, marginLeft: spacing[3], gap: spacing[1.5] }}>
            <SkeletonLoader width={90} height={10} delay={0} />
            <SkeletonLoader width={120} height={26} delay={1} />
            <SkeletonLoader width={80} height={10} delay={2} />
          </View>
        </View>
      </GradientBackground>

      <View style={{ padding: layout.screenPaddingX }}>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <SkeletonLoader width="100%" height={48} radius={radii.lg} delay={0} />
          </View>
          <View style={{ flex: 1 }}>
            <SkeletonLoader width="100%" height={48} radius={radii.lg} delay={1} />
          </View>
        </View>
        <Card padding={4} style={styles.section}>
          <SkeletonLoader width={60} height={11} style={{ marginBottom: spacing[2] }} />
          <SkeletonLoader width="50%" height={36} />
        </Card>
        <Card padding={4} style={styles.section}>
          <SkeletonLoader width={100} height={11} style={{ marginBottom: spacing[2] }} />
          <View style={{ flexDirection: 'row', gap: spacing[2] }}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={{ flex: 1 }}>
                <SkeletonLoader width="100%" height={64} radius={radii.lg} delay={i} />
              </View>
            ))}
          </View>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center' },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[4],
  },
  body: { padding: layout.screenPaddingX, paddingBottom: spacing[16] },
  toggleRow: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[3] },
  toggle: {
    flex: 1,
    height: 48,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginBottom: spacing[3] },
  proofCaptureBtn: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: radii.lg,
    paddingVertical: spacing[5],
    alignItems: 'center',
  },
  proofPreviewWrap: { position: 'relative' },
  proofPreview: {
    width: '100%',
    height: 180,
    borderRadius: radii.lg,
  },
  proofRetakeBtn: {
    position: 'absolute',
    bottom: spacing[2],
    left: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1.5],
    borderRadius: radii.full,
  },
  proofRemoveBtn: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    width: 28,
    height: 28,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: spacing[1],
  },
  amountSymbol: {
    fontFamily: fontFamily.semibold,
    fontSize: 28,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontFamily: fontFamily.bold,
    fontSize: 36,
    padding: 0,
  },
  chipRow: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[3] },
  chip: {
    flex: 1,
    borderRadius: radii.md,
    padding: spacing[2],
    alignItems: 'center',
  },
  modeRow: { flexDirection: 'row', gap: spacing[2] },
  modeCard: {
    flex: 1,
    padding: spacing[3],
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  notesInput: {
    minHeight: 64,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    textAlignVertical: 'top',
    borderRadius: radii.md,
    padding: spacing[3],
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
