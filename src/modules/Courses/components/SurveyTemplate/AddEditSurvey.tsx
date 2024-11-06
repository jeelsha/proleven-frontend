// **libraries**
import {
  FieldArray,
  FieldArrayRenderProps,
  Form,
  Formik,
  FormikValues,
} from 'formik';

// **components**
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import InputField from 'components/FormElement/InputField';
import RadioButtonGroup from 'components/FormElement/RadioInput';
import ReactSelect from 'components/FormElement/ReactSelect';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';

// **constants**
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { QuestionType, RequiredType, SurveyType } from 'modules/Courses/Constants';

// **hooks**
import { useAxiosGet, useAxiosPost, useAxiosPut } from 'hooks/useAxios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// **types**
import {
  SurveyInitialProps,
  SurveyQuestionProps,
} from 'modules/Courses/types/survey';

// **validation**
import { SurveyValidationSchema } from 'modules/Courses/validation/SurveyValidationSchema';
import { useNavigate, useParams } from 'react-router-dom';
import SurveyTypeSelection from './SurveyTypeSelection';
import TextArea from 'components/FormElement/TextArea';

const AddEditSurvey = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [templateCreateApi, { isLoading: isAddLoading }] = useAxiosPost();
  const [templateUpdateApi, { isLoading: isUpdateLoading }] = useAxiosPut();
  const [templateGetApi] = useAxiosGet();
  const [surveyData, setSurveyData] = useState<SurveyInitialProps>();
  const slugValue = params.slug;

  const initialValues: SurveyInitialProps = {
    title: surveyData?.title ?? '',
    note: surveyData?.note ?? '',
    question: surveyData?.surveyTemplateQuestion?.map(
      (question: SurveyQuestionProps) => {
        const {
          question: questionText,
          survey_target,
          question_type,
          range,
          label,
          surveyAnswer,
          slug,
          is_required,
        } = question;

        const parsedLabel =
          label !== null && typeof label === 'string' ? JSON.parse(label) : label;

        const formattedQuestion: SurveyQuestionProps = {
          question: questionText,
          survey_target,
          question_type,
          option: [],
          slug,
          is_required,
        };

        if (question_type === 'mcq' || question_type === 'multiselect') {
          formattedQuestion.option = surveyAnswer?.map((answer) => ({
            answer: answer.answer,
            slug: answer.slug,
          }));
        } else if (question_type === 'scale') {
          formattedQuestion.range = range ?? 10;
          formattedQuestion.label =
            label !== null
              ? parsedLabel?.map((item: { [key: string]: string }) => ({
                key: item.key,
                value: item.value,
              }))
              : [];
        }

        return formattedQuestion;
      }
    ) ?? [
        {
          question: '',
          survey_target: '',
          question_type: 'answer',
          is_required: false,
          option: [{ answer: '' }, { answer: '' }],
          rating: 0,
          answer: '',
          range: 10,
        },
      ],
  };

  const surveyGet = async () => {
    if (slugValue) {
      const response = await templateGetApi('/survey-template', {
        params: { slug: slugValue },
      });
      setSurveyData(response.data);
    }
  };

  useEffect(() => {
    if (slugValue) {
      surveyGet();
    }
  }, [slugValue]);

  const OnSubmit = async (surveyDetails: FormikValues) => {
    const questionData = surveyDetails.question.map(
      (question: SurveyQuestionProps) => {
        const baseObj = {
          question_type: question.question_type,
          question: question.question,
          survey_target: question.survey_target,
          is_required: question.is_required,
        };
        if (
          question.question_type === 'mcq' ||
          question.question_type === 'multiselect'
        ) {
          return {
            ...baseObj,
            option: question?.option?.filter((option) => option.answer !== ''),
          };
        }
        if (question.question_type === 'scale') {
          return {
            ...baseObj,
            range: question.range,
            label: question.label,
          };
        }
        if (
          question.question_type === 'answer' ||
          question.question_type === 'rate'
        ) {
          return {
            ...baseObj,
          };
        }
        return question;
      }
    );
    const editData = {
      surveyTemplateQuestion: surveyDetails.question.map(
        (question: SurveyQuestionProps) => {
          const baseObj = {
            slug: question.slug,
            question: question.question,
          };
          if (
            question.question_type === 'mcq' ||
            question.question_type === 'multiselect'
          ) {
            return {
              ...baseObj,
              surveyAnswer:
                question.option &&
                question.option.length > 0 &&
                question.option.map((option) => {
                  return {
                    answer: option.answer,
                    slug: option.slug,
                  };
                }),
            };
          }
          if (question.question_type === 'scale') {
            return {
              ...baseObj,
              label: question.label,
            };
          }
          if (
            question.question_type === 'answer' ||
            question.question_type === 'rate'
          ) {
            return {
              ...baseObj,
            };
          }
          return question;
        }
      ),
    };
    const updateData = {
      title: surveyDetails.title,
      note: surveyDetails.note,

      ...(slugValue && {
        templateSlug: slugValue,
      }),
      ...(slugValue
        ? { surveyTemplateQuestion: editData.surveyTemplateQuestion }
        : { question: questionData }),
    };
    if (surveyDetails) {
      const formData = new FormData();
      Object.entries(updateData).forEach(([key, value]) => {
        const stringValue =
          typeof value === 'object' ? JSON.stringify(value) : value;
        formData.append(key, stringValue);
      });
      const response = !slugValue
        ? await templateCreateApi(`/survey-template/create-survey`, formData)
        : await templateUpdateApi(`/survey-template/edit`, formData);
      if (response?.data) {
        navigate(PRIVATE_NAVIGATION.coursesManagement.surveyTemplate.list.path);
      }
    }
  };

  const handleAddQuestion = (arrayHelpers: FieldArrayRenderProps): void => {
    arrayHelpers.push({
      question: '',
      survey_target: '',
      is_required: false,
      question_type: 'answer',
      option: [{ answer: '' }, { answer: '' }],
      rating: 0,
      answer: '',
      range: 10,
      label: [
        { key: '1', value: t('CourseManagement.createSurvey.poorTitle') },
        { key: '8', value: t('CourseManagement.createSurvey.excellentTitle') },
      ],
    });
  };
  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={SurveyValidationSchema()}
      onSubmit={(values) => OnSubmit(values)}
    >
      {({ values }) => {
        return (
          <Form>
            <PageHeader
              small
              text={
                slugValue
                  ? t('CourseManagement.editSurvey.title')
                  : t('CourseManagement.createSurvey.title')
              }
              url={PRIVATE_NAVIGATION.coursesManagement.surveyTemplate.list.path}
            />
            <CustomCard minimal>
              <>
                <div className="flex flex-col gap-4 mb-5">
                  <InputField
                    placeholder={t('CourseManagement.createSurvey.namePlaceholder')}
                    type="text"
                    isCompulsory
                    value={values.title}
                    label={t('CourseManagement.createSurvey.nameTitle')}
                    name="title"
                  />
                  {/* <ReactEditor
                    parentClass="h-unset"
                    name="note"
                    setFieldValue={setFieldValue}
                    setFieldTouched={setFieldTouched}
                    label="Note"
                    value={values?.note ? values?.note?.trim() : ''}
                  /> */}
                  <TextArea
                    rows={2}
                    placeholder={t('Codes.descriptionPlaceHolder')}
                    label={t('surveyNote')}
                    name="note"
                    value={values?.note ? values?.note?.trim() : ''}
                  />

                </div>
                <div className="flex flex-col gap-y-7 md:gap-y-4 mt-10 md:mt-0">
                  <FieldArray
                    name="question"
                    render={(arrayHelpers) => (
                      <>
                        {values?.question?.map(
                          (questionData: SurveyQuestionProps, index: number) => {
                            return (
                              <div key={`survey_question_${index + 1}`}>
                                <div
                                  key={`survey_question_${index + 1}`}
                                  className="bg-[#FBFBFC] border border-solid border-borderColor p-3 pt-12 md:p-5 rounded-md md:rounded-xl relative"
                                >
                                  <div className="flex flex-wrap relative">
                                    <div className="absolute md:static -top-9 left-0 bg-primary md:bg-transparent text-white w-8 h-8 text-sm font-medium flex items-center justify-center rounded md:block md:w-12">
                                      <span className="text-base font-semibold md:text-dark">
                                        {index + 1}.
                                      </span>
                                    </div>
                                    <div className="md:max-w-[calc(100%_-_48px)] w-full flex">
                                      <div className="flex flex-col md:grid 991:grid-cols-3 md:grid-cols-2 gap-2 md:gap-7 md:max-w-[calc(100%_-_48px)] w-full">
                                        <InputField
                                          placeholder={t(
                                            'CourseManagement.createSurvey.questionPlaceholder'
                                          )}
                                          type="text"
                                          isCompulsory
                                          value={questionData.question}
                                          name={`question[${index}].question`}
                                          label={t(
                                            'CourseManagement.createSurvey.questionTitle'
                                          )}
                                        />
                                        <ReactSelect
                                          label={t(
                                            'CourseManagement.createSurvey.typeTitle'
                                          )}
                                          options={QuestionType({ t })}
                                          isCompulsory
                                          disabled={!!slugValue}
                                          name={`question[${index}].question_type`}
                                          className="bg-white rounded-xl"
                                        />
                                        <RadioButtonGroup
                                          optionWrapper="flex gap-4"
                                          name={`question[${index}].survey_target`}
                                          options={SurveyType({ t })}
                                          isCompulsory
                                          isDisabled={!!slugValue}
                                          label={t(
                                            'CourseManagement.createSurvey.relatedToTitle'
                                          )}
                                          parentClass="radio-group"
                                        />
                                        <RadioButtonGroup
                                          optionWrapper="flex gap-4"
                                          name={`question[${index}].is_required`}
                                          options={RequiredType({ t })}
                                          isDisabled={!!slugValue}
                                          label={t(
                                            'CourseManagement.createSurvey.isRequiredTitle'
                                          )}
                                          parentClass="radio-group"
                                        />
                                      </div>
                                      {!slugValue &&
                                        Array.isArray(values?.question) &&
                                        values.question.length > 1 ? (
                                        <Button
                                          variants="dangerBorder"
                                          //  !absolute left-3 top-[52px]
                                          className="w-10 h-10 !p-2 inline-block ml-auto !absolute md:!relative right-0 -top-9 md:top-0 [&:has(svg)]:!bg-white"
                                          onClickHandler={() => {
                                            arrayHelpers.remove(index);
                                          }}
                                          tooltipText={t('Tooltip.Delete')}
                                          tooltipPosition="right"
                                        >
                                          <Image
                                            iconName="deleteIcon"
                                            iconClassName="w-5 h-5"
                                          />
                                        </Button>
                                      ) : (
                                        ''
                                      )}
                                    </div>
                                  </div>
                                  <SurveyTypeSelection
                                    questionData={questionData}
                                    index={index}
                                    values={values}
                                    slugValue={slugValue}
                                  />
                                </div>
                                {!slugValue && (
                                  <div className="flex justify-start mt-3">
                                    {Array.isArray(values.question) &&
                                      index === values.question.length - 1 ? (
                                      <Button
                                        onClickHandler={() =>
                                          handleAddQuestion(arrayHelpers)
                                        }
                                        variants="primaryBordered"
                                      >
                                        <Button className="w-4 h-4 rounded-full border border-solid border-current me-1">
                                          <Image
                                            iconName="plusIcon"
                                            iconClassName="w-full h-full"
                                          />
                                        </Button>
                                        {t('addFooterTitle')}
                                      </Button>
                                    ) : (
                                      ''
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )}
                      </>
                    )}
                  />
                </div>
                <div className="flex justify-end mt-3 gap-4">
                  <Button
                    className="min-w-[90px]"
                    variants="whiteBordered"
                    onClickHandler={() => {
                      navigate(-1);
                    }}
                  >
                    {t('Button.cancelButton')}
                  </Button>
                  <Button
                    variants="primary"
                    type="submit"
                    className="min-w-[90px]"
                    isLoading={isAddLoading || isUpdateLoading}
                  >
                    {slugValue ? t('editFooterTitle') : t('addFooterTitle')}
                  </Button>
                </div>
              </>
            </CustomCard>
          </Form>
        );
      }}
    </Formik>
  );
};
export default AddEditSurvey;
