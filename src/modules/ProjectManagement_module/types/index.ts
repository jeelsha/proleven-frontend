import { FormikErrors } from 'formik';
import { UserModalType } from 'hooks/types';
import { IUseToggleDropdown } from 'hooks/useToggleDropdown';
import { IFilterApply } from '../components/FilterProjectPipeline';

type Stage = {
  id: number;
  name: string;
  order: number;
};

export type IOpenModalWithData = {
  initialBoardId?: number;
  commentId?: number;
  childId?: number;
};

interface ProjectNotes {
  active_flag: boolean;
  content: string;
  course_id: number;
  deal_id: number;
  deal_organization_id: number;
  deal_person_id: number;
  deal_user_id: number;
  deleted_at: string;
  id: number;
  language: string;
  note_id: number;
  parent_table_id: number;
  project_id: number;
  slug: string;
}

type Project = {
  id: number;
  title: string;
  slug: string;
  person_first_name: string;
  person_last_name: string;
  emails: string;
  phone_numbers: string;
  deal_project_id: number;
  deal_stage_id: number;
  deal_user_id: number;
  deal_person_id: number;
  deal_organization_id: number;
  stage?: Stage | null;
  courses?: ProjectCourse[];
  status: string;
  deal_value: number;
  value_in: string;
  add_time: string;
  update_time?: string;
  close_time: string;
  due_date: string;
  archive_time?: string;
  description: string;
  card_id: number;
  language: string;
  parent_table_id: number;
  project_notes?: ProjectNotes[];
  project_quotes?: IQuote[];
  priority: string;
  card_labels?: CardLabel[];
  created_at?: string;
};

export type ProjectCourse = {
  academy_id: null;
  assigned_to: null;
  card_id: number;
  category_id: number;
  course_participates: [{ id: number }];
  course_template_id: null;
  end_date: string;
  id: number;
  total_amount: number;
  image: string;
  lessonSessionApproval: ILessonSessionApproval[];
  price: number;
  price_in: string;
  project_id: number;
  reject_reason: string;
  slug: string;
  title: string;
  type: string;
};

type ILessonSessionApproval = {
  assignedToUser: {
    email: string;
    first_name: string;
    full_name: string;
    id: number;
    last_name: string;
    trainer: {
      id: number;
      user_id: number;
      hourly_rate: number;
      travel_reimbursement_fee: number;
      location: string;
      parent_table_id: number | null;
    };
    user_id: number;
    username: string;
    assigned_to: number;
    assigned_to_status: string;
  };
};

export type ProjectQuote = {
  id: number;
  slug: string;
  company_id: number;
  status: string;
  is_destination_goods: boolean;
  destination_goods: string | null;
  address: string | null;
  cap_number: string | null;
  province: string | null;
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
  total_discount: number | null;
  total_amount: number;
  language: string;
  project_id: number | null;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  parent_table_id: number | null;
};
export interface CoursePipeline {
  id: number;
  marked_as: string;
  progressive_number?: string;
  funded_by: string;
  code_id: number;
  academy_id: number;
  validity: string;
  is_template: boolean;
  start_date: string;
  end_date: string;
  has_exam: boolean;
  need_digital_attendance_sheet: boolean;
  founded: boolean;
  meeting_room_number: string;
  maximum_participate_allowed: number;
  price_in: string;
  notes: string;
  certificate_pdf_link: string;
  maximum_participation_attendance: number;
  course_template_id: number;
  cloned_course_id: number;
  sub_category_id: number;
  created_by: number;
  assigned_to: number;
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
  projects?: {
    id: number;
    card_id: number;
    title: string;
  };
  language: string;
  parent_table_id: number;
  card_attachments?: {
    id: number;
    attachment_url: string;
    card_id: number;
  }[];
  card_activities?: CardActivity[];
  card_labels?: CardLabel[];
}

export type Cards = {
  [key: string]: unknown;
  id: number;
  title: string;
  description: string;
  card_id: number;
  stage_id?: number;
  board_id?: number | string;
  slug?: string;
  language?: string;
  activity?: string;
  company_id?: number;
  manager?: {
    id: string;
    job_title: string;
    language: string;
    parent_table_id: number | null;
    updated_at: string;
    updated_by: number;
    user_id: number;
    created_by: string;
  };
  deal_project_id?: number | string;
  deal_stage_id?: number | string;
  deal_user_id?: number | string;
  deal_person_id?: number | string;
  deal_organization_id?: number | string;
  status?: string;
  deal_value?: number;
  value_in?: string;
  add_time?: string;
  close_time?: string;
  due_date?: string;
  created_at?: string;
  priority?: string;
  parent_table_id?: number | string;
  stage?: Stage;
  card_activities?: CardActivity[];
  card_members?: CardMembers[];
  card_labels?: CardLabel[];
  card_Company?: ProjectCompany[];
  card_attachments?: {
    id: number;
    attachment_url: string;
    card_id: number;
    created_by: number;
    show_trainer: boolean;
    show_company_manager: boolean;
  }[];
  funded_documents?: {
    attachment_url: string;
    card_id: number;
    created_by: number;
    id: number;
    is_funded_documents: boolean;
  }[];
  project?: Project;
  type?: string;
  courses?: CoursePipeline[];
  revenue?: number;
  currentPage?: number;
  count?: number;
  lastPage?: number;
  limit?: number;
} & MakeOptional<Pick<Project, 'project_quotes'>> &
  MakeOptional<CoursePipeline>;

//  Type to make optional keys
type MakeOptional<Type> = {
  [P in keyof Type]+?: Type[P];
};

// Type to re-map keys
// type KeyReMapper<Type> = {
//   [P in keyof Type as `${Capitalize<string & P>}custom`]: Type[P];
// };

export interface CompanyData {
  id: number;
  uuid: string;
  user_id: null;
  name: string;
  legal_name: null;
  registration_number: string;
  slug: string;
  website: null;
  industry: null;
  description: null;
  size: null;
  logo: string;
  accounting_emails: string;
  ateco_code: string;
  sdi_code: string;
  vat_number: string;
  is_invoice: boolean;
  address1: string;
  address2: string;
  city: string;
  country: string;
  state: null;
  zip: string;
  parent_table_id: null;
  language: string;
}

interface ProjectCompany {
  id: number;
  project_id: number;
  card_id: number;
  quote_id: null;
  company_id: number;
  manage_id: null;
  is_default: boolean;
  created_by: number;
  company: CompanyData;
}

type CardMembers = {
  id: number;
  user_id: number;
  card_id: number;
  created_by?: string;
  member: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    contact: string;
    profile_image: string;
    username: string;
    role?: {
      id: number;
      name: string;
    };
  };
};

type CardActivity = {
  id: number;
  description: string;
  created_at: string;
  is_system_default: boolean;
  updated_at: string;
  parent: ChildComment[];
  createdByUser: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    contact: null | string;
    profile_image: null | string;
    username: string;
  };
};
interface ChildComment {
  id: number;
  description: string;
  is_system_default: boolean;
  parent_comment_id: number | null;
  created_at: string;
  updated_at: string;
  createdByUser: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    contact: null | string;
    profile_image: null | string;
    username: string;
  };
}

type CardLabel = {
  id: number;
  label_id: number;
  card_id: number;
  created_by: string;
  label: {
    id: number;
    title: string;
    color: string;
  };
};

export interface ICardType {
  privateCourse: string;
  academyCourse: string;
}

export interface IMemberType {
  selectedMember: (string | number)[];
  selectedLabels: (string | number)[];
}

export interface IDateType {
  start_date: string;
  end_date: string;
}

export interface IGetProjectCardArgs {
  labelsFilter?: (string | number)[];
  membersFilter?: (string | number)[];
  courseType?: string[];
  dateFilter?: {
    start_date: string;
    end_date: string;
  };
  stageId?: number;
  isClear?: boolean; // to clear initialBoard data
  isFilterCleared?: boolean; // to clear Filter data
}

export interface CardsProject {
  id: number;
  name: string;
  board_id: number;
  order: number;
  slug: string;
  language: string;
  parent_table_id: number;
  cards: {
    count?: number;
    currentPage?: number;
    lastPage?: number;
    limit?: number;
    data: [
      {
        [key: string]: unknown;
        id: number;
        title: string;
        description: string;
        card_id: number;
        stage_id: number;
        board_id: number;
        slug: string;
        language: string;
        parent_table_id: number;
        priority: string;
        project: {
          id: number;
          title: string;
          slug: string;
          deal_project_id: number;
          deal_stage_id: number;
          deal_user_id: number;
          deal_person_id: number;
          deal_organization_id: number;
          status: string;
          deal_value: number;
          value_in: string;
          add_time: string;
          close_time: string;
          card_id: number;
          parent_table_id: number;
          description: string;
          language: string;
          priority: string;
        };
        courses?: CoursePipeline[];
        card_attachments?: [];
        card_activities?: [];
        card_labels?: [];
      }
    ];
  };
}

export interface CardInterface {
  id: number;
  name: string;
  board_id: number;
  order: number;
  slug: string;
  language: string;
  parent_table_id: number;
  cards: [
    {
      [key: string]: unknown;
      id: number;
      title: string;
      description: string;
      card_id: number;
      stage_id: number;
      board_id: number;
      slug: string;
      language: string;
      parent_table_id: number;
      priority: string;
      project: {
        id: number;
        title: string;
        slug: string;
        deal_project_id: number;
        deal_stage_id: number;
        deal_user_id: number;
        deal_person_id: number;
        deal_organization_id: number;
        status: string;
        deal_value: number;
        value_in: string;
        add_time: string;
        close_time: string;
        card_id: number;
        parent_table_id: number;
        description: string;
        language: string;
        priority: string;
        card_labels?: CardLabel[];
      };
      courses?: CoursePipeline[];
      card_attachments?: [];
      card_activities?: [];
      card_labels?: [];
    }
  ];
}
export type emailModal = {
  [key: string]: boolean;
};

export type Attachment = {
  attachments: [];
};

export interface PaginationCourse {
  stage_id?: number;
  count?: number;
  limit?: number;
  lastPage?: number;
  currentPage?: number;
  scrollFromTop?: number;
}

export interface Columns {
  id: number;
  order?: number | string;
  stageTitle?: string;
  title: string;
  cards: Cards[];
  documents?: Attachment;
  labels?: LabelValuesType;
}

export interface BoardData {
  columns: Columns[];
}

export interface ActiveCardType {
  column: number | string;
  card: string | number;
}

export type LabelValuesType = {
  id: number;
  title: string;
  color: string;
  slug: string;
  language: string;
  parent_table_id: number;
  created_by: number;
  updated_by: number;
  created_at: string;
}[];

export type LabelEdit = {
  data: LabelValuesType[0];
  index: number;
};

export type MemberValueType = {
  id: number;
  first_name: string;
  last_name: string;
  created_by?: string;
  chat_user_status: string;
  full_name: string;
  role: {
    id: number;
    name: string;
  };
};

export type LabelModalProps = {
  modalRef: IToggleDropDown;
  labelValues: LabelValuesType;
  selectedLabels: Cards['card_labels'];
  setLabelValues: React.Dispatch<React.SetStateAction<LabelValuesType>>;
  getLabels: (search?: string) => Promise<void>;
  setInitialBoardData: React.Dispatch<React.SetStateAction<Cards>>;
  card_id: number;
  isCoursePipeline?: boolean;
  isMove?: React.MutableRefObject<boolean>;
  cardMember?: CardMembers[];
  isLoading?: boolean;
};
export type IToggleDropDown = {
  isDropdownOpen: boolean;
  toggleDropdown: () => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
  toggleDropdownForList: ({
    idToggle,
    isOpen,
  }: {
    idToggle: number;
    isOpen: boolean;
  }) => void;
  isDropdownList: {
    isOpen: boolean;
    id: number | null;
  };
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  closeDropDown: () => void;
};
export type ICompanyModalProps = {
  projectId?: number;
  card_id: number;
  cardMember: CardMembers[] | undefined;
  modalRef: IToggleDropDown;
  selectedCompany: Cards['card_Company'];
  setInitialBoardData: React.Dispatch<React.SetStateAction<Cards>>;
};

export type ICompanyList = {
  is_default: boolean;
  label: string;
  value: number;
};

export type MemberModalProps = {
  modalRef: IToggleDropDown;
  memberList: MemberValueType[];
  selectedMember: Cards['card_members'];
  card_id: number;
  getMember: (search?: string) => Promise<void>;
  setInitialBoardData: React.Dispatch<React.SetStateAction<Cards>>;
  isCoursePipeline?: boolean;
};

export type IHandleMemberCheckBox = {
  checkData: React.ChangeEvent<HTMLInputElement>;
  values: {
    isChecked: string[];
  };
  setFieldValue: (
    field: string,
    value: string[],
    shouldValidate?: boolean | undefined
  ) => Promise<void | FormikErrors<{
    isChecked: string[];
  }>>;
};

export type HandleCheckBoxQuotes = {
  checkData: React.ChangeEvent<HTMLInputElement>;
  values: {
    quoteCode: string[] | undefined;
  };
  setFieldValue: (
    field: string,
    value: string[],
    shouldValidate?: boolean | undefined
  ) => Promise<void | FormikErrors<{
    quoteCode: string[] | undefined;
  }>>;
};

export type IHandleLabelCheckBox = {
  checkData: React.ChangeEvent<HTMLInputElement>;
  values: {
    labelName: string;
    color: string;
    isChecked: string[];
  };
  setFieldValue: (
    field: string,
    value: string[],
    shouldValidate?: boolean | undefined
  ) => Promise<void | FormikErrors<{
    labelName: string;
    color: string;
    isChecked: string[];
  }>>;
};

export type StageModalProps = {
  card_id: number;
  stage_id: number;
  modal: IToggleDropDown;
  CardModal: UserModalType;
  initialBoard: BoardData;
  quotesLength?: number;
  getProjectStages: () => void;
  isMove: React.MutableRefObject<boolean>;
  cardMember: Cards['card_members'];
  setInitialBoard?: (value: React.SetStateAction<BoardData>) => void;
};

export type ManagerModalProps = {
  card_id: number;
  companyId?: number;
  CardModal: UserModalType;
  selectedManager?: Cards['manager'];
  cardMember: Cards['card_members'];
};

export type AttachmentModalProps = {
  modalRef: IToggleDropDown;
  setInitialBoardCard?: React.Dispatch<React.SetStateAction<Cards>>;
  initialBoardData: Cards;
  isCoursePipeline?: boolean;
  setInitialBoard?: React.Dispatch<React.SetStateAction<BoardData>>;
  isMove?: React.MutableRefObject<boolean>;
};

export type AttachQuoteProps = {
  modal: IToggleDropDown;
  CardModal: UserModalType;
  card_id: number;
  company_id?: number;
  quotes?: IQuote[];
  getProjectStages: () => void;
  isMove: React.MutableRefObject<boolean>;
};

export type AttachQuoteDisplayProp = {
  projectQuote?: IQuote[];
  isViewable?: boolean;
  attachQuoteModal: IUseToggleDropdown;
};

export type AttachEmailProps = {
  modal: IToggleDropDown;
  CardModal: UserModalType;
  card_id: number;
  getProjectStages: () => void;
};

export type CompanyQuote = {
  id: number;
  name: string;
  logo: string;
  Quotes: IQuote[];
};

export type IQuote = {
  id: number;
  company_id: number;
  quote_id?: number;
  status: string;
  quote_number: string;
  project_id: number;
  email?: string;
  quote?: ProjectQuote;
  created_by?: number;
  slug?: string;
};

export type CheckboxLabelFormValue = {
  labelName: string;
  color: string;
  isChecked: string[];
};

export type CheckboxMemberFormValue = {
  isChecked: string[];
};

export type CheckboxFormEditType = {
  value: boolean;
  index: number;
  newLabel?: boolean;
  label_id?: number;
};

export type AttachmentActivityDisplayProps = {
  initialBoardData: Cards;
  setInitialBoardData?: React.Dispatch<React.SetStateAction<Cards>>;
  allowCreateActivity?: boolean;
  showLabel?: boolean;
  initialBoard?: BoardData;
  setInitialBoard?: React.Dispatch<React.SetStateAction<BoardData>>;
  isMove?: React.MutableRefObject<boolean>;
  className?: string;
  parentClass?: string;
  commentSlice?: number;
  isViewable?: boolean;
  cardMembers?: CardMembers[];
  isCoursePipeline?: boolean;
};

export type getCardDetailArgs = {
  card_id: number;
  modal?: UserModalType;
  setInitialBoardCard?: React.Dispatch<React.SetStateAction<Cards>>;
  isModal?: boolean;
  keyToInsert?: string;
  url: string;
};

export type SearchInModalType = {
  search?: string;
};

export type DragHandleType = [
  subject: unknown,
  card: Cards,
  source:
    | {
        fromPosition: number;
        fromColumnId?: string | number;
      }
    | undefined,
  destination:
    | {
        toPosition?: number;
        toColumnId?: string | number;
      }
    | undefined
];

export type UpdateCardType = {
  card_id: number;
  stageId?: number;
  orderId?: number;
  reason?: string;
  reason_date?: string;
};

export type updateMoveCard = {
  source: DragHandleType[2];
  destination: DragHandleType[3];
  cardId?: number;
  isCardOrder?: boolean;
  boardData?: BoardData;
};

export type CustomCardType = {
  initialBoard: BoardData;
  CardModal: UserModalType;
  getProjectStages: () => void;
  getProjectCards?: () => void;
  isCoursePipeline?: boolean;
  setInitialBoard?: React.Dispatch<React.SetStateAction<BoardData>>;
  isMove: React.MutableRefObject<boolean>;
  isViewable?: boolean;
};

export type FindStageArgs = {
  destinationStageId: number;
  sourceStageId: number;
  initialBoard: BoardData;
};

export type FilterCoursePropType = {
  setSelectedValue: React.Dispatch<React.SetStateAction<IMemberType>>;
  selectedValue: {
    selectedMember?: (string | number)[];
    selectedLabels?: (string | number)[];
  };
  setCardAssign: React.Dispatch<React.SetStateAction<string>>;
  setCardType: React.Dispatch<React.SetStateAction<ICardType>>;
  cardType: ICardType;
  cardAssign: string;
  getProjectCards: ({
    courseType,
    dateFilter,
    labelsFilter,
    membersFilter,
    stageId,
  }: IGetProjectCardArgs) => Promise<void>;
  setFilterModal: React.Dispatch<React.SetStateAction<boolean>>;
  setDateFilter: React.Dispatch<React.SetStateAction<IDateType>>;
  dateFilter: IDateType;
};

export type FilterProjectPropType = {
  setFilterApply?: React.Dispatch<React.SetStateAction<IFilterApply>>;
  setSelectedValue: React.Dispatch<
    React.SetStateAction<{
      selectedMember?: (string | number)[];
      selectedLabels?: (string | number)[];
    }>
  >;
  selectedValue: {
    selectedMember?: (string | number)[];
    selectedLabels?: (string | number)[];
  };
  setCardAssign: React.Dispatch<React.SetStateAction<string | undefined>>;
  cardAssign: string | undefined;
  setCardPriority: React.Dispatch<
    React.SetStateAction<{
      high: string;
      low: string;
      medium: string;
    }>
  >;
  priority: {
    high: string;
    low: string;
    medium: string;
  };
  getProjectCards: (
    cardPriority?: string[],
    dateFilter?: {
      start_date: string;
      end_date: string;
    },
    filterCardAssign?: string,
    membersFilter?: []
  ) => Promise<void>;
  setFilterModal: React.Dispatch<React.SetStateAction<boolean>>;
  setDateFilter: React.Dispatch<
    React.SetStateAction<{
      start_date: string;
      end_date: string;
    }>
  >;
  dateFilter: {
    start_date: string;
    end_date: string;
  };
};
