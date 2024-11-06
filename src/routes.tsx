// ** Packages **
import React, { Suspense, useEffect } from 'react';
import { RouteObject, RouterProvider, createBrowserRouter } from 'react-router-dom';

// ** Constants **
import {
  PRIVATE_NAVIGATION,
  PUBLIC_NAVIGATION,
} from 'constants/navigation.constant';

// ** Non-Lazy Imports **

// ** Auth Routes
import RequiresAuth from 'modules/Auth/components/RequiresAuth';
import AuthenticationRoutes from 'modules/Auth/routes';

// ** Setting Routes

import PageLoader from 'components/Loaders/PageLoader';
import HandleAuth from 'modules/Auth/components/FuttureInCloud/HandleAuth';

import Loaders from 'components/Loaders';
import { languageConstant } from 'constants/common.constant';
import { getCountriesJsonAPI, getLanguagesHook } from 'hooks/useCommonData';
import { useRolePermission } from 'hooks/useRolePermission';
import { getActiveUserDataApi } from 'modules/Auth/services';
import SurveyTab from 'modules/Courses/pages/SurveyTemplate/SurveyTab';
import AddCreditNote from 'modules/CreditNotes/AddCreditNote';
import ExamRoutes from 'modules/Exam/routes';
import CreateInvoice from 'modules/Invoice/components/CreateInvoice';
import { ViewInvoice } from 'modules/Invoice/components/ViewInvoice';
import { ViewOrder } from 'modules/Order/components/ViewOrder';
import QuoteProducts from 'modules/QuoteProducts';
import ViewLogs from 'modules/QuoteProducts/components/ViewLogs';
import { SystemLog } from 'modules/SystemLog';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
// import { setDefaultTitle } from 'redux-toolkit/slices/documentTitleSlice';
import SurveyCode from 'modules/Courses/pages/SurveyCode';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import { currentPageCount } from 'redux-toolkit/slices/paginationSlice';
import { clearScroll } from 'redux-toolkit/slices/pipelineScrollSlice';
import { getRoles } from 'redux-toolkit/slices/rolePermissionSlice';
import { ActiveSelector } from 'redux-toolkit/slices/sidebarSlice';
import { getAuthToken } from 'redux-toolkit/slices/tokenSlice';
import { RootStateType } from 'redux-toolkit/store';
import { convertRoleToUrl } from 'utils';

const applySuspense = (routes: RouteObjType[]): RouteObjType[] => {
  return routes.map((route) => ({
    ...route,
    element: <Suspense fallback={<PageLoader />}>{route.element}</Suspense>,
  }));
};

// ** Auth Routes
const RequiresUnAuth = React.lazy(
  () => import('modules/Auth/components/RequiresUnAuth')
);

// ** Not-Found Routes
const NotFound = React.lazy(() => import('modules/Auth/pages/NotFound'));

// ** Dashboard Routes
const Dashboard = React.lazy(() => import('modules/DashBoard'));
const UsersManagement = React.lazy(() => import('modules/UsersManagement'));
const Courses = React.lazy(() => import('modules/Courses'));
const AttendeeViewDetail = React.lazy(
  () => import('modules/CompanyManager/components/attendees/AttendeeViewDetail')
);
const CourseDetails = React.lazy(
  () => import('modules/CompanyManager/components/CourseDetails')
);
const MyCoursesDetails = React.lazy(
  () => import('modules/CompanyManager/components/MyCoursesDetails')
);
const ManagerCourses = React.lazy(
  () => import('modules/CompanyManager/pages/ManagerCourses')
);

const Quotes = React.lazy(() => import('modules/Quotes'));
const Invoice = React.lazy(() => import('modules/Invoice'));
const OrderListing = React.lazy(() => import('modules/Order'));

const ViewQuote = React.lazy(() => import('modules/Quotes/components/ViewQuote'));

const AddEditQuote = React.lazy(
  () => import('modules/Quotes/components/AddEditQuote')
);

const MyCourses = React.lazy(() => import('modules/CompanyManager/pages/MyCourses'));

const MemberTabList = React.lazy(
  () => import('modules/Client/components/PrivateMembers/TabView')
);

const CourseCategory = React.lazy(
  () => import('modules/Courses/pages/Category/viewCategory')
);

const CourseResources = React.lazy(
  () => import('modules/Courses/pages/Resources/CourseResources')
);
const AddEditCourse = React.lazy(
  () => import('modules/Courses/pages/Management/AddEditCourse')
);
const AddCourseBundle = React.lazy(
  () => import('modules/Courses/components/CourseBundle/AddCourseBundle')
);

const CourseTemplate = React.lazy(
  () => import('modules/Courses/pages/Templates/TemplateTab')
);
const CourseBundleTab = React.lazy(
  () => import('modules/Courses/pages/CourseBundleTab')
);

const TemplateBundle = React.lazy(
  () => import('modules/Courses/pages/TemplateBundle')
);
const ViewTemplateBundleTab = React.lazy(
  () => import('modules/Courses/pages/TemplateBundle/ViewTemplateBundleTab')
);
const ViewCourseBundle = React.lazy(
  () => import('modules/Courses/components/CourseBundle/CourseBundleTab')
);
const TrainerViewCourseBundle = React.lazy(
  () => import('modules/Courses/components/CourseBundle/ViewCourseBundle')
);
const AddEditTemplate = React.lazy(
  () => import('modules/Courses/pages/Templates/AddEditTemplate')
);
const UsersInfo = React.lazy(() => import('modules/UsersManagement/Components/Tab'));
const EmailTemplate = React.lazy(() => import('modules/EmailTemplate'));
const SendMailListing = React.lazy(() => import('modules/SendMail'));
const ClientsManagement = React.lazy(() => import('modules/Client/pages/Company'));
const ClientManagers = React.lazy(() => import('modules/Client/pages/Managers'));
const AddEditCompany = React.lazy(
  () => import('modules/Client/components/Company/AddEditCompany')
);
const PrivateMembers = React.lazy(
  () => import('modules/Client/pages/PrivateMembers')
);
const CompanyTabList = React.lazy(
  () => import('modules/Client/components/Company/TabView')
);
const ManagerTabList = React.lazy(
  () => import('modules/Client/components/Managers/TabView')
);
const AttendanceSheet = React.lazy(() => import('modules/Courses/pages/Attendance'));
const InPersonAttendee = React.lazy(
  () => import('modules/Courses/pages/Attendance/SessionWiseAttendance')
);

const MainAttendance = React.lazy(
  () => import('modules/Courses/pages/Attendance/MainAttendance')
);
const AttendeeExamResult = React.lazy(
  () => import('modules/Courses/pages/AttendeeExamResult')
);
const AttendeeTabView = React.lazy(
  () => import('modules/Courses/components/AttendeeExamResult/AttendeeTabView')
);
const CourseParticipate = React.lazy(
  () => import('modules/Courses/components/AttendeeExamResult/CourseParticipate')
);

// ** Chat route **
const Chat = React.lazy(() => import('modules/Chat'));

// ** Project management route**
const ProjectManagement = React.lazy(
  () => import('modules/ProjectManagement_module')
);
const ProjectManagementDetail = React.lazy(
  () => import('modules/ProjectManagement_module/Details')
);
const CoursePipeline = React.lazy(
  () => import('modules/ProjectManagement_module/CoursePipeline')
);

const InvitationTab = React.lazy(
  () => import('modules/DashBoard/components/InvitationTab/InvitationTab')
);

const AllInvitations = React.lazy(
  () => import('modules/DashBoard/components/CourseInvitation/AllInvitations')
);
const ViewCourse = React.lazy(() => import('modules/Courses/pages/ViewCourse'));
const ViewCourseIndex = React.lazy(
  () => import('modules/Courses/pages/CourseViewDetail')
);
const CompanyParticipantAttendance = React.lazy(
  () => import('modules/Courses/pages/CompanyParticipantAttendance')
);
const AttendanceTimeSheet = React.lazy(
  () => import('modules/Courses/pages/AttendanceTimeSheet')
);
const CourseIndex = React.lazy(() => import('modules/Courses/pages/CourseTab'));
const CourseCompanyList = React.lazy(
  () => import('modules/Courses/pages/CourseCompany')
);
const CourseRoom = React.lazy(
  () => import('modules/Courses/pages/CourseRoom/index')
);

const AddRequestCourses = React.lazy(
  () => import('modules/CompanyManager/pages/AddRequestCourse')
);
const MyRequestedCourses = React.lazy(
  () => import('modules/CompanyManager/pages/RequestCourses')
);
const ClientAttendeeTab = React.lazy(
  () => import('modules/CompanyManager/components/attendees/ClientAttendeeTab')
);
// ** sales reps course request **
const CourseRequest = React.lazy(
  () => import('modules/SalesRep/SalesCourseRequest')
);

const AddEditSurvey = React.lazy(
  () => import('modules/Courses/components/SurveyTemplate/AddEditSurvey')
);

const SurveyTemplate = React.lazy(
  () => import('modules/Courses/pages/SurveyTemplate')
);
const CertificateTemplate = React.lazy(
  () => import('modules/CertificateTemplate/index')
);
const VersionListing = React.lazy(
  () => import('modules/CertificateTemplate/VersionListing')
);
const AddCertificateForm = React.lazy(
  () => import('modules/CertificateTemplate/components/AddCertificateForm')
);

const PaymentTerms = React.lazy(() => import('modules/PaymentTerms/index'));

const Expense = React.lazy(() => import('modules/Expense/index'));

const ExpenseUpdate = React.lazy(
  () => import('modules/Expense/components/expenseUpdate')
);

const Sectors = React.lazy(() => import('modules/Sectors/index'));

// ** Codes Route
const Codes = React.lazy(() => import('modules/Codes'));

// ** Ateco Codes Route
const AtecoCodes = React.lazy(() => import('modules/AtecoCodes'));

// Routes

const RequiresTrainerAuth = React.lazy(
  () => import('modules/Auth/components/RequiresTrainerAuth')
);
const RegisterTrainer = React.lazy(
  () => import('modules/Auth/pages/TrainerRegister')
);
const Calendar = React.lazy(() => import('modules/Calendar'));
const TrackCourse = React.lazy(
  () => import('modules/CompanyManager/pages/TrackCourse')
);
const AttendeeList = React.lazy(
  () => import('modules/CompanyManager/components/AttendeeList')
);
const Notifications = React.lazy(() => import('modules/Notifications'));
const AccountIndex = React.lazy(() => import('modules/Profile/AccountSettings'));
const ViewProfile = React.lazy(() => import('modules/Profile/ViewProfile'));
const ProjectManagementDetails = React.lazy(
  () => import('modules/ProjectManagement/details')
);
const SalesCourseRequest = React.lazy(
  () => import('modules/SalesRep/SalesCourseRequest')
);
const TrainerInvoiceList = React.lazy(() => import('modules/TrainerInvoice'));
const CurrentMonthInvoice = React.lazy(
  () => import('modules/TrainerInvoice/pages/CurrentMonthOrder')
);
const PreviousMonthInvoice = React.lazy(
  () => import('modules/TrainerInvoice/pages/PreviousMonthOrder')
);

const CreditNotes = React.lazy(() => import('modules/CreditNotes/index'));

// ** Reports**
const Reports = React.lazy(() => import('modules/Reports'));

// ** Profiles Routes
const Profiles = React.lazy(() => import('modules/Profiles'));

// ** Contact us form listing
const ContactUsFormListing = React.lazy(() => import('modules/ContactUsFormData'));

// ** Types **
export type RouteObjType = {
  path?: string;
  element: JSX.Element;
  children?: RouteObject[];
  errorElement?: JSX.Element;
  feature?: string;
  permission?: string;
};

export const applyRequiresAuth = (routes: RouteObjType[]): RouteObjType[] => {
  return routes.map((route) => ({
    ...route,
    element: <RequiresAuth>{route.element}</RequiresAuth>,
  }));
};

const RolesDynamicRoutes = () => {
  const allRoles = useSelector(getRoles);
  return allRoles?.length > 0
    ? allRoles.map((data) => {
        return {
          path: `${
            PRIVATE_NAVIGATION.usersManagement.view.roleView.path
          }${convertRoleToUrl(data.name)}/:slug`,
          element: <UsersInfo />,
        };
      })
    : [];
};

const Routes = () => {
  const authData = useSelector((state: RootStateType) => state.auth);
  const { i18n } = useTranslation();
  const { getLanguages, isLoading: isLanguageLoading } = getLanguagesHook();
  const { getCountriesJson, isLoading: isCountryLoading } = getCountriesJsonAPI();
  const { getActiveUser, isLoading: isAcitveUserLoading } = getActiveUserDataApi();
  const storeLang = useSelector(useLanguage);
  const { token } = useSelector(getAuthToken);
  const activeSideBar = useSelector(ActiveSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(currentPageCount({ currentPage: 1 }));
    dispatch(clearScroll());
  }, [activeSideBar]);
  const { isAuthenticated } = authData;

  useEffect(() => {
    if (!window.location.href.includes(PUBLIC_NAVIGATION.somethingWentWrong)) {
      getUserData();
      getLanguages();
    }
  }, []);

  useEffect(() => {
    if (!window.location.href.includes(PUBLIC_NAVIGATION.somethingWentWrong)) {
      loadLanguage();
      getCountriesJson();
    }
  }, [storeLang.language, i18n]);

  const loadLanguage = async () => {
    try {
      if (storeLang?.allLanguages && storeLang?.defaultLanguage) {
        await Promise.all(
          storeLang?.allLanguages?.map(
            async (element: { name: string; short_name: string }) => {
              const translationModule = await import(
                `localization/${element?.name}/translation.json`
              );
              i18n.addResourceBundle(
                element?.short_name,
                'translation',
                translationModule,
                true,
                true
              );
            }
          )
        );
      } else {
        const translationModule = await import(
          'localization/italian/translation.json'
        );
        i18n.addResourceBundle(
          languageConstant.it,
          'translation',
          translationModule,
          true,
          true
        );
      }
      await i18n.changeLanguage(
        storeLang.language ?? storeLang?.defaultLanguage ?? languageConstant.it
      );
    } catch (error) {
      // handle error
    }
  };

  const getUserData = async () => {
    if (
      token &&
      !isAuthenticated &&
      !window.location.href.includes(PUBLIC_NAVIGATION.somethingWentWrong)
    ) {
      await getActiveUser();
    }
  };

  // ** Not Logged In **
  if (
    !window.location.pathname.includes('/exam/') &&
    !window.location.pathname.includes('/survey/')
  ) {
    if (
      !isAuthenticated &&
      token == null &&
      ![...Object.values(PUBLIC_NAVIGATION)].includes(window.location.pathname)
    ) {
      window.location.pathname = PUBLIC_NAVIGATION.login;
    }
  }
  // ** Un-Auth
  const routesForNotAuthenticatedOnly: RouteObjType[] = applySuspense([
    {
      element: <RequiresUnAuth />,
      children: AuthenticationRoutes,
    },
  ]);

  const examRoutesForNotAuthenticatedOnly: RouteObjType[] = applySuspense([
    {
      element: <RequiresUnAuth />,
      children: ExamRoutes,
    },
  ]);

  const routesForProfileSetup: RouteObjType[] = applySuspense([
    {
      element: <RequiresTrainerAuth />,
      children: [
        {
          path: PRIVATE_NAVIGATION.trainerRegister.view.path,
          element: <RegisterTrainer />,
        },
      ],
    },
  ]);
  const routesForAuthenticatedOnly: RouteObjType[] = applyRequiresAuth([
    {
      path: PRIVATE_NAVIGATION.notFoundPage,
      element: <NotFound />,
    },
    {
      path: PRIVATE_NAVIGATION.dashboard.view.path,
      element: <Dashboard />,
    },
    {
      path: PRIVATE_NAVIGATION.usersManagement.view.navigationView.path,
      element: <UsersManagement />,
      feature: PRIVATE_NAVIGATION.usersManagement.view.navigationView.feature,
      permission: PRIVATE_NAVIGATION.usersManagement.view.navigationView.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.view.path,
      element: <Courses />,
      feature: PRIVATE_NAVIGATION.coursesManagement.view.feature,
      permission: PRIVATE_NAVIGATION.coursesManagement.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.navigationView.path,
      element: <CourseCategory />,
      feature: PRIVATE_NAVIGATION.coursesManagement.navigationView.feature,
      permission: PRIVATE_NAVIGATION.coursesManagement.navigationView.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.resources.path,
      element: <CourseResources />,
      feature: PRIVATE_NAVIGATION.coursesManagement.resources.feature,
      permission: PRIVATE_NAVIGATION.coursesManagement.resources.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.courseManagement.path,
      element: <CourseIndex />,
      feature: PRIVATE_NAVIGATION.coursesManagement.courseManagement.feature,
      permission: PRIVATE_NAVIGATION.coursesManagement.courseManagement.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.addCourse.path,
      element: <AddEditCourse />,
      feature: PRIVATE_NAVIGATION.coursesManagement.addCourse.feature,
      permission: PRIVATE_NAVIGATION.coursesManagement.addCourse.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.courseTemplates.path,
      element: <CourseTemplate />,
      feature: PRIVATE_NAVIGATION.coursesManagement.courseTemplates.feature,
      permission: PRIVATE_NAVIGATION.coursesManagement.courseTemplates.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.addCourseTemplates.path,
      element: <AddEditTemplate />,
      feature: PRIVATE_NAVIGATION.coursesManagement.addCourseTemplates.feature,
      permission: PRIVATE_NAVIGATION.coursesManagement.addCourseTemplates.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.courseBundle.path,
      element: <CourseBundleTab />,
      feature: PRIVATE_NAVIGATION.coursesManagement.courseBundle.feature,
      permission: PRIVATE_NAVIGATION.coursesManagement.courseBundle.permission,
    },
    {
      path: PRIVATE_NAVIGATION.trainerBundleView.view.path,
      element: <TrainerViewCourseBundle />,
      feature: PRIVATE_NAVIGATION.trainerBundleView.view.feature,
      permission: PRIVATE_NAVIGATION.trainerBundleView.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.templateBundle.path,
      element: <TemplateBundle />,
      feature: PRIVATE_NAVIGATION.coursesManagement.templateBundle.feature,
      permission: PRIVATE_NAVIGATION.coursesManagement.templateBundle.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.addCourseBundle.path,
      element: <AddCourseBundle />,
      feature: PRIVATE_NAVIGATION.coursesManagement.addCourseBundle.feature,
      permission: PRIVATE_NAVIGATION.coursesManagement.addCourseBundle.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.viewCourseBundle.path,
      element: <ViewCourseBundle />,
      feature: PRIVATE_NAVIGATION.coursesManagement.viewCourseBundle.feature,
      permission: PRIVATE_NAVIGATION.coursesManagement.viewCourseBundle.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.viewTemplateBundle.path,
      element: <ViewTemplateBundleTab />,
      feature: PRIVATE_NAVIGATION.coursesManagement.viewTemplateBundle.feature,
      permission: PRIVATE_NAVIGATION.coursesManagement.viewTemplateBundle.permission,
    },
    {
      path: PRIVATE_NAVIGATION.clientsManagement.company.list.path,
      element: <ClientsManagement />,
      feature: PRIVATE_NAVIGATION.clientsManagement.company.list.feature,
      permission: PRIVATE_NAVIGATION.clientsManagement.company.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.clientsManagement.company.add.path,
      element: <AddEditCompany />,
      feature: PRIVATE_NAVIGATION.clientsManagement.company.add.feature,
      permission: PRIVATE_NAVIGATION.clientsManagement.company.add.permission,
    },
    {
      path: PRIVATE_NAVIGATION.clientsManagement.company.edit.path,
      element: <AddEditCompany />,
      feature: PRIVATE_NAVIGATION.clientsManagement.company.edit.feature,
      permission: PRIVATE_NAVIGATION.clientsManagement.company.edit.permission,
    },
    {
      path: PRIVATE_NAVIGATION.clientsManagement.company.view.path,
      element: <CompanyTabList />,
      feature: PRIVATE_NAVIGATION.clientsManagement.company.view.feature,
      permission: PRIVATE_NAVIGATION.clientsManagement.company.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.clientsManagement.managers.list.path,
      element: <ClientManagers />,
      feature: PRIVATE_NAVIGATION.clientsManagement.managers.list.feature,
      permission: PRIVATE_NAVIGATION.clientsManagement.managers.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.clientsManagement.managers.view.path,
      element: <ManagerTabList />,
      feature: PRIVATE_NAVIGATION.clientsManagement.managers.view.feature,
      permission: PRIVATE_NAVIGATION.clientsManagement.managers.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.clientsManagement.members.list.path,
      element: <PrivateMembers />,
      feature: PRIVATE_NAVIGATION.clientsManagement.members.list.feature,
      permission: PRIVATE_NAVIGATION.clientsManagement.members.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.clientsManagement.members.view.path,
      element: <MemberTabList />,
      feature: PRIVATE_NAVIGATION.clientsManagement.members.view.feature,
      permission: PRIVATE_NAVIGATION.clientsManagement.members.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.chat.view.path,
      element: <Chat />,
      feature: PRIVATE_NAVIGATION.chat.view.feature,
      permission: PRIVATE_NAVIGATION.chat.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.notifications.view.path,
      element: <Notifications />,
      feature: PRIVATE_NAVIGATION.notifications.view.feature,
      permission: PRIVATE_NAVIGATION.notifications.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.sendMails.view.path,
      element: <SendMailListing />,
      feature: PRIVATE_NAVIGATION.sendMails.view.feature,
      permission: PRIVATE_NAVIGATION.sendMails.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.emailTemplates.view.path,
      element: <EmailTemplate />,
      feature: PRIVATE_NAVIGATION.emailTemplates.view.feature,
      permission: PRIVATE_NAVIGATION.emailTemplates.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.projectManagementStatic.view.path,
      element: <ProjectManagementDetails />,
      feature: PRIVATE_NAVIGATION.projectManagementStatic.view.feature,
      permission: PRIVATE_NAVIGATION.projectManagementStatic.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.projectManagement.view.path,
      element: <ProjectManagement />,
      feature: PRIVATE_NAVIGATION.projectManagement.view.feature,
      permission: PRIVATE_NAVIGATION.projectManagement.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.projectManagementDetails.view.path,
      element: <ProjectManagementDetail />,
      feature: PRIVATE_NAVIGATION.projectManagementDetails.view.feature,
      permission: PRIVATE_NAVIGATION.projectManagementDetails.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.userProfile.viewProfile.path,
      element: <ViewProfile />,
      feature: PRIVATE_NAVIGATION.userProfile.viewProfile.feature,
      permission: PRIVATE_NAVIGATION.userProfile.viewProfile.permission,
    },
    {
      path: PRIVATE_NAVIGATION.userProfile.accountSettings.path,
      element: <AccountIndex />,
      feature: PRIVATE_NAVIGATION.userProfile.accountSettings.feature,
      permission: PRIVATE_NAVIGATION.userProfile.accountSettings.permission,
    },
    {
      path: PRIVATE_NAVIGATION.calendar.view.path,
      element: <Calendar />,
      feature: PRIVATE_NAVIGATION.calendar.view.feature,
      permission: PRIVATE_NAVIGATION.calendar.view.permission,
    },

    {
      path: PRIVATE_NAVIGATION.userProfile.viewProfile.path,
      element: <ViewProfile />,
      feature: PRIVATE_NAVIGATION.userProfile.viewProfile.feature,
      permission: PRIVATE_NAVIGATION.userProfile.viewProfile.permission,
    },
    {
      path: PRIVATE_NAVIGATION.userProfile.accountSettings.path,
      element: <AccountIndex />,
      feature: PRIVATE_NAVIGATION.userProfile.accountSettings.feature,
      permission: PRIVATE_NAVIGATION.userProfile.accountSettings.permission,
    },
    {
      path: PRIVATE_NAVIGATION.quotes.list.path,
      element: <Quotes />,
      feature: PRIVATE_NAVIGATION.quotes.list.feature,
      permission: PRIVATE_NAVIGATION.quotes.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.quotes.add.path,
      element: <AddEditQuote />,
      feature: PRIVATE_NAVIGATION.quotes.add.feature,
      permission: PRIVATE_NAVIGATION.quotes.add.permission,
    },
    {
      path: PRIVATE_NAVIGATION.quotes.edit.path,
      element: <AddEditQuote />,
      feature: PRIVATE_NAVIGATION.quotes.edit.feature,
      permission: PRIVATE_NAVIGATION.quotes.edit.permission,
    },
    {
      path: PRIVATE_NAVIGATION.quotes.clone.path,
      element: <AddEditQuote />,
      feature: PRIVATE_NAVIGATION.quotes.clone.feature,
      permission: PRIVATE_NAVIGATION.quotes.clone.permission,
    },
    {
      path: PRIVATE_NAVIGATION.quotes.view.path,
      element: <ViewQuote />,
      feature: PRIVATE_NAVIGATION.quotes.view.feature,
      permission: PRIVATE_NAVIGATION.quotes.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.companyManager.courses.list.path,
      element: <ManagerCourses />,
      feature: PRIVATE_NAVIGATION.companyManager.courses.list.feature,
      permission: PRIVATE_NAVIGATION.companyManager.courses.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.privateIndividual.courses.list.path,
      element: <ManagerCourses />,
      feature: PRIVATE_NAVIGATION.privateIndividual.courses.list.feature,
      permission: PRIVATE_NAVIGATION.privateIndividual.courses.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.companyManager.myCourses.list.path,
      element: <MyCourses />,
      feature: PRIVATE_NAVIGATION.companyManager.myCourses.list.feature,
      permission: PRIVATE_NAVIGATION.companyManager.myCourses.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.privateIndividual.myCourses.list.path,
      element: <MyCourses />,
      feature: PRIVATE_NAVIGATION.privateIndividual.myCourses.list.feature,
      permission: PRIVATE_NAVIGATION.privateIndividual.myCourses.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.companyManager.coursdetails.list.path,
      element: <CourseDetails />,
      feature: PRIVATE_NAVIGATION.companyManager.coursdetails.list.feature,
      permission: PRIVATE_NAVIGATION.companyManager.coursdetails.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.privateIndividual.coursdetails.list.path,
      element: <CourseDetails />,
      feature: PRIVATE_NAVIGATION.privateIndividual.coursdetails.list.feature,
      permission: PRIVATE_NAVIGATION.privateIndividual.coursdetails.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.companyManager.attendeeDetails.view.path,
      element: <AttendeeViewDetail />,
      feature: PRIVATE_NAVIGATION.companyManager.attendeeDetails.view.feature,
      permission: PRIVATE_NAVIGATION.companyManager.attendeeDetails.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.companyManager.myCoursesDetails.list.path,
      element: <MyCoursesDetails />,
      feature: PRIVATE_NAVIGATION.companyManager.myCoursesDetails.list.feature,
      permission: PRIVATE_NAVIGATION.companyManager.myCoursesDetails.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.privateIndividual.myCoursesDetails.list.path,
      element: <MyCoursesDetails />,
      feature: PRIVATE_NAVIGATION.companyManager.myCoursesDetails.list.feature,
      permission: PRIVATE_NAVIGATION.companyManager.myCoursesDetails.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.companyManager.trackCourse.list.path,
      element: <TrackCourse />,
      feature: PRIVATE_NAVIGATION.companyManager.trackCourse.list.feature,
      permission: PRIVATE_NAVIGATION.companyManager.trackCourse.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.companyManager.requestCourse.list.path,
      element: <SalesCourseRequest />,
      feature: PRIVATE_NAVIGATION.companyManager.requestCourse.list.feature,
      permission: PRIVATE_NAVIGATION.companyManager.requestCourse.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.companyManager.requestCourse.add.path,
      element: <AddRequestCourses />,
      feature: PRIVATE_NAVIGATION.companyManager.requestCourse.add.feature,
      permission: PRIVATE_NAVIGATION.companyManager.requestCourse.add.permission,
    },
    {
      path: PRIVATE_NAVIGATION.companyManager.requestCourse.requestedCourses.path,
      element: <MyRequestedCourses />,
      feature:
        PRIVATE_NAVIGATION.companyManager.requestCourse.requestedCourses.feature,
      permission:
        PRIVATE_NAVIGATION.companyManager.requestCourse.requestedCourses.permission,
    },
    {
      path: PRIVATE_NAVIGATION.companyManager.calendar.view.path,
      element: <Calendar />,
      feature: PRIVATE_NAVIGATION.companyManager.calendar.view.feature,
      permission: PRIVATE_NAVIGATION.companyManager.calendar.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.privateIndividual.calendar.view.path,
      element: <Calendar />,
      feature: PRIVATE_NAVIGATION.privateIndividual.calendar.view.feature,
      permission: PRIVATE_NAVIGATION.privateIndividual.calendar.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.projectManagementStatic.view.path,
      element: <ProjectManagementDetails />,
      feature: PRIVATE_NAVIGATION.projectManagementStatic.view.feature,
      permission: PRIVATE_NAVIGATION.projectManagementStatic.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursePipeline.view.path,
      element: <CoursePipeline />,
      feature: PRIVATE_NAVIGATION.coursePipeline.view.feature,
      permission: PRIVATE_NAVIGATION.coursePipeline.view.permission,
    },

    {
      path: PRIVATE_NAVIGATION.codes.view.path,
      element: <Codes />,
      feature: PRIVATE_NAVIGATION.codes.view.feature,
      permission: PRIVATE_NAVIGATION.codes.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.profiles.view.path,
      element: <Profiles />,
      feature: PRIVATE_NAVIGATION.profiles.view.feature,
      permission: PRIVATE_NAVIGATION.profiles.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.contactUsForm.view.path,
      element: <ContactUsFormListing />,
      feature: PRIVATE_NAVIGATION.contactUsForm.view.feature,
      permission: PRIVATE_NAVIGATION.contactUsForm.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.atecoCodes.view.path,
      element: <AtecoCodes />,
      feature: PRIVATE_NAVIGATION.atecoCodes.view.feature,
      permission: PRIVATE_NAVIGATION.atecoCodes.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.trainerCourses.view.path,
      element: <CourseIndex />,
      feature: PRIVATE_NAVIGATION.trainerCourses.view.feature,
      permission: PRIVATE_NAVIGATION.trainerCourses.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.trainerCourses.surveyView.path,
      element: <SurveyCode />,
      feature: PRIVATE_NAVIGATION.trainerCourses.surveyView.feature,
      permission: PRIVATE_NAVIGATION.trainerCourses.surveyView.permission,
    },
    {
      path: PRIVATE_NAVIGATION.salesRepCourses.view.path,
      element: <CourseIndex />,
      feature: PRIVATE_NAVIGATION.salesRepCourses.view.feature,
      permission: PRIVATE_NAVIGATION.salesRepCourses.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.trainerCourses.attendanceView.path,
      element: <AttendanceSheet />,
      feature: PRIVATE_NAVIGATION.trainerCourses.attendanceView.feature,
      permission: PRIVATE_NAVIGATION.trainerCourses.attendanceView.permission,
    },
    {
      path: PRIVATE_NAVIGATION.trainerCourses.attendeeInPerson.path,
      element: <InPersonAttendee />,
      feature: PRIVATE_NAVIGATION.trainerCourses.attendeeInPerson.feature,
      permission: PRIVATE_NAVIGATION.trainerCourses.attendeeInPerson.permission,
    },

    {
      path: PRIVATE_NAVIGATION.trainerCourses.mainAttendanceSheet.path,
      element: <MainAttendance />,
      feature: PRIVATE_NAVIGATION.trainerCourses.mainAttendanceSheet.feature,
      permission: PRIVATE_NAVIGATION.trainerCourses.mainAttendanceSheet.permission,
    },
    {
      path: PRIVATE_NAVIGATION.trainerCourses.courseInvite.path,
      element: <InvitationTab />,
      feature: PRIVATE_NAVIGATION.trainerCourses.courseInvite.feature,
      permission: PRIVATE_NAVIGATION.trainerCourses.courseInvite.permission,
    },
    {
      path: PRIVATE_NAVIGATION.trainerCourses.courseAllInvites.path,
      element: <AllInvitations />,
      feature: PRIVATE_NAVIGATION.trainerCourses.courseAllInvites.feature,
      permission: PRIVATE_NAVIGATION.trainerCourses.courseAllInvites.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.attendeeExamResult.path,
      element: <AttendeeExamResult />,
      feature: PRIVATE_NAVIGATION.coursesManagement.attendeeExamResult.feature,
      permission: PRIVATE_NAVIGATION.coursesManagement.attendeeExamResult.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.attendeeCourseParticipate.path,
      element: <CourseParticipate />,
      feature:
        PRIVATE_NAVIGATION.coursesManagement.attendeeCourseParticipate.feature,
      permission:
        PRIVATE_NAVIGATION.coursesManagement.attendeeCourseParticipate.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.attendeeViewResult.path,
      element: <AttendeeTabView />,
      feature: PRIVATE_NAVIGATION.coursesManagement.attendeeViewResult.feature,
      permission: PRIVATE_NAVIGATION.coursesManagement.attendeeViewResult.permission,
    },
    {
      path: PRIVATE_NAVIGATION.trainerCourses.courseView.path,
      element: <ViewCourse isTrainerCourse />,
      feature: PRIVATE_NAVIGATION.trainerCourses.courseView.feature,
      permission: PRIVATE_NAVIGATION.trainerCourses.courseView.permission,
    },
    {
      path: PRIVATE_NAVIGATION.salesRepCourses.courseView.path,
      element: <ViewCourse />,
      feature: PRIVATE_NAVIGATION.salesRepCourses.courseView.feature,
      permission: PRIVATE_NAVIGATION.salesRepCourses.courseView.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.viewCourseTemplates.path,
      element: <ViewCourseIndex />,
      feature: PRIVATE_NAVIGATION.coursesManagement.viewCourseTemplates.feature,
      permission:
        PRIVATE_NAVIGATION.coursesManagement.viewCourseTemplates.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.courseViewDetail.path,
      element: <ViewCourseIndex />,
      feature: PRIVATE_NAVIGATION.coursesManagement.courseViewDetail.feature,
      permission: PRIVATE_NAVIGATION.coursesManagement.courseViewDetail.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.companyParticipantAttendance.path,
      element: <CompanyParticipantAttendance />,
      feature:
        PRIVATE_NAVIGATION.coursesManagement.companyParticipantAttendance.feature,
      permission:
        PRIVATE_NAVIGATION.coursesManagement.companyParticipantAttendance.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.attendanceTimeSheet.path,
      element: <AttendanceTimeSheet />,
      feature: PRIVATE_NAVIGATION.coursesManagement.attendanceTimeSheet.feature,
      permission:
        PRIVATE_NAVIGATION.coursesManagement.attendanceTimeSheet.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.courseCompanyList.path,
      element: <CourseCompanyList />,
      feature: PRIVATE_NAVIGATION.coursesManagement.courseCompanyList.feature,
      permission: PRIVATE_NAVIGATION.coursesManagement.courseCompanyList.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.room.path,
      element: <CourseRoom />,
      feature: PRIVATE_NAVIGATION.coursesManagement.room.feature,
      permission: PRIVATE_NAVIGATION.coursesManagement.room.permission,
    },
    {
      path: PRIVATE_NAVIGATION.courseRequest.view.path,
      element: <CourseRequest />,
      feature: PRIVATE_NAVIGATION.courseRequest.view.feature,
      permission: PRIVATE_NAVIGATION.courseRequest.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.surveyTemplate.list.path,
      element: <SurveyTemplate />,
      feature: PRIVATE_NAVIGATION.coursesManagement.surveyTemplate.list.feature,
      permission:
        PRIVATE_NAVIGATION.coursesManagement.surveyTemplate.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.surveyTemplate.add.path,
      element: <AddEditSurvey />,
      feature: PRIVATE_NAVIGATION.coursesManagement.surveyTemplate.add.feature,
      permission: PRIVATE_NAVIGATION.coursesManagement.surveyTemplate.add.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.surveyTemplate.edit.path,
      element: <AddEditSurvey />,
      feature: PRIVATE_NAVIGATION.coursesManagement.surveyTemplate.edit.feature,
      permission:
        PRIVATE_NAVIGATION.coursesManagement.surveyTemplate.edit.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.surveyTemplate.view.path,
      element: <SurveyTab />,
      feature: PRIVATE_NAVIGATION.coursesManagement.surveyTemplate.view.feature,
      permission:
        PRIVATE_NAVIGATION.coursesManagement.surveyTemplate.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.clientsManagement.attendee.list.path,
      element: <AttendeeList isFromSideBar />,
      // feature: PRIVATE_NAVIGATION.clientsManagement.attendee.list.feature,
      // permission: PRIVATE_NAVIGATION.clientsManagement.attendee.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.companyManager.attendeeList.list.path,
      element: <AttendeeList />,
      // feature: PRIVATE_NAVIGATION.clientsManagement.attendee.list.feature,
      // permission: PRIVATE_NAVIGATION.clientsManagement.attendee.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.unknownAttendeeListing.list.path,
      element: <AttendeeList unknownCompany />,
      // feature: PRIVATE_NAVIGATION.clientsManagement.attendee.list.feature,
      // permission: PRIVATE_NAVIGATION.clientsManagement.attendee.list.permission,
    },

    {
      path: PRIVATE_NAVIGATION.clientsManagement.attendee.view.path,
      element: <ClientAttendeeTab />,
      // feature: PRIVATE_NAVIGATION.clientsManagement.attendee.list.feature,
      // permission: PRIVATE_NAVIGATION.clientsManagement.attendee.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.certificateTemplate.list.path,
      element: <CertificateTemplate />,
      feature: PRIVATE_NAVIGATION.coursesManagement.certificateTemplate.list.feature,
      permission:
        PRIVATE_NAVIGATION.coursesManagement.certificateTemplate.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.certificateTemplate.add.path,
      element: <AddCertificateForm />,
      feature: PRIVATE_NAVIGATION.coursesManagement.certificateTemplate.add.feature,
      permission:
        PRIVATE_NAVIGATION.coursesManagement.certificateTemplate.add.permission,
    },
    {
      path: PRIVATE_NAVIGATION.coursesManagement.certificateTemplate.versionList
        .path,
      element: <VersionListing />,
      feature:
        PRIVATE_NAVIGATION.coursesManagement.certificateTemplate.versionList.feature,
      permission:
        PRIVATE_NAVIGATION.coursesManagement.certificateTemplate.versionList
          .permission,
    },
    {
      path: PRIVATE_NAVIGATION.paymentTerms.view.path,
      element: <PaymentTerms />,
      feature: PRIVATE_NAVIGATION.paymentTerms.view.feature,
      permission: PRIVATE_NAVIGATION.paymentTerms.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.systemLogs.view.path,
      element: <SystemLog />,
      feature: PRIVATE_NAVIGATION.systemLogs.view.feature,
      permission: PRIVATE_NAVIGATION.systemLogs.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.order.list.path,
      element: <OrderListing />,
      feature: PRIVATE_NAVIGATION.order.list.feature,
      permission: PRIVATE_NAVIGATION.order.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.order.view.path,
      element: <ViewOrder />,
      feature: PRIVATE_NAVIGATION.order.view.feature,
      permission: PRIVATE_NAVIGATION.order.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.quoteProducts.list.path,
      element: <QuoteProducts />,
      feature: PRIVATE_NAVIGATION.quoteProducts.list.feature,
      permission: PRIVATE_NAVIGATION.quoteProducts.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.quoteProducts.view.path,
      element: <ViewLogs />,
      feature: PRIVATE_NAVIGATION.quoteProducts.view.feature,
      permission: PRIVATE_NAVIGATION.quoteProducts.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.invoice.view.path,
      element: <Invoice />,
      feature: PRIVATE_NAVIGATION.invoice.view.feature,
      permission: PRIVATE_NAVIGATION.invoice.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.invoice.list.path,
      element: <ViewInvoice />,
      feature: PRIVATE_NAVIGATION.invoice.list.feature,
      permission: PRIVATE_NAVIGATION.invoice.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.invoice.add.path,
      element: <CreateInvoice />,
      feature: PRIVATE_NAVIGATION.invoice.add.feature,
      permission: PRIVATE_NAVIGATION.invoice.add.permission,
    },
    {
      path: PRIVATE_NAVIGATION.invoice.addParams.path,
      element: <CreateInvoice />,
      feature: PRIVATE_NAVIGATION.invoice.addParams.feature,
      permission: PRIVATE_NAVIGATION.invoice.addParams.permission,
    },
    {
      path: PRIVATE_NAVIGATION.accountingCompany.list.path,
      element: <ClientsManagement />,
      feature: PRIVATE_NAVIGATION.accountingCompany.list.feature,
      permission: PRIVATE_NAVIGATION.accountingCompany.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.accountingCompany.add.path,
      element: <AddEditCompany />,
      feature: PRIVATE_NAVIGATION.accountingCompany.add.feature,
      permission: PRIVATE_NAVIGATION.accountingCompany.add.permission,
    },
    {
      path: PRIVATE_NAVIGATION.accountingCompany.edit.path,
      element: <AddEditCompany />,
      feature: PRIVATE_NAVIGATION.accountingCompany.edit.feature,
      permission: PRIVATE_NAVIGATION.accountingCompany.edit.permission,
    },
    {
      path: PRIVATE_NAVIGATION.accountingCompany.view.path,
      element: <CompanyTabList />,
      feature: PRIVATE_NAVIGATION.accountingCompany.view.feature,
      permission: PRIVATE_NAVIGATION.accountingCompany.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.creditNotes.list.path,
      element: <CreditNotes />,
      feature: PRIVATE_NAVIGATION.creditNotes.list.feature,
      permission: PRIVATE_NAVIGATION.creditNotes.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.creditNotes.add.path,
      element: <AddCreditNote />,
      feature: PRIVATE_NAVIGATION.creditNotes.add.feature,
      permission: PRIVATE_NAVIGATION.creditNotes.add.permission,
    },
    {
      path: PRIVATE_NAVIGATION.salesRep.course.path,
      element: <ViewCourseIndex />,
      feature: PRIVATE_NAVIGATION.salesRep.course.feature,
      permission: PRIVATE_NAVIGATION.salesRep.course.permission,
    },
    {
      path: PRIVATE_NAVIGATION.trainerInvoice.list.path,
      element: <TrainerInvoiceList />,
      feature: PRIVATE_NAVIGATION.trainerInvoice.list.feature,
      permission: PRIVATE_NAVIGATION.trainerInvoice.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.trainerInvoice.currentMonthOrder.view.path,
      element: <CurrentMonthInvoice />,
      feature: PRIVATE_NAVIGATION.trainerInvoice.currentMonthOrder.view.feature,
      permission:
        PRIVATE_NAVIGATION.trainerInvoice.currentMonthOrder.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.trainerInvoice.previousMonthOrder.view.path,
      element: <PreviousMonthInvoice />,
      feature: PRIVATE_NAVIGATION.trainerInvoice.previousMonthOrder.view.feature,
      permission:
        PRIVATE_NAVIGATION.trainerInvoice.previousMonthOrder.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.trainerOrder.currentMonthOrder.view.path,
      element: <CurrentMonthInvoice />,
      feature: PRIVATE_NAVIGATION.trainerOrder.currentMonthOrder.view.feature,
      permission: PRIVATE_NAVIGATION.trainerOrder.currentMonthOrder.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.trainerOrder.previousMonthOrder.view.path,
      element: <PreviousMonthInvoice />,
      feature: PRIVATE_NAVIGATION.trainerOrder.previousMonthOrder.view.feature,
      permission: PRIVATE_NAVIGATION.trainerOrder.previousMonthOrder.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.expense.view.path,
      element: <Expense />,
      feature: PRIVATE_NAVIGATION.expense.view.feature,
      permission: PRIVATE_NAVIGATION.expense.view.permission,
    },
    {
      path: PRIVATE_NAVIGATION.expense.edit.path,
      element: <ExpenseUpdate />,
      feature: PRIVATE_NAVIGATION.expense.edit.feature,
      permission: PRIVATE_NAVIGATION.expense.edit.permission,
    },
    {
      path: PRIVATE_NAVIGATION.reports.list.path,
      element: <Reports />,
      feature: PRIVATE_NAVIGATION.reports.list.feature,
      permission: PRIVATE_NAVIGATION.reports.list.permission,
    },
    {
      path: PRIVATE_NAVIGATION.sector.list.path,
      element: <Sectors />,
      feature: PRIVATE_NAVIGATION.sector.list.feature,
      permission: PRIVATE_NAVIGATION.sector.list.permission,
    },
    ...RolesDynamicRoutes(),
  ]);

  const routesForPublic: RouteObjType[] = [
    {
      path: '/auth',
      element: <HandleAuth />,
    },
  ];

  const notFound: RouteObjType[] = [
    {
      path: '*',
      element: (
        <Suspense fallback={<Loaders type="SiteLoader" />}>
          {isCountryLoading || isAcitveUserLoading ? (
            <Loaders type="SiteLoader" />
          ) : (
            <NotFound />
          )}
        </Suspense>
      ),
    },
  ];

  let finalRoutes = [
    ...routesForPublic,
    ...routesForNotAuthenticatedOnly,
    ...routesForAuthenticatedOnly,
    ...notFound,
    ...routesForProfileSetup,
    ...examRoutesForNotAuthenticatedOnly,
  ];

  finalRoutes = finalRoutes.filter((route) => {
    if (route?.feature && route?.permission)
      return useRolePermission(route.feature, route.permission);
    return true;
  });

  // Combine and conditionally include routes based on authentication status
  const router = createBrowserRouter(finalRoutes);

  if (isLanguageLoading) {
    return <Loaders type="SiteLoader" />;
  }

  return <RouterProvider router={router} />;
};

export default Routes;
