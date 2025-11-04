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
  return setsRaw.map((s: any) => {
    const questions: TestQuestion[] = (s.testSetQuestionBanks || [])
      .sort((a: any, b: any) => (a.questionOrder || 0) - (b.questionOrder || 0))
      .map((qb: any) => {
        const q = qb.questionBank;
        counter += 1;
        return {
          bankId: String(q.id),
          uid: `${s.id}-${q.id}`,
          question: q.question || "",
          options: (q.answers || []).map((ans: any) => ({
            id: String(ans.id),
            text: ans.answer,
          })),
          globalIndex: counter,
          audioUrl: q.audioUrl || q.audioURL || q.audio || undefined,
        };
      });
    return { id: String(s.id), content: s.content || "", questions };
  });
};
