
import { SavedGame, GalleryItem } from '../types';

const DB_NAME = 'protagonist_halo_db';
const DB_VERSION = 1;
const STORES = {
  SAVES: 'saves',
  GALLERY: 'gallery'
};

// Helper to open DB
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORES.SAVES)) {
        db.createObjectStore(STORES.SAVES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.GALLERY)) {
        db.createObjectStore(STORES.GALLERY, { keyPath: 'id' });
      }
    };
  });
};

// Generic transaction helper
const performTransaction = <T>(
  storeName: string, 
  mode: IDBTransactionMode, 
  callback: (store: IDBObjectStore) => IDBRequest<any> | void
): Promise<T> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      
      let request;
      try {
        request = callback(store);
      } catch (e) {
        reject(e);
        return;
      }

      transaction.oncomplete = () => {
        resolve((request as IDBRequest)?.result);
      };
      transaction.onerror = () => reject(transaction.error);
    } catch (e) {
      reject(e);
    }
  });
};

export const StorageService = {
  // --- Migration ---
  async migrateFromLocalStorage() {
    try {
      const localSaves = localStorage.getItem('protagonist_saves');
      const localGallery = localStorage.getItem('protagonist_gallery');

      if (localSaves) {
        const saves: SavedGame[] = JSON.parse(localSaves);
        if (Array.isArray(saves) && saves.length > 0) {
          await this.saveGames(saves);
          console.log(`Migrated ${saves.length} saves to IndexedDB`);
        }
        localStorage.removeItem('protagonist_saves');
      }

      if (localGallery) {
        const gallery: GalleryItem[] = JSON.parse(localGallery);
        if (Array.isArray(gallery) && gallery.length > 0) {
          await this.saveGalleryItems(gallery);
          console.log(`Migrated ${gallery.length} gallery items to IndexedDB`);
        }
        localStorage.removeItem('protagonist_gallery');
      }
    } catch (e) {
      console.error("Migration failed:", e);
    }
  },

  // --- Saves ---
  async getAllSaves(): Promise<SavedGame[]> {
    return performTransaction(STORES.SAVES, 'readonly', (store) => store.getAll());
  },

  async saveGame(game: SavedGame): Promise<void> {
    return performTransaction(STORES.SAVES, 'readwrite', (store) => store.put(game));
  },

  async saveGames(games: SavedGame[]): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SAVES, 'readwrite');
      const store = transaction.objectStore(STORES.SAVES);
      
      games.forEach(game => store.put(game));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  async deleteGame(id: string): Promise<void> {
    return performTransaction(STORES.SAVES, 'readwrite', (store) => store.delete(id));
  },

  async deleteGames(ids: string[]): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SAVES, 'readwrite');
      const store = transaction.objectStore(STORES.SAVES);
      
      ids.forEach(id => store.delete(id));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  // --- Gallery ---
  async getAllGallery(): Promise<GalleryItem[]> {
    return performTransaction(STORES.GALLERY, 'readonly', (store) => store.getAll());
  },

  async saveGalleryItem(item: GalleryItem): Promise<void> {
    return performTransaction(STORES.GALLERY, 'readwrite', (store) => store.put(item));
  },

  async saveGalleryItems(items: GalleryItem[]): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.GALLERY, 'readwrite');
      const store = transaction.objectStore(STORES.GALLERY);
      
      items.forEach(item => store.put(item));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  async deleteGalleryItem(id: string): Promise<void> {
    return performTransaction(STORES.GALLERY, 'readwrite', (store) => store.delete(id));
  }
};
