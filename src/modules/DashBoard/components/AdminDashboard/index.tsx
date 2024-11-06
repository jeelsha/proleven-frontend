// ** components **
import { Course } from 'modules/DashBoard/components/Course';
import { Reports } from 'modules/DashBoard/components/Reports';
import { Tiles } from 'modules/DashBoard/components/Tiles';

// ** type **
import {
  ICertificates,
  IDashboard,
  IDashboardCustomCardData,
  ITrainerFeesData,
} from 'modules/DashBoard/types';

// ** style **
import { ROLES } from 'constants/roleAndPermission.constant';
import { useQueryGetFunction } from 'hooks/useQuery';
import _ from 'lodash';
import 'modules/DashBoard/components/style/dashboard.css';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { formatCount } from 'utils';
import { DashboardCustomCard } from '../DashboardCustomCard/DashboardCustomCard';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const user = useSelector(getCurrentUser);

  const [dashboardData, setDashboardData] = useState<IDashboard>();
  const [dashBoardCommonCard, setDashBoardCommonCard] = useState<{
    trainerFeesData: IDashboardCustomCardData[] | [];
    certificatesData: IDashboardCustomCardData[] | [];
    courseProposal: IDashboardCustomCardData[] | [];
  }>({
    trainerFeesData: [],
    certificatesData: [],
    courseProposal: [],
  });

  const { response, isLoading: isCourseLoading } = useQueryGetFunction('/dashboard');
  const { response: trainerFees, isLoading: isTrainerFeesLoading } =
    useQueryGetFunction('/dashboard/fee-issues');
  const { response: certificates, isLoading: isCertificateLoading } =
    useQueryGetFunction('/dashboard/certificates');
  const { response: courseProposalRes, isLoading: isCourseProposeLoading } =
    useQueryGetFunction('/dashboard/course-proposals');
  const checkIfOptionalOrMain = (item: ITrainerFeesData) => {
    if (item.is_full_course) {
      return item?.is_optional ? 'Optional' : 'Main';
    }
    return 'Session';
  };

  useEffect(() => {
    if (response?.data) {
      setDashboardData(response?.data);
    }

    // ** Handle-Trainer-Fees-Data **
    if (trainerFees?.data && !_.isEmpty(trainerFees?.data?.data)) {
      const trainerData = trainerFees?.data?.data?.map((data: ITrainerFeesData) => {
        const trainingSpecialistNames =
          data?.courses.card?.card_members?.map(
            (cardMember) => cardMember?.member?.full_name
          ) ?? [];
        return {
          title: data?.courses?.title,
          category: data?.courses?.courseCategory?.name,
          count: `${data?.assignedToUser?.profit ?? '0'} %`,
          image: data?.courses?.image,
          trainer_name: `${data?.assignedToUser?.first_name} ${data?.assignedToUser?.last_name}`,
          training_specialist_name: trainingSpecialistNames,
          type: checkIfOptionalOrMain(data),
          slug: data?.courses?.slug,
          status: data?.courses?.status,
          course_type: data.courses.type,
          course_id: data.courses.id,
        };
      });

      setDashBoardCommonCard((prev) => {
        return { ...prev, trainerFeesData: trainerData ?? [] };
      });
    }
    // ** Handle-Trainer-Fees-Data **

    // ** Handle-Certificates-Data **
    if (!_.isEmpty(certificates?.data)) {
      const certificateDashBoard = certificates?.data?.map((data: ICertificates) => {
        return {
          title: data?.course,
          count: data?.days,
          slug: data?.course_slug,
          companies: data?.company,
          quotes: data?.quotes,
          status: data?.status,
        };
      });
      setDashBoardCommonCard((prev) => {
        return { ...prev, certificatesData: certificateDashBoard ?? [] };
      });
    }
    // ** Handle-Certificates-Data **

    // ** Handle-CourseProposal-Data **
    if (!_.isEmpty(courseProposalRes?.data)) {
      const courseProposalDashBoard = courseProposalRes?.data?.map(
        (data: ICertificates) => {
          return {
            title: data?.course,
            category: data?.course_category,
            count: data?.days,
            image: data?.image,
            revenue: data?.revenue,
            pipeline_date: data?.pipeline_date,
            quote_number: data?.quote_number,
            companies: data?.company,
            slug: data?.course_slug,
            training_specialist: data?.training_specialist,
            status: data?.status,
          };
        }
      );
      setDashBoardCommonCard((prev) => {
        return { ...prev, courseProposal: courseProposalDashBoard ?? [] };
      });
    }
    // ** Handle-CourseProposal-Data **
  }, [response, trainerFees, certificates, courseProposalRes]);

  return (
    <>
      <Tiles dashboardData={dashboardData} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-7 mb-7 last:mb-0">
        <Course
          title={t('Dashboard.courses.title')}
          countOfVisitors={formatCount(
            Number(dashboardData?.total_participants_top_five)
          )}
          courses={dashboardData?.popular_courses}
          isCourseLoading={isCourseLoading}
        />
        {/* Reports */}
        <Reports />

        {ROLES.Admin === user?.role_name && (
          <>
            {/* Trainer Fees Card */}
            <DashboardCustomCard
              title={t('Dashboard.courses.trainerFeesTitle')}
              columnHead={t('Dashboard.courses.profitPercentage')}
              courses={dashBoardCommonCard.trainerFeesData}
              isLoading={isTrainerFeesLoading}
            />
            {/* Certificates Card */}
            <DashboardCustomCard
              title={t('Dashboard.courses.certificateTitle')}
              courses={dashBoardCommonCard.certificatesData}
              isLoading={isCertificateLoading}
              // isImage={false}
            />
            {/* Course Proposal Card */}
            <DashboardCustomCard
              title={t('Dashboard.courses.courseProposalTitle')}
              courses={dashBoardCommonCard.courseProposal}
              cardType="courseProposal"
              isImage={false}
              isLoading={isCourseProposeLoading}
            />
          </>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
