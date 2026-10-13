import { defineCollection } from '@/lib/content'

import { browserStorageData, processingsData } from './data'
import { browserStorageSchema, processingSchema } from './schema'

export type { BrowserStorage, Processing } from './schema'

export const processings = defineCollection(
  'privacy-processings',
  processingSchema,
  processingsData,
)

export const browserStorage = defineCollection(
  'privacy-browser-storage',
  browserStorageSchema,
  browserStorageData,
)

/**
 * Erases everything the site stored in this browser (the keys of the inventory only, so
 * nothing else on the same origin is touched). Returns false if storage is unavailable.
 */
export function clearBrowserStorage(): boolean {
  try {
    for (const { key, storage } of browserStorage.all) window[storage].removeItem(key)
    return true
  } catch {
    // Storage blocked (private mode, site data disabled): there is nothing to erase.
    return false
  }
}
