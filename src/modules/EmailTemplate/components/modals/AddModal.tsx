// **components**
import InputField from 'components/FormElement/InputField';
import { Modal } from 'components/Modal/Modal';
import ReactEditor from 'components/ReactQuillEditor/ReactQuillEditor';

// **libraries**
import { Form, Formik, FormikProps, FormikValues } from 'formik';

import { useAxiosPatch } from 'hooks/useAxios';

// **hooks**
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// **types**
import { EmailNotes, emailProps } from 'modules/EmailTemplate/types';

// **validations**
import Button from 'components/Button/Button';
import Image from 'components/Image';
import { EmailTemplateValidation } from 'modules/EmailTemplate/validation';
import { useDispatch } from 'react-redux';
import { setToast } from 'redux-toolkit/slices/toastSlice';
import {
  capitalizeFirstCharacter,
  customRandomNumberGenerator,
  findBraces,
  replaceBracesWithTemplateTags,
  replaceTemplateTagsWithBraces,
} from 'utils';

export const AddEmailModal = ({ modal, data, setData, refetch }: emailProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const formikRef = useRef<FormikProps<FormikValues>>();
  const [updateEmailTemplate] = useAxiosPatch();
  const [initialValues, setInitialValues] = useState<{
    title: string;
    subject: string;
    description: string;
  }>({
    title: '',
    subject: '',
    description: '',
  });

  useEffect(() => {
    setInitialValues({
      title: data?.title ?? '',
      subject: data?.subject ?? '',
      description: replaceTemplateTagsWithBraces(data?.description) ?? '',
    });
  }, []);

  // Submit function

  const OnSubmit = async (emailValues: FormikValues) => {
    const keyFind = JSON.parse(data?.note as unknown as string)?.map(
      (obj: { [key: string]: string }) => Object.keys(obj)[0]
    );

    const { braceCounts } = findBraces(emailValues.description, keyFind);
    const regexPattern = /\[([^\]]+)\]/g;

    const tryNew = emailValues.description.match(new RegExp(regexPattern)) || [];
    const keysWithoutBrackets = tryNew.map((match: string) =>
      match.substring(1, match.length - 1)
    );
    const hasExtraKeys = keysWithoutBrackets.some(
      (key: string) => !keyFind.includes(key)
    );
    if (
      (Object.values(braceCounts)?.every((item) => item !== 0) ||
        JSON.parse(data?.note as unknown as string) === null) &&
      !hasExtraKeys
    ) {
      const formData = new FormData();
      Object.keys(emailValues).forEach((item) => {
        if (emailValues[item]) {
          if (item !== 'description') {
            formData.append(`${item}`, emailValues[item]);
          }
          if (item === 'description') {
            formData.append(
              `description`,
              replaceBracesWithTemplateTags(emailValues.description)
            );
          }
        }
      });
      const { data: emailData } = await updateEmailTemplate(
        `/template/${data?.slug}`,
        formData
      );
      if (emailData) {
        modal.closeModal();
      }
      refetch?.();
    } else {
      dispatch(
        setToast({
          variant: 'Error',
          message: `${t('ToastMessage.emailTemplateNotes')}`,
          type: 'error',
          id: customRandomNumberGenerator(),
        })
      );
    }
  };

  // function to submit for formik ref
  const handleSubmitRef = () => {
    if (formikRef.current) {
      formikRef.current.submitForm();
    }
  };
  return (
    <Modal
      modal={modal}
      showFooter
      setDataClear={setData}
      headerTitle={t('EmailTemplate.editEmailTemp')}
      footerSubmit={handleSubmitRef}
      footerButtonTitle={t('Button.cancelButton')}
      footerSubmitButtonTitle={t('EmailTemplate.update')}
      modalBodyClassName="!px-7"
    >
      <>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={EmailTemplateValidation()}
          onSubmit={(values) => OnSubmit(values)}
          innerRef={formikRef as React.Ref<FormikProps<FormikValues>>}
        >
          {({ values, setFieldValue, setFieldTouched }) => (
            <Form>
              <div className="flex flex-col gap-4">
                <InputField
                  isDisabled
                  placeholder={t('EmailTemplate.titleplaceholder')}
                  type="text"
                  value={values.title}
                  label={t('Calendar.createEvent.topic')}
                  name="title"
                />
                <InputField
                  placeholder={t('EmailTemplate.subjectplaceholder')}
                  type="text"
                  value={values.subject}
                  label={t('EmailTemplate.emailTempTableSubject')}
                  name="subject"
                />
                <ReactEditor
                  label={t('EmailTemplate.emailTempTableDescription')}
                  parentClass="h-unset"
                  name="description"
                  setFieldValue={setFieldValue}
                  setFieldTouched={setFieldTouched}
                  value={values.description}
                  // id="email_editor"
                />
              </div>
            </Form>
          )}
        </Formik>
        {/* render notes */}
        {data?.note && (
          <div>
            <p className="my-4 font-medium">{t('SendMail.Notes')}</p>

            {data?.note &&
              JSON.parse(data?.note as unknown as string).map((item: EmailNotes) => {
                return Object.entries(item).map(
                  ([key, value]: [string, string], index: number) => {
                    return (
                      <div
                        key={`note_${index + 1}`}
                        className="flex gap-1 items-center"
                      >
                        <Image
                          iconName="checkRoundIcon2"
                          iconClassName="w-4 h-4 text-grayText"
                        />
                        <Button className="text-dark">
                          {`${capitalizeFirstCharacter(key)}: ${value}`}
                        </Button>
                      </div>
                    );
                  }
                );
              })}
          </div>
        )}
      </>
    </Modal>
  );
};
