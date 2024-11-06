// ** Components
import InputField from 'components/FormElement/InputField';
import RadioButtonGroup from 'components/FormElement/RadioInput';
import SignatureCanvas from 'components/Layout/components/Signature';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import { Modal } from 'components/Modal/Modal';

// ** Hooks
import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { SetStateAction, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

// ** Formik
import { Form, Formik, FormikProps, FormikValues } from 'formik';

// ** Validation Schema
import { ExamValidationSchema } from 'modules/Exam/validation';

// ** Types
import { Participate } from 'modules/Exam/types';
import { useDispatch } from 'react-redux';
import { setExamToken } from 'redux-toolkit/slices/tokenSlice';

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

const SurveyParticipantForm = () => {
  const { t } = useTranslation();
  // ** Modals
  const surveyModal = useModal();
  const params = useParams();
  const warningModal = useModal();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ** APIs
  const [surveyPost, { isLoading }] = useAxiosPost();
  const [participateDataGet, { isLoading: isParticipateLoading }] = useAxiosGet();

  // ** States
  const [participateData, setParticipateData] = useState<Participate>();
  // ** Ref
  const formikRef = useRef<FormikProps<FormikValues>>();

  // ** CONSTs
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const trainerSlug = queryParams.get('trainer_slug');
  const courseSlug = queryParams.get('course_slug');
  const initialValues = {
    first_name: participateData?.first_name ?? '',
    last_name: participateData?.last_name ?? '',
    language: participateData?.language ?? '',
    course_slug: courseSlug,
    exam_signature: '',
    trainer_slug: trainerSlug,
  };

  const ParticipateData = async () => {
    if (params?.participateCode) {
      const response = await participateDataGet(`/course/participates`, {
        params: {
          participate_slug: params?.participateCode,
        },
      });
      setParticipateData(response.data.data[0]);
    }
  };

  useEffect(() => {
    ParticipateData();
    surveyModal.openModal();
  }, []);

  const OnSubmit = async (surveyData: FormikValues) => {
    const formData = new FormData();
    Object.entries(surveyData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    const response = await surveyPost(`/exam/survey-participate`, formData);
    if (Object.keys(response.data).length > 0) {
      navigate(`/survey/${response.data.slug}/${params.slug}`);
      dispatch(setExamToken({ exam_token: response.data.token }));
    } else {
      warningModal?.openModal();
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
        headerTitle={t('SurveyModal.title')}
        modal={surveyModal}
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
                    className="!text-[16px]"
                    value={values.first_name}
                    label={t('UserManagement.addEditUser.firstName')}
                    name="first_name"
                  />
                  <InputField
                    placeholder={t('UserManagement.placeHolders.lastName')}
                    type="text"
                    isCompulsory
                    className="!text-[16px]"
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
          deleteTitle={t('ErrorBoundary.title')}
          confirmButtonFunction={warnClick}
          confirmButtonVariant="primary"
        />
      )}
    </>
  );
};

export default SurveyParticipantForm;
