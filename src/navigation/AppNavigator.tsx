import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DashboardScreen } from '@/screens/DashboardScreen';
import { ExamsScreen } from '@/screens/ExamsScreen';
import { PracticeScreen } from '@/screens/PracticeScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { ProgressScreen } from '@/screens/ProgressScreen';
import { AppStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigator = (): React.JSX.Element => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Practice"
        component={PracticeScreen}
        options={{
          title: 'Practice',
        }}
      />
      <Stack.Screen
        name="Exams"
        component={ExamsScreen}
        options={{
          title: 'Exams',
        }}
      />
      <Stack.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          title: 'Progress',
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Stack.Navigator>
  );
};
