// ** Componentns ***
import Button from 'components/Button/Button';
import ReactSelect from 'components/FormElement/ReactSelect';
import { Modal } from 'components/Modal/Modal';
import { Form, Formik, FormikValues } from 'formik';

// ** Types ***
import { ObjectOption, Option } from 'components/FormElement/types';
import {
  acceptProps,
  CourseModeEnum,
  CourseOption,
  CourseTypeEnum,
} from 'modules/Courses/types/IRecoveryModel';

// ** Validation ***
import { RecoverCourseValidationSchema } from './validation';

// ** Hooks
import { useAxiosPost } from 'hooks/useAxios';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ** Utils
import { format, parseISO } from 'date-fns';

const RecoverCourseModal = ({
  modal,
  courseCode,
  participateSlug,
  refetch,
  courseSlug,
}: acceptProps) => {
  const { t } = useTranslation();

  const [course, setCourse] = useState<Option[]>();
  const [courseDesign, setCourseDesign] = useState<ObjectOption[]>();
  const { response, isLoading: gettingRecoverCourse } = useQueryGetFunction(
    '/course/dropdown',
    {
      option: {
        // dropdown: true,
        is_recoverCourse: true,
        code: courseCode ?? '',
        courseSlugToIgnore: courseSlug,
      },
    }
  );
  const [recoverCourse, { isLoading: isRecovering }] = useAxiosPost();

  const CourseMode = (mode: CourseModeEnum): string => {
    const modeTranslations = {
      [CourseModeEnum.InPerson]: t('CoursesManagement.CourseModeEnum.InPerson'),
      [CourseModeEnum.VideoConference]: t(
        'CoursesManagement.CourseModeEnum.VideoConference'
      ),
      [CourseModeEnum.Hybrid]: t('CoursesManagement.CourseModeEnum.Hybrid'),
    };
    return modeTranslations[mode];
  };

  const CourseType = (mode: CourseTypeEnum): string => {
    const modeTranslations = {
      [CourseTypeEnum.Academy]: t('CoursesManagement.CourseType.Academy'),
      [CourseTypeEnum.Private]: t('CoursesManagement.CourseType.Private'),
    };
    return modeTranslations[mode];
  };

  useEffect(() => {
    if (response?.data) {
      const updatedList = response?.data?.data?.map((item: CourseOption) => ({
        label: `
        ${item?.code} -
        ${item?.title} - \n
        [ ${format(parseISO(item?.start_date), 'dd/MM/yyyy')} -
          ${format(parseISO(item?.end_date), 'dd/MM/yyyy')} ] -
        ${CourseMode(item?.mode)}  -
        ${CourseType(item?.type)} `,
        value: item?.id,
      }));
      setCourse(updatedList);

      const designList = response?.data?.data?.map((item: CourseOption) => ({
        recoveryCourseItem: {
          ...item,
          start_date: format(parseISO(item.start_date), 'dd/MM/yyyy'),
          end_date: format(parseISO(item.end_date), 'dd/MM/yyyy'),
          mode: CourseMode(item.mode),
          type: CourseType(item.type),
        },
        value: item?.id,
      }));
      setCourseDesign(designList);
    }
  }, [response]);

  const OnSubmit = async (courseData: FormikValues) => {
    const objToPass: { [key: string]: unknown } = {};
    if (courseData.course_id) {
      objToPass.course_id = courseData.course_id;
    }
    const { error } = await recoverCourse(
      `course/participates/recover/${participateSlug}`,
      objToPass
    );
    if (!error) {
      modal.closeModal();
      refetch();
    }
  };

  return (
    <Modal headerTitle="Recover" modal={modal} width="max-w-[430px]">
      <>
        <span className="text-sm text-dark opacity-50 w-50">
          {t('recoverModal.description')}
        </span>

        <Formik
          initialValues={{ course_id: '' }}
          validationSchema={RecoverCourseValidationSchema()}
          onSubmit={(data) => {
            OnSubmit(data);
          }}
        >
          {() => {
            return (
              <Form className="flex flex-col mt-3 gap-4">
                <ReactSelect
                  parentClass="w-full"
                  name="course_id"
                  label={t('recoverModal.courseDropDown.label')}
                  isCompulsory
                  options={course}
                  objectOptions={courseDesign}
                  placeholder={t('recoverModal.courseDropDown.placeHolder')}
                  isLoading={gettingRecoverCourse}
                  customLabelCase="courseRecover"
                />

                <div className="flex justify-end gap-4 mt-3">
                  <Button
                    onClickHandler={() => modal.closeModal()}
                    className="min-w-[110px]"
                    variants="whiteBordered"
                  >
                    {t('Button.cancelButton')}
                  </Button>
                  <Button
                    className="min-w-[110px]"
                    variants="primary"
                    type="submit"
                    isLoading={isRecovering}
                    disabled={isRecovering}
                  >
                    {t('Button.saveButton')}
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </>
    </Modal>
  );
};

export default RecoverCourseModal;
