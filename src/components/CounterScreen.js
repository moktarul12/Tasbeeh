import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import ProgressRing from './ProgressRing';
import { categoryColors, theme } from '../theme';
import { saveCount, loadCount, clearCount } from '../utils/storage';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(width * 0.72, 300);

export default function CounterScreen({ item, categoryId, onBack }) {
  useKeepAwake();

  const colors = categoryColors[categoryId];
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [showText, setShowText] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const celebrateAnim = useRef(new Animated.Value(0)).current;

  const progress = item.target > 0 ? count / item.target : 0;

  // Auto-load saved count on mount
  useEffect(() => {
    (async () => {
      const saved = await loadCount(item.id);
      if (saved) {
        setCount(saved.count || 0);
        setCycles(saved.cycles || 0);
      }
      setLoaded(true);
    })();
  }, [item.id]);

  // Auto-save count whenever it changes (after initial load)
  useEffect(() => {
    if (loaded) {
      saveCount(item.id, count, cycles);
    }
  }, [count, cycles, loaded, item.id]);

  useEffect(() => {
    Animated.timing(ringAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const handleTap = useCallback(() => {
    if (completed) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Pulse animation
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

    setCount((prev) => {
      const next = prev + 1;
      if (next >= item.target) {
        // Cycle complete!
        setCompleted(true);
        setCycles((c) => c + 1);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Celebration animation
        Animated.sequence([
          Animated.timing(celebrateAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(800),
          Animated.timing(celebrateAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();

        // Auto reset after celebration
        setTimeout(() => {
          setCompleted(false);
          setCount(0);
        }, 1500);

        return next;
      }
      return next;
    });
  }, [completed, item.target]);

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCount(0);
    setCompleted(false);
  };

  // Save count on unmount
  useEffect(() => {
    return () => {
      if (loaded) {
        saveCount(item.id, count, cycles);
      }
    };
  }, []);

  const handleResetAll = () => {
    Alert.alert(
      'Reset Everything?',
      'This will reset your count and cycles to zero.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setCount(0);
            setCycles(0);
            setCompleted(false);
            clearCount(item.id);
          },
        },
      ]
    );
  };

  const celebrateScale = celebrateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const celebrateOpacity = celebrateAnim;

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.topBtn}>
          <Text style={styles.topBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>
          {item.transliteration.split('\n')[0]}
        </Text>
        <TouchableOpacity onPress={handleResetAll} style={styles.topBtn}>
          <Text style={styles.resetIcon}>↺</Text>
        </TouchableOpacity>
      </View>

      {/* Dhikr Text Display */}
      <View style={styles.textSection}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowText(!showText)}
        >
          <Text style={styles.arabicText}>{item.arabic}</Text>
        </TouchableOpacity>

        {showText && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowTranslation(!showTranslation)}
          >
            <Text style={styles.transliteration}>{item.transliteration}</Text>
            {showTranslation && (
              <Text style={styles.translation}>{item.translation}</Text>
            )}
            <Text style={styles.tapHint}>
              {showTranslation ? 'Tap to hide translation' : 'Tap to see translation'}
            </Text>
          </TouchableOpacity>
        )}

        {!showText && (
          <Text style={styles.tapHint}>Tap text to show what you're reading</Text>
        )}
      </View>

      {/* Counter Circle */}
      <View style={styles.counterSection}>
        <Animated.View style={{ transform: [{ scale: celebrateScale }] }}>
          <ProgressRing
            size={CIRCLE_SIZE}
            strokeWidth={6}
            progress={ringAnim}
            color={colors.accent}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleTap}
              disabled={completed}
              style={styles.tapArea}
            >
              <Animated.View
                style={[
                  styles.tapInner,
                  {
                    transform: [{ scale: scaleAnim }],
                    borderColor: completed ? theme.dark.success : colors.accent,
                    backgroundColor: completed
                      ? 'rgba(34, 197, 94, 0.08)'
                      : `${colors.glow}`,
                  },
                ]}
              >
                {completed ? (
                  <>
                    <Text style={styles.completedEmoji}>✓</Text>
                    <Text style={styles.completedText}>Complete!</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.countNumber}>{count}</Text>
                    <Text style={styles.countTarget}>of {item.target}</Text>
                  </>
                )}
              </Animated.View>
            </TouchableOpacity>
          </ProgressRing>
        </Animated.View>

        {/* Tap instruction */}
        <Text style={styles.tapInstruction}>
          {completed ? 'MashaAllah! Starting next cycle...' : 'Tap the circle to count'}
        </Text>
      </View>

      {/* Bottom Stats */}
      <View style={styles.bottomBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{cycles}</Text>
          <Text style={styles.statLabel}>Cycles</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{count + cycles * item.target}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={styles.statDivider} />

        <TouchableOpacity style={styles.statItem} onPress={handleReset}>
          <Text style={styles.statValue}>↺</Text>
          <Text style={styles.statLabel}>Reset Count</Text>
        </TouchableOpacity>
      </View>

      {/* Virtue banner */}
      <View style={styles.virtueBanner}>
        <Text style={styles.virtueText}>✦ {item.virtue}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  topBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBtnText: {
    fontSize: 28,
    color: theme.dark.text,
    marginTop: -4,
  },
  resetIcon: {
    fontSize: 24,
    color: theme.dark.text,
  },
  topTitle: {
    fontSize: 16,
    color: theme.dark.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  textSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  arabicText: {
    fontSize: 24,
    color: theme.dark.gold,
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 12,
  },
  transliteration: {
    fontSize: 14,
    color: theme.dark.text,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
  translation: {
    fontSize: 13,
    color: theme.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  tapHint: {
    fontSize: 11,
    color: theme.dark.textMuted,
    marginTop: 8,
  },
  counterSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapArea: {
    width: CIRCLE_SIZE - 24,
    height: CIRCLE_SIZE - 24,
    borderRadius: (CIRCLE_SIZE - 24) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapInner: {
    width: '100%',
    height: '100%',
    borderRadius: (CIRCLE_SIZE - 24) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  countNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    color: theme.dark.text,
  },
  countTarget: {
    fontSize: 16,
    color: theme.dark.textSecondary,
    marginTop: 4,
  },
  completedEmoji: {
    fontSize: 56,
    color: theme.dark.success,
    fontWeight: 'bold',
  },
  completedText: {
    fontSize: 18,
    color: theme.dark.success,
    marginTop: 4,
    fontWeight: '600',
  },
  tapInstruction: {
    fontSize: 13,
    color: theme.dark.textMuted,
    marginTop: 20,
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
  virtueBanner: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 4,
  },
  virtueText: {
    fontSize: 12,
    color: theme.dark.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
