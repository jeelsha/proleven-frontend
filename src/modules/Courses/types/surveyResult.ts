interface Question {
  id: number;
  question: string;
  survey_template_id: number;
  parent_table_id: number;
  is_required: boolean;
  survey_target: string;
  question_type: string;
  language: string;
  range?: number;
  label: string | null;
  slug: string;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface CourseSurvey {
  id: number;
  marked_as: string;
  mode: string;
  funded_by: string;
  code_id: number;
  academy_id: number | null;
  validity: number;
  is_template: boolean;
  start_date: string;
  end_date: string;
  has_exam: boolean;
  need_digital_attendance_sheet: boolean;
  founded: boolean;
  meeting_room_number: string;
  certificate_title: string;
  maximum_participate_allowed: number;
  price_in: string;
  notes: string;
  certificate_pdf_link: string | null;
  maximum_participation_attendance: number;
  max_attendee_applicable: boolean;
  course_template_id: number;
  certificate_template_id: number;
  survey_template_id: number;
  cloned_course_id: number | null;
  sub_category_id: number | null;
  created_by: number;
  assigned_to: number | null;
  title: string;
  code: string;
  image: string;
  status: string;
  slug: string;
  description: string;
  reject_reason: string;
  price: number;
  duration: number;
  type: string;
  category_id: number;
  card_id: number;
  project_id: number | null;
  language: string;
  course_bundle_id: number | null;
  parent_table_id: number;
  validity_mail_sent_at: string | null;
  survey_qr: string | null;
  survey_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface Answer {
  id: number;
  answer: string | null;
  answerSurvey: {
    answer?: string;
  };
  exam_participate_id: number;
  course_id: number;
  exam_id: number;
  slug: string;
  survey_template_id: number;
  answer_id: number | null;
  survey_question_id: number;
  rate?: number;
  course_trainer_id: number | null;
  parent_table_id: number | null;
  language: string;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  survey_question: Question;
  courseSurvey: CourseSurvey;
  courseTrainer: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

interface trainerRateData {
  trainerRate: string;
  trainerName: string;
}

export interface Survey {
  survey_question_id: string;
  question: Question;
  answers: Answer[];
  courseRate?: number;
  trainerRateData: trainerRateData[];
  totalCourseRating: string;
}
