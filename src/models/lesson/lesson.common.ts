// BE Response format for lesson progress
export interface LessonProgress {
  id: number;
  userId: number;
  lessonId: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'TESTING_LAST' | 'COMPLETED' | 'FAILED';
  progressPercentage: number;
  completedAt: string | null;
  lastAccessedAt: string;
  createdAt: string;
  updatedAt: string;
  lesson: {
    id: number;
    titleJp: string;
    levelJlpt: number;
    isPublished: boolean;
  };
}

// Legacy Lesson interface for backward compatibility
export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: 'N5' | 'N4' | 'N3';
  type: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'kanji';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  isCompleted: boolean;
  progress: number; // 0-100
  pokemonReward?: {
    id: string;
    name: string;
    image: string;
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  };
  prerequisites?: string[]; // lesson IDs that must be completed first
  tags: string[];
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonCategory {
  id: string;
  name: string;
  description: string;
  level: 'N5' | 'N4' | 'N3';
  lessons: LessonProgress[]; // Use BE format
  icon: string;
  color: string;
}

