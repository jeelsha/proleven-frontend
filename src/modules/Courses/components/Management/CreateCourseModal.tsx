// ** Components **
import Button from 'components/Button/Button';
import ReactSelect from 'components/FormElement/ReactSelect';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';
import { renderTemplatePreview } from 'modules/Courses/components/Common';

// ** Types **
import { Option } from 'components/FormElement/types';
import { CourseResponse } from 'modules/Courses/types';
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

type InitialProps = {
  course_template_id: number | null;
  bundle_id: number | null;
};
type CreateCourseModalType = {
  modal: ModalProps;
};
enum TemplateEnum {
  BUNDLE = 'bundle',
  TEMPLATE = 'template',
}

const CreateCourseModal = ({ modal }: CreateCourseModalType) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedOption, setSelectedOption] = useState(TemplateEnum.TEMPLATE);
  const [courses, setCourses] = useState<CourseBundle[]>([]);

  const options: Option[] = [];
  const initialValue = {
    course_template_id: null,
    bundle_id: null,
    selectedOption: '',
  };

  const [addCourseBundle] = useAxiosPost();

  const { response: templates, isLoading: templateLoading } = useQueryGetFunction(
    '/course/template',
    {
      option: {
        templateCodeDropdown: true,
        view: true,
      },
    }
  );

  const { response: bundles, isLoading: bundlesLoading } =
    useQueryGetFunction('/bundle');

  if (Array.isArray(bundles?.data?.data) && bundles?.data?.data.length > 0) {
    bundles?.data?.data.forEach((item: Bundle) => {
      options.push({ label: item.title, value: item.id });
    });
  }

  const handleNext = async (values: InitialProps) => {
    if (selectedOption === TemplateEnum.TEMPLATE) {
      navigate(
        `${PRIVATE_NAVIGATION.coursesManagement.courseManagement.path}/add?template=${values.course_template_id}`
      );
    }
    if (selectedOption === TemplateEnum.BUNDLE) {
      const { data, error } = await addCourseBundle('/course/bundle/used', {
        course_bundle_id: values.bundle_id,
      });
      if (!error) {
        navigate(
          `${PRIVATE_NAVIGATION.coursesManagement.courseManagement.path}/bundle/add?bundle=${data?.slug}`
        );
      }
    }
  };

  const getCoursesFromBundle = (val: string | number) =>
    ((bundles?.data?.data as Bundle[]) ?? []).flatMap((bundle) =>
      bundle.course_bundle.filter(() => bundle.id === val)
    );

  const handleOnChange = (val: string | number, setFieldValue: SetFieldValue) => {
    setFieldValue('bundle_id', val);
    if (Array.isArray(bundles?.data?.data) && bundles?.data?.data.length > 0) {
      setCourses(() => getCoursesFromBundle(val));
    }
  };

  const handleOptionChange = (option: TemplateEnum) => {
    setSelectedOption(option);
  };

  const templateOptions: Option[] = (templates?.data?.data ?? []).map(
    (item: CourseResponse) => ({
      label: `${item.code} - ${item.title}`,
      value: item?.slug,
    })
  );

  return (
    <Modal
      modal={modal}
      headerTitle={t('CoursesManagement.createCourse')}
      setDataClear={() => navigate('/course-management')}
    >
      <Formik
        enableReinitialize
        initialValues={initialValue}
        // validationSchema={TempValidationSchema()}
        onSubmit={(values) => handleNext(values)}
      >
        {({ values, setFieldValue }) => {
          return (
            <Form>
              <div className="">
                <div className="max-w-[623px] mx-auto grid grid-cols-2 gap-5 mb-16">
                  <div className="h-[213px]">
                    <div
                      className={`bg-authBG/30 p-5  text-primary rounded-xl h-full flex items-center flex-col justify-center transition-all duration-300 ${
                        selectedOption === TemplateEnum.TEMPLATE
                          ? ' bg-primary text-white'
                          : ' text-dark'
                      }`}
                    >
                      <label
                        htmlFor={TemplateEnum.TEMPLATE}
                        className="flex items-center flex-col justify-center"
                      >
                        <Image
                          iconName="drawPadIcon"
                          iconClassName="w-[70px] h-[70px]"
                        />
                        <p className="text-current text-xl font-semibold mb-5 mt-2.5 text-center leading-[1.2]">
                          {t('CoursesManagement.CreateCourse.selectTemplate')}
                        </p>
                      </label>
                      <span
                        className={`cursor-pointer inline-flex items-center justify-center relative w-5 h-5 border-2 border-solid border-grayText rounded  ${
                          selectedOption === TemplateEnum.TEMPLATE
                            ? ' bg-primary2 border-primary2'
                            : ''
                        }`}
                      >
                        {selectedOption === TemplateEnum.TEMPLATE ? (
                          <span className="absolute bottom-1 w-1.5 h-2.5 border-b-2 border-r-2 border-solid border-dark inline-block rotate-45" />
                        ) : (
                          ''
                        )}
                        <input
                          type="radio"
                          className="appearance-none cursor-pointer opacity-0 w-full h-full"
                          id={TemplateEnum.TEMPLATE}
                          name={TemplateEnum.TEMPLATE}
                          checked={selectedOption === TemplateEnum.TEMPLATE}
                          onChange={() => {
                            handleOptionChange(TemplateEnum.TEMPLATE);
                          }}
                        />
                      </span>
                    </div>
                  </div>
                  <div className="h-[213px]">
                    <div
                      className={`bg-authBG/30 p-5  text-primary rounded-xl h-full flex items-center flex-col justify-center transition-all duration-300 ${
                        selectedOption === TemplateEnum.BUNDLE
                          ? ' bg-primary text-white'
                          : ' text-dark'
                      }`}
                    >
                      <label
                        htmlFor={TemplateEnum.BUNDLE}
                        className="flex items-center flex-col justify-center"
                      >
                        <Image
                          iconName="templateIcon"
                          iconClassName="w-[70px] h-[70px]"
                        />
                        <p className="text-current text-xl font-semibold mb-5 mt-2.5 text-center leading-[1.2]">
                          {t('CoursesManagement.CreateCourse.bundlePlaceHolder')}
                        </p>
                      </label>
                      <span
                        className={`cursor-pointer inline-flex items-center justify-center relative w-5 h-5 border-2 border-solid border-grayText rounded  ${
                          selectedOption === TemplateEnum.BUNDLE
                            ? ' bg-primary2 border-primary2'
                            : ''
                        }`}
                      >
                        {selectedOption === TemplateEnum.BUNDLE ? (
                          <span className="absolute bottom-1 w-1.5 h-2.5 border-b-2 border-r-2 border-solid border-dark inline-block rotate-45" />
                        ) : (
                          ''
                        )}
                        <input
                          type="radio"
                          className="appearance-none cursor-pointer opacity-0 w-full h-full"
                          id={TemplateEnum.BUNDLE}
                          name={TemplateEnum.BUNDLE}
                          checked={selectedOption === TemplateEnum.BUNDLE}
                          onChange={() => {
                            handleOptionChange(TemplateEnum.BUNDLE);
                          }}
                        />
                      </span>
                    </div>
                  </div>
                  {selectedOption === TemplateEnum.TEMPLATE ? (
                    <ReactSelect
                      parentClass="col-span-2"
                      className="w-full"
                      name="course_template_id"
                      isCompulsory
                      options={templateOptions ?? []}
                      label={t('CoursesManagement.CreateCourse.selectTemplate')}
                      placeholder={t(
                        'CoursesManagement.CreateCourse.templatePlaceHolder'
                      )}
                      isLoading={templateLoading}
                    />
                  ) : (
                    ''
                  )}
                  {selectedOption === TemplateEnum.BUNDLE ? (
                    <ReactSelect
                      parentClass="col-span-2"
                      className="w-full"
                      name="bundle_id"
                      isCompulsory
                      options={options ?? []}
                      label={t('CoursesManagement.Bundle.TemplateBundle')}
                      placeholder={t(
                        'CoursesManagement.CreateCourse.bundlePlaceHolder'
                      )}
                      onChange={(val) =>
                        handleOnChange((val as Option).value, setFieldValue)
                      }
                      isLoading={bundlesLoading}
                    />
                  ) : (
                    ''
                  )}
                  {selectedOption === TemplateEnum.BUNDLE && courses?.length
                    ? renderTemplatePreview(courses, t, 'col-span-2')
                    : ''}
                </div>
                <Button
                  variants="primary"
                  className="w-fit mx-auto gap-2"
                  type="submit"
                  disabled={!values.course_template_id && !values.bundle_id}
                >
                  {selectedOption === TemplateEnum.BUNDLE
                    ? t('CoursesManagement.saveAndNextTitle')
                    : t('CoursesManagement.nextTitle')}

                  <Image iconName="arrowRightIcon" iconClassName="w-4 h-4" />
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
};
export default CreateCourseModal;
