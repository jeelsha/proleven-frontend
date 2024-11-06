// ** imports **
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

// ** components **
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Image from 'components/Image';
import StatusLabel from 'components/StatusLabel';
import Table from 'components/Table/Table';

// ** types **
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import {
  AttendeeExamList,
  AttendeeExamListWithData,
} from 'modules/Courses/types/survey';

// ** hooks **
import { useQueryGetFunction } from 'hooks/useQuery';

// ** redux **
import { useCompany } from 'redux-toolkit/slices/companySlice';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';

const AttendeeExamListing = ({
  setSlugObj,
}: {
  setSlugObj: Dispatch<
    SetStateAction<{ examSlug: string; participateSlug: string }>
  >;
}) => {
  const { t } = useTranslation();
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const { currentPage } = useSelector(currentPageSelector);
  const { slug } = useParams();
  const ActiveCompany = useSelector(useCompany);
  const { response: AttendeeList, isLoading: AttendeesLoading } =
    useQueryGetFunction(`/exam/attendees-result`, {
      limit,
      page: currentPage,
      option: {
        course_slug: slug,
        company_slug: ActiveCompany?.company?.slug,
      },
    });
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

  const actionRender = (item: CellProps) => {
    const itemSlug = item as unknown as AttendeeExamList;
    return (
      <div className="flex gap-2 items-center justify-center ms-auto">
        {itemSlug.is_submit && (
          <Button
            parentClass="h-fit"
            className="action-button green-btn"
            tooltipText={t('Tooltip.View')}
            onClickHandler={() => {
              setSlugObj({
                examSlug: itemSlug.exam_participate.slug,
                participateSlug: itemSlug.slug,
              });
            }}
          >
            <Image
              iconName="eyeIcon"
              iconClassName=" w-5 h-5"
              width={24}
              height={24}
            />
          </Button>
        )}
      </div>
    );
  };

  const statusRender = (item: AttendeeExamList) => {
    const getStatusClass = () => {
      switch (item.status_without_attendance) {
        case 'pass':
          return 'completed';
        case 'pending':
          return 'pending';
        case 'fail':
          return 'cancelled';
        case 'rejected':
          return 'cancelled';
        default:
          return 'pending';
      }
    };

    const statusClasses = ` ${getStatusClass()}`;

    return (
      <StatusLabel
        text={item.status_without_attendance}
        variants={getStatusClass()}
        className={`${statusClasses ?? ''}`}
      />
    );
  };
  const bodyData = AttendeeList?.data?.data?.map((res: AttendeeExamListWithData) => {
    return res.data[res.data.length - 1];
  });
  return (
    <div className="flex flex-col gap-y-5">
      {AttendeesLoading ? (
        <div className="flex items-center justify-center">
          <Image loaderType="Spin" />
        </div>
      ) : (
        <CustomCard>
          {bodyData && (
            <Table
              headerData={columnData}
              bodyData={bodyData}
              loader={AttendeesLoading}
              pagination
              dataPerPage={limit}
              setLimit={setLimit}
              totalPage={AttendeeList?.data?.lastPage}
              dataCount={AttendeeList?.data?.count}
              setSort={setSort}
              sort={sort}
            />
          )}
        </CustomCard>
      )}
    </div>
  );
};

export default AttendeeExamListing;
