// ** imports **
import { useTranslation } from 'react-i18next';

// ** components **
import { CardDetails } from 'components/Card/CardDetails';

// ** styles **
import 'modules/CompanyManager/style/companyManager.css';

// ** types **
import { FetchAttendeeDetails } from 'modules/CompanyManager/types';

interface Props {
  data: FetchAttendeeDetails | undefined;
}

export const AttendeeInfo = ({ data }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="-mx-6">
      <div className="w-full  max-w-[calc(100%_-_400px)]">
        <ul className="flex flex-wrap justify-between gap-y-8 px-6 mb-8 ">
          <CardDetails
            label={t('CompanyManager.AttendeeList.firstNameView')}
            value={data?.first_name}
            className="!justify-start !items-start !gap-3"
          />
          <CardDetails
            label={t('CompanyManager.AttendeeList.lastNameView')}
            value={data?.last_name}
            className="!justify-start !items-start !gap-3"
          />
          <CardDetails
            label={t('CompanyManager.AttendeeList.emailView')}
            value={data?.email}
            className="!justify-start !items-start !gap-3"
          />

          <CardDetails
            label={t('CompanyManager.AttendeeList.mobileView')}
            value={data?.mobile_number}
            className="!justify-start !items-start !gap-3"
          />
          <CardDetails
            label={t('CompanyManager.AttendeeList.roleView')}
            value={data?.job_title}
            className="!justify-start !items-start !gap-3"
          />
          <CardDetails
            label={t('CompanyManager.AttendeeList.codiceFiscaleView')}
            value={data?.code}
            className="!justify-start !items-start !gap-3"
          />
          <CardDetails
            label={t('CompanyManager.AttendeeList.Status')}
            value={data?.assigned_to_status}
            className="capitalize !justify-start !items-start !gap-3"
            isStatus
          />
        </ul>
      </div>
    </div>
  );
};
