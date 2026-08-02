import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../../supabase';
import { COLORS } from '../constants/theme';

interface AuthGatewayProps {
  onAuthSuccess: () => void;
}

export const AuthGateway = ({ onAuthSuccess }: AuthGatewayProps) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      if (authMode === 'signup') {
        if (!fullName) throw new Error('Please enter your full name');
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        Alert.alert('Check your email!', 'Please verify your email to continue.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>EPA 608 Pro</Text>
        <Text style={styles.subtitle}>
          {authMode === 'login' ? 'Welcome back, Technician' : 'Create your pro account'}
        </Text>
      </View>

      <View style={styles.form}>
        {authMode === 'signup' && (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholderTextColor={COLORS.gray}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor={COLORS.gray}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={COLORS.gray}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
          {loading ? <ActivityIndicator color={COLORS.white} /> : (
            <Text style={styles.buttonText}>{authMode === 'login' ? 'Sign In' : 'Sign Up'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
          style={styles.switch}
        >
          <Text style={styles.switchText}>
            {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: COLORS.white },
  header: { marginBottom: 40 },
  title: { fontSize: 34, fontWeight: '800', color: COLORS.dark },
  subtitle: { fontSize: 16, color: COLORS.gray, marginTop: 8 },
  form: { width: '100%' },
  input: {
    backgroundColor: COLORS.light,
    padding: 18,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    color: COLORS.dark,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  button: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  switch: { marginTop: 20, alignItems: 'center' },
  switchText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  errorText: { color: COLORS.error, fontSize: 14, marginBottom: 10, textAlign: 'center' },
});
