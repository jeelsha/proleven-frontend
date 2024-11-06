import Button from 'components/Button/Button';
import InputField from 'components/FormElement/InputField';
import Image from 'components/Image';
import { FieldArray, Form, Formik, FormikHelpers, FormikValues } from 'formik';
import { useAxiosPost, useAxiosPut } from 'hooks/useAxios';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MailsValidationSchema } from './validation';

interface Email {
  email: string;
}

interface EmailFormProps {
  initialValues: {
    reminderEmails?: Email[];
    trainerEmails?: Email[];
    satisfactionEmails?: Email[];
    accountManagerReminder?: Email[];
  };
  name: 'reminderEmails' | 'trainerEmails' | 'satisfactionEmails' | 'accountManagerReminder';
  onSubmit: (
    values: FormikValues,
    formikHelpers: FormikHelpers<FormikValues>
  ) => Promise<void>;
  label: string;
}

const EmailForm: React.FC<EmailFormProps> = ({
  initialValues,
  name,
  onSubmit,
  label,
}: EmailFormProps) => {
  const { t } = useTranslation();

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={MailsValidationSchema()}
      onSubmit={onSubmit}
    >
      {({ values }) => {
        return (
          <Form>
            <div className="grid gap-3">
              <FieldArray
                name={name}
                render={(arrayHelpers) =>
                  (values[name] as Email[]).map((email, index) => (
                    <div
                      key={`${name}_${index + 1}`}
                      className="flex items-start w-full gap-x-3"
                    >
                      <InputField
                        placeholder={t(
                          'ClientManagement.clientForm.fieldInfos.emailPlaceHolder'
                        )}
                        type="text"
                        isCompulsory
                        value={email.email}
                        label={index === 0 ? t(label) : ''}
                        name={`${name}[${index}].email`}
                      />
                      <div
                        className={`flex items-center gap-2 mt-0 ${index === 0 ? 'mt-[29px]' : ''
                          }`}
                      >
                        {index === (values[name] as Email[]).length - 1 && (
                          <Button
                            onClickHandler={() => arrayHelpers.push({ email: '' })}
                            className="addIconCard min-w-[47px] min-h-[47px]"
                          >
                            <Image iconName="plusIcon" />
                          </Button>
                        )}
                        {(values[name] as Email[]).length > 1 && (
                          <Button
                            className="button dangerBorder min-w-[47px] min-h-[47px] !p-2 inline-block"
                            onClickHandler={() => arrayHelpers.remove(index)}
                          >
                            <Image iconName="deleteIcon" iconClassName="w-6 h-6" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                }
              />
              <Button
                className="min-w-[90px] justify-self-start"
                variants="primary"
                type="submit"
              >
                {t('Auth.RegisterCommon.submitButtonText')}
              </Button>
            </div>
          </Form>
        )

      }
      }
    </Formik>
  );
};

export const ReminderEmails: React.FC = () => {
  const [reminderEmails, setReminderEmails] = useState<Email[]>([{ email: '' }]);
  const [trainerEmails, setTrainerEmails] = useState<Email[]>([{ email: '' }]);
  const [satisfactionEmails, setSatisfactionEmails] = useState<Email[]>([
    { email: '' },
  ]);
  const [accountManagerReminder, setAccountManagerReminder] = useState<Email[]>([
    { email: '' },
  ]);
  const { response } = useQueryGetFunction('/emails');

  useEffect(() => {
    if (response?.data?.data) {
      const reminderEmailData = response.data.data.find(
        (item: { module_name: string }) => item.module_name === 'reminder_mail'
      );
      const trainerEmailData = response.data.data.find(
        (item: { module_name: string }) =>
          item.module_name === 'trainer_accept_mail'
      );

      const satisfactionEmailData = response.data.data.find(
        (item: { module_name: string }) => item.module_name === 'satisfaction_mail'
      );
      const accountManagerEmailData = response.data.data.find(
        (item: { module_name: string }) => item.module_name === 'accounting_manager_reminder'
      );
      if (accountManagerEmailData) {
        const emailArray = accountManagerEmailData.emails
          .split(',')
          .map((email: string) => ({ email: email.trim() }));
        setAccountManagerReminder(emailArray);
      }

      if (satisfactionEmailData) {
        const emailArray = satisfactionEmailData.emails
          .split(',')
          .map((email: string) => ({ email: email.trim() }));
        setSatisfactionEmails(emailArray);
      }

      if (reminderEmailData) {
        const emailArray = reminderEmailData.emails
          .split(',')
          .map((email: string) => ({ email: email.trim() }));
        setReminderEmails(emailArray);
      }

      if (trainerEmailData) {
        const emailArray = trainerEmailData.emails
          .split(',')
          .map((email: string) => ({ email: email.trim() }));
        setTrainerEmails(emailArray);
      }
    }
  }, [response]);

  const [createEmail] = useAxiosPost();
  const [updateEmail] = useAxiosPut();

  const handleSubmit = async (module_name: string, emailsString: string) => {
    const emailData = response?.data?.data.find(
      (item: { module_name: string }) => item.module_name === module_name
    );

    if (emailData?.slug) {
      await updateEmail(`/emails`, {
        module_name,
        emails: emailsString,
        slug: emailData.slug,
      });
    } else {
      await createEmail(`/emails`, {
        module_name,
        emails: emailsString,
      });
    }
  };

  const handleReminderEmailsSubmit = async (values: FormikValues) => {
    const emailsString = values.reminderEmails
      .map((emailObj: Email) => emailObj.email)
      .join(',');
    await handleSubmit('reminder_mail', emailsString);
  };

  const handleTrainerEmailsSubmit = async (values: FormikValues) => {
    const emailsString = values.trainerEmails
      .map((emailObj: Email) => emailObj.email)
      .join(',');
    await handleSubmit('trainer_accept_mail', emailsString);
  };

  const handleSatisfactionEmailsSubmit = async (values: FormikValues) => {
    const emailsString = values.satisfactionEmails
      .map((emailObj: Email) => emailObj.email)
      .join(',');
    await handleSubmit('satisfaction_mail', emailsString);
  };
  const handleAccountManagerEmailSubmit = async (values: FormikValues) => {
    const emailsString = values.accountManagerReminder
      .map((emailObj: Email) => emailObj.email)
      .join(',');
    await handleSubmit('accounting_manager_reminder', emailsString);
  };


  return (
    <div>
      <div className="mb-5 bg-primaryLight p-4 rounded-md">
        <EmailForm
          initialValues={{ reminderEmails }}
          name="reminderEmails"
          onSubmit={handleReminderEmailsSubmit}
          label="reminderEmailsTitle"
        />
      </div>

      <div className="bg-primaryLight p-4 rounded-md">
        <EmailForm
          initialValues={{ trainerEmails }}
          name="trainerEmails"
          onSubmit={handleTrainerEmailsSubmit}
          label="trainerAcceptedTitle"
        />
      </div>

      <div className="mt-5 bg-primaryLight p-4">
        <EmailForm
          initialValues={{ satisfactionEmails }}
          name="satisfactionEmails"
          onSubmit={handleSatisfactionEmailsSubmit}
          label="trainingSpecialistTitle"
        />
      </div>
      <div className="mt-5 bg-primaryLight p-4">
        <EmailForm
          initialValues={{ accountManagerReminder }}
          name="accountManagerReminder"
          onSubmit={handleAccountManagerEmailSubmit}
          label="AccountManager"
        />
      </div>
    </div>
  );
};
