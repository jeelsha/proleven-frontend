// ** Components **
import Image from 'components/Image';
import Table from 'components/Table/Table';

// ** Types **
import { CellProps, ITableHeaderProps } from 'components/Table/types';

// ** Hooks **
import { useQueryGetFunction } from 'hooks/useQuery';
import { useState } from 'react';
import { useSelector } from 'react-redux';

// ** Redux **
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';

// ** Utilities **
import { useDebounce } from 'utils';

// ** Types **
import { Course, CourseCategory } from 'modules/Courses/types';

type SubCategoryListProps = {
  id: number;
  image: string | null;
  name: string;
  courses: Course[];
  category: CourseCategory;
};

const renderCourseImages = (props: CellProps) => {
  const subCategory = props as unknown as SubCategoryListProps;
  const maxImagesToShow = 6;
  const visibleCourses = subCategory.courses.slice(0, maxImagesToShow);
  const remainingCount = Math.max(0, subCategory.courses.length - maxImagesToShow);

  return (
    <>
      {visibleCourses.map((item) => (
        <div
          key={item.id}
          className="w-16 h-10 border border-solid border-borderColor rounded-md overflow-hidden"
        >
          <Image
            width={64}
            height={40}
            src={item.image ?? '/images/no-image.png'}
            alt=""
            imgClassName="w-full h-full object-cover"
            serverPath
          />
        </div>
      ))}

      {remainingCount > 0 && <>+{remainingCount}</>}
    </>
  );
};

const CourseSubCategories = ({ search }: { search: string }) => {
  // ** Redux
  const { currentPage } = useSelector(currentPageSelector);

  // ** States
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');

  const debouncedSearch = useDebounce(search, 500);

  // ** APIs
  const { response, isLoading } = useQueryGetFunction('/course-sub-category', {
    page: currentPage,
    limit,
    sort,
    search: debouncedSearch,
    option: { course: true },
  });

  // ** CONSTs
  const columnData: ITableHeaderProps[] = [
    {
      header: 'No.',
      name: 'no',
      className: '',
      option: {
        sort: false,
        hasFilter: false,
        isIndex: true,
      },
    },
    {
      header: 'Sub Category',
      name: 'name',
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      header: 'Category',
      name: 'category.name',
      option: {
        sort: true,
        hasFilter: false,
      },
    },
    {
      header: 'Courses',
      cell: (props) => renderCourseImages(props),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
  ];
  return (
    <Table
      headerData={columnData}
      bodyData={response?.data?.data}
      loader={isLoading}
      pagination
      dataPerPage={limit}
      setLimit={setLimit}
      totalPage={response?.data?.lastPage}
      dataCount={response?.data?.count}
      setSort={setSort}
      sort={sort}
    />
  );
};

export default CourseSubCategories;
