import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import ReactSelect from 'components/FormElement/ReactSelect';
import TextArea from 'components/FormElement/TextArea';
import { Option } from 'components/FormElement/types';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { Form, Formik } from 'formik';
import { useAxiosPost } from 'hooks/useAxios';
import { useQueryGetFunction } from 'hooks/useQuery';
import { Course } from 'modules/Courses/types';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCompany } from 'redux-toolkit/slices/companySlice';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import '../style/companyManager.css';
import { CourseCategory, TemplateBundleType } from '../types';
import { AddRequestCourseSchema } from '../validation';
import { ROLES } from 'constants/roleAndPermission.constant';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { useTitle } from 'hooks/useTitle';

const AddRequestCourses = () => {
  const updateTitle = useTitle();
  const { t } = useTranslation();
  const { allLanguages, defaultLanguage } = useSelector(useLanguage);
  const { company } = useSelector(useCompany);
  const firstRender = useRef(false);
  const user = useSelector(getCurrentUser);

  const currentFormLanguage = allLanguages?.find(
    (item) => item.short_name === defaultLanguage
  )?.short_name;
  const [createBundleApi, { isLoading }] = useAxiosPost();
  const navigate = useNavigate();
  const categoryData: Option[] = [];
  const subCategoryData: Option[] = [];
  const courseData: Option[] = [];

  // ** STATES

  const [categoryIds, setCategoryIds] = useState<Array<number>>([]);
  const [subCategoryIds, setSubCategoryIds] = useState<Array<number>>([]);
  const [courseSlug, setCourseSlug] = useState<Array<string>>([]);
  const [course, setCourse] = useState<CourseCategory[]>([]);
  const [previewCourse, setPreviewCourse] = useState<Course[]>([]);
  // ** Category dropdown
  const { response } = useQueryGetFunction(
    '/course/template/categories',
    { option: { view: true } },
    { 'accept-custom-language ': currentFormLanguage ?? '' }
  );

  const initialValues: TemplateBundleType = {
    category_id: [],
    course_slugs: [],
    sub_category_id: [],
    description: '',
  };

  const getCategoryData = () => {
    (response?.data?.data || []).forEach((category: CourseCategory) =>
      categoryData.push({
        label: category.name,
        value: category.id,
      })
    );
  };

  const getSubCategoryData = () => {
    response?.data?.data?.flatMap((category: CourseCategory) =>
      category.courseSubCategories
        ?.filter((subCategory) => categoryIds?.includes(subCategory.category_id))
        .forEach((subCategory) =>
          subCategoryData.push({ label: subCategory.name, value: subCategory.id })
        )
    );
  };

  const getCourseData = () => {
    response?.data?.data?.flatMap((category: CourseCategory) =>
      category.courseSubCategories?.flatMap((subCategory) =>
        subCategory.courses
          ?.filter(
            (course) =>
              course.sub_category_id !== null &&
              course.category_id !== null &&
              (subCategoryIds?.length < 1 ||
                subCategoryIds?.includes(course.sub_category_id)) &&
              course.slug !== undefined &&
              categoryIds?.includes(subCategory.category_id) &&
              course.slug !== undefined &&
              course.slug !== null
          )
          .forEach((course) =>
            courseData.push({ label: course.title, value: course.slug ?? '' })
          )
      )
    );
  };

  useEffect(() => {
    if (user?.role_name === ROLES.CompanyManager && firstRender.current) {
      firstRender.current = false;
      navigate(PRIVATE_NAVIGATION.dashboard.view.path);
    }
    firstRender.current = true;
  }, [company]);

  useEffect(() => {
    if (response?.data) {
      setCourse(response?.data?.data);
    }
  }, [response?.data]);

  getCategoryData();

  useEffect(() => {
    getSubCategoryData();
  }, [categoryData]);

  useEffect(() => {
    getCourseData();
  }, [subCategoryData, categoryData]);

  const OnSubmit = async (val: TemplateBundleType) => {
    const temp = {
      courses: val?.course_slugs,
      additional_notes: val?.description,
    };
    if (val) {
      const { error } = await createBundleApi(
        `/course-request/${company?.slug}`,
        temp
      );
      if (!error) {
        navigate(PRIVATE_NAVIGATION.companyManager.requestCourse.list.path);
      }
    }
  };

  const handleCategoryOrSubCategoryChange = (
    val: Option | Option[],
    type: string | undefined,
    fieldName: 'sub_category_id' | 'category_id',
    setIdsFunction: React.Dispatch<React.SetStateAction<number[]>>,
    values: TemplateBundleType
  ) => {
    const currentIds: Array<number> = values[fieldName] || [];
    const updatedIds =
      type === 'Removed'
        ? currentIds.filter((item) => item !== (val as Option[])[0].value)
        : [...currentIds, ...(val as Option[]).map((opt) => opt.value as number)];
    const courseSlugs = [...new Set(updatedIds)];
    setIdsFunction(courseSlugs);
    return courseSlugs;
  };
  const handleCourseSlug = (
    val: Option | Option[],
    type: string | undefined,
    fieldName: 'course_slugs',
    setIdsFunction: React.Dispatch<React.SetStateAction<string[]>>,
    values: TemplateBundleType
  ) => {
    const currentIds: Array<string> = values[fieldName] || [];
    const updatedIds =
      type === 'Removed'
        ? currentIds.filter((item) => item !== (val as Option[])[0].value)
        : [...currentIds, ...(val as Option[]).map((opt) => opt.value as string)];
    const courseSlugs = [...new Set(updatedIds)];
    setIdsFunction(courseSlugs);
    return courseSlugs;
  };

  useEffect(() => {
    if (courseSlug && course) {
      const matchingCourses = course.flatMap((category) =>
        category.courseSubCategories.flatMap((subCategory) =>
          subCategory.courses.filter((filteredCourse) =>
            courseSlug.includes(filteredCourse.slug ?? '')
          )
        )
      );

      setPreviewCourse(matchingCourses);
    }
  }, [courseSlug, course]);

  updateTitle(t('Header.profileDropdown.requestCoursesLabel'));
  return (
    <div>
      <section>
        <div className="container">
          <PageHeader text={t('Header.profileDropdown.requestCoursesLabel')} small />

          <CustomCard cardClass="[&_.card-body]:p-0" bodyClass="!p-0">
            <div className="lg:flex">
              <div className="requestCourse-card img-wrap min-w-96 px-5">
                <Image
                  src="/images/group-work.svg"
                  imgClassName="w-full h-full object-contain"
                  width={453}
                  height={524}
                />
              </div>
              <div className="lg:py-16 py-8 px-5">
                <div className="">
                  <p className="text-xs font-medium text-navText">
                    {t('CourseRequest.description')}
                  </p>

                  <Formik
                    enableReinitialize
                    validationSchema={AddRequestCourseSchema()}
                    initialValues={initialValues}
                    onSubmit={(values) => OnSubmit(values)}
                  >
                    {({ values, setFieldValue }) => {
                      return (
                        <Form className="flex flex-col gap-4 mt-7">
                          <ReactSelect
                            isCompulsory
                            parentClass="w-full"
                            label={t(
                              'CoursesManagement.Bundle.AddEditBundle.courseCategory'
                            )}
                            name="category_id"
                            options={categoryData ?? []}
                            placeholder={t(
                              'CoursesManagement.Bundle.AddEditBundle.Placeholders.courseCategory'
                            )}
                            isMulti
                            onChange={(val, type) => {
                              setFieldValue(
                                'category_id',
                                handleCategoryOrSubCategoryChange(
                                  val as Option | Option[],
                                  type,
                                  'category_id',
                                  setCategoryIds,
                                  values
                                )
                              );
                              setFieldValue(
                                'sub_category_id',
                                values.sub_category_id.filter(
                                  (item) =>
                                    !subCategoryData
                                      .map((val) => val.value)
                                      .includes(item)
                                )
                              );
                              setFieldValue(
                                'course_slugs',
                                values.course_slugs.filter(
                                  (item) =>
                                    !courseData
                                      .map((val) => val.value)
                                      .includes(item)
                                )
                              );
                              setCourseSlug(
                                values.course_slugs.filter(
                                  (item) =>
                                    !courseData
                                      .map((val) => val.value)
                                      .includes(item)
                                )
                              );
                            }}
                          />
                          <ReactSelect
                            parentClass="w-full"
                            label={t(
                              'CoursesManagement.Bundle.AddEditBundle.courseSubCategory'
                            )}
                            name="sub_category_id"
                            options={subCategoryData ?? []}
                            placeholder={t(
                              'CoursesManagement.Bundle.AddEditBundle.Placeholders.courseSubCategory'
                            )}
                            isMulti
                            onChange={(val, type) => {
                              setFieldValue(
                                'sub_category_id',
                                handleCategoryOrSubCategoryChange(
                                  val as Option | Option[],
                                  type,
                                  'sub_category_id',
                                  setSubCategoryIds,
                                  values
                                )
                              );
                              setFieldValue(
                                'course_slugs',
                                values.course_slugs.filter(
                                  (item) =>
                                    !courseData
                                      .map((val) => val.value)
                                      .includes(item)
                                )
                              );
                              setCourseSlug(
                                values.course_slugs.filter(
                                  (item) =>
                                    !courseData
                                      .map((val) => val.value)
                                      .includes(item)
                                )
                              );
                            }}
                          />
                          <ReactSelect
                            isCompulsory
                            options={courseData ?? []}
                            parentClass="flex-[1_0_0%]"
                            isMulti
                            onChange={(val, type) => {
                              setFieldValue(
                                'course_slugs',
                                handleCourseSlug(
                                  val as Option | Option[],
                                  type,
                                  'course_slugs',
                                  setCourseSlug,
                                  values
                                )
                              );
                            }}
                            name="course_slugs"
                            label={t(
                              'CoursesManagement.Bundle.AddEditBundle.courses'
                            )}
                            placeholder={t(
                              'CoursesManagement.Bundle.AddEditBundle.Placeholders.courses'
                            )}
                          />
                          <TextArea
                            isCompulsory
                            rows={6}
                            name="description"
                            label={t('CourseRequest.additionalNotes')}
                          />
                          <div className="">
                            <Button
                              className="w-fit"
                              variants="primary"
                              type="submit"
                              isLoading={isLoading}
                              disabled={isLoading}
                            >
                              {t('CourseRequest.sendRequest')}
                            </Button>
                          </div>
                        </Form>
                      );
                    }}
                  </Formik>
                </div>
              </div>
              <div className="lg:py-16 py-8">
                {previewCourse?.map((item) => (
                  <div className="px-5 mb-3 lg:min-w-[500px]">
                    <div
                      key={item?.id}
                      className="p-4 bg-primaryLight rounded-lg flex"
                    >
                      <div className="w-[210px] h-[150px]">
                        <Image
                          src={item?.image ?? '/images/no-image.png'}
                          width={210}
                          height={150}
                          imgClassName="w-full h-full object-cover rounded-lg"
                          serverPath
                        />
                      </div>
                      <div className="max-w-[calc(100%_-_210px)] ps-3.5">
                        <p className="text-base font-bold text-dark leading-[1.3]">
                          {item?.title}
                        </p>

                        <ul className="flex flex-col gap-y-1.5 mt-3.5">
                          <li className="text-xs font-medium text-dark">
                            <strong>
                              {t('CompanyManager.courses.categoryTitle')}:
                            </strong>
                            {item?.courseCategory?.name}
                          </li>
                          <li className="text-xs font-medium text-dark">
                            <strong>
                              {t('CoursesManagement.columnHeader.SubCategory')}:
                            </strong>
                            {item?.courseSubCategory?.name}
                          </li>
                          <li className="text-xs font-medium text-dark">
                            <strong>
                              {t('CoursesManagement.columnHeader.CourseCode')}:
                            </strong>
                            {item?.code}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CustomCard>
        </div>
      </section>
    </div>
  );
};

export default AddRequestCourses;
