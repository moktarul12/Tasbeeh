import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';
import { useI18n } from '../i18n';

const RAMADAN_KEY = '@tashbeeh_ramadan_mode';
const PRAYER_ICONS = { fajr: '🌅', sunrise: '☀️', dhuhr: '☀️', asr: '🌤️', maghrib: '🌆', isha: '🌙' };

function formatTime(str) {
  if (!str) return '--:--';
  const [h, m] = str.split(' ')[0].split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;
}

function getNextPrayer(timings, t) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const prayers = [
    { key: 'fajr', time: timings.Fajr, label: t('fajr') },
    { key: 'dhuhr', time: timings.Dhuhr, label: t('dhuhr') },
    { key: 'asr', time: timings.Asr, label: t('asr') },
    { key: 'maghrib', time: timings.Maghrib, label: t('maghrib') },
    { key: 'isha', time: timings.Isha, label: t('isha') },
  ];
  for (const p of prayers) {
    const [h, m] = p.time.split(' ')[0].split(':').map(Number);
    const pMin = h * 60 + m;
    if (pMin > nowMin) {
      const diff = pMin - nowMin;
      return { ...p, countdown: Math.floor(diff / 60) > 0 ? `${Math.floor(diff / 60)}h ${diff % 60}m` : `${diff % 60}m` };
    }
  }
  const [h, m] = prayers[0].time.split(' ')[0].split(':').map(Number);
  const fMin = h * 60 + m + 1440;
  const diff = fMin - nowMin;
  return { ...prayers[0], countdown: Math.floor(diff / 60) > 0 ? `${Math.floor(diff / 60)}h ${diff % 60}m` : `${diff % 60}m` };
}

export default function PrayerTimesScreen() {
  const { t } = useI18n();
  const [timings, setTimings] = useState(null);
  const [status, setStatus] = useState('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [ramadanMode, setRamadanMode] = useState(false);
  const [nextPrayer, setNextPrayer] = useState(null);

  useEffect(() => {
    (async () => {
      try { setRamadanMode(await AsyncStorage.getItem(RAMADAN_KEY) === 'true'); } catch {}
    })();
    fetchTimes();
  }, []);

  useEffect(() => { if (timings) setNextPrayer(getNextPrayer(timings, t)); }, [timings]);

  const toggleRamadan = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const v = !ramadanMode;
    setRamadanMode(v);
    try { await AsyncStorage.setItem(RAMADAN_KEY, String(v)); } catch {}
  };

  const fetchTimes = async () => {
    setStatus('loading');
    try {
      const { status: es } = await Location.getForegroundPermissionsAsync();
      let ps = es;
      if (es !== 'granted') ps = (await Location.requestForegroundPermissionsAsync()).status;
      if (ps !== 'granted') { setStatus('denied'); return; }
      const loc = await Location.getCurrentPositionAsync({});
      const d = new Date();
      const res = await fetch(`https://api.aladhan.com/v1/timings/${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}?latitude=${loc.coords.latitude}&longitude=${loc.coords.longitude}&method=2`);
      const data = await res.json();
      if (data.data?.timings) { setTimings(data.data.timings); setStatus('ready'); }
      else setStatus('error');
    } catch { setStatus('error'); }
  };

  const onRefresh = async () => { setRefreshing(true); await fetchTimes(); setRefreshing(false); };

  const prayerList = timings ? [
    { key: 'fajr', label: t('fajr'), time: timings.Fajr, isRamadan: true, ramadanLabel: t('sehri') },
    { key: 'sunrise', label: t('sunrise'), time: timings.Sunrise },
    { key: 'dhuhr', label: t('dhuhr'), time: timings.Dhuhr },
    { key: 'asr', label: t('asr'), time: timings.Asr },
    { key: 'maghrib', label: t('maghrib'), time: timings.Maghrib, isRamadan: true, ramadanLabel: t('iftar') },
    { key: 'isha', label: t('isha'), time: timings.Isha },
  ] : [];

  if (status === 'loading') {
    return <View style={styles.container}><View style={styles.center}><Text style={styles.loadingText}>{t('loadingTimes')}</Text></View></View>;
  }

  if (status === 'denied' || status === 'error') {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorIcon}>🕌</Text>
          <Text style={styles.errorText}>{t('enableLocation')}</Text>
          <TouchableOpacity onPress={fetchTimes} style={styles.retryBtn}><Text style={styles.retryText}>{t('enableLocationBtn')}</Text></TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('prayerTimes')}</Text>
        <Text style={styles.headerSub}>{t('prayerSubtitle')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.green} />}>

        {nextPrayer && (
          <View style={styles.nextCard}>
            <Text style={styles.nextLabel}>{t('nextPrayer')}</Text>
            <View style={styles.nextRow}>
              <Text style={styles.nextIcon}>{PRAYER_ICONS[nextPrayer.key]}</Text>
              <Text style={styles.nextName}>{nextPrayer.label}</Text>
              <Text style={styles.nextCountdown}>{t('in')} {nextPrayer.countdown}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity onPress={toggleRamadan} activeOpacity={0.7} style={styles.ramadanToggle}>
          <View style={styles.ramadanLeft}>
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

        <View style={styles.prayerList}>
          {prayerList.map((p, i) => (
            <View key={p.key} style={[styles.prayerItem, i === prayerList.length - 1 && styles.prayerItemLast]}>
              <View style={styles.prayerLeft}>
                <Text style={styles.prayerIcon}>{PRAYER_ICONS[p.key]}</Text>
                <View>
                  <Text style={styles.prayerName}>{p.label}</Text>
                  {ramadanMode && p.isRamadan && <Text style={styles.ramadanTag}>{p.ramadanLabel}</Text>}
                </View>
              </View>
              <Text style={styles.prayerTime}>{formatTime(p.time)}</Text>
            </View>
          ))}
        </View>

        {ramadanMode && timings && (
          <View style={styles.ramadanCard}>
            <Text style={styles.ramadanCardTitle}>🌙 Ramadan</Text>
            <View style={styles.ramadanRow}>
              <Text style={styles.ramadanRowLabel}>{t('sehri')}</Text>
              <Text style={styles.ramadanRowTime}>{formatTime(timings.Fajr)}</Text>
            </View>
            <View style={styles.ramadanDivider} />
            <View style={styles.ramadanRow}>
              <Text style={styles.ramadanRowLabel}>{t('iftar')}</Text>
              <Text style={styles.ramadanRowTime}>{formatTime(timings.Maghrib)}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity onPress={fetchTimes} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>↻ {t('refresh')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.cream },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  loadingText: { fontSize: 16, color: theme.textSecondary },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorText: { fontSize: 16, color: theme.textSecondary, textAlign: 'center', marginBottom: 24 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: theme.green },
  retryText: { fontSize: 15, color: theme.creamLight, fontWeight: '600' },
  header: { alignItems: 'center', paddingTop: 56, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: theme.green },
  headerSub: { fontSize: 14, color: theme.textSecondary, marginTop: 4 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 100 },
  nextCard: { backgroundColor: theme.green, borderRadius: 16, padding: 20, marginBottom: 16 },
  nextLabel: { fontSize: 12, color: theme.goldLight, fontWeight: '600', letterSpacing: 1, marginBottom: 10 },
  nextRow: { flexDirection: 'row', alignItems: 'center' },
  nextIcon: { fontSize: 28, marginRight: 12 },
  nextName: { fontSize: 22, fontWeight: 'bold', color: theme.creamLight, flex: 1 },
  nextCountdown: { fontSize: 16, fontWeight: '600', color: theme.goldLight },
  ramadanToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: theme.creamLight, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.borderLight,
  },
  ramadanLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  ramadanIcon: { fontSize: 26, marginRight: 12 },
  ramadanTitle: { fontSize: 16, fontWeight: '600', color: theme.green },
  ramadanDesc: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
  toggle: { width: 46, height: 26, borderRadius: 13, backgroundColor: theme.border, justifyContent: 'center', padding: 3 },
  toggleOn: { backgroundColor: theme.green },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: theme.white },
  toggleKnobOn: { alignSelf: 'flex-end' },
  prayerList: { backgroundColor: theme.creamLight, borderRadius: 16, borderWidth: 1, borderColor: theme.borderLight, overflow: 'hidden' },
  prayerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: theme.borderLight },
  prayerItemLast: { borderBottomWidth: 0 },
  prayerLeft: { flexDirection: 'row', alignItems: 'center' },
  prayerIcon: { fontSize: 22, marginRight: 14 },
  prayerName: { fontSize: 16, fontWeight: '600', color: theme.green },
  ramadanTag: { fontSize: 11, color: theme.gold, marginTop: 2 },
  prayerTime: { fontSize: 16, fontWeight: '600', color: theme.green },
  ramadanCard: { backgroundColor: theme.creamLight, borderRadius: 16, padding: 20, marginTop: 16, borderWidth: 1, borderColor: theme.borderLight },
  ramadanCardTitle: { fontSize: 18, fontWeight: 'bold', color: theme.green, marginBottom: 14 },
  ramadanRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ramadanRowLabel: { fontSize: 16, color: theme.text, fontWeight: '600' },
  ramadanRowTime: { fontSize: 20, fontWeight: 'bold', color: theme.gold },
  ramadanDivider: { height: 1, backgroundColor: theme.borderLight, marginVertical: 12 },
  refreshBtn: { alignSelf: 'center', marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: theme.creamLight, borderWidth: 1, borderColor: theme.borderLight },
  refreshText: { fontSize: 14, color: theme.green, fontWeight: '600' },
});
