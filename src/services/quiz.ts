import { axiosClient, axiosPrivate } from "@configs/axios";
import { QuizQuestion, QuizResult, QuizSession, QuizStats } from "@models/quiz/quiz.common";
import {
  ICompleteQuizResponse,
  ICreateQuizSessionResponse,
  IGetQuizHistoryResponse,
  IGetQuizQuestionsResponse,
  IGetQuizReviewResponse,
  IGetQuizStatsResponse,
  ISubmitQuizAnswerResponse,
} from "@models/quiz/quiz.response";
import mockQuizData from "../../mock-data/quiz-questions.json";

// Feature flags
const USE_MOCK_DATA =
  process.env.NODE_ENV === "development" || !process.env.EXPO_PUBLIC_API_URL;

export const quizService = {
  // Create a new quiz session
  createQuizSession: async (params: {
    lessonId?: string;
    category?: string;
    level?: 'N5' | 'N4' | 'N3';
    questionCount?: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    exerciseAttemptId?: number | string;
  }): Promise<ICreateQuizSessionResponse> => {
    try {
      if (USE_MOCK_DATA) {
        // Filter questions based on parameters
        let questions = [...mockQuizData.questions];
        
        if (params.lessonId) {
          questions = questions.filter(q => q.lessonId === params.lessonId);
        }
        
        if (params.category) {
          questions = questions.filter(q => q.category === params.category);
        }
        
        if (params.level) {
          questions = questions.filter(q => q.level === params.level);
        }
        
        if (params.difficulty) {
          questions = questions.filter(q => q.difficulty === params.difficulty);
        }

        // Shuffle and limit questions
        questions = questions.sort(() => Math.random() - 0.5);
        const questionCount = params.questionCount || Math.min(10, questions.length);
        questions = questions.slice(0, questionCount);

        // Create quiz session
        const session: QuizSession = {
          id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: "current-user",
          lessonId: params.lessonId,
          category: params.category || "mixed",
          level: params.level || "N5",
          questions: questions as QuizQuestion[],
          currentQuestionIndex: 0,
          answers: [],
          startTime: new Date().toISOString(),
          isCompleted: false,
          totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
          score: 0,
        };

        return {
          statusCode: 201,
          data: { session },
          message: "Quiz session created successfully",
        };
      }

      // Real API implementation
      const response = await axiosPrivate.post("/api/v1/quiz/session", params);
      return response.data;
    } catch (error) {
      console.error("Error creating quiz session:", error);
      throw error;
    }
  },

  // Get quiz session by ID
  getQuizSession: async (sessionId: string): Promise<{ statusCode: number; data?: { session: QuizSession }; message?: string }> => {
    try {
      if (USE_MOCK_DATA) {
        // In mock mode, we'll create a session with the same ID
        // In a real app, this would fetch from the backend
        const mockSession: QuizSession = {
          id: sessionId,
          userId: "current-user",
          category: "vocabulary",
          level: "N5",
          questions: mockQuizData.questions.slice(0, 5) as QuizQuestion[],
          currentQuestionIndex: 0,
          answers: [],
          startTime: new Date().toISOString(),
          isCompleted: false,
          totalPoints: 50,
          score: 0,
        };

        return {
          statusCode: 200,
          data: { session: mockSession },
          message: "Quiz session retrieved successfully",
        };
      }

      // Real API implementation
      const response = await axiosPrivate.get(`/api/v1/quiz/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting quiz session:", error);
      throw error;
    }
  },

  // Get quiz questions for a session
  getQuizQuestions: async (sessionId: string): Promise<IGetQuizQuestionsResponse> => {
    try {
      if (USE_MOCK_DATA) {
        // In mock mode, questions are already included in the session
        return {
          statusCode: 200,
          data: { questions: [] },
          message: "Questions retrieved successfully",
        };
      }

      // Real API implementation
      const response = await axiosClient.get(`/api/v1/quiz/${sessionId}/questions`);
      return response.data;
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      throw error;
    }
  },

  // Submit an answer for a question
  submitAnswer: async (params: {
    sessionId: string;
    questionId: string;
    selectedAnswers: string[];
    timeSpent: number;
  }): Promise<ISubmitQuizAnswerResponse> => {
    try {
      if (USE_MOCK_DATA) {
        // Find the question
        const question = mockQuizData.questions.find(q => q.id === params.questionId);
        if (!question) {
          throw new Error("Question not found");
        }

        // Check if answer is correct
        const isCorrect = JSON.stringify(params.selectedAnswers.sort()) === 
                         JSON.stringify(question.correctAnswers.sort());
        
        const points = isCorrect ? question.points : 0;

        return {
          statusCode: 200,
          data: {
            isCorrect,
            points,
            explanation: question.explanation,
          },
          message: "Answer submitted successfully",
        };
      }

      // Real API implementation
      const response = await axiosPrivate.post(`/api/v1/quiz/${params.sessionId}/answer`, {
        questionId: params.questionId,
        selectedAnswers: params.selectedAnswers,
        timeSpent: params.timeSpent,
      });
      return response.data;
    } catch (error) {
      console.error("Error submitting answer:", error);
      throw error;
    }
  },

  // Complete the quiz and get results
  completeQuiz: async (params: {
    sessionId: string;
    answers: {
      questionId: string;
      selectedAnswers: string[];
      timeSpent: number;
    }[];
    totalTimeSpent: number;
  }): Promise<ICompleteQuizResponse> => {
    try {
      if (USE_MOCK_DATA) {
        // Calculate results
        let correctAnswers = 0;
        let earnedPoints = 0;
        const totalQuestions = params.answers.length;

        for (const answer of params.answers) {
          const question = mockQuizData.questions.find(q => q.id === answer.questionId);
          if (question) {
            const isCorrect = JSON.stringify(answer.selectedAnswers.sort()) === 
                             JSON.stringify(question.correctAnswers.sort());
            if (isCorrect) {
              correctAnswers++;
              earnedPoints += question.points;
            }
          }
        }

        const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        // Determine Pokemon reward based on score
        let pokemonReward;
        if (score >= 90) {
          pokemonReward = {
            id: "mew",
            name: "Mew",
            image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png",
            rarity: "LEGENDARY" as const,
          };
        } else if (score >= 80) {
          pokemonReward = {
            id: "lucario",
            name: "Lucario",
            image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png",
            rarity: "RARE" as const,
          };
        } else if (score >= 70) {
          pokemonReward = {
            id: "eevee",
            name: "Eevee",
            image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png",
            rarity: "UNCOMMON" as const,
          };
        } else if (score >= 60) {
          pokemonReward = {
            id: "pikachu",
            name: "Pikachu",
            image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
            rarity: "COMMON" as const,
          };
        }

        // Generate achievements
        const achievements = [];
        if (score === 100) achievements.push("Perfect Score!");
        if (score >= 90) achievements.push("Quiz Master");
        if (correctAnswers >= 5) achievements.push("Knowledge Seeker");
        if (params.totalTimeSpent < 300) achievements.push("Speed Demon");

        const result: QuizResult = {
          sessionId: params.sessionId,
          userId: "current-user",
          category: "vocabulary", // Default category for mock
          level: "N5", // Default level for mock
          totalQuestions,
          correctAnswers,
          score,
          totalPoints: params.answers.reduce((sum, answer) => {
            const question = mockQuizData.questions.find(q => q.id === answer.questionId);
            return sum + (question?.points || 0);
          }, 0),
          earnedPoints,
          timeSpent: Math.round(params.totalTimeSpent / 60), // Convert to minutes
          completedAt: new Date().toISOString(),
          pokemonReward,
          achievements: achievements.length > 0 ? achievements : undefined,
        };

        return {
          statusCode: 201,
          data: { result },
          message: "Quiz completed successfully",
        };
      }

      // Real API implementation
      const response = await axiosPrivate.post(`/api/v1/quiz/${params.sessionId}/complete`, {
        answers: params.answers,
        totalTimeSpent: params.totalTimeSpent,
      });
      return response.data;
    } catch (error) {
      console.error("Error completing quiz:", error);
      throw error;
    }
  },

  // Get user's quiz statistics
  getQuizStats: async (): Promise<IGetQuizStatsResponse> => {
    try {
      if (USE_MOCK_DATA) {
        const stats: QuizStats = {
          totalQuizzesCompleted: 15,
          averageScore: 78.5,
          totalPointsEarned: 1250,
          streakDays: 7,
          categoryStats: {
            vocabulary: {
              quizzesCompleted: 5,
              averageScore: 82.0,
              bestScore: 95,
            },
            grammar: {
              quizzesCompleted: 4,
              averageScore: 75.0,
              bestScore: 90,
            },
            kanji: {
              quizzesCompleted: 3,
              averageScore: 70.0,
              bestScore: 85,
            },
            listening: {
              quizzesCompleted: 2,
              averageScore: 80.0,
              bestScore: 88,
            },
            reading: {
              quizzesCompleted: 1,
              averageScore: 85.0,
              bestScore: 85,
            },
          },
        };

        return {
          statusCode: 200,
          data: { stats },
          message: "Quiz stats retrieved successfully",
        };
      }

      // Real API implementation
      const response = await axiosPrivate.get("/api/v1/quiz/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching quiz stats:", error);
      throw error;
    }
  },

  // Get quiz history
  getQuizHistory: async (params?: {
    limit?: number;
    offset?: number;
    category?: string;
  }): Promise<IGetQuizHistoryResponse> => {
    try {
      if (USE_MOCK_DATA) {
        // Mock quiz history
        const mockResults: QuizResult[] = [
          {
            sessionId: "quiz_1",
            userId: "current-user",
            category: "vocabulary",
            level: "N5",
            totalQuestions: 10,
            correctAnswers: 8,
            score: 80,
            totalPoints: 100,
            earnedPoints: 80,
            timeSpent: 5,
            completedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            pokemonReward: {
              id: "eevee",
              name: "Eevee",
              image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png",
              rarity: "UNCOMMON",
            },
            achievements: ["Quiz Master"],
          },
          // Add more mock results as needed
        ];

        return {
          statusCode: 200,
          data: {
            results: mockResults,
            totalCount: mockResults.length,
            hasMore: false,
          },
          message: "Quiz history retrieved successfully",
        };
      }

      // Real API implementation
      const response = await axiosPrivate.get("/api/v1/quiz/history", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching quiz history:", error);
      throw error;
    }
  },
  
  // Get a completed session with user's answers for review
  getQuizReview: async (sessionId: string): Promise<IGetQuizReviewResponse> => {
    try {
      if (USE_MOCK_DATA) {
        const questions = mockQuizData.questions.slice(0, 5) as QuizQuestion[];

        const answers = questions.map((q) => {
          const selectedAnswers = q.correctAnswers;
          const isCorrect = JSON.stringify([...selectedAnswers].sort()) === JSON.stringify([...q.correctAnswers].sort());
          return {
            questionId: q.id,
            selectedAnswers,
            isCorrect,
            timeSpent: q.estimatedTime ?? 0,
            points: isCorrect ? q.points : 0,
            answeredAt: new Date().toISOString(),
          };
        });

        const session: QuizSession = {
          id: sessionId,
          userId: "current-user",
          category: "vocabulary",
          level: "N5",
          questions,
          currentQuestionIndex: questions.length,
          answers,
          startTime: new Date(Date.now() - 600000).toISOString(),
          endTime: new Date().toISOString(),
          isCompleted: true,
          totalPoints: questions.reduce((s, q) => s + q.points, 0),
          score: Math.round((answers.filter((a) => a.isCorrect).length / questions.length) * 100),
        };

        return {
          statusCode: 200,
          data: { session },
          message: "Quiz review retrieved successfully",
        };
      }

      const response = await axiosPrivate.get(`/api/v1/quiz/session/${sessionId}/review`);
      return response.data;
    } catch (error) {
      console.error("Error fetching quiz review:", error);
      throw error;
    }
  },
};
