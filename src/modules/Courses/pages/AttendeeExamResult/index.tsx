// ** Components ***
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import StatusLabel from 'components/StatusLabel';
import Table from 'components/Table/Table';
import SearchComponent from 'components/Table/search';
import MisMatchRecords from 'modules/Courses/components/AttendeeExamResult/MisMatchRecords';

// ** Types ***
import { IconTypes } from 'components/Icon/types';
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import { CourseResponse } from 'modules/Courses/types';
import {
  AttendeeExamList,
  AttendeeHeaderCompany,
  AttendeeHeaderPrivateIndividual,
  AttendeeList,
  AttendeeListWithData,
} from 'modules/Courses/types/survey';

// ** Hooks ***
import { useAxiosGet, useAxiosPut } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

// ** Slices ***
import {
  currentPageCount,
  currentPageSelector,
} from 'redux-toolkit/slices/paginationSlice';

// ** Utils ***
import { REACT_APP_DATE_FORMAT } from 'config';
import { format } from 'date-fns';
import _ from 'lodash';
import { useDebounce } from 'utils';
import ToolTip from 'components/Tooltip';

const AttendeeExamResult = () => {
  const { t } = useTranslation();
  const { state } = useLocation();
  const params = useParams();
  const [search, setSearch] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [MisMatchRecord] = useAxiosPut();
  const { currentPage } = useSelector(currentPageSelector);
  const [AttendeeFail] = useAxiosGet();
  const [GenerateCertificate, { isLoading: isCertificateLoading }] = useAxiosGet();
  const [course, setCourse] = useState<CourseResponse>();
  const [AttendeeHeader] = useAxiosGet();
  const [FetchAttendeeList, { isLoading: AttendeesLoading }] = useAxiosGet();
  const navigate = useNavigate();
  const { courseSlug } = useParams();
  const currentURL = new URL(window.location.href);
  const companySlug = currentURL.searchParams.get('company');
  const privateIndividualSlug = currentURL.searchParams.get('private_individual');
  const MisMatchModal = useModal();
  const dispatch = useDispatch();
  const debouncedSearch = useDebounce(search, 500);
  const [attendeeList, setAttendeeList] = useState<AttendeeList | null>(null);
  const [attendeeHeader, setAttendeeHeader] = useState<
    AttendeeHeaderCompany | AttendeeHeaderPrivateIndividual | null
  >(null);

  const [selectedData, setSelectedData] = useState<AttendeeExamList>();
  const columnData: ITableHeaderProps[] = [
    {
      header: t('Table.no.'),
      name: 'no',
      className: '',
      option: {
        sort: false,
        hasFilter: false,
        isIndex: true,
      },
    },
    {
      name: 'first_name',
      header: t('attendees.exam.result.firstNameTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      name: 'last_name',
      header: t('attendees.exam.result.lastNameTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      name: 'course_participate.code',
      header: t('attendees.exam.result.codeTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      name: 'is_submit',
      header: t('attendees.exam.result.examSubmitTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },

      cell: (props) => examSubmittedRender(props as unknown as AttendeeExamList),
    },
    {
      name: 'attempts',
      header: t('attendees.exam.result.attemptsTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      name: 'status',
      header: t('attendees.exam.result.statusTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => statusRender(props as unknown as AttendeeExamList),
    },
    {
      header: t('Table.action'),
      cell: (props: CellProps) => actionRender(props),
    },
  ];
  const { response } = useQueryGetFunction('/course', {
    option: {
      getByParentSlug: state?.publish_course_slug ?? params?.courseSlug,
    },
  });
  useEffect(() => {
    setCourse(response?.data?.data[0]);
  }, [response]);

  useEffect(() => {
    getAttendeeHeader();
  }, []);
  useEffect(() => {
    getAttendeeList();
  }, [debouncedSearch, currentPage]);

  useEffect(() => {
    if (state?.isModalOpen) {
      MisMatchModal.openModal();
    }
  }, []);

  const getAttendeeList = async () => {
    const objToPass: { [key: string]: unknown } = {
      search: debouncedSearch,
      limit,
      page: currentPage,
      course_slug: state?.publish_course_slug,
      company_slug: state?.company_slug,
    };
    const res = await FetchAttendeeList('/exam/attendees-result', {
      params: objToPass,
    });
    setAttendeeList(res);
  };

  const getAttendeeHeader = async () => {
    const objToPass: { [key: string]: unknown } = {};
    if (!_.isEmpty(state)) {
      if (
        (_.isNull(state.private_individualId) ||
          _.isUndefined(state.private_individualId)) &&
        (!_.isNull(state.company_slug) || !_.isUndefined(state.company_slug))
      ) {
        objToPass.company_slug = state.company_slug;
      }
      if (
        (!_.isNull(state.private_individualId) ||
          !_.isUndefined(state.private_individualId)) &&
        (!_.isNull(state.private_individualSlug) ||
          !_.isUndefined(state.private_individualSlug))
      ) {
        objToPass.private_individual_slug = state.private_individualSlug;
      }
    } else {
      if (!_.isNil(companySlug)) {
        objToPass.company_slug = companySlug;
      }
      if (!_.isNil(privateIndividualSlug)) {
        objToPass.private_individual_slug = privateIndividualSlug;
      }
      objToPass.course_slug = courseSlug;
    }
    const res = await AttendeeHeader('/get-details-by-slug', {
      params: objToPass,
    });
    if (Object.hasOwn(objToPass, 'course_slug')) {
      setAttendeeHeader(res?.data as AttendeeHeaderCompany);
    }
    if (Object.hasOwn(objToPass, 'private_individual_slug')) {
      setAttendeeHeader(res?.data as AttendeeHeaderPrivateIndividual);
    }
  };

  const examSubmittedRender = (item: AttendeeExamList) => {
    const ExamSubmit = item.is_submit;
    return (
      <div>
        {ExamSubmit === true
          ? t('confirmationChoices.yesOption')
          : t('confirmationChoices.noOption')}
      </div>
    );
  };

  const renderActionButton = (
    iconName: string,
    tooltipText: string,
    onClick?: () => void,
    id?: string,
    isLoading = false
  ) => (
    <Button
      parentClass="h-fit"
      className={`action-button ${
        iconName === 'eyeIcon' ? 'green-btn' : 'primary-btn'
      }`}
      tooltipText={tooltipText}
      onClickHandler={onClick}
      key={`tooltip_${Math.random()}`}
    >
      {isLoading && selectedData?.id === id && iconName === 'downloadFile' && (
        <Image loaderType="Spin" />
      )}
      {isLoading && selectedData?.id === id && iconName === 'downloadFile' ? (
        <></>
      ) : (
        <Image
          iconName={iconName as IconTypes}
          iconClassName="w-5 h-5"
          width={24}
          height={24}
        />
      )}
    </Button>
  );
  const actionRender = (item: CellProps) => {
    const renderButtons = (buttons: React.ReactElement | React.ReactElement[]) => {
      return (
        <div className="flex gap-2 items-center justify-center ms-auto">
          {buttons}
        </div>
      );
    };
    const itemSlug = item as unknown as AttendeeExamList;
    const handleViewClick = () => {
      navigate(
        `/attendee/exam-result/${itemSlug.exam_participate.slug}/${itemSlug.slug}`,
        {
          state,
        }
      );
    };

    const handleMisMatchClick = () => {
      setSelectedData(itemSlug);
      MisMatchModal.openModal();
    };

    const handleFailClick = async () => {
      const response = await AttendeeFail(`/exam/mark-as-fail`, {
        params: {
          exam_participate_slug: itemSlug.slug,
        },
      });
      if (response.data === true) {
        getAttendeeList();
      }
    };
    const handleViewCourseParticipate = () => {
      navigate(`/attendee/view/participate/${itemSlug?.course_participate?.slug}`, {
        state,
      });
    };

    const DownloadCertificate = async () => {
      setSelectedData(itemSlug);
      const response = await GenerateCertificate(`/generate-certificate`, {
        params: {
          course_slug: courseSlug,
          course_participate_slug: itemSlug?.course_participate.slug,
        },
      });
      if (response?.data) {
        window.open(response.data, '_blank');
      }
    };

    switch (item.status) {
      case 'pending':
        return renderButtons(
          [
            item.course_participate_id !== null &&
              renderActionButton('eyeIcon', t('Tooltip.View'), handleViewClick),
            item.course_participate_id === null
              ? renderActionButton(
                  'linkIcon3',
                  t('Tooltip.MisMatch'),
                  handleMisMatchClick
                )
              : null,
            itemSlug.is_submit === false &&
              renderActionButton(
                'exclamationMarkIcon',
                t('Tooltip.MarkAsFail'),
                handleFailClick
              ),
            item.course_participate_id !== null
              ? renderActionButton(
                  'userIcon2',
                  t('Tooltip.viewCourseParticipate'),
                  handleViewCourseParticipate
                )
              : null,
          ].filter(Boolean) as React.ReactElement[]
        );
      case 'pass':
        return renderButtons(
          [
            item.course_participate_id !== null &&
              renderActionButton('eyeIcon', t('Tooltip.View'), handleViewClick),
            item.course_participate_id === null
              ? renderActionButton(
                  'linkIcon3',
                  t('Tooltip.MisMatch'),
                  handleMisMatchClick
                )
              : null,
            item.course_participate_id !== null
              ? renderActionButton(
                  'userIcon2',
                  t('Tooltip.viewCourseParticipate'),
                  handleViewCourseParticipate
                )
              : null,
            item.course_participate_id !== null &&
              renderActionButton(
                'downloadFile',
                t('Tooltip.Download'),
                DownloadCertificate,
                itemSlug?.id,
                isCertificateLoading
              ),
          ].filter(Boolean) as React.ReactElement[]
        );
      default:
        return renderButtons(
          [
            item.course_participate_id !== null &&
              renderActionButton('eyeIcon', t('Tooltip.View'), handleViewClick),
            item.course_participate_id === null
              ? renderActionButton(
                  'linkIcon3',
                  t('Tooltip.MisMatch'),
                  handleMisMatchClick
                )
              : null,
            item.course_participate_id !== null
              ? renderActionButton(
                  'userIcon2',
                  t('Tooltip.viewCourseParticipate'),
                  handleViewCourseParticipate
                )
              : null,
          ].filter(Boolean) as React.ReactElement[]
        );
    }
  };
  const handleSubmit = async (data: string) => {
    const response = await MisMatchRecord(`exam/update-participateId`, {
      exam_participate_slug: selectedData?.slug,
      course_participate_id: data,
    });
    if (response.data) {
      MisMatchModal.closeModal();
      getAttendeeList();
    }
  };
  const statusRender = (item: AttendeeExamList) => {
    const getStatusClass = () => {
      switch (
        item.course_participate_id ? item.status_without_attendance : item.status
      ) {
        case 'pass':
          return 'completed';
        case 'requested':
          return 'pending';
        case 'rejected':
          return 'cancelled';
        default:
          return 'pending';
      }
    };

    const statusClasses = ` ${getStatusClass()}`;

    return (
      <StatusLabel
        text={
          item.course_participate_id ? item.status_without_attendance : item.status
        }
        variants={getStatusClass()}
        className={`${statusClasses ?? ''}`}
      />
    );
  };

  const findPrivateIndividualOrCompany = () => {
    let isCompany = false;
    let isPrivateIndividual = false;
    if (!_.isNil(state?.private_individualId) || !_.isNil(companySlug)) {
      isCompany = true;
    }
    if (!_.isNil(state?.private_individualId) || !_.isNil(privateIndividualSlug)) {
      isPrivateIndividual = true;
    }
    return { isCompany, isPrivateIndividual };
  };

  const renderImage = () => {
    const { isCompany, isPrivateIndividual } = findPrivateIndividualOrCompany();
    if (isCompany) {
      return (
        <Image
          src={
            (attendeeHeader as AttendeeHeaderCompany)?.logo ?? '/images/no-image.png'
          }
          serverPath
        />
      );
    }
    if (isPrivateIndividual) {
      return (
        <Image
          src={
            (attendeeHeader as AttendeeHeaderPrivateIndividual)?.profile_image ??
            '/images/no-image.png'
          }
          serverPath
        />
      );
    }
  };

  const renderDetails = () => {
    const { isCompany, isPrivateIndividual } = findPrivateIndividualOrCompany();
    let title = '';
    let address1 = '';
    let address2 = '';
    if (isCompany) {
      title = (attendeeHeader as AttendeeHeaderCompany)?.name as string;
      address1 = (attendeeHeader as AttendeeHeaderCompany)?.address1;
      address2 = (attendeeHeader as AttendeeHeaderCompany)?.address2 as string;
    }
    if (isPrivateIndividual) {
      title = (attendeeHeader as AttendeeHeaderPrivateIndividual)?.full_name;
      address1 = (attendeeHeader as AttendeeHeaderCompany)?.address1;
      address2 = (attendeeHeader as AttendeeHeaderCompany)?.address2 as string;
    }

    return { title, address1, address2 };
  };
  const { title, address1, address2 } = renderDetails();

  const bodyData = (
    attendeeList?.data?.data as unknown as AttendeeListWithData[]
  )?.map((res: AttendeeListWithData) => {
    return res.data[res.data.length - 1];
  });
  return (
    <>
      <PageHeader
        small
        text={t('attendees.exam.title')}
        customHandleBack={() => {
          navigate(
            `/courses/company-list/${state?.publish_course_slug ?? courseSlug}`,
            {
              state: {
                activeTab: state?.activeTab,
                publish_course_slug: state?.publish_course_slug,
                status: state?.status,
              },
            }
          );
          dispatch(currentPageCount({ currentPage: 1 }));
        }}
        url={`/courses/company-list/${state?.publish_course_slug ?? courseSlug}`}
      >
        <div className="flex flex-wrap justify-end gap-2">
          <SearchComponent
            onSearch={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(e?.target?.value);
            }}
            value={search}
            placeholder={t('Table.tableSearchPlaceholder')}
            onClear={() => {
              setSearch('');
            }}
          />
        </div>
      </PageHeader>
      <div className="flex flex-col gap-y-5">
        <CustomCard minimal>
          <div className="grid grid-cols-2 gap-10">
            {course && (
              <div className="flex items-center">
                {course?.image && (
                  <div className="h-32 w-[220px] rounded-md">
                    <Image
                      src={course?.image}
                      imgClassName="w-full h-full object-cover"
                      serverPath
                    />
                  </div>
                )}
                <div className="ps-6 max-w-[calc(100%_-_220px)]">
                  <div className="max-w-[360px] flex flex-col gap-y-3.5">
                    {course?.courseCategory?.name && (
                      <div className="flex flex-wrap">
                        <Button className="text-sm leading-4 text-secondary last:after:hidden after:mx-1.5 after:content-['•']">
                          {course?.courseCategory?.name}
                        </Button>
                        <Button className="text-sm leading-4 text-secondary last:after:hidden after:mx-1.5 after:content-['•']">
                          {course?.courseSubCategory?.name}
                        </Button>
                      </div>
                    )}
                    <h4 className="text-lg font-semibold text-dark leading-6">
                      {course?.title}
                    </h4>
                    <div className="flex flex-wrap">
                      <p className="text-sm leading-4 text-dark/50 font-medium flex items-center w-full mb-2">
                        {t('companyCard.trainerDuration')}
                      </p>
                      <p className="text-sm leading-4 text-dark flex items-center after:mx-2.5 after:opacity-50 after:block after:content-['|']">
                        <div className="member-wrapper flex items-center gap-1">
                          <div className="flex">
                            {!_.isEmpty(course?.lessonApproval) &&
                              course?.lessonApproval?.map((trainer, index) => {
                                return (
                                  <div
                                    key={`trainer_${index + 1}`}
                                    className="member-img-div relative group"
                                  >
                                    <ToolTip
                                      position="top"
                                      text={trainer?.assignedToUser}
                                    />
                                    <Image
                                      imgClassName="w-full h-full rounded-full object-cover"
                                      width={40}
                                      height={40}
                                      alt="memberImage"
                                      src={
                                        trainer?.profile_image ??
                                        '/images/member.png'
                                      }
                                      serverPath
                                    />
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </p>
                      <p className="text-sm leading-4 text-dark flex items-center">
                        <Button className="w-[18px] h-[18px] inline-block me-1.5 opacity-50">
                          <Image
                            iconName="calendarIcon2"
                            iconClassName="w-full h-full"
                          />
                        </Button>
                        {course?.start_date
                          ? `${format(
                              new Date(course?.start_date ?? ''),
                              REACT_APP_DATE_FORMAT as string
                            )}`
                          : ''}

                        {course?.lessons?.[0]?.lesson_sessions[0]?.start_time
                          ? ` - ${format(
                              new Date(
                                course?.lessons?.[0]?.lesson_sessions[0]
                                  ?.start_time ?? ''
                              ),
                              'hh:mm'
                            )}`
                          : ''}
                        {course?.lessons?.[0]?.lesson_sessions[0]?.end_time
                          ? ` - ${format(
                              new Date(
                                course?.lessons?.[0]?.lesson_sessions[0]?.end_time ??
                                  ''
                              ),
                              'hh:mm'
                            )}`
                          : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!_.isEmpty(attendeeHeader) && (
              <div
                className={` relative before:absolute before:content-[''] before:h-[60%] ${
                  !_.isEmpty(attendeeList?.data?.data) &&
                  'before:w-px before:bg-gray-200'
                } before:top-1/2 before:-translate-y-1/2`}
              >
                <div className="ms-6 max-w-[550px] mx-auto">
                  <div className="flex flex-wrap gap-2.5 items-center mb-4">
                    <div className="w-16 h-10 border border-solid border-borderColor rounded-md overflow-hidden">
                      {renderImage()}
                    </div>
                    <Button className="text-lg font-bold leading-7">{title}</Button>
                  </div>
                  {address1 && (
                    <p className="text-lg font-semibold leading-[1.2] text-primary">
                      {address1} {address2 ? `,${address2}` : ''}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CustomCard>
        <CustomCard>
          <Table
            headerData={columnData}
            bodyData={bodyData}
            loader={AttendeesLoading}
            pagination
            dataPerPage={limit}
            setLimit={setLimit}
            totalPage={attendeeList?.data?.lastPage}
            dataCount={attendeeList?.data?.count}
            setSort={setSort}
            sort={sort}
            rowClass="!bg-[#e5e5e5]"
            renderRowClass={(props: CellProps) => {
              const attendeeProps = props as unknown as AttendeeExamList;
              return attendeeProps.course_participate_id === null;
            }}
          />
        </CustomCard>
      </div>
      {MisMatchModal?.isOpen && (
        <MisMatchRecords
          modal={MisMatchModal}
          onSubmit={(data: string) => handleSubmit(data)}
          courseSlug={courseSlug}
        />
      )}
    </>
  );
};

export default AttendeeExamResult;
