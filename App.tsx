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
import { Quiz } from './src/components/Quiz';

// Constants & Types
import { EPA608_QUESTIONS } from './src/constants/questions';
import { Profile, QuizAttempt } from './src/types';

// Theme Imports
import { ThemeProvider, useTheme } from './src/constants/theme';

/**
 * AppContent component to allow using the useTheme hook within the ThemeProvider
 */
const AppContent = ({
  session,
  loading,
  profile,
  attempts,
  isDataLoading,
  isQuizVisible,
  setIsQuizVisible,
  isUpgradeModalVisible,
  setIsUpgradeModalVisible,
  handleQuizComplete,
  fetchUserData,
}: any) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} />
      
      {loading || isDataLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            {isDataLoading ? 'Syncing Profile...' : 'Initializing Pro Engine...'}
          </Text>
        </View>
      ) : !session ? (
        <AuthGateway onAuthSuccess={() => {}} />
      ) : isQuizVisible ? (
        <Quiz 
          questions={EPA608_QUESTIONS} 
          onComplete={handleQuizComplete}
          onCancel={() => setIsQuizVisible(false)}
        />
      ) : (
        <>
          <Dashboard 
            profile={profile} 
            attempts={attempts} 
            onUpgradePress={() => setIsUpgradeModalVisible(true)} 
            onLogout={async () => {
              await supabase.auth.signOut();
            }}
            onStartQuiz={() => setIsQuizVisible(true)}
            onToggleTheme={toggleTheme}
          />
          
          <UpgradeModal 
            visible={isUpgradeModalVisible} 
            onClose={() => setIsUpgradeModalVisible(false)} 
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default function App() {
  // --- APP STATE ---
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // --- USER DATA STATE ---
  const [profile, setProfile] = useState<Profile | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // --- QUIZ STATE ---
  const [isQuizVisible, setIsQuizVisible] = useState(false);

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
    setLoading(true);
    try {
      // Fetch Profile and Quiz History in parallel for high performance
      const [profileRes, attemptsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('quiz_attempts').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data as Profile);
      }
      
      if (attemptsRes.data) {
        setAttempts(attemptsRes.data as QuizAttempt[]);
      }
    } catch (error) {
      console.error('Critical error fetching user data:', error);
    } finally {
      setIsDataLoading(false);
      setLoading(false);
    }
  };

  const handleQuizComplete = async (score: number, total: number) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase.from('quiz_attempts').insert({
        user_id: session.user.id,
        score,
        total_questions: total,
        category: 'EPA 608',
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
      
      // Refresh attempts
      const { data: newAttempts } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (newAttempts) setAttempts(newAttempts);
      
    } catch (error) {
      console.error('Error saving quiz result:', error);
    } finally {
      setIsQuizVisible(false);
    }
  };

  return (
    <ThemeProvider>
      <AppContent
        session={session}
        loading={loading}
        profile={profile}
        attempts={attempts}
        isDataLoading={isDataLoading}
        isQuizVisible={isQuizVisible}
        setIsQuizVisible={setIsQuizVisible}
        isUpgradeModalVisible={isUpgradeModalVisible}
        setIsUpgradeModalVisible={setIsUpgradeModalVisible}
        handleQuizComplete={handleQuizComplete}
        fetchUserData={fetchUserData}
      />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    fontWeight: '500',
  },
});
