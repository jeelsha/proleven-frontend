// **components**
import Button from 'components/Button/Button';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import NoDataFound from 'components/NoDataFound';
import Table from 'components/Table/Table';
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import ExpandableCourseRow from 'modules/Courses/components/Management/ExpandableCourseRow';

// **constants**
import { ROLES } from 'constants/roleAndPermission.constant';
import { COURSE_TYPE, CourseStatus } from 'modules/Courses/Constants';

// **libraries**
import _ from 'lodash';

// **hooks**
import { useAxiosDelete, useAxiosPost } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

// **utils**
import {
  courseCompaniesCell,
  dateRender,
  getCourseType,
  trainerConfirmationCell,
  trainingSpecialistCell,
} from 'modules/Courses/components/Common';
import { useDebounce } from 'utils';

// **types**
import { Course, CourseResponse } from 'modules/Courses/types';

// **redux**
import Pagination from 'components/Pagination/Pagination';
import StatusLabel from 'components/StatusLabel';
import AddModal from 'modules/Courses/components/Management/AddModal';
import {
  isCurrentDateInRange,
  setParamsToApi,
} from 'modules/Courses/helper/CourseCommon';
import { EnumQRCode } from 'modules/Courses/types/survey';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';

type propTypes = {
  search?: string;
  status?: CourseStatus;
  activeTab?: number;
};

const CourseManagement = ({ search, status, activeTab }: propTypes) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentPage } = useSelector(currentPageSelector);
  const user = useSelector(getCurrentUser);
  const [courseDeleteApi] = useAxiosDelete();

  const deleteModal = useModal();
  // const examModal = useModal();
  const markAsPublishModal = useModal();
  const markAsSoldOutModal = useModal();
  const addModal = useModal();
  const urlQuery: URL = new URL(window.location.href);
  const QueryParams = urlQuery.search;
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [selectedData, setSelectedData] = useState<CourseResponse | null>(null);
  const [isSortAsc, setIsSortAsc] = useState<boolean>();
  const searchString = typeof search === 'string' ? search : '';
  const debouncedSearch = useDebounce(searchString, 500);

  const apiUrl =
    user?.role_name === ROLES.Trainer
      ? '/trainer/courses?profile=true'
      : '/course?tableView=true';

  const courseType = setParamsToApi('courseType');
  const fundedBy = setParamsToApi('fundedBy');
  const courseCategory = setParamsToApi('courseCategory');
  const courseSubCategory = setParamsToApi('courseSubCategory');
  const companies = setParamsToApi('companies');
  const trainingSpecialist = setParamsToApi('trainingSpecialist');
  const filterDate = setParamsToApi('filterDate');

  const tableLazyCount = [...Array(10).keys()];

  const url = '/course-management';

  const { response, isLoading, refetch } = useQueryGetFunction(apiUrl, {
    page: currentPage,
    limit,
    sort,
    search: debouncedSearch,
    option: {
      status,
      course_type: courseType,
      courseCategory,
      courseSubCategory,
      fundedBy,
      companies,
      trainingSpecialist,
      allLanguage: !!(
        status === CourseStatus.incomplete && apiUrl === '/course?tableView=true'
      ),
      ...filterDate,
    },
  });

  const [markAsPublished, { isLoading: publishingCourse }] = useAxiosPost();
  const [markAsSoldCourse, { isLoading: markAsSoldOutLoading }] = useAxiosPost();

  const columnData: ITableHeaderProps[] = [
    {
      className: 'min-w-[123px]',
      header: t('CoursesManagement.CreateCourse.courseCode'),
      name: 'course.code',
      cell: (props) => renderCode(props),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      className: 'min-w-[316px]',
      header: t('CoursesManagement.CreateCourse.courseName'),
      name: 'course.title',
      cell: (props) => templateRender(props),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      className: 'min-w-[131px]',
      header: t('CoursesManagement.CreateCourse.startDate'),
      name: 'course.start_date',
      cell: (props) => dateRender((props as unknown as CourseResponse).start_date),
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      className: 'min-w-[121px]',
      header: t('CoursesManagement.CreateCourse.endDate'),
      name: 'course.end_date',
      cell: (props) => dateRender((props as unknown as CourseResponse).end_date),
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      className: 'min-w-[91px]',
      header: t('CoursesManagement.columnHeader.Category'),
      name: 'course.courseCategory.name',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      className: 'min-w-[132px]',
      header: t('CoursesManagement.columnHeader.ClientCompany'),
      name: 'course.companies',
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => courseCompaniesCell(props as CourseResponse),
    },
    {
      className: 'min-w-[214px]',
      header: t('CoursesManagement.columnHeader.TrainingSpecialist'),
      name: 'course.training_specialist',
      cell: (props) => trainingSpecialistCell(props as CourseResponse),
    },
    {
      header: t('CoursesManagement.columnHeader.TrainerConfirmations'),
      name: 'course.trainerConfirmation',
      className: 'min-w-[250px]',
      cell: (props) => trainerConfirmationCell(props as CourseResponse, t),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      className: 'min-w-[136px]',
      header: t('CoursesManagement.columnHeader.FundedBy'),
      name: 'course.funded_by',
      cell: (props) => getFundedBy((props as unknown as Course)?.funded_by),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      className: 'min-w-[200px]',
      header: t('CoursesManagement.columnHeader.Actions'),
      cell: (props) => actionRender(props),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
  ];

  const headerDataCount = [...Array(columnData.length).keys()];

  let TrainerColumnData = [...columnData];

  const getFundedBy = (funded_by: string): string | JSX.Element => {
    if (!funded_by) return '-';
    const stringToArray = funded_by?.split(',');

    if (funded_by === 'NAN') {
      return '-';
    }

    const mappedElements = stringToArray?.map((data, index) => (
      <div key={`${index + 1}_fundedBy`} className="my-2">
        <StatusLabel text={data} className="w-full" />
      </div>
    ));

    return <div className="flex flex-col">{mappedElements}</div>;
  };

  if (user?.role_name === ROLES.Trainer) {
    const noHeader = {
      header: t('CoursesManagement.columnHeader.No'),
      name: 'no',
      className: '',
      option: {
        sort: false,
        hasFilter: false,
        isIndex: true,
      },
    };
    TrainerColumnData.unshift(noHeader);
    TrainerColumnData = TrainerColumnData.filter(
      (item) =>
        item.name !== 'course.training_specialist' &&
        item.name !== 'course.funded_by' &&
        item.name !== 'course.trainerConfirmation' &&
        item.name !== 'course.clientCompany' &&
        item.name !== 'course.code' &&
        item.name !== 'course.code_title'
    );
    const index = TrainerColumnData.findIndex(
      (item) => item.name === 'course.title'
    );
    TrainerColumnData.splice(index + 1, 0, {
      header: t('TrainerRegister.TrainingSpecialist'),
      cell: (props) => creatorRender(props),
      option: {
        sort: false,
        hasFilter: false,
      },
    });
  }

  const getUrl = (item?: CellProps) => {
    switch (user?.role_name) {
      case ROLES.Trainer:
        return {
          url: `/trainer/courses/view`,
          payLoad: activeTab,
        };

      default:
        return {
          url: `/courses/view`,
          payLoad: {
            status,
            isCourse: true,
            activeTab,
            type: item?.type,
            course_id: item?.id,
          },
        };
    }
  };

  const actionRender = (item: CellProps) => {
    const navigateUrl = getUrl(item);
    const isCourseInRange =
      item?.start_date && item?.end_date
        ? isCurrentDateInRange(item?.start_date, item?.end_date)
        : false;
    return (
      <div className="flex gap-2 items-center justify-center">
        {item && (
          <Button
            parentClass="h-fit"
            onClickHandler={() =>
              navigate(`${navigateUrl.url}/${item?.slug}${QueryParams}`, {
                state: navigateUrl.payLoad,
              })
            }
            className="action-button green-btn"
            tooltipText={t('Tooltip.View')}
          >
            <Image
              iconName="eyeIcon"
              iconClassName=" w-5 h-5"
              width={24}
              height={24}
            />
          </Button>
        )}
        {status === CourseStatus.publish && user?.role_name === ROLES.Trainer && (
          <>
            <Button
              parentClass="h-fit"
              className="action-button primary-btn"
              onClickHandler={() => {
                navigate(`/courses/attendance/${item?.slug}`, {
                  state: {
                    activeTab,
                    type: item?.type,
                  },
                });
              }}
              tooltipText={t('Tooltip.Attendance')}
            >
              <Image
                iconName="calendarCheckIcon"
                iconClassName="stroke-current w-5 h-5"
                width={24}
                height={24}
              />
            </Button>
            {isCourseInRange && item?.has_exam ? (
              <Link target="_blank" to={`/qr/${item?.slug}?mode=${EnumQRCode.Exam}`}>
                <Button
                  parentClass="h-fit"
                  className="action-button green-btn"
                  tooltipText={t('Tooltip.Exam')}
                >
                  <Image
                    iconName="receiptIcon"
                    iconClassName="stroke-current w-5 h-5"
                    width={24}
                    height={24}
                  />
                </Button>
              </Link>
            ) : (
              ''
            )}
            {!item?.has_exam ? (
              <Link
                target="_blank"
                to={`/qr/${item?.slug}?mode=${EnumQRCode.Survey}`}
              >
                <Button
                  parentClass="h-fit"
                  className="action-button green-btn"
                  tooltipText={t('Tooltip.Survey')}
                >
                  <Image
                    iconName="receiptIcon"
                    iconClassName="stroke-current w-5 h-5"
                    width={24}
                    height={24}
                  />
                </Button>
              </Link>
            ) : (
              ''
            )}
          </>
        )}
        {(status === CourseStatus.draft || status === CourseStatus.incomplete) &&
        user?.role_name !== ROLES.Trainer ? (
          <>
            {user?.role_name === ROLES.TrainingSpecialist ||
            user?.role_name === ROLES.Admin ? (
              <Button
                parentClass="h-fit"
                className="action-button primary-btn"
                onClickHandler={() => {
                  navigate(`/course-management/edit?slug=${item?.slug}`, {
                    state: {
                      activeTab,
                    },
                  });
                }}
                tooltipText={t('Tooltip.Edit')}
              >
                <Image
                  iconName="editIcon"
                  iconClassName="stroke-current w-5 h-5"
                  width={24}
                  height={24}
                />
              </Button>
            ) : (
              ''
            )}
            {
              // rolePermission?.delete ||
              // (deleteAccess && user?.id === item.created_by) ||
              // { !findTrainingSpecDeleteAccess}

              (user?.role_name === ROLES.TrainingSpecialist ||
                user?.role_name === ROLES.Admin) && (
                <Button
                  parentClass="h-fit"
                  className="action-button red-btn"
                  onClickHandler={() => {
                    setSelectedData(item as unknown as CourseResponse);
                    deleteModal?.openModal();
                  }}
                  tooltipText={t('Tooltip.Delete')}
                >
                  <Image
                    iconName="deleteIcon"
                    iconClassName="stroke-current w-5 h-5"
                  />
                </Button>
              )
            }
          </>
        ) : (
          ''
        )}

        {status === CourseStatus.draft &&
        (user?.role_name === ROLES.TrainingSpecialist ||
          user?.role_name === ROLES.Admin) ? (
          <Button
            parentClass="h-fit"
            className="action-button green-btn relative group"
            tooltipText={t('Tooltip.MarkAsPublic')}
            onClickHandler={() => {
              setSelectedData(item as unknown as CourseResponse);
              markAsPublishModal.openModal();
            }}
          >
            <Image iconName="publishIcon" iconClassName="w-4 h-4" />
          </Button>
        ) : (
          ''
        )}
      </div>
    );
  };

  const templateRender = (item: CellProps) => {
    const course = item as unknown as CourseResponse;
    const courseType = getCourseType(course?.type);
    const isPrivateCourse = courseType.toLowerCase() === COURSE_TYPE.Private;

    return (
      <div className="flex">
        <div className="w-[100px] h-[70px]">
          <Image
            src={course.image}
            width={100}
            height={100}
            imgClassName="w-full h-full object-cover rounded-lg"
            serverPath
          />
        </div>
        <div className="max-w-[220px] min-w-[200px] ps-2 flex-1">
          <p className="text-base text-dark leading-[1.3] mb-1 wordBreak">
            {course.title}
          </p>
          {isPrivateCourse && (
            <div className="flex flex-col">
              <p className="capitalize text-gray-500">{`(${courseType})`}</p>

              {course?.projects?.title && (
                <Button
                  className="cursor-pointer text-sm text-primary underline underline-offset-4 inline-block"
                  onClickHandler={() =>
                    navigate('/project-management-details', {
                      state: {
                        cardId: course?.projects?.card?.id,
                        activeTab,
                        url,
                      },
                    })
                  }
                >
                  {course?.projects?.title}
                </Button>
              )}
            </div>
          )}
          {!isPrivateCourse && (
            <p className="capitalize text-gray-500">{`(${courseType})`}</p>
          )}
        </div>
      </div>
    );
  };

  const creatorRender = (item: CellProps) => {
    return (
      <div className="max-w-[220px] min-w-[200px] ps-2 flex-1">
        <span className="text-base text-dark leading-[1.3] mb-1">
          {(item as unknown as CourseResponse)?.createdByUser?.first_name}{' '}
          {(item as unknown as CourseResponse)?.createdByUser?.last_name}
        </span>
      </div>
    );
  };

  const renderCode = (item: CellProps) => {
    const courseCode = (item as unknown as CourseResponse).code;
    const progressiveNumber = (item as unknown as CourseResponse).progressive_number;
    return (
      <div>
        <div className="px-1">{courseCode ?? '-'}</div>
        {progressiveNumber ? (
          <div>
            <span className="mt-1 text-sm w-fit leading-4 px-2.5 py-1.5 inline-flex items-center justify-center rounded-md  bg-green2/10 text-green2">
              {progressiveNumber}
            </span>
          </div>
        ) : (
          ''
        )}
      </div>
    );
  };

  const handleDelete = async () => {
    if (selectedData) {
      await courseDeleteApi(`/course/${selectedData?.slug}`);
      deleteModal.closeModal();
      refetch();
    }
  };

  const handleMarkAsPublish = async () => {
    if (selectedData) {
      await markAsPublished(`/course/mark-as-publish/${selectedData?.slug}`, {});
      markAsPublishModal.closeModal();
      refetch();
    }
  };

  const handleMarkAsSold = async () => {
    const { error } = await markAsSoldCourse(
      `/course/mark-as-sold-out/${selectedData?.slug}`,
      {}
    );
    if (!error) {
      markAsSoldOutModal.closeModal();
      refetch?.();
    }
  };

  const handleSorting = (val: ITableHeaderProps) => {
    const splitName = val.name?.split('.');
    const sortFieldName = splitName ? splitName[splitName.length - 1] : val.name;

    if (sortFieldName) {
      if (sort?.includes(`-${sortFieldName}`)) {
        setSort?.(sortFieldName);
        setIsSortAsc(true);
      } else {
        setSort?.(`-${sortFieldName}`);
        setIsSortAsc(false);
      }
    }
  };

  const renderSortIcon = () => (
    <Image
      iconClassName={`w-4 h-4 ${isSortAsc ? 'rotate-90' : '-rotate-90'}`}
      iconName="arrowRightIcon"
    />
  );

  useEffect(() => {
    setLimit(10);
    setSort('-updated_at');
  }, [status]);

  const startRecord = (Number(currentPage || 1) - 1) * Number(limit) + 1;
  const endRecord =
    Number(currentPage || 1) * Number(limit || 10) <= Number(response?.data?.count)
      ? Number(currentPage || 1) * Number(limit ?? 10)
      : response?.data?.count;

  const isDataAvailable = endRecord && startRecord <= endRecord;

  return (
    <>
      {deleteModal.isOpen && (
        <ConfirmationPopup
          modal={deleteModal}
          bodyText={t('CoursesManagement.CreateCourse.deleteText', {
            COURSE: selectedData?.title,
          })}
          confirmButtonText={t('Button.deleteButton')}
          confirmButtonVariant="danger"
          deleteTitle={t('Button.deleteTitle')}
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={() => {
            setSelectedData(null);
            deleteModal.closeModal();
          }}
          confirmButtonFunction={handleDelete}
        />
      )}
      {markAsPublishModal.isOpen && (
        <ConfirmationPopup
          modal={markAsPublishModal}
          bodyText={t('CoursesManagement.MarkAsPublish.bodyText', {
            COURSE: selectedData?.title,
          })}
          popUpType="primary"
          confirmButtonText={t('CoursesManagement.publish')}
          deleteTitle={t('CoursesManagement.MarkAsPublished')}
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={() => {
            setSelectedData(null);
            markAsPublishModal.closeModal();
          }}
          confirmButtonFunction={handleMarkAsPublish}
          isLoading={publishingCourse}
        />
      )}
      {user?.role_name === ROLES.Trainer || status !== CourseStatus.publish ? (
        <Table
          stickyActionColumn
          parentClassName="!p-0"
          headerData={TrainerColumnData}
          bodyData={response?.data?.data}
          loader={isLoading}
          pagination
          dataPerPage={limit}
          setLimit={setLimit}
          totalPage={response?.data?.lastPage}
          dataCount={response?.data?.count}
          setSort={setSort}
          sort={sort}
          width={user?.role_name === ROLES.Trainer ? 'min-w-full' : 'min-w-[1700px]'}
        />
      ) : (
        <div className="main-table bg-white rounded-xl">
          <div className="table-wrapper relative bg-[#FBFBFC] rounded-xl p-4 border border-borderColor/50">
            <div
              className={`overflow-auto max-w-full min-h-[calc(100dvh_-_355px)] `}
            >
              <table className="datatable-main w-full text-sm text-left rtl:text-right text-dark border border-borderColor/0 sticky-action-column">
                <thead>
                  <tr>
                    {columnData.map((val, index) => (
                      <th
                        key={`header_${index + 1}`}
                        scope="col"
                        className={`group/tbl ${val.className}`}
                      >
                        <span className="flex items-center select-none whitespace-nowrap group-first/tbl:justify-center group-last/tbl:justify-end">
                          {val.header}
                          {val?.option?.sort ? (
                            <Button
                              className="w-4 h-4 ms-1 opacity-0 group-hover/tbl:opacity-100"
                              onClickHandler={() => handleSorting(val ?? '')}
                            >
                              {val?.option?.sort && renderSortIcon()}
                            </Button>
                          ) : (
                            ''
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? tableLazyCount.map((_, i) => {
                        return (
                          <tr key={`Key_${i + 1}`}>
                            {headerDataCount.map((_, j) => {
                              return (
                                <td key={`Key_${j + 1}`}>
                                  <div className="relative w-full flex items-center">
                                    <div className="lazy w-full h-10 rounded-lg" />
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    : ''}
                  {!isLoading && _.isEmpty(response?.data?.data) && (
                    <tr>
                      <td className="" colSpan={columnData?.length}>
                        <NoDataFound message={t('Table.noDataFound')} />
                      </td>
                    </tr>
                  )}
                  {!isLoading && !_.isEmpty(response?.data?.data)
                    ? (response?.data?.data ?? []).map(
                        (item: CourseResponse, index: number) => (
                          <ExpandableCourseRow
                            refetch={refetch}
                            item={item}
                            index={index}
                            limit={response?.data?.limit}
                            count={response?.data?.count}
                            key={`Bundle_${index + 1}`}
                            status={status}
                            activeTab={activeTab}
                            markAsSoldOutModal={markAsSoldOutModal}
                            setSelectedCourse={setSelectedData}
                            addModal={addModal}
                          />
                        )
                      )
                    : ''}
                </tbody>
              </table>
            </div>
          </div>
          {limit && !isLoading && response?.data?.lastPage ? (
            <div className="mt-5 flex flex-wrap justify-between gap-5 items-center">
              {status === CourseStatus.publish && (
                <p className="text-sm text-grayText font-medium">
                  {isDataAvailable
                    ? `${t('Table.showing')} ${startRecord} ${t(
                        'Table.to'
                      )} ${endRecord} ${t('Table.of')} ${response?.data?.count} ${t(
                        'Table.records'
                      )}`
                    : ``}
                </p>
              )}
              <Pagination
                setLimit={setLimit}
                currentPage={currentPage ?? 1}
                dataPerPage={limit}
                dataCount={response?.data?.count}
                totalPages={response?.data?.lastPage}
                isShow
              />
            </div>
          ) : (
            ''
          )}
          {addModal.isOpen ? (
            <AddModal
              modal={addModal}
              selectedCourse={selectedData}
              refetch={refetch}
              mainModal={addModal}
            />
          ) : (
            ''
          )}
        </div>
      )}
      {markAsSoldOutModal.isOpen && (
        <ConfirmationPopup
          modal={markAsSoldOutModal}
          bodyText={t('PublishCourse.markAsSoldOutBodyText', {
            COURSE: selectedData?.title,
          })}
          popUpType="primary"
          confirmButtonText={t('PublishCourse.soldOut')}
          deleteTitle={t('PublishCourse.markAsSoldButton')}
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={() => {
            setSelectedData(null);
            markAsSoldOutModal.closeModal();
          }}
          confirmButtonFunction={handleMarkAsSold}
          isLoading={markAsSoldOutLoading}
        />
      )}
    </>
  );
};

export default CourseManagement;
