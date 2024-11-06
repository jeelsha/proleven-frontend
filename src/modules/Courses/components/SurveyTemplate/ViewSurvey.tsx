import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import StatusLabel from 'components/StatusLabel';
import { useAxiosGet } from 'hooks/useAxios';
import { TFunction } from 'i18next';
import { getColorClass } from 'modules/Courses/Constants';
import { SurveyQuestionProps } from 'modules/Exam/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Rating } from 'react-simple-star-rating';

const QuestionLabel = (
  index: number,
  question: string,
  label: string,
  survey_target: string
) => {
  return (
    <div className="flex justify-between mb-5 flex-col 512:flex-row">
      <span className="inline-block text-dark font-semibold text-base order-2 512:order-1">
        {index + 1}. {question}
      </span>
      <div className="flex gap-x-3 items-center order-1 512:order-2 border-b border-solid border-gray-200 512:border-none pb-3 mb-3 512:mb-0 512:pb-0">
        <h4 className="text-dark font-semibold text-sm">{label}</h4>
        <StatusLabel text={survey_target} variants="primary" />
      </div>
    </div>
  );
};
const SelectQuestionType = ({
  questionData,
  index,
  t,
}: {
  questionData: SurveyQuestionProps;
  index: number;
  t: TFunction<'translation', undefined>;
}) => {
  const { question_type, surveyAnswer, question, survey_target, label } =
    questionData;
  switch (question_type) {
    case 'mcq':
    case 'multiselect':
      return (
        <div>
          {question_type === 'mcq'
            ? QuestionLabel(
              index,
              question,
              t('CourseManagement.createSurvey.mcqOption'),
              survey_target
            )
            : QuestionLabel(
              index,
              question,
              t('CourseManagement.createSurvey.multiSelectOption'),
              survey_target
            )}
          <div className="md:bg-white md:rounded-xl md:p-5 md:border border-solid border-gray-200">
            <h4 className="text-dark font-semibold text-base mb-2.5">
              {question_type === 'mcq'
                ? t('CourseManagement.createSurvey.mcqOption')
                : t('CourseManagement.createSurvey.multiSelectOption')}
            </h4>
            <div className="flex gap-3 flex-col md:flex-row">
              {surveyAnswer?.map((answer, index: number) => (
                <Button key={`answer_${index + 1}`} className='!justify-start md:!justify-center' variants="grayLight">
                  {answer.answer}
                </Button>
              ))}
            </div>
          </div>
        </div>
      );
    case 'rate':
      return (
        <>
          {QuestionLabel(
            index,
            question,
            t('CourseManagement.createSurvey.ratingOption'),
            survey_target
          )}
          <div className="md:bg-white md:rounded-xl md:p-5 md:border border-solid border-gray-200">
            <h4 className="text-dark font-semibold text-base mb-2.5">
              {t('CourseManagement.createSurvey.ratingOption')}
            </h4>
            <div className="border border-solid border-borderColor py-2 px-2.5 rounded-lg inline-block [&_[data-forhalf]]:!text-4xl">
              <Rating
                size={30}
                transition
                readonly
                SVGstyle={{ display: 'inline' }}
              />
            </div>
          </div>
        </>
      );
    case 'answer':
      return (
        <>
          {QuestionLabel(
            index,
            question,
            t('CourseManagement.createSurvey.answerOption'),
            survey_target
          )}
          <div className="md:bg-white md:rounded-xl md:p-5 md:border border-solid border-gray-200">
            <h4 className="text-dark font-semibold text-base mb-2.5">
              {t('CourseManagement.createSurvey.answerOption')}
            </h4>
            <div className="p-3 border border-solid border-borderColor rounded-lg text-sm">
              Example Answer
            </div>
          </div>
        </>
      );
    case 'scale':
      return (
        <>
          {QuestionLabel(
            index,
            question,
            t('CourseManagement.createSurvey.scaleTitle'),
            survey_target
          )}
          <div className="md:bg-white md:rounded-xl md:p-5 md:border border-solid border-gray-200">
            <h4 className="text-dark font-semibold text-base mb-2.5">
              {t('CourseManagement.createSurvey.scaleTitle')}
            </h4>
            <div className="w-fit">
              <div className="flex justify-between">
                {(typeof label === 'string' ? JSON.parse(label) : label)?.map(
                  (item: { key: string; value: string }, label_index: number) => {
                    return (
                      <div
                        className="block text-sm font-medium"
                        key={`label_${label_index + 1}`}
                      >
                        {item.value}
                      </div>
                    );
                  }
                )}
              </div>
              <div className="flex gap-3 mt-2.5 flex-wrap 512:flex-nowrap">
                {[...Array(10)].map((_, label_index) => {
                  const colorClass = getColorClass(questionData.range, label_index);
                  return (
                    <div key={`label_${label_index + 1}`}>
                      <div
                        className={`${colorClass} w-9 h-7 text-sm font-medium text-white rounded items-center flex justify-center`}
                      >
                        {label_index + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      );
    default:
      return null;
  }
};

const ViewSurvey = () => {
  const { t } = useTranslation();
  const params = useParams();
  const [templateGetApi] = useAxiosGet();
  const [surveyData, setSurveyData] = useState<SurveyQuestionProps[]>();
  const surveyGet = async () => {
    const response = await templateGetApi('/survey-template', {
      params: { slug: params?.slug },
    });
    setSurveyData(response.data.surveyTemplateQuestion);
  };

  useEffect(() => {
    surveyGet();
  }, []);
  return (
    <section>
      <div className="container !px-0 512:!px-15px">
        <CustomCard minimal bodyClass='!px-0 512:!px-4 991:!px-6 ' cardClass='shadow-none [&_.card-body]:py-0 md:[&_.card-body]:pt-5 md:[&_.card-body]:pb-6'>
          <div className="flex flex-col gap-4 mb-5">
            {surveyData?.map((question, index: number) => (
              <div
                key={`survey_question_${index + 1}`}
                className="bg-[#FBFBFC] border border-solid border-borderColor p-3 512:p-5 rounded-md 512:rounded-xl"
              >
                <SelectQuestionType
                  key={`question_type_${index + 1}`}
                  questionData={question}
                  index={index}
                  t={t}
                />
              </div>
            ))}
          </div>
        </CustomCard>
      </div>
    </section>
  );
};
export default ViewSurvey;
