import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import Image from 'components/Image';
import InfiniteScroll from 'components/InfiniteScroll/infiniteScroll';
import { Modal } from 'components/Modal/Modal';
import NoDataFound from 'components/NoDataFound';
import TabComponent from 'components/Tabs';
import { REACT_APP_DATE_FORMAT } from 'config';
import { ROLES } from 'constants/roleAndPermission.constant';
import { format } from 'date-fns';
import { useQueryGetFunction } from 'hooks/useQuery';
import { ChangeEvent, MouseEvent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import {
  FilterOptionsType,
  setFilterOptions,
  useFilterOptions,
} from 'redux-toolkit/slices/filtereventSlice';
import { getRoles } from 'redux-toolkit/slices/rolePermissionSlice';
import { ModalProps } from 'types/common';
import { useDebounce } from 'utils';

interface TabDetailProps {
  id: string;
  title: string;
  slug: string;
  full_name?: string;
  image?: string;
  username?: string;
  profile_image?: string;
  start_date?: string;
  end_date?: string;
}

interface FilterProps {
  modal: ModalProps;
  currentView?: string;
  filterValue?: {
    start_date?: string | Date;
    end_date?: string | Date;
  };
  currentMonthView: string;
}

const FilterShow = ({
  modal,
  currentView,
  filterValue,
  currentMonthView,
}: FilterProps) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState({
    course: '',
    trainer: '',
    trainingspecialist: '',
    resource: '',
    room: '',
  });
  const [activeTab, setActiveTab] = useState(0);
  const [coursePage, setCoursePage] = useState(1);
  const [trainerPage, setTrainerPage] = useState(1);
  const [resourcePage, setResourcePage] = useState(1);
  const [roomPage, setRoomPage] = useState(1);

  const [trainingSpecialistPage, setTrainingSpecialistPage] = useState(1);

  const [courses, setCourses] = useState([] as TabDetailProps[]);
  const [trainers, setTrainers] = useState([] as TabDetailProps[]);
  const [resource, setResource] = useState([] as TabDetailProps[]);
  const [room, setRoom] = useState([] as TabDetailProps[]);

  const [trainingSpecialist, setTrainingSpecialist] = useState(
    [] as TabDetailProps[]
  );

  const [selectedFilter, setSelectedFilter] = useState('course');
  const allRoles = useSelector(getRoles);
  const user = useSelector(getCurrentUser);
  const currentRole = allRoles.find((role) => role.name === ROLES.Trainer);
  const TrainingSpecialistRole = allRoles.find(
    (role) => role.name === ROLES.TrainingSpecialist
  );

  const dispatch = useDispatch();
  const filterOptions = useSelector(useFilterOptions);
  const [selectedOptions, setSelectedOptions] = useState<FilterOptionsType>({
    course: [],
    trainer: [],
    trainingspecialist: [],
    resource: [],
    room: [],
  });

  const debouncedCourseSearch = useDebounce(search.course, 500);
  const debouncedTrainerSearch = useDebounce(search.trainer, 500);
  const debouncedResourceSearch = useDebounce(search.resource, 500);
  const debouncedRoomSearch = useDebounce(search.room, 500);

  const debouncedTrainingSpecialistSearch = useDebounce(
    search.trainingspecialist,
    500
  );

  const { response: getCourses, isLoading: FilterLoading } = useQueryGetFunction(
    `/calendar/course`,
    {
      page: coursePage,
      search: debouncedCourseSearch,
      limit: 12,
      option: {
        filterView: true,
        toggle: currentView,
        ...(currentView === 'day' && {
          day: filterValue?.start_date?.toString(),
        }),
        ...(currentView === 'week' && {
          start_date: filterValue?.start_date?.toString(),
          end_date: filterValue?.end_date?.toString(),
        }),
        ...(currentView === 'month' && {
          monthValue: currentMonthView,
        }),
        ...(currentView === 'year' && {
          yearValue: format(
            new Date(filterValue?.start_date as unknown as string),
            'yyyy'
          ),
        }),
      },
    }
  );

  const { response: getCourseCategory, isLoading: TrainerLoading } =
    useQueryGetFunction('/users', {
      page: trainerPage,
      search: debouncedTrainerSearch,
      role: currentRole?.id.toString(),
      limit: 12,
    });

  const { response: getResource, isLoading: ResourceLoading } = useQueryGetFunction(
    '/resources',
    {
      page: resourcePage,
      search: debouncedResourceSearch,
      limit: 12,
      option: {
        view: true,
      },
    }
  );

  const { response: getRoom, isLoading: RoomLoading } = useQueryGetFunction(
    '/room',
    {
      page: roomPage,
      search: debouncedRoomSearch,
      limit: 12,
      option: {
        view: true,
      },
    }
  );

  const { response: getTrainingSpecialist, isLoading: TrainingSpecialistLoading } =
    useQueryGetFunction('/users', {
      page: trainingSpecialistPage,
      search: debouncedTrainingSpecialistSearch,
      role: TrainingSpecialistRole?.id.toString(),
      limit: 12,
    });

  useEffect(() => {
    if (getCourses?.data?.data && coursePage === 1) {
      const newData = getCourses?.data?.data;
      setCourses(newData);
    }
    if (getCourseCategory?.data?.data && trainerPage === 1) {
      const newData = getCourseCategory?.data?.data;
      setTrainers(newData);
    }

    if (getResource?.data?.data && resourcePage === 1) {
      const newData = getResource?.data?.data;
      setResource(newData);
    }
    if (getTrainingSpecialist?.data?.data && trainingSpecialistPage === 1) {
      const newData = getTrainingSpecialist?.data?.data;
      setTrainingSpecialist(newData);
    }
    if (getRoom?.data?.data && roomPage === 1) {
      const newData = getRoom?.data?.data;
      setRoom(newData);
    }
  }, [
    getCourses,
    activeTab,
    getCourseCategory,
    getTrainingSpecialist,
    getResource,
    getRoom,
  ]);

  useEffect(() => {
    if (getCourses?.data?.data && coursePage > 1) {
      const newData = getCourses?.data?.data;
      setCourses((prevCourse) => {
        return [...prevCourse, ...newData];
      });
    }
    if (getCourseCategory?.data?.data && trainerPage > 1) {
      const newData = getCourseCategory?.data?.data;
      setTrainers((prevTrainer) => [...prevTrainer, ...newData]);
    }
  }, [coursePage, getCourses, getCourseCategory]);

  useEffect(() => {
    setCoursePage(1);
    setTrainerPage(1);
    setResourcePage(1);
    setRoomPage(1);
  }, [search]);

  const filters = ['course', 'trainer', 'trainingspecialist', 'resource', 'room'];

  useEffect(() => {
    setSelectedFilter(filters[activeTab]);
  }, [activeTab]);

  const handleActiveTab = (tab: number) => {
    setActiveTab(tab);
  };
  const handleFilterOptions = () => {
    dispatch(
      setFilterOptions({
        course: selectedOptions.course,
        trainer: selectedOptions.trainer,
        trainingspecialist: selectedOptions.trainingspecialist,
        resource: selectedOptions.resource,
        room: selectedOptions.room,
      })
    );
    modal.closeModal();
  };

  const courseCallBack = useCallback(async () => {
    if (coursePage < getCourses?.data?.lastPage) {
      setCoursePage((prevPage) => prevPage + 1);
    }
  }, [coursePage, getCourses?.data?.lastPage]);

  const handleSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    data: TabDetailProps
  ) => {
    const isChecked = event.target.checked;
    const filterOptions: TabDetailProps[] =
      selectedOptions[selectedFilter as keyof typeof selectedOptions];
    const selectedValue = {
      id: data?.id,
      title: data?.title ?? data?.full_name,
      slug: data?.slug ?? data?.username,
    };
    setSelectedOptions((prevSelectedOptions) => ({
      ...prevSelectedOptions,
      [selectedFilter]: isChecked
        ? [...filterOptions, selectedValue]
        : filterOptions.filter((item) => item.id !== selectedValue.id),
    }));
  };

  const trainerCallBack = useCallback(async () => {
    if (trainerPage < getCourseCategory?.data?.lastPage) {
      setTrainerPage((prevPage) => prevPage + 1);
    }
  }, [trainerPage, getCourseCategory?.data?.lastPage]);

  const resourceCallBack = useCallback(async () => {
    if (resourcePage < getResource?.data?.lastPage) {
      setResourcePage((prevPage) => prevPage + 1);
    }
  }, [resourcePage, getResource?.data?.lastPage]);

  const roomCallBack = useCallback(async () => {
    if (roomPage < getRoom?.data?.lastPage) {
      setRoomPage((prevPage) => prevPage + 1);
    }
  }, [roomPage, getRoom?.data?.lastPage]);

  const tsCallBack = useCallback(async () => {
    if (trainingSpecialistPage < getTrainingSpecialist?.data?.lastPage) {
      setTrainingSpecialistPage((prevPage) => prevPage + 1);
    }
  }, [trainingSpecialistPage, getTrainingSpecialist?.data?.lastPage]);

  useEffect(() => {
    setSelectedOptions(filterOptions);
  }, [filterOptions]);

  const handleContainerClick = (data: TabDetailProps) => {
    const filterOptions: TabDetailProps[] =
      selectedOptions[selectedFilter as keyof typeof selectedOptions];
    const selectedValue = {
      id: data?.id,
      title: data?.title ?? data?.full_name,
      slug: data?.slug ?? data?.username,
    };

    // if (!filterOptions.some((item) => item.id === selectedValue.id)) {
    //   setSelectedOptions((prevSelectedOptions) => ({
    //     ...prevSelectedOptions,
    //     [selectedFilter]: [...filterOptions, selectedValue],
    //   }));
    // }
    const isSelected = filterOptions.some((item) => item.id === selectedValue.id);

    if (isSelected) {
      setSelectedOptions((prevSelectedOptions) => ({
        ...prevSelectedOptions,
        [selectedFilter]: filterOptions.filter(
          (item) => item.id !== selectedValue.id
        ),
      }));
    } else {
      setSelectedOptions((prevSelectedOptions) => ({
        ...prevSelectedOptions,
        [selectedFilter]: [...filterOptions, selectedValue],
      }));
    }
  };
  const renderContent = () => {
    if (FilterLoading && !courses?.length) {
      return (
        <div className="flex justify-center">
          <Image loaderType="Spin" />
        </div>
      );
    }
    if (courses && courses?.length > 0) {
      return (
        <div className="grid grid-cols-2 1400:grid-cols-3 gap-4 mt-0">
          {courses?.map((data) => (
            <div
              className="filter-card-container"
              key={data.id}
              onClick={() => {
                handleContainerClick(data);
              }}
            >
              <div className="flex items-center gap-2 max-w-[calc(100%_-_30px)]">
                <Image
                  src={data?.image}
                  imgClassName="w-[70px] h-12 rounded-lg object-cover"
                  serverPath
                />
                <div className="flex-[1_0_0%] flex flex-col text-sm leading-4 text-navText">
                  {data?.title}
                  {data?.start_date && data?.end_date && (
                    <p className="text-sm leading-4 text-dark/50 flex items-center whitespace-nowrap">
                      <Image
                        iconName="calendarIcon2"
                        iconClassName="  w-[18px] h-[18px] inline-block me-1.5"
                      />
                      {(data as unknown as TabDetailProps)?.start_date
                        ? format(
                            new Date(data?.start_date),
                            REACT_APP_DATE_FORMAT as string
                          )
                        : ''}
                      &nbsp;-&nbsp;
                      {(data as unknown as TabDetailProps)?.end_date
                        ? format(
                            new Date(data?.end_date),
                            REACT_APP_DATE_FORMAT as string
                          )
                        : ''}
                    </p>
                  )}
                </div>
              </div>
              <div className="w-5 h-5">
                <Checkbox
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    handleSelect(event, data);
                  }}
                  check={selectedOptions[
                    selectedFilter as keyof typeof selectedOptions
                  ]?.some((item: TabDetailProps) => item.id === data?.id)}
                />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!FilterLoading && !courses?.length)
      return (
        <NoDataFound message={t('Table.noDataFound')} className="justify-between" />
      );
  };

  const renderTrainer = () => {
    if (TrainerLoading && !trainers?.length) {
      return (
        <div className="flex justify-center">
          <Image loaderType="Spin" />
        </div>
      );
    }
    if (trainers && trainers?.length > 0) {
      return (
        <div className="grid grid-cols-2 1400:grid-cols-3 gap-4 mt-0 ">
          {trainers.map((data) => {
            return (
              <div
                className="filter-card-container"
                key={data.id}
                onClick={(event: MouseEvent<HTMLDivElement>) => {
                  const target = event.target as HTMLElement;
                  if (target.tagName.toLowerCase() !== 'input') {
                    handleContainerClick(data);
                  }
                }}
              >
                <div className="flex items-center gap-2 max-w-[calc(100%_-_30px)]">
                  <Image
                    src={
                      data?.profile_image ?? 'https://via.placeholder.com/150x150'
                    }
                    imgClassName="w-7 h-7 rounded-full object-cover"
                    serverPath
                  />
                  <Button className="flex-[1_0_0%] inline-block text-base text-dark truncate">
                    {data.full_name}
                  </Button>
                </div>
                <div className="w-5 h-5">
                  <Checkbox
                    check={selectedOptions[
                      selectedFilter as keyof typeof selectedOptions
                    ]?.some((item: TabDetailProps) => item.id === data?.id)}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      handleSelect(event, data)
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    if (!TrainerLoading && !trainers?.length)
      return (
        <NoDataFound message={t('Table.noDataFound')} className="justify-between" />
      );
  };

  const renderResource = () => {
    if (ResourceLoading && !resource?.length) {
      return (
        <div className="flex justify-center">
          <Image loaderType="Spin" />
        </div>
      );
    }
    if (resource && resource?.length > 0) {
      return (
        <div className="grid grid-cols-2 1400:grid-cols-3 gap-4 mt-0 ">
          {resource.map((data) => {
            return (
              <div
                className="filter-card-container"
                key={data.id}
                onClick={(event: MouseEvent<HTMLDivElement>) => {
                  const target = event.target as HTMLElement;
                  if (target.tagName.toLowerCase() !== 'input') {
                    handleContainerClick(data);
                  }
                }}
              >
                <div className="flex items-center gap-2 max-w-[calc(100%_-_30px)]">
                  <Button className="flex-[1_0_0%] inline-block text-base text-dark truncate">
                    {data.title}
                  </Button>
                </div>
                <div className="w-5 h-5">
                  <Checkbox
                    check={selectedOptions[
                      selectedFilter as keyof typeof selectedOptions
                    ]?.some((item: TabDetailProps) => item.id === data?.id)}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      handleSelect(event, data)
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    if (!ResourceLoading && !resource?.length)
      return (
        <NoDataFound message={t('Table.noDataFound')} className="justify-between" />
      );
  };

  const renderRoom = () => {
    if (RoomLoading && !room?.length) {
      return (
        <div className="flex justify-center">
          <Image loaderType="Spin" />
        </div>
      );
    }
    if (room && room?.length > 0) {
      return (
        <div className="grid grid-cols-2 1400:grid-cols-3 gap-4 mt-0 ">
          {room.map((data) => {
            return (
              <div
                className="filter-card-container"
                key={data.id}
                onClick={(event: MouseEvent<HTMLDivElement>) => {
                  const target = event.target as HTMLElement;
                  if (target.tagName.toLowerCase() !== 'input') {
                    handleContainerClick(data);
                  }
                }}
              >
                <div className="flex items-center gap-2 max-w-[calc(100%_-_30px)]">
                  <Button className="flex-[1_0_0%] inline-block text-base text-dark truncate">
                    {data.title}
                  </Button>
                </div>
                <div className="w-5 h-5">
                  <Checkbox
                    check={selectedOptions[
                      selectedFilter as keyof typeof selectedOptions
                    ]?.some((item: TabDetailProps) => item.id === data?.id)}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      handleSelect(event, data)
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    if (!RoomLoading && !room?.length)
      return (
        <NoDataFound message={t('Table.noDataFound')} className="justify-between" />
      );
  };

  const renderTrainingSpecialist = () => {
    if (TrainingSpecialistLoading) {
      return (
        <div className="flex justify-center">
          <Image loaderType="Spin" />
        </div>
      );
    }
    if (trainingSpecialist && trainingSpecialist?.length > 0) {
      return (
        <div className="grid grid-cols-2 1400:grid-cols-3 gap-4 mt-0 ">
          {trainingSpecialist.map((data) => {
            return (
              <div
                className="filter-card-container"
                key={data.id}
                onClick={(event: MouseEvent<HTMLDivElement>) => {
                  const target = event.target as HTMLElement;
                  if (target.tagName.toLowerCase() !== 'input') {
                    handleContainerClick(data);
                  }
                }}
              >
                <div className="flex items-center gap-2 max-w-[calc(100%_-_30px)]">
                  <Image
                    src={
                      data?.profile_image ?? 'https://via.placeholder.com/150x150'
                    }
                    imgClassName="w-7 h-7 rounded-full object-cover"
                    serverPath
                  />
                  <Button className="flex-[1_0_0%] inline-block text-base text-dark truncate">
                    {data.full_name}
                  </Button>
                </div>
                <div className="w-5 h-5">
                  <Checkbox
                    check={selectedOptions[
                      selectedFilter as keyof typeof selectedOptions
                    ]?.some((item: TabDetailProps) => item.id === data?.id)}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      handleSelect(event, data)
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    return (
      <NoDataFound message={t('Table.noDataFound')} className="justify-between" />
    );
  };

  return (
    <Modal
      width="!max-w-[1000px] 1400:!max-w-[1200px]"
      headerTitle="Filter"
      modal={modal}
      modalBodyClassName="[&_>_div]:max-h-[unset]"
    >
      <>
        <TabComponent
          searchable
          current={activeTab}
          onTabChange={handleActiveTab}
          onSearch={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearch((prev) => {
              return {
                ...prev,
                [filters[activeTab]]: e.target.value,
              };
            });
          }}
        >
          <TabComponent.Tab
            title={t('Calendar.filterTabs.coursesTitle')}
            icon="userProfile"
          >
            <InfiniteScroll
              callBack={courseCallBack}
              hasMoreData={courses?.length < getCourses?.data?.count}
              className="max-h-[300px] min-h-[230px] mb-8 with-scrollbar pr-1"
            >
              <div className="grid grid-cols-1  gap-4 mt-7">{renderContent()}</div>
            </InfiniteScroll>
          </TabComponent.Tab>
          {user?.role_name !== ROLES.Trainer &&
          user?.role_name !== ROLES.CompanyManager ? (
            <TabComponent.Tab
              title={t('Calendar.filterTabs.trainersTitle')}
              icon="bookIcon"
            >
              <InfiniteScroll
                callBack={trainerCallBack}
                hasMoreData={trainers?.length < getCourseCategory?.data?.count}
                className="max-h-[250px] min-h-[230px] mb-8 with-scrollbar pr-1"
              >
                <div className="grid grid-cols-1  gap-4 mt-7">{renderTrainer()}</div>
              </InfiniteScroll>
            </TabComponent.Tab>
          ) : (
            <></>
          )}
          {user?.role_name !== ROLES.Trainer &&
          user?.role_name !== ROLES.CompanyManager ? (
            <TabComponent.Tab title="Training Specialist" icon="bookIcon">
              <InfiniteScroll
                callBack={tsCallBack}
                hasMoreData={
                  trainingSpecialist?.length < getTrainingSpecialist?.data?.count
                }
                className="max-h-[250px] min-h-[230px] mb-8 with-scrollbar pr-1"
              >
                <div className="grid grid-cols-1  gap-4 mt-7">
                  {renderTrainingSpecialist()}
                </div>
              </InfiniteScroll>
            </TabComponent.Tab>
          ) : (
            <></>
          )}
          {user?.role_name !== ROLES.Trainer &&
          user?.role_name !== ROLES.CompanyManager ? (
            <TabComponent.Tab title="Resource" icon="bookIcon">
              <InfiniteScroll
                callBack={resourceCallBack}
                hasMoreData={resource?.length < getResource?.data?.count}
                className="max-h-[250px] min-h-[230px] mb-8 with-scrollbar pr-1"
              >
                <div className="grid grid-cols-1  gap-4 mt-7">
                  {renderResource()}
                </div>
              </InfiniteScroll>
            </TabComponent.Tab>
          ) : (
            <></>
          )}
          {user?.role_name !== ROLES.Trainer &&
          user?.role_name !== ROLES.CompanyManager ? (
            <TabComponent.Tab title="Rooms" icon="bookIcon">
              <InfiniteScroll
                callBack={roomCallBack}
                hasMoreData={room?.length < getRoom?.data?.count}
                className="max-h-[250px] min-h-[230px] mb-8 with-scrollbar pr-1"
              >
                <div className="grid grid-cols-1  gap-4 mt-7">{renderRoom()}</div>
              </InfiniteScroll>
            </TabComponent.Tab>
          ) : (
            <></>
          )}
        </TabComponent>
        <div className="flex justify-end">
          <Button
            variants="primary"
            className=""
            onClickHandler={handleFilterOptions}
          >
            <Button className="w-5 h-5 rounded-full border-2 border-solid p-[3px] me-1 inline-block border-white/50 text-white">
              <Image
                iconName="checkIcon"
                iconClassName="w-full h-full stroke-[2px]"
              />
            </Button>
            {t('Calendar.applyFilterButton')}
          </Button>
        </div>
      </>
    </Modal>
  );
};

export default FilterShow;
