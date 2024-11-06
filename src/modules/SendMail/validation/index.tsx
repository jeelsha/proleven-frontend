import { sendMailDocsSize } from 'constants/filesupport.constant';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

// Send Mail Validation
const checkFileSize = (totalFileSize: File[], fileSize: number) => {
  let finalSize = 0;
  totalFileSize.forEach((data) => (finalSize += data.size));
  return finalSize > fileSize * 1000000;
};

export const SendMailValidation = () => {
  const { t } = useTranslation();

  return Yup.object().shape({
    from: Yup.string(),
    to: Yup.array()
      .required(t('sendMailValidation.toAddressRequired'))
      .transform(splitStringToArray)
      .of(emailSchema()),
    cc: Yup.array().transform(splitStringToArray).of(emailSchema()),
    bcc: Yup.array().transform(splitStringToArray).of(emailSchema()),
    subject: Yup.string().trim().required(t('sendMailValidation.subjectRequired')),
    description: Yup.string()
      .trim()
      .required(t('Codes.descriptionError'))
      .test('contains-meaningful-text', t('Codes.descriptionError'), (value) => {
        const textWithoutTags = value?.replace(/<\/?[^>]+(>|$)/g, '');
        return textWithoutTags?.trim() !== '';
      }),

    attachments: Yup.lazy((value) => {
      return Yup.mixed().test(
        'size',
        `${t('ToastMessage.validFileSizeText')} ${sendMailDocsSize} MB`,
        () => !checkFileSize(value, sendMailDocsSize)
      );
    }),
  });
};
// Provided by parent data type from dependency.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function splitStringToArray(this: any, value: null, originalValue: string) {
  if (this.isType(value) && value !== null) {
    return value;
  }
  return originalValue ? originalValue.split(/[\s,]+/) : [];
}

const emailSchema = () => {
  const { t } = useTranslation();

  return Yup.string()
    .email(({ value }) => `${value} ${t('sendMailValidation.emailValidation')}`)
    .matches(
      /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
      t('UserManagement.validation.invalidEmail')
    );
};
