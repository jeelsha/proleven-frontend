import { PopupStyles } from 'components/ReactCalendar/types';

export const calculatePosition = ({
  modalWidth,
  modalHeight,
  clickedEventPositions,
}: {
  modalWidth: number;
  modalHeight: number;
  clickedEventPositions: DOMRect | undefined;
}) => {
  const calendarPopupStyles: PopupStyles = {
    top: 'initial',
    position: 'absolute',
  };

  const boundary = {
    left: 0,
    right: window.innerWidth,
    top: 0,
    bottom: window.innerHeight,
  };
  const buttonPosition: any = {
    left:
      clickedEventPositions?.left !== undefined
        ? Number(clickedEventPositions?.left)
        : 0,
    top:
      clickedEventPositions?.top !== undefined
        ? Number(clickedEventPositions.top)
        : 0,
  };
  buttonPosition.bottom = buttonPosition.top + (clickedEventPositions?.height ?? 0);
  buttonPosition.right = buttonPosition.left + (clickedEventPositions?.width ?? 0);
  // let maxHeight = 'auto';
  if (
    boundary.right - buttonPosition.right > modalWidth &&
    boundary.bottom - buttonPosition.bottom > modalHeight
  ) {
    // RIGHT
    calendarPopupStyles.maxHeight = `${boundary.bottom - buttonPosition.bottom}px`;
    calendarPopupStyles.top = `${buttonPosition.top}px`;
    calendarPopupStyles.left = `${buttonPosition.right}px`;
  } else if (
    buttonPosition.left - boundary.left > modalWidth &&
    boundary.bottom - buttonPosition.bottom > modalHeight
  ) {
    // Left
    calendarPopupStyles.maxHeight = `${boundary.bottom - buttonPosition.bottom}px`;
    calendarPopupStyles.top = `${buttonPosition.top}px`;
    // maxHeight = `${boundary.bottom - buttonPosition.top}px`;
    calendarPopupStyles.left = `${buttonPosition.left - modalWidth}px`;
  } else if (buttonPosition.top - boundary.top > modalHeight) {
    // for TOP
    calendarPopupStyles.maxHeight = `${buttonPosition.top - boundary.top}px`;
    calendarPopupStyles.top = `${buttonPosition.top - modalHeight}px`;
    if (boundary.right - buttonPosition.right > modalWidth) {
      calendarPopupStyles.left = `${buttonPosition.left}px`;
    } else if (buttonPosition.left - boundary.left > modalWidth) {
      calendarPopupStyles.left = `${buttonPosition.right - modalWidth}px`;
    } else {
      calendarPopupStyles.left = `${buttonPosition.left}px`;
    }
  } else if (buttonPosition.bottom - boundary.bottom > modalHeight) {
    // for Bottom
    calendarPopupStyles.maxHeight = `${boundary.bottom - buttonPosition.bottom}px`;
    calendarPopupStyles.top = `${buttonPosition.bottom}px`;
    calendarPopupStyles.left = `${buttonPosition.left}px`;
    // maxHeight = `${boundary.bottom - buttonPosition.top}px`;
  } else {
    const getMinus =
      (buttonPosition.right - buttonPosition.left) / 2 - modalWidth / 2;
    calendarPopupStyles.maxHeight = `${boundary.bottom - buttonPosition.bottom}px`;
    calendarPopupStyles.top = `${buttonPosition.bottom}px`;
    calendarPopupStyles.left = `${buttonPosition.left + getMinus}px`;
  }
  return calendarPopupStyles;
};
