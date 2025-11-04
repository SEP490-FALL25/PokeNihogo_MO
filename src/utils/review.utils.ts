import { ParsedExplanation } from "@components/test/review";
import { IReviewResultQuestionBank } from "@models/user-exercise-attempt/user-exercise-attempt.response";

/**
 * Parse explanation text to extract VN and EN parts
 */
export const parseExplanation = (explanation?: string): ParsedExplanation | null => {
  if (!explanation) return null;

  const vnMatch = explanation.match(/VN:\s*(.+?)(?:\n|$|EN:)/i);
  const enMatch = explanation.match(/EN:\s*(.+?)(?:\n|$)/i);

  return {
    vn: vnMatch ? vnMatch[1].trim() : null,
    en: enMatch ? enMatch[1].trim() : explanation,
  };
};

/**
 * Get sorted questions by questionOrder from review data
 */
export const getSortedQuestions = (reviewData: any): IReviewResultQuestionBank[] => {
  const testSets = reviewData?.data?.testSets;
  if (!testSets || testSets.length === 0) return [];

  const allQuestions = testSets.flatMap((testSet: any) =>
    testSet.testSetQuestionBanks || []
  );

  return allQuestions
    .sort(
      (a: { questionOrder: number }, b: { questionOrder: number }) =>
        a.questionOrder - b.questionOrder
    )
    .map(
      (item: { questionBank: IReviewResultQuestionBank }) => item.questionBank
    );
};

/**
 * Get user selected answers for a question
 */
export const getUserSelectedAnswers = (
  question: IReviewResultQuestionBank
): number[] => {
  return question.answers
    .filter((answer) => answer.type === "user_selected_incorrect")
    .map((answer) => answer.id);
};

/**
 * Get correct answers for a question
 */
export const getCorrectAnswers = (
  question: IReviewResultQuestionBank
): number[] => {
  return question.answers
    .filter((answer) => answer.type === "correct_answer")
    .map((answer) => answer.id);
};

/**
 * Calculate review statistics from review data
 */
export const calculateReviewStats = (reviewData: any) => {
  if (!reviewData?.data) return null;
  const data = reviewData.data;
  return {
    totalQuestions: data.totalQuestions,
    answeredCorrect: data.answeredCorrect,
    answeredInCorrect: data.answeredInCorrect,
    unansweredQuestions:
      data.totalQuestions - data.answeredCorrect - data.answeredInCorrect,
    time: data.time,
    status: data.status,
  };
};

/**
 * Get questions for stats grid navigation
 */
export const getQuestionsForGrid = (
  questions: IReviewResultQuestionBank[]
): Array<{ id: number; isCorrect: boolean; hasUserAnswer: boolean }> => {
  return questions.map((q) => {
    const userSelectedIds = getUserSelectedAnswers(q);
    return {
      id: q.id,
      isCorrect: q.isCorrect,
      hasUserAnswer: userSelectedIds.length > 0,
    };
  });
};
