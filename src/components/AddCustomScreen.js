import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SUGGESTION_POOL } from '../data/dhikr';
import { theme } from '../theme';
import { useI18n } from '../i18n';
import { addCustomDhikr } from '../utils/storage';

export default function AddCustomScreen({ categoryId, onBack, onAdded }) {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [arabic, setArabic] = useState('');
  const [transliteration, setTransliteration] = useState('');
  const [translation, setTranslation] = useState('');
  const [target, setTarget] = useState('33');
  const [suggestions, setSuggestions] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (search.trim().length < 2) { setSuggestions([]); return; }
    const q = search.toLowerCase().trim();
    setSuggestions(SUGGESTION_POOL.filter((s) => s.keyword.includes(q) || s.suggestion.transliteration.toLowerCase().includes(q)).slice(0, 5));
  }, [search]);

  const applySuggestion = (sug) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setArabic(sug.arabic); setTransliteration(sug.transliteration);
    setTranslation(sug.translation); setTarget(String(sug.target));
    setSuggestions([]); setSearch('');
  };

  const buildItem = () => ({
    id: `custom-${Date.now()}`,
    arabic: arabic.trim() || transliteration.trim(),
    transliteration: transliteration.trim(),
    translation: translation.trim() || '—',
    target: parseInt(target, 10) || 33,
    virtue: 'Custom dhikr',
    isCustom: true, category: categoryId,
  });

  const handleSave = async () => {
    if (!transliteration.trim()) { Alert.alert('Missing', 'Enter a name'); return; }
    setSaving(true);
    const item = buildItem();
    await addCustomDhikr(item);
    setSaving(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onAdded(item);
  };

  const handleSaveStart = async () => {
    if (!transliteration.trim()) { Alert.alert('Missing', 'Enter a name'); return; }
    setSaving(true);
    const item = buildItem();
    await addCustomDhikr(item);
    setSaving(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onAdded(item, true);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backText}>‹ {t('back')}</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{t('addCustom')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Search suggestions</Text>
        <TextInput style={styles.input} placeholder="subhanallah, darood..." placeholderTextColor={theme.textMuted} value={search} onChangeText={setSearch} autoCapitalize="none" autoCorrect={false} />

        {suggestions.length > 0 && (
          <View style={styles.suggestions}>
            {suggestions.map((s, i) => (
              <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => applySuggestion(s.suggestion)}>
                <Text style={styles.suggestionArabic}>{s.suggestion.arabic}</Text>
                <Text style={styles.suggestionTrans}>{s.suggestion.transliteration}</Text>
                <Text style={styles.suggestionHint}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Arabic (optional)</Text>
        <TextInput style={[styles.input, styles.arabicInput]} placeholder="Arabic..." placeholderTextColor={theme.textMuted} value={arabic} onChangeText={setArabic} multiline textAlign="center" />

        <Text style={styles.label}>Name *</Text>
        <TextInput style={styles.input} placeholder="SubhanAllah" placeholderTextColor={theme.textMuted} value={transliteration} onChangeText={setTransliteration} />

        <Text style={styles.label}>Translation (optional)</Text>
        <TextInput style={[styles.input, { minHeight: 50 }]} placeholder="Glory be to Allah" placeholderTextColor={theme.textMuted} value={translation} onChangeText={setTranslation} multiline />

        <Text style={styles.label}>{t('target')}</Text>
        <View style={styles.targetRow}>
          {[33, 100, 1000, 1, 3, 7].map((n) => (
            <TouchableOpacity key={n} style={[styles.chip, target === String(n) && styles.chipActive]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTarget(String(n)); }}>
              <Text style={[styles.chipText, target === String(n) && styles.chipTextActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Custom number" placeholderTextColor={theme.textMuted} value={target} onChangeText={setTarget} keyboardType="numeric" />

        <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={theme.green} /> : <Text style={styles.btnSaveText}>+ Add to List</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnStart} onPress={handleSaveStart} disabled={saving}>
          <Text style={styles.btnStartText}>Start Counting →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.cream },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 24, paddingBottom: 8 },
  backText: { fontSize: 16, color: theme.green, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.green },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 60 },
  label: { fontSize: 13, color: theme.textSecondary, marginBottom: 8, marginTop: 16, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: theme.text, backgroundColor: theme.creamLight },
  arabicInput: { fontSize: 22, minHeight: 56, textAlign: 'center' },
  suggestions: { marginTop: 8, borderRadius: 12, overflow: 'hidden' },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: theme.creamLight, borderBottomWidth: 1, borderBottomColor: theme.borderLight },
  suggestionArabic: { fontSize: 20, color: theme.green, marginRight: 12 },
  suggestionTrans: { fontSize: 14, color: theme.text, flex: 1, fontStyle: 'italic' },
  suggestionHint: { fontSize: 16, color: theme.textMuted },
  targetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: theme.border, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  chipActive: { borderColor: theme.green, backgroundColor: theme.green },
  chipText: { fontSize: 14, color: theme.textSecondary, fontWeight: '600' },
  chipTextActive: { color: theme.creamLight },
  btnSave: { marginTop: 28, borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1.5, borderColor: theme.green, backgroundColor: theme.creamLight },
  btnSaveText: { fontSize: 16, fontWeight: '600', color: theme.green },
  btnStart: { marginTop: 12, borderRadius: 14, paddingVertical: 16, alignItems: 'center', backgroundColor: theme.green },
  btnStartText: { fontSize: 16, fontWeight: 'bold', color: theme.creamLight },
});
