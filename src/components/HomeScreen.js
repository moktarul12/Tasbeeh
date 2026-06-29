import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CATEGORIES, DHIKR_DATA } from '../data/dhikr';
import { categoryColors, theme } from '../theme';

const { width } = Dimensions.get('window');
const CARD_W = width - 48;

const CATEGORY_PATTERNS = {
  tasbeeh: '۞',
  darood: 'ﷺ',
  ayat: '۞',
};

function getItemCount(catId) {
  const items = DHIKR_DATA[catId] || [];
  return items.length;
}

export default function HomeScreen({ onSelectCategory }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
        <Text style={styles.appTitle}>Tashbeeh</Text>
        <Text style={styles.appSubtitle}>Digital Dhikr Counter</Text>
      </View>

      {/* Category Cards */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Choose Your Dhikr</Text>
        {CATEGORIES.map((cat) => {
          const colors = categoryColors[cat.id];
          const count = getItemCount(cat.id);
          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.85}
              onPress={() => onSelectCategory(cat.id)}
              style={styles.cardWrapper}
            >
              <LinearGradient
                colors={colors.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                {/* Decorative pattern */}
                <Text style={styles.pattern}>{CATEGORY_PATTERNS[cat.id]}</Text>

                <View style={styles.cardContent}>
                  <View style={styles.cardTextContainer}>
                    <Text style={styles.cardTitle}>{cat.title}</Text>
                    <Text style={styles.cardSubtitle}>{cat.subtitle}</Text>
                    <View style={styles.cardMeta}>
                      <View style={[styles.countPill, { borderColor: colors.accent }]}>
                        <Text style={[styles.countPillText, { color: colors.accent }]}>
                          {count} dhikrs
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.cardBadge, { backgroundColor: colors.accent + '22' }]}>
                    <Text style={[styles.cardBadgeText, { color: colors.accent }]}>›</Text>
                  </View>
                </View>

                {/* Accent line */}
                <View style={[styles.accentLine, { backgroundColor: colors.accent }]} />
              </LinearGradient>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.footerNote}>
          ✦ Count your dhikr with focus and devotion ✦
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
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  bismillah: {
    fontSize: 20,
    color: theme.dark.goldLight,
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.dark.text,
    letterSpacing: 2,
  },
  appSubtitle: {
    fontSize: 14,
    color: theme.dark.textSecondary,
    marginTop: 4,
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
    marginTop: 8,
  },
  cardWrapper: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    width: CARD_W,
    minHeight: 120,
    borderRadius: 20,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  pattern: {
    position: 'absolute',
    top: 10,
    right: 20,
    fontSize: 80,
    color: 'rgba(255,255,255,0.05)',
    fontWeight: 'bold',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardMeta: {
    flexDirection: 'row',
    marginTop: 10,
  },
  countPill: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  cardBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBadgeText: {
    fontSize: 24,
    fontWeight: '300',
  },
  accentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  footerNote: {
    textAlign: 'center',
    color: theme.dark.textMuted,
    fontSize: 13,
    marginTop: 24,
    marginBottom: 8,
  },
});
