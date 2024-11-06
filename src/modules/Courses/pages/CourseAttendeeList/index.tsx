import Button from 'components/Button/Button';
import Image from 'components/Image';
import StatusLabel from 'components/StatusLabel';
import Table from 'components/Table/Table';
import { ITableHeaderProps } from 'components/Table/types';
import { REACT_APP_ENCRYPTION_KEY } from 'config';
import { useAxiosGet } from 'hooks/useAxios';
import { useTitle } from 'hooks/useTitle';
import 'modules/Client/styles/index.css';
import { FetchAttendeeDetails } from 'modules/CompanyManager/types';
import { ParticipantData } from 'modules/Courses/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { FilterStatus } from 'types/common';
import { aesEncrypt } from 'utils/encrypt';

type attendeeProps = {
  bundleId?: number;
  filterApply?: FilterStatus;
};
interface Company {
  logo: string;
  name: string;
  id: number;
  slug: string;
}
const CourseAttendeeList = ({ bundleId, filterApply }: attendeeProps) => {
  const [getCompanies] = useAxiosGet();
  const updateTitle = useTitle();
  const [getCourseParticipants, { isLoading }] = useAxiosGet();
  const [participants, setParticipants] = useState<ParticipantData>();
  const params = useParams();
  const [limit, setLimit] = useState<number>(10);
  const { currentPage } = useSelector(currentPageSelector);

  const [companies, setCompanies] = useState<Company[]>();
  const [sort, setSort] = useState<string>('-updated_at');
  const { t } = useTranslation();
  const [companyId, setCompanyId] = useState<number>();
  const navigate = useNavigate();

  const KEY = REACT_APP_ENCRYPTION_KEY ?? '';

  useEffect(() => {
    if (bundleId) {
      getAllCompanies();
    }
  }, [bundleId]);

  useEffect(() => {
    if (bundleId) {
      if (companyId) {
        getParticipants();
      }
    } else {
      getParticipants();
    }
  }, [companyId, filterApply, currentPage, limit]);

  const getAllCompanies = async () => {
    const resp = await getCompanies(`/courses/bundle/companies`, {
      params: {
        course_bundle_id: bundleId,
      },
    });
    if (resp?.data) {
      setCompanies(resp?.data?.data);
      setCompanyId(resp?.data?.data?.[0]?.id);
    }
  };
  const getParticipants = async () => {
    const apiUrl = bundleId ? `/course/participates/bundle` : `/course/participates`;
    const temp: { [key: string]: string | number } = {};

    const companiesData =
      filterApply?.companies && filterApply?.companies?.length > 0
        ? filterApply?.companies?.join(',')
        : {};

    if (apiUrl === `/course/participates`) {
      temp.page = currentPage;
      temp.limit = limit;
    }
    if (bundleId) {
      if (companyId) {
        temp.course_bundle_id = bundleId;
        temp.company_id = companyId;
      }
    } else if (params?.slug) temp.course_slug = params?.slug;
    const resp = await getCourseParticipants(apiUrl, {
      params: { ...temp, companies: companiesData },
    });
    if (resp?.data) {
      setParticipants(resp?.data);
    }
  };
  const nameRender = (item: FetchAttendeeDetails) => {
    // if (item?.full_name?.length > 15) {
    //   item.full_name = `${item.full_name.substring(0, 15)}...`;
    // }
    return (
      <div className="flex flex-col">
        <span>{item?.first_name}</span>
        {item?.recovered_from_course_id ? (
          <StatusLabel text={t('RecoveredCourse.recovered')} variants="completed" />
        ) : (
          ''
        )}
      </div>
    );
  };
  const renderRecoveredCourse = (item: FetchAttendeeDetails) => {
    return (
      <div className="flex flex-col">
        {item?.recovered_from_course_id ? (
          <Button
            onClickHandler={() => {
              const companyId = item?.company_id ? item?.company_id?.toString() : '';
              const encryptedCompany = aesEncrypt(companyId, KEY);
              navigate(
                `/courses/company/attendance-timesheet/${item?.recoverCourse?.slug}/${encryptedCompany}/${item?.slug}`,
                {
                  state: {
                    courseSlug: item?.recoverCourse?.slug,
                    companyId: item?.company_id,
                    participateSlug: item?.slug,
                    url: `/courses/view/${item?.course?.slug}`,
                    status: 'publish',
                    corseActiveTab: 'viewAttendees',
                  },
                }
              );
            }}
          >
            {item?.recoverCourse?.title}
          </Button>
        ) : (
          '-'
        )}
      </div>
    );
  };

  const columnData: ITableHeaderProps[] = [
    {
      header: t('UserManagement.columnHeader.no'),
      name: 'no',
      className: '',
      option: {
        sort: false,
        hasFilter: false,
        isIndex: true,
      },
    },
    {
      header: t('Auth.RegisterManager.firstname'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => nameRender(props as unknown as FetchAttendeeDetails),
    },
    {
      name: 'last_name',
      header: t('Auth.RegisterManager.lastname'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      name: 'company.name',
      header: t('ClientManagement.clientColumnTitles.clientTitle'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      name: 'code',
      header: t('socialSecurityNumber'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      name: 'email',
      header: t('CompanyManager.AttendeeList.columnsTitles.emailId'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      name: 'mobile_number',
      header: t('CompanyManager.AttendeeList.columnsTitles.mobileNo'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      name: 'job_title',
      header: t('CompanyManager.AttendeeList.columnsTitles.role'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('RecoveredCourse.title'),
      option: {
        sort: true,
        hasFilter: false,
      },
      cell: (props) =>
        renderRecoveredCourse(props as unknown as FetchAttendeeDetails),
    },
  ];

  updateTitle(t('CompanyManager.AttendeeList.title'));
  return (
    <div className={`${bundleId ? 'flex gap-1' : ''} `}>
      {bundleId && (
        <div className="table-wrapper relative bg-[#FBFBFC] rounded-[1.875rem] border border-borderColor/50">
          <div className="overflow-auto max-w-full w-[330px] min-h-[calc(100dvh_-_355px)] py-2">
            <h3 className="text-xl font-bold text-dark px-4 mb-1 py-2">
              {t('Quote.filter.companyTitle')}
            </h3>
            {companies &&
              companies?.length > 0 &&
              companies?.map((item) => {
                return (
                  <Button
                    onClickHandler={() => setCompanyId(item?.id)}
                    className={`flex px-4 gap-4 items-center py-2 border-l-4 ${
                      companyId && item?.id === companyId
                        ? 'border-[#C2FF00]'
                        : 'border-[#FBFBFC]'
                    } `}
                    key={item?.id}
                  >
                    {item?.logo && (
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={item?.logo}
                          imgClassName="w-full h-full object-cover"
                          serverPath
                        />
                      </div>
                    )}
                    <p
                      className={`grow text-base ${
                        companyId && item?.id === companyId
                          ? 'text-black font-bold'
                          : 'text-grayText'
                      }   line-clamp-1`}
                    >
                      {item?.name}
                    </p>
                  </Button>
                );
              })}
          </div>
        </div>
      )}

      <Table
        parentClassName="main-table bg-white rounded-[1.875rem] w-full max-w-full overflow-auto flex-1"
        tableRoundedRadius="!rounded-[1.875rem]"
        headerData={columnData}
        bodyData={participants?.data}
        loader={isLoading}
        pagination
        dataPerPage={limit}
        setLimit={setLimit}
        totalPage={participants?.lastPage}
        dataCount={participants?.count}
        setSort={setSort}
        sort={sort}
        tableHeightClassName="!min-h-[unset]"
      />
    </div>
  );
};

export default CourseAttendeeList;
