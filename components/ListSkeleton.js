import { StyleSheet } from 'react-native';
import { SkeletonPulse, SkeletonBlock } from './Skeleton';
import { spacing } from '../theme';

// Grey rows standing in for the shopping list while it loads.
export default function ListSkeleton() {
  return (
    <SkeletonPulse accessibilityLabel="Loading your list" style={styles.container}>
      {Array.from({ length: 5 }, (_, index) => (
        <SkeletonBlock key={index} style={styles.row} />
      ))}
    </SkeletonPulse>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  row: {
    height: 48,
  },
});
