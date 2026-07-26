/**
 * LiveLocationsScreen — investor view of every active collector's last-known
 * location, reported while their app is open. No embedded map (avoids a
 * native maps dependency + API key); tapping a row opens the location in the
 * device's own Maps app via a universal geo URL.
 */
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, MapPin, Navigation } from 'lucide-react-native';
import { Linking, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { TeamStackParamList } from '@/app/navigation/TeamNavigator';
import {
  Avatar,
  Card,
  EmptyState,
  GradientBackground,
  IconButton,
  Screen,
  SkeletonLoader,
  Text,
} from '@/components/ui';
import type { CollectorLocation } from '@/features/collectors/api/collectorApi';
import { useCollectorLocations } from '@/features/collectors/hooks/useCollectors';
import { useT } from '@/i18n';
import { useColors, layout, radii, spacing } from '@/theme';

type Nav = NativeStackNavigationProp<TeamStackParamList, 'LiveLocations'>;

function relativeFreshness(iso: string): { label: string; tone: 'live' | 'recent' | 'stale' } {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return { label: 'Just now', tone: 'live' };
  if (mins < 5) return { label: `${mins} min ago`, tone: 'live' };
  if (mins < 30) return { label: `${mins} min ago`, tone: 'recent' };
  if (mins < 60) return { label: `${mins} min ago`, tone: 'stale' };
  const hours = Math.floor(mins / 60);
  if (hours < 24) return { label: `${hours}h ago`, tone: 'stale' };
  const days = Math.floor(hours / 24);
  return { label: `${days}d ago`, tone: 'stale' };
}

function openInMaps(lat: number, lng: number) {
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  Linking.openURL(url).catch(() => {});
}

export function LiveLocationsScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const nav = useNavigation<Nav>();
  const { data, isLoading, isRefetching, refetch } = useCollectorLocations();

  const FRESHNESS_COLOR = {
    live: colors.success,
    recent: colors.warning,
    stale: colors.slate[400],
  } as const;

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
              {t('team').toUpperCase()}
            </Text>
            <Text variant="title" color="onDark">
              Live Locations
            </Text>
          </View>
        </View>
        <Text variant="caption" color="onDark" style={{ opacity: 0.7, marginTop: spacing[3] }}>
          Reported while a collector's app is open — updates every 30s.
        </Text>
      </GradientBackground>

      <ScrollView
        contentContainerStyle={{ padding: layout.screenPaddingX, paddingBottom: spacing[12] }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.brand[600]} />
        }
      >
        {isLoading ? (
          <View>
            {[0, 1, 2].map((i) => (
              <Card key={i} padding={4} style={{ marginBottom: spacing[2] }}>
                <View style={styles.row}>
                  <SkeletonLoader width={44} height={44} radius={22} delay={i} />
                  <View style={{ flex: 1, marginLeft: spacing[3] }}>
                    <SkeletonLoader width="50%" height={14} delay={i} />
                    <SkeletonLoader width="30%" height={11} style={{ marginTop: 6 }} delay={i} />
                  </View>
                </View>
              </Card>
            ))}
          </View>
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={<MapPin size={28} color={colors.brand[700]} />}
            title="No live locations yet"
            description="Locations appear here once a collector opens the app and grants location access."
          />
        ) : (
          data.map((loc: CollectorLocation) => {
            const fresh = relativeFreshness(loc.recorded_at);
            return (
              <Card
                key={loc.collector_id}
                padding={4}
                style={{ marginBottom: spacing[2] }}
                onPress={() => openInMaps(loc.latitude, loc.longitude)}
              >
                <View style={styles.row}>
                  <View style={{ position: 'relative' }}>
                    <Avatar name={loc.collector_name} id={loc.collector_id} imageUrl={loc.photo_url} size="lg" />
                    <View
                      style={[
                        styles.freshnessDot,
                        { backgroundColor: FRESHNESS_COLOR[fresh.tone], borderColor: colors.card },
                      ]}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing[3] }}>
                    <Text variant="bodyStrong">{loc.collector_name}</Text>
                    <Text
                      variant="caption"
                      style={{ color: FRESHNESS_COLOR[fresh.tone], marginTop: 2 }}
                    >
                      {fresh.label}
                      {loc.accuracy != null ? ` · ±${Math.round(loc.accuracy)}m` : ''}
                    </Text>
                  </View>
                  <View style={[styles.mapBtn, { backgroundColor: colors.brand[50] }]}>
                    <Navigation size={16} color={colors.brand[600]} />
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  freshnessDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  mapBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
