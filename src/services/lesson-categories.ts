import { axiosClient, axiosPrivate } from "@configs/axios";

const lessonCategoriesService = {
  getAllLessonCategories: async () => {
    return axiosPrivate.get(`/lesson-categories`);
  },
};

export default lessonCategoriesService;
