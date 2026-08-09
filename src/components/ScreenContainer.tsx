import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme/ThemeContext';
import { MAX_CONTENT_WIDTH } from '@/utils/layout';

type Props = ViewProps & {
  scrollable?: boolean;
};

export const ScreenContainer = ({
  children,
  scrollable = true,
  style,
  ...rest
}: Props): React.JSX.Element => {
  const theme = useAppTheme();

  const content = (
    <View style={[styles.content, { maxWidth: MAX_CONTENT_WIDTH }, style]} {...rest}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        {scrollable ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    width: '100%',
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
