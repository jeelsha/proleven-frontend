// ** imports **
import PageHeader from 'components/PageHeader/PageHeader';
import TabComponent from 'components/Tabs';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

// ** constants **
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';

// ** hooks **
import { useQueryGetFunction } from 'hooks/useQuery';

// ** components **
import CourseList from 'modules/CompanyManager/components/CourseList';

// ** redux **
import SearchComponent from 'components/Table/search';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { useCompany } from 'redux-toolkit/slices/companySlice';
import {
  currentPageCount,
  currentPageSelector,
} from 'redux-toolkit/slices/paginationSlice';
import { useDebounce } from 'utils';
import { useTitle } from 'hooks/useTitle';

enum CourseType {
  Private = 'private',
  Academy = 'academy',
}

const MyCourses = () => {
  const { t } = useTranslation();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const debounceSearch = useDebounce(search, 500);
  const updateTitle = useTitle();
  const [activeTab, setActiveTab] = useState(state?.activeTab ?? 0);
  const ActiveCompany = useSelector(useCompany);
  const user = useSelector(getCurrentUser);
  const dispatch = useDispatch();
  const firstRender = useRef(false);
  const { currentPage } = useSelector(currentPageSelector);
  const apiUrl =
    user?.role_name === ROLES.CompanyManager
      ? `/managers/course/enrolled/${ActiveCompany?.company?.id}`
      : `/private-individual/course/enrolled/${user?.id}`;

  const { response: coursesResponse, isLoading: courseLoading } =
    useQueryGetFunction(apiUrl, {
      option: {
        course_type: activeTab === 0 ? CourseType.Academy : CourseType.Private,
      },
      search: debounceSearch,
      page: currentPage,
      limit,
    });

  const startRecord = (Number(currentPage || 1) - 1) * Number(limit ?? 10) + 1;
  const endRecord =
    Number(currentPage || 1) * Number(limit || 10) <=
    Number(coursesResponse?.data?.count)
      ? Number(currentPage || 1) * Number(limit ?? 10)
      : coursesResponse?.data?.count;

  const isDataAvailable = endRecord && startRecord <= endRecord;
  const handleActiveTab = (tab: number) => {
    setActiveTab(tab);
    dispatch(currentPageCount({ currentPage: 1 }));
  };

  useEffect(() => {
    if (user?.role_name === ROLES.CompanyManager && firstRender.current) {
      firstRender.current = false;
      navigate(PRIVATE_NAVIGATION.dashboard.view.path);
    }
    firstRender.current = true;
  }, [ActiveCompany]);
  updateTitle(t('CompanyManager.myCourses.title'));
  return (
    <div className="pt-5 container">
      <PageHeader text={t('CompanyManager.myCourses.title')} small />
      <div className="flex justify-end">
        <SearchComponent
          parentClass="mb-2.5 max-w-[320px]"
          onSearch={(e) => {
            setSearch?.(e.target.value);
          }}
          placeholder={t('CompanyManager.myCourses.searchTitle')}
        />
      </div>
      {user?.role_name === ROLES.PrivateIndividual ? (
        <CourseList
          activeTab={activeTab}
          coursesResponse={coursesResponse?.data?.data}
          courseLoading={courseLoading}
          startRecord={startRecord}
          endRecord={endRecord}
          isDataAvailable={isDataAvailable}
          limit={limit}
          currentPage={currentPage}
          setLimit={setLimit}
          totalPages={coursesResponse?.data?.lastPage}
          dataCount={coursesResponse?.data?.count}
          navigateUrl={PRIVATE_NAVIGATION.privateIndividual.myCourses.list.path}
        />
      ) : (
        <TabComponent current={activeTab} onTabChange={handleActiveTab}>
          <TabComponent.Tab title="Academy" icon="bookIcon">
            <CourseList
              activeTab={activeTab}
              coursesResponse={coursesResponse?.data?.data}
              courseLoading={courseLoading}
              startRecord={startRecord}
              endRecord={endRecord}
              isDataAvailable={isDataAvailable}
              limit={limit}
              currentPage={currentPage}
              setLimit={setLimit}
              totalPages={coursesResponse?.data?.lastPage}
              dataCount={coursesResponse?.data?.count}
              navigateUrl={
                user?.role_name === ROLES.CompanyManager
                  ? PRIVATE_NAVIGATION.companyManager.myCourses.list.path
                  : PRIVATE_NAVIGATION.privateIndividual.myCourses.list.path
              }
            />
          </TabComponent.Tab>
          <TabComponent.Tab title="Private" icon="pencilLineStrokeSD">
            <CourseList
              activeTab={activeTab}
              coursesResponse={coursesResponse?.data?.data}
              courseLoading={courseLoading}
              startRecord={startRecord}
              endRecord={endRecord}
              isDataAvailable={isDataAvailable}
              limit={limit}
              currentPage={currentPage}
              setLimit={setLimit}
              totalPages={coursesResponse?.data?.lastPage}
              dataCount={coursesResponse?.data?.count}
              navigateUrl={
                user?.role_name === ROLES.CompanyManager
                  ? PRIVATE_NAVIGATION.companyManager.myCourses.list.path
                  : PRIVATE_NAVIGATION.privateIndividual.myCourses.list.path
              }
              navigateTrackCourse="/manager/my-courses/track"
              otherText={t('CompanyManager.trackCourse.modal.trackTitle')}
            />
          </TabComponent.Tab>
        </TabComponent>
      )}
    </div>
  );
};

export default MyCourses;
