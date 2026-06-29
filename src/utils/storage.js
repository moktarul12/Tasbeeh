import AsyncStorage from '@react-native-async-storage/async-storage';

const CUSTOM_KEY = '@tashbeeh_custom_dhikr';
const COUNTS_KEY = '@tashbeeh_counts';

export async function getCustomDhikr() {
  try {
    const data = await AsyncStorage.getItem(CUSTOM_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function addCustomDhikr(item) {
  try {
    const existing = await getCustomDhikr();
    const updated = [...existing, item];
    await AsyncStorage.setItem(CUSTOM_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export async function removeCustomDhikr(id) {
  try {
    const existing = await getCustomDhikr();
    const updated = existing.filter((d) => d.id !== id);
    await AsyncStorage.setItem(CUSTOM_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export async function saveCount(dhikrId, count, cycles) {
  try {
    const data = await AsyncStorage.getItem(COUNTS_KEY);
    const counts = data ? JSON.parse(data) : {};
    counts[dhikrId] = { count, cycles, savedAt: Date.now() };
    await AsyncStorage.setItem(COUNTS_KEY, JSON.stringify(counts));
  } catch (e) {
    // silent fail
  }
}

export async function loadCount(dhikrId) {
  try {
    const data = await AsyncStorage.getItem(COUNTS_KEY);
    const counts = data ? JSON.parse(data) : {};
    return counts[dhikrId] || null;
  } catch {
    return null;
  }
}

export async function clearCount(dhikrId) {
  try {
    const data = await AsyncStorage.getItem(COUNTS_KEY);
    const counts = data ? JSON.parse(data) : {};
    delete counts[dhikrId];
    await AsyncStorage.setItem(COUNTS_KEY, JSON.stringify(counts));
  } catch {
    // silent fail
  }
}

export async function getAllCounts() {
  try {
    const data = await AsyncStorage.getItem(COUNTS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}
