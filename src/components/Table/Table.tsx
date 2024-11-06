import Button from 'components/Button/Button';
import Image from 'components/Image';
import NoDataFound from 'components/NoDataFound';
import PageHeader from 'components/PageHeader/PageHeader';
import Pagination from 'components/Pagination/Pagination';
import { ITableHeaderProps, ITableProps } from 'components/Table/types';
import { t } from 'i18next';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { customRandomNumberGenerator, formatCurrency } from 'utils';
import './style/table.css';

function Table<DataType>({
  bodyData = [],
  headerData = [],
  loader,
  dataPerPage = 10,
  totalPage,
  dataCount,
  pagination,
  setLimit,
  setSort,
  columnWidth,
  sort,
  width,
  tableHeightClassName,
  parentClassName,
  tableRoundedRadius,
  rowClass,
  tableHeaderClass,
  renderRowClass,
  headerTitle,
  quoteTotalSum,
  showQuoteSum = false,
  PageHeaderClass,
  stickyActionColumn = false,
}: Readonly<ITableProps<DataType>>) {
  const [isSortAsc, setIsSortAsc] = useState<boolean>();
  const { currentPage } = useSelector(currentPageSelector);

  const tablLazyCount = [...Array(dataPerPage > 0 ? dataPerPage : 10).keys()];
  //
  const renderTableHeader = (val: ITableHeaderProps, index: number) => {
    if (Object.keys(val).length) {
      const RenderComponent = val.filterComponent;
      return (
        <th
          key={`${val.header}_${index + 1}`}
          scope="col"
          className={`group/tbl first:w-[100px] [&:nth-child(2)]:w-[200px] [&:nth-child(3)]:w-[200px] ${columnWidth} ${val.className}`}
        >
          {val?.option?.hasFilter ? RenderComponent : renderDefaultHeader(val)}
        </th>
      );
    }
  };

  const renderDefaultHeader = (val: ITableHeaderProps) => (
    <span className="flex items-center select-none group-first/tbl:justify-center group-last/tbl:justify-end whitespace-nowrap">
      {val?.header}
      {val?.option?.sort ? (
        <Button
          className="w-4 h-4 ms-1 opacity-0 group-hover/tbl:opacity-100"
          onClickHandler={() => handleSorting(val ?? '')}
        >
          {val?.option?.sort && renderSortIcon()}
        </Button>
      ) : (
        ''
      )}
    </span>
  );

  const handleSorting = (val: ITableHeaderProps) => {
    const splitName = val.name?.split('.');
    const sortFieldName = splitName ? splitName[splitName.length - 1] : val.name;

    if (sortFieldName) {
      if (sort?.includes(`-${sortFieldName}`)) {
        setSort?.(sortFieldName);
        setIsSortAsc(true);
      } else {
        setSort?.(`-${sortFieldName}`);
        setIsSortAsc(false);
      }
    }
  };

  const renderSortIcon = () => (
    <Image
      iconClassName={`w-4 h-4 ${isSortAsc ? 'rotate-90' : '-rotate-90'}`}
      iconName="arrowRightIcon"
    />
  );

  const renderColumnCell = (
    row: { [key: string]: string },
    columnCell: ITableHeaderProps
  ) => {
    if (columnCell?.cell && !columnCell.subString) {
      if (typeof columnCell.cell(row) === 'string') {
        const str = columnCell.cell(row) as string;
        if (str.length > 25) return `${str.substring(0, 25)}...`;
      }
    }
    return columnCell.cell?.(row);
  };

  const renderRowCell = (
    row: { [key: string]: string },
    columnCell: ITableHeaderProps,
    index: number
  ) => {
    if (columnCell?.option && columnCell?.option?.isIndex) {
      return startRecord + index;
    }
    if (columnCell?.name) {
      if (row[columnCell.name]) {
        if (row[columnCell.name].length > 100) {
          return `${row[columnCell.name].substring(0, 25)}...`;
        }
        return row[columnCell.name];
      }
      if (columnCell.name.toString().includes('.')) {
        const allKeys = columnCell.name.split('.');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let newData: any = null;
        allKeys.forEach((element: string) => {
          newData = !newData ? row[element] : newData[element];
        });
        if (newData?.length > 100) return `${newData?.substring(0, 25)}...`;
        return newData ?? '-';
      }
    }
    return '-';
  };

  const renderInnerHtml = (
    columnCell: ITableHeaderProps,
    row: { [key: string]: string },
    index: number
  ) => {
    return `${renderRowCell(row, columnCell, index)}`;
  };
  /* Calculate the starting and ending records for the current page, considering the number of records per page. */
  const startRecord = (Number(currentPage || 1) - 1) * Number(dataPerPage) + 1;
  const endRecord =
    Number(currentPage || 1) * Number(dataPerPage) <= Number(dataCount)
      ? Number(currentPage || 1) * Number(dataPerPage)
      : dataCount;

  /* Check if there is data available for the current page. */
  const isDataAvailable = endRecord && startRecord <= endRecord;
  return (
    <div className={parentClassName ?? `main-table bg-white rounded-xl p-4 `}>
      <div
        className={`table-wrapper relative bg-[#FBFBFC] rounded-xl p-4 border border-borderColor/50 ${
          tableRoundedRadius ?? ''
        }`}
      >
        {headerTitle ? (
          <PageHeader
            parentClass={PageHeaderClass}
            text={headerTitle}
            small
            titleClass="!text-xl"
          />
        ) : (
          ''
        )}
        {/*  overflow-auto h-[calc(100dvh_-_386px)] */}
        <div className={`overflow-auto max-w-full ${tableHeightClassName ?? ''}`}>
          <table
            className={`datatable-main w-full min-w-[400px] text-sm text-left rtl:text-right text-dark border border-borderColor/0 ${
              width ?? ''
            } ${stickyActionColumn ? ' sticky-action-column' : ''}`}
          >
            {/* sticky top-0 z-1 */}
            <thead className={tableHeaderClass ?? ''}>
              <tr>
                {headerData.map((val: ITableHeaderProps, index) =>
                  renderTableHeader(val, index)
                )}
              </tr>
            </thead>

            <tbody>
              {loader && (
                <>
                  {tablLazyCount.map((_, i) => {
                    return (
                      <tr key={`Key_${i + 1}`}>
                        {headerData.map((_, j) => {
                          return (
                            //  colSpan={headerData?.length}
                            <td key={`Key_${j + 1}`}>
                              <div className="relative w-full flex items-center">
                                <div className="lazy w-full h-10 rounded-lg" />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </>
              )}
              {!loader && bodyData.length === 0 && (
                <tr>
                  <td className="" colSpan={headerData?.length}>
                    <NoDataFound message={t('Table.noDataFound')} />
                  </td>
                </tr>
              )}
              {!loader && bodyData && bodyData.length > 0 && (
                <>
                  {bodyData.map((row: any, index) => {
                    return (
                      <tr key={`tr_${row?.id ?? customRandomNumberGenerator()}`}>
                        {headerData?.map((columnCell) => {
                          if (Object.keys(columnCell).length) {
                            return (
                              <td
                                className={`group/tbl  ${
                                  renderRowClass?.(row) && rowClass ? rowClass : ''
                                }`}
                                key={`td_${
                                  columnCell?.header ??
                                  customRandomNumberGenerator(100000)
                                }`}
                              >
                                <div className="flex items-center gap-1 group-first/tbl:min-h-10 group-first/tbl:justify-center group-last/tbl:justify-end">
                                  {columnCell?.cell ? (
                                    renderColumnCell(row, columnCell)
                                  ) : (
                                    <span
                                      className="w-full group-first/tbl:text-center group-last/tbl:text-center block text-sm leading-4 text-dark"
                                      // eslint-disable-next-line react/no-danger
                                      dangerouslySetInnerHTML={{
                                        __html: renderInnerHtml(
                                          columnCell,
                                          row,
                                          index
                                        ),
                                      }}
                                    />
                                  )}
                                </div>
                              </td>
                            );
                          }
                          return (
                            <td
                              key={`td_${
                                columnCell?.header ??
                                customRandomNumberGenerator(100000)
                              }`}
                            />
                          );
                        })}
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showQuoteSum && Number(quoteTotalSum) !== 0 && bodyData.length > 0 && (
        <div className="text-right mt-4">
          <div className="flex items-center w-fit ml-auto relative py-1.5 pr-4 pl-10 bg-primary/10 rounded-md gap-2 cursor-pointer hover:underline overflow-hidden whitespace-nowrap text-sm text-primary text-left">
            <Image
              iconName="totalSumIcon"
              iconClassName="w-4 h-4 left-2 absolute top-2.5"
            />
            <p className="text-sm text-normal text-dark">
              {`${t('Table.showingQuoteSumText')}`}
              <span className="inline-block text-base font-semibold ml-2">
                {formatCurrency(Number(quoteTotalSum), 'EUR')}
              </span>
            </p>
          </div>
        </div>
      )}
      {dataPerPage ? (
        <div className="table-footer flex justify-between items-center mt-5 flex-col 1024:flex-row gap-3 1024:gap-0">
          <div className="">
            <p className="text-sm text-grayText font-medium">
              {isDataAvailable
                ? `${t('Table.showing')} ${startRecord} ${t(
                    'Table.to'
                  )} ${endRecord} ${t('Table.of')} ${dataCount} ${t(
                    'Table.records'
                  )}`
                : ``}
            </p>
          </div>
          {pagination && totalPage ? (
            <Pagination
              setLimit={setLimit}
              currentPage={currentPage ?? 1}
              dataPerPage={dataPerPage}
              dataCount={dataCount}
              totalPages={totalPage}
            />
          ) : (
            <></>
          )}
        </div>
      ) : (
        ''
      )}
    </div>
  );
}

export default Table;
