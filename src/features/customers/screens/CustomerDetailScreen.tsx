import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import {
  Ban,
  Camera,
  CheckCircle,
  Edit2,
  FileText,
  MessageSquare,
  Phone,
  Plus,
  Trash2,
  X,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  KeyboardAvoidingView,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CustomersStackParamList } from '@/app/navigation/CustomersNavigator';
import type { CustomerDocument } from '@/features/customers/api/customerApi';
import {
  AmountText,
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  GradientBackground,
  IconButton,
  Screen,
  SkeletonLoader,
  Text,
  useToast,
} from '@/components/ui';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useT } from '@/i18n';
import { uploadPhoto } from '@/lib/uploadPhoto';
import { useSignedUrl } from '@/hooks/useSignedUrl';
import {
  useBlacklistCustomer,
  useCustomer,
  useCustomerDocuments,
  useDeleteCustomer,
  useUnblacklistCustomer,
  useUpdateCustomer,
  useUploadDocument,
} from '@/features/customers/hooks/useCustomers';
import { useCustomerLoans } from '@/features/loans/hooks/useLoans';
import { useColors, fontFamily, layout, radii, spacing } from '@/theme';
import { LoanListItem } from '@/features/loans/components/LoanListItem';

type Nav = NativeStackNavigationProp<CustomersStackParamList, 'CustomerDetail'>;
type Route = RouteProp<CustomersStackParamList, 'CustomerDetail'>;

const RISK_TONE = { low: 'success', medium: 'warning', high: 'danger' } as const;
const DOC_TYPES = ['ID Proof', 'Address Proof', 'Signed Agreement', 'Other'] as const;

export function CustomerDetailScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { user } = useAuth();
  const colors = useColors();
  const toast = useToast();
  const isInvestor = user?.role === 'investor';

  const { data: customer, isLoading } = useCustomer(params.id);
  const { data: documents } = useCustomerDocuments(params.id);
  const { data: loansPage } = useCustomerLoans(params.id);
  const blacklist = useBlacklistCustomer();
  const unblacklist = useUnblacklistCustomer();
  const deleteCustomer = useDeleteCustomer();
  const upload = useUploadDocument(params.id);
  const updateCustomer = useUpdateCustomer(params.id);
  const loans = loansPage?.items ?? [];
  const [blacklistReason, setBlacklistReason] = useState('');
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<CustomerDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [customerPhotoPreviewUrl, setCustomerPhotoPreviewUrl] = useState<string | undefined>();
  const activeLoans = loans.filter((l) => l.status === 'active' || l.status === 'overdue');
  const closedLoans = loans.filter((l) => l.status === 'closed');
  const requestedPreviewUrl = useSignedUrl(previewDocument?.file_url);
  const activePreviewUrl = previewUrl ?? requestedPreviewUrl;

  // When reached via a cross-tab deep link (e.g. Reports' overdue/blacklisted
  // lists), this screen may be the only entry in the Customers stack —
  // navigate('CustomerList') would then push a NEW list screen instead of
  // popping back to one, leaving a phantom entry that a second back-press
  // loops back into. Prefer a true pop when history exists.
  const goBackOrToList = () => {
    if (nav.canGoBack()) {
      nav.goBack();
    } else {
      nav.navigate('CustomerList');
    }
  };

  if (isLoading || !customer) {
    return <CustomerDetailSkeleton insetsTop={insets.top} onBack={goBackOrToList} />;
  }

  const handleBlacklist = async () => {
    const reason = blacklistReason.trim() || 'Flagged by investor';
    try {
      await blacklist.mutateAsync({ id: customer.id, reason });
      setShowBlacklistModal(false);
      setBlacklistReason('');
      toast.success('Customer blacklisted');
    } catch {
      toast.error('Could not blacklist');
    }
  };

  const handleUnblacklist = async () => {
    try {
      await unblacklist.mutateAsync(customer.id);
      toast.success('Customer removed from blacklist');
    } catch {
      toast.error('Could not unblacklist');
    }
  };

  const handleUploadDoc = async (docType: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;

      const file = result.assets[0];
      await upload.mutateAsync({
        doc_type: docType,
        local_uri: file.uri,
        filename: file.name,
        mime_type: file.mimeType ?? undefined,
      });
      toast.success(`${docType} uploaded`);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      toast.error(message || 'Upload failed. Please try again.');
    }
  };

  const handlePhotoUpload = () => {
    const doGallery = async () => {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { toast.warning('Gallery permission needed'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [1, 1],
      });
      if (!result.canceled) {
        const { objectName, signedUrl } = await uploadPhoto(result.assets[0].uri);
        await updateCustomer.mutateAsync({ photo_url: objectName });
        setCustomerPhotoPreviewUrl(signedUrl);
        toast.success('Photo updated');
      }
    };

    const doCamera = async () => {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) { toast.warning('Camera permission needed'); return; }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [1, 1],
      });
      if (!result.canceled) {
        const { objectName, signedUrl } = await uploadPhoto(result.assets[0].uri);
        await updateCustomer.mutateAsync({ photo_url: objectName });
        setCustomerPhotoPreviewUrl(signedUrl);
        toast.success('Photo updated');
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Take Photo', 'Choose from Gallery'], cancelButtonIndex: 0 },
        (idx) => { if (idx === 1) void doCamera(); if (idx === 2) void doGallery(); }
      );
    } else {
      Alert.alert('Upload photo', 'Choose source', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => void doCamera() },
        { text: 'Gallery', onPress: () => void doGallery() },
      ]);
    }
  };

  return (
    <Screen padded={false} background="default" edges={[]} scroll>
      <GradientBackground
        gradient="hero"
        style={{
          paddingTop: insets.top + spacing[2],
          paddingHorizontal: layout.screenPaddingX,
          paddingBottom: spacing[6],
          borderBottomLeftRadius: radii['3xl'],
          borderBottomRightRadius: radii['3xl'],
        }}
      >
        <View style={styles.topRow}>
          <IconButton
            icon={<Text variant="h2" color="onDark" style={{ marginTop: -2 }}>‹</Text>}
            variant="glass"
            size="md"
            onPress={goBackOrToList}
            accessibilityLabel="Back"
          />
          {isInvestor ? (
            <IconButton
              icon={<Edit2 size={16} color="#fff" />}
              variant="glass"
              size="md"
              onPress={() => nav.navigate('EditCustomer', { id: customer.id })}
              accessibilityLabel="Edit customer"
            />
          ) : null}
        </View>

        <View style={styles.heroRow}>
          <TouchableOpacity onPress={isInvestor ? handlePhotoUpload : undefined} activeOpacity={isInvestor ? 0.7 : 1}>
            <View style={{ position: 'relative' }}>
              <Avatar
                name={customer.name}
                id={customer.id}
                imageUrl={customerPhotoPreviewUrl ?? customer.photo_url}
                size="2xl"
                ring={customer.is_blacklisted ? 'danger' : 'none'}
              />
              {isInvestor ? (
                <View style={[styles.cameraOverlay, { backgroundColor: colors.brand[600] }]}>
                  <Camera size={12} color="#fff" />
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: spacing[4], minWidth: 0 }}>
            <Text variant="h2" color="onDark" numberOfLines={1}>
              {customer.name}
            </Text>
            <View style={styles.heroSub}>
              <Phone size={12} color="rgba(255,255,255,0.7)" />
              <Text variant="caption" color="onDark" style={{ marginLeft: 6, opacity: 0.85 }}>
                {customer.phone}
              </Text>
            </View>
            {customer.location ? (
              <Text variant="caption" color="onDark" style={{ opacity: 0.7, marginTop: 4 }}>
                {customer.location}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.outstandingPanel}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
                {t('outstanding').toUpperCase()}
              </Text>
              <AmountText
                value={customer.total_outstanding}
                size="2xl"
                color="#fff"
                short
              />
            </View>
            <View style={{ flexDirection: 'row', gap: spacing[2] }}>
              <IconButton
                icon={<Phone size={18} color="#fff" />}
                variant="glass"
                tone="onDark"
                onPress={() => Linking.openURL(`tel:${customer.phone}`)}
                accessibilityLabel="Call"
              />
              <IconButton
                icon={<MessageSquare size={18} color="#fff" />}
                variant="glass"
                tone="onDark"
                onPress={() => Linking.openURL(`sms:${customer.phone}`)}
                accessibilityLabel="SMS"
              />
            </View>
          </View>
        </View>
      </GradientBackground>

      <View style={{ padding: layout.screenPaddingX }}>
        {customer.is_blacklisted ? (
          <Card padding={3} style={[styles.blacklistBanner, { backgroundColor: colors.dangerSoft }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ban size={18} color={colors.danger} />
              <View style={{ marginLeft: spacing[2], flex: 1 }}>
                <Text variant="bodyStrong" style={{ color: colors.danger }}>
                  {t('blacklisted')}
                </Text>
                {customer.blacklist_reason ? (
                  <Text variant="caption" style={{ color: colors.danger, opacity: 0.85 }}>
                    {customer.blacklist_reason}
                  </Text>
                ) : null}
              </View>
              {isInvestor ? (
                <Button
                  label={t('unblacklist')}
                  variant="ghost"
                  size="sm"
                  loading={unblacklist.isPending}
                  onPress={handleUnblacklist}
                  leadingIcon={<CheckCircle size={14} color={colors.success} />}
                />
              ) : null}
            </View>
          </Card>
        ) : null}

        <View style={styles.kpiRow}>
          <Card padding={3} style={styles.kpi}>
            <Text variant="h2">{customer.active_loan_count}</Text>
            <Text variant="overline" color="tertiary">{t('active')}</Text>
          </Card>
          <Card padding={3} style={styles.kpi}>
            <Text variant="h2">{closedLoans.length}</Text>
            <Text variant="overline" color="tertiary">{t('status_closed')}</Text>
          </Card>
          <Card padding={3} style={styles.kpi}>
            <Badge
              label={customer.risk_level}
              tone={RISK_TONE[customer.risk_level]}
              size="md"
              uppercase
            />
            <Text variant="overline" color="tertiary" style={{ marginTop: 6 }}>{t('risk')}</Text>
          </Card>
        </View>

        <View style={styles.sectionRow}>
          <Text variant="title">{t('loans')}</Text>
          {isInvestor && !customer.is_blacklisted ? (
            <Button
              label={t('new')}
              variant="ghost"
              size="sm"
              leadingIcon={<Plus size={14} color={colors.brand[700]} />}
              onPress={() => nav.navigate('NewLoan', { customerId: customer.id })}
            />
          ) : null}
        </View>
        {loans.length === 0 ? (
          <EmptyState
            icon={<FileText size={24} color={colors.brand[700]} />}
            title={t('no_loans_yet')}
            description={t('no_loans_desc')}
          />
        ) : (
          <View>
            {[...activeLoans, ...closedLoans].map((loan) => (
              <LoanListItem
                key={loan.id}
                loan={loan}
                onPress={() => nav.navigate('LoanDetail', { id: loan.id })}
              />
            ))}
          </View>
        )}

        <View style={styles.sectionRow}>
          <Text variant="title">{t('documents')}</Text>
        </View>
        <View style={styles.docGrid}>
          {DOC_TYPES.map((label) => (
            <DocTile
              key={label}
              label={label}
              existing={documents?.find((d) => d.doc_type === label)}
              canUpload={isInvestor}
              isUploading={upload.isPending}
              onUpload={() => handleUploadDoc(label)}
              onOpen={(document, url) => {
                setPreviewDocument(document);
                setPreviewUrl(url);
              }}
            />
          ))}
        </View>

        {isInvestor && !customer.is_blacklisted ? (
          <Button
            label={t('blacklist')}
            variant="danger"
            fullWidth
            size="lg"
            onPress={() => setShowBlacklistModal(true)}
            leadingIcon={<Ban size={16} color="#fff" />}
            style={{ marginTop: spacing[6] }}
          />
        ) : null}

        <Modal
          visible={previewDocument !== null}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setPreviewDocument(null);
            setPreviewUrl(undefined);
          }}
        >
          <View style={styles.previewOverlay}>
            <View style={[styles.previewSheet, { backgroundColor: colors.card }]}>
              <View style={styles.previewHeader}>
                <View style={{ flex: 1 }}>
                  <Text variant="title">{previewDocument?.doc_type}</Text>
                  <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                    {previewDocument?.file_url.split('/').pop()}
                  </Text>
                </View>
                <IconButton
                  icon={<X size={20} color={colors.text.primary} />}
                  onPress={() => {
                    setPreviewDocument(null);
                    setPreviewUrl(undefined);
                  }}
                  accessibilityLabel="Close document preview"
                />
              </View>
              {activePreviewUrl && isImageDocument(previewDocument?.file_url) ? (
                <Image source={{ uri: activePreviewUrl }} resizeMode="contain" style={styles.previewImage} />
              ) : (
                <View style={[styles.previewUnavailable, { backgroundColor: colors.slate[100] }]}>
                  <FileText size={40} color={colors.brand[700]} />
                  <Text variant="bodyStrong" style={{ marginTop: spacing[3] }}>
                    Preview is not available for this file type
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {isInvestor ? (
          <Button
            label={t('delete_customer')}
            variant="danger"
            fullWidth
            size="lg"
            leadingIcon={<Trash2 size={16} color="#fff" />}
            loading={deleteCustomer.isPending}
            style={{ marginTop: spacing[2] }}
            onPress={() => {
              if (Platform.OS === 'ios' || Platform.OS === 'android') {
                Alert.alert(
                  t('delete_customer'),
                  `${t('delete_customer_warn')}\n\n${t('cannot_undo')}`,
                  [
                    { text: t('cancel'), style: 'cancel' },
                    {
                      text: t('delete'),
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          await deleteCustomer.mutateAsync(customer.id);
                          toast.success('Customer deleted');
                          nav.navigate('CustomerList');
                        } catch (e) {
                          const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed';
                          toast.error(typeof detail === 'string' ? detail : 'Failed');
                        }
                      },
                    },
                  ]
                );
              }
            }}
          />
        ) : null}

        {/* Blacklist reason modal */}
        <Modal
          visible={showBlacklistModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowBlacklistModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardAvoider}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setShowBlacklistModal(false)}
            >
              <Pressable style={[styles.modalSheet, { backgroundColor: colors.card }]} onPress={() => {}}>
                <Text variant="h2" style={{ marginBottom: spacing[2] }}>
                  {t('blacklist_reason')}
                </Text>
                <Text variant="body" color="secondary" style={{ marginBottom: spacing[4] }}>
                  Provide a reason for blacklisting {customer.name}.
                </Text>
                <TextInput
                  value={blacklistReason}
                  onChangeText={setBlacklistReason}
                  placeholder="e.g. Defaulted on loan repayment"
                  placeholderTextColor={colors.text.placeholder}
                  cursorColor={colors.brand[600]}
                  selectionColor={colors.brand[200]}
                  style={[styles.reasonInput, {
                    backgroundColor: colors.slate[100],
                    color: colors.text.primary,
                    borderColor: colors.border.default,
                  }]}
                  multiline
                  autoFocus
                />
                <View style={{ flexDirection: 'row', gap: spacing[2], marginTop: spacing[4] }}>
                  <Button
                    label={t('cancel')}
                    variant="secondary"
                    style={{ flex: 1 }}
                    onPress={() => setShowBlacklistModal(false)}
                  />
                  <Button
                    label={t('confirm')}
                    variant="danger"
                    style={{ flex: 1 }}
                    loading={blacklist.isPending}
                    onPress={handleBlacklist}
                  />
                </View>
              </Pressable>
            </Pressable>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </Screen>
  );
}

/** Mirrors the loaded screen's shape: gradient hero, KPI row, loan list rows. */
function CustomerDetailSkeleton({ insetsTop, onBack }: { insetsTop: number; onBack: () => void }) {
  return (
    <Screen padded={false} background="default" edges={[]} scroll>
      <GradientBackground
        gradient="hero"
        style={{
          paddingTop: insetsTop + spacing[2],
          paddingHorizontal: layout.screenPaddingX,
          paddingBottom: spacing[6],
          borderBottomLeftRadius: radii['3xl'],
          borderBottomRightRadius: radii['3xl'],
        }}
      >
        <View style={styles.topRow}>
          <IconButton
            icon={<Text variant="h2" color="onDark" style={{ marginTop: -2 }}>‹</Text>}
            variant="glass"
            size="md"
            onPress={onBack}
            accessibilityLabel="Back"
          />
        </View>

        <View style={styles.heroRow}>
          <SkeletonLoader width={72} height={72} radius={36} />
          <View style={{ flex: 1, marginLeft: spacing[4] }}>
            <SkeletonLoader width="65%" height={22} delay={0} />
            <SkeletonLoader width="40%" height={13} style={{ marginTop: spacing[2] }} delay={1} />
          </View>
        </View>

        <Card padding={4} style={{ marginTop: spacing[5], backgroundColor: 'rgba(255,255,255,0.12)' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ gap: spacing[2] }}>
              <SkeletonLoader width={90} height={11} delay={0} />
              <SkeletonLoader width={120} height={30} delay={1} />
            </View>
            <View style={{ flexDirection: 'row', gap: spacing[2] }}>
              <SkeletonLoader width={40} height={40} radius={radii.full} delay={0} />
              <SkeletonLoader width={40} height={40} radius={radii.full} delay={1} />
            </View>
          </View>
        </Card>
      </GradientBackground>

      <View style={{ padding: layout.screenPaddingX }}>
        <View style={styles.kpiRow}>
          {[0, 1, 2].map((i) => (
            <Card key={i} padding={3} style={styles.kpi}>
              <SkeletonLoader width={28} height={22} delay={i} />
              <SkeletonLoader width={44} height={10} style={{ marginTop: spacing[1.5] }} delay={i} />
            </Card>
          ))}
        </View>

        <SkeletonLoader width={70} height={18} style={{ marginBottom: spacing[3] }} />
        {[0, 1].map((i) => (
          <Card key={i} padding={4} style={{ marginBottom: spacing[2.5] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1, gap: spacing[2] }}>
                <SkeletonLoader width="50%" height={15} delay={i} />
                <SkeletonLoader width="30%" height={11} delay={i} />
              </View>
              <SkeletonLoader width={60} height={20} delay={i} />
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

interface DocTileProps {
  label: string;
  existing: CustomerDocument | undefined;
  canUpload: boolean;
  isUploading: boolean;
  onUpload: () => void;
  onOpen: (document: CustomerDocument, url: string | undefined) => void;
}

function DocTile({ label, existing, canUpload, isUploading, onUpload, onOpen }: DocTileProps) {
  const t = useT();
  const colors = useColors();
  // Start signing as soon as the tile appears so opening a document is immediate.
  const resolvedUrl = useSignedUrl(existing?.file_url);

  return (
    <Card
      padding={3}
      style={styles.docTile}
      shadow="xs"
      onPress={existing ? () => onOpen(existing, resolvedUrl) : canUpload ? onUpload : undefined}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: radii.full,
          backgroundColor: existing ? colors.brand[50] : colors.slate[100],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FileText size={18} color={existing ? colors.brand[700] : colors.slate[400]} />
      </View>
      <Text variant="label" style={{ marginTop: spacing[1.5] }}>
        {label}
      </Text>
      <Text variant="caption" style={{ color: existing ? colors.brand[600] : colors.text.tertiary }}>
        {existing ? t('tap_to_view') : isUploading ? 'Uploading...' : canUpload ? t('upload') : t('missing')}
      </Text>
    </Card>
  );
}

function isImageDocument(fileUrl?: string): boolean {
  return Boolean(fileUrl && /\.(avif|gif|heic|jpeg|jpg|png|webp)(?:$|\?)/i.test(fileUrl));
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between' },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[4],
  },
  heroSub: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blacklistBanner: {
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
    marginBottom: spacing[4],
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[5],
  },
  kpi: {
    flex: 1,
    alignItems: 'center',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  docGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  docTile: {
    width: '48%',
    alignItems: 'flex-start',
  },
  outstandingPanel: {
    marginTop: spacing[5],
    padding: spacing[4],
    borderRadius: radii.xl,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalKeyboardAvoider: {
    flex: 1,
  },
  modalSheet: {
    borderTopLeftRadius: radii['3xl'],
    borderTopRightRadius: radii['3xl'],
    padding: spacing[6],
    paddingBottom: spacing[10],
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    padding: spacing[4],
  },
  previewSheet: {
    borderRadius: radii['2xl'],
    padding: spacing[4],
    maxHeight: '86%',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  previewImage: {
    width: '100%',
    aspectRatio: 0.72,
  },
  previewUnavailable: {
    minHeight: 260,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  reasonInput: {
    minHeight: 80,
    borderRadius: radii.lg,
    padding: spacing[3],
    fontFamily: fontFamily.regular,
    fontSize: 14,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
});
