import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAppTheme } from '@/theme/ThemeContext';
import {
  AppTabParamList,
  ExamsStackParamList,
  HomeStackParamList,
  PracticeStackParamList,
  ProfileStackParamList,
  ProgressStackParamList,
} from '@/types/navigation';
import {
  DashboardScreen,
  ExamAttemptDetailScreen,
  ExamQuestionDetailScreen,
  ExamsScreen,
  MissedQuestionDetailScreen,
  MissedQuestionsScreen,
  PracticeQuestionDetailScreen,
  PracticeScreen,
  PracticeSessionDetailScreen,
  ProfileScreen,
  ProgressScreen,
  ReadinessScreen,
  WeakAreasScreen,
} from '@/screens';

const Tab = createBottomTabNavigator<AppTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const PracticeStack = createNativeStackNavigator<PracticeStackParamList>();
const ExamsStack = createNativeStackNavigator<ExamsStackParamList>();
const ProgressStack = createNativeStackNavigator<ProgressStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const activityScreenOptions = {
  headerBackButtonDisplayMode: 'minimal' as const,
};

const HomeStackNavigator = (): React.JSX.Element => {
  return (
    <HomeStack.Navigator screenOptions={activityScreenOptions}>
      <HomeStack.Screen
        component={DashboardScreen}
        name="Home"
        options={{
          headerShown: false,
        }}
      />
      <HomeStack.Screen
        component={PracticeSessionDetailScreen}
        name="PracticeSessionDetail"
        options={{
          title: 'Activity Details',
        }}
      />
      <HomeStack.Screen
        component={PracticeQuestionDetailScreen}
        name="PracticeQuestionDetail"
        options={{
          title: 'Question History',
        }}
      />
      <HomeStack.Screen
        component={ExamAttemptDetailScreen}
        name="ExamAttemptDetail"
        options={{
          title: 'Exam Results',
        }}
      />
      <HomeStack.Screen
        component={ExamQuestionDetailScreen}
        name="ExamQuestionDetail"
        options={{
          title: 'Exam Question',
        }}
      />
    </HomeStack.Navigator>
  );
};

const PracticeStackNavigator = (): React.JSX.Element => {
  return (
    <PracticeStack.Navigator screenOptions={activityScreenOptions}>
      <PracticeStack.Screen
        component={PracticeScreen}
        name="PracticeHome"
        options={{
          headerShown: false,
        }}
      />
    </PracticeStack.Navigator>
  );
};

const ExamsStackNavigator = (): React.JSX.Element => {
  return (
    <ExamsStack.Navigator screenOptions={activityScreenOptions}>
      <ExamsStack.Screen
        component={ExamsScreen}
        name="ExamsHome"
        options={{
          headerShown: false,
        }}
      />
      <ExamsStack.Screen
        component={ExamAttemptDetailScreen}
        name="ExamAttemptDetail"
        options={{
          title: 'Exam Results',
        }}
      />
      <ExamsStack.Screen
        component={ExamQuestionDetailScreen}
        name="ExamQuestionDetail"
        options={{
          title: 'Exam Question',
        }}
      />
    </ExamsStack.Navigator>
  );
};

const ProgressStackNavigator = (): React.JSX.Element => {
  return (
    <ProgressStack.Navigator screenOptions={activityScreenOptions}>
      <ProgressStack.Screen
        component={ProgressScreen}
        name="ProgressHome"
        options={{
          headerShown: false,
        }}
      />
      <ProgressStack.Screen
        component={ReadinessScreen}
        name="Readiness"
        options={{
          title: 'Readiness',
        }}
      />
      <ProgressStack.Screen
        component={WeakAreasScreen}
        name="WeakAreas"
        options={{
          title: 'Weak Areas',
        }}
      />
      <ProgressStack.Screen
        component={MissedQuestionsScreen}
        name="MissedQuestions"
        options={{
          title: 'Missed Questions',
        }}
      />
      <ProgressStack.Screen
        component={MissedQuestionDetailScreen}
        name="MissedQuestionDetail"
        options={{
          title: 'Question Review',
        }}
      />
      <ProgressStack.Screen
        component={PracticeSessionDetailScreen}
        name="PracticeSessionDetail"
        options={{
          title: 'Activity Details',
        }}
      />
      <ProgressStack.Screen
        component={PracticeQuestionDetailScreen}
        name="PracticeQuestionDetail"
        options={{
          title: 'Question History',
        }}
      />
      <ProgressStack.Screen
        component={ExamAttemptDetailScreen}
        name="ExamAttemptDetail"
        options={{
          title: 'Exam Results',
        }}
      />
      <ProgressStack.Screen
        component={ExamQuestionDetailScreen}
        name="ExamQuestionDetail"
        options={{
          title: 'Exam Question',
        }}
      />
    </ProgressStack.Navigator>
  );
};

const ProfileStackNavigator = (): React.JSX.Element => {
  return (
    <ProfileStack.Navigator screenOptions={activityScreenOptions}>
      <ProfileStack.Screen
        component={ProfileScreen}
        name="ProfileHome"
        options={{
          headerShown: false,
        }}
      />
    </ProfileStack.Navigator>
  );
};

const tabIcons: Record<keyof AppTabParamList, keyof typeof Ionicons.glyphMap> = {
  HomeTab: 'home-outline',
  PracticeTab: 'school-outline',
  ExamsTab: 'clipboard-outline',
  ProgressTab: 'stats-chart-outline',
  ProfileTab: 'person-outline',
};

export const AppNavigator = (): React.JSX.Element => {
  const theme = useAppTheme();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 76,
          paddingBottom: 11,
          paddingTop: 9,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.1,
          shadowRadius: 18,
          elevation: 16,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const baseIcon = tabIcons[route.name as keyof AppTabParamList];
          const iconName = focused
            ? (baseIcon.replace('-outline', '') as keyof typeof Ionicons.glyphMap)
            : baseIcon;

          return <Ionicons color={color} name={iconName} size={size} />;
        },
      })}
    >
      <Tab.Screen
        component={HomeStackNavigator}
        name="HomeTab"
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        component={PracticeStackNavigator}
        name="PracticeTab"
        options={{
          tabBarLabel: 'Practice',
        }}
      />
      <Tab.Screen
        component={ExamsStackNavigator}
        name="ExamsTab"
        options={{
          tabBarLabel: 'Exams',
        }}
      />
      <Tab.Screen
        component={ProgressStackNavigator}
        name="ProgressTab"
        options={{
          tabBarLabel: 'Progress',
        }}
      />
      <Tab.Screen
        component={ProfileStackNavigator}
        name="ProfileTab"
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};
