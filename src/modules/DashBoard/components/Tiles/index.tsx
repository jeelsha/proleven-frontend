import { DashboardCard } from 'components/DashboardCard';
import { ROLES } from 'constants/roleAndPermission.constant';
import 'modules/DashBoard/components/style/dashboard.css';
import {
  ICompanyManagerDashboard,
  IDashboard,
  IPrivateIndividualDashboard,
  TilesProps,
} from 'modules/DashBoard/types';
import { useTranslation } from 'react-i18next';
import { Rating } from 'react-simple-star-rating';
import { AuthUserType } from 'redux-toolkit/slices/authSlice';
import { customRandomNumberGenerator, formatCount } from 'utils';
import { ITrainerDashboardData } from '../TrainerDashboard';

type tilesProp = {
  dashboardData?: IDashboard;
  trainerDashboardData?: ITrainerDashboardData;
  managerDashBoardData?: ICompanyManagerDashboard;
  privateIndividualDashboardData?: IPrivateIndividualDashboard;
  user?: AuthUserType | null;
  totalRating?: string;
};

const ratingRender = (rate: string) => {
  return (
    <div className="flex flex-col">
      <div className="text-3xl 2xl:text-4xl text-dark font-bold cursor-default ">
        {rate}
        <span className="text-base leading mt-2.5 text-dark font-medium">/5</span>
      </div>
      <Rating
        size={25}
        initialValue={Number(rate)}
        transition
        readonly
        allowFraction
        SVGstyle={{ display: 'inline' }}
      />
    </div>
  );
};

export const Tiles = ({
  dashboardData,
  trainerDashboardData,
  managerDashBoardData,
  privateIndividualDashboardData,
  user,
  totalRating,
}: tilesProp) => {
  const { t } = useTranslation();

  const tileDataArray = () => {
    let tilesProps;

    switch (user?.role_name) {
      case ROLES.Trainer:
        tilesProps = [
          {
            title: `${t('companyManagerDashboard.totalCourses')}`,
            counts: formatCount(Number(trainerDashboardData?.total_courses ?? 0)),
            colorVariant: 'pink',
            iconName: 'pencilLineStrokeSD',
          },
          {
            title: `${t('totalRating')}`,
            rating: ratingRender(totalRating ?? '0'),
            colorVariant: 'orange',
            iconName: 'yellowStarIcon',
          },
          {
            title: `${t('videoTutorial')}`,
            colorVariant: 'green',
            iconName: 'arrowRight',
            cardTitle: 'Tutorial',
          },
        ];
        break;

      case ROLES.CompanyManager:
        tilesProps = [
          {
            title: `${t('companyManagerDashboard.totalCourses')}`,
            counts: formatCount(Number(managerDashBoardData?.total_course ?? 0)),
            colorVariant: 'green',
            iconName: 'pencilLineStrokeSD',
            url: '/manager/my-courses',
          },
          {
            title: `${t('companyManagerDashboard.totalAttendees')}`,
            counts: formatCount(Number(managerDashBoardData?.total_attendees ?? 0)),
            colorVariant: 'orange',
            iconName: 'userRoundStrokeSD',
            url: '/attendee',
          },
          {
            title: `${t('companyManagerDashboard.activeCourses')}`,
            counts: formatCount(Number(managerDashBoardData?.active_courses ?? 0)),
            colorVariant: 'purple',
            iconName: 'pencilLineStrokeSD',
            url: '/manager/my-courses',
          },
          {
            title: `${t('videoTutorial')}`,
            colorVariant: 'green',
            iconName: 'arrowRight',
            cardTitle: 'Tutorial',
          },
        ];
        break;

      case ROLES.PrivateIndividual:
        tilesProps = [
          {
            title: `${t('Dashboard.tiles.totalAcademyCourse')}`,
            counts: formatCount(
              Number(privateIndividualDashboardData?.total_academy_course ?? 0)
            ),
            colorVariant: 'green',
            iconName: 'pencilLineStrokeSD',
          },
          {
            title: `${t('Dashboard.tiles.totalEnrollCourse')}`,
            counts: formatCount(
              Number(privateIndividualDashboardData?.total_enrolled_course ?? 0)
            ),
            colorVariant: 'orange',
            iconName: 'pencilLineStrokeSD',
          },
        ];
        break;

      default:
        tilesProps = [
          {
            title: `${t('Dashboard.tiles.tileTitle1')}`,
            counts: formatCount(Number(dashboardData?.training_specialist ?? 0)),
            colorVariant: 'green',
            iconName: 'userRoundStrokeSD',
          },
          {
            title: `${t('Dashboard.tiles.tileTitle2')}`,
            counts: formatCount(Number(dashboardData?.trainer ?? 0)),
            colorVariant: 'orange',
            iconName: 'userRoundStrokeSD',
          },
          {
            title: `${t('Dashboard.tiles.tileTitle3')}`,
            counts: formatCount(Number(dashboardData?.courses ?? 0)),
            colorVariant: 'purple',
            iconName: 'pencilLineStrokeSD',
          },
          {
            title: `${t('Dashboard.tiles.tileTitle4')}`,
            counts: formatCount(Number(dashboardData?.users ?? 0)),
            colorVariant: 'blue',
            iconName: 'userGroupStrokeSD',
          },
        ];
    }

    return tilesProps as TilesProps[];
  };
  const tilesData: TilesProps[] = tileDataArray();
  return (
    <div
      className={`tiles-container ${
        ROLES.CompanyManager === user?.role_name ? '!gap-[1rem]' : ''
      }`}
    >
      {tilesData?.map((tileData) => (
        <DashboardCard
          className={trainerDashboardData ? '' : ''}
          key={customRandomNumberGenerator()}
          title={tileData.title}
          counts={tileData.counts}
          colorVariant={tileData.colorVariant}
          iconName={tileData.iconName}
          StarRating={tileData.rating}
          url={tileData.url}
          cardTitle={tileData?.cardTitle}
        />
      ))}
    </div>
  );
};
