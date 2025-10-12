import { lessonService } from '@services/lesson';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useLessons = (level: 'N5' | 'N4' | 'N3') => {
  return useQuery({
    queryKey: ['lessons', level],
    queryFn: () => lessonService.getLessonsByLevel(level),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!level, // Only run query if level is provided
  });
};

export const useLesson = (lessonId: string) => {
  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => lessonService.getLessonById(lessonId),
    enabled: !!lessonId,
  });
};

export const useUpdateLessonProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ lessonId, progress, isCompleted }: { 
      lessonId: string; 
      progress: number; 
      isCompleted?: boolean 
    }) => lessonService.updateLessonProgress(lessonId, progress, isCompleted),
    onSuccess: (data, variables) => {
      // Invalidate and refetch lessons
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lesson', variables.lessonId] });
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    },
  });
};

export const useUserProgress = () => {
  return useQuery({
    queryKey: ['userProgress'],
    queryFn: () => lessonService.getUserProgress(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
