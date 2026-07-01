import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { theme } from '../theme';
import { useI18n } from '../i18n';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(width * 0.65, 260);

export default function FreeCounterScreen() {
  useKeepAwake();
  const { t } = useI18n();
  const [count, setCount] = useState(0);
  const [sessions, setSessions] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
    ])).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.6] });

  const handleTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
    ]).start();
    setCount((p) => p + 1);
  }, []);

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (count > 0) setSessions((s) => s + 1);
    setCount(0);
  };

  const handleResetAll = () => {
    Alert.alert(t('resetEverything'), t('resetConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('reset'), style: 'destructive', onPress: () => { setCount(0); setSessions(0); }},
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('freeCounter')}</Text>
        <Text style={styles.headerSub}>{t('countAnything')}</Text>
        <TouchableOpacity onPress={handleResetAll} style={styles.resetAllBtn}>
          <Text style={styles.resetAllText}>{t('resetAll')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.counterArea}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity activeOpacity={0.8} onPress={handleTap} style={styles.circleOuter}>
            <Animated.View style={[styles.circleGlow, { opacity: glowOpacity }]} />
            <Text style={styles.countNumber}>{count}</Text>
            <Text style={styles.countLabel}>{t('taps')}</Text>
          </TouchableOpacity>
        </Animated.View>
        <Text style={styles.tapHint}>{t('tapToCount')}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{count}</Text>
          <Text style={styles.statLabel}>{t('current')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{sessions}</Text>
          <Text style={styles.statLabel}>{t('sessions')}</Text>
        </View>
        <View style={styles.statDivider} />
        <TouchableOpacity style={styles.statItem} onPress={handleReset}>
          <Text style={styles.statValue}>↺</Text>
          <Text style={styles.statLabel}>{t('resetCount')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.cream },
  header: { alignItems: 'center', paddingTop: 56, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: theme.green },
  headerSub: { fontSize: 14, color: theme.textSecondary, marginTop: 4 },
  resetAllBtn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(192, 57, 43, 0.08)', borderWidth: 1, borderColor: 'rgba(192, 57, 43, 0.2)' },
  resetAllText: { fontSize: 13, color: theme.danger, fontWeight: '600' },
  counterArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  circleOuter: {
    width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: theme.green, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: theme.gold,
  },
  circleGlow: {
    position: 'absolute', top: -6, left: -6, right: -6, bottom: -6,
    borderRadius: (CIRCLE_SIZE + 12) / 2, backgroundColor: theme.gold,
  },
  countNumber: { fontSize: 64, fontWeight: 'bold', color: theme.creamLight },
  countLabel: { fontSize: 14, color: theme.goldLight, marginTop: 4 },
  tapHint: { fontSize: 13, color: theme.textMuted, marginTop: 24 },
  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    backgroundColor: theme.creamLight, borderRadius: 14, paddingVertical: 16,
    marginHorizontal: 24, marginBottom: 24, borderWidth: 1, borderColor: theme.borderLight,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: theme.green },
  statLabel: { fontSize: 11, color: theme.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: theme.border },
});
