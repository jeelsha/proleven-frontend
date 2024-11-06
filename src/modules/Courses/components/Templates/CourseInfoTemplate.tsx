// ** Components **
import Button from 'components/Button/Button';
import InputField from 'components/FormElement/InputField';
import ReactSelect from 'components/FormElement/ReactSelect';
import TextArea from 'components/FormElement/TextArea';
import Image from 'components/Image';

// ** Formik **
import { FieldArray, FieldArrayRenderProps } from 'formik';

// ** Hooks **
import { useQueryGetFunction } from 'hooks/useQuery';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// ** Modules **
import CategoryDropdown from 'modules/Courses/components/DropDown/CategoryList';
import SubCategoryDropdown from 'modules/Courses/components/DropDown/SubCategoryList';
import {
  SurveyOptions,
  TemplateSubComponentProps,
} from 'modules/Courses/types/TemplateBundle';

// ** Slices **
import { useLanguage } from 'redux-toolkit/slices/languageSlice';

// ** types
import { Option } from 'components/FormElement/types';
import { IAcademy } from 'modules/Courses/types';

// ** Utils **
import { getValidityOptions } from 'modules/Courses/helper/CourseCommon';
import { getCurrencySymbol, shouldDisableField } from 'utils';

const CourseInfoTemplate = ({
  values,
  formLanguage,
  isMainLoading,
  setIsMainLoading,
  setFieldValue,
  fieldsToTranslate,
  currentLanguage,
  defaultLanguage,
  isUpdate,
}: TemplateSubComponentProps) => {
  const { t } = useTranslation();
  const { allLanguages } = useSelector(useLanguage);
  const currentFormLanguage =
    allLanguages?.find((item) => item.short_name === formLanguage)?.name ?? '';

  const {
    response: categories,
    isLoading: courseCategoryLoading,
    refetch: refetchCategories,
  } = useQueryGetFunction(
    '/course-category',
    {
      option: { dropdown: true, dropdownParent: true },
    },
    { 'accept-custom-language ': currentFormLanguage ?? '' }
  );
  const { response: codes } = useQueryGetFunction('/codes', {
    option: {
      dropdown: true,
      label: 'code',
      value: 'id',
      course_code: true,
      ...(isUpdate ? {} : { unassignedCourses: true }),
    },
  });

  // ** Surveys
  const {
    response: surveyList,
    isLoading: surveyLoading,
    refetch: refetchSurveys,
  } = useQueryGetFunction(
    '/survey-template',
    {
      option: {
        dropdown: true,
        dropdownParent: true,
        label: 'title',
        ...(isUpdate ? {} : { sub_category_id: values.course?.sub_category_id }),
      },
    },
    { 'accept-custom-language ': currentFormLanguage ?? '' }
  );

  // ** Academy dropdown
  const { response: academyData, isLoading: academyDataLoading } =
    useQueryGetFunction(
      '/academy',
      { option: { dropdownParent: true } },
      { 'accept-custom-language ': currentFormLanguage }
    );
  const academyList: Option[] = [
    { label: t('CoursesManagement.createCourse.otherLocation'), value: 0 },
  ];
  const academyAddresses: { [key: string]: string | number }[] = [];
  if (Array.isArray(academyData?.data?.data) && academyData?.data?.data.length > 0) {
    academyData?.data?.data.forEach((academy: IAcademy) => {
      academyAddresses.push({
        academy_id: academy.id,
        academy_address: academy.location ?? '',
      });
      academyList.push({ label: academy.name, value: academy.id });
    });
  }

  const handleAddNote = (arrayHelpers: FieldArrayRenderProps) => {
    arrayHelpers.push({
      content: '',
    });
  };

  const handleAcademyChange = (val: string | number) => {
    if (setFieldValue) {
      const foundAddress = academyAddresses.find(
        (address) => address.academy_id === val
      );
      setFieldValue(`course.academy_id`, val);
      values.lesson.map((_, ind) =>
        setFieldValue(`lesson[${ind}].location`, foundAddress?.academy_address)
      );
    }
  };

  const isDisabled = (val: string) =>
    shouldDisableField(val, fieldsToTranslate, currentLanguage, defaultLanguage);

  // ** useEffects
  useEffect(() => {
    setIsMainLoading?.(courseCategoryLoading || surveyLoading || academyDataLoading);
  }, [courseCategoryLoading, surveyLoading, academyDataLoading]);

  useEffect(() => {
    refetchCategories();
    refetchSurveys();
  }, [formLanguage]);

  useEffect(() => {
    if (!isUpdate) {
      const matchedSurvey = (surveyList?.data ?? []).find(
        (obj: SurveyOptions) => obj.isMatch
      );
      if (matchedSurvey)
        setFieldValue?.('course.survey_template_id', matchedSurvey.value);
    }
  }, [surveyList]);

  return (
    <div className="flex flex-wrap gap-7">
      <InputField
        placeholder={t('CoursesManagement.CreateCourse.namePlaceHolder')}
        type="text"
        isCompulsory
        label={t('CoursesManagement.CreateCourse.courseName')}
        name="course.title"
        isDisabled={isDisabled('title')}
        isLoading={isMainLoading}
      />

      <div className="grid grid-cols-2 gap-y-7 gap-x-4 w-full">
        <CategoryDropdown
          parentClass="w-full"
          label={t('CoursesManagement.CreateCourse.category')}
          name="course.category_id"
          placeholder={t('CoursesManagement.CreateCourse.selectCategory')}
          categories={categories?.data}
          selectedCategory={values.course.category_id ?? ''}
          disabled={isDisabled('category_id')}
          isLoading={isMainLoading}
          onChange={(val) => {
            if (setFieldValue) {
              setFieldValue('course.category_id', (val as Option).value);
              setFieldValue('course.sub_category_id', null);
            }
          }}
        />

        <SubCategoryDropdown
          parentClass="w-full"
          label={t('CoursesManagement.CreateCourse.subCategory')}
          name="course.sub_category_id"
          placeholder={t('CoursesManagement.CreateCourse.selectSubCategory')}
          selectedSubCategory={values.course.sub_category_id ?? ''}
          selectedCategory={values.course.category_id ?? ''}
          isLoading={isMainLoading}
          formLanguage={formLanguage}
          currentFormLanguage={currentFormLanguage}
          disabled={isDisabled('sub_category_id')}
        />
      </div>

      <div className="grid grid-cols-2 gap-y-7 gap-x-4 w-full">
        <ReactSelect
          placeholder={t('CoursesManagement.CreateCourse.surveyPlaceHolder')}
          options={
            surveyList && Array.isArray(surveyList?.data) ? surveyList.data : []
          }
          isCompulsory
          label={t('CoursesManagement.CreateCourse.survey')}
          name="course.survey_template_id"
          disabled={isDisabled('survey_template_id')}
          isLoading={isMainLoading}
        />
        <ReactSelect
          parentClass="w-full"
          isMulti={false}
          name="course.academy_id"
          options={academyList}
          label={t('CoursesManagement.CreateCourse.academy')}
          placeholder={t('CoursesManagement.CreateCourse.selectAcademy')}
          selectedValue={values.course.academy_id ?? undefined}
          onChange={(value) => handleAcademyChange((value as Option)?.value)}
          disabled={isDisabled('academy_id')}
          isLoading={isMainLoading}
          isClearable
        />
      </div>

      <div className="grid grid-cols-2 gap-y-7 gap-x-4 w-full">
        <ReactSelect
          placeholder="XXXXXXXX"
          options={codes?.data}
          isCompulsory
          label={t('CoursesManagement.CreateCourse.courseCode')}
          name="course.code_id"
          onChange={(val) => {
            if (setFieldValue) {
              setFieldValue('course.code', (val as Option).label);
              setFieldValue('course.code_id', (val as Option).value);
            }
          }}
          disabled={isUpdate || isDisabled('code')}
          isLoading={isMainLoading}
        />

        <InputField
          prefix={getCurrencySymbol('EUR')}
          placeholder="0000000"
          type="number"
          label={t('CoursesManagement.CreateCourse.price')}
          name="course.price"
          isDisabled={isDisabled('price')}
          isLoading={isMainLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-y-7 gap-x-4 w-full">
        <InputField
          placeholder="XXX"
          type="number"
          isCompulsory
          label={t('CoursesManagement.CreateCourse.duration')}
          name="course.duration"
          isDisabled={isDisabled('duration')}
          isLoading={isMainLoading}
        />

        <ReactSelect
          isCompulsory
          name="course.validity"
          options={getValidityOptions()}
          label={t('CoursesManagement.CreateCourse.validity')}
          placeholder={t('CoursesManagement.CreateCourse.validityPlaceHolder')}
          disabled={isDisabled('validity')}
          isLoading={isMainLoading}
        />
      </div>

      <div className="flex flex-col gap-y-7 w-full">
        <FieldArray
          name="course.course_notes"
          render={(arrayHelpers) => (
            <>
              {values.course.course_notes?.map((note, index) => {
                return (
                  <div
                    key={`NOTE_${index + 1}`}
                    className="flex items-center w-full"
                  >
                    <TextArea
                      parentClass="max-w-[calc(100%_-_50px)] pe-8"
                      name={`course.course_notes[${index}].content`}
                      label={
                        index === 0 ? t('CoursesManagement.CreateCourse.notes') : ''
                      }
                      placeholder={t(
                        'CoursesManagement.CreateCourse.notesPlaceHolder'
                      )}
                      rows={3}
                      value={note.content}
                      disabled={isDisabled('content')}
                      isLoading={isMainLoading}
                    />
                    {index === values.course.course_notes.length - 1 ? (
                      <Button
                        disabled={isDisabled('') || isMainLoading}
                        onClickHandler={() => handleAddNote(arrayHelpers)}
                        className="cursor-pointer w-10 h-10 bg-primary rounded-lg text-white flex justify-center items-center"
                      >
                        <Image iconName="plusIcon" />
                      </Button>
                    ) : (
                      ''
                    )}

                    {values.course.course_notes.length > 1 &&
                    index !== values.course.course_notes.length - 1 ? (
                      <Button
                        disabled={isDisabled('') || isMainLoading}
                        className="button dangerBorder  w-10 h-10 !p-2 inline-block"
                        onClickHandler={() => arrayHelpers.remove(index)}
                      >
                        <Image iconName="deleteIcon" iconClassName="w-6 h-6" />
                      </Button>
                    ) : (
                      ''
                    )}
                  </div>
                );
              })}
            </>
          )}
        />
      </div>
    </div>
  );
};

export default CourseInfoTemplate;
