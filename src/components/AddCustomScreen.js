import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SUGGESTION_POOL } from '../data/dhikr';
import { categoryColors, theme } from '../theme';
import { addCustomDhikr } from '../utils/storage';

export default function AddCustomScreen({ categoryId, onBack, onAdded }) {
  const colors = categoryColors[categoryId];

  const [search, setSearch] = useState('');
  const [arabic, setArabic] = useState('');
  const [transliteration, setTransliteration] = useState('');
  const [translation, setTranslation] = useState('');
  const [target, setTarget] = useState('33');
  const [suggestions, setSuggestions] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (search.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const query = search.toLowerCase().trim();
    const matches = SUGGESTION_POOL.filter((s) =>
      s.keyword.includes(query) || s.suggestion.transliteration.toLowerCase().includes(query)
    ).slice(0, 5);
    setSuggestions(matches);
  }, [search]);

  const applySuggestion = (sug) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setArabic(sug.arabic);
    setTransliteration(sug.transliteration);
    setTranslation(sug.translation);
    setTarget(String(sug.target));
    setSuggestions([]);
    setSearch('');
  };

  const handleSave = async () => {
    if (!transliteration.trim()) {
      Alert.alert('Missing Info', 'Please enter at least a transliteration or name');
      return;
    }
    setSaving(true);
    const item = {
      id: `custom-${Date.now()}`,
      arabic: arabic.trim() || transliteration.trim(),
      transliteration: transliteration.trim(),
      translation: translation.trim() || '—',
      target: parseInt(target, 10) || 33,
      virtue: 'Custom dhikr added by you',
      isCustom: true,
      category: categoryId,
    };
    await addCustomDhikr(item);
    setSaving(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onAdded(item);
  };

  const handleSaveAndStart = async () => {
    if (!transliteration.trim()) {
      Alert.alert('Missing Info', 'Please enter at least a transliteration or name');
      return;
    }
    setSaving(true);
    const item = {
      id: `custom-${Date.now()}`,
      arabic: arabic.trim() || transliteration.trim(),
      transliteration: transliteration.trim(),
      translation: translation.trim() || '—',
      target: parseInt(target, 10) || 33,
      virtue: 'Custom dhikr added by you',
      isCustom: true,
      category: categoryId,
    };
    await addCustomDhikr(item);
    setSaving(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onAdded(item, true); // true = start counting immediately
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Custom</Text>
        <View style={styles.backBtnPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search with auto-suggestions */}
        <Text style={styles.label}>Search for suggestions (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. subhanallah, darood, fatiha..."
          placeholderTextColor={theme.dark.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {suggestions.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestionItem}
                onPress={() => applySuggestion(s.suggestion)}
              >
                <Text style={styles.suggestionArabic}>{s.suggestion.arabic}</Text>
                <Text style={styles.suggestionTrans}>{s.suggestion.transliteration}</Text>
                <Text style={styles.suggestionHint}>Tap to fill ›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Form */}
        <Text style={styles.label}>Arabic Text (optional)</Text>
        <TextInput
          style={[styles.input, styles.arabicInput]}
          placeholder="Arabic text..."
          placeholderTextColor={theme.dark.textMuted}
          value={arabic}
          onChangeText={setArabic}
          multiline
          textAlign="center"
        />

        <Text style={styles.label}>Transliteration / Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. SubhanAllah"
          placeholderTextColor={theme.dark.textMuted}
          value={transliteration}
          onChangeText={setTransliteration}
        />

        <Text style={styles.label}>Translation (optional)</Text>
        <TextInput
          style={[styles.input, styles.translationInput]}
          placeholder="e.g. Glory be to Allah"
          placeholderTextColor={theme.dark.textMuted}
          value={translation}
          onChangeText={setTranslation}
          multiline
        />

        <Text style={styles.label}>Target Count</Text>
        <View style={styles.targetRow}>
          {[33, 100, 1000, 1, 3, 7].map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.targetChip,
                target === String(t) && { borderColor: colors.accent, backgroundColor: colors.glow },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTarget(String(t));
              }}
            >
              <Text
                style={[
                  styles.targetChipText,
                  target === String(t) && { color: colors.accent },
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={[styles.input, styles.targetInput]}
          placeholder="Custom number"
          placeholderTextColor={theme.dark.textMuted}
          value={target}
          onChangeText={setTarget}
          keyboardType="numeric"
        />

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.btnSave, { borderColor: colors.accent }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <Text style={[styles.btnSaveText, { color: colors.accent }]}>+ Add to List</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnStart, { backgroundColor: colors.accent }]}
            onPress={handleSaveAndStart}
            disabled={saving}
          >
            <Text style={styles.btnStartText}>Start Counting →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: 60,
  },
  label: {
    fontSize: 13,
    color: theme.dark.textSecondary,
    marginBottom: 8,
    marginTop: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.dark.text,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  arabicInput: {
    fontSize: 22,
    minHeight: 60,
    textAlign: 'center',
  },
  translationInput: {
    minHeight: 60,
  },
  targetInput: {
    marginTop: 8,
  },
  suggestionsContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  suggestionArabic: {
    fontSize: 20,
    color: theme.dark.gold,
    marginRight: 12,
  },
  suggestionTrans: {
    fontSize: 14,
    color: theme.dark.text,
    flex: 1,
    fontStyle: 'italic',
  },
  suggestionHint: {
    fontSize: 12,
    color: theme.dark.textMuted,
  },
  targetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  targetChip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 4,
  },
  targetChipText: {
    fontSize: 14,
    color: theme.dark.textSecondary,
    fontWeight: '600',
  },
  actions: {
    marginTop: 28,
    gap: 12,
  },
  btn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSave: {
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  btnSaveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  btnStart: {},
  btnStartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});
