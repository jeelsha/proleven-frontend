import { SVGAttributes } from 'react';

export type IconProps = {
  name: IconTypes;
  iconType?: 'default' | 'custom';
  className?: string;
} & SVGAttributes<SVGElement>;

export type IconTypes =
  | 'dashboardStrokeSD'
  | 'userStrokeSD'
  | 'ticketStrokeSD'
  | 'notePencilStrokeSD'
  | 'emailStrokeSD'
  | 'personHeadStrokeSD'
  | 'userGroupStrokeSD'
  | 'pencilLineStrokeSD'
  | 'userRoundStrokeSD'
  | 'searchStrokeSD'
  | 'exportCsv'
  | 'bulkUpload'
  | 'filterStrokeSD'
  | 'googleIcon'
  | 'facebookIcon'
  | 'passwordEyeStrokeSD'
  | 'noImgStrokeSD'
  | 'dotsThreeFillSD'
  | 'userOutlineSD'
  | 'arrowLeftStrokeSD'
  | 'arrowSquareOutStrokeSD'
  | 'rightTickFillSD'
  | 'crossStrokeSD'
  | 'emailTemplateIcon'
  | 'eyeIcon'
  | 'deleteIcon'
  | 'editIcon'
  | 'notificationBellIcon'
  | 'checkRoundIcon'
  | 'userProfile'
  | 'arrowRightIcon'
  | 'cogIcon'
  | 'lockIcon'
  | 'logoutIcon'
  | 'profileIcon'
  | 'copyIcon'
  | 'lineMenuIcon'
  | 'linkIcon'
  | 'crossIcon'
  | 'plusSquareIcon'
  | 'plusIcon'
  | 'rightDoubleArrows'
  | 'leftDoubleArrows'
  | 'threeDotVerticalIcon'
  | 'chevronRight'
  | 'chevronLeft'
  | 'chatBubbleIcon'
  | 'trashIcon'
  | 'filterIcon'
  | 'companyInfo'
  | 'infoIcon'
  | 'arrowRight'
  | 'clockIcon'
  | 'locationIcon'
  | 'bookIcon'
  | 'bookIcon2'
  | 'crossRoundIcon'
  | 'crossRoundIcon2'
  | 'fileBlankIcon'
  | 'imageIcon2'
  | 'sendIcon'
  | 'videoIcon'
  | 'arrowRoundIcon'
  | 'filterIcon2'
  | 'userjoinIcon'
  | 'userGroupIcon'
  | 'teacher'
  | 'bookmarkIcon'
  | 'sendSquareIcon'
  | 'mailIcon'
  | 'toastBubbleIcon'
  | 'toastSuccessIcon'
  | 'toastErrorIcon'
  | 'toastInfoIcon'
  | 'toastWarning'
  | 'eyeCrossIcon'
  | 'playIcon'
  | 'templateIcon'
  | 'drawPadIcon'
  | 'calendarIcon'
  | 'googleMeetIcon'
  | 'teamsIcon'
  | 'zoomIcon'
  | 'linkIcon2'
  | 'googleCalendar'
  | 'outlookIcon'
  | 'optionIcon'
  | 'icalIcon'
  | 'fileIcon'
  | 'checkRoundIcon2'
  | 'calendarIcon2'
  | 'calendarEditIcon'
  | 'cardTickIcon'
  | 'downloadFile'
  | 'stopwatchIcon'
  | 'magicPen'
  | 'editPen'
  | 'userIcon2'
  | 'editpen2'
  | 'minusIcon'
  | 'checkIcon'
  | 'exclamationMarkIcon'
  | 'mapMarker'
  | 'penSquareIcon'
  | 'receiptIcon'
  | 'userCrossIcon'
  | 'calendarNextPage'
  | 'calendarCheckIcon'
  | 'starSpeedIcon'
  | 'starIcon'
  | 'doubleUpArrow'
  | 'awardBadgeIcon'
  | 'bookOpenIcon'
  | 'imageIcon'
  | 'hashIcon'
  | 'refreshIcon'
  | 'projectManagementIcon'
  | 'linkIcon3'
  | 'bookReqIcon'
  | 'bookmarkIcon2'
  | 'publishIcon'
  | 'downloadFile2'
  | 'companyIcon'
  | 'clipboardIcon'
  | 'paymentTermIcon'
  | 'accessDeniedIcon'
  | 'boxTickIcon'
  | 'navChatIcon'
  | 'navCoursePipelineIcon'
  | 'navCoursesManagementIcon'
  | 'navCourseRequestIcon'
  | 'navEmailIcon'
  | 'navHomeIcon'
  | 'navPaymentIcon'
  | 'navProjectPipelineIcon'
  | 'navQuotesIcon'
  | 'navSystemLogsIcon'
  | 'navTemplateManagementIcon'
  | 'unfilledIcon'
  | 'accessIcon'
  | 'resourceIcon'
  | 'roomIcon'
  | 'trainerIcon'
  | 'totalSumIcon'
  | 'publishCourseIcon'
  | 'dragIcon'
  | 'sideBarOrder'
  | 'sideBarProduct'
  | 'box3DIcon'
  | 'sideBarInvoice'
  | 'chartIcon'
  | 'yellowStarIcon'
  | 'redExclamationMarkIcon'
  | 'downArrow'
  | 'transferIcon'
  | 'markAsSoldOut'
  | 'soldOut'
  | 'expenseIcon'
  | 'reminderIcon'
  | 'exclamationWarning'
  | 'requestIcon'
  | 'reviewInvite'
  | 'checkIconDark';
