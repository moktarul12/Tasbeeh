import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, ScrollView, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { theme } from '../theme';
import { useI18n } from '../i18n';
import { saveCount, loadCount, clearCount } from '../utils/storage';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(width * 0.65, 260);

export default function CounterScreen({ item, categoryId, onBack }) {
  useKeepAwake();
  const { t } = useI18n();
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [targetReached, setTargetReached] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      const saved = await loadCount(item.id);
      if (saved) { setCount(saved.count || 0); setCycles(saved.cycles || 0); }
      setLoaded(true);
    })();
  }, [item.id]);

  useEffect(() => {
    return () => { if (loaded) saveCount(item.id, count, cycles); };
  }, []);

  const handleTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
    ]).start();
    setCount((prev) => {
      const next = prev + 1;
      if (next === item.target) {
        setTargetReached(true);
        setCycles((c) => c + 1);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      return next;
    });
  }, [item.target]);

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCount(0);
    setTargetReached(false);
  };

  const handleResetAll = () => {
    Alert.alert(t('resetEverything'), t('resetConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('reset'), style: 'destructive', onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setCount(0); setCycles(0); setTargetReached(false); clearCount(item.id);
      }},
    ]);
  };

  const progress = item.target > 0 ? Math.min(count / item.target, 1) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>‹ {t('back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleResetAll}>
          <Text style={styles.resetAllText}>{t('resetAll')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.arabic}>{item.arabic}</Text>
        <Text style={styles.transliteration}>{item.transliteration.split('\n')[0]}</Text>
        <Text style={styles.translation}>{item.translation.split('\n')[0]}</Text>

        <View style={styles.counterArea}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity activeOpacity={0.8} onPress={handleTap} style={styles.circleOuter}>
              <View style={styles.circleInner}>
                <Text style={styles.countNumber}>{count}</Text>
                <Text style={styles.countTarget}>
                  {targetReached ? t('targetReached') : `${t('of')} ${item.target}`}
                </Text>
              </View>
              <View style={[styles.progressRing, {
                borderTopColor: progress > 0 ? theme.gold : 'transparent',
                borderRightColor: progress > 0.25 ? theme.gold : 'transparent',
                borderBottomColor: progress > 0.5 ? theme.gold : 'transparent',
                borderLeftColor: progress > 0.75 ? theme.gold : 'transparent',
              }]} />
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.tapHint}>
            {targetReached ? t('keepGoing') : t('tapToCount')}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{cycles}</Text>
            <Text style={styles.statLabel}>{t('cycles')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{count + cycles * item.target}</Text>
            <Text style={styles.statLabel}>{t('total')}</Text>
          </View>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem} onPress={handleReset}>
            <Text style={styles.statValue}>↺</Text>
            <Text style={styles.statLabel}>{t('resetCount')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.virtueBox}>
          <Text style={styles.virtueText}>{item.virtue}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.cream },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 52, paddingHorizontal: 24, paddingBottom: 8 },
  backBtn: { paddingVertical: 8 },
  backText: { fontSize: 16, color: theme.green, fontWeight: '600' },
  resetAllText: { fontSize: 14, color: theme.danger, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 100 },
  arabic: { fontSize: 28, color: theme.green, textAlign: 'center', lineHeight: 50, fontWeight: '600', marginTop: 16 },
  transliteration: { fontSize: 15, color: theme.textSecondary, textAlign: 'center', fontStyle: 'italic', marginTop: 10 },
  translation: { fontSize: 13, color: theme.textMuted, textAlign: 'center', marginTop: 4 },
  counterArea: { alignItems: 'center', marginTop: 36, marginBottom: 28 },
  circleOuter: {
    width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: theme.green, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: theme.gold,
  },
  circleInner: { justifyContent: 'center', alignItems: 'center' },
  countNumber: { fontSize: 64, fontWeight: 'bold', color: theme.creamLight },
  countTarget: { fontSize: 14, color: theme.goldLight, marginTop: 4 },
  progressRing: {
    position: 'absolute', width: CIRCLE_SIZE + 12, height: CIRCLE_SIZE + 12,
    borderRadius: (CIRCLE_SIZE + 12) / 2, borderWidth: 3,
    borderColor: 'rgba(201, 162, 39, 0.15)', transform: [{ rotate: '-90deg' }],
  },
  tapHint: { fontSize: 13, color: theme.textMuted, marginTop: 20 },
  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    backgroundColor: theme.creamLight, borderRadius: 14, paddingVertical: 16,
    borderWidth: 1, borderColor: theme.borderLight,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: theme.green },
  statLabel: { fontSize: 11, color: theme.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: theme.border },
  virtueBox: {
    marginTop: 20, backgroundColor: theme.creamLight, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: theme.borderLight,
  },
  virtueText: { fontSize: 13, color: theme.textSecondary, textAlign: 'center', lineHeight: 20 },
});
