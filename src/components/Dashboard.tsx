import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Profile, QuizAttempt } from '../types';
import { COLORS } from '../constants/theme';

interface DashboardProps {
  profile: Profile;
  attempts: QuizAttempt[];
  onUpgradePress: () => void;
}

const { width } = Dimensions.get('window');

export const Dashboard = ({ profile, attempts, onUpgradePress }: DashboardProps) => {
  
  const kpis = useMemo(() => {
    const totalFinished = attempts.length;
    const avgAccuracy = attempts.length > 0
      ? attempts.reduce((acc, curr) => acc + (curr.score / curr.total_questions), 0) / attempts.length
      : 0;
    return { totalFinished, avgAccuracy };
  }, [attempts]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      
      <View style={styles.profileBar}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.userName}>{profile.full_name}</Text>
        </View>
        <TouchableOpacity 
          onPress={onUpgradePress}
          style={[styles.badge, profile.is_premium ? styles.badgePremium : styles.badgePro]}
        >
          <Text style={[styles.badgeText, profile.is_premium && { color: COLORS.white }]}>
            {profile.is_premium ? '👑 Premium Active' : '⚡ Upgrade to Pro'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Modules Clear</Text>
          <Text style={styles.kpiValue}>{kpis.totalFinished}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Avg. Accuracy</Text>
          <Text style={[styles.kpiValue, { color: COLORS.success }]}>
            {Math.round(kpis.avgAccuracy * 100)}%
          </Text>
        </View>
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Recent Performance</Text>
        <View style={styles.chartContainer}>
          {attempts.slice(0, 7).reverse().map((attempt, index) => {
            const height = (attempt.score / attempt.total_questions) * 80;
            return (
              <View key={attempt.id} style={styles.chartColumn}>
                <View style={[styles.chartBar, { height: Math.max(height, 5) }]} />
                <Text style={styles.chartLabel}>{index + 1}</Text>
              </View>
            );
          })}
          {attempts.length === 0 && [1,2,3,4,5,6,7].map((_, i) => (
            <View key={i} style={styles.chartColumn}>
              <View style={[styles.chartBar, { height: 5, backgroundColor: COLORS.border }]} />
              <Text style={styles.chartLabel}>{i+1}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.ledgerSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Attempt History</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {attempts.length > 0 ? (
          attempts.map((item) => (
            <View key={item.id} style={styles.ledgerCard}>
              <View style={styles.ledgerInfo}>
                <Text style={styles.ledgerCategory}>{item.category}</Text>
                <Text style={styles.ledgerDate}>{item.created_at.split('T')[0]}</Text>
              </View>
              <View style={styles.ledgerStats}>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreText}>{Math.round((item.score/item.total_questions)*100)}%</Text>
                </View>
                <Text style={styles.scoreFraction}>{item.score}/{item.total_questions}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No history found.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 40 },
  profileBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
  },
  greeting: { fontSize: 14, color: COLORS.gray },
  userName: { fontSize: 20, fontWeight: '700', color: COLORS.dark },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  badgePro: { backgroundColor: '#EEF2FF' },
  badgePremium: { backgroundColor: COLORS.primary },
  badgeText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  kpiRow: { flexDirection: 'row', padding: 20, gap: 15 },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  kpiLabel: { fontSize: 13, color: COLORS.gray, marginBottom: 5 },
  kpiValue: { fontSize: 24, fontWeight: '800', color: COLORS.dark },
  chartSection: { paddingHorizontal: 20, marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.dark, marginBottom: 15 },
  chartContainer: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 20,
  },
  chartColumn: { alignItems: 'center', flex: 1 },
  chartBar: { width: '60%', backgroundColor: COLORS.primary, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  chartLabel: { fontSize: 10, color: COLORS.gray, marginTop: 8 },
  ledgerSection: { paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  viewAllText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  ledgerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  ledgerInfo: { flex: 1 },
  ledgerCategory: { fontSize: 16, fontWeight: '600', color: COLORS.dark },
  ledgerDate: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  ledgerStats: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scoreContainer: { backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  scoreText: { color: COLORS.success, fontSize: 13, fontWeight: '700' },
  scoreFraction: { fontSize: 12, color: COLORS.gray },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyText: { color: COLORS.gray },
});
