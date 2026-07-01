import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { CATEGORIES, DHIKR_DATA } from '../data/dhikr';
import { theme } from '../theme';
import { useI18n } from '../i18n';

const CAT_LABELS = {
  tasbeeh: { titleKey: 'catTasbeeh', subKey: 'catTasbeehSub', icon: '✦' },
  darood: { titleKey: 'catDarood', subKey: 'catDaroodSub', icon: 'ﷺ' },
  ayat: { titleKey: 'catAyat', subKey: 'catAyatSub', icon: '۞' },
};

export default function HomeScreen({ onSelectCategory }) {
  const { t } = useI18n();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.bismillah}>{t('bismillah')}</Text>
        <Text style={styles.appTitle}>{t('appName')}</Text>
        <Text style={styles.appSubtitle}>{t('appSubtitle')}</Text>
      </View>

      <Text style={styles.sectionLabel}>{t('chooseCategory')}</Text>

      {CATEGORIES.map((cat) => {
        const labels = CAT_LABELS[cat.id];
        const count = (DHIKR_DATA[cat.id] || []).length;
        return (
          <TouchableOpacity
            key={cat.id}
            activeOpacity={0.7}
            onPress={() => onSelectCategory(cat.id)}
            style={styles.card}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>{labels.icon}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{t(labels.titleKey)}</Text>
              <Text style={styles.cardSub}>{t(labels.subKey)}</Text>
              <Text style={styles.cardCount}>{count} {t('dhikrs')}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        );
      })}

      <Text style={styles.footer}>{t('footerNote')}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.cream },
  content: { paddingHorizontal: 24, paddingBottom: 100 },
  header: { alignItems: 'center', paddingTop: 56, paddingBottom: 28 },
  bismillah: { fontSize: 18, color: theme.green, marginBottom: 10, fontWeight: '500' },
  appTitle: { fontSize: 34, fontWeight: 'bold', color: theme.green, letterSpacing: 1 },
  appSubtitle: { fontSize: 14, color: theme.textSecondary, marginTop: 4 },
  sectionLabel: { fontSize: 13, color: theme.textMuted, fontWeight: '600', marginBottom: 14, letterSpacing: 0.5 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.creamLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: theme.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconText: { fontSize: 24, color: theme.goldLight },
  cardBody: { flex: 1, marginLeft: 14 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: theme.green },
  cardSub: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
  cardCount: { fontSize: 12, color: theme.gold, marginTop: 4, fontWeight: '600' },
  chevron: { fontSize: 24, color: theme.textMuted, marginRight: 4 },
  footer: { textAlign: 'center', color: theme.textMuted, fontSize: 13, marginTop: 24 },
});
