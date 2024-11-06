import { useTranslation } from 'react-i18next';
import { FetchAttendeeDetails } from '../types';
import Image from 'components/Image';

const renderDetail = (label: string, value: string) => (
  <span className="flex gap-1 items-center w-full">
    <span className="text-sm leading-4 text-grayText max-w-[50%]">{label}</span>
    &nbsp;
    <span className="text-sm leading-5 text-dark font-medium">{value || '-'}</span>
  </span>
);

interface AttendeeInfoProps {
  attendee?: FetchAttendeeDetails;
  isAttendeeLoading?: boolean
}
const ViewAttendee = ({ attendee, isAttendeeLoading }: AttendeeInfoProps) => {
  const { t } = useTranslation();
  if (isAttendeeLoading) {
    return (
      <div className="flex justify-center">
        <Image loaderType="Spin" />
      </div>
    );
  }

  return (

    <div className="flex flex-wrap ">
      <div className="w-full">
        {attendee && (
          // <ul className="flex flex-wrap justify-between gap-y-8">
          <ul className="grid 991:grid-cols-2 grid-cols-1 gap-x-10 gap-y-6">
            {renderDetail(
              t('UserManagement.addEditUser.fullName'),
              attendee?.full_name
            )}
            {renderDetail(t('UserManagement.addEditUser.email'), attendee?.email)}
            {renderDetail(
              t('UserManagement.addEditUser.contact'),
              attendee?.mobile_number
            )}
            {renderDetail(
              t('Auth.RegisterCompany.companyName'),
              attendee?.company?.name
            )}
            {renderDetail(t('Codes.code'), attendee?.code)}
            {renderDetail(t('jobTitle'), attendee?.job_title)}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ViewAttendee;
