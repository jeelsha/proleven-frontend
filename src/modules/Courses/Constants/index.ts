import {
  FILE_SUPPORTED_FORMATS,
  IMAGE_SUPPORTED_FORMATS,
  VIDEO_SUPPORTED_FORMATS,
} from 'constants/filesupport.constant';
import { TFunctionProps } from '../types';

export enum CourseStatus {
  publish = 'publish',
  confirmed = 'confirmed',
  draft = 'draft',
  rejected = 'rejected',
  proposed = 'proposed',
  requested = 'requested',
  incomplete = 'incomplete',
}

export enum CourseBundleStatus {
  publish = 'publish',
  draft = 'draft',
}

export enum AssignedStatus {
  Accepted = 'accepted',
  Rejected = 'rejected',
  InProgress = 'in_progress',
  Requested = 'requested',
  Draft = 'draft',
}

export enum CourseType {
  Academy = 'academy',
  Private = 'private',
}

export const COURSE_TYPE = {
  Private: 'private',
  Academy: 'academy',
  academy: 'Academy',
  private: 'Private',
};

export enum CourseModeEnum {
  InPerson = 'in-person',
  VideoConference = 'video-conference',
  Hybrid = 'hybrid',
}

export enum TrainerCourseModeEnum {
  InPerson = 'In-person',
  VideoConference = 'Video-conference',
  Hybrid = 'Hybrid',
}

export enum CourseMarkAsEnum {
  Public = 'public',
  Private = 'private',
  SoldOut = 'sold_out',
  EnrollmentOpen = 'enrollment_open',
  TemporarySoldOut = 'temporary_sold_out',
}

export const FundedBy = {
  'proleven-academy': 'Proleven Management',
  'client-address': 'Customer Management',
  ClientAddress: 'client-address',
  ProlevenAcademy: 'proleven-academy',
  NAN: 'NAN',
};
export enum Conference {
  ZOOM = 'zoom',
  GOOGLE_CALENDAR = 'google_calendar',
  MICROSOFT_CALENDAR = 'microsoft_calendar',
}

export enum Calendar {
  GOOGLE_CALENDAR = 'google_calendar',
  MICROSOFT_CALENDAR = 'microsoft_calendar',
}

export enum ActionNameEnum {
  NEXT = 'next',
  PREV = 'prev',
  SUBMIT = 'submit',
}

export const QuestionType = ({ t }: TFunctionProps) => {
  return [
    {
      label: t('CourseManagement.createSurvey.ratingOption'),
      value: 'rate',
    },
    {
      label: t('CourseManagement.createSurvey.mcqOption'),
      value: 'mcq',
    },
    {
      label: t('CourseManagement.createSurvey.answerOption'),
      value: 'answer',
    },
    {
      label: t('CourseManagement.createSurvey.multiSelectOption'),
      value: 'multiselect',
    },
    {
      label: t('CourseManagement.createSurvey.linearScaleOption'),
      value: 'scale',
    },
  ];
};

export const SurveyType = ({ t }: TFunctionProps) => {
  return [
    {
      label: t('CourseManagement.createSurvey.courseOption'),
      value: 'course',
    },
    {
      label: t('CourseManagement.createSurvey.trainerOption'),
      value: 'trainer',
    },
  ];
};

export const RequiredType = ({ t }: TFunctionProps) => {
  return [
    {
      label: t('confirmationChoices.yesOption'),
      value: 'true',
    },
    {
      label: t('confirmationChoices.noOption'),
      value: 'false',
    },
  ];
};
export const StartScaling = [{ label: '1', value: 1 }];

export const EndScaling = [
  { label: '5', value: 5 },
  { label: '10', value: 10 },
];

export const FileAcceptType = {
  image: IMAGE_SUPPORTED_FORMATS,
  video: VIDEO_SUPPORTED_FORMATS,
  document: FILE_SUPPORTED_FORMATS,
};

export const getColorClass = (range: number | undefined, label_index: number) => {
  let colorClass;
  if (range === 5) {
    if (label_index <= 1) {
      colorClass = 'bg-red-400';
    } else if (label_index >= 4) {
      colorClass = 'bg-green-400';
    } else {
      colorClass = 'bg-orange-400';
    }
  } else if (range === 10) {
    if (label_index <= 3) {
      colorClass = 'bg-red-400';
    } else if (label_index >= 7) {
      colorClass = 'bg-green-400';
    } else {
      colorClass = 'bg-orange-400';
    }
  }
  return colorClass;
};

export enum TrainerSuggested {
  Available = 'available',
  Unavailable = 'unavailable',
}

export enum TrainerSelected {
  Available = 'available',
  Unavailable = 'unavailable',
}

// **** Fields to delete from course payload
export const fieldsToDelete = [
  'courseCategory',
  'courseSubCategory',
  'creator_role',
  'creator_first_name',
  'creator_last_name',
  'training_specialist',
  'createdByUser',
  'lessonApproval',
  'description',
  'created_at',
  'assigned_to',
  'lessonSessionApproval',
  'assigned_rooms',
  'course_resources',
  'course_participates',
  'valid_optional_trainers',
  'projects',
  'card_members',
  'isErrorInResource',
  'certificate_pdf_link',
  'course_bundle_id',
  'access',
  'surveyTemplate',
  'isErrorInTrainer',
  'isErrorInRoom',
  'main_rooms_data',
  'optional_rooms_data',
  'codes',
  'code_title',
  'duration',
];

// **** Fields to translate using google API
export const fieldsToTranslate = [
  'title',
  'question',
  'answer',
  'correct_answer',
  'content',
  'topic',
];
