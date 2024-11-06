// ** imports
import { useTranslation } from 'react-i18next';

// ** components **
import { CardDetails } from 'components/Card/CardDetails';
import Image from 'components/Image';

// ** styles **
import { format } from 'date-fns';
import 'modules/CompanyManager/style/companyManager.css';
import { FetchAttendeeDetails } from 'modules/CompanyManager/types';
import { REACT_APP_DATE_FORMAT } from 'config';

interface Props {
  data: FetchAttendeeDetails | undefined;
}

export const CourseInfo = ({ data }: Props) => {
  const { t } = useTranslation();
  return (
    <div className="viewCard">
      <span className="text-lg  text-primary font-semibold flex gap-2 border-b border-[#E9EBEC] px-6 pb-4">
        <Image iconName="userIcon2" />
        {t('CompanyManager.AttendeeList.courseInfoTitle')}
      </span>
      <div className="w-full max-w-[calc(100%_-_400px)] ">
        <ul className="flex flex-wrap justify-between gap-y-8 px-6">
          <CardDetails
            label={t('CompanyManager.AttendeeList.courseAttendanceTitle')}
            value={data?.courseAttendance ? `${data.courseAttendance}%` : '-'}
            className="!justify-start !items-start !gap-3"
          />
          <CardDetails
            label={t('CompanyManager.AttendeeList.examStatusTitle')}
            value={data?.courseParticipateExam[0]?.status}
            className="capitalize !justify-start !items-start !gap-3"
            isStatus
          />
          <CardDetails
            label={t('CompanyManager.AttendeeList.courseExpiryTitle')}
            value={
              data?.course?.end_date &&
              format(new Date(data?.course?.end_date), (REACT_APP_DATE_FORMAT as string))
            }
            className="!justify-start !items-start !gap-3"
          />
        </ul>
      </div>
    </div>
  );
};
