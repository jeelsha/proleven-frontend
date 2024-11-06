// **components**
import Button from 'components/Button/Button';
import Image from 'components/Image';

// **constants**
import { ROLES } from 'constants/roleAndPermission.constant';

// **libraries**
import _ from 'lodash';

// **hooks**
import { useAxiosPost } from 'hooks/useAxios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

// **types**
import { COURSE_TYPE, CourseMarkAsEnum } from 'modules/Courses/Constants';
import { CourseResponse, ExpandableCourseTableRowType } from 'modules/Courses/types';

// **redux**
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';

// ** helper **
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import StatusLabel from 'components/StatusLabel';
import { useModal } from 'hooks/useModal';
import {
  courseCompaniesCell,
  dateRender,
  getCourseType,
  trainerConfirmationCell,
  trainingSpecialistCell,
} from 'modules/Courses/components/Common';
import { isTodayGreaterThanGivenDate } from 'modules/Courses/helper/CourseCommon';

const ExpandableCourseRow = ({
  item,
  refetch,
  status,
  activeTab,
  markAsSoldOutModal,
  setSelectedCourse,
  addModal,
  queryParams,
}: ExpandableCourseTableRowType) => {
  const { t } = useTranslation();
  const { search: searchQuery } = useLocation();
  const user = useSelector(getCurrentUser);
  const newQueryParameters = new URLSearchParams(searchQuery);
  const confirmTrainerModal = useModal();
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState<{
    id: number;
    first_name: string;
    last_name: string;
  }>();
  const [confirmOptionalTrainer] = useAxiosPost();
  const [isExpanded, setIsExpanded] = useState<number | null>();

  const url = '/course-management';

  const templateRender = (item: CourseResponse) => {
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
          <p className="text-base text-dark leading-[1.3] mb-1">{course.title}</p>
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

  const renderCode = (item: CourseResponse) => {
    const courseCode = item.code;
    const progressiveNumber = item.progressive_number;
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

  const actionRender = (item: CourseResponse) => {
    const startDate = item?.start_date
      ? isTodayGreaterThanGivenDate(item.start_date)
      : true;

    const isCourseSolOut = item?.marked_as === CourseMarkAsEnum.SoldOut;
    return user?.role_name === ROLES.Trainer ? (
      <div className="flex gap-2 items-center justify-end">
        {item && (
          <Button
            parentClass="h-fit"
            onClickHandler={() =>
              navigate(`/courses/view/${item?.slug}`, {
                state: { status, activeTab },
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
      </div>
    ) : (
      <div className="flex items-center justify-end gap-5 pe-3">
        {!startDate &&
          user?.role_name !== ROLES.Accounting &&
          user?.role_name !== ROLES.SalesRep && (
            <Button
              parentClass="h-fit"
              className="action-button green-btn relative group"
              tooltipText={t('Tooltip.addTrainers')}
              onClickHandler={() => {
                setSelectedCourse?.(item);
                addModal?.openModal();
              }}
            >
              <Image iconName="plusIcon" iconClassName="stroke-current w-5 h-5" />
            </Button>
          )}

        {item && (
          <Button
            parentClass="h-fit"
            onClickHandler={() => {
              newQueryParameters.set('status', String(status));
              newQueryParameters.set('activeTab', String(activeTab));
              newQueryParameters.set('type', String(item?.type));
              newQueryParameters.set('isCourse', String(true));
              // newQueryParameters.set('course_id', String(item?.id));

              if (newQueryParameters.toString()) {
                navigate(
                  {
                    pathname: `/courses/view/${item?.slug}`,
                    search: newQueryParameters.toString(),
                  },
                  {
                    state: {
                      status,
                      activeTab,
                      type: item?.type,
                      isCourse: true,
                      course_id: item?.id,
                    },
                    replace: true,
                  }
                );
              }
            }}
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
        {user?.role_name === ROLES.TrainingSpecialist ||
        user?.role_name === ROLES.Admin ? (
          <Button
            parentClass="h-fit"
            className="action-button green-btn relative group"
            tooltipText={t('SideNavigation.client.companyTitle')}
            onClickHandler={() => {
              navigate(`/courses/company-list/${item?.slug}${queryParams ?? ''}`, {
                state: {
                  status,
                  publish_course_slug: item?.slug,
                  activeTab,
                },
              });
            }}
          >
            <Image iconName="userGroupIcon" iconClassName="stroke-current w-5 h-5" />
          </Button>
        ) : (
          ''
        )}

        {user?.role_name !== ROLES.Accounting &&
          user?.role_name !== ROLES.SalesRep && (
            <Button
              disabled={startDate}
              parentClass="h-fit"
              onClickHandler={(e) => {
                if (!isCourseSolOut) {
                  setSelectedCourse?.(item);
                  markAsSoldOutModal?.openModal();
                } else e.preventDefault();
              }}
              tooltipText={
                !isCourseSolOut ? t('PublishCourse.markAsSoldButton') : ''
              }
              className={`action-button ${
                isCourseSolOut ? 'red-btn' : 'primary-btn'
              }  ${
                startDate || isCourseSolOut
                  ? 'disabled:opacity-50 pointer-events-none'
                  : ''
              }`}
            >
              <Image
                iconName={isCourseSolOut ? 'soldOut' : 'markAsSoldOut'}
                iconClassName=" w-5 h-5"
                width={24}
                height={24}
              />
            </Button>
          )}

        {item?.course_participates &&
          (item?.course_participates ?? []).length > 0 && (
            <Button
              className="table-action-button green-btn relative group"
              parentClass="h-fit"
            >
              {item?.course_participates?.length}
            </Button>
          )}
        {!_.isEmpty(item.valid_optional_trainers) &&
          !startDate &&
          (ROLES.Admin === user?.role_name ||
            ROLES.TrainingSpecialist === user?.role_name) && (
            <Button
              parentClass="h-fit"
              onClickHandler={() =>
                setIsExpanded((prev) => {
                  if (prev === item.id) return null;
                  return item.id;
                })
              }
            >
              <Image
                iconClassName={`${
                  item.id === isExpanded ? 'rotate-90' : ''
                } transition-all duration-300`}
                iconName="chevronRight"
              />
            </Button>
          )}
      </div>
    );
  };

  const handleConfirmTrainer = async () => {
    if (trainer?.id) {
      const { error } = await confirmOptionalTrainer(
        `course/trainers/confirm-optional/${item.slug}`,
        {
          trainer_id: trainer?.id,
        }
      );
      if (!error) {
        refetch?.();
      }
    }
  };
  const getFundedBy = (funded_by: string): string | JSX.Element => {
    if (!funded_by) return '-';
    const stringToArray = funded_by?.split(',');

    if (funded_by === 'NAN') {
      return '-';
    }

    const mappedElements = stringToArray?.map((data, index) => (
      <div key={`${index + 1}_fundedBy`} className="flex flex-col">
        <StatusLabel text={data} />
      </div>
    ));

    return <div className="flex flex-col">{mappedElements}</div>;
  };

  const expandableRow = (item: CourseResponse) => {
    return (
      !_.isEmpty(item.valid_optional_trainers) && (
        <>
          <tr>
            <td colSpan={9} className="!p-0 !border-0">
              <div className="bg-white rounded-xl border border-solid border-borderColor p-10 flex flex-col gap-y-5">
                <div className="flex -mx-2">
                  <div className="flex-[1_0_0%] px-2">
                    <p className="text-base font-semibold text-dark">
                      {t('PublishCourse.table.optionalTrainerHeader')}
                    </p>
                  </div>
                  <div className="flex-[1_0_0%] px-2">
                    <p className="text-base font-semibold text-dark">
                      {t('PublishCourse.table.optionalRoomsHeader')}
                    </p>
                  </div>
                  <div className="flex-[1_0_0%] px-2">
                    <p className="text-base font-semibold text-dark">
                      {t('PublishCourse.table.optionalResourceHeader')}
                    </p>
                  </div>
                  {user?.role_name !== ROLES.Accounting && (
                    <div className="flex-[1_0_0%] px-2">
                      <p className="text-base font-semibold text-dark">
                        {t('PublishCourse.table.actionHeader')}
                      </p>
                    </div>
                  )}
                </div>
                {item.valid_optional_trainers?.map((data) => {
                  return (
                    <div className="flex -mx-2" key={data.course_id}>
                      <div className="flex-[1_0_0%] px-2">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full overflow-hidden">
                            <Image
                              imgClassName="w-full h-full"
                              src="https://via.placeholder.com/150x150"
                              width={40}
                              height={40}
                            />
                          </div>
                          <Button className="max-w-[calc(100%_-_24px)] ps-2 text-sm text-dark">
                            {data.assignedToUser.first_name}
                          </Button>
                        </div>
                      </div>
                      <div className="flex-[1_0_0%] px-2">{data?.room?.title}</div>
                      <div className="flex-[1_0_0%] px-2">
                        {data.resources.map((resource) => (
                          <p
                            key={resource?.id}
                          >{`${resource.title}(${resource.quantity})`}</p>
                        ))}
                      </div>
                      {user?.role_name !== ROLES.Accounting && (
                        <div className="flex-[1_0_0%] px-2">
                          <Button
                            onClickHandler={() => {
                              setTrainer(data.assignedToUser);
                              confirmTrainerModal.openModal();
                            }}
                            variants="grayLight"
                            parentClass="h-fit"
                            className="whitespace-nowrap gap-1 !text-primary"
                          >
                            <Image
                              iconName="checkRoundIcon"
                              iconClassName="w-5 h-5"
                              width={24}
                              height={24}
                            />
                            {t('setAsMainTrainer')}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </td>
          </tr>
          {confirmTrainerModal.isOpen && (
            <ConfirmationPopup
              modal={confirmTrainerModal}
              bodyText={t('setAsMainTrainerBody', {
                NAME: `${trainer?.first_name} ${trainer?.last_name}`,
              })}
              popUpType="primary"
              confirmButtonText={t('CoursesManagement.confirm')}
              deleteTitle={t('setAsMainTrainer')}
              cancelButtonText={t('Button.cancelButton')}
              cancelButtonFunction={() => {
                confirmTrainerModal.closeModal();
              }}
              confirmButtonFunction={handleConfirmTrainer}
            />
          )}
        </>
      )
    );
  };

  return (
    <>
      <tr>
        <td>{renderCode(item)}</td>
        <td>{templateRender(item)}</td>
        <td>{dateRender(item?.start_date)}</td>
        <td>{dateRender(item?.end_date)}</td>
        <td>{item?.courseCategory?.name}</td>
        <td>{courseCompaniesCell(item)}</td>
        <td>{trainingSpecialistCell(item)}</td>
        <td>{trainerConfirmationCell(item, t)}</td>
        <td className="capitalize">{getFundedBy(item.funded_by)}</td>
        <td>{actionRender(item)}</td>
      </tr>
      {item.id === isExpanded &&
      (ROLES.Admin === user?.role_name ||
        ROLES.TrainingSpecialist === user?.role_name)
        ? expandableRow(item)
        : ''}
    </>
  );
};

export default ExpandableCourseRow;
