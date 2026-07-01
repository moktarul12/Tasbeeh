import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { DHIKR_DATA, CATEGORIES } from '../data/dhikr';
import { theme } from '../theme';
import { useI18n } from '../i18n';
import { getCustomDhikr, removeCustomDhikr } from '../utils/storage';

const CAT_LABELS = {
  tasbeeh: { titleKey: 'catTasbeeh', icon: '✦' },
  darood: { titleKey: 'catDarood', icon: 'ﷺ' },
  ayat: { titleKey: 'catAyat', icon: '۞' },
};

export default function SelectorScreen({ categoryId, onSelectItem, onBack, onAddCustom }) {
  const { t } = useI18n();
  const category = CATEGORIES.find((c) => c.id === categoryId);
  const builtInItems = DHIKR_DATA[categoryId] || [];
  const [customItems, setCustomItems] = useState([]);

  const loadCustom = useCallback(async () => {
    const all = await getCustomDhikr();
    setCustomItems(all.filter((d) => d.category === categoryId));
  }, [categoryId]);

  useEffect(() => { loadCustom(); }, [loadCustom]);

  const handleDelete = (id, name) => {
    Alert.alert('Delete', `Delete "${name}"?`, [
      { text: t('cancel'), style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await removeCustomDhikr(id);
        loadCustom();
      }},
    ]);
  };

  const items = [...builtInItems, ...customItems];
  const labels = CAT_LABELS[categoryId];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>‹ {t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t(labels.titleKey)}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>{t('selectDhikr')}</Text>

        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            onPress={() => onSelectItem(item)}
            onLongPress={() => item.isCustom && handleDelete(item.id, item.transliteration)}
            style={styles.itemCard}
          >
            <View style={styles.itemIcon}>
              <Text style={styles.itemIconText}>{labels.icon}</Text>
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.itemArabic} numberOfLines={1}>{item.arabic.split('\n')[0]}</Text>
              <Text style={styles.itemTrans} numberOfLines={1}>{item.transliteration.split('\n')[0]}</Text>
              <Text style={styles.itemTarget}>
                {item.isCustom ? t('custom') : t('target')}: {item.target}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity onPress={onAddCustom} style={styles.addCard}>
          <Text style={styles.addPlus}>+</Text>
          <Text style={styles.addText}>{t('addCustom')}</Text>
          <Text style={styles.addHint}>{t('addCustomHint')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.cream },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 24, paddingBottom: 8 },
  backBtn: { paddingVertical: 8 },
  backText: { fontSize: 16, color: theme.green, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.green },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 100 },
  sectionLabel: { fontSize: 13, color: theme.textMuted, fontWeight: '600', marginBottom: 14, letterSpacing: 0.5 },
  itemCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.creamLight,
    borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: theme.borderLight,
  },
  itemIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.green, justifyContent: 'center', alignItems: 'center' },
  itemIconText: { fontSize: 20, color: theme.goldLight },
  itemBody: { flex: 1, marginLeft: 12 },
  itemArabic: { fontSize: 18, color: theme.green, fontWeight: '600' },
  itemTrans: { fontSize: 13, color: theme.textSecondary, marginTop: 2, fontStyle: 'italic' },
  itemTarget: { fontSize: 12, color: theme.gold, marginTop: 3, fontWeight: '600' },
  chevron: { fontSize: 22, color: theme.textMuted },
  addCard: {
    backgroundColor: theme.creamLight, borderRadius: 14, padding: 20, alignItems: 'center',
    borderWidth: 1.5, borderColor: theme.border, borderStyle: 'dashed', marginTop: 8,
  },
  addPlus: { fontSize: 28, color: theme.gold, fontWeight: 'bold' },
  addText: { fontSize: 15, color: theme.green, fontWeight: '600', marginTop: 4 },
  addHint: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
});
