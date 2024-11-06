export enum StageNameConstant {
  CourseCompleted = 'Course Completed',
  ProjectRejected = 'Project Rejected',
  CourseRejected = 'Course Rejected',
  DateConfirmed = 'Date Confirmed',
  CoursesStandby = 'Courses to be organized on standby',
  DateProposed = 'Date Proposed',
  DateRequested = 'Date Requested',
}

export enum socketProject {
  JOIN_PROJECT_MANAGEMENT_BOARD = 'join-project-management-board',
  JOIN_COURSE_MANAGEMENT_BOARD = 'join-course-management-board',
  UPDATE_PROJECT_CARD_STAGE = 'update-project-card-stage',
  UPDATE_PROJECT_CARD_ORDER = 'update-project-card-order',
  UPDATE_COURSE_CARD_STAGE = 'update-course-card-stage',
  UPDATE_COURSE_CARD_ORDER = 'update-course-card-order',
}

export enum DEFAULT_COURSE_MANAGEMENT_STAGES {
  DATE_REQUESTED = 'Date Requested',
  DATE_PROPOSED = 'Date Proposed',
  COURSES_TO_BE_ORGANIZED_ON_STANDBY = 'Courses to be organized on standby',
  DATE_CONFIRMED = 'Date Confirmed',
  COURSE_FINALIZED = 'Course finalized',
  COURSE_COMPLETED = 'Course Completed',
  ATTENDESS_UPLOADED = 'Attendess Uploaded',
  CERTIFICATES_ISSUED = 'Certificates Issued',
  COURSE_REJECTED = 'Course Rejected',
}

export const courseManagementAcceptedStage = [
  'Date Confirmed',
  'Course finalized',
  'Attendess Uploaded',
  'Certificates Issued',
];
