import { Form, Formik, FormikProps, FormikValues } from 'formik';
import { useTranslation } from 'react-i18next';

import InputField from 'components/FormElement/InputField';

import { Modal } from 'components/Modal/Modal';

import IconReactSelect, {
  TransformedDataItem,
} from 'components/FormElement/IconReactSelect';
import TextArea from 'components/FormElement/TextArea';
import DatePicker from 'components/FormElement/datePicker';
import { IconTypes } from 'components/Icon/types';
import { REACT_APP_DATE_FORMAT } from 'config';
import { parseISO } from 'date-fns';
import { useAxiosGet, useAxiosPatch, useAxiosPost } from 'hooks/useAxios';
import { CalendarEventDetails, EventIntialProps } from 'modules/Calendar/types';
import { EventValidationSchema } from 'modules/Calendar/validation';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { ModalProps } from 'types/common';
import { convertDateToUTCISOString } from 'utils/date';

interface CreateEventProps {
  modal: ModalProps;
  internalEventsFetch?: () => void;
  eventDetail?: CalendarEventDetails;
  isEventEdit?: boolean;
}
interface ConnectionsProps {
  token_provider?: string;
  token_provider_mail?: string;
  id: number;
}

const combineDateTimeAndConvertToUTC = (date: Date, time: Date): string => {
  const combinedDateTime = new Date(date);
  const convertTime = new Date(time);
  combinedDateTime.setHours(convertTime.getHours());
  combinedDateTime.setMinutes(convertTime.getMinutes());

  return convertDateToUTCISOString(combinedDateTime);
};

const transformData = (data: ConnectionsProps[] = []): TransformedDataItem[] => {
  const iconMapping: Record<string, string> = {
    zoom: 'zoomIcon',
    icalendar: 'icalIcon',
    google_calendar: 'googleMeetIcon',
    microsoft_calendar: 'teamsIcon',
    test: 'teamsIcon',
  };

  return (
    data?.map((item) => {
      return {
        label: item.token_provider_mail ?? '',
        value: item.id || 0,
        icon: iconMapping[
          item.token_provider as keyof typeof iconMapping
        ] as IconTypes,
      };
    }) || []
  );
};
export const CreateEvent = ({
  modal,
  internalEventsFetch,
  eventDetail,
  isEventEdit,
}: CreateEventProps) => {
  const { t } = useTranslation();
  const [createEventApi, { isLoading: isCreateLoading }] = useAxiosPost();
  const [updateEventApi, { isLoading: isUpdateLoading }] = useAxiosPatch();
  const [calendarGetApi, { isLoading: isFetchLoading }] = useAxiosGet();
  const formikRef = useRef<FormikProps<FormikValues>>();
  const user = useSelector(getCurrentUser);
  const [calendarData, setCalendarData] = useState<ConnectionsProps[]>();
  const [conferenceData, setConferenceData] = useState<ConnectionsProps[]>();

  const initialValues: EventIntialProps = {
    date: eventDetail?.start_date ?? '',
    topic: eventDetail?.topic ?? '',
    agenda: eventDetail?.agenda ?? '',
    start_time: eventDetail?.start_date ? eventDetail?.start_date : '',
    end_time: eventDetail?.end_date ? eventDetail?.end_date : '',
    calendar_provider_id: eventDetail?.calendar_provider_id
      ? eventDetail?.calendar_provider_id
      : '',
    conference_provider_id: eventDetail?.conference_provider_id
      ? eventDetail?.conference_provider_id
      : '',
    calendar_provider: eventDetail?.calendar_provider_id
      ? eventDetail?.calendar_provider_id
      : '',
    conference_provider: eventDetail?.conference_provider_id
      ? eventDetail?.conference_provider_id
      : '',
  };
  function CallApi(type: string) {
    async function apiProps() {
      if (user) {
        const response = await calendarGetApi(
          `/users/${user?.username}/social-connections`,
          {
            params: {
              profile: true,
              default: true,
              type: true,
              ...(type === 'calendar' && { calendar: true }),
              ...(type === 'conference' && { conference: true }),
            },
          }
        );
        if (response?.data) {
          if (type === 'calendar') {
            setCalendarData(response.data.data);
          } else if (type === 'conference') {
            setConferenceData(response.data.data);
          }
        }
      }
    }
    apiProps();
  }

  useEffect(() => {
    CallApi('calendar');
    CallApi('conference');
  }, [user]);

  const OnSubmit = async (events: FormikValues) => {
    if (events) {
      const createEventData: FormikValues = {
        ...events,
        start_date: combineDateTimeAndConvertToUTC(events.date, events.start_time),
        end_date: combineDateTimeAndConvertToUTC(events.date, events.end_time),
        conference_provider_id: isEventEdit
          ? events?.conference_provider
          : events?.conference_provider,
        calendar_provider_id: isEventEdit
          ? events?.calendar_provider
          : events?.calendar_provider,
      };

      if (!createEventData.conference_provider)
        delete createEventData.conference_provider;
      if (!createEventData.calendar_provider)
        delete createEventData.calendar_provider;
      if (!createEventData.conference_provider_id)
        delete createEventData.conference_provider_id;
      if (!createEventData.calendar_provider_id)
        delete createEventData.calendar_provider_id;
      delete createEventData.date;
      delete createEventData.start_time;
      delete createEventData.end_time;

      const formData = new FormData();
      Object.entries(createEventData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (isEventEdit) {
        const { error } = await updateEventApi(
          `/internal-events/${eventDetail?.slug}`,
          createEventData
        );
        if (!error) {
          modal.closeModal();
          internalEventsFetch?.();
        }
      } else {
        const { error } = await createEventApi('/internal-events', createEventData);
        if (!error) {
          modal.closeModal();
          internalEventsFetch?.();
        }
      }
    }
  };
  const handleSubmitRef = () => {
    if (formikRef.current) {
      formikRef.current.submitForm();
    }
  };
  return (
    <Modal
      headerTitle={
        isEventEdit ? t('Calendar.editEventButton') : t('Calendar.eventButton')
      }
      modal={modal}
      showFooter
      footerButtonTitle={t('Button.cancelButton')}
      footerSubmit={handleSubmitRef}
      isSubmitLoading={isCreateLoading || isUpdateLoading}
      modalClassName={
        isCreateLoading || isUpdateLoading
          ? 'disabled:opacity-50 pointer-events-none'
          : ''
      }
    >
      <Formik
        enableReinitialize
        validationSchema={EventValidationSchema()}
        initialValues={initialValues}
        onSubmit={(values) => OnSubmit(values)}
        innerRef={formikRef as React.Ref<FormikProps<FormikValues>>}
      >
        {({ values, setFieldValue }) => {
          return (
            <Form className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <InputField
                placeholder={t('Calendar.createEvent.topicPlaceholder')}
                type="text"
                isCompulsory
                value={values.topic}
                isLoading={isFetchLoading}
                label={t('Calendar.createEvent.topic')}
                name="topic"
                parentClass="lg:col-span-2"
              />
              <DatePicker
                label={t('Calendar.createEvent.date')}
                icon
                selectedDate={values?.date ? new Date(values?.date) : null}
                onChange={(date: Date) => {
                  setFieldValue('date', date);
                }}
                name="date"
                isCompulsory
                isLoading={isFetchLoading}
                placeholder={t('Calendar.createEvent.datePlaceholder')}
                dateFormat={REACT_APP_DATE_FORMAT as string}
                minDate={new Date()}
              />
              <div className="self-end ">
                <DatePicker
                  startDateName="start_time"
                  endDateName="end_time"
                  parentClass="flex-[1_0_0%]"
                  label={t('CoursesManagement.CreateCourse.lessonTime')}
                  isCompulsory
                  range
                  selectedDate={
                    values.start_time ? parseISO(values.start_time) : undefined
                  }
                  endingDate={
                    values.end_time ? parseISO(values.end_time) : undefined
                  }
                  onRangeChange={(startDate, endDate) => {
                    if (setFieldValue) {
                      if (startDate)
                        setFieldValue('start_time', startDate.toISOString());
                      if (endDate) setFieldValue('end_time', endDate.toISOString());
                    }
                  }}
                  isTimePicker
                  showTimeSelectOnly
                  startDatePlaceholder={t(
                    'CoursesManagement.CreateCourse.startTime'
                  )}
                  endDatePlaceholder={t('CoursesManagement.CreateCourse.endTime')}
                  dateFormat="h:mm aa"
                  startDateMinTime={new Date(new Date().setHours(0, 0, 0))}
                  startDateMaxTime={
                    values.end_time
                      ? new Date(
                          parseISO(values?.end_time).getTime() - 1 * 60 * 60 * 1000
                        )
                      : undefined
                  }
                  endDateMinTime={
                    values.start_time
                      ? new Date(
                          parseISO(values.start_time).getTime() + 1 * 60 * 60 * 1000
                        )
                      : undefined
                  }
                  endDateMaxTime={new Date(new Date().setHours(23, 59, 59))}
                />
              </div>

              <TextArea
                parentClass="lg:col-span-2"
                rows={5}
                placeholder={t('Calendar.createEvent.agendaPlaceholder')}
                label={t('Calendar.createEvent.agenda')}
                isLoading={isFetchLoading}
                name="agenda"
                isCompulsory
              />
              <IconReactSelect
                name="calendar_provider"
                options={transformData(calendarData)}
                placeholder={t('Calendar.createEvent.calendarPlaceholder')}
                label={t('Calendar.createEvent.calendarTitle')}
                isLoading={isFetchLoading}
                isClearable
                disabled={isEventEdit}
              />
              <IconReactSelect
                name="conference_provider"
                options={transformData(conferenceData)}
                placeholder={t('Calendar.createEvent.conferencePlaceholder')}
                label={t('Calendar.createEvent.conferenceTitle')}
                isClearable
                isLoading={isFetchLoading}
                disabled={isEventEdit}
              />
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
};
