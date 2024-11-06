// ** Components **
import Button from 'components/Button/Button';
import ReactSelect from 'components/FormElement/ReactSelect';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';
import { renderTemplatePreview } from 'modules/Courses/components/Common';

// ** Types **
import { Option } from 'components/FormElement/types';
import { Bundle, CourseBundle } from 'modules/Courses/types/TemplateBundle';
import { ModalProps, SetFieldValue } from 'types/common';

// ** Constants **
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';

// ** Formik **
import { Form, Formik } from 'formik';

// ** Hooks **
import { useAxiosPost } from 'hooks/useAxios';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type ModalType = { modal: ModalProps };

const CreateCourseBundle = ({ modal }: ModalType) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ** Const
  const initialValue = {
    bundle_id: null,
  };
  const options: Option[] = [];

  // ** States
  const [courses, setCourses] = useState<CourseBundle[]>([]);

  // ** APIs
  const [addCourseBundle, { isLoading }] = useAxiosPost();

  const { response, isLoading: isBundleLoading } = useQueryGetFunction('/bundle');

  if (Array.isArray(response?.data?.data) && response?.data?.data.length > 0) {
    response?.data?.data.forEach((item: Bundle) => {
      options.push({ label: item.title, value: item.id });
    });
  }

  const handleNext = async (values: { [key: string]: string | number | null }) => {
    const { data, error } = await addCourseBundle('/course/bundle/used', {
      course_bundle_id: values.bundle_id,
    });
    if (!error) {
      navigate(
        `${PRIVATE_NAVIGATION.coursesManagement.courseManagement.path}/bundle/add?bundle=${data?.slug}`
      );
    }
  };

  const getCoursesFromBundle = (val: string | number) =>
    ((response?.data?.data as Bundle[]) ?? []).flatMap((bundle) =>
      bundle.course_bundle.filter(() => bundle.id === val)
    );

  const handleOnChange = (val: string | number, setFieldValue: SetFieldValue) => {
    setFieldValue('bundle_id', val);
    if (Array.isArray(response?.data?.data) && response?.data?.data.length > 0) {
      setCourses(() => getCoursesFromBundle(val));
    }
  };

  return (
    <Modal modal={modal} headerTitle={t('CourseBundle.create')}>
      <Formik
        enableReinitialize
        initialValues={initialValue}
        onSubmit={(values) => handleNext(values)}
      >
        {({ values, setFieldValue }) => {
          return (
            <Form>
              <div className="mx-auto grid gap-5 mb-3">
                <ReactSelect
                  parentClass="col-span-2"
                  className="w-full"
                  name="bundle_id"
                  isCompulsory
                  options={options}
                  label={t('CoursesManagement.CreateCourse.selectTemplate')}
                  placeholder={t(
                    'CoursesManagement.CreateCourse.templatePlaceHolder'
                  )}
                  onChange={(val) =>
                    handleOnChange((val as Option).value, setFieldValue)
                  }
                  isLoading={isBundleLoading}
                />
              </div>

              {courses?.length ? renderTemplatePreview(courses, t) : ''}
              <Button
                variants="primary"
                className="w-fit mx-auto gap-2"
                type="submit"
                disabled={!values.bundle_id || isBundleLoading || isLoading}
                isLoading={isLoading}
              >
                {t('CoursesManagement.saveAndNextTitle')}
                <Image iconName="arrowRightIcon" iconClassName="w-4 h-4" />
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
};

export default CreateCourseBundle;
