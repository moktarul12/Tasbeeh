import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Magnetometer } from 'expo-sensors';
import { theme } from '../theme';
import { useI18n } from '../i18n';

const { width } = Dimensions.get('window');
const COMPASS_SIZE = Math.min(width * 0.7, 280);

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function calculateQibla(lat, lng) {
  const phiK = (KAABA_LAT * Math.PI) / 180;
  const lambdaK = (KAABA_LNG * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const lambda = (lng * Math.PI) / 180;

  const y = Math.sin(lambdaK - lambda);
  const x =
    Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
  const qibla = (Math.atan2(y, x) * 180) / Math.PI;
  return (qibla + 360) % 360;
}

function calculateDistance(lat, lng) {
  const R = 6371;
  const dLat = ((KAABA_LAT - lat) * Math.PI) / 180;
  const dLng = ((KAABA_LNG - lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((KAABA_LAT * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function QiblaScreen() {
  const { t } = useI18n();
  const [location, setLocation] = useState(null);
  const [qibla, setQibla] = useState(null);
  const [distance, setDistance] = useState(null);
  const [heading, setHeading] = useState(0);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const subscription = useRef(null);

  useEffect(() => {
    requestLocation();

    Magnetometer.setUpdateInterval(100);
    subscription.current = Magnetometer.addListener((data) => {
      let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      angle = (angle + 360) % 360;
      setHeading(angle);
    });

    return () => {
      if (subscription.current) {
        subscription.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (qibla !== null) {
      const qiblaDirection = (qibla - heading + 360) % 360;
      Animated.spring(rotateAnim, {
        toValue: qiblaDirection,
        useNativeDriver: false,
        friction: 8,
        tension: 40,
      }).start();
    }
  }, [heading, qibla]);

  const requestLocation = async () => {
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
      const qiblaDir = calculateQibla(loc.coords.latitude, loc.coords.longitude);
      setQibla(qiblaDir);
      setDistance(calculateDistance(loc.coords.latitude, loc.coords.longitude));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStatus('ready');
    } catch (e) {
      setErrorMsg('Unable to get location. Please try again.');
      setStatus('error');
    }
  };

  const facingQibla = qibla !== null && Math.abs(((qibla - heading + 360) % 360)) < 5;

  const compassRotation = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  if (status === 'idle' || status === 'loading') {
    return (
      <LinearGradient colors={theme.dark.bgGradient} style={styles.flex}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>{t('locating')}</Text>
        </View>
      </LinearGradient>
    );
  }

  if (status === 'denied' || status === 'error') {
    return (
      <LinearGradient colors={theme.dark.bgGradient} style={styles.flex}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>📍</Text>
          <Text style={styles.errorText}>{errorMsg || t('enableLocation')}</Text>
          <TouchableOpacity onPress={requestLocation} style={styles.retryBtn}>
            <Text style={styles.retryText}>{t('enableLocationBtn')}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('qiblaDirection')}</Text>
        <Text style={styles.headerSubtitle}>{t('qiblaSubtitle')}</Text>
      </View>

      {/* Compass */}
      <View style={styles.compassSection}>
        <View style={styles.compassOuter}>
          {/* Cardinal directions */}
          <Text style={[styles.cardinal, styles.cardinalN]}>N</Text>
          <Text style={[styles.cardinal, styles.cardinalS]}>S</Text>
          <Text style={[styles.cardinal, styles.cardinalE]}>E</Text>
          <Text style={[styles.cardinal, styles.cardinalW]}>W</Text>

          {/* Rotating compass face */}
          <Animated.View
            style={[
              styles.compassFace,
              { transform: [{ rotate: compassRotation }] },
            ]}
          >
            {/* Qibla arrow */}
            <View style={styles.qiblaArrow}>
              <View style={styles.arrowHead} />
              <View style={styles.arrowBody} />
            </View>
            {/* Kaaba icon at tip */}
            <View style={styles.kaabaIcon}>
              <Text style={styles.kaabaText}>🕋</Text>
            </View>
          </Animated.View>

          {/* Center indicator */}
          <View
            style={[
              styles.centerIndicator,
              facingQibla && styles.centerIndicatorAligned,
            ]}
          >
            <Text style={styles.centerText}>{facingQibla ? '✓' : '↑'}</Text>
          </View>
        </View>

        {/* Status */}
        <Text style={[styles.statusText, facingQibla && styles.statusTextAligned]}>
          {facingQibla ? t('qiblaFound') : t('alignPhone')}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.infoBar}>
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

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>🕋 {t('qiblaSubtitle')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
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
  compassSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassOuter: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  compassFace: {
    width: COMPASS_SIZE - 20,
    height: COMPASS_SIZE - 20,
    borderRadius: (COMPASS_SIZE - 20) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  qiblaArrow: {
    position: 'absolute',
    top: 10,
    alignItems: 'center',
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: theme.dark.gold,
  },
  arrowBody: {
    width: 4,
    height: 40,
    backgroundColor: theme.dark.gold,
    marginTop: -1,
  },
  kaabaIcon: {
    position: 'absolute',
    top: -2,
    alignItems: 'center',
  },
  kaabaText: {
    fontSize: 28,
  },
  centerIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 2,
    borderColor: theme.dark.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerIndicatorAligned: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: theme.dark.success,
  },
  centerText: {
    fontSize: 24,
    color: theme.dark.gold,
    fontWeight: 'bold',
  },
  cardinal: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.dark.textMuted,
  },
  cardinalN: {
    top: 4,
  },
  cardinalS: {
    bottom: 4,
  },
  cardinalE: {
    right: 8,
    top: '50%',
    marginTop: -7,
  },
  cardinalW: {
    left: 8,
    top: '50%',
    marginTop: -7,
  },
  statusText: {
    fontSize: 14,
    color: theme.dark.textSecondary,
    marginTop: 28,
    textAlign: 'center',
  },
  statusTextAligned: {
    color: theme.dark.success,
    fontWeight: '600',
  },
  infoBar: {
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
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.dark.goldLight,
  },
  infoLabel: {
    fontSize: 11,
    color: theme.dark.textMuted,
    marginTop: 2,
  },
  infoDivider: {
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
