export type IUserData = {
  [key: string]: string | number | undefined | boolean | null;
  user_id: number | string;
  users?: string;
  role?: string;
  view: boolean;
  edit: boolean;
  delete: boolean;
  survey_template_id?: number | null;
  course_id?: number | null;
  course_bundle_id?: number | null;
};

export type UserRole = {
  id: number;
  name: string;
};

export type User = {
  id: number;
  username: string;
  role: UserRole;
};

export type AccessUserData = {
  course: null;
  course_bundle_id: null;
  course_id: null;
  created_at: string; // Date string in ISO 8601 format
  delete: boolean;
  deleted_at: string | null; // Date string in ISO 8601 format or null
  edit: boolean;
  id: number;
  language: string;
  survey_template_id: number;
  updated_at: string; // Date string in ISO 8601 format
  user: User;
  user_id: number;
  view: boolean;
};
