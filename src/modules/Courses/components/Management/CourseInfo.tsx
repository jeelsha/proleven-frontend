// ** Components **
import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import InputField from 'components/FormElement/InputField';
import RadioButtonGroup from 'components/FormElement/RadioInput';
import ReactSelect from 'components/FormElement/ReactSelect';
import TextArea from 'components/FormElement/TextArea';
import DatePicker from 'components/FormElement/datePicker';
import Image from 'components/Image';
import SuggestedTrainerList from 'modules/Courses/components/Management/SuggestedTrainerList';

// ** Constants **
import { CourseType } from 'modules/Courses/Constants';

// ** Dropdowns **
import CategoryDropdown from 'modules/Courses/components/DropDown/CategoryList';
import SubCategoryDropdown from 'modules/Courses/components/DropDown/SubCategoryList';

// ** Helpers **
import {
  getCourseTypeList,
  getValidityOptions,
  resetTimeToMidnight,
} from 'modules/Courses/helper/CourseCommon';
import { getEmptyResource } from 'modules/Courses/helper/ResourceHelper';

// ** Types **
import { Option } from 'components/FormElement/types';
import {
  CourseSubComponentProps,
  IAcademy,
  SuggestedTrainer,
} from 'modules/Courses/types';
import { SurveyOptions } from 'modules/Courses/types/TemplateBundle';

// ** Hooks **
import { useQueryGetFunction } from 'hooks/useQuery';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// ** Slices
import { useLanguage } from 'redux-toolkit/slices/languageSlice';

// ** Utils **
import { addDays, differenceInDays, parseISO } from 'date-fns';
import { getCurrencySymbol, shouldDisableField } from 'utils';

// ** formik **
import { FieldArray, FieldArrayRenderProps } from 'formik';
import { useAxiosGet } from 'hooks/useAxios';
import { Link } from 'react-router-dom';

const CourseInfo = ({
  values,
  formLanguage,
  setFieldValue,
  fieldsToTranslate,
  currentLanguage,
  defaultLanguage,
  isMainLoading,
  setIsMainLoading,
  isUpdate,
}: CourseSubComponentProps) => {
  const { t } = useTranslation();

  const {
    category_id,
    sub_category_id,
    type,
    start_date,
    end_date,
    academy_id,
    optional_trainers,
    max_attendee_applicable,
    course_notes,
  } = values?.course ?? {};

  const startDate = start_date ? parseISO(start_date) : undefined;
  const endDate = end_date ? parseISO(end_date) : undefined;

  const [getTrainers, { isLoading: trainersLoading }] = useAxiosGet();

  const [suggestedTrainers, setSuggestedTrainers] = useState<
    Array<SuggestedTrainer>
  >([]);

  const { allLanguages } = useSelector(useLanguage);
  const currentFormLanguage =
    allLanguages?.find((item) => item.short_name === formLanguage)?.name ?? '';

  // ** Category dropdown
  const { response: categories, isLoading: courseCategoryLoading } =
    useQueryGetFunction(
      '/course-category',
      {
        option: { dropdown: true, dropdownParent: true },
      },
      { 'accept-custom-language ': currentFormLanguage }
    );

  // ** Academy dropdown
  const { response: academies, isLoading: academyLoading } = useQueryGetFunction(
    '/academy',
    { option: { dropdownParent: true } },
    { 'accept-custom-language ': currentFormLanguage }
  );
  const academyList: Option[] = [
    { label: t('CoursesManagement.createCourse.otherLocation'), value: 0 },
  ];
  const academyAddresses: { [key: string]: string | number }[] = [];
  if (Array.isArray(academies?.data?.data) && academies?.data?.data.length > 0) {
    academies?.data?.data.forEach((academy: IAcademy) => {
      academyAddresses.push({
        academy_id: academy.id,
        academy_address: academy.location,
      });
      academyList.push({ label: academy.name, value: academy.id });
    });
  }

  // ** Projects Dropdown
  const { response: projects, isLoading: projectLoading } = useQueryGetFunction(
    '/projects',
    {
      option: { dropdown: true, dropdownParent: true, label: 'title' },
    },
    { 'accept-custom-language ': currentFormLanguage }
  );

  // ** Surveys Dropdown
  const { response: surveyList } = useQueryGetFunction(
    '/survey-template',
    {
      option: {
        dropdown: true,
        label: 'title',
        ...(isUpdate ? {} : { sub_category_id }),
      },
    },
    { 'accept-custom-language ': currentFormLanguage }
  );

  const getSuggestedTrainers = async () => {
    const { data } = await getTrainers('/trainer/trainer-by-category', {
      params: {
        categorySlug: category_id,
        ...(sub_category_id ? { courseSubCategory: sub_category_id } : {}),
        view: true,
      },
    });
    if (Array.isArray(data?.data)) {
      setSuggestedTrainers(data?.data);
    }
  };

  // ** useEffects
  useEffect(() => {
    setIsMainLoading?.(courseCategoryLoading || academyLoading || projectLoading);
  }, [courseCategoryLoading, academyLoading, projectLoading]);

  useEffect(() => {
    if (!isUpdate) {
      const matchedSurvey = (surveyList?.data ?? []).find(
        (obj: SurveyOptions) => obj.isMatch
      );
      if (matchedSurvey)
        setFieldValue?.('course.survey_template_id', matchedSurvey.value);
    }
  }, [surveyList]);

  useEffect(() => {
    if (!optional_trainers?.length) {
      setFieldValue?.('course.optional_resources', getEmptyResource());
      setFieldValue?.('course.optional_rooms', []);
    }
  }, [optional_trainers]);

  useEffect(() => {
    if (category_id) {
      getSuggestedTrainers();
    }
  }, [category_id, sub_category_id]);

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
      const newLessons = (values?.lesson ?? []).map((l) => ({
        ...l,
        location: foundAddress?.academy_address,
      }));
      setFieldValue(`lesson`, newLessons);
    }
  };

  const isDisabled = (val: string) =>
    shouldDisableField(val, fieldsToTranslate, currentLanguage, defaultLanguage);
  return (
    <div className="flex flex-wrap gap-7">
      <div className="w-full flex flex-wrap">
        <RadioButtonGroup
          optionWrapper="flex gap-3"
          name="course.type"
          options={getCourseTypeList()}
          isCompulsory
          label={t('CoursesManagement.CreateCourse.courseType')}
          parentClass="radio-group col-span-2"
          selectedValue={type}
          readOnly={isUpdate || isDisabled('type')}
          isDisabled={isUpdate || isDisabled('type')}
          isLoading={isMainLoading}
          onChange={(event) => {
            setFieldValue?.('course.type', event.target.value);
            if (event.target.value === CourseType.Private)
              setFieldValue?.('course.price', null);
          }}
        />
      </div>

      <div className="flex flex-wrap gap-y-7 gap-x-4 w-full">
        <InputField
          placeholder={t('CoursesManagement.CreateCourse.namePlaceHolder')}
          type="text"
          isCompulsory
          label={t('CoursesManagement.CreateCourse.courseName')}
          name="course.title"
          isDisabled={type === CourseType.Private || isDisabled('title')}
          isLoading={isMainLoading}
          parentClass="max-w-[calc(50%_-_8px)] w-full"
        />

        <InputField
          parentClass="max-w-[calc(50%_-_8px)] w-full"
          placeholder="XXXXXXXX"
          type="text"
          isCompulsory
          label={t('CoursesManagement.CreateCourse.courseCode')}
          name="course.code"
          isDisabled
          isLoading={isMainLoading}
        />

        <div className="grid grid-cols-3 gap-y-7 gap-x-4 w-full">
          <CategoryDropdown
            parentClass=""
            label={t('CoursesManagement.CreateCourse.category')}
            name="course.category_id"
            placeholder={t('CoursesManagement.CreateCourse.selectCategory')}
            categories={categories?.data}
            selectedCategory={category_id ?? ''}
            disabled={type === CourseType.Private || isDisabled('category_id')}
            isLoading={isMainLoading}
            onChange={(val) => {
              if (setFieldValue) {
                setFieldValue('course.category_id', (val as Option).value);
                setFieldValue('course.sub_category_id', null);
              }
            }}
          />

          <SubCategoryDropdown
            parentClass=""
            label={t('CoursesManagement.CreateCourse.subCategory')}
            name="course.sub_category_id"
            placeholder={t('CoursesManagement.CreateCourse.selectSubCategory')}
            selectedSubCategory={sub_category_id ?? ''}
            selectedCategory={category_id ?? ''}
            disabled={type === CourseType.Private || isDisabled('sub_category_id')}
            isLoading={isMainLoading}
            formLanguage={formLanguage}
            currentFormLanguage={currentFormLanguage}
          />

          <ReactSelect
            parentClass=""
            placeholder={t('CoursesManagement.CreateCourse.surveyPlaceHolder')}
            options={Array.isArray(surveyList?.data) ? surveyList?.data : []}
            isCompulsory
            label={t('CoursesManagement.CreateCourse.survey')}
            name="course.survey_template_id"
            disabled={isDisabled('survey_template_id')}
            isLoading={isMainLoading}
          />
        </div>

        <div className="grid grid-cols-3 gap-y-7 gap-x-4 w-full">
          {type === CourseType.Academy ? (
            <InputField
              parentClass=""
              prefix={getCurrencySymbol('EUR')}
              placeholder="0000000"
              type="number"
              isCompulsory
              label={t('CoursesManagement.CreateCourse.price')}
              name="course.price"
              isDisabled={isDisabled('price')}
              isLoading={isMainLoading}
            />
          ) : (
            ''
          )}

          <ReactSelect
            parentClass=""
            isCompulsory
            name="course.validity"
            options={getValidityOptions()}
            label={t('CoursesManagement.CreateCourse.validity')}
            placeholder={t('CoursesManagement.CreateCourse.validityPlaceHolder')}
            disabled={isDisabled('validity')}
            isLoading={isMainLoading}
          />

          <ReactSelect
            parentClass="flex-[1_0_0%]"
            isMulti={false}
            name="course.academy_id"
            options={academyList}
            label={t('CoursesManagement.CreateCourse.academy')}
            placeholder={t('CoursesManagement.CreateCourse.selectAcademy')}
            selectedValue={academy_id ?? undefined}
            onChange={(value) => handleAcademyChange((value as Option)?.value)}
            disabled={isDisabled('academy_id')}
            isLoading={isMainLoading}
          />
          {type === CourseType.Private ? (
            <ReactSelect
              parentClass="w-full"
              isCompulsory
              name="course.project_id"
              options={projects?.data ?? []}
              label={t('CoursesManagement.CreateCourse.project')}
              placeholder={t('CoursesManagement.CreateCourse.projectPlaceHolder')}
              disabled={isUpdate || isDisabled('project')}
              isLoading={isMainLoading}
            />
          ) : (
            ''
          )}
        </div>
        <div className="grid grid-cols-2 gap-y-7 gap-x-4 w-full">
          <DatePicker
            parentClass=""
            name="course.start_date"
            placeholder={t('CoursesManagement.CreateCourse.startDatePlaceHolder')}
            label={t('CoursesManagement.CreateCourse.startDate')}
            isCompulsory
            icon
            selectedDate={startDate}
            onChange={(date) => {
              if (!setFieldValue) return;
              const courseStartDate = date
                ? resetTimeToMidnight(date).toISOString()
                : null;
              setFieldValue('course.start_date', courseStartDate);

              if (startDate && endDate && date > endDate) {
                const daysToAdd = Math.max(differenceInDays(endDate, startDate), 1);
                const newDate = addDays(date, daysToAdd);
                setFieldValue(
                  'course.end_date',
                  resetTimeToMidnight(newDate).toISOString()
                );
              }
            }}
            isLoading={isMainLoading}
            minDate={new Date()}
            disabled={isDisabled('date')}
          />

          <DatePicker
            name="course.end_date"
            placeholder={t('CoursesManagement.CreateCourse.startDatePlaceHolder')}
            label={t('CoursesManagement.CreateCourse.endDate')}
            isCompulsory
            icon
            selectedDate={endDate}
            onChange={(date) => {
              if (setFieldValue)
                setFieldValue(
                  'course.end_date',
                  date ? resetTimeToMidnight(date).toISOString() : null
                );
            }}
            isLoading={isMainLoading}
            minDate={startDate}
            disabled={isDisabled('date')}
          />
        </div>
      </div>

      <div className="w-full flex flex-wrap">
        <div className="grid gap-y-7 gap-x-4 w-full">
          <Checkbox
            name="course.max_attendee_applicable"
            id="courseMaxAttendeeApplicable"
            check={max_attendee_applicable}
            labelClass="!w-auto cursor-pointer"
            text={t('CoursesManagement.CreateCourse.maxAttendee')}
            onChange={() => {
              setFieldValue?.(
                'course.max_attendee_applicable',
                !max_attendee_applicable
              );
              setFieldValue?.('course.maximum_participate_allowed', null);
            }}
            isLoading={isMainLoading}
            disabled={isDisabled('max_attendee_applicable')}
          />
          {max_attendee_applicable ? (
            <InputField
              placeholder={t(
                'CoursesManagement.CreateCourse.maxParticipantsPlaceHolder'
              )}
              type="number"
              isCompulsory
              label={t('CoursesManagement.CreateCourse.maxParticipants')}
              name="course.maximum_participate_allowed"
              isDisabled={isDisabled('maximum_participate_allowed')}
              isLoading={isMainLoading}
              min={0}
            />
          ) : (
            ''
          )}
        </div>
      </div>

      <div className="grid gap-y-7 gap-x-4">
        <Link
          target="_blank"
          to={start_date ? `/calendar?date=${start_date}` : '/calendar'}
        >
          <Button className="text-white bg-primary py-2 px-4 rounded-md flex items-center gap-2">
            <Image
              iconName="calendarIcon2"
              iconClassName="w-5 h-5"
              width={24}
              height={24}
            />
            {t('CoursesManagement.CreateCourse.viewCalendar')}
          </Button>
        </Link>
      </div>

      {suggestedTrainers?.length ? (
        <SuggestedTrainerList data={suggestedTrainers} isLoading={trainersLoading} />
      ) : (
        ''
      )}

      <div className="flex flex-col gap-y-7 w-full">
        <FieldArray
          name="course.course_notes"
          render={(arrayHelpers) => (
            <>
              {course_notes?.map((note, index) => {
                return (
                  <div
                    key={`Notes_${index + 1}`}
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
                    {index === course_notes.length - 1 ? (
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

                    {course_notes.length > 1 && index !== course_notes.length - 1 ? (
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

export default CourseInfo;
