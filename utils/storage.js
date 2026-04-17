import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage wrapper for persisted mobile data
 */
export const Storage = {
  getProfile: async () => {
    try {
      const data = await AsyncStorage.getItem('railwayProfile');
      return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
  },
  
  saveProfile: async (profile) => {
    try {
      await AsyncStorage.setItem('railwayProfile', JSON.stringify(profile));
    } catch (e) { console.error('Storage Error', e); }
  },

  getEntries: async () => {
    try {
      const data = await AsyncStorage.getItem('taEntries');
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  },

  saveEntry: async (entry) => {
    try {
      const existing = await Storage.getEntries();
      const updated = [...existing, entry];
      await AsyncStorage.setItem('taEntries', JSON.stringify(updated));
    } catch (e) { console.error('Storage Error', e); }
  },

  deleteEntry: async (id) => {
    try {
      const existing = await Storage.getEntries();
      const updated = existing.filter(e => e.id !== id);
      await AsyncStorage.setItem('taEntries', JSON.stringify(updated));
      return updated;
    } catch (e) { return []; }
  }
};
