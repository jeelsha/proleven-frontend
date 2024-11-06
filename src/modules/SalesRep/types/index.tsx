export interface ISalesCourseRequest {
  id: number;
  title: string;
  additional_notes: string | null;
  course_id: number | null;
  company_id: number;
  status: string;
  course_slug: string | null;
  parent_req_id: number | null;
  language: string;
  parent_table_id: number;
  project_id: number | null;
  card_id: number | null;
  slug: string;
  requested_courses: ISalesRequestedCourse[];
  company: {
    id: number;
    name: string;
  };
}

interface ISalesRequestedCourse {
  id: number;
  title: string;
  additional_notes: string | null;
  course_id: number;
  company_id: number;
  status: string;
  course_slug: string;
  parent_req_id: number;
  language: string;
  parent_table_id: number;
  project_id: number | null;
  card_id: number | null;
  slug: string;
}
