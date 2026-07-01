import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '../theme';
import { useI18n, LANGUAGES } from '../i18n';

export default function SettingsScreen() {
  const { t, lang, setLang } = useI18n();

  const handleSelect = (code) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLang(code);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings')}</Text>
      </View>

      <Text style={styles.sectionLabel}>{t('selectLanguage')}</Text>
      <View style={styles.list}>
        {Object.entries(LANGUAGES).map(([code, info], i) => (
          <TouchableOpacity
            key={code}
            activeOpacity={0.7}
            onPress={() => handleSelect(code)}
            style={[styles.item, i === Object.keys(LANGUAGES).length - 1 && styles.itemLast]}
          >
            <Text style={styles.flag}>{info.flag}</Text>
            <View style={styles.itemBody}>
              <Text style={styles.itemNative}>{info.native}</Text>
              <Text style={styles.itemEnglish}>{info.label}</Text>
            </View>
            <View style={[styles.radio, lang === code && styles.radioActive]}>
              {lang === code && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>{t('about')}</Text>
      <View style={styles.aboutCard}>
        <Text style={styles.aboutName}>{t('appName')}</Text>
        <Text style={styles.aboutSub}>{t('appSubtitle')}</Text>
        <Text style={styles.aboutText}>{t('aboutText')}</Text>
        <View style={styles.aboutDivider} />
        <Text style={styles.aboutVersion}>{t('version')} 1.0.0</Text>
        <Text style={styles.aboutMade}>{t('madeWith')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.cream },
  content: { paddingHorizontal: 24, paddingBottom: 100 },
  header: { paddingTop: 56, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: theme.green },
  sectionLabel: { fontSize: 13, color: theme.textMuted, fontWeight: '600', marginBottom: 12, marginTop: 16, letterSpacing: 0.5 },
  list: { backgroundColor: theme.creamLight, borderRadius: 16, borderWidth: 1, borderColor: theme.borderLight, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: theme.borderLight },
  itemLast: { borderBottomWidth: 0 },
  flag: { fontSize: 28, marginRight: 14 },
  itemBody: { flex: 1 },
  itemNative: { fontSize: 17, fontWeight: '600', color: theme.green },
  itemEnglish: { fontSize: 13, color: theme.textMuted, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: theme.border, justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: theme.green },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.green },
  aboutCard: { backgroundColor: theme.creamLight, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: theme.borderLight },
  aboutName: { fontSize: 22, fontWeight: 'bold', color: theme.green, textAlign: 'center' },
  aboutSub: { fontSize: 14, color: theme.textSecondary, textAlign: 'center', marginTop: 4 },
  aboutText: { fontSize: 14, color: theme.textSecondary, textAlign: 'center', lineHeight: 22, marginTop: 16 },
  aboutDivider: { height: 1, backgroundColor: theme.borderLight, marginVertical: 16 },
  aboutVersion: { fontSize: 13, color: theme.textMuted, textAlign: 'center' },
  aboutMade: { fontSize: 13, color: theme.gold, textAlign: 'center', marginTop: 4 },
});
