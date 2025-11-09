import { axiosPrivate } from "@configs/axios";
import { IExerciseHistoryItem } from "@models/user-exercise-attempt/user-exercise-attempt.response";

// Feature flags
const USE_MOCK_DATA =
  process.env.NODE_ENV === "development" || !process.env.EXPO_PUBLIC_API_URL;

// Mock exercise history data
const generateMockExerciseHistory = (): IExerciseHistoryItem[] => {
  const now = Date.now();
  const exerciseTypes = ['reading', 'listening', 'speaking', 'vocabulary', 'grammar', 'kanji'];
  const levels = [5, 4, 3];
  const exerciseNames = [
    'Bài tập đọc hiểu cơ bản',
    'Luyện nghe hội thoại hàng ngày',
    'Thực hành phát âm',
    'Từ vựng N5 - Gia đình (có audio)',
    'Ngữ pháp - Thì quá khứ',
    'Kanji cơ bản - Số đếm',
    'Đọc hiểu văn bản ngắn',
    'Nghe hiểu tin tức',
    'Luyện nói giới thiệu bản thân',
    'Từ vựng N4 - Công việc (có audio)',
    'Ngữ pháp - Điều kiện',
    'Kanji trung cấp - Thời gian',
    'Đọc hiểu văn bản dài',
    'Nghe hiểu phỏng vấn',
    'Thuyết trình bằng tiếng Nhật',
    'Từ vựng N5 - Màu sắc (có audio)',
    'Từ vựng N5 - Đồ vật (có audio)',
    'Từ vựng N4 - Thực phẩm (có audio)',
    'Từ vựng N3 - Du lịch (có audio)',
    'Từ vựng N5 - Số đếm (có audio)',
  ];

  const mockData: IExerciseHistoryItem[] = [];
  
  // Generate 30 mock exercises (increased to ensure more variety)
  // Ensure at least 8 vocabulary exercises
  const vocabularyIndices = [0, 5, 10, 15, 20, 25, 28, 29];
  
  for (let i = 0; i < 30; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)];
    // Prefer vocabulary type for specific indices to ensure vocabulary exercises appear
    const exerciseType = vocabularyIndices.includes(i) 
      ? 'vocabulary' 
      : exerciseTypes[Math.floor(Math.random() * exerciseTypes.length)];
    const exerciseName = exerciseNames[Math.floor(Math.random() * exerciseNames.length)];
    const totalQuestions = [10, 15, 20, 25][Math.floor(Math.random() * 4)];
    const answeredCorrect = Math.floor(Math.random() * (totalQuestions * 0.9)) + Math.floor(totalQuestions * 0.5);
    const answeredInCorrect = totalQuestions - answeredCorrect;
    const score = Math.round((answeredCorrect / totalQuestions) * 100);
    const time = Math.floor(Math.random() * 1800) + 300; // 5-35 minutes in seconds
    
    // Random date from last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const completedAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    mockData.push({
      id: i + 1,
      exerciseAttemptId: 1000 + i,
      exerciseName: `${exerciseName} - ${exerciseType}`,
      exerciseType,
      levelJlpt: level,
      totalQuestions,
      answeredCorrect,
      answeredInCorrect,
      score,
      time,
      status: 'COMPLETED',
      completedAt,
      lesson: {
        id: 100 + i,
        titleJp: `レッスン ${i + 1}`,
        levelJlpt: level,
      },
    });
  }

  // Sort by completedAt descending (newest first)
  return mockData.sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
};

const userExerciseAttemptService = {
  getLatestExerciseAttempt: async (lessonId: string) => {
    return axiosPrivate.get(`/user-exercise-attempt/latest/lesson/${lessonId}`);
  },
  getExerciseQuestions: async (exerciseAttemptId: string) => {
    return axiosPrivate.get(
      `/user-exercise-attempt/exercise/${exerciseAttemptId}`
    );
  },
  checkCompleted: async (exerciseAttemptId: string) => {
    return axiosPrivate.get(
      `/user-exercise-attempt/${exerciseAttemptId}/check-completion`
    );
  },
  submitCompletion: async (exerciseAttemptId: string, time: number) => {
    return axiosPrivate.put(
      `/user-exercise-attempt/${exerciseAttemptId}/submit-completion`,
      { time }
    );
  },
  getReviewResult: async (exerciseAttemptId: string) => {
    return axiosPrivate.get(
      `/user-exercise-attempt/exercise/${exerciseAttemptId}/review`
    );
  },
  abandonExercise: async (exerciseAttemptId: string, time: number) => {
    return axiosPrivate.put(
      `/user-exercise-attempt/${exerciseAttemptId}/abandon`,
      { time }
    );
  },
  continueAndAbandonExercise: async (
    exerciseAttemptId: string,
    status: string
  ) => {
    return axiosPrivate.put(`/user-exercise-attempt/${exerciseAttemptId}`, {
      status,
    });
  },
  createNewExerciseAttempt: async (exerciseId: string) => {
    return axiosPrivate.post(`/user-exercise-attempt/${exerciseId}`);
  },
  getExerciseHistory: async (params?: {
    limit?: number;
    offset?: number;
    levelJlpt?: number;
    exerciseType?: string;
  }) => {
    try {
      if (USE_MOCK_DATA) {
        // Generate mock data
        let mockData = generateMockExerciseHistory();
        
        // Apply filters
        if (params?.levelJlpt) {
          mockData = mockData.filter(item => item.levelJlpt === params.levelJlpt);
        }

        if (params?.exerciseType) {
          mockData = mockData.filter(item => 
            item.exerciseType.toLowerCase() === params.exerciseType?.toLowerCase()
          );
        }

        // Apply pagination
        const limit = params?.limit || 20;
        const offset = params?.offset || 0;
        const totalCount = mockData.length;
        const paginatedData = mockData.slice(offset, offset + limit);
        const hasMore = offset + limit < totalCount;

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Return format matching axios response structure
        // Wrap in { data: ... } to match axios response format
        return {
          data: {
            statusCode: 200,
            message: "Exercise history retrieved successfully",
            data: {
              results: paginatedData,
              totalCount,
              hasMore,
            },
          },
        } as any;
      }

      // Real API implementation
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.levelJlpt) queryParams.append('levelJlpt', params.levelJlpt.toString());
      if (params?.exerciseType) queryParams.append('exerciseType', params.exerciseType);

      const queryString = queryParams.toString();
      return axiosPrivate.get(`/user-exercise-attempt/history${queryString ? `?${queryString}` : ''}`);
    } catch (error) {
      console.error("Error fetching exercise history:", error);
      throw error;
    }
  },
};

export default userExerciseAttemptService;
