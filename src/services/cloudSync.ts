import { WmsProduct } from '../types/wms';

const STORAGE_KEY_PRODUCTS = 'wms_portal_products_v2';
const STORAGE_KEY_TIMESTAMP = 'wms_portal_products_timestamp';
const BROADCAST_CHANNEL_NAME = 'tbc_wms_realtime_broadcast_v3';

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch {
  // BroadcastChannel fallback
}

interface SyncPayload {
  type: 'SYNC_PRODUCTS' | 'PRODUCT_DELETED' | 'PRODUCT_ADDED' | 'PRODUCT_UPDATED' | 'SYNC_ALL';
  productId?: string;
  products: WmsProduct[];
  timestamp: number;
}

export const cloudSync = {
  // Broadcast an immediate local update to all open tabs and windows (0ms latency)
  broadcast(type: SyncPayload['type'], products: WmsProduct[], productId?: string): void {
    const timestamp = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
      localStorage.setItem(STORAGE_KEY_TIMESTAMP, timestamp.toString());
    } catch {}

    const payload: SyncPayload = {
      type,
      productId,
      products,
      timestamp
    };

    // 1. Send via BroadcastChannel (instant cross-tab communication)
    try {
      if (broadcastChannel) {
        broadcastChannel.postMessage(payload);
      }
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }

    // 2. Dispatch window event for current document
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tbc_wms_local_sync', { detail: payload }));
    }
  },

  // Notify server of product addition/edit
  async saveProductToServer(product: WmsProduct): Promise<void> {
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
    } catch {
      // offline / static fallback
    }
  },

  // Notify server of product deletion
  async deleteProductFromServer(productId: string): Promise<void> {
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
    } catch {
      // offline / static fallback
    }
  },

  // Notify server of clean slate
  async cleanSlateOnServer(): Promise<void> {
    try {
      await fetch('/api/clean-slate', {
        method: 'POST'
      });
    } catch {
      // offline / static fallback
    }
  },

  // Notify server of demo data reset
  async resetDemoOnServer(): Promise<void> {
    try {
      await fetch('/api/reset-demo', {
        method: 'POST'
      });
    } catch {
      // offline / static fallback
    }
  },

  // Fetch latest products from server
  async fetchProducts(): Promise<WmsProduct[] | null> {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.products)) {
          return data.products;
        }
      }
    } catch {
      // offline fallback
    }
    return null;
  },

  // Subscribe to real-time events (Server-Sent Events for cross-device + BroadcastChannel for cross-tab)
  subscribe(onProductsChange: (products: WmsProduct[]) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    // 1. Handler for BroadcastChannel (cross-tab)
    const handleBroadcast = (event: MessageEvent<SyncPayload>) => {
      if (event.data && Array.isArray(event.data.products)) {
        onProductsChange(event.data.products);
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleBroadcast);
    }

    // 2. Handler for local custom event (same page)
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<SyncPayload>;
      if (customEvent.detail && Array.isArray(customEvent.detail.products)) {
        onProductsChange(customEvent.detail.products);
      }
    };
    window.addEventListener('tbc_wms_local_sync', handleCustomEvent);

    // 3. Native storage event (across browser tabs)
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_PRODUCTS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            onProductsChange(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    // 4. Server-Sent Events (SSE) for Real-Time Cross-Device Sync (0ms delay across all devices)
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.type === 'SYNC_PRODUCTS' && Array.isArray(data.payload)) {
            localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(data.payload));
            onProductsChange(data.payload);
          } else if (data && data.type === 'SYNC_ALL' && data.payload && Array.isArray(data.payload.products)) {
            localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(data.payload.products));
            onProductsChange(data.payload.products);
          }
        } catch {}
      };
      eventSource.onerror = () => {
        // SSE will attempt to reconnect automatically
      };
    } catch {}

    // 5. Fallback polling every 3 seconds to guarantee sync even if SSE reconnects
    let isFetching = false;
    const pollInterval = setInterval(async () => {
      if (document.hidden || isFetching) return;
      isFetching = true;
      try {
        const serverProducts = await cloudSync.fetchProducts();
        if (serverProducts && Array.isArray(serverProducts)) {
          const localStr = localStorage.getItem(STORAGE_KEY_PRODUCTS);
          const serverStr = JSON.stringify(serverProducts);
          if (localStr !== serverStr) {
            localStorage.setItem(STORAGE_KEY_PRODUCTS, serverStr);
            onProductsChange(serverProducts);
          }
        }
      } catch {
        // silent
      } finally {
        isFetching = false;
      }
    }, 3000);

    // Initial server fetch to align device data immediately on load
    cloudSync.fetchProducts().then((serverProducts) => {
      if (serverProducts && Array.isArray(serverProducts)) {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(serverProducts));
        onProductsChange(serverProducts);
      }
    }).catch(() => {});

    // Cleanup subscription
    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcast);
      }
      window.removeEventListener('tbc_wms_local_sync', handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(pollInterval);
    };
  }
};
