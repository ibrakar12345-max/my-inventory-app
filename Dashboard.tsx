import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase, type Item, type ActivityLog } from '@/lib/supabase';
import { type ItemFormData } from '@/components/ItemFormModal';
import ItemCard from '@/components/ItemCard';
import ItemFormModal from '@/components/ItemFormModal';
import ActivityLogModal from '@/components/ActivityLogModal';
import { Package, Warehouse, History, LogOut, Plus, Globe, Moon, Sun, Search, Boxes } from 'lucide-react';

type Tab = 'room' | 'warehouse';

export default function Dashboard() {
  const { t, lang, setLang, theme, setTheme, user, logout, addToast } = useApp();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState<Tab>('room');
  const [items, setItems] = useState<Item[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [logModalOpen, setLogModalOpen] = useState(false);

  // Track the original quantity before any decreases in this session, per item
  // Restore reverts to this value, then clears it
  const originalQtyRef = useRef<Map<string, number>>(new Map());

  // Debounce timers for decrease DB writes — one per item, prevents rapid-fire DB calls
  const decreaseTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  // Tracks the starting quantity and title for the current debounced decrease burst
  const pendingDecreaseRef = useRef<Map<string, { startQty: number; itemTitle: string }>>(new Map());
  // Mirror of items state for reading current quantities inside timer callbacks
  const itemsRef = useRef<Item[]>([]);

  // Track item IDs we've already seen to dedupe realtime INSERT events
  const knownItemIdsRef = useRef<Set<string>>(new Set());
  // Track log IDs we've already seen to dedupe realtime INSERT events
  const knownLogIdsRef = useRef<Set<string>>(new Set());

  // Keep latest values in refs so the realtime subscription doesn't need to re-subscribe
  const tRef = useRef(t);
  const isAdminRef = useRef(isAdmin);
  const addToastRef = useRef(addToast);
  const userRef = useRef(user);

  useEffect(() => { tRef.current = t; }, [t]);
  useEffect(() => { isAdminRef.current = isAdmin; }, [isAdmin]);
  useEffect(() => { addToastRef.current = addToast; }, [addToast]);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { itemsRef.current = items; }, [items]);

  // Clean up all debounce timers on unmount
  useEffect(() => {
    return () => {
      decreaseTimersRef.current.forEach((timer) => clearTimeout(timer));
      decreaseTimersRef.current.clear();
    };
  }, []);

  // Load items
  const loadItems = useCallback(async () => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error loading items:', error);
      return;
    }
    if (data) {
      const typedData = data as Item[];
      typedData.forEach((i) => knownItemIdsRef.current.add(i.id));
      setItems(typedData);
    }
    setLoading(false);
  }, []);

  // Load logs
  const loadLogs = useCallback(async () => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) {
      console.error('Error loading logs:', error);
      return;
    }
    if (data) {
      const typedData = data as ActivityLog[];
      typedData.forEach((l) => knownLogIdsRef.current.add(l.id));
      setLogs(typedData);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadItems();
    loadLogs();
  }, [loadItems, loadLogs]);

  // Real-time subscription — stable, never re-subscribes
  useEffect(() => {
    const channel = supabase
      .channel('inventory-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'items' },
        (payload) => {
          const newItem = payload.new as Item;
          // Skip if we already know about this item (optimistic update or initial load)
          if (knownItemIdsRef.current.has(newItem.id)) return;
          knownItemIdsRef.current.add(newItem.id);
          setItems((prev) => [newItem, ...prev]);
          addToastRef.current(`${tRef.current.notifications.itemAdded}: ${newItem.title}`, 'success');
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'items' },
        (payload) => {
          const updated = payload.new as Item;
          const old = payload.old as Item;
          // Always update local state with the latest from DB
          setItems((prev) => {
            const existing = prev.find((i) => i.id === updated.id);
            if (!existing) return prev; // UPDATE for untracked item — don't duplicate
            // Skip realtime UPDATEs for items with pending debounced writes — our optimistic state is authoritative
            if (pendingDecreaseRef.current.has(updated.id)) return prev;
            // Merge the realtime payload into the existing item — NEVER replace wholesale.
            // Supabase realtime UPDATE events may only include changed columns, so replacing
            // the full object would wipe out image_url, location, title, etc.
            const merged = { ...existing, ...updated } as Item;
            // Skip if nothing actually changed (avoid unnecessary re-render)
            if (existing.quantity === merged.quantity &&
                existing.title === merged.title &&
                existing.description === merged.description &&
                existing.image_url === merged.image_url &&
                existing.location === merged.location) {
              return prev;
            }
            return prev.map((i) => (i.id === updated.id ? merged : i));
          });

          // Notifications based on quantity changes
          const oldQty = old?.quantity ?? undefined;
          const newQty = updated.quantity;

          if (updated.location === 'room' && newQty === 0 && oldQty !== undefined && oldQty > 0) {
            addToastRef.current(`${tRef.current.notifications.itemOutOfStockRoom} ${updated.title}`, 'warning');
          }
          if (isAdminRef.current && newQty > 0 && newQty <= 3 && oldQty !== undefined && oldQty > 3) {
            addToastRef.current(`${tRef.current.notifications.lowStock} ${updated.title} ${tRef.current.notifications.aboutToRunOut}`, 'warning');
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'items' },
        (payload) => {
          const deleted = payload.old as Item;
          knownItemIdsRef.current.delete(deleted.id);
          setItems((prev) => {
            const existing = prev.find((i) => i.id === deleted.id);
            if (!existing) return prev;
            return prev.filter((i) => i.id !== deleted.id);
          });
          if (deleted.location === 'room') {
            addToastRef.current(`${tRef.current.notifications.itemOutOfStockRoom} ${deleted.title}`, 'warning');
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_logs' },
        (payload) => {
          const newLog = payload.new as ActivityLog;
          if (knownLogIdsRef.current.has(newLog.id)) return;
          knownLogIdsRef.current.add(newLog.id);
          setLogs((prev) => [newLog, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // stable — never re-subscribes

  // Log helper
  const logAction = useCallback(
    async (
      item: { id: string; title: string },
      action: ActivityLog['action'],
      details: string,
      quantityFrom: number | null,
      quantityTo: number | null
    ) => {
      if (!user) return;
      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          item_id: item.id,
          item_name: item.title,
          action,
          details,
          quantity_from: quantityFrom,
          quantity_to: quantityTo,
          username: user.username,
          role: user.role,
        })
        .select()
        .single();

      if (data) {
        const typedLog = data as ActivityLog;
        knownLogIdsRef.current.add(typedLog.id);
        setLogs((prev) => {
          if (prev.some((l) => l.id === typedLog.id)) return prev;
          return [typedLog, ...prev];
        });
      }
      if (error) {
        console.error('Error logging action:', error);
      }
    },
    [user]
  );

  // Add/Edit item — with optimistic UI update
  const handleFormSubmit = useCallback(
    async (data: ItemFormData) => {
      if (!user) return;
      setFormOpen(false);

      if (editingItem) {
        // Optimistic update — update UI immediately
        const updatedItem: Item = {
          ...editingItem,
          title: data.title,
          description: data.description,
          quantity: data.quantity,
          image_url: data.image_url,
          updated_at: new Date().toISOString(),
        };
        setItems((prev) => prev.map((i) => (i.id === editingItem.id ? updatedItem : i)));

        // Persist to DB
        const { error } = await supabase
          .from('items')
          .update({
            title: data.title,
            description: data.description,
            quantity: data.quantity,
            image_url: data.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingItem.id);

        if (error) {
          // Rollback on error
          setItems((prev) => prev.map((i) => (i.id === editingItem.id ? editingItem : i)));
          addToast('Error updating item', 'error');
          return;
        }

        await logAction(
          { id: editingItem.id, title: data.title },
          'edit',
          `${t.common.changedFrom} ${editingItem.quantity} ${t.common.toText} ${data.quantity}`,
          editingItem.quantity,
          data.quantity
        );
        setEditingItem(null);
      } else {
        // Optimistic add — create a temporary item with a pseudo-ID
        const tempId = `temp-${Date.now()}`;
        const optimisticItem: Item = {
          id: tempId,
          title: data.title,
          description: data.description,
          quantity: data.quantity,
          image_url: data.image_url,
          location: data.location,
          created_by_username: user.username,
          created_by_role: user.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setItems((prev) => [optimisticItem, ...prev]);

        // Persist to DB
        const { data: inserted, error } = await supabase
          .from('items')
          .insert({
            title: data.title,
            description: data.description,
            quantity: data.quantity,
            image_url: data.image_url,
            location: data.location,
            created_by_username: user.username,
            created_by_role: user.role,
          })
          .select()
          .single();

        if (error) {
          // Rollback — remove the optimistic item
          setItems((prev) => prev.filter((i) => i.id !== tempId));
          addToast('Error adding item', 'error');
          return;
        }

        if (inserted) {
          const realItem = inserted as Item;
          // Replace the temp item with the real one
          knownItemIdsRef.current.add(realItem.id);
          setItems((prev) => prev.map((i) => (i.id === tempId ? realItem : i)));

          await logAction(
            { id: realItem.id, title: data.title },
            'add',
            `${t.items.quantity}: ${data.quantity}`,
            null,
            data.quantity
          );
        }
      }
    },
    [user, editingItem, logAction, addToast, t]
  );

  // Decrease quantity — instant optimistic UI, debounced DB write
  const handleDecrease = useCallback(
    (item: Item) => {
      // Read current quantity from itemsRef to avoid stale closures during rapid clicks
      const currentItem = itemsRef.current.find((i) => i.id === item.id);
      if (!currentItem || currentItem.quantity <= 0) return;

      // Record the original quantity before the first decrease (for undo)
      if (!originalQtyRef.current.has(item.id)) {
        originalQtyRef.current.set(item.id, currentItem.quantity);
      }

      // Track the starting quantity for this debounced burst (set once on first click)
      if (!pendingDecreaseRef.current.has(item.id)) {
        pendingDecreaseRef.current.set(item.id, { startQty: currentItem.quantity, itemTitle: currentItem.title });
      }

      // Instant optimistic UI update — functional update preserves all properties including image_url
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: Math.max(0, i.quantity - 1), updated_at: new Date().toISOString() }
            : i
        )
      );

      // Clear any existing debounce timer for this item (resets the 500ms window)
      const existingTimer = decreaseTimersRef.current.get(item.id);
      if (existingTimer) clearTimeout(existingTimer);

      // Set a new debounce timer — fires once 500ms after the last click
      const timer = setTimeout(async () => {
        decreaseTimersRef.current.delete(item.id);

        // Read the final quantity from the ref (avoids stale closures)
        const finalItem = itemsRef.current.find((i) => i.id === item.id);
        if (!finalItem) {
          pendingDecreaseRef.current.delete(item.id);
          return;
        }
        const finalQty = finalItem.quantity;
        const pending = pendingDecreaseRef.current.get(item.id);

        // Persist to DB — single request with the final quantity
        const { error } = await supabase
          .from('items')
          .update({ quantity: finalQty, updated_at: new Date().toISOString() })
          .eq('id', item.id);

        if (error) {
          // Rollback — restore to the starting quantity of this burst, preserve everything else
          const rollbackQty = pending?.startQty ?? finalQty;
          setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, quantity: rollbackQty } : i)));
          addToast('Error updating quantity', 'error');
          pendingDecreaseRef.current.delete(item.id);
          return;
        }

        // Log the total change for this burst (from startQty to finalQty)
        if (pending) {
          await logAction(
            { id: item.id, title: pending.itemTitle },
            'decrease',
            `${t.common.changedFrom} ${pending.startQty} ${t.common.toText} ${finalQty}`,
            pending.startQty,
            finalQty
          );
        }
        // Delay clearing the pending flag so the realtime UPDATE event from this DB write
        // is still suppressed (our optimistic state is already correct)
        setTimeout(() => pendingDecreaseRef.current.delete(item.id), 2000);
      }, 500);

      decreaseTimersRef.current.set(item.id, timer);
    },
    [logAction, addToast, t]
  );

  // Restore quantity (undo ALL decreases in this session) — reverts to original quantity
  const handleRestore = useCallback(
    async (item: Item) => {
      // Clear any pending decrease debounce for this item to prevent race conditions
      const timer = decreaseTimersRef.current.get(item.id);
      if (timer) {
        clearTimeout(timer);
        decreaseTimersRef.current.delete(item.id);
      }
      pendingDecreaseRef.current.delete(item.id);

      const originalQty = originalQtyRef.current.get(item.id);
      if (originalQty === undefined) {
        addToast(t.items.noRestoreAvailable, 'info');
        return;
      }

      const currentQty = item.quantity;
      const restoredQty = originalQty;

      // Optimistic update — map and spread to preserve all properties (including image_url)
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: restoredQty, updated_at: new Date().toISOString() }
            : i
        )
      );

      // Persist to DB
      const { error } = await supabase
        .from('items')
        .update({ quantity: restoredQty, updated_at: new Date().toISOString() })
        .eq('id', item.id);

      if (error) {
        // Rollback — restore the pre-undo quantity
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, quantity: currentQty } : i)));
        addToast('Error restoring quantity', 'error');
        return;
      }

      // Clear the original — undo is complete, no more restores available
      originalQtyRef.current.delete(item.id);

      await logAction(item, 'restore', `${t.common.changedFrom} ${currentQty} ${t.common.toText} ${restoredQty}`, currentQty, restoredQty);
    },
    [logAction, addToast, t]
  );

  // Move item to the other location — with optimistic UI update
  const handleMove = useCallback(
    async (item: Item) => {
      const newLocation: Item['location'] = item.location === 'room' ? 'warehouse' : 'room';
      const oldLocation = item.location;

      if (!confirm(t.items.confirmMove)) return;

      // Optimistic update — map and spread to preserve all properties, only change location
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, location: newLocation, updated_at: new Date().toISOString() }
            : i
        )
      );

      // Persist to DB — update ONLY the location field
      const { error } = await supabase
        .from('items')
        .update({ location: newLocation, updated_at: new Date().toISOString() })
        .eq('id', item.id);

      if (error) {
        // Rollback — restore original location, preserve everything else
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, location: oldLocation } : i)));
        addToast('Error moving item', 'error');
        return;
      }

      await logAction(
        item,
        'move',
        `${t.common.changedFrom} ${t.nav[oldLocation]} ${t.common.toText} ${t.nav[newLocation]}`,
        null,
        null
      );
    },
    [logAction, addToast, t]
  );

  // Delete item — with optimistic UI update
  const handleDelete = useCallback(
    async (item: Item) => {
      if (!confirm(t.items.confirmDelete)) return;

      // Optimistic delete — remove from UI immediately
      knownItemIdsRef.current.delete(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));

      // Persist to DB
      const { error } = await supabase.from('items').delete().eq('id', item.id);
      if (error) {
        // Rollback — re-add the item
        knownItemIdsRef.current.add(item.id);
        setItems((prev) => [item, ...prev]);
        addToast('Error deleting item', 'error');
        return;
      }

      await logAction(item, 'delete', '', item.quantity, null);
    },
    [logAction, addToast, t]
  );

  // Filter items
  const filteredItems = items
    .filter((i) => i.location === activeTab)
    .filter((i) =>
      searchQuery.trim()
        ? i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (i.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  const roomCount = items.filter((i) => i.location === 'room').length;
  const warehouseCount = items.filter((i) => i.location === 'warehouse').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          {/* Logo + name */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 shrink-0">
              <Package size={22} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight truncate">
                {t.appName}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.username} {user && (user.role === 'admin' ? `· ${t.login.admin}` : `· ${t.login.regularUser}`)}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isAdmin && (
              <button
                onClick={() => setLogModalOpen(true)}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                title={t.nav.activityLog}
              >
                <History size={20} />
              </button>
            )}
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Language"
            >
              <Globe size={20} />
            </button>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
              title={t.nav.logout}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 relative">
            <button
              onClick={() => setActiveTab('room')}
              className={`relative flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'room'
                  ? 'border-slate-800 dark:border-slate-200 text-slate-800 dark:text-slate-100'
                  : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Boxes size={18} />
              {t.nav.room}
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {roomCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('warehouse')}
              className={`relative flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'warehouse'
                  ? 'border-slate-800 dark:border-slate-200 text-slate-800 dark:text-slate-100'
                  : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Warehouse size={18} />
              {t.nav.warehouse}
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {warehouseCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-5">
        {/* Search + Add */}
        <div className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute top-1/2 -translate-y-1/2 text-slate-400"
              style={lang === 'ar' ? { right: '12px' } : { left: '12px' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.common.search}
              className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 ${
                lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'
              } text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400`}
            />
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setEditingItem(null);
                setFormOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white text-sm font-semibold shadow-sm whitespace-nowrap"
            >
              <Plus size={18} />
              {t.items.addItem}
            </button>
          )}
        </div>

        {/* Items grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-slate-300 dark:border-slate-700 border-t-slate-700 dark:border-t-slate-300 rounded-full animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500">
            <Package size={56} className="mx-auto mb-4 opacity-40" />
            <p className="text-sm">{searchQuery ? t.common.noResults : t.items.noItems}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onDecrease={handleDecrease}
                onRestore={handleRestore}
                onMove={handleMove}
                onEdit={(i) => {
                  setEditingItem(i);
                  setFormOpen(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <ItemFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingItem(null);
        }}
        location={activeTab}
        editingItem={editingItem}
        onSubmit={handleFormSubmit}
      />
      <ActivityLogModal
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        logs={logs}
      />
    </div>
  );
}
