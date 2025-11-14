import { ExerciseAttemptStatus } from '@constants/exercise.enum';

/**
 * Get translated status text based on the current language
 * @param status - The exercise attempt status
 * @param t - Translation function from i18next
 * @returns Translated status text
 */
export const getExerciseStatusText = (
  status: string,
  t: (key: string) => string
): string => {
  const normalized = status.toUpperCase();
  const statusKey = `exercise_history.status.${normalized.toLowerCase()}`;
  const translated = t(statusKey);
  
  // Fallback to status value if translation not found
  if (translated === statusKey) {
    return status;
  }
  
  return translated;
};

/**
 * Get status color based on status value
 * @param status - The exercise attempt status
 * @returns Color hex code
 */
export const getExerciseStatusColor = (status: string): string => {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case ExerciseAttemptStatus.COMPLETED:
      return '#059669'; // green
    case ExerciseAttemptStatus.IN_PROGRESS:
      return '#d97706'; // orange
    case ExerciseAttemptStatus.FAIL:
    case ExerciseAttemptStatus.FAILED:
      return '#ef4444'; // red
    case ExerciseAttemptStatus.ABANDONED:
      return '#94a3b8'; // gray
    case ExerciseAttemptStatus.SKIPPED:
      return '#94a3b8'; // gray
    case ExerciseAttemptStatus.NOT_STARTED:
      return '#6b7280'; // dark gray
    default:
      return '#6b7280';
  }
};

/**
 * Get status background color based on status value
 * @param status - The exercise attempt status
 * @returns Color hex code
 */
export const getExerciseStatusBgColor = (status: string): string => {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case ExerciseAttemptStatus.COMPLETED:
      return '#d1fae5'; // light green
    case ExerciseAttemptStatus.IN_PROGRESS:
      return '#fef3c7'; // light orange
    case ExerciseAttemptStatus.FAIL:
    case ExerciseAttemptStatus.FAILED:
      return '#fee2e2'; // light red
    case ExerciseAttemptStatus.ABANDONED:
      return '#f1f5f9'; // light gray
    case ExerciseAttemptStatus.SKIPPED:
      return '#f1f5f9'; // light gray
    case ExerciseAttemptStatus.NOT_STARTED:
      return '#f3f4f6'; // light dark gray
    default:
      return '#f3f4f6';
  }
};

