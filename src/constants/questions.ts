import { Question } from '../types';

export const EPA608_QUESTIONS: Question[] = [
  {
    question: "What is the primary purpose of a manifold gauge set?",
    options: [
      "To measure electrical voltage",
      "To monitor refrigerant pressure and temperature",
      "To check battery levels",
      "To clean condenser coils",
    ],
    correct_answer: "To monitor refrigerant pressure and temperature",
    explanation: "Manifold gauges are used to monitor the pressure and temperature of refrigerants during servicing.",
  },
  {
    question: "Which of the following is a common refrigerant used in residential AC units?",
    options: [
      "R-22",
      "R-744",
      "R-134a",
      "All of the above",
    ],
    correct_answer: "All of the above",
    explanation: "R-22, R-134a, and R-744 (CO2) are all refrigerants used in various applications.",
  },
  {
    question: "What tool is used to detect small refrigerant leaks?",
    options: [
      "Manifold gauge",
      "Electronic leak detector",
      "Multimeter",
      "Thermometer",
    ],
    correct_answer: "Electronic leak detector",
    explanation: "An electronic leak detector is designed to find small amounts of refrigerant leaking from a system.",
  },
];
