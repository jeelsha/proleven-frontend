import NameBadge from 'components/Badge/NameBadge';
import Image from 'components/Image';
import StatusLabel from 'components/StatusLabel';
import { ROLES } from 'constants/roleAndPermission.constant';
import { format } from 'date-fns';
import { StageNameConstant } from 'modules/ProjectManagement_module/enum';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { ModalProps } from 'types/common';
import { colorArray } from '../constant';
import { EventProps } from '../types';

interface showDataProps {
  event?: EventProps[];
  setShowPopOversOpen: Dispatch<SetStateAction<boolean>>;
  setEventSlug?: Dispatch<SetStateAction<EventProps | undefined>>;

  modal: ModalProps;
  handleMouseEnter: (event: EventProps, key: string) => void;
  onClick: (key: string, event: EventProps) => void;
  handleMouseLeave: (key: string) => void;
  currentView: string;
}

export const EventData = ({
  event,
  setShowPopOversOpen,
  modal,
  handleMouseEnter,
  handleMouseLeave,
  onClick,
  currentView,
  setEventSlug,
}: showDataProps) => {
  const user = useSelector(getCurrentUser);
  const { t } = useTranslation();

  const dayName = event && format(new Date(event[0]?.start), 'EEEE');
  const dayFull = event && format(new Date(event[0]?.start), 'MMM dd,yyyy');

  const renderImageOrNameBadge = (event: EventProps) => {
    if (event?.course) {
      const { assignedTo } = event.course;
      if (assignedTo?.profile_image) {
        return <Image src={assignedTo.profile_image} alt="Event" serverPath />;
      }
      return <NameBadge FirstName="Text" LastName="Example" />;
    }

    return null;
  };
  const renderTrainerTag = (event: EventProps) => {
    if (event?.trainerUser) {
      const { first_name, last_name } = event.trainerUser;
      return (
        <StatusLabel text={`${first_name} ${last_name}`} variants="primaryFill" />
      );
    }

    return null;
  };
  return (
    <>
      <div
        className="absolute inset-0 bg-black/40 w-full h-full !top-4 z-1 cursor-pointer"
        onClick={() => {
          setShowPopOversOpen(false);
        }}
      />
      <div className="popup-right h-[calc(100dvh_-_73px)] fixed bottom-0 right-0 w-[31.2rem] 1200:w-[37rem] max-w-full  bg-white z-5 border-l border-l-black/10 pointer-events-auto">
        <div className="top-header p-5">
          <div className="flex justify-between items-center">
            <div className="">
              {currentView === 'year' ? (
                <div className="text-xl font-semibold text-dark">
                  {event && format(event[0]?.start, 'MMMM yyyy')}
                </div>
              ) : (
                <div>
                  <div className="">{dayName}</div>
                  <div className=" text-xl font-semibold text-dark ">{dayFull}</div>
                </div>
              )}
            </div>
            <div
              onClick={() => {
                setShowPopOversOpen(false);
              }}
            >
              <a href="#">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <hr />
        <div className=" h-[calc(100vh_-_190px)] overflow-y-auto">
          <div className="px-5 pt-5">
            {event?.map((showData: EventProps, index: number) => {
              const markOption = () => {
                const conditionOne =
                  user?.role_name === ROLES.Admin ||
                  user?.role_name === ROLES.TrainingSpecialist ||
                  user?.role_name === ROLES.Trainer;
                const conditionTwo =
                  showData?.course?.card?.stage?.name ===
                    StageNameConstant.DateProposed ||
                  showData?.course?.card?.stage?.name ===
                    StageNameConstant.DateConfirmed ||
                  showData?.course?.card?.stage?.name ===
                    StageNameConstant.DateRequested;
                return (
                  <div>
                    {conditionOne && conditionTwo && (
                      <p className="bg-secondary text-white w-fit px-2.5 py-1.5 rounded-md text-xs font-medium capitalize ">
                        {t('CoursesManagement.CreateCourse.option')}
                      </p>
                    )}
                  </div>
                );
              };
              const key = `my-event-${new Date(showData.start).getTime()}-${new Date(
                showData.end
              ).getTime()}-${Math.random()}`;

              return (
                <div
                  key={`popup+${index}`}
                  className={`${
                    showData?.color && colorArray[Number(showData?.color) - 1]?.color
                  } border ${
                    showData?.color &&
                    colorArray[Number(showData?.color) - 1]?.border
                  } py-2 px-4 rounded-md mb-2`}
                  id={`${key}_event_id`}
                  onMouseEnter={() => {
                    handleMouseEnter(showData, key);
                  }}
                  onMouseLeave={() => {
                    handleMouseLeave(key);
                  }}
                  onClick={() => {
                    setEventSlug?.(showData);
                    handleMouseLeave(key);
                    setTimeout(() => {
                      onClick(key, showData);
                      setShowPopOversOpen(false);
                      modal.openModal();
                    }, 500);
                  }}
                >
                  <div className="flex justify-between mb-2">
                    <div>
                      {showData?.lessonIndex ? (
                        <StatusLabel
                          variants="neon"
                          text={`L - ${showData?.lessonIndex}`}
                        />
                      ) : (
                        ''
                      )}
                      <div className="text-base text-dark">
                        {showData?.course?.title ?? showData?.title}
                      </div>
                    </div>

                    {showData?.trainerUser ? <>{renderTrainerTag(showData)}</> : ''}
                    <div className="h-fit ms-auto me-2 mt-[3px]">{markOption()}</div>
                    <div>{renderImageOrNameBadge(showData)}</div>
                  </div>

                  <div className="text-navText text-xs">
                    {format(new Date(showData?.start), 'hh:mm a')} -
                    {format(new Date(showData?.end), 'hh:mm a')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
