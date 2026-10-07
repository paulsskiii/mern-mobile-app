import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import {
  addListItem,
  loadList,
  refreshList,
  removeListItem,
  selectListError,
  selectListItems,
  selectListRefreshing,
  selectListStatus,
  toggleListItem,
} from '../store/listSlice';
import useOnReconnect from './useOnReconnect';

// The shopping list, now kept in Redux. The hook still returns exactly what it returned on Day 4,
// so the screen does not have to change.
// add, toggle and remove return { ok: true } when the server accepted the change, or { ok: false, message } when it did not.
export default function useShoppingList() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const items = useSelector(selectListItems);
  const storeStatus = useSelector(selectListStatus);
  const error = useSelector(selectListError);
  const refreshing = useSelector(selectListRefreshing);

  // Before the first request starts the store says 'idle'. To the screen that is still "loading".
  const status = storeStatus === 'idle' ? 'loading' : storeStatus;

  const reload = useCallback(() => dispatch(loadList(user.id)), [dispatch, user.id]);

  const refresh = useCallback(async () => {
    try {
      await dispatch(refreshList(user.id)).unwrap();
      return true;
    } catch (err) {
      return false;
    }
  }, [dispatch, user.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  useOnReconnect(refresh);

  // Runs a thunk and turns "fulfilled" or "rejected" into the { ok, message } answer the screen expects.
  // unwrap() throws the rejected payload, which is the friendly message the thunk produced.
  const run = useCallback(
    async (thunkAction) => {
      try {
        await dispatch(thunkAction).unwrap();
        return { ok: true };
      } catch (thrown) {
        return { ok: false, message: typeof thrown === 'string' ? thrown : thrown.message };
      }
    },
    [dispatch]
  );

  const add = useCallback((name) => run(addListItem(name)), [run]);
  const toggle = useCallback((item) => run(toggleListItem(item)), [run]);
  const remove = useCallback((item) => run(removeListItem(item)), [run]);

  return { items, status, error, refreshing, reload, refresh, add, toggle, remove };
}
