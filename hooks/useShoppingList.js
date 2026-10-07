import { useCallback, useEffect, useState } from 'react';
import { createItem, deleteItem, fetchItems, setItemDone } from '../services/tasks';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/errors';
import { ensureOnline } from '../lib/network';
import useOnReconnect from './useOnReconnect';

// The shopping list: loading state, plus add / toggle / remove.
// add, toggle and remove return { ok: true } when the server accepted the change, or { ok: false, message } when it did not.
export default function useShoppingList() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      await ensureOnline();
      setItems(await fetchItems(user.id));
      setStatus('success');
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus('error');
    }
  }, [user.id]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await ensureOnline();
      setItems(await fetchItems(user.id));
      setStatus('success');
      return true;
    } catch (err) {
      return false;
    } finally {
      setRefreshing(false);
    }
  }, [user.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  useOnReconnect(refresh);

  // Wait for the server, then show the new item at the top.
  const add = useCallback(async (name) => {
    try {
      await ensureOnline();
      const created = await createItem(name);
      setItems((current) => [created, ...current]);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: getErrorMessage(err) };
    }
  }, []);

  // Optimistic: flip the checkbox straight away, and flip it back if the server says no.
  const toggle = useCallback(async (item) => {
    const setDone = (id, done) =>
      setItems((current) => current.map((i) => (i.id === id ? { ...i, done } : i)));

    setDone(item.id, !item.done);
    try {
      await ensureOnline();
      await setItemDone(item.id, !item.done);
      return { ok: true };
    } catch (err) {
      setDone(item.id, item.done);
      return { ok: false, message: getErrorMessage(err) };
    }
  }, []);

  // Not optimistic: the row only disappears once the server has deleted it.
  const remove = useCallback(async (item) => {
    try {
      await ensureOnline();
      await deleteItem(item.id);
      setItems((current) => current.filter((i) => i.id !== item.id));
      return { ok: true };
    } catch (err) {
      return { ok: false, message: getErrorMessage(err) };
    }
  }, []);

  return { items, status, error, refreshing, reload, refresh, add, toggle, remove };
}
