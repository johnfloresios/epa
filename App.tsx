import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { supabase } from './supabase';

// Component Imports
import { AuthGateway } from './src/components/AuthGateway';
import { Dashboard } from './src/components/Dashboard';
import { UpgradeModal } from './src/components/UpgradeModal';

// Type Imports
import { Profile, QuizAttempt } from './src/types';

// Theme Imports
import { COLORS } from './src/constants/theme';

export default function App() {
  // --- APP STATE ---
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // --- USER DATA STATE ---
  const [profile, setProfile] = useState<Profile | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // --- UI STATE ---
  const [isUpgradeModalVisible, setIsUpgradeModalVisible] = useState(false);

  /**
   * CORE LOGIC: AUTH & DATA SYNC
   */
  useEffect(() => {
    // 1. Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for auth changes (Login, Logout, Sign-up)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        fetchUserData(currentSession.user.id);
      } else {
        setProfile(null);
        setAttempts([]);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (userId: string) => {
    setIsDataLoading(true);
    try {
      // Fetch Profile and Quiz History in parallel for high performance
      const [profileRes, attemptsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('quiz_attempts').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      ]);

      if (profileRes.data) setProfile(profileRes.data as Profile);
      if (attemptsRes.data) setAttempts(attemptsRes.data as QuizAttempt[]);
    } catch (error) {
      console.error('Critical error fetching user data:', error);
    } finally {
      setIsDataLoading(false);
      setLoading(false);
    }
  };

  /**
   * RENDER LOGIC
   */

  // 1. Initial Loading Screen
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Initializing Pro Engine...</Text>
      </View>
    );
  }

  // 2. Auth Gateway (Login/Signup)
  if (!session) {
    return <AuthGateway onAuthSuccess={() => {}} />; // onAuthSuccess is handled by onAuthStateChange
  }

  // 3. Premium Dashboard (Logged In)
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {isDataLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Syncing Profile...</Text>
        </View>
      ) : (
        <>
          <Dashboard 
            profile={profile!} 
            attempts={attempts} 
            onUpgradePress={() => setIsUpgradeModalVisible(true)} 
          />
          
          <UpgradeModal 
            visible={isUpgradeModalVisible} 
            onClose={() => setIsUpgradeModalVisible(false)} 
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
});
