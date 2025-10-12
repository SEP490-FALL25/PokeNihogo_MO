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
  lessons: Lesson[];
  icon: string;
  color: string;
}

export interface LessonProgress {
  lessonId: string;
  userId: string;
  isCompleted: boolean;
  progress: number;
  completedAt?: string;
  timeSpent: number; // in minutes
  score?: number; // 0-100
}
