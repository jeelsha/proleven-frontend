import { TFunction } from 'i18next';
import { SetStateAction } from 'react';

export type TrainerUser = {
  full_name: string;
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  secret_2fa: string;
  two_factor_enabled: boolean;
  username: string;
  contact: string;
  profile_image: string;
  added_by: number | null;
  date_format: string;
  timezone: string | null;
  birth_date: string | null;
  gender: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  country: string | null;
  state: string | null;
  zip: string | null;
  active: string;
  last_login_time: string | null;
  verified: boolean;
  role_id: number;
  is_head: boolean;
  language: string;
  pass_logs: string;
  parent_table_id: number | null;
  chat_user_status: string;
  last_active_time: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  trainer?: {
    travel_reimbursement_fee: number;
    hourly_rate: number;
    location: string;
    reimbursement_threshold: number;
  };
  role: Role;
};
interface Role {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
export interface InvoiceFilterType {
  invoiceStatus?: string[];
  startDueDate: string;
  endDueDate: string;
  filterDate: {
    startDate: string | Date;
    endDate: string | Date;
  };
  payment_mode: string;
  salesRep: number[];
}

export interface TrainerFilterType {
  invoiceStatus?: string[];
  startDueDate: string;
  endDueDate: string;
  filterDate: {
    startDate: string | Date;
    endDate: string | Date;
  };
  payment_mode: string;
}

export interface trainerOrderFilterDateType {
  invoiceStatus?: string[];
  startDueDate: string;
  endDueDate: string;
  payment_mode: string;
  salesRep?: number[];
  formValue?: {
    // salesRep?: Option[];
  };
}
export interface FilterInvoiceProps {
  setFilterModal: React.Dispatch<SetStateAction<boolean>>;
  setInvoiceFilters: React.Dispatch<SetStateAction<TrainerFilterType>>;
  t: TFunction<'translation', undefined>;
  invoiceFilters: TrainerFilterType | undefined;
}

export interface FilterMonthProps {
  setFilterModal: React.Dispatch<SetStateAction<boolean>>;
  dateValue: string | Date;
  setDateValue: React.Dispatch<SetStateAction<string | Date>>;
  t: TFunction<'translation', undefined>;
}

export type ITrainerInvoice = {
  courseData: {
    course_id: number;
    id: number;
    lesson_id: number | null;
    price: number | null;
    slug: string;
    bonus: string;
    lesson_session: {
      id: number;
      lesson_id: number;
      slug: string;
      start_time: string;
      end_time: string;
      course_id: number;
      created_by: 1;
      assigned_to: null;
      created_at: string;
      lesson: {
        id: number;
        title: string;
        mode: string;
        client_meeting_link: string;
        slug: string;
        date: string;
        address_map_link: null;
        place_address: string;
        course_id: 4;
        created_by: 1;
        created_at: string;
      };
    };
    lumpsum_data: boolean;
    lession_price: {
      hours: number;
      price: number;
      total_price: number;
    };
    travel_reimbursement: {
      days: number;
      kilometer: number;
      reimbursement_price: number;
      reimbursement_total_price: number;
    };
    net_total: number;
    net_amount: number;
    trainer_course: TrainerCourse;
    trainer_lesson: {
      id: number;
      title: string;
      mode: string;
      conference_provider: string;
      calendar_provider: string;
      client_meeting_link: string;
      created_at: string;
      parent_table_id: number;
      slug: string;
      date: string;
      address_map_link: null;
      place_address: string;
      course_id: number;
    };
    lumpsum_price: {
      amount: number;
      reimbursement_amount: number;
      net_total: number;
    };
    lesson_approval: LessonApproval;
    lesson_date: string | Date;
    academy_id: number | null;
    assigned_to: number | null;
    card_id: number;
    category_id: number;
    certificate_pdf_link: string;
    certificate_template_id: number;
    certificate_title: string;
    cloned_course_id: number;
    code: string;
    code_id: number;
    codes: Codes;
    course_bundle_id: number | null;
    course_template_id: number | null;
    description: string;
    duration: number;
    end_date: string;
    founded: boolean;
    funded_by: string;
    has_exam: boolean;
    image: string;
    is_template: boolean;
    language: string;
    marked_as: string;
    maximum_participate_allowed: number;
    maximum_participation_attendance: number;
    meeting_room_number: string;
    need_digital_attendance_sheet: boolean;
    notes: string;
    parent_table_id: number;
    price_in: string;
    project_id: number;
    projects: Project;
    reject_reason: string;
    start_date: string;
    status: string;
    sub_category_id: number | null;
    survey_template_id: number;
    title: string;
    type: string;
    validity: number;
    validity_mail_sent_at: string | null;
    trainer_id: number;
    trainer_user: TrainerUser;
    updated_at: string;
    updated_by: number | null;
  }[];
  trainerCourse: TrainerCourse;
  trainerCourseBundle: {
    title: string;
    end_date: string;
    start_date: string;
  };
  trainer: TrainerUser;
  course_total: number;
};

export interface LessonApproval {
  id: number;
  assigned_to: number;
  lesson_session_id: number;
  course_id: number;
  course_bundle_id: number | null;
  assigned_to_status: string;
  trainer_assigned_to_status: string;
  lesson_id: number;
  reject_note: string | null;
  request_id: number;
  is_full_course: boolean;
  available: boolean;
  is_optional: boolean;
  is_lesson_trainer: boolean;
  without_approval: boolean;
  is_lesson_selected: boolean;
  last_reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  lessonSessions?: {};
}

interface TrainerCourse {
  id: number;
  marked_as: string;
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
  certificate_pdf_link: string;
  maximum_participation_attendance: number;
  course_template_id: number | null;
  certificate_template_id: number;
  survey_template_id: number;
  cloned_course_id: number;
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
  project_id: number;
  language: string;
  course_bundle_id: number | null;
  parent_table_id: number;
  validity_mail_sent_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  codes: Codes;
  projects: Project;
  courseCategory: {
    id: number;
    name: string;
    slug: string;
    image: string;
  };
  courseSubCategory: {
    id: number;
    name: string;
    slug: string;
    image: string;
  };
}

interface Codes {
  id: number;
  code: string;
  description: string;
  course_code_type: string;
  slug: string;
}

interface Project {
  id: number;
  title: string;
  person_first_name: string;
  person_last_name: string;
  emails: string;
  phone_numbers: string;
  slug: string;
  deal_project_id: number;
  deal_stage_id: number;
  deal_user_id: number;
  deal_person_id: number;
  deal_organization_id: number | null;
  stage: string | null;
  status: string;
  deal_value: number;
  priority: string;
  due_date: string;
  value_in: string;
  add_time: string;
  close_time: string;
  archive_time: string | null;
  description: string | null;
  card_id: number;
  language: string;
  parent_table_id: number;
  project_quotes: ProjectQuote[];
}

interface ProjectQuote {
  id: number;
  project_id: number;
  quote_id: number;
  parent_table_id: number;
  language: string;
  quote: Quote;
}

interface Quote {
  id: number;
  slug: string;
  company_id: number;
  status: string;
  is_destination_goods: boolean;
  address: string | null;
  cap_number: string | null;
  province: string | null;
  payment_term: string | null;
  city: string | null;
  country: string | null;
  email: string | null;
  telephone: string | null;
  mobile_number: string | null;
  quote_number: string;
  payment_method: string;
  sales_rep_id: number;
  date: string;
  account_holder: string;
  destination_email: string;
  destination_cap: number;
  destination_province: string;
  codice_fiscale: string;
  cod_dest: string;
  destination_mobile_number: string | null;
  destination_telephone: string | null;
  academy: string;
  currency: string;
  funded_by: string;
  total_discount: number | null;
  total_amount: number;
  language: string;
  project_id: number | null;
  quote_type: string;
  company: Company;
  quoteProduct: QuoteProduct[];
}

interface Company {
  id: number;
  uuid: string;
  user_id: number | null;
  name: string;
  legal_name: string | null;
  registration_number: string;
  slug: string;
  industry: string | null;
  description: string | null;
  size: string | null;
  logo: string;
  accounting_emails: string;
  sales_rep_id: number | null;
  ateco_code: string;
  sdi_code: string;
  payment_term_id: number;
  vat_number: string;
  is_invoice: boolean;
  address1: string;
  address2: string | null;
  city: string;
  country: string;
  state: string | null;
  zip: string;
  invoice_date: string | null;
  parent_table_id: number | null;
  address_province: string | null;
  vat_type: string | null;
  language: string;
}

interface QuoteProduct {
  id: number;
  slug: string;
  title: string;
  quote_id: number;
  code_id: number;
  main_id: number | null;
  vat_number: string;
  units: number;
  price: number;
  discount: number;
  product_total_amount: number;
  description: string;
  product_sequence: number;
  product_type: string;
  reason: string | null;
  delete_reason: string | null;
  updated_by: number | null;
  invoice_status: string;
  product_status: string;
}

export interface OrderPdfType {
  language: string;
  filepath: string;
}

export type Invoice = {
  id: number;
  trainer_id: number;
  due_date: string | null;
  invoice_date: string;
  payment_status: string;
  payment_date: Date | string;
  price: number | null;
  slug: string;
  invoice_number: string;
  fatture_invoice_id: number | null;
  fatture_invoice_number: string | null;
  file_path: string;
  files: OrderPdfType[];
  created_at: string;
  trainer_invoice: Trainer;
  invoice_product: InvoiceProduct[];
};

interface Trainer {
  full_name: string;
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  secret_2fa: string;
  two_factor_enabled: boolean;
  username: string;
  contact: string;
  profile_image: string;
  added_by: number | null;
  date_format: string;
  timezone: string | null;
  birth_date: string | null;
  gender: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  country: string | null;
  state: string | null;
  zip: string | null;
  active: string;
  last_login_time: string | null;
  verified: boolean;
  role_id: number;
  is_head: boolean;
  language: string;
  pass_logs: string | null;
  parent_table_id: number | null;
  chat_user_status: string;
  last_active_time: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface InvoiceProduct {
  id: number;
  order_id: number;
  product_id: number | null;
  project_id: number;
  code_id: number | null;
  company_id: number | null;
  invoice_id: number;
  event_id: number | null;
  quote_id: number;
  main_id: number | null;
  payment_term_id: number | null;
  course_id: number;
  invoice_status: string;
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
  price: number | null;
  qty: number | null;
  slug: string;
  created_at: string;
  order: Order;
}

interface Order {
  id: number;
  order_number: string;
  company_id: number | null;
  trainer_id: number;
  quote_id: number | null;
  payment_term_id: number | null;
  course_id: number | null;
  project_id: number | null;
  status: string;
  order_type: string;
  type: string;
  close_order_reason: string | null;
  quote_product_id: number | null;
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
  slug: string;
}
