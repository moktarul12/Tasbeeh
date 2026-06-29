import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import HomeScreen from './src/components/HomeScreen';
import SelectorScreen from './src/components/SelectorScreen';
import CounterScreen from './src/components/CounterScreen';
import AddCustomScreen from './src/components/AddCustomScreen';
import { theme } from './src/theme';

export default function App() {
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
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
