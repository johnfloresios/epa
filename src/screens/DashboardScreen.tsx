import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button, Card, ScreenContainer, Text } from '@/components';
import { readinessRequirements } from '@/config/study';
import { useDashboardActivity } from '@/hooks/useDashboardActivity';
import { contentService } from '@/services/supabase/content';
import { useAppTheme } from '@/theme/ThemeContext';
import { CertificationSection, CertificationSectionCode } from '@/types/content';
import { AppTabParamList, HomeStackParamList } from '@/types/navigation';
import { DashboardSectionReadiness } from '@/types/practice';
import { certificationSectionCodes } from '@/utils/dashboardReadiness';
import { formatAccuracyPercentage } from '@/utils/practiceProgress';
import { formatSectionName } from '@/utils/sections';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

type SectionCardItem = {
  id: string;
  code: CertificationSectionCode;
  name: string;
  readiness: DashboardSectionReadiness;
};

const emptyReadiness = (sectionCode: CertificationSectionCode): DashboardSectionReadiness => ({
  sectionCode,
  practiceAnsweredCount: 0,
  practiceCorrectCount: 0,
  practiceAccuracy: 0,
  hasMinimumPracticeQuestions: false,
  hasMinimumPracticeAccuracy: false,
  hasPassedPracticeExam: false,
  isReady: false,
  completedStepCount: 0,
  nextStep: 'practice_count',
});

export const DashboardScreen = ({ navigation }: Props): React.JSX.Element => {
  const theme = useAppTheme();
  const { summary, isLoading, errorMessage, refresh } = useDashboardActivity();
  const tabNavigation = navigation.getParent<BottomTabNavigationProp<AppTabParamList>>();
  const [sections, setSections] = useState<CertificationSection[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [sectionErrorMessage, setSectionErrorMessage] = useState('');

  const sectionItems = useMemo<SectionCardItem[]>(
    () =>
      certificationSectionCodes.map((code) => {
        const section = sections.find((item) => item.code === code);

        return {
          id: section?.id ?? code,
          code,
          name: section?.name ?? formatSectionName(code),
          readiness:
            summary.sectionReadiness.find((item) => item.sectionCode === code) ??
            emptyReadiness(code),
        };
      }),
    [sections, summary.sectionReadiness],
  );

  const loadSections = async (): Promise<void> => {
    try {
      setIsLoadingSections(true);
      setSectionErrorMessage('');
      setSections(await contentService.getCertificationSections());
    } catch {
      setSectionErrorMessage('Unable to load certification sections right now.');
      setSections([]);
    } finally {
      setIsLoadingSections(false);
    }
  };

  useEffect(() => {
    void loadSections();
  }, []);

  const openPractice = (section: SectionCardItem): void => {
    tabNavigation?.navigate('PracticeTab', {
      screen: 'PracticeHome',
      params: {
        presetSectionId: section.id,
        presetTitle: `${section.name} Practice`,
      },
    });
  };

  const openExam = (section: SectionCardItem): void => {
    tabNavigation?.navigate('ExamsTab', {
      screen: 'ExamsHome',
      params: { presetExamType: section.code },
    });
  };

  const renderChecklistItem = (
    complete: boolean,
    label: string,
    locked = false,
  ): React.JSX.Element => (
    <View
      accessibilityLabel={`${complete ? 'Complete' : locked ? 'Locked' : 'Incomplete'}: ${label}`}
      style={styles.checklistItem}
    >
      <Text
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        tone={complete ? 'success' : 'muted'}
        weight="bold"
      >
        {complete ? '✓' : locked ? '—' : '○'}
      </Text>
      <Text style={styles.checklistCopy} tone={complete ? 'default' : 'muted'}>
        {label}
      </Text>
    </View>
  );

  const renderSectionCard = (section: SectionCardItem): React.JSX.Element => {
    const { readiness } = section;
    const practiceIsNext =
      readiness.nextStep === 'practice_count' || readiness.nextStep === 'practice_accuracy';
    const examIsNext = readiness.nextStep === 'practice_exam';
    const nextStepText = readiness.nextStep === 'practice_count'
      ? `Answer ${Math.max(0, readinessRequirements.minimumPracticeQuestions - readiness.practiceAnsweredCount)} more practice questions`
      : readiness.nextStep === 'practice_accuracy'
        ? `Raise practice accuracy to ${Math.round(readinessRequirements.minimumPracticeAccuracy * 100)}%`
        : readiness.nextStep === 'practice_exam'
          ? `Pass a ${section.name} timed practice exam`
          : 'All readiness steps complete.';

    return (
      <Card key={section.code} style={styles.sectionCard}>
        <View style={styles.sectionHeading}>
          <Text variant="subheading" weight="bold">
            {section.name}
          </Text>
          <View
            accessibilityLabel={`${section.name} status: ${readiness.isReady ? 'Ready' : 'Not Ready'}`}
            style={[
              styles.statusBadge,
              {
                borderColor: readiness.isReady ? theme.colors.success : theme.colors.warning,
                borderRadius: theme.radius.pill,
                backgroundColor: theme.colors.surfaceAlt,
              },
            ]}
          >
            <Text
              tone={readiness.isReady ? 'success' : 'default'}
              variant="caption"
              weight="bold"
            >
              {readiness.isReady ? 'READY' : 'NOT READY'}
            </Text>
          </View>
        </View>

        <Text tone="muted" variant="caption" weight="semibold">
          {`${readiness.completedStepCount} of 3 steps complete`}
        </Text>

        <View accessibilityRole="list" style={styles.checklist}>
          {renderChecklistItem(
            readiness.hasMinimumPracticeQuestions,
            `Answered ${readiness.practiceAnsweredCount} / ${readinessRequirements.minimumPracticeQuestions} practice questions`,
          )}
          {renderChecklistItem(
            readiness.hasMinimumPracticeAccuracy,
            `Practice accuracy: ${formatAccuracyPercentage(readiness.practiceAccuracy)} / ${Math.round(readinessRequirements.minimumPracticeAccuracy * 100)}%`,
            !readiness.hasMinimumPracticeQuestions,
          )}
          {renderChecklistItem(
            readiness.hasPassedPracticeExam,
            `Pass a timed ${section.name} practice exam`,
            !readiness.hasMinimumPracticeAccuracy,
          )}
        </View>

        <View style={styles.nextStep}>
          <Text variant="caption" tone="muted" weight="semibold">
            {readiness.isReady ? 'STATUS' : 'NEXT STEP'}
          </Text>
          <Text weight="semibold">{nextStepText}</Text>
        </View>

        <View style={styles.actions}>
          <Button
            accessibilityLabel={`Practice ${section.name} questions`}
            onPress={() => openPractice(section)}
            title={readiness.isReady ? 'Practice More' : 'Practice Questions'}
            variant={practiceIsNext ? 'primary' : 'ghost'}
          />
          <Button
            accessibilityLabel={`Start ${section.name} timed exam`}
            accessibilityHint={
              readiness.hasMinimumPracticeAccuracy
                ? undefined
                : 'Complete the practice question and accuracy requirements first'
            }
            disabled={!readiness.hasMinimumPracticeAccuracy}
            onPress={() => openExam(section)}
            title="Take Timed Exam"
            variant={examIsNext ? 'primary' : 'ghost'}
          />
        </View>
      </Card>
    );
  };

  const hasError = errorMessage.length > 0 || sectionErrorMessage.length > 0;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="heading" weight="bold">
          EPA 608 PRO
        </Text>
        <Text variant="subheading" weight="semibold">
          Your Certification Readiness
        </Text>
        <Text tone="muted" variant="caption">
          Readiness is based on your EPA 608 PRO study performance.
        </Text>
        <View accessibilityLabel="Checklist legend: check mark means complete, circle means current requirement, dash means locked requirement" style={styles.legend}>
          <Text variant="caption" tone="success" weight="semibold">
            ✓ Complete
          </Text>
          <Text variant="caption" tone="muted" weight="semibold">
            ○ Current requirement
          </Text>
          <Text variant="caption" tone="muted" weight="semibold">
            — Locked requirement
          </Text>
        </View>
      </View>

      {isLoading || isLoadingSections ? (
        <Card style={styles.sectionCard}>
          <Text tone="muted">Loading section readiness...</Text>
        </Card>
      ) : null}

      {!isLoading && !isLoadingSections && hasError ? (
        <Card style={styles.sectionCard}>
          <Text tone="error" weight="semibold">
            {errorMessage || sectionErrorMessage}
          </Text>
          <Button
            onPress={() => {
              void refresh();
              void loadSections();
            }}
            title="Retry"
          />
        </Card>
      ) : null}

      {!isLoading && !isLoadingSections && !hasError ? sectionItems.map(renderSectionCard) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  actions: {
    gap: 10,
  },
  checklist: {
    gap: 10,
  },
  checklistCopy: {
    flex: 1,
  },
  checklistItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  header: {
    gap: 6,
    marginBottom: 24,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
  },
  nextStep: {
    gap: 4,
  },
  sectionCard: {
    gap: 16,
    marginBottom: 18,
  },
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
});
