// ** imports **
import { Form, Formik, FormikValues } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

// ** hooks **
import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';

// ** components **

import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import PageHeader from 'components/PageHeader/PageHeader';
import { SelectQuestionType } from './SelectQuestionType';

// ** redux **
import { getExamToken } from 'redux-toolkit/slices/tokenSlice';

// ** types **
import { SurveyInitialProps, SurveyQuestionProps } from 'modules/Exam/types';

const SurveyDetails = () => {
  const { t } = useTranslation();
  const { surveySlug, participateId } = useParams();
  const [surveyGetApi] = useAxiosGet();
  const [surveySubmit, { isLoading }] = useAxiosPost();
  const [errors, setErrors] = useState<string[]>([]);
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyInitialProps>();
  const navigate = useNavigate();
  const examToken = useSelector(getExamToken);

  const GetSurveyTemplate = async () => {
    const response = await surveyGetApi('/survey-template', {
      params: { slug: surveySlug },
      headers: { 'exam-authorization': examToken },
    });
    setSurveyQuestions(response?.data);
  };

  useEffect(() => {
    GetSurveyTemplate();
  }, []);
  const validateQuestion = (
    questionData: SurveyQuestionProps,
    index: number,
    values: FormikValues
  ) => {
    const errors = [];
    if (
      questionData.question_type === 'mcq' &&
      questionData.is_required &&
      !values?.surveyTemplateQuestion[index]?.mcq?.slug
    ) {
      errors[index] = t('Exam.mcqRequired');
    }
    if (
      questionData.question_type === 'multiselect' &&
      questionData.is_required &&
      !values?.surveyTemplateQuestion[index]?.multiselect
    ) {
      errors[index] = t('Exam.multiselectRequired');
    }
    if (
      questionData.question_type === 'rate' &&
      questionData.is_required &&
      !values?.surveyTemplateQuestion[index]?.rate
    ) {
      errors[index] = t('Exam.ratingRequired');
    }
    if (
      questionData.question_type === 'answer' &&
      questionData.is_required &&
      !values?.surveyTemplateQuestion[index]?.answer
    ) {
      errors[index] = t('Exam.descriptiveRequired');
    }
    if (
      questionData.question_type === 'scale' &&
      questionData.is_required &&
      !values?.surveyTemplateQuestion[index]?.scale
    ) {
      errors[index] = t('Exam.scaleRequired');
    }
    return errors;
  };

  const initialValues = {
    survey_template_slug: '',
    exam_participate_slug: '',
    surveyTemplateQuestion: {},
  };
  const OnSubmit = async (surveyData: FormikValues) => {
    const newErrors = [] as string[];
    surveyQuestions?.surveyTemplateQuestion?.forEach(
      (questionData: SurveyQuestionProps, index: number) => {
        const questionErrors = validateQuestion(questionData, index, surveyData);
        if (Object.keys(questionErrors).length > 0) {
          newErrors[index] = questionErrors[index];
        }
      }
    );
    setErrors(newErrors);
    const questionData = surveyQuestions?.surveyTemplateQuestion?.map(
      (question: SurveyQuestionProps, index: number) => {
        const baseObj = {
          question_type: question.question_type,
          survey_target: question.survey_target,
          id: question.id,
          slug: question.slug,
          question: question.question,
        };
        if (question.question_type === 'mcq') {
          const mcqSlug = surveyData?.surveyTemplateQuestion[index]?.mcq?.slug;
          return {
            ...baseObj,
            surveyAnswer: question?.surveyAnswer?.map((option) => ({
              id: option.id,
              slug: option.slug,
              answer: option.answer,
              selected: option.slug === mcqSlug,
            })),
          };
        }
        if (question.question_type === 'multiselect') {
          const surveyAnswer = question?.surveyAnswer?.map((obj) => {
            if (obj?.slug) {
              const matchingAnswer = surveyData?.surveyTemplateQuestion[
                index
              ]?.multiselect?.find(
                (answer: { slug: string }) => answer && answer.slug === obj.slug
              );
              return {
                id: obj.id,
                slug: obj.slug,
                answer: obj.answer,
                selected: matchingAnswer !== undefined,
              };
            }
            return obj;
          });
          return {
            ...baseObj,
            surveyAnswer,
          };
        }
        if (question.question_type === 'scale') {
          return {
            ...baseObj,
            rate: surveyData?.surveyTemplateQuestion[index]?.scale,
          };
        }
        if (question.question_type === 'answer') {
          return {
            ...baseObj,
            answer: surveyData?.surveyTemplateQuestion[index]?.answer,
          };
        }
        if (question.question_type === 'rate') {
          return {
            ...baseObj,
            rate: surveyData?.surveyTemplateQuestion[index]?.rate,
          };
        }
        return baseObj;
      }
    );
    const updateData = {
      survey_template_slug: surveySlug,
      exam_participate_slug: participateId,
      surveyTemplateQuestion: questionData,
    };

    const formData = new FormData();
    if (Object.keys(newErrors).length === 0) {
      Object.entries(updateData).forEach(([key, value]) => {
        let valueToAppend: string | Blob | undefined;
        if (typeof value === 'object' && value !== null) {
          valueToAppend = JSON.stringify(value);
        } else {
          valueToAppend = value as string | Blob | undefined;
        }

        if (valueToAppend !== undefined) {
          formData.append(key, valueToAppend);
        }
      });
      const response = await surveySubmit(`/survey-template/submit`, formData, {
        headers: { 'exam-authorization': examToken },
      });
      if (response.data) {
        navigate('/exam/complete');
      }
    }
  };
  return (
    <section className="mt-5 h-[calc(100dvh_-_145px)] overflow-auto pb-4">
      <div className="container h-full">
        <Formik enableReinitialize initialValues={initialValues} onSubmit={OnSubmit}>
          {({ values, setFieldValue }) => (
            <Form className="h-full">
              <PageHeader
                small
                text={t('CourseManagement.createSurvey.surveyDetails')}
                url=""
              />
              <CustomCard minimal cardClass="p-4 pb-1 min-h-full">
                <>
                  <div className="flex flex-col gap-4 mb-5">
                    {surveyQuestions?.note && (
                      <>
                        <div
                          className=" px-4  text-[14px] w-[calc(100%_-_10px)]"
                          // eslint-disable-next-line react/no-danger
                          dangerouslySetInnerHTML={{
                            __html: surveyQuestions?.note,
                          }}
                        />
                      </>
                    )}
                    {surveyQuestions?.surveyTemplateQuestion?.map(
                      (question, index) => (
                        <div
                          key={`survey_question_${index + 1}`}
                          className="bg-[#FBFBFC] border border-solid border-borderColor p-5 rounded-[6px]"
                        >
                          <SelectQuestionType
                            key={`question_${index + 1}`}
                            questionData={question}
                            index={index}
                            t={t}
                            values={values}
                            setFieldValue={setFieldValue}
                            errors={errors}
                          />
                        </div>
                      )
                    )}
                  </div>
                  <div className="flex justify-end gap-4 mt-7">
                    <Button
                      variants="primary"
                      type="submit"
                      className="addButton"
                      isLoading={isLoading}
                      disabled={isLoading}
                    >
                      {t('Button.submit')}
                    </Button>
                  </div>
                </>
              </CustomCard>
            </Form>
          )}
        </Formik>
      </div>
    </section>
  );
};
export default SurveyDetails;
