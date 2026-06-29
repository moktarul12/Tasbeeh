import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import HomeScreen from './src/components/HomeScreen';
import SelectorScreen from './src/components/SelectorScreen';
import CounterScreen from './src/components/CounterScreen';
import AddCustomScreen from './src/components/AddCustomScreen';
import FreeCounterScreen from './src/components/FreeCounterScreen';
import { theme } from './src/theme';

export default function App() {
  const [tab, setTab] = useState('home');
  const [screen, setScreen] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    setFontsLoaded(true);
  }, []);

  const handleSelectCategory = (catId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(catId);
    setScreen('selector');
  };

  const handleTabChange = (newTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTab(newTab);
    setScreen(newTab);
    setSelectedCategory(null);
    setSelectedItem(null);
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
    if (startNow) {
      setSelectedItem(item);
      setScreen('counter');
    } else {
      setScreen('selector');
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (screen === 'counter') {
      setScreen('selector');
      setSelectedItem(null);
    } else if (screen === 'selector') {
      setScreen('home');
      setSelectedCategory(null);
    } else if (screen === 'addcustom') {
      setScreen('selector');
    }
  };

  const showBottomNav = screen === 'home' || screen === 'free';

  if (!fontsLoaded) {
    return (
      <LinearGradient colors={theme.dark.bgGradient} style={styles.flex}>
        <StatusBar style="light" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={theme.dark.bgGradient} style={styles.flex}>
      <StatusBar style="light" />
      <View style={styles.flex}>
        {screen === 'home' && (
          <HomeScreen onSelectCategory={handleSelectCategory} />
        )}
        {screen === 'free' && <FreeCounterScreen />}
        {screen === 'selector' && selectedCategory && (
          <SelectorScreen
            categoryId={selectedCategory}
            onSelectItem={handleSelectItem}
            onBack={handleBack}
            onAddCustom={handleAddCustom}
          />
        )}
        {screen === 'addcustom' && selectedCategory && (
          <AddCustomScreen
            categoryId={selectedCategory}
            onBack={handleBack}
            onAdded={handleCustomAdded}
          />
        )}
        {screen === 'counter' && selectedItem && selectedCategory && (
          <CounterScreen
            item={selectedItem}
            categoryId={selectedCategory}
            onBack={handleBack}
          />
        )}

        {showBottomNav && (
          <View style={styles.bottomNav}>
            <TouchableOpacity
              style={[styles.navItem, tab === 'home' && styles.navItemActive]}
              onPress={() => handleTabChange('home')}
            >
              <Text style={[styles.navIcon, tab === 'home' && styles.navIconActive]}>
                ☾
              </Text>
              <Text style={[styles.navLabel, tab === 'home' && styles.navLabelActive]}>
                Dhikr
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navItem, tab === 'free' && styles.navItemActive]}
              onPress={() => handleTabChange('free')}
            >
              <Text style={[styles.navIcon, tab === 'free' && styles.navIconActive]}>
                ⊙
              </Text>
              <Text style={[styles.navLabel, tab === 'free' && styles.navLabelActive]}>
                Counter
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 24,
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  navIcon: {
    fontSize: 24,
    color: theme.dark.textMuted,
  },
  navIconActive: {
    color: theme.dark.gold,
  },
  navLabel: {
    fontSize: 11,
    color: theme.dark.textMuted,
    marginTop: 2,
  },
  navLabelActive: {
    color: theme.dark.gold,
    fontWeight: '600',
  },
});
