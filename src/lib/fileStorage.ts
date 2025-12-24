// IndexedDB service for storing binary files (images, PDFs, videos)

import { DB_CONFIG } from "@/types";

interface StoredFile {
  id: string;
  file: File;
  timestamp: number;
}

/**
 * IndexedDB wrapper for storing large binary files
 */
class FileStorageService {
  private dbName = DB_CONFIG.name;
  private dbVersion = DB_CONFIG.version;
  private storeName = DB_CONFIG.stores.files;
  private db: IDBDatabase | null = null;

  /**
   * Initialize the database
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error("Failed to open IndexedDB:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "id" });
        }
      };
    });
  }

  /**
   * Ensure database is initialized
   */
  private async ensureDb(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error("Failed to initialize database");
    }
    return this.db;
  }

  /**
   * Save a file to IndexedDB
   */
  async saveFile(id: string, file: File): Promise<boolean> {
    try {
      const db = await this.ensureDb();
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      const storedFile: StoredFile = {
        id,
        file,
        timestamp: Date.now(),
      };

      return new Promise((resolve, reject) => {
        const request = store.put(storedFile);

        request.onsuccess = () => resolve(true);
        request.onerror = () => {
          console.error("Error saving file:", request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("Error in saveFile:", error);
      return false;
    }
  }

  /**
   * Get a file from IndexedDB
   */
  async getFile(id: string): Promise<File | null> {
    try {
      const db = await this.ensureDb();
      const transaction = db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.get(id);

        request.onsuccess = () => {
          const result = request.result as StoredFile | undefined;
          resolve(result?.file || null);
        };
        request.onerror = () => {
          console.error("Error getting file:", request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("Error in getFile:", error);
      return null;
    }
  }

  /**
   * Delete a file from IndexedDB
   */
  async deleteFile(id: string): Promise<boolean> {
    try {
      const db = await this.ensureDb();
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => {
          console.error("Error deleting file:", request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("Error in deleteFile:", error);
      return false;
    }
  }

  /**
   * Get all file IDs
   */
  async getAllFileIds(): Promise<string[]> {
    try {
      const db = await this.ensureDb();
      const transaction = db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.getAllKeys();

        request.onsuccess = () => {
          resolve(request.result as string[]);
        };
        request.onerror = () => {
          console.error("Error getting file IDs:", request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("Error in getAllFileIds:", error);
      return [];
    }
  }

  /**
   * Clear all files
   */
  async clearAll(): Promise<boolean> {
    try {
      const db = await this.ensureDb();
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.clear();

        request.onsuccess = () => resolve(true);
        request.onerror = () => {
          console.error("Error clearing files:", request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("Error in clearAll:", error);
      return false;
    }
  }

  /**
   * Convert a file to a preview URL (for images)
   */
  async getFilePreview(id: string): Promise<string | null> {
    const file = await this.getFile(id);
    if (!file) return null;

    // Only create preview for images
    if (!file.type.startsWith("image/")) return null;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        console.error("Error reading file for preview");
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get storage usage info
   */
  async getStorageInfo(): Promise<{ count: number; ids: string[] }> {
    const ids = await this.getAllFileIds();
    return {
      count: ids.length,
      ids,
    };
  }
}

// Export singleton instance
export const fileStorage = new FileStorageService();

// Initialize on import
if (typeof window !== "undefined") {
  fileStorage.init().catch((error) => {
    console.error("Failed to initialize file storage:", error);
  });
}

/**
 * Helper functions for common file operations
 */

/**
 * Convert File to base64 string (for small files or fallback)
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert base64 string back to File
 */
export function base64ToFile(base64: string, fileName: string, mimeType: string): File {
  const arr = base64.split(",");
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], fileName, { type: mimeType });
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Validate file type
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some((type) => {
    if (type.endsWith("/*")) {
      const baseType = type.split("/")[0];
      return file.type.startsWith(baseType + "/");
    }
    return file.type === type || file.name.endsWith(type);
  });
}
