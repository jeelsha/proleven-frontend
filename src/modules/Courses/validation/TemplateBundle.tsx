import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export const TemplateBundleSchema = (bundleId?: number) => {
  const { t } = useTranslation();
  return Yup.object().shape({
    title: Yup.string()
      .trim()
      .when('bundle_id', {
        is: undefined,
        then: () =>
          Yup.string().trim().required(t('CoursesManagement.Errors.Course.title')),
      }),
    description: Yup.string()
      .trim()
      .when('bundle_id', {
        is: undefined,
        then: () =>
          Yup.string()
            .trim()
            .required(t('CoursesManagement.Bundle.AddEditBundle.Error.description')),
      }),

    course_slugs: bundleId
      ? Yup.array().min(1, t('CoursesManagement.Bundle.AddEditBundle.Error.courses'))
      : Yup.array()
          .min(1, t('CoursesManagement.Bundle.AddEditBundle.Error.courses'))
          .test(
            'min-2',
            t('CoursesManagement.Bundle.AddEditBundle.Error.MinimumCourses'),
            (val) => val && val.length >= 2
          ),
  });
};

export const AddTrainerSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    trainer_type: Yup.string()
      .trim()
      .required(t('CoursesManagement.ExtraTrainer.error.selectTrainerType')),
    trainer: Yup.array()
      .of(Yup.number())
      .min(1, t('CoursesManagement.ExtraTrainer.error.selectTrainer')),
  });
};
