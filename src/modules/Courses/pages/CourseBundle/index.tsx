import Button from 'components/Button/Button';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import Table from 'components/Table/Table';
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import { FeaturesEnum, PermissionEnum } from 'constants/common.constant';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useAxiosDelete, useAxiosPost } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useRolePermission } from 'hooks/useRolePermission';
import { CourseStatus } from 'modules/Courses/Constants';
import { accessFunc } from 'modules/Courses/helper';
import { SavedCourseBundle } from 'modules/Courses/types/TemplateBundle';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { useDebounce } from 'utils';
import { IAccess } from '../CourseViewDetail/types';

type propTypes = {
  search?: string;
  status?: CourseStatus;
  activeTab?: number;
};
const CourseBundle = ({ search, status, activeTab }: propTypes) => {
  const { t } = useTranslation();
  const user = useSelector(getCurrentUser);
  const { currentPage } = useSelector(currentPageSelector);
  const navigate = useNavigate();
  const CurrentUser = useSelector(getCurrentUser);

  const editAccess = useRolePermission(
    FeaturesEnum.CourseInvitations,
    PermissionEnum.Update
  );
  const deleteAccess = useRolePermission(
    FeaturesEnum.CourseInvitations,
    PermissionEnum.Delete
  );

  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [selectedData, setSelectedData] = useState<SavedCourseBundle>();
  const searchString = typeof search === 'string' ? search : '';

  const debouncedSearch = useDebounce(searchString, 500);
  const markAsPublishModal = useModal();
  const deleteModal = useModal();

  const { response, isLoading, refetch } = useQueryGetFunction(
    '/course/bundle/used',
    {
      page: currentPage,
      search: debouncedSearch,
      limit,
      sort,
      option: { status, tableView: true },
    }
  );

  const [markAsPublished, { isLoading: publishingBundle }] = useAxiosPost();
  const [courseBundleDeleteApi] = useAxiosDelete();

  const renderCourseImages = (props: CellProps) => {
    const courseBundle = props as unknown as SavedCourseBundle;
    const maxImagesToShow = 6;
    const visibleCourses = courseBundle.courses.slice(0, maxImagesToShow);
    const remainingCount = Math.max(
      0,
      courseBundle.courses.length - maxImagesToShow
    );

    return (
      <>
        {visibleCourses.map((item) => (
          <div
            key={item.id}
            className="w-16 h-10 border border-solid border-borderColor rounded-md overflow-hidden"
          >
            <Image
              width={64}
              height={40}
              src={item.image}
              alt=""
              imgClassName="w-full h-full object-cover"
              serverPath
            />
          </div>
        ))}

        {remainingCount > 0 && <>+{remainingCount}</>}
      </>
    );
  };

  const actionRender = (item: CellProps) => {
    const roleAndPermission = accessFunc(
      item.access as unknown as IAccess[],
      user?.id
    );
    return (
      <div className="flex gap-2 items-center justify-center">
        <Button
          className="action-button green-btn"
          onClickHandler={() =>
            navigate(
              `${PRIVATE_NAVIGATION.coursesManagement.courseBundle.path}/view?slug=${item.slug}`,
              {
                state: {
                  bundle_id: item?.id,
                  status,
                  activeTab,
                },
              }
            )
          }
          tooltipText={t('Tooltip.View')}
        >
          <Image iconClassName=" w-5 h-5" iconName="eyeIcon" />
        </Button>

        {status === CourseStatus.draft &&
        ((editAccess && CurrentUser?.id === item.created_by) ||
          roleAndPermission?.edit ||
          CurrentUser?.role_name === ROLES.Admin) ? (
          <Button
            parentClass="h-fit"
            className="action-button primary-btn"
            onClickHandler={() => {
              navigate(
                `${PRIVATE_NAVIGATION.coursesManagement.courseManagement.path}/bundle/edit?bundle=${item?.slug}`,
                {
                  state: {
                    activeTab,
                  },
                }
              );
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
        {status === CourseStatus.draft &&
        ((deleteAccess && CurrentUser?.id === item.created_by) ||
          roleAndPermission?.delete ||
          CurrentUser?.role_name === ROLES.Admin) ? (
          <Button
            parentClass="h-fit"
            className="action-button red-btn"
            onClickHandler={() => {
              setSelectedData(item as unknown as SavedCourseBundle);
              deleteModal?.openModal();
            }}
            tooltipText={t('Tooltip.Delete')}
          >
            <Image iconName="deleteIcon" iconClassName="stroke-current w-5 h-5" />
          </Button>
        ) : (
          ''
        )}

        {status === CourseStatus.draft ? (
          <Button
            parentClass="h-fit"
            className="action-button green-btn relative group"
            tooltipText={t('Tooltip.MarkAsPublic')}
            onClickHandler={() => {
              setSelectedData(item as unknown as SavedCourseBundle);
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
  const columnData: ITableHeaderProps[] = [
    {
      header: t('UserManagement.columnHeader.no'),
      name: 'no',
      option: {
        sort: false,
        hasFilter: false,
        isIndex: true,
      },
    },
    {
      name: 'title',
      header: t('Calendar.createEvent.topic'),
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      header: t('Dashboard.Trainer.CourseInvitation.courses'),
      cell: (props) => renderCourseImages(props),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('Table.action'),
      cell: (props) => actionRender(props),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
  ];

  const handleDelete = async () => {
    if (selectedData) {
      // bundle/course/?bundle_slug=course-template-1
      await courseBundleDeleteApi(
        `/bundle/course`,
        {},
        { params: { bundle_slug: selectedData?.slug } }
      );
      deleteModal.closeModal();
      refetch();
    }
  };

  const handleMarkAsPublish = async () => {
    if (selectedData) {
      await markAsPublished(
        `/course/bundle/mark-as-publish/${selectedData?.slug}`,
        {}
      );
      markAsPublishModal.closeModal();
      refetch();
    }
  };

  useEffect(() => {
    setLimit(10);
    setSort('-updated_at');
  }, [status]);

  return (
    <>
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
          cancelButtonFunction={markAsPublishModal.closeModal}
          confirmButtonFunction={handleMarkAsPublish}
          isLoading={publishingBundle}
        />
      )}

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
          cancelButtonFunction={deleteModal.closeModal}
          confirmButtonFunction={handleDelete}
        />
      )}

      <Table
        parentClassName=""
        headerData={columnData}
        bodyData={response?.data?.data}
        loader={isLoading}
        pagination
        dataPerPage={limit}
        setLimit={setLimit}
        totalPage={response?.data?.lastPage}
        dataCount={response?.data?.count}
        setSort={setSort}
        sort={sort}
      />
    </>
  );
};

export default CourseBundle;
