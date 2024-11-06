// ** Components **
import Button from 'components/Button/Button';
import InputField from 'components/FormElement/InputField';
import ReactSelect from 'components/FormElement/ReactSelect';
import Image from 'components/Image';

// ** Formik **
import { FieldArray, FieldArrayRenderProps } from 'formik';

// ** Helper Functions **
import {
  createEmptyQuestion,
  numbersToLettersArray,
} from 'modules/Courses/helper/CourseCommon';

// **  Types **
import { Option } from 'components/FormElement/types';
import { TemplateCourseInitialValues } from 'modules/Courses/types';
import { TemplateSubComponentProps } from 'modules/Courses/types/TemplateBundle';

// ** Hooks **
import { useTranslation } from 'react-i18next';

// ** Utils **
import { shouldDisableField } from 'utils';

// ** Styles **
import '../../style/index.css';

const ExamInfoTemplate = ({
  values,
  fieldsToTranslate,
  currentLanguage,
  defaultLanguage,
  isMainLoading = false,
}: TemplateSubComponentProps) => {
  const { t } = useTranslation();
  const handleAddOption = (arrayHelpers: FieldArrayRenderProps): void => {
    arrayHelpers.push({
      answer: '',
      is_correct: false,
      created_by: null,
    });
  };

  const handleAddQuestion = (arrayHelpers: FieldArrayRenderProps): void => {
    arrayHelpers.push({ ...createEmptyQuestion() });
  };

  const renderAnswers = (
    values: TemplateCourseInitialValues,
    arrayHelpers: FieldArrayRenderProps,
    ind: number
  ) => {
    const options = values.exam?.questions?.[ind].answers;
    const optionList: Option[] = [];
    if (Array.isArray(options) && options.length > 0) {
      options?.forEach((opt) => {
        optionList.push({
          label: opt.answer ?? '',
          value: opt.answer ?? '',
        });
      });
    }
    return (
      <>
        <div className="grid grid-cols-2 gap-3">
          {values?.exam?.questions?.[ind]?.answers?.map((item, index) => {
            return (
              <div className="flex gap-3" key={`question_${index + 1}`}>
                <InputField
                  name={`exam.questions[${ind}].answers[${index}].answer`}
                  isCompulsory
                  value={item.answer}
                  label={`${t('CoursesManagement.CreateCourse.option')} ${numbersToLettersArray[index]
                    }`}
                  placeholder={`${t('CoursesManagement.CreateCourse.option')} ${numbersToLettersArray[index]
                    }`}
                  parentClass="flex-[1_0_0%]"
                  isDisabled={isDisabled('answer')}
                  isLoading={isMainLoading}
                />
                {values.exam?.questions &&
                  (values.exam.questions?.[ind]?.answers ?? []).length > 2 && (
                    <Button
                      disabled={isDisabled('') || isMainLoading}
                      className="mt-30px button dangerBorder w-10 h-10 !p-2 inline-block"
                      onClickHandler={() => arrayHelpers.remove(index)}
                      tooltipText={t(
                        'CoursesManagement.CreateCourse.deleteOptionTooltip'
                      )}
                      tooltipPosition="left"
                    >
                      <Image iconName="deleteIcon" iconClassName="w-6 h-6" />
                    </Button>
                  )}
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 mt-3">
          <InputField
            type="number"
            parentClass="max-w-[calc(50%_-_34px)]"
            name={`exam.questions[${ind}].marks`}
            isCompulsory
            value={values?.exam?.questions?.[ind]?.marks?.toString()}
            placeholder={t('CoursesManagement.CreateCourse.marksPlaceHolder')}
            label={t('CoursesManagement.CreateCourse.marksPlaceHolder')}
            isDisabled={isDisabled('marks')}
            isLoading={isMainLoading}
          />
          <ReactSelect
            parentClass="w-full max-w-[calc(50%_-_34px)]"
            name={`exam.questions[${ind}].correct_answer`}
            className="bg-white rounded-lg"
            isCompulsory
            options={optionList}
            label={t('CoursesManagement.CreateCourse.correctAnswerPlaceHolder')}
            placeholder={t(
              'CoursesManagement.CreateCourse.correctAnswerPlaceHolder'
            )}
            disabled={
              isDisabled('correct_answer') ||
              optionList.filter((o) => o.value).length < 1
            }
            isLoading={isMainLoading}
          />
          {values.exam?.questions &&
            (values.exam.questions?.[ind].answers ?? []).length < 4 && (
              <Button
                disabled={isDisabled('') || isMainLoading}
                onClickHandler={() => handleAddOption(arrayHelpers)}
                variants="primary"
                className="w-10 h-10 !p-2 inline-block mt-30px"
              >
                <Image iconClassName="w-full h-full" iconName="plusIcon" />
              </Button>
            )}
        </div>
      </>
    );
  };

  const renderQuestions = (
    values: TemplateCourseInitialValues,
    questionArrayHelpers: FieldArrayRenderProps
  ) => {
    return (
      <>
        {(values?.exam?.questions ?? []).map((quest, ind) => {
          return (
            <div
              className="flex bg-white p-4 border border-solid border-borderColor rounded-lg"
              key={`exam_${ind + 1}`}
            >
              <Button className="question-index">{ind + 1}</Button>
              <div className="max-w-[calc(100%_-_32px)] w-full ps-3">
                <InputField
                  name={`exam.questions[${ind}].question`}
                  isCompulsory
                  value={quest.question}
                  label={t('CoursesManagement.CreateCourse.questionTitle')}
                  placeholder={t(
                    'CoursesManagement.CreateCourse.questionPlaceHolder'
                  )}
                  isDisabled={isDisabled('question')}
                  isLoading={isMainLoading}
                />
                <div className="flex flex-wrap flex-col gap-3 mt-3">
                  <div className="flex flex-col flex-wrap gap-3">
                    <div className="w-full">
                      <FieldArray
                        name={`exam.questions[${ind}].answers`}
                        render={(arrayHelpers) =>
                          renderAnswers(values, arrayHelpers, ind)
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    {values.exam?.questions &&
                      ind === values.exam.questions.length - 1 ? (
                      <Button
                        disabled={isDisabled('') || isMainLoading}
                        onClickHandler={() =>
                          handleAddQuestion(questionArrayHelpers)
                        }
                        variants="primary"
                        className="gap-1"
                      >
                        <Image iconClassName="w-5 h-5" iconName="plusIcon" />
                        {t('CoursesManagement.CreateCourse.addQuestion')}
                      </Button>
                    ) : (
                      ''
                    )}
                    {values.exam?.questions &&
                      values.exam.questions.length > 1 &&
                      ind !== values.exam.questions.length - 1 ? (
                      <Button
                        disabled={isDisabled('') || isMainLoading}
                        variants="danger"
                        className="gap-1"
                        onClickHandler={() => questionArrayHelpers.remove(ind)}
                      >
                        <Image iconName="deleteIcon" iconClassName="w-5 h-5" />
                        {t('CoursesManagement.CreateCourse.deleteQuestion')}
                      </Button>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  const isDisabled = (val: string) =>
    shouldDisableField(val, fieldsToTranslate, currentLanguage, defaultLanguage);

  return (
    <div className="">
      <div className="bg-primaryLight rounded-xl">
        <div className="flex flex-wrap px-9 py-8">
          <p className="text-xl leading-6 font-semibold">
            {t('CoursesManagement.CreateCourse.crateMcq')}
          </p>
        </div>
        <div className="px-9 pb-8">
          <div className="flex flex-col gap-6">
            <div>
              <InputField
                type="number"
                parentClass="!w-[48.6%]"
                name="exam.passing_marks"
                isCompulsory
                label={t('CoursesManagement.CreateCourse.passingMarksTitle')}
                placeholder={t(
                  'CoursesManagement.CreateCourse.passingMarksPlaceHolder'
                )}
                isDisabled={isDisabled('passing_marks')}
                isLoading={isMainLoading}
              />
            </div>
            <FieldArray
              name="exam.questions"
              render={(questionArrayHelpers) =>
                renderQuestions(values, questionArrayHelpers)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInfoTemplate;
