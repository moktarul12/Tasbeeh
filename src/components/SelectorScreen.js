import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { DHIKR_DATA, CATEGORIES } from '../data/dhikr';
import { categoryColors, theme } from '../theme';
import { getCustomDhikr, removeCustomDhikr } from '../utils/storage';
import { useI18n } from '../i18n';

const { width } = Dimensions.get('window');

export default function SelectorScreen({ categoryId, onSelectItem, onBack, onAddCustom }) {
  const { t } = useI18n();
  const category = CATEGORIES.find((c) => c.id === categoryId);
  const builtInItems = DHIKR_DATA[categoryId] || [];
  const colors = categoryColors[categoryId];
  const [customItems, setCustomItems] = useState([]);

  const loadCustom = useCallback(async () => {
    const all = await getCustomDhikr();
    setCustomItems(all.filter((d) => d.category === categoryId));
  }, [categoryId]);

  useEffect(() => {
    loadCustom();
  }, [loadCustom]);

  const handleDeleteCustom = (id, name) => {
    Alert.alert('Remove Custom Dhikr', `Delete "${name}" from your list?`, [
      { text: t('cancel'), style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await removeCustomDhikr(id);
          loadCustom();
        },
      },
    ]);
  };

  const items = [...builtInItems, ...customItems];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>‹ {t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category.title}</Text>
        <View style={styles.backBtnPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>{t('selectToRecite')}</Text>

        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            onPress={() => onSelectItem(item)}
            onLongPress={() => item.isCustom && handleDeleteCustom(item.id, item.transliteration)}
            style={styles.itemWrapper}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.itemCard}
            >
              <Text style={styles.arabicText} numberOfLines={2}>
                {item.arabic.replace(/\n/g, ' ')}
              </Text>

              <Text style={styles.transliteration}>{item.transliteration.split('\n')[0]}</Text>
              <Text style={styles.translation} numberOfLines={2}>
                {item.translation.split('\n')[0]}
              </Text>

              <View style={styles.itemFooter}>
                <View style={[styles.targetBadge, { borderColor: colors.accent }]}>
                  <Text style={[styles.targetText, { color: colors.accent }]}>
                    {item.isCustom ? t('custom') : t('target')}: {item.target}
                  </Text>
                </View>
                <Text style={styles.startText}>
                  {item.isCustom ? t('longPressDelete') : t('tapToBegin')}
                </Text>
              </View>

              <View style={[styles.accentBar, { backgroundColor: colors.accent }]} />
            </LinearGradient>
          </TouchableOpacity>
        ))}

        {/* Add Custom Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onAddCustom}
          style={styles.addCustomWrapper}
        >
          <View style={[styles.addCustomCard, { borderColor: colors.accent }]}>
            <Text style={[styles.addCustomPlus, { color: colors.accent }]}>+</Text>
            <Text style={[styles.addCustomText, { color: colors.accent }]}>{t('addCustomDhikr')}</Text>
            <Text style={styles.addCustomHint}>{t('addCustomHint')}</Text>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  backBtn: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  backText: {
    color: theme.dark.text,
    fontSize: 17,
  },
  backBtnPlaceholder: {
    width: 60,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.dark.text,
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 13,
    color: theme.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  itemWrapper: {
    marginBottom: 14,
    borderRadius: 18,
    overflow: 'hidden',
  },
  itemCard: {
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
    overflow: 'hidden',
  },
  arabicText: {
    fontSize: 26,
    color: theme.dark.goldLight,
    textAlign: 'center',
    lineHeight: 46,
    marginBottom: 10,
    fontWeight: '600',
  },
  transliteration: {
    fontSize: 15,
    color: theme.dark.text,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 4,
  },
  translation: {
    fontSize: 13,
    color: theme.dark.textSecondary,
    textAlign: 'center',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  targetBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  targetText: {
    fontSize: 12,
    fontWeight: '600',
  },
  startText: {
    fontSize: 13,
    color: theme.dark.textMuted,
  },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.6,
  },
  addCustomWrapper: {
    marginBottom: 14,
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 8,
  },
  addCustomCard: {
    borderRadius: 18,
    padding: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  addCustomPlus: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addCustomText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  addCustomHint: {
    fontSize: 12,
    color: theme.dark.textMuted,
    textAlign: 'center',
  },
});
