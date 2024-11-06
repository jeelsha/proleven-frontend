// ** components
import Checkbox from 'components/FormElement/CheckBox';
import StatusLabel from 'components/StatusLabel';

// ** imports
import { TFunction } from 'i18next';
import { Rating } from 'react-simple-star-rating';

// ** constants **
import { getColorClass } from 'modules/Courses/Constants';

// ** types **
import Button from 'components/Button/Button';
import NoDataFound from 'components/NoDataFound';
import _ from 'lodash';
import {
  SurveyInitialProps,
  SurveyQuestionProps,
  SurveyShowProps,
} from 'modules/Exam/types';

export interface AttendeeSurveyShowProps {
  surveyQuestions: SurveyInitialProps;
}

const QuestionLabel = (
  index: number,
  question: string,
  label: string,
  survey_target: string,
  isRequired?: boolean
) => {
  return (
    <div className="flex justify-between mb-5">
      <span className="text-dark font-semibold text-base">
        <div>
          <span className="flex">
            {index + 1}. {question}
            {isRequired && <span className="text-red-700">*</span>}
          </span>
        </div>
      </span>
      <div className="flex gap-x-3 items-center">
        <h4 className="text-dark font-semibold text-sm">{label}</h4>
        <StatusLabel text={survey_target} variants="primary" />
      </div>
    </div>
  );
};

export const ShowSurveyData = ({
  questionData,
  index,
  t,
}: {
  questionData: SurveyQuestionProps;
  index: number;
  t: TFunction<'translation', undefined>;
}) => {
  switch (questionData.question_type) {
    case 'mcq':
      return (
        <div>
          {QuestionLabel(
            index,
            questionData.question,
            t('CourseManagement.createSurvey.mcqOption'),
            questionData.survey_target,
            questionData.is_required
          )}
          <div className="flex gap-x-3">
            {questionData?.surveyAnswer?.map((answer, optionIndex: number) => {
              const isChecked = questionData?.surveyQuestionResult?.some(
                (resultData) => resultData?.answer_id === answer.id
              );
              return (
                <div
                  className=" px-5 w-[48%] border border-solid border-transparent"
                  key={`answer_${index + 1}_${optionIndex + 1}`}
                >
                  <Button variants={isChecked ? 'selectedGreen' : 'whiteBordered'}>
                    {answer.answer}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      );
    case 'answer':
      return (
        <>
          {QuestionLabel(
            index,
            questionData.question,
            t('CourseManagement.createSurvey.answerOption'),
            questionData.survey_target,
            questionData.is_required
          )}
          {questionData?.surveyQuestionResult?.[0]?.answer}
        </>
      );
    case 'multiselect':
      return (
        <>
          {QuestionLabel(
            index,
            questionData.question,
            t('CourseManagement.createSurvey.multiSelectOption'),
            questionData.survey_target,
            questionData.is_required
          )}
          <div className="flex  flex-wrap py-4 gap-4 bg-white rounded-lg">
            {questionData?.surveyAnswer?.map((option, optionIndex: number) => {
              const isChecked = questionData?.surveyQuestionResult?.some(
                (resultData) => resultData?.answer_id === option.id
              );
              return (
                <div
                  className=" px-5 w-[48%] border border-solid border-transparent"
                  key={`answer_${index + 1}_${optionIndex + 1}`}
                >
                  <Checkbox text={option.answer} check={isChecked} disabled />
                </div>
              );
            })}
          </div>
        </>
      );
    case 'rate':
      return (
        <>
          {QuestionLabel(
            index,
            questionData.question,
            t('CourseManagement.createSurvey.ratingOption'),
            questionData.survey_target,
            questionData.is_required
          )}
          <div className="border border-solid border-borderColor py-2 px-2.5 rounded-lg inline-block [&_[data-forhalf]]:!text-4xl">
            <Rating
              size={30}
              initialValue={questionData?.surveyQuestionResult?.[0]?.rate}
              transition
              allowFraction
              SVGstyle={{ display: 'inline' }}
              readonly
            />
          </div>
        </>
      );
    case 'scale':
      return (
        <>
          {QuestionLabel(
            index,
            questionData.question,
            t('CourseManagement.createSurvey.scaleTitle'),
            questionData.survey_target,
            questionData.is_required
          )}
          <div className="bg-white rounded-xl p-5">
            <div className="w-fit">
              <div className="flex justify-between">
                {questionData?.label?.map((item, label_index: number) => {
                  return (
                    <div
                      className="block text-sm font-medium"
                      key={`label_${label_index + 1}`}
                    >
                      {item.value}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-x-3 mt-2.5">
                {[...Array(questionData.range)].map((_, label_index) => {
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
              <div className="max-w-[468px] w-full mt-5">
                <div
                  id="progressContainer"
                  className="h-2 bg-gray-300 rounded-full w-full"
                >
                  <div
                    id="progressBar"
                    data-text={`${
                      (Number(questionData?.surveyQuestionResult?.[0]?.rate) * 100) /
                      (questionData?.range ?? 10)
                    }%`}
                    className="h-full bg-green2 rounded-full relative after:absolute after:-right-3 after:-bottom-6 after:font-medium after:text-dark/50 after:content-[attr(data-text)]"
                    style={{
                      width: `${
                        (Number(questionData?.surveyQuestionResult?.[0]?.rate) *
                          100) /
                        (questionData?.range ?? 10)
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      );
    default:
      return null;
  }
};

export const AttendeeSurveyShow = ({
  surveyData,
  t,
}: {
  surveyData: SurveyShowProps[] | undefined;
  t: TFunction<'translation', undefined>;
}) => {
  return (
    <div className="flex flex-col gap-4 mb-5">
      {!_.isEmpty(surveyData) ? (
        surveyData?.[0]?.surveyTemplateQuestion.map((question, index: number) => (
          <div key={`survey_question_${index + 1}`}>
            <ShowSurveyData
              key={`question_${index + 1}`}
              questionData={question}
              index={index}
              t={t}
            />
          </div>
        ))
      ) : (
        <NoDataFound />
      )}
    </div>
  );
};
