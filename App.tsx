import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  ScrollView,
  StatusBar,
} from 'react-native';
import { supabase } from './supabase';

const { width } = Dimensions.get('window');

interface Question {
  id: number;
  category: string;
  isPremium: boolean;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

type Screen = 'dashboard' | 'quiz' | 'summary';

export default function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isPremiumModalVisible, setIsPremiumModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Fetch questions from Supabase
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('questions')
        .select('*');

      if (supabaseError) throw supabaseError;

      if (data) {
        setQuestions(data as Question[]);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Derived state: Unique categories and whether they are premium
  const categoriesInfo = useMemo(() => {
    const categoriesMap = new Map<string, { isPremium: boolean }>();
    questions.forEach((q) => {
      const existing = categoriesMap.get(q.category);
      if (!existing) {
        categoriesMap.set(q.category, { isPremium: q.isPremium });
      } else if (q.isPremium) {
        // If any question in the category is premium, the whole category is premium
        categoriesMap.set(q.category, { isPremium: true });
      }
    });
    return Array.from(categoriesMap.entries()).map(([name, info]) => ({
      name,
      isPremium: info.isPremium,
    }));
  }, [questions]);

  // Filter questions for the current quiz
  const quizQuestions = useMemo(() => {
    if (!selectedCategory) return [];
    return questions.filter((q) => q.category === selectedCategory);
  }, [questions, selectedCategory]);

  const handleCategoryPress = (categoryName: string, isPremium: boolean) => {
    if (isPremium) {
      setIsPremiumModalVisible(true);
    } else {
      setSelectedCategory(categoryName);
      setCurrentScreen('quiz');
      setCurrentQuestionIndex(0);
      setScore(0);
      setSelectedOption(null);
      setShowExplanation(false);
      setIsCorrect(null);
    }
  };

  const handleAnswer = (option: string, correctAnswer: string) => {
    if (showExplanation) return;

    setSelectedOption(option);
    const correct = option === correctAnswer;
    setIsCorrect(correct);
    if (correct) {
      setScore((prev) => prev + 1);
    }
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      setIsCorrect(null);
    } else {
      setCurrentScreen('summary');
    }
  };

  const resetApp = () => {
    setCurrentScreen('dashboard');
    setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setIsCorrect(null);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#3182CE" />
        <Text style={styles.loadingText}>Connecting to Database...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={fetchQuestions} style={styles.button}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {currentScreen === 'dashboard' && (
        <ScrollView contentContainerStyle={styles.dashboardContainer}>
          <Text style={styles.title}>EPA 608 Prep</Text>
          <Text style={styles.subtitle}>Select a Category to Begin</Text>
          {categoriesInfo.map((cat) => (
            <TouchableOpacity
              key={cat.name}
              style={[styles.categoryButton, cat.isPremium && styles.premiumButton]}
              onPress={() => handleCategoryPress(cat.name, cat.isPremium)}
            >
              <Text style={styles.categoryButtonText}>{cat.name}</Text>
              {cat.isPremium && <Text style={styles.premiumBadge}>PREMIUM</Text>}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {currentScreen === 'quiz' && quizQuestions.length > 0 && (
        <View style={styles.quizContainer}>
          <View style={styles.quizHeader}>
            <Text style={styles.quizTitle}>{selectedCategory}</Text>
            <Text style={styles.quizProgress}>
              {currentQuestionIndex + 1} / {quizQuestions.length}
            </Text>
          </View>

          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{quizQuestions[currentQuestionIndex].question}</Text>
          </View>

          <View style={styles.optionsContainer}>
            {quizQuestions[currentQuestionIndex].options.map((option, index) => {
              let optionStyle = styles.optionButton;
              if (selectedOption === option) {
                optionStyle = [
                  styles.optionButton,
                  isCorrect ? styles.optionCorrect : styles.optionIncorrect,
                ];
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={optionStyle}
                  onPress={() => handleAnswer(option, quizQuestions[currentQuestionIndex].correctAnswer)}
                  disabled={showExplanation}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {showExplanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>
                {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
              </Text>
              <Text style={styles.explanationText}>{quizQuestions[currentQuestionIndex].explanation}</Text>
              <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion}>
                <Text style={styles.nextButtonText}>
                  {currentQuestionIndex === quizQuestions.length - 1 ? 'See Results' : 'Next Question'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {currentScreen === 'summary' && (
        <View style={styles.centered}>
          <Text style={styles.title}>Module Complete!</Text>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreText}>{Math.round((score / quizQuestions.length) * 100)}%</Text>
            <Text style={styles.scoreSubtext}>{score} / {quizQuestions.length}</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={resetApp}>
            <Text style={styles.buttonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={isPremiumModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Premium Content</Text>
            <Text style={styles.modalText}>
              This category requires a premium subscription to access.
            </Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#FFD700' }]}
              onPress={() => setIsPremiumModalVisible(false)}
            >
              <Text style={[styles.buttonText, { color: '#000' }]}>Maybe Later</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { marginTop: 10 }]}
              onPress={() => {
                /* In a real app, trigger payment flow here */
                setIsPremiumModalVisible(false);
              }}
            >
              <Text style={styles.buttonText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dashboardContainer: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#4A5568',
    marginBottom: 30,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    width: width * 0.85,
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumButton: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  categoryButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    color: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
  quizContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  quizProgress: {
    fontSize: 16,
    color: '#718096',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 20,
    lineHeight: 28,
    color: '#1A202C',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionText: {
    fontSize: 16,
    color: '#2D3748',
  },
  optionCorrect: {
    backgroundColor: '#C6F6D5',
    borderColor: '#48BB78',
  },
  optionIncorrect: {
    backgroundColor: '#FED7D7',
    borderColor: '#F56565',
  },
  explanationContainer: {
    marginTop: 20,
    backgroundColor: '#EDF2F7',
    padding: 20,
    borderRadius: 15,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  explanationText: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: '#3182CE',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 10,
    borderColor: '#3182CE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  scoreSubtext: {
    fontSize: 18,
    color: '#718096',
  },
  button: {
    backgroundColor: '#3182CE',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#4A5568',
  },
  errorText: {
    fontSize: 16,
    color: '#E53E3E',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4A5568',
    marginBottom: 25,
  },
});
