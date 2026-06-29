import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '../theme';
import { useI18n, LANGUAGES } from '../i18n';

export default function SettingsScreen() {
  const { t, lang, setLang } = useI18n();

  const handleSelectLang = (langCode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLang(langCode);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Language Section */}
        <Text style={styles.sectionLabel}>{t('selectLanguage')}</Text>
        <View style={styles.langList}>
          {Object.entries(LANGUAGES).map(([code, info], index) => (
            <TouchableOpacity
              key={code}
              activeOpacity={0.85}
              onPress={() => handleSelectLang(code)}
              style={[
                styles.langItem,
                index === Object.keys(LANGUAGES).length - 1 && styles.langItemLast,
              ]}
            >
              <View style={styles.langItemLeft}>
                <Text style={styles.langFlag}>{info.flag}</Text>
                <View>
                  <Text style={styles.langNative}>{info.nativeLabel}</Text>
                  <Text style={styles.langEnglish}>{info.label}</Text>
                </View>
              </View>
              <View style={[styles.radio, lang === code && styles.radioActive]}>
                {lang === code && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* About Section */}
        <Text style={styles.sectionLabel}>{t('about')}</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutAppName}>{t('appName')}</Text>
          <Text style={styles.aboutSubtitle}>{t('appSubtitle')}</Text>
          <Text style={styles.aboutText}>{t('aboutText')}</Text>
          <View style={styles.aboutDivider} />
          <Text style={styles.aboutVersion}>
            {t('version')} 1.0.0
          </Text>
          <Text style={styles.aboutMadeWith}>{t('madeWith')}</Text>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          ✦ {t('bismillah')} ✦
        </Text>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 13,
    color: theme.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 16,
  },
  langList: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    overflow: 'hidden',
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  langItemLast: {
    borderBottomWidth: 0,
  },
  langItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langFlag: {
    fontSize: 32,
    marginRight: 14,
  },
  langNative: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.dark.text,
  },
  langEnglish: {
    fontSize: 13,
    color: theme.dark.textMuted,
    marginTop: 2,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: theme.dark.gold,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.dark.gold,
  },
  aboutCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    padding: 24,
  },
  aboutAppName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.dark.goldLight,
    textAlign: 'center',
  },
  aboutSubtitle: {
    fontSize: 14,
    color: theme.dark.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  aboutText: {
    fontSize: 14,
    color: theme.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 16,
  },
  aboutDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 16,
  },
  aboutVersion: {
    fontSize: 13,
    color: theme.dark.textMuted,
    textAlign: 'center',
  },
  aboutMadeWith: {
    fontSize: 13,
    color: theme.dark.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  footerText: {
    textAlign: 'center',
    color: theme.dark.gold,
    fontSize: 14,
    marginTop: 28,
    marginBottom: 8,
  },
});
