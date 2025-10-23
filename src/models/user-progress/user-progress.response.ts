export interface UserProgress {
  id: number;
  userId: number;
  lessonId: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
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
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface UserProgressPagination {
  current: number;
  pageSize: number;
  totalPage: number;
  totalItem: number;
}

export interface UserProgressResponse {
  statusCode: number;
  data: {
    results: UserProgress[];
    pagination: UserProgressPagination;
  };
  message: string;
}
