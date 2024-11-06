// **components**
import DropZone from 'components/FormElement/DropZoneField';
import InputField from 'components/FormElement/InputField';
import { fileInputEnum } from 'components/FormElement/types';
import { Modal } from 'components/Modal/Modal';
import ReactEditor from 'components/ReactQuillEditor/ReactQuillEditor';

// **libraries**
import { Form, Formik, FormikProps, FormikValues } from 'formik';

// **types
import { Attachment } from 'modules/EmailTemplate/types';
import { blurProps, sendMailProps } from 'modules/SendMail/types';

// **validation and constants**
import { initialValues } from 'modules/SendMail/constants';
import { SendMailValidation } from 'modules/SendMail/validation';

// **hooks**
import { useAxiosPost } from 'hooks/useAxios';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';

export const AddSendEmailModal = ({
  modal,
  data,
  setRefresh,
  setData,
  refetch,
}: sendMailProps) => {
  const { t } = useTranslation();

  const formikRef = useRef<FormikProps<FormikValues>>();
  const user = useSelector(getCurrentUser);
  const [sendMailPost] = useAxiosPost();
  const [initialVal, setInitialVal] = useState(initialValues);

  useEffect(() => {
    setInitialVal({
      from: data?.from ?? '',
      to: data?.to ?? '',
      cc: data?.cc ?? '',
      bcc: data?.bcc ?? '',
      subject: data?.subject ?? '',
      description: data?.description ?? '',
      attachments:
        data?.attachments?.map((item: Attachment) => {
          return item?.filepath;
        }) ?? [],
    });
  }, []);

  const OnSubmit = async (data: FormikValues) => {
    const formData = new FormData();
    Object.keys(data).forEach((item) => {
      if (data[item]) {
        if (item !== 'attachments' && item !== 'from') {
          formData.append(`${item}`, data[item]);
        }
      }
    });
    data?.attachments?.forEach((item: string) => {
      formData.append(`attachments`, item);
    });
    if (user?.email && user?.id) {
      formData.append(`from`, user?.email);
      formData.append(`created_by`, user.id);
    }
    const { data: emailData, error } = await sendMailPost('/send_mails', formData);
    if (emailData && !error) {
      modal.closeModal();
      setData?.(null);
      refetch?.();
    }

    if (setRefresh) setRefresh((prev) => !prev);
  };

  const handleBlur = ({ e, fieldName, setFieldValue }: blurProps) => {
    setFieldValue(
      fieldName,
      e.target.value
        .trim()
        // .replace(/^(?:,*)(.*?)(?:,*)$/, '')
        .replace(/^[,]+|[,]+$/g, '')

        .replace(/[, ]+/g, ',')
    );
  };

  const handleSubmitRef = () => {
    if (formikRef.current) {
      formikRef.current.submitForm();
    }
  };

  return (
    <Modal
      setDataClear={setData}
      modal={modal}
      showFooter
      footerSubmit={handleSubmitRef}
      footerSubmitButtonTitle={t('SendMail.send')}
      footerButtonTitle={t('SendMail.cancelBtn')}
      headerTitle={data ? t('SendMail.createMail') : t('SendMail.mail')}
      modalClassName="!px-7"
    >
      <Formik
        enableReinitialize
        initialValues={initialVal}
        validationSchema={SendMailValidation()}
        onSubmit={(values) => OnSubmit(values)}
        innerRef={formikRef as React.Ref<FormikProps<FormikValues>>}
      >
        {({ values, setFieldValue, setFieldTouched }) => {
          return (
            <div className=" w-full">
              <Form className="flex flex-col gap-4">
                <InputField
                  prefix={t('SendMail.from')}
                  prefixBig
                  type="text"
                  value={user?.email}
                  isDisabled
                  name="from"
                />
                <InputField
                  prefix={t('SendMail.to')}
                  prefixBig
                  type="text"
                  value={values.to}
                  name="to"
                  onBlur={(e) => handleBlur({ e, fieldName: 'to', setFieldValue })}
                />
                <InputField
                  prefix={t('SendMail.cc')}
                  prefixBig
                  type="text"
                  value={values.cc}
                  name="cc"
                  onBlur={(e) => handleBlur({ e, fieldName: 'cc', setFieldValue })}
                />
                <InputField
                  prefix={t('SendMail.bcc')}
                  prefixBig
                  type="text"
                  value={values.bcc}
                  name="bcc"
                  onBlur={(e) => handleBlur({ e, fieldName: 'bcc', setFieldValue })}
                />
                <InputField
                  placeholder={t('SendMail.subjectPlaceholder')}
                  type="text"
                  value={values.subject}
                  name="subject"
                />
                <div className="col-span-2">
                  <ReactEditor
                    parentClass="h-unset"
                    name="description"
                    setFieldValue={setFieldValue}
                    setFieldTouched={setFieldTouched}
                    value={values.description}
                    // id="sendmail_editor"
                  />
                </div>
                <DropZone
                  variant={fileInputEnum.LinkFileInput}
                  className="col-span-2"
                  limit={4}
                  isMulti
                  name="attachments"
                  Title={t('SendMail.title')}
                  SubTitle={t('SendMail.fileSubtitle')}
                  setValue={setFieldValue}
                  value={values.attachments}
                  size={10}
                  isSendMail
                />
              </Form>
            </div>
          );
        }}
      </Formik>
    </Modal>
  );
};
