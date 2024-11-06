// ** imports **
import { Form, Formik, FormikProps, FormikValues } from 'formik';
import { SetStateAction, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

// ** components **
import InputField from 'components/FormElement/InputField';
import RadioButtonGroup from 'components/FormElement/RadioInput';
import SignatureCanvas from 'components/Layout/components/Signature';
import { Modal } from 'components/Modal/Modal';
import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';

// ** schema **
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import { ExamValidationSchema } from 'modules/Exam/validation';
import { setExamToken } from 'redux-toolkit/slices/tokenSlice';
import { Participate } from '../types';
import { setTrainerSlug } from 'redux-toolkit/slices/trainerSlugSlice';

const LanguageOptions = () => {
  const { t } = useTranslation();
  return [
    {
      label: t('italianTitle'),
      value: 'italian',
    },
    {
      label: t('englishTitle'),
      value: 'english',
    },
  ];
};

const ParticipantForm = () => {
  const { t } = useTranslation();
  const examModal = useModal();
  const examSubmittedModal = useModal();
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const warningModal = useModal();
  const currentURL = new URL(window.location.href);
  const courseSlug = currentURL.searchParams.get('course_slug');
  const participateSlug = currentURL.searchParams.get('participate_slug');
  const [examPost, { isLoading }] = useAxiosPost();
  const [participateDataGet, { isLoading: isParticipateLoading }] = useAxiosGet();
  const [participateData, setParticipateData] = useState<Participate>();

  const formikRef = useRef<FormikProps<FormikValues>>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const trainerSlug = queryParams.get('trainer_slug');
  dispatch(setTrainerSlug({ trainer_slug: String(trainerSlug) }));
  const initialValues = {
    first_name: participateData?.first_name ?? '',
    last_name: participateData?.last_name ?? '',
    language: participateData?.language ?? '',
    exam_slug: params?.slug,
    exam_signature: '',
    trainer_slug: trainerSlug,
    ...(trainerSlug && { isRetest: false }),
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === 'F12' ||
        event?.ctrlKey ||
        event?.altKey ||
        (event.ctrlKey && event?.key === 't')
      ) {
        event.preventDefault();
        warningModal?.openModal();
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const ParticipateData = async () => {
    if (params?.participateCode) {
      const response = await participateDataGet(`/exam/retest-link`, {
        params: {
          course_slug: courseSlug,
          participate_slug: participateSlug,
          is_exam_participate: true,
          skip_increment: true,
        },
      });
      setParticipateData(response.data.participate_data);
    }
  };

  useEffect(() => {
    ParticipateData();
    examModal.openModal();
  }, []);

  const OnSubmit = async (examData: FormikValues) => {
    const examLanguage = examData?.language === 'english' ? 'en' : 'it';
    if (examData) {
      if (params?.participateCode) {
        examData.isRetest = true;
      }
      const formData = new FormData();
      Object.entries(examData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      const response = await examPost(`/exam/add-participate`, formData);
      if (Object.keys(response.data).length > 0) {
        navigate(`/exam/form/${params.slug}/${response.data.slug}/${examLanguage}`);
        dispatch(setExamToken({ exam_token: response.data.token }));
      } else {
        examSubmittedModal?.openModal();
      }
    }
  };

  const handleSubmitRef = () => {
    if (formikRef.current) {
      formikRef.current.submitForm();
    }
  };
  const warnClick = () => {
    warningModal?.closeModal();
  };
  return (
    <>
      <Modal
        headerTitle={t('Exam.title')}
        modal={examModal}
        showFooter
        footerSubmit={handleSubmitRef}
        closeOnOutsideClick
        isSubmitLoading={isLoading || isParticipateLoading}
        hideCloseIcon
      >
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={ExamValidationSchema()}
          onSubmit={(values) => OnSubmit(values)}
          innerRef={formikRef as React.Ref<FormikProps<FormikValues>>}
        >
          {({ values, errors, setFieldValue }) => {
            const handleSignatureChange = (signature: File | null) => {
              setFieldValue('exam_signature', signature);
            };

            return (
              <Form className="grid lg:grid-cols-2 gap-4">
                <div className="flex flex-col gap-y-4">
                  <RadioButtonGroup
                    optionWrapper="flex gap-3"
                    name="language"
                    options={LanguageOptions()}
                    isCompulsory
                    label={t('Exam.languageTitle')}
                    parentClass="radio-group col-span-2"
                    selectedValue={values.language}
                  />
                  <InputField
                    placeholder={t('UserManagement.placeHolders.firstName')}
                    type="text"
                    isCompulsory
                    value={values.first_name}
                    label={t('UserManagement.addEditUser.firstName')}
                    name="first_name"
                  />
                  <InputField
                    placeholder={t('UserManagement.placeHolders.lastName')}
                    type="text"
                    isCompulsory
                    value={values.last_name}
                    label={t('UserManagement.addEditUser.lastName')}
                    name="last_name"
                  />
                </div>
                <div>
                  <SignatureCanvas
                    title={t('AttendanceSheet.Sign')}
                    setSignatureBegin={
                      handleSignatureChange as React.Dispatch<
                        SetStateAction<File | null>
                      >
                    }
                    error={errors.exam_signature as string}
                    name="exam_signature"
                    setFieldValue={setFieldValue}
                  />
                </div>
              </Form>
            );
          }}
        </Formik>
      </Modal>
      {warningModal?.isOpen && (
        <ConfirmationPopup
          modal={warningModal}
          popUpType="warning"
          variants="primary"
          confirmButtonText={t('Exam.form.okTitle')}
          deleteTitle={t('Retest.Popup.IfError.Title')}
          bodyText={t('Retest.Popup.IfError.BodyText')}
          confirmButtonFunction={warnClick}
          confirmButtonVariant="primary"
        />
      )}

      {examSubmittedModal?.isOpen ? (
        <ConfirmationPopup
          modal={examSubmittedModal}
          popUpType="primaryWarning"
          deleteTitle={t('Exam.form.examSubmittedTitle')}
          bodyText={t('Exam.form.examSubmittedBody')}
          variants="primary"
          cancelButtonText={t('Button.backButton')}
          cancelButtonFunction={() => examSubmittedModal.closeModal()}
        />
      ) : (
        ''
      )}
    </>
  );
};

export default ParticipantForm;
