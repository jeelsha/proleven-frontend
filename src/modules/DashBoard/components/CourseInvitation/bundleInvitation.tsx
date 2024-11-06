import Button from 'components/Button/Button';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import Table from 'components/Table/Table';
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import { useAxiosPut } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { TFunction } from 'i18next';
import { COURSE_TYPE } from 'modules/Courses/Constants';
import { BundleSchema } from 'modules/Courses/types/TemplateBundle';
import 'modules/DashBoard/components/style/dashboard.css';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { useDebounce } from 'utils';

interface CoursesProp {
  course_id: number;
  courses: { slug: string };
  course_bundle: { [key: string]: string };
  course_bundle_id: number;
}

const CourseAcceptModal = React.lazy(
  () => import('modules/DashBoard/components/CourseAccept/index')
);

const templateRender = (
  item: CellProps,
  navigate: NavigateFunction,
  dashboard: boolean,
  t: TFunction
) => {
  return (
    <div className="flex items-center">
      <div className="max-w-[220px] ps-2 flex-1">
        {dashboard ? (
          <Button
            onClickHandler={() => {
              navigate(
                `/trainer/course-bundle/view?slug=${
                  (item as unknown as CoursesProp)?.course_bundle.slug
                }`,
                {
                  state: {
                    url: '/',
                    fromTrainerBundleRequest: true,
                    // activeTab: 0,
                  },
                }
              );
            }}
          >
            <p className="text-sm text-dark leading-[1.3] mb-1 text-left">
              {(item.course_bundle as unknown as BundleSchema).title}
            </p>
          </Button>
        ) : (
          <p className="text-sm text-dark leading-[1.3] mb-1 text-left">
            {item.title}
          </p>
        )}
        {item?.course_bundle_id && (
          <p className="text-sm text-primary leading-[1.3] mb-1 text-left">
            {t('Dashboard.courses.bundle.title')}
          </p>
        )}
      </div>
    </div>
  );
};
const CourseTypeCell = () => {
  return COURSE_TYPE.Academy;
};

type inviteProp = {
  search?: string;
  dashboard?: boolean;
};
const BundleInvitation = ({ search, dashboard = false }: inviteProp) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentPage } = useSelector(currentPageSelector);

  const searchString = typeof search === 'string' ? search : '';
  const debouncedSearch = useDebounce(searchString, 500);
  const acceptModal = useModal();
  const rejectModal = useModal();
  const [rejectCourse] = useAxiosPut();
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [bundleSlug, setBundleSlug] = useState<string>('');
  const [rejectPayload, setRejectPayload] = useState<{
    course_slug: string | null;
    course_bundle_id: number;
  }>({
    course_slug: '',
    course_bundle_id: 0,
  });
  const { response, isLoading, refetch } = useQueryGetFunction(
    '/trainer/bundle/invites',
    {
      page: currentPage,
      limit,
      sort,
      search: debouncedSearch,
      option: {
        // trainer_accept_view: true,
        profile: true,
        ...(dashboard && { view: true }),
      },
    }
  );

  const columnData: ITableHeaderProps[] = [
    {
      header: t('CoursesManagement.columnHeader.No'),
      name: 'no',
      className: '',
      option: {
        sort: false,
        hasFilter: false,
        isIndex: true,
      },
    },
    {
      header: t('UserManagement.courseTab.Title'),
      className: '!w-[350px]',
      cell: (props) => templateRender(props, navigate, dashboard, t),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('CoursesManagement.columnHeader.Type'),
      cell: () => CourseTypeCell(),
      className: `${dashboard ? '!w-[120px]' : ''}`,
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('EmailTemplate.emailTempTableActions'),
      name: 'action',
      className: 'w-40',
      cell: (props) => actionRender(props as unknown as CoursesProp),
    },
  ];
  let courseTabs = [...columnData];

  if (dashboard) {
    courseTabs = courseTabs.filter(
      (item) =>
        item.name !== 'course.courseCategory.name' &&
        item.name !== 'createdByUser.first_name'
    );
  }
  const actionRender = (item: CoursesProp) => {
    return (
      <div className="flex gap-2 items-center justify-center">
        {!dashboard ? (
          <>
            <Button
              onClickHandler={() => {
                setRejectPayload({
                  course_slug: item?.course_id ? item?.courses?.slug : null,
                  course_bundle_id: item?.course_bundle_id,
                });
                setBundleSlug(item?.course_bundle?.slug);
                acceptModal.openModal();
              }}
              parentClass="h-fit"
              className="action-button green-btn select-none"
              tooltipText="Accept"
            >
              <Image
                iconName="checkIcon"
                iconClassName=" w-5 h-5"
                width={24}
                height={24}
              />
            </Button>
            <Button
              onClickHandler={() => {
                setRejectPayload({
                  course_slug: item?.course_id ? item?.courses?.slug : null,
                  course_bundle_id: item?.course_bundle_id,
                });
                rejectModal.openModal();
              }}
              parentClass="h-fit"
              className="action-button red-btn select-none"
              tooltipText={t('Tooltip.Delete')}
            >
              <Image iconName="deleteIcon" iconClassName="stroke-current w-5 h-5" />
            </Button>
          </>
        ) : (
          <>
            <Button
              onClickHandler={() => {
                setRejectPayload({
                  course_slug: item?.course_id ? item?.courses?.slug : null,
                  course_bundle_id: item?.course_bundle_id,
                });
                setBundleSlug(item?.course_bundle?.slug);
                acceptModal?.openModalWithData?.(item);
              }}
              parentClass="h-fit"
              className="action-button green-btn select-none"
              tooltipText={t('reviewInvite')}
            >
              <Image
                iconName="reviewInvite"
                iconClassName=" w-5 h-5"
                width={24}
                height={24}
              />
            </Button>
          </>
        )}
      </div>
    );
  };
  const onReject = async () => {
    const { error } = await rejectCourse(
      '/trainer/bundle/invites/reject',
      rejectPayload
    );
    if (!error) {
      rejectModal.closeModal();
      setRejectPayload({
        course_slug: '',
        course_bundle_id: 0,
      });
      refetch();
    }
  };

  return (
    <div>
      <Table
        parentClassName="!p-0"
        tableRoundedRadius="pt-[1.75rem]"
        tableHeaderClass="sticky top-0 z-1"
        tableHeightClassName={`${
          dashboard ? '!min-h-[unset] max-h-[390px] overflow-auto pe-2' : ''
        }`}
        headerTitle={
          dashboard ? t('Dashboard.Trainer.CourseBundleInvitation.invite') : ''
        }
        headerData={courseTabs}
        bodyData={response?.data?.data}
        loader={isLoading}
        pagination={!dashboard}
        dataPerPage={!dashboard ? limit : -1}
        setLimit={setLimit}
        totalPage={response?.data?.lastPage}
        dataCount={response?.data?.count}
        setSort={setSort}
        sort={sort}
        width={`${dashboard ? '' : 'min-w-[1300px]'}`}
        PageHeaderClass="!pt-0 !z-1"
      />
      {rejectModal.isOpen && (
        <ConfirmationPopup
          modal={rejectModal}
          bodyText={t('rejectCourse.body')}
          variants="primary"
          confirmButtonText={t('rejectCourse.reject')}
          deleteTitle={t('rejectCourse.title')}
          confirmButtonFunction={onReject}
          confirmButtonVariant="primary"
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={() => {
            rejectModal.closeModal();
          }}
        />
      )}
      {acceptModal.isOpen && (
        <CourseAcceptModal
          modal={acceptModal}
          refetchTrainers={refetch}
          bundleSlug={bundleSlug}
          bundleId={rejectPayload.course_bundle_id}
          refetch={refetch}
        />
      )}
    </div>
  );
};
export default BundleInvitation;
