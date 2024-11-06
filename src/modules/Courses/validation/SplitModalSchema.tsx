import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export const SplitModalSchema = (count?: number) => {
  const { t } = useTranslation();
  return Yup.object().shape({
    trainer_id: Yup.string().required(
      t('CoursesManagement.Errors.Lessons.lessonTrainer')
    ),

    course_slugs: Yup.array()
      .min(1, t('CoursesManagement.Errors.Course.courseId'))
      .max(count ? count - 1 : 0, t('selectMinimumCourses')),
  });
};
