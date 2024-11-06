interface Category {
  id: number;
  name: string;
  slug: string;
  language: string;
  parent_table_id: number;
  is_legislation_included: boolean;
  legislation_term: string | null;
  image: string;
  created_by: string | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DataItem {
  id: number;
  name: string;
  slug: string;
  language: string;
  survey_template_id: number | null;
  parent_table_id: number;
  image: string | null;
  category_id: number;
  legislation_term: string | null;
  created_by: string | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  surveyTemplate: any | null; // Assuming the surveyTemplate can be any type, replace with specific type if known
  category: Category;
}

export interface ApiResponse {
  data: DataItem[];
  count: number;
  currentPage: number;
  limit: number;
  lastPage: number;
}
