import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { Button, Card, ScreenContainer, Text } from '@/components';
import { readinessRequirements } from '@/config/study';
import { useDashboardActivity } from '@/hooks/useDashboardActivity';
import { contentService } from '@/services/supabase/content';
import { useAuthStore } from '@/store/useAuthStore';
import { usePremiumStore } from '@/store/usePremiumStore';
import { useAppTheme } from '@/theme/ThemeContext';
import { CertificationSection, CertificationSectionCode } from '@/types/content';
import { AppTabParamList, HomeStackParamList } from '@/types/navigation';
import { DashboardSectionReadiness } from '@/types/practice';
import { certificationSectionCodes } from '@/utils/dashboardReadiness';
import { canAccessSectionBank } from '@/utils/premiumAccess';
import { formatSectionName } from '@/utils/sections';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;
type SectionItem = { id: string; code: CertificationSectionCode; name: string; readiness: DashboardSectionReadiness };

const sectionMeta: Record<CertificationSectionCode, { icon: keyof typeof Ionicons.glyphMap; accent: string; label: string }> = {
  CORE: { icon: 'snow-outline', accent: '#22D3EE', label: 'Fundamentals' },
  TYPE_I: { icon: 'cube-outline', accent: '#A855F7', label: 'Small appliances' },
  TYPE_II: { icon: 'business-outline', accent: '#F43F8C', label: 'High-pressure systems' },
  TYPE_III: { icon: 'water-outline', accent: '#34D399', label: 'Low-pressure systems' },
};

const emptyReadiness = (sectionCode: CertificationSectionCode): DashboardSectionReadiness => ({
  sectionCode, hasStarted: false, practiceAnsweredCount: 0, practiceCorrectCount: 0, practiceAccuracy: 0,
  hasMinimumPracticeQuestions: false, hasMinimumPracticeAccuracy: false,
  hasPassedPracticeExam: false, isReady: false, completedStepCount: 0, nextStep: 'practice_count',
});

const Metric = ({ label, value, accent }: { label: string; value: string; accent?: string }): React.JSX.Element => (
  <View style={styles.metric}>
    <Text style={accent ? { color: accent } : undefined} variant="subheading" weight="bold">{value}</Text>
    <Text tone="muted" variant="caption">{label}</Text>
  </View>
);

export const DashboardScreen = ({ navigation }: Props): React.JSX.Element => {
  const theme = useAppTheme();
  const profile = useAuthStore((state) => state.profile);
  const user = useAuthStore((state) => state.user);
  const { summary, isLoading, errorMessage, refresh } = useDashboardActivity();
  const hasPremium = usePremiumStore((state) => state.hasPremium);
  const showPaywall = usePremiumStore((state) => state.showPaywall);
  const [sections, setSections] = useState<CertificationSection[]>([]);
  const [sectionError, setSectionError] = useState('');
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const tabNavigation = navigation.getParent<BottomTabNavigationProp<AppTabParamList>>();

  const loadSections = async (): Promise<void> => {
    try { setIsLoadingSections(true); setSectionError(''); setSections(await contentService.getCertificationSections()); }
    catch { setSectionError('Unable to load certification sections right now.'); }
    finally { setIsLoadingSections(false); }
  };

  useEffect(() => { void loadSections(); }, []);

  const items = useMemo<SectionItem[]>(() => certificationSectionCodes.map((code) => {
    const section = sections.find((candidate) => candidate.code === code);
    return {
      id: section?.id ?? code,
      code,
      name: section?.name ?? formatSectionName(code),
      readiness: summary.sectionReadiness.find((candidate) => candidate.sectionCode === code) ?? emptyReadiness(code),
    };
  }), [sections, summary.sectionReadiness]);

  const readyCount = items.filter((item) => item.readiness.isReady).length;
  const displayName =
    profile?.displayName?.trim() ||
    (typeof user?.user_metadata.display_name === 'string'
      ? user.user_metadata.display_name.trim()
      : '') ||
    'Technician';
  const openPractice = (item: SectionItem): void => {
    if (!canAccessSectionBank(item.code, hasPremium)) { showPaywall(); return; }
    tabNavigation?.navigate('PracticeTab', { screen: 'PracticeHome', params: { presetSectionId: item.id, presetTitle: `${item.name} Practice` } });
  };

  const renderSection = (item: SectionItem): React.JSX.Element => {
    const locked = !canAccessSectionBank(item.code, hasPremium);
    const notStarted = !item.readiness.hasStarted;
    const meta = sectionMeta[item.code];
    const accuracy = Math.round(item.readiness.practiceAccuracy * 100);
    const questionProgress = Math.min(item.readiness.practiceAnsweredCount / readinessRequirements.minimumPracticeQuestions, 1);
    const next = locked ? 'Unlock the full question bank and mock exam.'
      : item.readiness.nextStep === 'practice_count' ? `${Math.max(0, readinessRequirements.minimumPracticeQuestions - item.readiness.practiceAnsweredCount)} more answers to build a reliable score.`
      : item.readiness.nextStep === 'practice_accuracy' ? `Improve accuracy by ${Math.max(0, Math.round(readinessRequirements.minimumPracticeAccuracy * 100) - accuracy)} points.`
      : item.readiness.nextStep === 'practice_exam' ? `Pass the mock exam at ${Math.round(readinessRequirements.passingPracticeExamScore * 100)}% or higher.`
      : 'You have completed every readiness requirement.';

    return (
      <Pressable key={item.code} onPress={() => openPractice(item)} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
        <Card style={[styles.paperCard, { borderColor: `${meta.accent}55` }]}>
          <View style={[styles.paperFold, { borderTopColor: theme.colors.background, borderLeftColor: `${meta.accent}33` }]} />
          <View style={styles.cardTop}>
            <View style={[styles.sectionIcon, { backgroundColor: `${meta.accent}18` }]}><Ionicons color={meta.accent} name={meta.icon} size={25} /></View>
            <View style={styles.sectionTitle}><Text variant="subheading" weight="bold">{item.name}</Text><Text tone="muted" variant="caption">{meta.label}</Text></View>
            <View style={[styles.badge, { backgroundColor: item.readiness.isReady ? `${theme.colors.success}20` : locked || notStarted ? theme.colors.surfaceAlt : `${theme.colors.warning}1A` }]}> 
              <Ionicons color={item.readiness.isReady ? theme.colors.success : locked || notStarted ? theme.colors.textMuted : theme.colors.warning} name={item.readiness.isReady ? 'checkmark-circle' : locked ? 'lock-closed' : notStarted ? 'ellipse-outline' : 'time'} size={13} />
              <Text style={{ color: item.readiness.isReady ? theme.colors.success : locked || notStarted ? theme.colors.textMuted : theme.colors.warning }} variant="caption" weight="bold">{item.readiness.isReady ? 'READY' : locked ? 'PREMIUM' : notStarted ? 'NOT STARTED' : 'IN PROGRESS'}</Text>
            </View>
          </View>
          <View style={styles.metricsRow}>
            <Metric accent={meta.accent} label="YOUR SCORE" value={`${accuracy}%`} /><View style={[styles.metricDivider, { backgroundColor: theme.colors.border }]} />
            <Metric label="TARGET" value={`${Math.round(readinessRequirements.minimumPracticeAccuracy * 100)}%`} /><View style={[styles.metricDivider, { backgroundColor: theme.colors.border }]} />
            <Metric label="EXAM PASS" value={`${Math.round(readinessRequirements.passingPracticeExamScore * 100)}%`} />
          </View>
          <View style={styles.progressBlock}>
            <View style={styles.progressLabels}><Text variant="caption" weight="semibold">Practice evidence</Text><Text tone="muted" variant="caption">{item.readiness.practiceAnsweredCount} / {readinessRequirements.minimumPracticeQuestions} questions</Text></View>
            <View style={[styles.track, { backgroundColor: theme.colors.surfaceAlt }]}><View style={[styles.fill, { backgroundColor: meta.accent, width: `${questionProgress * 100}%` }]} /></View>
          </View>
          <View style={[styles.nextStep, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Ionicons color={locked ? theme.colors.primary : meta.accent} name={locked ? 'diamond-outline' : 'arrow-forward-circle-outline'} size={20} />
            <View style={styles.nextCopy}><Text variant="caption" weight="bold">{locked ? 'PREMIUM ACCESS' : item.readiness.isReady ? 'EXAM READY' : 'NEXT MILESTONE'}</Text><Text tone="muted" variant="caption">{next}</Text></View>
            <Ionicons color={theme.colors.textMuted} name="chevron-forward" size={19} />
          </View>
        </Card>
      </Pressable>
    );
  };

  const hasError = Boolean(errorMessage || sectionError);
  return (
    <ScreenContainer style={styles.screen}>
      <LinearGradient colors={theme.mode === 'dark' ? ['#251044', '#141020', '#090711'] : ['#7C3AED', '#8B5CF6', '#A855F7']} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={styles.hero}>
        <View style={styles.heroGlow} />
        <View style={styles.heroTop}><View><Text style={styles.eyebrow} variant="caption" weight="bold">EPA 608 Ultimate</Text><Text style={styles.heroTitle} variant="heading" weight="bold">Welcome, {displayName}</Text></View></View>
        <Text style={styles.heroCopy}>Your personalized path to certification. Keep every section above target before exam day.</Text>
        <View style={styles.heroStats}><Metric accent="#22D3EE" label="SECTIONS READY" value={`${readyCount}/4`} /><View style={styles.heroDivider} /><Metric accent="#FAF8FF" label="QUESTIONS" value={`${summary.questionsAnswered}`} /><View style={styles.heroDivider} /><Metric accent="#34D399" label="ACCURACY" value={`${Math.round(summary.overallAccuracy * 100)}%`} /></View>
      </LinearGradient>
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}><Text variant="subheading" weight="bold">Certification sections</Text><Text tone="muted" variant="caption">Complete all four to become exam ready.</Text></View>
        {hasPremium ? (
          <View accessibilityLabel="Premium active" style={[styles.proChip, { backgroundColor: `${theme.colors.success}1F` }]}>
            <Ionicons color={theme.colors.success} name="shield-checkmark" size={14} />
            <Text style={{ color: theme.colors.success }} variant="caption" weight="bold">PREMIUM</Text>
          </View>
        ) : (
          <Pressable onPress={showPaywall} style={[styles.proChip, { backgroundColor: theme.colors.primaryMuted }]}>
            <Ionicons color={theme.colors.primary} name="person-circle-outline" size={14} />
            <Text tone="primary" variant="caption" weight="bold">FREE PLAN</Text>
          </Pressable>
        )}
      </View>
      {isLoading || isLoadingSections ? <Card style={styles.loadingCard}><Text tone="muted">Calculating your readiness…</Text></Card> : null}
      {!isLoading && !isLoadingSections && hasError ? <Card style={styles.loadingCard}><Text tone="error">{errorMessage || sectionError}</Text><Button onPress={() => { void refresh(); void loadSections(); }} title="Try Again" /></Card> : null}
      {!isLoading && !isLoadingSections && !hasError ? <View style={styles.cardList}>{items.map(renderSection)}</View> : null}
      <Text style={styles.disclaimer} tone="muted" variant="caption">Readiness is a study guide based on your saved performance, not an official EPA guarantee.</Text>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  badge: { alignItems: 'center', borderRadius: 999, flexDirection: 'row', gap: 5, paddingHorizontal: 9, paddingVertical: 7 },
  cardList: { gap: 16 }, cardTop: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  disclaimer: { lineHeight: 18, paddingHorizontal: 8, textAlign: 'center' }, fill: { borderRadius: 999, height: 8 },
  headingCopy: { flex: 1, gap: 3 }, headingRow: { alignItems: 'center', flexDirection: 'row', gap: 12, marginBottom: 14, marginTop: 26 },
  hero: { borderRadius: 26, overflow: 'hidden', padding: 22 }, heroCopy: { color: '#CFC5DD', fontSize: 14, lineHeight: 21, marginTop: 14, maxWidth: 350 },
  heroDivider: { backgroundColor: 'rgba(255,255,255,.17)', height: 35, width: 1 }, heroGlow: { backgroundColor: 'rgba(34,211,238,.10)', borderRadius: 100, height: 180, position: 'absolute', right: -60, top: -80, width: 180 },
  heroStats: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around', marginTop: 24 }, heroTitle: { color: '#FAF8FF', fontSize: 26, marginTop: 5 }, heroTop: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  eyebrow: { color: '#C084FC', letterSpacing: 1.6 }, loadingCard: { gap: 14, marginBottom: 16 }, metric: { alignItems: 'center', flex: 1, gap: 3 },
  metricDivider: { height: 34, width: 1 }, metricsRow: { alignItems: 'center', flexDirection: 'row' }, nextCopy: { flex: 1, gap: 3 },
  nextStep: { alignItems: 'center', borderRadius: 14, flexDirection: 'row', gap: 10, padding: 12 }, paperCard: { gap: 18, overflow: 'hidden', padding: 18 },
  paperFold: { borderLeftWidth: 18, borderTopWidth: 18, height: 0, position: 'absolute', right: 0, top: 0, width: 0 },
  proChip: { alignItems: 'center', borderRadius: 999, flexDirection: 'row', gap: 6, paddingHorizontal: 11, paddingVertical: 8 }, progressBlock: { gap: 8 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' }, screen: { paddingBottom: 28 }, sectionIcon: { alignItems: 'center', borderRadius: 14, height: 48, justifyContent: 'center', width: 48 },
  sectionTitle: { flex: 1, gap: 2 }, track: { borderRadius: 999, height: 8, overflow: 'hidden' },
});
