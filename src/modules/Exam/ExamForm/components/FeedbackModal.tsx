// ** imports **
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Form, useNavigate } from 'react-router-dom';
import { Rating } from 'react-simple-star-rating';
import { Formik, FormikProps, FormikValues } from 'formik';

// ** components **
import TextArea from 'components/FormElement/TextArea';
import { Modal } from 'components/Modal/Modal';
import { useAxiosPost } from 'hooks/useAxios';
import { FeedbackValueProps } from 'modules/Exam/types';

// ** redux **
import { getExamToken } from 'redux-toolkit/slices/tokenSlice';

// ** constants **
import { ModalProps } from 'types/common';

const FeedbackModal = ({
  modal,
  feedBackValues,
}: {
  modal: ModalProps;
  feedBackValues: FeedbackValueProps;
}) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState<number>();
  const [feedbackCreate, { isLoading: feedBackLoading }] = useAxiosPost();
  const formikRef = useRef<FormikProps<FormikValues>>();
  const navigate = useNavigate();
  const examToken = useSelector(getExamToken);

  const handleSubmitRef = () => {
    if (formikRef.current) {
      formikRef.current.submitForm();
    }
  };
  const OnSubmit = async (feedbackData: FormikValues) => {
    if (feedbackData) {
      feedbackData.rating = rating;
      const response = await feedbackCreate(`/feedback`, feedbackData, {
        headers: { 'exam-authorization': examToken },
      });
      if (typeof response.data !== 'string') {
        navigate(
          `/exam/survey/${response.data.exam_participate_slug}/${response.data.survey_template_slug}`
        );
        modal.closeModal();
      }
    }
  };
  const ratingChanged = (newRating: number) => {
    setRating(newRating);
  };

  const CancelClick = () => {
    modal?.closeModal();
    navigate(`/exam/complete`);
  };

  return (
    <Modal
      headerTitle={t('Exam.satisfactionSurveyTitle')}
      modal={modal}
      showFooter
      footerButtonTitle={t('Button.cancelButton')}
      footerSubmit={handleSubmitRef}
      footerSubmitButtonTitle={t('Button.submit')}
      closeOnOutsideClick
      cancelClick={CancelClick}
      hideCloseIcon
      isSubmitLoading={feedBackLoading}
    >
      <Formik
        enableReinitialize
        initialValues={feedBackValues}
        onSubmit={(values) => OnSubmit(values)}
        innerRef={formikRef as React.Ref<FormikProps<FormikValues>>}
      >
        {() => (
          <Form className="flex flex-col gap-y-7">
            <div>
              <p className="text-sm text-black leading-4 inline-block mb-2">
                {t('Exam.feedback')}
              </p>
              <Rating
                onClick={ratingChanged}
                size={30}
                transition
                allowFraction
                initialValue={rating}
                SVGstyle={{ display: 'inline' }}
              />
            </div>
            <TextArea
              parentClass=""
              rows={5}
              placeholder={t('Exam.feedback.placeholder')}
              label={t('Exam.feedback.title')}
              name="comment"
            />
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default FeedbackModal;
