// ** components **
import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import TextArea from 'components/FormElement/TextArea';

// ** imports **
import { FormikValues } from 'formik';
import { TFunction } from 'i18next';
import { Rating } from 'react-simple-star-rating';

// ** constants **
import { getColorClass } from 'modules/Courses/Constants';

// ** types **
import { SurveyQuestionProps } from 'modules/Exam/types';
import { SetFieldValue } from 'types/common';

// ** styles **
import 'modules/Exam/styles/exam.css';

const QuestionLabel = (
  index: number,
  question: string,
  _label: string,
  _survey_target: string,
  error: string,
  values: string | []
) => {
  return (
    <div className="flex justify-between mb-5">
      <span className="text-dark font-semibold text-base">
        <div>
          <span className="flex">
            {index + 1}. {question}
            {error && <span className="text-red-700">*</span>}
          </span>
          {!values && <span className="error-message">{error}</span>}
        </div>
      </span>
      {/* <div className="flex gap-x-3 items-center">
        <h4 className="text-dark font-semibold text-sm">{label}</h4>
        <StatusLabel text={survey_target} variants="primary" />
      </div> */}
    </div>
  );
};

export const SelectQuestionType = ({
  questionData,
  index,
  t,
  setFieldValue,
  values,
  errors,
}: {
  questionData: SurveyQuestionProps;
  index: number;
  t: TFunction<'translation', undefined>;
  setFieldValue: SetFieldValue;
  values: FormikValues;
  errors: string[];
}) => {
  const { question_type, surveyAnswer, question, survey_target, label, range } =
    questionData;
  const parsedLabel:
    | {
        key: string;
        value: string;
      }[]
    | undefined =
    label !== null && typeof label === 'string' ? JSON.parse(label) : label;

  const scaleValue =
    values?.surveyTemplateQuestion?.scale === ''
      ? 0
      : range &&
        (Number(values?.surveyTemplateQuestion[index]?.scale) / range) * 100;
  const widthValue = Number.isNaN(scaleValue) ? 0 : scaleValue;
  switch (question_type) {
    case 'mcq':
      return (
        <div>
          {QuestionLabel(
            index,
            question,
            t('CourseManagement.createSurvey.mcqOption'),
            survey_target,
            errors[index],
            values?.surveyTemplateQuestion[index]?.mcq?.slug
          )}
          <div className="flex gap-x-3">
            {surveyAnswer?.map((answer, indexV: number) => (
              <div key={`answer_${indexV + 1}`}>
                <Button
                  variants={
                    values?.surveyTemplateQuestion[index]?.mcq?.slug === answer.slug
                      ? 'selectedGreen'
                      : 'whiteBordered'
                  }
                  onClickHandler={() => {
                    setFieldValue(`surveyTemplateQuestion[${index}].mcq`, {
                      answer: answer.answer,
                      slug: answer.slug,
                      selected: true,
                    });
                  }}
                >
                  {answer.answer}
                </Button>
              </div>
            ))}
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
            survey_target,
            errors[index],
            values?.surveyTemplateQuestion[index]?.rate
          )}
          <div className="border border-solid border-borderColor py-2 px-2.5 rounded-lg inline-block [&_[data-forhalf]]:!text-4xl">
            <Rating
              size={30}
              transition
              onClick={(rate) => {
                setFieldValue(`surveyTemplateQuestion[${index}].rate`, rate);
              }}
              // allowFraction
              SVGstyle={{ display: 'inline' }}
            />
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
            survey_target,
            errors[index],
            values?.surveyTemplateQuestion[index]?.answer
          )}
          <TextArea
            placeholder={t('CourseManagement.createSurvey.writePlaceholder')}
            rows={5}
            inputClass="!text-[16px]"
            name={`surveyTemplateQuestion[${index}].answer`}
          />
        </>
      );
    case 'multiselect':
      return (
        <>
          {QuestionLabel(
            index,
            question,
            t('CourseManagement.createSurvey.multiSelectOption'),
            survey_target,
            errors[index],
            values?.surveyTemplateQuestion[index]?.multiselect
          )}
          <div className="flex  flex-wrap py-4 gap-4 bg-white rounded-lg">
            {surveyAnswer?.map((option, optionIndex: number) => {
              return (
                <div
                  className=" px-5 w-[48%] border border-solid border-transparent"
                  key={`answer_${index + 1}_${optionIndex + 1}`}
                >
                  <Checkbox
                    id="optionAnswer"
                    name="option"
                    text={option.answer}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setFieldValue(
                          `surveyTemplateQuestion[${index}].multiselect[${optionIndex}]`,
                          option
                        );
                      } else {
                        setFieldValue(
                          `surveyTemplateQuestion[${index}].multiselect[${optionIndex}]`,
                          undefined
                        );
                      }
                    }}
                  />
                </div>
              );
            })}
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
            survey_target,
            errors[index],
            values?.surveyTemplateQuestion[index]?.scale
          )}
          <div className="bg-white rounded-xl p-5">
            <div className="w-fit">
              <div className="flex justify-between">
                {parsedLabel?.map((item, label_index: number) => {
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
                {[...Array(range)].map((_, label_index) => {
                  const colorClass = getColorClass(questionData.range, label_index);
                  return (
                    <div key={`label_${label_index + 1}`}>
                      <div
                        className={`${colorClass} w-9 h-7 text-sm font-medium text-white rounded items-center flex justify-center`}
                        onClick={() => {
                          setFieldValue(
                            `surveyTemplateQuestion[${index}].scale`,
                            label_index + 1
                          );
                        }}
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
                    style={{
                      width: `${widthValue}%`,
                    }}
                    className="survey-scale-div"
                  >
                    <div
                      className={` absolute -right-3 -bottom-6 font-medium text-dark/50  after:content-[${widthValue}%] `}
                    >
                      {widthValue === 0 ? '' : `${widthValue}%`}
                    </div>
                  </div>
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
