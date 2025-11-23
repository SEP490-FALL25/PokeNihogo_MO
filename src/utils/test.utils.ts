import { TestQuestion, AnswerOption } from "@components/test/TestQuestionCard";

export type TestSet = { id: string; content: string; questions: TestQuestion[] };

export type TestConfig = {
  title: string;
  icon: string;
  color: string;
  exitTitle: string;
  exitMessage: string;
};

export const getTestConfig = (testType?: string): TestConfig => {
  switch (testType) {
    case "READING_TEST":
      return {
        title: "Bài đọc",
        icon: "book-open-page-variant",
        color: "#0ea5e9",
        exitTitle: "Thoát bài đọc?",
        exitMessage: "Bạn có muốn quay lại danh sách bài đọc?",
      };
    case "LISTENING_TEST":
      return {
        title: "Bài nghe",
        icon: "headphones",
        color: "#10b981",
        exitTitle: "Thoát bài nghe?",
        exitMessage: "Bạn có muốn quay lại danh sách bài nghe?",
      };
    case "LESSON_TEST":
      return {
        title: "Kiểm tra bài học",
        icon: "file-document-edit",
        color: "#6366f1",
        exitTitle: "Thoát bài kiểm tra?",
        exitMessage: "Bạn có muốn quay lại bài học?",
      };
    default:
      return {
        title: "Bài test",
        icon: "file-document-edit",
        color: "#0ea5e9",
        exitTitle: "Thoát bài test?",
        exitMessage: "Bạn có muốn quay lại?",
      };
  }
};

export const transformTestSets = (data: any): TestSet[] => {
  const setsRaw = data?.data?.testSets || [];
  let counter = 0;
  return setsRaw.map((s: any, setIndex: number) => {
    // Support both old format (testSetQuestionBanks) and new format (questions)
    const questionList = s.testSetQuestionBanks || s.questions || [];
    
    const questions: TestQuestion[] = questionList
      .sort((a: any, b: any) => (a.questionOrder || 0) - (b.questionOrder || 0))
      .map((qb: any) => {
        const q = qb.questionBank;
        counter += 1;
        // For new format: use set index + question id as set id
        const setId = s.id || `set-${setIndex}`;
        return {
          bankId: String(q.id),
          uid: `${setId}-${q.id}`,
          question: q.question || "",
          options: (q.answers || []).map((ans: any) => ({
            id: String(ans.id),
            text: ans.answer,
          })),
          globalIndex: counter,
          audioUrl: q.audioUrl || q.audioURL || q.audio || undefined,
        };
      });
    return { id: String(s.id || `set-${setIndex}`), content: s.content || "", questions };
  });
};
