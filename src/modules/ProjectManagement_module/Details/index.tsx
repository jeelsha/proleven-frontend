import { format, parseISO } from 'date-fns';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// ** style **
import '@caldwell619/react-kanban/dist/styles.css';
import '../style/index.css';

// ** component **
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Image from 'components/Image';
import NoDataFound from 'components/NoDataFound';
import PageHeader from 'components/PageHeader/PageHeader';
import StatusLabel from 'components/StatusLabel';
import Table from 'components/Table/Table';
import ActivityDisplay from '../components/ActivityDisplay';

// ** type **
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import { QuoteResponseValues } from 'modules/Quotes/types';
import { Cards, IQuote, ProjectQuote } from '../types';

// ** constant **
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';

// ** utils **
import { REACT_APP_DATE_FORMAT } from 'config';
import { useTitle } from 'hooks/useTitle';
import { formatCurrency, getCurrencySymbol } from 'utils';
import { convertIMG, useGetCardDetail } from '../utils';

// Initial value of the board
export const initialBoard = {
  columns: [],
};

const ProjectManagementDetailsModule = () => {
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();

  const { state } = useLocation();
  const navigate = useNavigate();

  const { getCardDetail } = useGetCardDetail();

  const [projectDetail, setProjectDetail] = useState<Cards>();
  const [quotes, setQuotes] = useState<ProjectQuote[]>([]);
  const [sliceBy, setSliceBy] = useState({
    courseSlice: 2,
  });

  updateTitle(t('ProjectManagementDetailPage.cardDetailTitle'));

  const defaultDueDate =
    projectDetail?.project?.due_date &&
    format(
      parseISO(projectDetail?.project?.due_date),
      REACT_APP_DATE_FORMAT as string
    );

  useEffect(() => {
    const url = '/boards/project-management/card/';

    if (!_.isEmpty(state)) {
      getCardDetail({
        url,
        card_id: state.cardId,
        setInitialBoardCard: setProjectDetail as React.Dispatch<
          React.SetStateAction<Cards>
        >,
      });
    }
  }, []);

  useEffect(() => {
    if (projectDetail?.project?.project_quotes) {
      const arr = projectDetail.project.project_quotes.map(
        (item: IQuote) => item?.quote
      );
      if (arr) setQuotes(arr as ProjectQuote[]);
    }
  }, [projectDetail]);

  const dateRender = (item: QuoteResponseValues) => {
    return (
      <div>
        {item?.date
          ? format(new Date(item?.date), REACT_APP_DATE_FORMAT as string)
          : '-'}
      </div>
    );
  };

  const statusRender = (item: QuoteResponseValues) => {
    const getStatusClass = () => {
      switch (item.status) {
        case 'approved':
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
        text={item.status}
        variants={getStatusClass()}
        className={`${statusClasses ?? ''}`}
      />
    );
  };

  const columnData: ITableHeaderProps[] = [
    {
      name: 'quote_number',
      header: t('Quote.columnsTitle.quoteNumber'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('Quote.columnsTitle.date'),
      cell: (props) => dateRender(props as unknown as QuoteResponseValues),
    },
    {
      name: 'status',
      header: t('Quote.columnsTitle.status'),
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props) => statusRender(props as unknown as QuoteResponseValues),
    },
    {
      name: 'destination_email',
      header: t('Quote.columnsTitle.email'),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('Table.action'),
      cell: (props: CellProps) => actionRender(props),
    },
  ];

  const actionRender = (item: CellProps) => {
    return (
      <div className="flex gap-2 items-center justify-center">
        <Link
          className="action-button green-btn"
          to={`${PRIVATE_NAVIGATION.quotes.list.path}/view/${item?.slug}`}
          target="_blank"
        >
          <Image
            iconName="eyeIcon"
            iconClassName=" w-5 h-5"
            width={24}
            height={24}
          />
        </Link>
      </div>
    );
  };

  const getBackUrl = () => {
    if (state?.url) return state?.url;
    return PRIVATE_NAVIGATION.projectManagement.view.path;
  };
  return (
    <>
      <PageHeader
        url={getBackUrl()}
        text={projectDetail?.title ?? '-'}
        passState={{ ...state }}
      >
        <>
          <span className="bg-ic_2/30 text-danger mx-2 px-3 py-2.5 font-medium text-sm leading-5 rounded-md ms-auto">
            {`${t('ProjectManagement.CustomCardModal.dueDate')} ${
              defaultDueDate ?? '-'
            }`}
          </span>
          {!_.isEmpty(state) && !state.trainingSpecialistId && (
            <Button
              variants="primary"
              className="flex gap-1.5 !text-grayText !px-2 !font-normal"
              onClickHandler={() =>
                navigate(PRIVATE_NAVIGATION.coursePipeline.view.path, {
                  state: {
                    ProjectName: `${projectDetail?.project?.title ?? '-'}`,
                    ProjectId: projectDetail?.project?.id,
                    cardId: projectDetail?.project?.card_id,
                    isComingFromDetail: true,
                  },
                })
              }
            >
              <span className="w-4 h-4 inline-block">
                <Image iconName="eyeIcon" iconClassName="w-full h-full" />
              </span>
              <span>{t('ProjectManagement.DetailPage.coursePipeline')}</span>
            </Button>
          )}
        </>
      </PageHeader>
      <div className="flex flex-col gap-y-7">
        <CustomCard minimal title={t('ProjectManagementDetailPage.myNote')}>
          <>
            {projectDetail?.project?.project_notes &&
            !_.isEmpty(projectDetail.project.project_notes) ? (
              <>
                {projectDetail.project.project_notes.map((item, index) => (
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                  <p
                    className="p-2 border-b border-borderColor/50 c-notes-data"
                    onClick={(e) => e.preventDefault()}
                    key={`project_${index + 1}`}
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: convertIMG(item.content) }}
                  />
                ))}
              </>
            ) : (
              '-'
            )}
          </>
        </CustomCard>

        <CustomCard minimal title={t('ProjectManagementDetailPage.theCourse')}>
          <>
            {projectDetail?.project?.courses &&
            !_.isEmpty(projectDetail?.project?.courses) ? (
              <>
                {projectDetail?.project?.courses
                  ?.slice(0, sliceBy.courseSlice)
                  .map((course, index) => {
                    // const revenue = course.course_participates.length * course.price;
                    const revenue = course?.total_amount;
                    return (
                      <div
                        key={`detail_${index + 1}`}
                        className="table-list mb-7 last:mb-0"
                      >
                        <Link
                          to={`${PRIVATE_NAVIGATION.coursesManagement.view.path}/view/${course.slug}`}
                          target="_blank"
                          className="flex-1"
                        >
                          <div className="   hover:underline decoration-blue ">
                            <p className=" leading-[1.3] text-base text-primary font-semibold mb-4">
                              {course.title}
                            </p>
                          </div>
                        </Link>
                        <div className="grid grid-cols-1 lg:grid-cols-3">
                          <div className="group">
                            <div className="detailPage-groupDiv">
                              <Button className="text-sm font-medium">
                                {t('ProjectManagement.DetailPage.assignTrainer')}
                              </Button>
                            </div>
                            <div className="detailPage-table-data">
                              {!_.isEmpty(course?.lessonSessionApproval)
                                ? course?.lessonSessionApproval
                                    ?.flat()
                                    ?.map((trainer, index) => (
                                      <StatusLabel
                                        key={`status_${index + 1}`}
                                        text={trainer?.assignedToUser?.full_name}
                                        variants="primary"
                                      />
                                    ))
                                : t(
                                    'ProjectManagement.DetailPage.trainerAssignmentPending'
                                  )}
                            </div>
                          </div>
                          <div className="group">
                            <div className="detailPage-groupDiv">
                              <Button className="text-sm font-medium">
                                {t('ProjectManagement.DetailPage.courseRevenue')}
                              </Button>
                            </div>
                            <div className="detailPage-table-data">
                              <p className="text-sm text-dark font-medium">
                                {getCurrencySymbol('EUR')}
                                {formatCurrency(Number(revenue ?? 0), 'EUR')}
                              </p>
                            </div>
                          </div>
                          <div className="group">
                            <div className="detailPage-groupDiv">
                              <Button className="text-sm font-medium">
                                {t('ProjectManagement.DetailPage.trainerFee')}
                              </Button>
                            </div>
                            <div className="detailPage-table-data">
                              {!_.isEmpty(course?.lessonSessionApproval)
                                ? course?.lessonSessionApproval?.map(
                                    (fees, index) => (
                                      <p
                                        key={`fees_${index + 1}`}
                                        className="text-sm text-dark font-medium"
                                      >
                                        {getCurrencySymbol('EUR')}
                                        {formatCurrency(
                                          Number(
                                            fees.assignedToUser.trainer
                                              .travel_reimbursement_fee ?? 0
                                          ),
                                          'EUR'
                                        )}
                                      </p>
                                    )
                                  )
                                : '-'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </>
            ) : (
              <NoDataFound message={t('Course.courseNotFound')} />
            )}
            {projectDetail?.project?.courses &&
              projectDetail?.project?.courses?.length > 2 && (
                <Button
                  onClickHandler={() => {
                    setSliceBy({
                      courseSlice:
                        sliceBy.courseSlice !==
                          projectDetail?.project?.courses?.length &&
                        projectDetail?.project?.courses
                          ? projectDetail?.project?.courses?.length
                          : 2,
                    });
                  }}
                  className="w-fit text-sm text-primary underline underline-offset-4 font-medium hover:opacity-70"
                >
                  {sliceBy.courseSlice === projectDetail?.project?.courses?.length
                    ? t('ProjectManagement.CustomCardModal.showLess')
                    : t('ProjectManagement.CustomCardModal.showMore')}
                </Button>
              )}
          </>
        </CustomCard>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <CustomCard
            cardClass="cols-span-1"
            minimal
            title={t('ProjectManagement.CustomCardModal.commentLabel')}
          >
            {!_.isEmpty(projectDetail?.card_activities) ? (
              <ActivityDisplay
                // className="!h-[387px]"
                allowCreateActivity={false}
                initialBoardData={projectDetail as Cards}
                commentSlice={(projectDetail?.card_activities ?? [])?.length}
              />
            ) : (
              <NoDataFound
                message={t('ProjectManagement.CustomCardModal.activityNotFound')}
              />
            )}
          </CustomCard>
          <CustomCard
            cardClass="cols-span-1"
            minimal
            title={t('ProjectManagementDetailPage.quotes')}
          >
            <Table
              tableHeightClassName="!min-h-[unset]"
              headerData={columnData}
              bodyData={quotes}
            />
          </CustomCard>
        </div>
      </div>
    </>
  );
};

export default ProjectManagementDetailsModule;
