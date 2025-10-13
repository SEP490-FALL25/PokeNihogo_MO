# Hệ thống Quiz/Test cho PokeNihongo

## Tổng quan

Hệ thống quiz được thiết kế để tạo các bài test/kiểm tra cho ứng dụng học tiếng Nhật PokeNihongo. Hệ thống hỗ trợ nhiều loại câu hỏi khác nhau và tích hợp hệ thống thưởng Pokemon.

## Tính năng chính

### 1. Các loại câu hỏi
- **Single Choice**: Chọn 1 đáp án đúng
- **Multiple Choice**: Chọn nhiều đáp án đúng
- **Text Input**: Nhập câu trả lời bằng text
- **Audio**: Nghe và chọn đáp án
- **Image**: Quan sát hình ảnh và chọn đáp án

### 2. Phân loại quiz
- **Vocabulary**: Từ vựng tiếng Nhật
- **Grammar**: Ngữ pháp
- **Kanji**: Chữ Kanji
- **Listening**: Nghe hiểu
- **Reading**: Đọc hiểu
- **Mixed**: Tổng hợp

### 3. Trình độ và độ khó
- **Trình độ**: N5, N4, N3
- **Độ khó**: Beginner, Intermediate, Advanced

### 4. Hệ thống thưởng
- Pokemon rewards dựa trên điểm số
- Rarity levels: Common, Uncommon, Rare, Epic, Legendary
- Achievements và badges

## Cấu trúc thư mục

```
src/
├── types/
│   └── quiz.types.ts              # Type definitions
├── models/
│   └── quiz/
│       ├── quiz.common.ts         # Common schemas
│       └── quiz.response.ts       # Response schemas
├── services/
│   └── quiz.ts                    # Quiz API service
├── components/
│   └── quiz/
│       ├── QuizProgress.tsx       # Progress bar component
│       ├── AnswerOption.tsx       # Answer option component
│       ├── QuestionCard.tsx       # Question display component
│       ├── QuizResultCard.tsx     # Result display component
│       └── PokemonRewardModal.tsx # Pokemon reward modal
├── app/
│   └── (app)/
│       ├── quiz/
│       │   ├── create.tsx         # Quiz creation screen
│       │   ├── [sessionId].tsx    # Quiz session screen
│       │   └── result/
│       │       └── [resultId].tsx # Quiz result screen
│       └── (tabs)/
│           └── quiz-demo.tsx      # Demo screen
├── routes/
│   └── routes.ts                  # Route definitions
└── mock-data/
    └── quiz-questions.json        # Sample quiz data
```

## Cách sử dụng

### 1. Tạo quiz mới

```typescript
import { quizService } from '@services/quiz';

const response = await quizService.createQuizSession({
  category: 'vocabulary',
  level: 'N5',
  questionCount: 10,
  difficulty: 'beginner'
});
```

### 2. Submit câu trả lời

```typescript
const response = await quizService.submitAnswer({
  sessionId: 'session-id',
  questionId: 'question-id',
  selectedAnswers: ['answer1', 'answer2'],
  timeSpent: 30
});
```

### 3. Hoàn thành quiz

```typescript
const response = await quizService.completeQuiz({
  sessionId: 'session-id',
  answers: answers,
  totalTimeSpent: 300
});
```

## Navigation

### Routes
- `/(app)/quiz/create` - Tạo quiz mới
- `/(app)/quiz/[sessionId]` - Làm quiz
- `/(app)/quiz/result/[resultId]` - Xem kết quả
- `/(app)/quiz/history` - Lịch sử quiz
- `/(app)/quiz/stats` - Thống kê

### Demo
Để test hệ thống, truy cập `/(app)/(tabs)/quiz-demo` để xem demo đầy đủ.

## Data Structure

### Quiz Question
```typescript
interface QuizQuestion {
  id: string;
  category: string;
  type: 'single-choice' | 'multiple-choice' | 'text-input' | 'audio' | 'image';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  level: 'N5' | 'N4' | 'N3';
  question: string;
  options?: QuizAnswerOption[];
  correctAnswers: string[];
  explanation?: string;
  tags: string[];
  estimatedTime: number;
  points: number;
}
```

### Quiz Result
```typescript
interface QuizResult {
  sessionId: string;
  userId: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  totalPoints: number;
  earnedPoints: number;
  timeSpent: number;
  completedAt: string;
  pokemonReward?: {
    id: string;
    name: string;
    image: string;
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  };
  achievements?: string[];
}
```

## Customization

### Thêm loại câu hỏi mới
1. Cập nhật `QuizQuestionType` trong `quiz.types.ts`
2. Thêm logic xử lý trong `QuestionCard.tsx`
3. Cập nhật mock data trong `quiz-questions.json`

### Thêm category mới
1. Cập nhật category options trong `create.tsx`
2. Thêm questions mẫu trong `quiz-questions.json`
3. Cập nhật filter logic trong `quiz.ts`

### Tùy chỉnh hệ thống thưởng
1. Cập nhật logic tính điểm trong `quiz.ts`
2. Thay đổi Pokemon rewards trong `completeQuiz` function
3. Tùy chỉnh UI trong `PokemonRewardModal.tsx`

## API Integration

Hệ thống hiện đang sử dụng mock data. Để tích hợp với API thực:

1. Cập nhật `USE_MOCK_DATA` flag trong `quiz.ts`
2. Implement các API endpoints tương ứng
3. Cập nhật request/response types nếu cần

## Testing

Để test hệ thống quiz:

1. Chạy ứng dụng
2. Navigate đến `/quiz-demo`
3. Chọn loại quiz muốn test
4. Hoàn thành quiz và xem kết quả
5. Kiểm tra Pokemon reward modal

## Future Enhancements

- [ ] Timer cho từng câu hỏi
- [ ] Hint system
- [ ] Question explanations
- [ ] Social sharing
- [ ] Leaderboards
- [ ] Daily challenges
- [ ] Offline mode
- [ ] Analytics tracking
