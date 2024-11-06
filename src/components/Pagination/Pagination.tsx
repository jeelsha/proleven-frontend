import Button from 'components/Button/Button';
import ReactSelect from 'components/FormElement/ReactSelect';
import { Option } from 'components/FormElement/types';
import Image from 'components/Image';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { currentPageCount } from 'redux-toolkit/slices/paginationSlice';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  dataPerPage: number;
  dataCount?: number;
  parentClass?: string;
  setLimit?: (number: number) => void;
  disableMassPaginate?: boolean;
  isShow?: boolean;
}
const Pagination = ({
  parentClass,
  currentPage,
  totalPages,
  dataPerPage = 10,
  dataCount = 0,
  setLimit,
  disableMassPaginate = false,
  isShow = true,
}: PaginationProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [pageNumber, setPageNumber] = useState<number[]>([]);
  const [limitData, setLimitData] = useState<number>();
  const [goToCount, setGoToCount] = useState<string | number>(currentPage);
  const goToDivWidth =
    (goToCount as string).length > 1
      ? `${8 * (goToCount as string).length + 55}`
      : 80;
  const inputRef = useRef<HTMLInputElement>(null);

  function generatePaginationNumbers(
    tPage: number, // Total Page
    cPage: number, // Current Page
    _dPages: number // Limit ( Per Page Data)
  ) {
    const paginationNumbers = [];
    let startPage = Math.max(1, cPage - 1);
    const endPage = Math.min(tPage, startPage + 1 * 2);

    if (cPage > endPage) {
      dispatch(currentPageCount({ currentPage: endPage }));
    }
    while (startPage <= endPage) {
      paginationNumbers.push(startPage);
      startPage++;
    }

    return paginationNumbers;
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        goToPage();
      }
    };

    const inputElem = inputRef.current;
    if (inputElem) {
      inputElem.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (inputElem) {
        inputElem.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [goToCount]);

  useEffect(() => {
    setPageNumber(generatePaginationNumbers(totalPages, currentPage, dataPerPage));
    if (currentPage !== goToCount) setGoToCount(currentPage);
  }, [currentPage, totalPages]);

  const handlePageChange = (value: number, action?: string) => {
    if (action === 'increment') {
      dispatch(currentPageCount({ currentPage: value + 1 }));
    } else if (action === 'decrement') {
      dispatch(currentPageCount({ currentPage: value - 1 }));
    } else {
      setGoToCount(value);
      dispatch(currentPageCount({ currentPage: value }));
    }
  };

  const getPaginationRange = () => {
    const CurrentLength: Option[] = [];
    const allRange = [10, 20, 50, 100];

    if (dataCount && dataCount >= 1) {
      CurrentLength.push({
        label: String(10),
        value: 10,
      });
      allRange.forEach((_, index) => {
        if (allRange[index + 1] && allRange[index + 1] < dataCount) {
          CurrentLength.push({
            label: String(allRange[index + 1]),
            value: allRange[index + 1],
          });
        }
      });
      CurrentLength.push({
        label: 'All',
        value: dataCount,
      });
      return CurrentLength;
    }
    return [];
  };
  const goToOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoToCount(e.target.value);
  };
  const goToPage = () => {
    const regex = /^\d+$/;
    if (!regex.test(goToCount.toString()) || Number(goToCount) === 0) {
      dispatch(currentPageCount({ currentPage: 1 }));
      setGoToCount(1);
    } else {
      dispatch(currentPageCount({ currentPage: Number(goToCount) }));
    }
  };

  return (
    <div className={`${parentClass ?? ''}`}>
      <div className="flex gap-30px justify-end items-start">
        {totalPages > 1 && (
          <ul className="flex gap-2 items-start">
            {!disableMassPaginate && (
              <li className="h-fit">
                <Button
                  className={`p-0  1200:w-9 1200:h-9 w-8 h-8  inline-flex items-center cursor-pointer justify-center bg-gray-200 rounded-lg text-primary text-xs ${
                    currentPage !== 1
                      ? 'text-primary hover:bg-primary hover:text-white'
                      : 'cursor-not-allowed opacity-70'
                  }`}
                  onClickHandler={() =>
                    currentPage > 1 && handlePageChange(1, 'start')
                  }
                >
                  <span className="w-full h-full p-2.5 inline-block">
                    <Image
                      iconClassName="w-full h-full"
                      iconName="leftDoubleArrows"
                    />
                  </span>
                </Button>
              </li>
            )}
            <li className="h-fit">
              <Button
                className={`p-0  1200:w-9 1200:h-9 w-8 h-8 inline-flex items-center cursor-pointer justify-center bg-gray-200 rounded-lg text-primary text-xs ${
                  currentPage > 1
                    ? 'text-primary hover:bg-primary hover:text-white'
                    : 'cursor-not-allowed opacity-70'
                } `}
                onClickHandler={() =>
                  currentPage > 1 && handlePageChange(currentPage, 'decrement')
                }
              >
                <span className="w-full h-full p-2.5 inline-block">
                  <Image iconClassName="w-full h-full" iconName="chevronLeft" />
                </span>
              </Button>
            </li>
            {pageNumber?.map((num: number) => {
              return (
                <li key={num} className="h-fit">
                  <Button
                    onClickHandler={() => handlePageChange(num)}
                    className={`p-0  1200:w-9 1200:h-9 w-8 h-8 inline-flex items-center cursor-pointer justify-center bg-gray-200 rounded-lg text-primary text-xs font-medium ${
                      num === currentPage
                        ? 'text-white bg-primary'
                        : 'text-primary hover:bg-primary hover:text-white'
                    } `}
                  >
                    {num}
                  </Button>
                </li>
              );
            })}
            <li className="h-fit">
              <Button
                className={`p-0  1200:w-9 1200:h-9 w-8 h-8 inline-flex items-center cursor-pointer justify-center bg-gray-200 rounded-lg text-primary text-xs ${
                  currentPage < totalPages
                    ? 'text-primary hover:bg-primary hover:text-white'
                    : 'cursor-not-allowed opacity-70'
                } `}
                onClickHandler={() =>
                  currentPage < totalPages &&
                  handlePageChange(currentPage, 'increment')
                }
              >
                <span className="w-full h-full p-2.5 inline-block">
                  <Image iconClassName="w-full h-full" iconName="chevronRight" />
                </span>
              </Button>
            </li>
            {!disableMassPaginate && (
              <li className="h-fit">
                <Button
                  className={`p-0  1200:w-9 1200:h-9 w-8 h-8 inline-flex items-center cursor-pointer justify-center bg-gray-200 rounded-lg text-primary text-xs ${
                    currentPage !== totalPages
                      ? 'text-primary hover:bg-primary hover:text-white'
                      : 'cursor-not-allowed opacity-70'
                  }`}
                  onClickHandler={() =>
                    currentPage < totalPages && handlePageChange(totalPages, 'end')
                  }
                >
                  <span className="w-full h-full p-2.5 inline-block">
                    <Image
                      iconClassName="w-full h-full"
                      iconName="rightDoubleArrows"
                    />
                  </span>
                </Button>
              </li>
            )}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="flex items-center">
            <div
              className={`w-[${goToDivWidth}px] bg-gray-200 pl-2 1200:py-1.5 py-1 rounded-l-lg pr-10 relative`}
              style={{ width: `${goToDivWidth}px` }}
            >
              <input
                ref={inputRef}
                type="text"
                className="bg-transparent w-full text-sm font-medium"
                name="goTo"
                value={goToCount}
                placeholder="Type"
                onChange={(e) => goToOnChange(e)}
              />
              <span className="inline-block text-sm font-medium absolute right-2 top-1/2 -translate-y-1/2 opacity-50">{`/${totalPages}`}</span>
            </div>
            <Button
              className="px-2 1200:py-1.5 py-1 bg-primary text-white rounded-r-lg font-medium flex items-center justify-center"
              onClickHandler={() => {
                const regex = /^\d+$/;
                if (!regex.test(goToCount.toString()) || Number(goToCount) === 0) {
                  dispatch(currentPageCount({ currentPage: 1 }));
                  setGoToCount(1);
                } else {
                  dispatch(currentPageCount({ currentPage: Number(goToCount) }));
                }
              }}
            >
              {t('Table.goToPageGo')}
            </Button>
          </div>
        )}

        {dataCount > 0 && limitData && dataCount > 10 && isShow && (
          <div className="flex items-center gap-10px">
            <span className="text-sm/4 text-black/50 font-semibold">
              {t('Table.recordShow')}
            </span>
            <ReactSelect
              isSearchable={false}
              isMulti={false}
              options={getPaginationRange()}
              isCompulsory
              className="text-sm font-medium rounded-md"
              onChange={(value) => {
                setLimit?.(Number((value as Option).value));
                setLimitData?.(Number((value as Option).value));
                dispatch(currentPageCount({ currentPage: 1 }));
              }}
              selectedValue={dataPerPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;
