// ** imports **
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';

// ** components **
import CustomCard from 'components/Card';
import { CardDetails } from 'components/Card/CardDetails';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';

// ** hooks **
import { useAxiosGet } from 'hooks/useAxios';

// ** styles **
import 'modules/Courses/style/index.css';

// ** types **
import { TabDetailProps } from 'modules/Courses/types/survey';

const CourseParticipate = () => {
  const { t } = useTranslation();
  const [courseParticipateGetApi] = useAxiosGet();
  const { state } = useLocation();
  const { courseSlug } = useParams();
  const [courseParticipate, setCourseParticipate] = useState<TabDetailProps>();
  async function CallApi() {
    const response = await courseParticipateGetApi(`/course/participates`, {
      params: {
        participate_slug: courseSlug,
      },
    });
    setCourseParticipate(response?.data?.data[0]);
  }

  useEffect(() => {
    CallApi();
  }, []);
  return (
    <>
      <PageHeader
        small
        text={t("courseParticipate.title")}
        url={`/course/attendees/${courseParticipate?.course?.slug}`}
        passState={{ ...state }}
      />
      <div className="flex flex-col gap-y-5">
        <CustomCard minimal>
          <div className="-mx-6">
            <span className="text-lg  text-primary font-semibold flex gap-2 border-b border-[#E9EBEC] px-6 pb-4 mb-6">
              <Image iconName="userIcon2" />
              {t('CompanyManager.AttendeeList.attendeeInfoTitle')}
            </span>
            <div className="w-full  max-w-[calc(100%_-_400px)] px-6 ">
              <ul className="flex flex-wrap justify-between gap-y-8">
                <CardDetails
                  label={t('CompanyManager.AttendeeList.firstNameView')}
                  value={courseParticipate?.first_name}
                />
                <CardDetails
                  label={t('CompanyManager.AttendeeList.lastNameView')}
                  value={courseParticipate?.last_name}
                />
                <CardDetails
                  label={t('CompanyManager.AttendeeList.emailView')}
                  value={courseParticipate?.email}
                />

                <CardDetails
                  label={t('CompanyManager.AttendeeList.mobileView')}
                  value={courseParticipate?.mobile_number}
                />
                <CardDetails
                  label={t('CompanyManager.AttendeeList.roleView')}
                  value={courseParticipate?.job_title}
                />
                <CardDetails
                  label={t('CompanyManager.AttendeeList.codiceFiscaleView')}
                  value={courseParticipate?.code}
                />
                <CardDetails
                  label={t('CompanyManager.AttendeeList.Status')}
                  value={courseParticipate?.assigned_to_status}
                  isStatus
                />
              </ul>
            </div>
          </div>
        </CustomCard>
      </div>
    </>
  );
};

export default CourseParticipate;
