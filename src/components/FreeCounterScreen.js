import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { theme } from '../theme';
import { useI18n } from '../i18n';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(width * 0.72, 300);

export default function FreeCounterScreen() {
  useKeepAwake();
  const { t } = useI18n();

  const [count, setCount] = useState(0);
  const [sessions, setSessions] = useState(0);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.35],
  });

  const handleTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    setCount((prev) => prev + 1);
  }, []);

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (count > 0) {
      setSessions((s) => s + 1);
    }
    setCount(0);
  };

  const handleResetAll = () => {
    Alert.alert(t('resetEverything'), t('resetConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('reset'),
        style: 'destructive',
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setCount(0);
          setSessions(0);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('freeCounter')}</Text>
        <Text style={styles.headerSubtitle}>{t('countAnything')}</Text>
        <TouchableOpacity onPress={handleResetAll} style={styles.resetAllBtn}>
          <Text style={styles.resetAllText}>{t('resetAll')}</Text>
        </TouchableOpacity>
      </View>

      {/* Counter Circle */}
      <View style={styles.counterSection}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <View style={styles.circleOuter}>
            <Animated.View
              style={[styles.circleGlow, { opacity: glowOpacity }]}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleTap}
              style={styles.tapArea}
            >
              <Text style={styles.countNumber}>{count}</Text>
              <Text style={styles.countLabel}>{t('taps')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Text style={styles.tapInstruction}>{t('tapToCount')}</Text>
      </View>

      {/* Bottom Stats */}
      <View style={styles.bottomBar}>
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

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('countWithIntention')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 12,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.dark.text,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.dark.textSecondary,
    marginTop: 4,
  },
  resetAllBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  resetAllText: {
    fontSize: 13,
    color: theme.dark.danger,
    fontWeight: '600',
  },
  counterSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleOuter: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.dark.gold,
  },
  circleGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: (CIRCLE_SIZE + 8) / 2,
    backgroundColor: theme.dark.gold,
  },
  tapArea: {
    width: CIRCLE_SIZE - 24,
    height: CIRCLE_SIZE - 24,
    borderRadius: (CIRCLE_SIZE - 24) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  countNumber: {
    fontSize: 80,
    fontWeight: 'bold',
    color: theme.dark.text,
  },
  countLabel: {
    fontSize: 16,
    color: theme.dark.textSecondary,
    marginTop: 4,
  },
  tapInstruction: {
    fontSize: 13,
    color: theme.dark.textMuted,
    marginTop: 24,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.dark.text,
  },
  statLabel: {
    fontSize: 11,
    color: theme.dark.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 4,
  },
  footerText: {
    fontSize: 12,
    color: theme.dark.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
