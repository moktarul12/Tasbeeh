import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import HomeScreen from './src/components/HomeScreen';
import SelectorScreen from './src/components/SelectorScreen';
import CounterScreen from './src/components/CounterScreen';
import AddCustomScreen from './src/components/AddCustomScreen';
import FreeCounterScreen from './src/components/FreeCounterScreen';
import QiblaScreen from './src/components/QiblaScreen';
import PrayerTimesScreen from './src/components/PrayerTimesScreen';
import SettingsScreen from './src/components/SettingsScreen';
import { I18nProvider, useI18n } from './src/i18n';
import { theme } from './src/theme';

const TABS = [
  { key: 'home', icon: '✦', labelKey: 'navDhikr' },
  { key: 'free', icon: '⊙', labelKey: 'navCounter' },
  { key: 'qibla', icon: '🧭', labelKey: 'navQibla' },
  { key: 'prayer', icon: '🕌', labelKey: 'navPrayer' },
  { key: 'settings', icon: '⚙', labelKey: 'navSettings' },
];

function AppContent() {
  const { t } = useI18n();
  const [tab, setTab] = useState('home');
  const [screen, setScreen] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleTabChange = (newTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTab(newTab);
    setScreen(newTab);
    setSelectedCategory(null);
    setSelectedItem(null);
  };

  const handleSelectCategory = (catId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(catId);
    setScreen('selector');
  };

  const handleSelectItem = (item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedItem(item);
    setScreen('counter');
  };

  const handleAddCustom = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScreen('addcustom');
  };

  const handleCustomAdded = (item, startNow = false) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (startNow) { setSelectedItem(item); setScreen('counter'); }
    else setScreen('selector');
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (screen === 'counter') { setScreen('selector'); setSelectedItem(null); }
    else if (screen === 'selector') { setScreen('home'); setSelectedCategory(null); }
    else if (screen === 'addcustom') setScreen('selector');
  };

  const showBottomNav = ['home', 'free', 'qibla', 'prayer', 'settings'].includes(screen);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.flex}>
        {screen === 'home' && <HomeScreen onSelectCategory={handleSelectCategory} />}
        {screen === 'free' && <FreeCounterScreen />}
        {screen === 'qibla' && <QiblaScreen />}
        {screen === 'prayer' && <PrayerTimesScreen />}
        {screen === 'settings' && <SettingsScreen />}
        {screen === 'selector' && selectedCategory && (
          <SelectorScreen categoryId={selectedCategory} onSelectItem={handleSelectItem} onBack={handleBack} onAddCustom={handleAddCustom} />
        )}
        {screen === 'addcustom' && selectedCategory && (
          <AddCustomScreen categoryId={selectedCategory} onBack={handleBack} onAdded={handleCustomAdded} />
        )}
        {screen === 'counter' && selectedItem && selectedCategory && (
          <CounterScreen item={selectedItem} categoryId={selectedCategory} onBack={handleBack} />
        )}

        {showBottomNav && (
          <SafeAreaView style={styles.navSafe}>
            <View style={styles.navBar}>
              {TABS.map((cfg) => (
                <TouchableOpacity
                  key={cfg.key}
                  style={styles.navItem}
                  onPress={() => handleTabChange(cfg.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.navIcon, tab === cfg.key && styles.navIconActive]}>{cfg.icon}</Text>
                  <Text style={[styles.navLabel, tab === cfg.key && styles.navLabelActive]}>{t(cfg.labelKey)}</Text>
                  {tab === cfg.key && <View style={styles.navIndicator} />}
                </TouchableOpacity>
              ))}
            </View>
          </SafeAreaView>
        )}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.cream },
  flex: { flex: 1 },
  navSafe: { backgroundColor: theme.creamLight },
  navBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.borderLight,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  navIcon: { fontSize: 20, color: theme.textMuted },
  navIconActive: { color: theme.green },
  navLabel: { fontSize: 10, color: theme.textMuted, marginTop: 3 },
  navLabelActive: { color: theme.green, fontWeight: '600' },
  navIndicator: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.gold, marginTop: 4 },
});
