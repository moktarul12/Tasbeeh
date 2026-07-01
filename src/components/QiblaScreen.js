import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Magnetometer } from 'expo-sensors';
import { theme } from '../theme';
import { useI18n } from '../i18n';

const { width } = Dimensions.get('window');
const COMPASS_SIZE = Math.min(width * 0.6, 240);
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function calculateQibla(lat, lng) {
  const phiK = (KAABA_LAT * Math.PI) / 180;
  const lambdaK = (KAABA_LNG * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const lambda = (lng * Math.PI) / 180;
  const y = Math.sin(lambdaK - lambda);
  const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function calculateDistance(lat, lng) {
  const R = 6371;
  const dLat = ((KAABA_LAT - lat) * Math.PI) / 180;
  const dLng = ((KAABA_LNG - lng) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat * Math.PI) / 180) * Math.cos((KAABA_LAT * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function QiblaScreen() {
  const { t } = useI18n();
  const [qibla, setQibla] = useState(null);
  const [distance, setDistance] = useState(null);
  const [heading, setHeading] = useState(0);
  const [status, setStatus] = useState('loading');
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    requestLocation();
    const sub = Magnetometer.addListener((data) => {
      let angle = (Math.atan2(data.y, data.x) * (180 / Math.PI) + 360) % 360;
      setHeading(angle);
    });
    Magnetometer.setUpdateInterval(100);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (qibla !== null) {
      const dir = (qibla - heading + 360) % 360;
      Animated.spring(rotateAnim, { toValue: dir, useNativeDriver: false, friction: 8 }).start();
    }
  }, [heading, qibla]);

  const requestLocation = async () => {
    try {
      const { status: es } = await Location.getForegroundPermissionsAsync();
      let ps = es;
      if (es !== 'granted') ps = (await Location.requestForegroundPermissionsAsync()).status;
      if (ps !== 'granted') { setStatus('denied'); return; }
      const loc = await Location.getCurrentPositionAsync({});
      setQibla(calculateQibla(loc.coords.latitude, loc.coords.longitude));
      setDistance(calculateDistance(loc.coords.latitude, loc.coords.longitude));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStatus('ready');
    } catch { setStatus('error'); }
  };

  const facing = qibla !== null && Math.abs((qibla - heading + 360) % 360) < 5;
  const rotation = rotateAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });

  if (status === 'loading') {
    return <View style={styles.container}><View style={styles.center}><Text style={styles.loadingText}>{t('locating')}</Text></View></View>;
  }

  if (status === 'denied' || status === 'error') {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorIcon}>🧭</Text>
          <Text style={styles.errorText}>{t('enableLocation')}</Text>
          <TouchableOpacity onPress={requestLocation} style={styles.retryBtn}>
            <Text style={styles.retryText}>{t('enableLocationBtn')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('qiblaDirection')}</Text>
        <Text style={styles.headerSub}>{t('qiblaSubtitle')}</Text>
      </View>

      <View style={styles.compassArea}>
        <View style={styles.compassOuter}>
          <Text style={styles.cardinalN}>N</Text>
          <Text style={styles.cardinalS}>S</Text>
          <Text style={styles.cardinalE}>E</Text>
          <Text style={styles.cardinalW}>W</Text>
          <Animated.View style={[styles.compassFace, { transform: [{ rotate: rotation }] }]}>
            <View style={styles.arrowHead} />
            <View style={styles.arrowBody} />
            <Text style={styles.kaabaEmoji}>🕋</Text>
          </Animated.View>
          <View style={[styles.centerDot, facing && styles.centerDotAligned]}>
            <Text style={styles.centerDotText}>{facing ? '✓' : '↑'}</Text>
          </View>
        </View>
        <Text style={[styles.statusText, facing && styles.statusTextAligned]}>
          {facing ? t('qiblaFound') : t('alignPhone')}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoValue}>{qibla !== null ? `${Math.round(qibla)}°` : '--'}</Text>
          <Text style={styles.infoLabel}>{t('qiblaDirection')}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Text style={styles.infoValue}>{distance !== null ? `${distance.toLocaleString()} km` : '--'}</Text>
          <Text style={styles.infoLabel}>{t('kaabaDistance')}</Text>
        </View>
      </View>
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
  compassArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  compassOuter: {
    width: COMPASS_SIZE, height: COMPASS_SIZE, borderRadius: COMPASS_SIZE / 2,
    borderWidth: 2, borderColor: theme.green, justifyContent: 'center', alignItems: 'center',
  },
  compassFace: {
    width: COMPASS_SIZE - 16, height: COMPASS_SIZE - 16, borderRadius: (COMPASS_SIZE - 16) / 2,
    justifyContent: 'center', alignItems: 'center', position: 'absolute',
  },
  arrowHead: { width: 0, height: 0, borderLeftWidth: 9, borderRightWidth: 9, borderBottomWidth: 16, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: theme.gold },
  arrowBody: { width: 3, height: 36, backgroundColor: theme.gold, marginTop: -1 },
  kaabaEmoji: { position: 'absolute', top: -4, fontSize: 24 },
  centerDot: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(201, 162, 39, 0.15)', borderWidth: 2, borderColor: theme.gold, justifyContent: 'center', alignItems: 'center' },
  centerDotAligned: { backgroundColor: 'rgba(39, 174, 96, 0.15)', borderColor: theme.success },
  centerDotText: { fontSize: 20, color: theme.gold, fontWeight: 'bold' },
  cardinalN: { position: 'absolute', top: 2, fontSize: 13, fontWeight: 'bold', color: theme.green },
  cardinalS: { position: 'absolute', bottom: 2, fontSize: 13, fontWeight: 'bold', color: theme.textMuted },
  cardinalE: { position: 'absolute', right: 6, top: '50%', marginTop: -7, fontSize: 13, fontWeight: 'bold', color: theme.textMuted },
  cardinalW: { position: 'absolute', left: 6, top: '50%', marginTop: -7, fontSize: 13, fontWeight: 'bold', color: theme.textMuted },
  statusText: { fontSize: 14, color: theme.textSecondary, marginTop: 24, textAlign: 'center' },
  statusTextAligned: { color: theme.success, fontWeight: '600' },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    backgroundColor: theme.creamLight, borderRadius: 14, paddingVertical: 16,
    marginHorizontal: 24, marginBottom: 24, borderWidth: 1, borderColor: theme.borderLight,
  },
  infoItem: { alignItems: 'center', flex: 1 },
  infoValue: { fontSize: 20, fontWeight: 'bold', color: theme.green },
  infoLabel: { fontSize: 11, color: theme.textMuted, marginTop: 2 },
  infoDivider: { width: 1, height: 28, backgroundColor: theme.border },
});
