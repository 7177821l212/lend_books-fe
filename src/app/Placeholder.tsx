import { StyleSheet, Text, View } from 'react-native';

export function Placeholder({ route }: { route?: { name?: string } }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{route?.name ?? 'Screen'} — coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  text: { color: '#6B7280', fontSize: 16 },
});
