import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '@/screens/LoginScreen';
import { SignUpScreen } from '@/screens/SignUpScreen';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { AuthStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<AuthStackParamList>();

type Props = {
  hasSeenWelcome: boolean;
  onContinue: () => void;
};

export const AuthNavigator = ({
  hasSeenWelcome,
  onContinue,
}: Props): React.JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName={hasSeenWelcome ? 'Login' : 'Welcome'}
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen
        name="Welcome"
        options={{
          headerShown: false,
        }}
      >
        {(props) => <WelcomeScreen {...props} onContinue={onContinue} />}
      </Stack.Screen>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Sign In',
        }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{
          title: 'Create Account',
        }}
      />
    </Stack.Navigator>
  );
};
