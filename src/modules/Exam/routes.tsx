// ** React Imports **
import React, { Suspense } from 'react';

// ** component  **
import PageLoader from 'components/Loaders/PageLoader';

// ** Constant **
import { EXAM_NAVIGATION } from 'constants/navigation.constant';

// ** routes **
import ErrorBoundary from 'modules/Auth/pages/ErrorBoundary';
import { ErrorBoundary as ErrorBoundaryDependency } from 'react-error-boundary';
import { RouteObjType } from 'routes';

// ** Not Authenticate Pages **
const ExamForm = React.lazy(() => import('modules/Exam/ExamForm'));
const ExamParticipant = React.lazy(() => import('modules/Exam/ExamParticipant'));

const SurveyDetails = React.lazy(
  () => import('modules/Exam/ExamSurvey/SurveyDetails')
);
const SubmittingExam = React.lazy(() => import('modules/Exam/SubmittingExam'));
const SurveyParticipantForm = React.lazy(
  () => import('modules/Courses/components/SurveyModal/SurveyParticipate')
);

const applySuspense = (routes: RouteObjType[]): RouteObjType[] => {
  return routes.map((route) => ({
    ...route,
    element: (
      <ErrorBoundaryDependency FallbackComponent={ErrorBoundary}>
        <Suspense
          fallback={<PageLoader pageLoaderWrapperClassName="!h-full !w-full" />}
        >
          {route.element}
        </Suspense>
      </ErrorBoundaryDependency>
    ),
  }));
};

const ExamRoutes = applySuspense([
  {
    path: EXAM_NAVIGATION.exam,
    element: <ExamParticipant />,
  },
  {
    path: EXAM_NAVIGATION.examRetest,
    element: <ExamParticipant />,
  },
  {
    path: EXAM_NAVIGATION.examForm,
    element: <ExamForm />,
  },
  {
    path: EXAM_NAVIGATION.examSurvey,
    element: <SurveyDetails />,
  },
  {
    path: EXAM_NAVIGATION.survey,
    element: <SurveyDetails />,
  },
  {
    path: EXAM_NAVIGATION.examSubmit,
    element: <SubmittingExam />,
  },
  {
    path: EXAM_NAVIGATION.surveyParticipants,
    element: <SurveyParticipantForm />,
  },
]);

export default ExamRoutes;
