import { useTranslation } from 'react-i18next';
import { Cards } from '../types';

type IContactProps = {
  initialBoardData: Cards;
};
const ContactPersonDetail = ({ initialBoardData }: IContactProps) => {
  const { t } = useTranslation();
  const emails = (initialBoardData?.project?.emails ?? '')
    .split(',')
    .map((email) => email.trim())
    .filter((email) => email);
  const phone = (initialBoardData?.project?.phone_numbers ?? '')
    .split(',')
    .map((phone) => phone.trim())
    .filter((phone) => phone);

  return (
    <div className=" bg-white rounded-lg overflow-hidden border border-solid border-gray-200 mb-5 last:mb-0">
      <div className="p-4">
        <h2 className="text-m font-bold text-gray-800 mb-4">
          {t('contactPersonDetails')}
        </h2>
        <div className="text-gray-700">
          <p className="mb-2">
            <span className="font-semibold text-sm">
              {t('UserProfile.viewProfile.fullNameLabel')}:{' '}
            </span>
            <span className="text-sm text-gray-700/70">
              {initialBoardData?.project?.person_first_name
                ? `${initialBoardData?.project?.person_first_name ?? ''} ${
                    initialBoardData?.project?.person_last_name ?? ''
                  }`
                : '-'}
            </span>
          </p>
          <p className="mb-2">
            <span className="font-semibold text-sm">
              {t('UserProfile.settings.email')}:
            </span>{' '}
            {emails.length > 0 &&
              emails.map((email, index) => (
                <span
                  key={`${index + 1}_title`}
                  className="text-sm text-gray-700/70"
                >
                  {email}
                  {index < emails.length - 1 && <span className="me-1">,</span>}
                </span>
              ))}
            {emails.length === 0 && '-'}
          </p>
          <p className="mb-2">
            <span className="font-semibold text-sm">
              {t('UserProfile.settings.contact')}:
            </span>{' '}
            {phone.length > 0 &&
              phone.map((ph, index) => (
                <span
                  key={`${index + 1}_value`}
                  className="text-sm text-gray-700/70"
                >
                  {ph}
                  {index < phone.length - 1 && <span className="me-1">,</span>}
                </span>
              ))}
            {phone.length === 0 && '-'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPersonDetail;
