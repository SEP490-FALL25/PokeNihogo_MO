import { axiosPrivate } from "@configs/axios";
import { ILessonCategoryResponse } from "@models/lesson-category/lesson-category.response";

const lessonCategoriesService = {
  getAllLessonCategories: async (): Promise<ILessonCategoryResponse> => {
    const response = await axiosPrivate.get(`/lesson-categories`);
    return response.data;
  },
};

export default lessonCategoriesService;
