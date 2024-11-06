import { ReactElement } from 'react';

// TODO add missing types value
export type ITableHeaderProps = {
  header?: string;
  image?: string;
  name?: string;
  className?: string;
  cell?: (props: CellProps) => string | ReactElement;
  option?: {
    sort?: boolean;
    hasFilter?: boolean;
    hasImage?: boolean;
    isIndex?: boolean;
  };
  imagePath?: string;
  filterComponent?: ReactElement;
  subString?: boolean;
  date?: Date | string;
};

export type CellProps = { [key: string]: string };

export type ITableProps<DataType> = {
  // TODO create Interface for bodyData
  bodyData?: DataType[];
  headerData?: ITableHeaderProps[];
  loader?: boolean;
  dataPerPage?: number;
  totalPage?: number;
  dataCount?: number;
  pagination?: boolean;
  setLimit?: (number: number) => void;
  setSort?: (string: string) => void;
  sort?: string;
  columnWidth?: string;
  width?: string;
  tableHeightClassName?: string;
  parentClassName?: string;
  tableRoundedRadius?: string;
  rowClass?: string;
  tableHeaderClass?: string;
  renderRowClass?: (props: CellProps) => boolean;
  headerTitle?: string;
  showQuoteSum?: boolean;
  quoteTotalSum?: string;
  PageHeaderClass?: string;
  stickyActionColumn?: boolean;
};

export interface ColumnCell {
  cell: (props: { [key: string]: string }) => string;
  subString?: boolean;
}
