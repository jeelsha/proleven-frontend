import { TimePicker, timePicker } from 'analogue-time-picker';
import Button from 'components/Button/Button';
import { Modal } from 'components/Modal/Modal';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setToast } from 'redux-toolkit/slices/toastSlice';
import { customRandomNumberGenerator } from 'utils';
import './style.css';

type ModalProps = {
  modal: {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
  };
  onSubmit?: (time: string) => void;
  title?: string;
  customTime?: {
    hour: number;
    minute: number;
  };
  startTime?: string;
  endTime?: string;
};
export const CustomTimePicker = ({
  modal,
  onSubmit,
  title,
  customTime,
  startTime,
  endTime,
}: ModalProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const start_time = new Date(startTime ?? '');
  const end_time = new Date(endTime ?? '');

  const [showTime, setShowTime] = useState<TimePicker>();
  const [disableButton, setDisableButton] = useState(false);
  useEffect(() => {
    const timePickerInstance = timePicker({
      element: document.getElementById('clock') as HTMLElement,
      mode: 12,
      width: '300px',
      time: customTime ?? {
        hour: new Date().getHours(),
        minute: new Date().getMinutes(),
      },
    });
    setShowTime(timePickerInstance);
    timePickerInstance.onTimeChanged((hour: number, minute: number) => {
      if (start_time && end_time) {
        if (hour < start_time?.getHours() || hour > end_time?.getHours()) {
          setDisableButton(true);
          return true;
        }
        if (hour === start_time?.getHours() && minute < start_time?.getMinutes()) {
          setDisableButton(true);
          return true;
        }
        if (hour === end_time?.getHours() && minute > end_time?.getMinutes()) {
          setDisableButton(true);
          return true;
        }
        setDisableButton(false);
        return false;
      }
    });
    return () => {
      // Dispose of the time picker when component unmounts
      timePickerInstance.dispose();
    };
  }, []);

  const handleClick = () => {
    const object = showTime?.getTime();
    if (!disableButton) {
      if (object) {
        const time = `${object.hour}:${object.minute}`;
        onSubmit?.(time);
      }
      modal.closeModal();
    } else {
      dispatch(
        setToast({
          variant: 'Error',
          message: `${t('timeSheet.toastMessage')}`,
          type: 'error',
          id: customRandomNumberGenerator(),
        })
      );
    }
  };
  return (
    <Modal
      headerTitle={title ?? t('CompanyManager.courseDetails.time')}
      modal={modal}
      width="max-w-[500px]"
    >
      <>
        <div id="clock" />
        <Button
          variants="primary"
          onClickHandler={() => handleClick()}
          className="m-auto mt-5"
        >
          {t('Button.submit')}
        </Button>
      </>
    </Modal>
  );
};
