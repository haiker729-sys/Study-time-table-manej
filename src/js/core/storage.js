/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const STORAGE_PREFIX = 'aether_study_';

export const Storage = {
  /**
   * Safe save to localStorage
   */
  save(key, value) {
    try {
      const stringValue = JSON.stringify(value);
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, stringValue);
      return true;
    } catch (e) {
      console.error('[Storage] Write Error:', e);
      return false;
    }
  },

  /**
   * Safe load with validation
   */
  load(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (!item) return defaultValue;
      
      const parsed = JSON.parse(item);
      // Merge with default value for structure stability if it's an object
      if (defaultValue && typeof defaultValue === 'object' && !Array.isArray(defaultValue)) {
        return { ...defaultValue, ...parsed };
      }
      return parsed;
    } catch (e) {
      console.error('[Storage] Read/Parse Error:', e);
      return defaultValue;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch (e) {
      console.error('[Storage] Remove Error:', e);
    }
  },

  clear() {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(STORAGE_PREFIX))
        .forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.error('[Storage] Clear Error:', e);
    }
  }
};
