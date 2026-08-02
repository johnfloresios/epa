import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useTheme, ThemeColors } from '../constants/theme';
import { Question } from '../types';

interface QuizProps {
  questions: Question[];
  onComplete: (score: number, total: number) => void;
  onCancel: () => void;
}

export const Quiz = ({ questions, onComplete, onCancel }: QuizProps) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (option: string) => {
    if (showExplanation) return;

    setSelectedOption(option);
    const correct = option === currentQuestion.correct_answer;
    setIsCorrect(correct);
    if (correct) setScore((prev) => prev + 1);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      setIsCorrect(null);
    } else {
      onComplete(score + (isCorrect ? 1 : 0), questions.length);
    }
  };

  if (!currentQuestion) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancelText}>✕ Exit</Text>
        </TouchableOpacity>
        <Text style={styles.progress}>
          {currentIndex + 1} / {questions.length}
        </Text>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
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
              onPress={() => handleAnswer(option)}
              disabled={showExplanation}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {showExplanation && (
        <View style={styles.explanationContainer}>
          <Text style={[styles.explanationTitle, { color: isCorrect ? theme.success : theme.error }]}>
            {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
          </Text>
          <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  cancelText: { fontSize: 16, color: theme.error, fontWeight: '600' },
  progress: { fontSize: 16, color: theme.textSecondary, fontWeight: '600' },
  questionCard: { backgroundColor: theme.surface, padding: 25, borderRadius: 20, marginBottom: 25, elevation: 2 },
  questionText: { fontSize: 20, lineHeight: 28, color: theme.text, fontWeight: '600' },
  optionsContainer: { gap: 12 },
  optionButton: { backgroundColor: theme.surface, padding: 18, borderRadius: 12, borderWidth: 1, borderColor: theme.border },
  optionText: { fontSize: 16, color: theme.text },
  optionCorrect: { backgroundColor: '#D1FAE5', borderColor: theme.success },
  optionIncorrect: { backgroundColor: '#FEE2E2', borderColor: theme.error },
  explanationContainer: { marginTop: 20, backgroundColor: theme.surface, padding: 20, borderRadius: 15, elevation: 2 },
  explanationTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10 },
  explanationText: { fontSize: 15, color: theme.textSecondary, lineHeight: 22, marginBottom: 20 },
  nextButton: { backgroundColor: theme.primary, padding: 16, borderRadius: 10, alignItems: 'center' },
  nextButtonText: { color: theme.white, fontSize: 16, fontWeight: '700' },
});
