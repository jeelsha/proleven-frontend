// * imports *
import { Form, Formik, FormikValues } from 'formik';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

// * component *
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import PageHeader from 'components/PageHeader/PageHeader';
import FeedbackModal from './components/FeedbackModal';

// ** hooks
import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';

// * types *
import { FeedbackValueProps, FormDataProps, Participate } from '../types';

// * redux *
import RadioButtonGroup from 'components/FormElement/RadioInput';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import { getExamToken, setExamToken } from 'redux-toolkit/slices/tokenSlice';
import { getTrainerSlug } from 'redux-toolkit/slices/trainerSlugSlice';

const ExamStatusEnum = {
  Pass: 'pass',
  Fail: 'fail',
};

const ExamForm = () => {
  const { t } = useTranslation();
  const feedbackModal = useModal();
  const reTestModal = useModal();
  const navigate = useNavigate();
  const { examSlug, participateSlug, language } = useParams();
  const [getExamForm, { isLoading: getApiLoad }] = useAxiosGet();
  const [createExamForm, { isLoading }] = useAxiosPost();
  const [courseSlug, setCourseSlug] = useState();
  const warningModal = useModal();
  const dispatch = useDispatch();
  const [feedBackData, setFeedBackData] = useState({} as FeedbackValueProps);
  const [formData, setFormData] = useState({} as FormDataProps);
  const [participateData, setParticipateData] = useState<Participate>();
  const [participateSlugState, setParticipateSlugState] = useState(participateSlug);
  const examToken = useSelector(getExamToken);
  const trainerSlug = useSelector(getTrainerSlug);
  const GetExamQuestionnaire = async () => {
    const response = await getExamForm(`/exam/form`, {
      params: { exam_slug: examSlug, participate_slug: participateSlug },
      headers: { 'exam-authorization': examToken },
    });
    setFormData(response?.data?.data[0]);
    setParticipateData(response?.data?.participate_data);
  };
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = function handlePopState() {
      window.history.go(1);
    };
  }, []);

  useEffect(() => {
    GetExamQuestionnaire();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.startsWith('F') ||
        event.ctrlKey ||
        event.altKey ||
        (event.ctrlKey && event.key === 't')
      ) {
        event.preventDefault();
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    const handleTabSwitch = () => {
      warningModal?.openModal();
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.body.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('blur', handleTabSwitch);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.body.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('blur', handleTabSwitch);
    };
  }, []);

  const initialValues = {
    exam_participate_id: participateData?.id,
    exam_slug: examSlug,
    exam_participate_slug: participateSlugState,
    exam: [
      {
        question_slug: '',
        answer_slug: '',
      },
    ],
  };
  const OnSubmit = async (examData: FormikValues) => {
    if (examData) {
      examData.exam = examData.exam.filter(
        (data: { question_slug: string; answer_slug: string }) => data !== undefined
      );
      const filteredData = formData.questions
        .filter((formQuestion) =>
          examData.exam.every(
            (exam: { question_slug: string }) =>
              exam.question_slug !== formQuestion.slug
          )
        )
        .map((data) => ({
          question_slug: data.slug,
          answer_slug: '',
        }));

      examData.exam = [...examData.exam, ...filteredData].filter(
        (data) => data.question_slug.trim() !== ''
      );
      const response = await createExamForm('/exam/submit', examData, {
        headers: { 'exam-authorization': examToken },
      });
      if (typeof response.data !== 'string' && response.data !== null) {
        setFeedBackData({
          course_id: formData.course_id,
          exam_participate_slug: participateData?.slug,
        });
        if (response?.data?.status === ExamStatusEnum.Fail) {
          reTestModal.openModal();
          setCourseSlug(response?.data?.course_slug);
        } else {
          navigate(
            `/exam/survey/${response.data.exam_participate_slug}/${response.data.survey_template_slug}`
          );
        }
      }
    }
  };
  const warnClick = () => {
    warningModal?.closeModal();
  };

  const handleRetest = async () => {
    const { data } = await getExamForm(`/exam/exam-participate`, {
      params: {
        participate_slug: participateSlugState,
      },
    });
    if (data) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('isRetest', 'true');
      formData.append('exam_slug', examSlug as string);
      formData.append('trainer_slug', trainerSlug);
      // formData.append('isReset', 'true');

      const response = await createExamForm(`/exam/add-participate`, formData);
      setParticipateSlugState(response?.data?.slug);
      dispatch(setExamToken({ exam_token: response.data.token }));
      await getExamForm(`/exam/retest-link`, {
        params: {
          course_slug: courseSlug,
          participate_slug: response?.data?.slug,
          is_exam_participate: true,
        },
      });
    }
    reTestModal.closeModal();
    // navigate(
    //   `/${response?.data?.link}?course_slug=${courseSlug}&participate_slug=${participateSlug}`
    // );
  };

  return (
    <>
      <section className="mt-5 h-[calc(100dvh_-_150px)] sm:h-[calc(100dvh_-_165px)] overflow-auto pb-4">
        {formData?.questions?.length > 0 && participateData !== null ? (
          <div className="container h-full flex flex-col">
            <PageHeader text={t('Exam.form.title')} small />
            <Formik
              enableReinitialize
              initialValues={initialValues}
              onSubmit={(values, { resetForm }) => {
                OnSubmit(values);
                resetForm();
              }}
            >
              {({ values, setFieldValue }) => (
                <Form className="h-full flex-auto">
                  <CustomCard
                    minimal
                    cardClass="p-4 pb-2 min-h-full"
                    bodyClass="!px-0 1200:!px-6 991:!px-4 "
                    headerClass="!pb-6 !pt-2 1200:!p-6 991:!py-6 991:!px-4"
                  >
                    <>
                      <div className="md:bg-primaryLight md:rounded-xl md:p-7 1200:p-8 1400:p-10">
                        {Array.isArray(formData.questions) &&
                          formData.questions.length > 0 &&
                          formData.questions.map((data, index) => {
                            const answerOptions = data?.answers.map(
                              ({ answer, slug }) => ({
                                label: answer,
                                value: slug,
                              })
                            );
                            const handleRadioChange = (
                              e: ChangeEvent<HTMLInputElement>
                            ) => {
                              setFieldValue(
                                `exam[${index}].question_slug`,
                                data.slug ?? ''
                              );
                              setFieldValue(
                                `exam[${index}].answer_slug`,
                                e.target.value ?? ''
                              );
                            };
                            return (
                              <div
                                className=" relative p-3 pt-12 md:p-0 bg-primaryLight md:bg-transparent rounded-md md:rounded-none md:pb-6 mb-7 last:mb-0 md:border-b border-solid border-borderColor"
                                key={`exam_${index + 1}`}
                              >
                                <div className="flex justify-between mb-4">
                                  <Button className="absolute md:static top-3 left-3 bg-primary md:bg-transparent text-white w-8 h-8 text-sm font-medium flex items-center justify-center rounded md:w-10 md:inline-block md:font-semibold md:text-base md:text-dark">
                                    {index + 1}
                                  </Button>
                                  <Button className="md:max-w-[calc(100%_-_150px)] inline-block font-semibold text-base text-dark md:pe-3">
                                    {data.question}
                                  </Button>
                                  <Button className="absolute md:static top-3 right-3 ms-auto inline-block font-bold text-base text-dark">
                                    {data.marks} &nbsp;
                                    {t('Exam.form.marksTitle', { lng: language })}
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                  <div
                                    className="md:px-10 py-2.5 rounded-lg border border-solid border-transparent"
                                    key={`answer_${index + 1}`}
                                  >
                                    <RadioButtonGroup
                                      optionWrapper="grid md:grid-cols-2 gap-4 md:gap-6 1200:flex 1200:gap-10 "
                                      name={`exam[${index}].answer_slug`}
                                      options={answerOptions}
                                      parentClass="radio-group col-span-2"
                                      onChange={handleRadioChange}
                                      check={
                                        values?.exam[index]?.answer_slug ===
                                        answerOptions[index]?.value
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                      <div className="flex justify-end gap-4 mt-8">
                        <Button
                          variants="primary"
                          type="submit"
                          isLoading={isLoading}
                          disabled={isLoading}
                          className="addButton"
                        >
                          {t('Button.submit', {
                            lng: language,
                          })}
                        </Button>
                      </div>
                    </>
                  </CustomCard>
                </Form>
              )}
            </Formik>
          </div>
        ) : (
          <div className="bg-primaryLight rounded-xl p-14">
            <h3 className="text-xl text-dark">
              {t('Exam.notFoundTitle', {
                lng: language,
              })}
            </h3>
          </div>
        )}
      </section>
      {feedbackModal?.isOpen && (
        <FeedbackModal modal={feedbackModal} feedBackValues={feedBackData} />
      )}
      {reTestModal?.isOpen && (
        <ConfirmationPopup
          modal={reTestModal}
          bodyText={t('Retest.Popup.IfFailed.BodyText', {
            lng: language,
          })}
          isLoading={getApiLoad}
          variants="reTest"
          popUpType="reTest"
          confirmButtonText={t('Tooltip.reTest', {
            lng: language,
          })}
          confirmButtonFunction={handleRetest}
          showCloseIcon
        />
      )}
      {warningModal?.isOpen && (
        <ConfirmationPopup
          modal={warningModal}
          bodyText={t('Retest.Popup.IfError.BodyText', { lng: language })}
          popUpType="warning"
          variants="primary"
          confirmButtonText={t('Exam.form.okTitle', {
            lng: language,
          })}
          deleteTitle={t('Retest.Popup.IfError.Title', {
            lng: language,
          })}
          confirmButtonFunction={warnClick}
          confirmButtonVariant="primary"
        />
      )}
    </>
  );
};
export default ExamForm;
