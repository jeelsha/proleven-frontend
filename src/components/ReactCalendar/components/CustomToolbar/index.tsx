import {
  CustomToolbarProps,
  FilterProps,
  TabProps,
} from 'components/ReactCalendar/types';
import { useDispatch, useSelector } from 'react-redux';
import {
  setFilterOptions,
  useFilterOptions,
} from 'redux-toolkit/slices/filtereventSlice';

import Button from 'components/Button/Button';
import ChevronLeft from 'components/Icon/assets/ChevronLeft';
import ChevronRight from 'components/Icon/assets/ChevronRight';
import Image from 'components/Image';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useToggleDropdown } from 'hooks/useToggleDropdown';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { ModalProps } from 'types/common';
import OtherTrainerCalendar from '../OtherTrainerCalendar';

export const CustomToolbar: React.FC<
  CustomToolbarProps & {
    filterModal: ModalProps;
    setOtherModalShow: Dispatch<SetStateAction<boolean>>;
    setInitialValues?: React.Dispatch<
      SetStateAction<{
        trainer_id: string[];
      }>
    >;
    initialValues: { trainer_id: string[] };

    setTrainerColors: React.Dispatch<
      SetStateAction<{
        [key: string]: string;
      }>
    >;
  }
> = ({
  label,
  onNavigate,
  views,
  view,
  onView,
  filterModal,
  setInitialValues,
  initialValues,
  setTrainerColors,
  setOtherModalShow,
}: CustomToolbarProps & {
  filterModal: ModalProps;
  setOtherModalShow: Dispatch<SetStateAction<boolean>>;
  setInitialValues?: React.Dispatch<
    SetStateAction<{
      trainer_id: string[];
    }>
  >;
  initialValues: { trainer_id: string[] };

  setTrainerColors: React.Dispatch<
    SetStateAction<{
      [key: string]: string;
    }>
  >;
}) => {
  const { t } = useTranslation();
  const filterOptions: FilterProps = useSelector(useFilterOptions);
  const trainerDropdown = useToggleDropdown();
  const dispatch = useDispatch();
  const combinedFilters = [
    ...filterOptions.course,
    ...filterOptions.trainer,
    ...filterOptions.trainingspecialist,
    ...filterOptions.room,
    ...filterOptions.resource,
  ];
  const user = useSelector(getCurrentUser);
  const customViewTitles = [
    t('Calendar.dayTitle'),
    t('Calendar.weekTitle'),
    t('Calendar.monthTitle'),
    t('Calendar.yearTitle'),
  ];
  const handleClearFilter = () => {
    dispatch(
      setFilterOptions({
        course: [],
        trainer: [],
        trainingspecialist: [],
        resource: [],
        room: [],
      })
    );
  };
  const handleDeleteFilter = (data: TabProps) => {
    const filteredData: FilterProps = {
      course: [],
      trainer: [],
      trainingspecialist: [],
      resource: [],
      room: [],
    };
    Object.keys(filterOptions).forEach((type) => {
      const filterType = type as keyof FilterProps;
      filteredData[filterType] = filterOptions[filterType].filter(
        (item: TabProps) => item.slug !== data?.slug
      );
    });
    dispatch(setFilterOptions(filteredData));
  };
  useEffect(() => {
    setTimeout(() => {
      setOtherModalShow(trainerDropdown.isDropdownOpen);
    }, 500);
  }, [trainerDropdown]);

  return (
    <>
      <div className="rbc-toolbar mb-7 flex flex-wrap justify-center text-base items-center gap-y-4">
        <div className="rbc-nav-buttons">
          <button className="prev group" onClick={() => onNavigate('PREV')}>
            <span className="calendar-custom-toolbar">
              {t('Calendar.previousTitle')}
            </span>
            <ChevronLeft className="w-full h-full stroke-2" />
          </button>
          <button className="next group" onClick={() => onNavigate('NEXT')}>
            <span className="calendar-custom-toolbar">
              {t('Calendar.nextTitle')}
            </span>
            <ChevronRight className="w-full h-full stroke-2" />
          </button>
        </div>
        <span className="rbc-toolbar-label flex-[1_0_0%] text-center font-semibold text-dark text-xl leading-6">
          {label}
        </span>
        <div className="flex flex-wrap gap-2">
          <div className="relative" ref={trainerDropdown.dropdownRef}>
            {(user?.role_name === ROLES.Admin ||
              user?.role_name === ROLES.TrainingSpecialist) &&
              view === 'month' && (
                <Button
                  onClickHandler={() => {
                    trainerDropdown.toggleDropdown();
                  }}
                  variants="secondary"
                  className="gap-1 !flex !py-2.5 !px-3.5"
                >
                  <Image iconName="calendarCheckIcon" iconClassName="w-5 h-5" />
                  {t('ViewCalendars')}
                </Button>
              )}
            {trainerDropdown.isDropdownOpen && (
              <div
                className={`${
                  trainerDropdown.isDropdownOpen && 'z-1'
                } absolute top-[calc(100%_+_20px)]  before:absolute transition-all duration-300`}
              >
                <div className="bg-white rounded-xl shadow-card w-[340px]">
                  <div className="px-5 py-3.5 border-b border-solid border-offWhite">
                    <h5 className="text-base leading-5 font-semibold text-dark">
                      {t('Calendar.filterTabs.trainersTitle')}
                    </h5>
                  </div>
                  <div className="px-5 py-3">
                    <div className="flex flex-col gap-y-3">
                      <OtherTrainerCalendar
                        setTrainerColors={setTrainerColors}
                        setInitialValues={setInitialValues}
                        initialValues={initialValues}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Button
            onClickHandler={() => {
              filterModal.openModal();
            }}
            variants="secondary"
            className="gap-1 !flex !py-2.5 !px-3.5"
          >
            <Image iconName="filterIcon2" iconClassName="w-4 h-4" />
            {t('Calendar.filterButton')}
          </Button>
          <div className="rbc-btn-group view-group flex items-center">
            {views.map((viewData: string, index) => (
              <Button
                key={viewData}
                className={`rbc-btn ${view === viewData ? 'rbc-active' : ''}`}
                onClickHandler={() => onView(viewData)}
              >
                {customViewTitles[index]}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {combinedFilters?.length > 0 && (
        <div className="rbc-applied-filter mb-7">
          <div className="flex gap-4 justify-end">
            <Button className="mt-2 text-sm text-dark font-medium inline-block select-none">
              {t('Calendar.appliedFiltersTitle')}
            </Button>
            <div className="max-w-[calc(100%_-_180px)] flex flex-wrap gap-4">
              {combinedFilters.map((data, ind) => {
                return (
                  <Button
                    className="calendar-filter-button"
                    key={`filters_${ind + 1}`}
                  >
                    {data?.title}
                    <Button
                      className="w-5 h-5 inline-block cursor-pointer active:scale-95 select-none"
                      onClickHandler={() => handleDeleteFilter(data)}
                    >
                      <Image
                        iconName="crossRoundIcon"
                        iconClassName="w-full h-full"
                      />
                    </Button>
                  </Button>
                );
              })}
            </div>
            <Button
              className="calendar-filter-clear"
              onClickHandler={handleClearFilter}
            >
              {t('Calendar.clearAllTitle')}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
