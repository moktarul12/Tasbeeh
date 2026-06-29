import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';
import { useI18n } from '../i18n';

const RAMADAN_KEY = '@tashbeeh_ramadan_mode';

const PRAYER_ICONS = {
  fajr: '🌅',
  sunrise: '☀️',
  dhuhr: '☀️',
  asr: '🌤️',
  maghrib: '🌆',
  isha: '🌙',
};

function formatTime(timeStr) {
  if (!timeStr) return '--:--';
  const time = timeStr.split(' ')[0];
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function getNextPrayer(timings) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const prayers = [
    { key: 'fajr', time: timings.Fajr },
    { key: 'dhuhr', time: timings.Dhuhr },
    { key: 'asr', time: timings.Asr },
    { key: 'maghrib', time: timings.Maghrib },
    { key: 'isha', time: timings.Isha },
  ];

  for (const prayer of prayers) {
    const [h, m] = prayer.time.split(' ')[0].split(':').map(Number);
    const prayerMinutes = h * 60 + m;
    if (prayerMinutes > nowMinutes) {
      const diff = prayerMinutes - nowMinutes;
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      return {
        ...prayer,
        countdown: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
      };
    }
  }

  // Next is Fajr tomorrow
  const [h, m] = prayers[0].time.split(' ')[0].split(':').map(Number);
  const fajrMinutes = h * 60 + m + 24 * 60;
  const diff = fajrMinutes - nowMinutes;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  return {
    ...prayers[0],
    countdown: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
  };
}

export default function PrayerTimesScreen() {
  const { t } = useI18n();
  const [timings, setTimings] = useState(null);
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [ramadanMode, setRamadanMode] = useState(false);
  const [nextPrayer, setNextPrayer] = useState(null);

  useEffect(() => {
    loadRamadanMode();
    fetchPrayerTimes();
  }, []);

  useEffect(() => {
    if (timings) {
      setNextPrayer(getNextPrayer(timings));
    }
  }, [timings]);

  const loadRamadanMode = async () => {
    try {
      const val = await AsyncStorage.getItem(RAMADAN_KEY);
      setRamadanMode(val === 'true');
    } catch {
      // silent
    }
  };

  const toggleRamadanMode = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newVal = !ramadanMode;
    setRamadanMode(newVal);
    try {
      await AsyncStorage.setItem(RAMADAN_KEY, String(newVal));
    } catch {
      // silent
    }
  };

  const fetchPrayerTimes = async () => {
    setStatus('loading');
    try {
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      let permStatus = existingStatus;
      if (existingStatus !== 'granted') {
        permStatus = (await Location.requestForegroundPermissionsAsync()).status;
      }
      if (permStatus !== 'granted') {
        setErrorMsg(t('locationDenied'));
        setStatus('denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      const date = new Date();
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${loc.coords.latitude}&longitude=${loc.coords.longitude}&method=2`
      );
      const data = await response.json();

      if (data.data && data.data.timings) {
        setTimings(data.data.timings);
        setStatus('ready');
      } else {
        setErrorMsg('Unable to fetch prayer times.');
        setStatus('error');
      }
    } catch (e) {
      setErrorMsg('Unable to fetch prayer times. Check your connection.');
      setStatus('error');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPrayerTimes();
    setRefreshing(false);
  };

  const prayerList = timings
    ? [
        { key: 'fajr', label: t('fajr'), time: timings.Fajr, isRamadan: true, ramadanLabel: t('sehri') },
        { key: 'sunrise', label: t('sunrise'), time: timings.Sunrise },
        { key: 'dhuhr', label: t('dhuhr'), time: timings.Dhuhr },
        { key: 'asr', label: t('asr'), time: timings.Asr },
        { key: 'maghrib', label: t('maghrib'), time: timings.Maghrib, isRamadan: true, ramadanLabel: t('iftar') },
        { key: 'isha', label: t('isha'), time: timings.Isha },
      ]
    : [];

  if (status === 'idle' || status === 'loading') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('prayerTimes')}</Text>
          <Text style={styles.headerSubtitle}>{t('prayerSubtitle')}</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>{t('loadingTimes')}</Text>
        </View>
      </View>
    );
  }

  if (status === 'denied' || status === 'error') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('prayerTimes')}</Text>
          <Text style={styles.headerSubtitle}>{t('prayerSubtitle')}</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>🕌</Text>
          <Text style={styles.errorText}>{errorMsg || t('enableLocationPrayer')}</Text>
          <TouchableOpacity onPress={fetchPrayerTimes} style={styles.retryBtn}>
            <Text style={styles.retryText}>{t('enableLocationBtn')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('prayerTimes')}</Text>
        <Text style={styles.headerSubtitle}>{t('prayerSubtitle')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.dark.gold} />
        }
      >
        {/* Next Prayer Card */}
        {nextPrayer && (
          <View style={styles.nextPrayerCard}>
            <Text style={styles.nextPrayerLabel}>{t('nextPrayer')}</Text>
            <View style={styles.nextPrayerRow}>
              <Text style={styles.nextPrayerIcon}>
                {PRAYER_ICONS[nextPrayer.key] || '🕌'}
              </Text>
              <Text style={styles.nextPrayerName}>{t(nextPrayer.key)}</Text>
              <Text style={styles.nextPrayerCountdown}>
                {t('in')} {nextPrayer.countdown}
              </Text>
            </View>
          </View>
        )}

        {/* Ramadan Mode Toggle */}
        <TouchableOpacity
          onPress={toggleRamadanMode}
          activeOpacity={0.85}
          style={styles.ramadanToggle}
        >
          <View style={styles.ramadanToggleLeft}>
            <Text style={styles.ramadanIcon}>🌙</Text>
            <View>
              <Text style={styles.ramadanTitle}>{t('ramadanMode')}</Text>
              <Text style={styles.ramadanDesc}>{t('ramadanModeDesc')}</Text>
            </View>
          </View>
          <View style={[styles.toggle, ramadanMode && styles.toggleOn]}>
            <View style={[styles.toggleKnob, ramadanMode && styles.toggleKnobOn]} />
          </View>
        </TouchableOpacity>

        {/* Prayer Times List */}
        <View style={styles.prayerList}>
          {prayerList.map((prayer, index) => (
            <View
              key={prayer.key}
              style={[
                styles.prayerItem,
                index === prayerList.length - 1 && styles.prayerItemLast,
              ]}
            >
              <View style={styles.prayerItemLeft}>
                <Text style={styles.prayerIcon}>{PRAYER_ICONS[prayer.key]}</Text>
                <View>
                  <Text style={styles.prayerName}>{prayer.label}</Text>
                  {ramadanMode && prayer.isRamadan && (
                    <Text style={styles.ramadanTag}>{prayer.ramadanLabel}</Text>
                  )}
                </View>
              </View>
              <Text style={styles.prayerTime}>{formatTime(prayer.time)}</Text>
            </View>
          ))}
        </View>

        {/* Ramadan Info */}
        {ramadanMode && timings && (
          <View style={styles.ramadanInfoCard}>
            <Text style={styles.ramadanInfoTitle}>🌙 Ramadan Timings</Text>
            <View style={styles.ramadanInfoRow}>
              <Text style={styles.ramadanInfoLabel}>{t('sehri')}</Text>
              <Text style={styles.ramadanInfoTime}>{formatTime(timings.Fajr)}</Text>
            </View>
            <View style={styles.ramadanInfoDivider} />
            <View style={styles.ramadanInfoRow}>
              <Text style={styles.ramadanInfoLabel}>{t('iftar')}</Text>
              <Text style={styles.ramadanInfoTime}>{formatTime(timings.Maghrib)}</Text>
            </View>
          </View>
        )}

        {/* Refresh Button */}
        <TouchableOpacity onPress={fetchPrayerTimes} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>↻ {t('refresh')}</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 16,
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    color: theme.dark.textSecondary,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: theme.dark.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: theme.dark.gold,
  },
  retryText: {
    fontSize: 15,
    color: theme.dark.gold,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nextPrayerCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
  },
  nextPrayerLabel: {
    fontSize: 12,
    color: theme.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  nextPrayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextPrayerIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  nextPrayerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.dark.goldLight,
    flex: 1,
  },
  nextPrayerCountdown: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.dark.text,
  },
  ramadanToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  ramadanToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ramadanIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  ramadanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.dark.text,
  },
  ramadanDesc: {
    fontSize: 12,
    color: theme.dark.textMuted,
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    padding: 3,
  },
  toggleOn: {
    backgroundColor: theme.dark.gold,
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  toggleKnobOn: {
    alignSelf: 'flex-end',
  },
  prayerList: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    overflow: 'hidden',
  },
  prayerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  prayerItemLast: {
    borderBottomWidth: 0,
  },
  prayerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  prayerName: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.dark.text,
  },
  ramadanTag: {
    fontSize: 11,
    color: theme.dark.gold,
    marginTop: 2,
  },
  prayerTime: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.dark.goldLight,
  },
  ramadanInfoCard: {
    backgroundColor: 'rgba(45, 212, 191, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.20)',
    borderRadius: 18,
    padding: 20,
    marginTop: 16,
  },
  ramadanInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.dark.teal,
    marginBottom: 14,
  },
  ramadanInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ramadanInfoLabel: {
    fontSize: 16,
    color: theme.dark.text,
    fontWeight: '600',
  },
  ramadanInfoTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.dark.teal,
  },
  ramadanInfoDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 12,
  },
  refreshBtn: {
    alignSelf: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  refreshText: {
    fontSize: 14,
    color: theme.dark.textSecondary,
    fontWeight: '600',
  },
});
