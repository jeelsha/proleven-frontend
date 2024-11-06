import Button from 'components/Button/Button';
import ReactSelect from 'components/FormElement/ReactSelect';
import { Option } from 'components/FormElement/types';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';
import { Form, Formik, FormikValues } from 'formik';
import { UserModalType } from 'hooks/types';
import { useAxiosPost } from 'hooks/useAxios';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SplitModalSchema } from '../validation/SplitModalSchema';

type acceptProps = {
  courseModal: UserModalType;
  bundleId?: number;
  fetchBundleData?: () => void;
};
const CourseSplitModal = ({
  courseModal,
  bundleId,
  fetchBundleData,
}: acceptProps) => {
  const { t } = useTranslation();
  const initialValues = {
    trainer_id: '',
    course_slugs: [],
  };
  const [trainer, setTrainer] = useState<Option[]>();
  const [assignTrainer, { isLoading }] = useAxiosPost();
  const [course, setCourse] = useState<Option[]>();
  const { response } = useQueryGetFunction('/course/bundle/optional-trainers', {
    option: {
      dropdown: true,
      label: 'name',
      value: 'assigned_to',
      course_bundle_id: bundleId,
    },
  });
  const { response: courseData } = useQueryGetFunction('/bundle/courses', {
    option: {
      dropdown: true,
      label: 'title',
      value: 'slug',
      course_bundle_id: bundleId,
    },
  });
  useEffect(() => {
    if (response?.data) {
      setTrainer(response?.data);
    }
    if (courseData?.data) {
      setCourse(courseData?.data);
    }
  }, [response, courseData]);

  const OnSubmit = async (values: FormikValues) => {
    const temp = {
      course_slugs: values?.course_slugs,
      course_bundle_id: bundleId,
      trainer_id: values?.trainer_id,
    };
    const resp = await assignTrainer('/course/bundle/assign-as-main-trainer', temp);
    if (!resp?.error) {
      courseModal?.closeModal();
      fetchBundleData?.();
    }
  };
  return (
    <Modal headerTitle={t('AcceptTrainer')} modal={courseModal}>
      <>
        <div className="mb-6 mx-auto w-24 h-24 text-green2 rounded-full bg-green2/20 flex items-center justify-center">
          <Image iconName="checkRoundIcon2" iconClassName="w-6 h-6" />
        </div>
        <p className="text-lg font-normal mb-2">
          {t('AllocateOptionalTrainer.title')}
        </p>

        <Formik
          initialValues={initialValues}
          validationSchema={SplitModalSchema(course?.length)}
          onSubmit={(values) => {
            OnSubmit(values);
          }}
        >
          {({ values }) => {
            return (
              <Form className="flex flex-col gap-4 mt-7">
                <ReactSelect
                  parentClass="w-full"
                  name="trainer_id"
                  label={t('AllocateOptionalTrainer.label')}
                  isCompulsory
                  options={trainer}
                  placeholder={t('AllocateOptionalTrainer.placeholder')}
                  selectedValue={values?.trainer_id}
                />
                <ReactSelect
                  parentClass="w-full"
                  name="course_slugs"
                  label={t('AllocateOptionalTrainer.courseLabel')}
                  isMulti
                  isCompulsory
                  options={course}
                  placeholder={t('AllocateOptionalTrainer.CoursePlaceholder')}
                  selectedValue={values?.course_slugs}
                />
                <div className="flex justify-end gap-4">
                  <Button className="min-w-[110px]" variants="whiteBordered">
                    {t('Button.cancelButton')}
                  </Button>
                  <Button
                    className="min-w-[110px]"
                    variants="primary"
                    type="submit"
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    {t('Button.submit')}
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

export default CourseSplitModal;
