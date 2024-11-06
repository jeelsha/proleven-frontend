// **components**
import Button from 'components/Button/Button';
import Image from 'components/Image';

// **hooks**
import { useAxiosPost } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// **constants**
import { CourseStatus } from 'modules/Courses/Constants';

// **types**
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import {
  CourseData,
  ExpandableTableRowType,
} from 'modules/Courses/types/TemplateBundle';
import { BundleCourse } from '../../types/IBundleTemplate';

const ExpandableTableRow = ({
  item,
  index,
  status,
  refetch,
  bundleSlug,
  activeTab,
  bundleId,
  state,
}: ExpandableTableRowType) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const markAsSoldOutModal = useModal();
  const [markAsSoldCourse, { isLoading: markAsSoldOutLoading }] = useAxiosPost();
  const [isExpanded, setIsExpanded] = useState<number | null>();

  const handleMarkAsSold = async () => {
    const { error } = await markAsSoldCourse(
      `/course/mark-as-sold-out/${item.slug}`,
      {}
    );
    if (!error) {
      markAsSoldOutModal.closeModal();
      refetch?.();
    }
  };

  const actionRenderer = (item: CourseData) => {
    const startDate = new Date(item?.start_date) < new Date();

    const isCourseSold = [
      'public',
      'private',
      'academic',
      'enrollment_open',
      'temporary_sold_out',
    ].includes(item?.marked_as);
    return (
      <div className="flex items-center justify-center gap-5 pe-3">
        {status === CourseStatus.publish && (
          <Button
            disabled={startDate}
            variants={isCourseSold ? 'primary' : 'danger'}
            parentClass="h-fit"
            onClickHandler={(e) =>
              isCourseSold ? markAsSoldOutModal.openModal() : e.preventDefault
            }
            className={`whitespace-nowrap gap-1  ${
              startDate ? 'disabled:opacity-50 pointer-events-none' : ''
            }`}
          >
            {isCourseSold && (
              <Image
                iconName="checkRoundIcon"
                iconClassName=" w-5 h-5"
                width={24}
                height={24}
              />
            )}
            {isCourseSold
              ? t('PublishCourse.markAsSoldButton')
              : t('PublishCourse.soldOut')}
          </Button>
        )}
        <Button
          onClickHandler={() =>
            state?.fromTrainerBundleRequest
              ? navigate(`/trainer/courses/view/${item?.slug}`, {
                  state: {
                    isCourseBundle: true,
                    courseBundleSlug: bundleSlug,
                    bundleId,
                    type: item?.type,
                    ...state,
                  },
                })
              : navigate(`/courses/view/${item?.slug}`, {
                  state: {
                    status,
                    isCourseBundle: true,
                    courseBundleSlug: bundleSlug,
                    activeTab,
                    bundleId,
                    type: item?.type,
                  },
                })
          }
          parentClass="h-fit"
          className="action-button green-btn"
          tooltipText={t('Tooltip.View')}
        >
          <Image
            iconName="eyeIcon"
            iconClassName="stroke-current w-5 h-5"
            width={24}
            height={24}
          />
        </Button>
        {status === CourseStatus.publish && (
          <Button
            parentClass="h-fit"
            className="action-button green-btn relative group"
            tooltipText={t('SideNavigation.client.companyTitle')}
            onClickHandler={() => {
              navigate(`/courses/company-list/${item?.slug}`, {
                state: {
                  activeTab,
                  isCourseBundle: true,
                  bundleSlug,
                  bundleId,
                  status,
                  publish_course_slug: item?.slug,
                },
              });
            }}
          >
            <Image iconName="userGroupIcon" iconClassName="stroke-current w-5 h-5" />
          </Button>
        )}
        {status === CourseStatus.publish && (
          <Button
            className="action-button green-btn relative group"
            parentClass="h-fit"
          >
            {item?.total_participates}
          </Button>
        )}
        {(item as unknown as BundleCourse).lessonApproval.length > 0 && (
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

  const templateRenderer = (item: CourseData) => {
    return (
      <div className="flex">
        <div className="w-[100px] h-[70px]">
          <Image
            src={item.image}
            width={100}
            height={100}
            imgClassName="w-full h-full object-cover rounded-lg"
            serverPath
          />
        </div>
        <div className="max-w-[220px] ps-2">
          <p className="text-base text-dark leading-[1.3] mb-1">{item.title}</p>
        </div>
      </div>
    );
  };

  const expandableRow = (item: BundleCourse | CourseData) => {
    return (
      <tr>
        <td colSpan={4} className="!p-0 !border-0">
          <div className="bg-white rounded-xl border border-solid border-borderColor p-10 flex flex-col gap-y-5">
            <div className="flex -mx-2">
              <div className="flex-[1_0_0%] px-2">
                <p className="text-base font-semibold text-dark">
                  {t('PublishBundle.table.optionalTrainerHeader')}
                </p>
              </div>
              <div className="flex-[1_0_0%] px-2">
                <p className="text-base font-semibold text-dark">
                  {t('PublishBundle.table.optionalRoomsHeader')}
                </p>
              </div>
              <div className="flex-[1_0_0%] px-2">
                <p className="text-base font-semibold text-dark">
                  {t('PublishBundle.table.optionalResourceHeader')}
                </p>
              </div>
              <div className="flex-[1_0_0%] px-2">
                <p className="text-base font-semibold text-dark">
                  {t('UserProfile.viewProfile.statusLabel')}
                </p>
              </div>
              <div className="flex-[1_0_0%] px-2">
                <p className="text-base font-semibold text-dark">
                  {t('PublishBundle.table.optionalTrainerType')}
                </p>
              </div>
            </div>
            {(item as BundleCourse)?.lessonApproval?.map((lessonItem) => {
              return (
                <div className="flex -mx-2" key={lessonItem.id}>
                  <div className="flex-[1_0_0%] px-2">
                    <div className="flex items-center">
                      {lessonItem?.profile_image && (
                        <div className="w-6 h-6 rounded-full overflow-hidden">
                          <Image
                            imgClassName="w-full h-full"
                            src={lessonItem?.profile_image}
                            width={40}
                            height={40}
                            serverPath
                          />
                        </div>
                      )}
                      <Button className="max-w-[calc(100%_-_24px)] ps-2 text-sm text-dark">
                        {lessonItem?.assignedToUser}
                      </Button>
                    </div>
                  </div>
                  <div className="flex-[1_0_0%] px-2">{lessonItem?.room ?? '-'}</div>
                  <div className="flex-[1_0_0%] px-2">
                    {lessonItem?.resources?.length > 0 ? lessonItem?.resources : '-'}
                  </div>
                  <div className="flex-[1_0_0%] px-2">
                    {lessonItem?.assigned_to_status ?? '-'}
                  </div>
                  <div className="flex-[1_0_0%] px-2">
                    {lessonItem?.is_full_course === true &&
                    lessonItem?.is_optional === true
                      ? t('OptionalTrainer')
                      : lessonItem?.is_full_course === true &&
                        lessonItem?.is_optional === false &&
                        t('MainTrainer')}
                  </div>
                </div>
              );
            })}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <>
      <tr>
        <td className="group/tbl">
          <div className="flex items-center gap-1 group-first/tbl:justify-center group-last/tbl:justify-end">
            {index + 1}
          </div>
        </td>
        <td className="group/tbl">
          <div className="flex items-center gap-1 group-first/tbl:justify-center group-last/tbl:justify-end">
            {templateRenderer(item)}
          </div>
        </td>
        <td className="group/tbl">
          <div className="flex items-center gap-1 group-first/tbl:justify-center group-last/tbl:justify-end">
            {actionRenderer(item)}
          </div>
        </td>
      </tr>
      {item.id === isExpanded ? expandableRow(item) : ''}
      {markAsSoldOutModal.isOpen && (
        <ConfirmationPopup
          modal={markAsSoldOutModal}
          bodyText={t('PublishCourse.markAsSoldOutBodyText', {
            COURSE: item?.title,
          })}
          popUpType="primary"
          confirmButtonText={t('PublishCourse.soldOut')}
          deleteTitle={t('PublishCourse.markAsSoldButton')}
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={() => {
            markAsSoldOutModal.closeModal();
          }}
          confirmButtonFunction={handleMarkAsSold}
          isLoading={markAsSoldOutLoading}
        />
      )}
    </>
  );
};

export default ExpandableTableRow;
