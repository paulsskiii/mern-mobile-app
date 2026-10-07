import { useState } from 'react';
import { View, FlatList, Linking, RefreshControl, StyleSheet } from 'react-native';
import { Button, Divider, IconButton, List, Snackbar, Text, TextInput } from 'react-native-paper';
import ErrorState from '../components/ErrorState';
import ListSkeleton from '../components/ListSkeleton';
import OfflineBanner from '../components/OfflineBanner';
import useLocationTags from '../hooks/useLocationTags';
import useShoppingList from '../hooks/useShoppingList';
import { formatCoords } from '../utils/format';
import { colors, spacing } from '../theme';

export default function ShoppingListScreen() {
  const { items, status, error, refreshing, reload, refresh, add, toggle, remove } =
    useShoppingList();
  const { tags, tagItem, clearTag } = useLocationTags();
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');
  const [needsSettings, setNeedsSettings] = useState(false);

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (trimmed === '') return;

    setAdding(true);
    const result = await add(trimmed);
    setAdding(false);

    if (result.ok) {
      setName('');
    } else {
      setMessage(result.message);
    }
  };

  const report = (result) => {
    if (!result.ok) {
      setNeedsSettings(false);
      setMessage(result.message);
    }
  };

  // Tap once to tag the item with where you are now. Tap again to remove the tag.
  const handleTag = async (item) => {
    if (tags[item.id]) {
      clearTag(item.id);
      return;
    }
    const result = await tagItem(item.id);
    if (!result.ok) {
      setNeedsSettings(result.needsSettings);
      setMessage(result.message);
    }
  };

  const handleRefresh = async () => {
    const worked = await refresh();
    if (!worked) setMessage('Could not refresh. Showing your list from earlier.');
  };

  let emptyComponent = (
    <View style={styles.empty}>
      <Text variant="titleMedium">Your list is empty</Text>
      <Text style={styles.hint}>Add your first item above.</Text>
    </View>
  );
  if (status === 'loading') {
    emptyComponent = <ListSkeleton />;
  } else if (status === 'error') {
    emptyComponent = <ErrorState message={error} onRetry={reload} />;
  }

  return (
    <View style={styles.screen}>
      <OfflineBanner />

      <View style={styles.addRow}>
        <TextInput
          mode="outlined"
          dense
          label="Add an item"
          accessibilityLabel="New item"
          value={name}
          onChangeText={setName}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={handleAdd}
          loading={adding}
          disabled={adding || name.trim() === ''}
        >
          Add
        </Button>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={Divider}
        ListEmptyComponent={emptyComponent}
        extraData={tags}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={tags[item.id] ? `Tagged at ${formatCoords(tags[item.id])}` : undefined}
            titleStyle={item.done && styles.done}
            accessibilityRole="checkbox"
            accessibilityLabel={item.name}
            accessibilityState={{ checked: item.done }}
            onPress={async () => report(await toggle(item))}
            left={(props) => (
              <List.Icon
                {...props}
                icon={item.done ? 'checkbox-marked' : 'checkbox-blank-outline'}
                color={item.done ? colors.success : colors.muted}
              />
            )}
            right={() => (
              <View style={styles.actions}>
                <IconButton
                  icon={tags[item.id] ? 'map-marker-check' : 'map-marker-plus-outline'}
                  iconColor={tags[item.id] ? colors.primary : colors.muted}
                  accessibilityLabel={
                    tags[item.id]
                      ? `Remove location tag from ${item.name}`
                      : `Tag ${item.name} with my location`
                  }
                  onPress={() => handleTag(item)}
                />
                <IconButton
                  icon="delete-outline"
                  accessibilityLabel={`Remove ${item.name}`}
                  onPress={async () => report(await remove(item))}
                />
              </View>
            )}
          />
        )}
      />

      <Snackbar
        visible={message !== ''}
        onDismiss={() => setMessage('')}
        duration={3000}
        action={needsSettings ? { label: 'Settings', onPress: () => Linking.openSettings() } : undefined}
      >
        {message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  input: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  done: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  hint: {
    color: colors.muted,
  },
});
