export interface QuizQuestion {
  id: string;
  lessonId?: string; // Optional: link to specific lesson
  category: string; // vocabulary, grammar, kanji, reading, listening
  type: 'single-choice' | 'multiple-choice' | 'text-input' | 'audio' | 'image';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  level: 'N5' | 'N4' | 'N3';
  
  // Question content
  question: string;
  questionImage?: string;
  audioUrl?: string;
  
  // Answer options (for choice questions)
  options?: QuizAnswerOption[];
  
  // Correct answers
  correctAnswers: string[]; // For multiple choice, can have multiple correct answers
  explanation?: string;
  
  // Metadata
  tags: string[];
  estimatedTime: number; // in seconds
  points: number; // points for correct answer
}

export interface QuizAnswerOption {
  id: string;
  text: string;
  image?: string;
  isCorrect: boolean;
}

export interface QuizSession {
  id: string;
  userId: string;
  lessonId?: string;
  category: string;
  level: 'N5' | 'N4' | 'N3';
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  startTime: string;
  endTime?: string;
  isCompleted: boolean;
  totalPoints: number;
  score: number; // percentage
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswers: string[]; // Array of selected option IDs or text input
  isCorrect: boolean;
  timeSpent: number; // in seconds
  points: number;
  answeredAt: string;
}

export interface QuizResult {
  sessionId: string;
  userId: string;
  lessonId?: string;
  category: string;
  level: 'N5' | 'N4' | 'N3';
  totalQuestions: number;
  correctAnswers: number;
  score: number; // percentage
  totalPoints: number;
  earnedPoints: number;
  timeSpent: number; // in minutes
  completedAt: string;
  pokemonReward?: {
    id: string;
    name: string;
    image: string;
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  };
  achievements?: string[];
}

export interface QuizStats {
  totalQuizzesCompleted: number;
  averageScore: number;
  totalPointsEarned: number;
  streakDays: number;
  categoryStats: {
    [category: string]: {
      quizzesCompleted: number;
      averageScore: number;
      bestScore: number;
    };
  };
}

export interface CreateQuizRequest {
  lessonId?: string;
  category?: string;
  level?: 'N5' | 'N4' | 'N3';
  questionCount?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  selectedAnswers: string[];
  timeSpent: number;
}

export interface CompleteQuizRequest {
  sessionId: string;
  answers: QuizAnswer[];
  totalTimeSpent: number;
}
