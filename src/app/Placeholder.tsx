/**
 * Placeholder — themed screen stub showing the screen name.
 */
import { Construction, LogOut } from 'lucide-react-native';

import { Button, EmptyState, Header, Screen } from '@/components/ui';
import { useAuth } from '@/features/auth/context/AuthContext';
import { colors } from '@/theme';

export function Placeholder({ route }: { route?: { name?: string } }) {
  const { logout } = useAuth();
  return (
    <Screen padded={false} background="default" edges={[]} scroll={false}>
      <Header
        title={route?.name ?? 'Screen'}
        subtitle="Coming soon"
        compact
        rightAction={
          <Button
            label="Sign out"
            variant="ghost"
            size="sm"
            onPress={() => void logout()}
            leadingIcon={<LogOut size={16} color={colors.white} />}
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          />
        }
      />
      <EmptyState
        icon={<Construction size={32} color={colors.brand[700]} />}
        title="Under construction"
        description={`The ${route?.name ?? 'screen'} screen will be built in the next sprint.`}
      />
    </Screen>
  );
}
