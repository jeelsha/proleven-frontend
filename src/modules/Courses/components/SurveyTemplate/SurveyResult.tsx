// ** Components ***
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Image from 'components/Image';
import NoDataFound from 'components/NoDataFound';
import StatusLabel from 'components/StatusLabel';

// ** Hooks ***
import { useQueryGetFunction } from 'hooks/useQuery';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

// ** Constants ***
import { getColorClass } from 'modules/Courses/Constants';

// ** Types ***
import { Survey } from 'modules/Courses/types/surveyResult';

// ** Utils ***
import { TFunction } from 'i18next';
import { Rating } from 'react-simple-star-rating';

const QuestionLabel = (
  index: number,
  question: string,
  label: string,
  survey_target: string
) => {
  return (
    <div className="flex justify-between mb-5">
      <span className="text-dark font-semibold text-xl">
        {index + 1}. {question}
      </span>
      <div className="flex gap-x-3 items-center">
        <h4 className="text-dark font-semibold text-sm">{label}</h4>
        <StatusLabel text={survey_target} variants="primary" />
      </div>
    </div>
  );
};

export const SelectQuestionType = ({
  questionData,
  index,
  t,
}: {
  questionData: Survey;
  index: number;
  t: TFunction<'translation', undefined>;
}) => {
  const { answers } = questionData;
  const { courseRate } = questionData;
  const { trainerRateData } = questionData;
  const { question_type, survey_target, question, label, range } =
    questionData.question;
  switch (question_type) {
    case 'mcq':
    case 'multiselect': {
      const groupedAnswers =
        question_type === 'multiselect'
          ? answers?.reduce<Record<number, typeof answers>>((acc, ans) => {
              if (!acc[ans.exam_participate_id]) {
                acc[ans.exam_participate_id] = [];
              }
              acc[ans.exam_participate_id].push(ans);
              return acc;
            }, {})
          : { default: answers };
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
          <div className="bg-white rounded-xl p-5 grid gap-4">
            {Object.entries(groupedAnswers).map(([key, group]) => (
              <div className="flex gap-3 flex-wrap" key={`group_${key}`}>
                {group.map((ans) => (
                  <Button key={`${ans.id}_multiselect`} variants="grayLight">
                    {ans?.answerSurvey?.answer}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }
    case 'rate': {
      return (
        <>
          {QuestionLabel(
            index,
            question,
            t('CourseManagement.createSurvey.ratingOption'),
            survey_target
          )}

          {courseRate ? (
            <div className="border border-solid w-fit border-borderColor py-2 px-2.5 rounded-lg flex items-center flex-row gap-4 ml-auto leading-none bg-white shadow-sm text-[14px] mb-2">
              <strong className="flex items-center [&_[data-forhalf]]:!text-4xl gap-1">
                {answers[0].courseSurvey.title}
              </strong>
              <div className="flex items-center [&_[data-forhalf]]:!text-4xl gap-1">
                <Rating
                  size={20}
                  initialValue={courseRate}
                  transition
                  readonly
                  SVGstyle={{ display: 'inline' }}
                />
                <span> {courseRate}/5</span>
              </div>
            </div>
          ) : (
            ''
          )}
          {trainerRateData.length !== 0 ? (
            <>
              <h3 className="my-3 text-base font-semibold pl-2.5">
                {t('CourseManagement.createSurvey.avgTrainerRating')}
              </h3>
              <div className="bg-white rounded-xl p-5 flex gap-4 flex-wrap">
                {trainerRateData.map((items) => (
                  <div className="border border-solid border-borderColor py-2 px-2.5 rounded-lg flex items-center leading-none flex-row gap-2">
                    <span>{items?.trainerName}</span>
                    <div className=" flex items-center gap-1 [&_[data-forhalf]]:!text-4xl">
                      <Rating
                        size={20}
                        initialValue={Number(items.trainerRate)}
                        transition
                        readonly
                        SVGstyle={{ display: 'inline' }}
                      />
                      <span> {items?.trainerRate}/5</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className=" mt-3 border" />
            </>
          ) : (
            ''
          )}
          {survey_target === 'trainer' && (
            <h3 className="my-3 text-base font-semibold pl-2.5">
              {t('CourseManagement.createSurvey.userTrainerRating')}
            </h3>
          )}
          <div className="bg-white rounded-xl p-5 flex gap-4 flex-wrap">
            {answers?.map((ans) => (
              <>
                {ans.rate && (
                  <div
                    className="border border-solid border-borderColor py-2 px-2.5 rounded-lg flex items-center gap-1 leading-none [&_[data-forhalf]]:!text-4xl"
                    key={`${ans?.id}_rate`}
                  >
                    {survey_target === 'trainer' && (
                      <span>
                        {ans?.courseTrainer?.first_name}{' '}
                        {ans?.courseTrainer?.last_name}
                      </span>
                    )}

                    <Rating
                      size={20}
                      initialValue={ans?.rate}
                      transition
                      readonly
                      SVGstyle={{ display: 'inline' }}
                    />
                    <span> {ans?.rate}/5</span>
                  </div>
                )}
              </>
            ))}
          </div>
        </>
      );
    }
    case 'answer': {
      return (
        <>
          {QuestionLabel(
            index,
            question,
            t('CourseManagement.createSurvey.answerOption'),
            survey_target
          )}
          <div className="bg-white rounded-xl p-5">
            {answers?.map((ans) =>
              ans?.answer !== null ? (
                <div
                  className="p-3 border border-solid border-borderColor rounded-lg text-sm mb-4 last:mb-0"
                  key={`${ans?.id}_answer`}
                >
                  {ans?.answer}
                </div>
              ) : (
                ''
              )
            )}
          </div>
        </>
      );
    }
    case 'scale': {
      return (
        <>
          {QuestionLabel(
            index,
            question,
            t('CourseManagement.createSurvey.scaleTitle'),
            survey_target
          )}
          <div className="bg-white rounded-xl p-5">
            <div className="w-fit">
              <div className="flex justify-between">
                {(typeof label === 'string' ? JSON.parse(label) : label)?.map(
                  (item: { key: string; value: string }, label_index: number) => (
                    <div
                      className="block text-sm font-medium"
                      key={`label_${label_index + 1}`}
                    >
                      {item.value}
                    </div>
                  )
                )}
              </div>

              {answers?.map((ans) => (
                <div className="flex gap-x-3 mt-2.5" key={`${ans?.id}_scale`}>
                  {[...Array(ans?.rate)].map((_, label_index) => {
                    const colorClass = getColorClass(range, label_index);
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
              ))}
            </div>
          </div>
        </>
      );
    }
    default:
      return null;
  }
};

const SurveyResult = () => {
  const { t } = useTranslation();
  const params = useParams();
  const { response, isLoading } = useQueryGetFunction(
    `/course/survey-result?course_slug=${params?.slug}`
  );
  if (isLoading) {
    return (
      <div className="flex justify-center">
        <Image loaderType="Spin" />
      </div>
    );
  }
  const totalCourseRating = response?.data?.data?.data?.length
    ? response.data.data.data[0].totalCourseRating
    : undefined;

  const courseName = totalCourseRating
    ? response?.data?.data?.data[0].answers[0].courseSurvey.title
    : undefined;
  return (
    <>
      {!isLoading && response?.data?.data?.data?.length === 0 && (
        <NoDataFound message={t('Table.noDataFound')} />
      )}
      {!isLoading && response?.data?.data?.data?.length > 0 && (
        <section>
          <div className="container">
            <CustomCard minimal>
              <div className="flex flex-col gap-4 mb-5">
                {totalCourseRating ? (
                  <div className="border border-solid w-fit border-borderColor py-2 px-2.5 rounded-lg flex items-center flex-row gap-4 ml-auto leading-none bg-white shadow-sm text-[14px]">
                    <strong>{courseName}</strong>
                    <div className="flex items-center [&_[data-forhalf]]:!text-4xl gap-1">
                      <Rating
                        size={20}
                        initialValue={Number(totalCourseRating)}
                        transition
                        readonly
                        SVGstyle={{ display: 'inline' }}
                      />
                      <span>{totalCourseRating}/5</span>
                    </div>
                  </div>
                ) : (
                  ''
                )}
                {response?.data?.data?.data?.map(
                  (question: Survey, index: number) => {
                    return (
                      <div
                        key={`survey_question_${index + 1}`}
                        className="bg-[#FBFBFC] border border-solid border-borderColor p-5 rounded-xl"
                      >
                        <SelectQuestionType
                          key={`question_type_${index + 1}`}
                          questionData={question}
                          index={index}
                          t={t}
                        />
                      </div>
                    );
                  }
                )}
              </div>
            </CustomCard>
          </div>
        </section>
      )}
    </>
  );
};

export default SurveyResult;
