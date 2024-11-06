// ** Components **
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import NoDataFound from 'components/NoDataFound';
import Pagination from 'components/Pagination/Pagination';

// ** Hooks **
import { useAxiosDelete } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// ** Redux **
import { useSelector } from 'react-redux';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';

// ** Types **
import { CourseCategory } from 'modules/Courses/types';
import { ModalProps } from 'types/common';

// ** Utilities **
import { customRandomNumberGenerator, useDebounce } from 'utils';

const CategoryCard = React.lazy(
  () => import('modules/Courses/components/Category/CategoryCard')
);
const AddEditCategory = React.lazy(
  () => import('modules/Courses/pages/Category/AddEditCategory')
);

interface CourseCategoryProps {
  modal: ModalProps;
  search: string;
}
const CourseCategories = ({ modal, search }: CourseCategoryProps) => {
  const { t } = useTranslation();

  // ** Redux
  const { currentPage } = useSelector(currentPageSelector);

  // ** States
  const [selectedData, setSelectedData] = useState<CourseCategory | null>(null);
  const [limit, setLimit] = useState<number>(10);

  // ** Modals
  const deleteModal = useModal();

  const debouncedSearch = useDebounce(search, 500);

  // ** APIs
  const [categoryDeleteApi, { isLoading: deletingCategory }] = useAxiosDelete();
  const {
    response,
    isLoading,
    refetch: refetchCategories,
  } = useQueryGetFunction('/course-category', {
    search: debouncedSearch,
    limit,
    page: currentPage,
  });

  // ** CONSTs
  const loaderArray = [...Array(12).keys()];

  const handleDelete = async () => {
    if (selectedData) {
      const { error } = await categoryDeleteApi(
        `/course-category/${selectedData?.slug}`
      );

      if (!error) {
        setSelectedData(null);
        refetchCategories();
      }
      deleteModal.closeModal();
    }
  };
  return (
    <>
      <div className="tab-content mt-9">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 3xl:grid-cols-5 gap-7">
          {isLoading ? (
            <>
              {loaderArray.map((item) => (
                <div key={item} className="lazy w-[350px] h-[300px]" />
              ))}
            </>
          ) : (
            ''
          )}
          {!isLoading && response?.data?.data && response?.data?.data.length > 0
            ? response?.data?.data.map((item: CourseCategory) => {
              return (
                <CategoryCard
                  key={customRandomNumberGenerator()}
                  setSelectedData={setSelectedData}
                  data={item}
                  addModal={modal}
                  deleteModal={deleteModal}
                  isView
                />
              );
            })
            : ''}
        </div>
      </div>

      {!isLoading && (response?.data?.data ?? []).length === 0 ? (
        <NoDataFound message={t('Table.noDataFound')} />
      ) : (
        ''
      )}
      {limit && !isLoading && response?.data?.lastPage ? (
        <Pagination
          setLimit={setLimit}
          currentPage={currentPage ?? 1}
          dataPerPage={limit}
          dataCount={response?.data?.count}
          totalPages={response?.data?.lastPage}
        />
      ) : (
        ''
      )}
      {modal?.isOpen && (
        <AddEditCategory
          modal={modal}
          data={selectedData}
          setData={setSelectedData}
          refetch={refetchCategories}
          isView
        />
      )}
      {deleteModal?.isOpen && (
        <ConfirmationPopup
          modal={deleteModal}
          deleteTitle={t('Button.deleteTitle')}
          bodyText={t(
            'CoursesManagement.CourseCategory.AddEditCategory.deleteText',
            {
              CATEGORY: selectedData?.name,
            }
          )}
          confirmButtonText={t('Button.deleteButton')}
          confirmButtonVariant="primary"
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={() => {
            setSelectedData(null);
            deleteModal.closeModal();
          }}
          confirmButtonFunction={handleDelete}
          isLoading={deletingCategory}
        />
      )}
    </>
  );
};

export default CourseCategories;
