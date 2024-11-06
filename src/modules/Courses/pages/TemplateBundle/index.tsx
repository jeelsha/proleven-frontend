import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Image from 'components/Image';
import NoDataFound from 'components/NoDataFound';
import PageHeader from 'components/PageHeader/PageHeader';
import Pagination from 'components/Pagination/Pagination';
import SearchComponent from 'components/Table/search';
import { FeaturesEnum, PermissionEnum } from 'constants/common.constant';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useRolePermission } from 'hooks/useRolePermission';
import { useTitle } from 'hooks/useTitle';
import { Bundle } from 'modules/Courses/types/TemplateBundle';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { useDebounce } from 'utils';

const AddEditTemplateBundle = React.lazy(
  () => import('modules/Courses/components/TemplateBundle/AddEditTemplateBundle')
);
const BundleCard = React.lazy(
  () => import('modules/Courses/components/TemplateBundle/BundleCard')
);
const TemplateBundle = () => {
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('SideNavigation.templateBundle'))

  const bundleModal = useModal();
  const { currentPage } = useSelector(currentPageSelector);

  const [search, setSearch] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);
  const [isEditing, setIsEditing] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 500);
  const deleteAccess = useRolePermission(
    FeaturesEnum.CourseInvitations,
    PermissionEnum.Delete
  );
  const editAccess = useRolePermission(
    FeaturesEnum.CourseInvitations,
    PermissionEnum.Update
  );
  const { response, refetch, isLoading } = useQueryGetFunction('/bundle', {
    page: currentPage,
    search: debouncedSearch,
    limit,
  });

  return (
    <>
      {bundleModal?.isOpen && (
        <AddEditTemplateBundle modal={bundleModal} refetch={refetch} />
      )}

      <PageHeader
        text={t('CoursesManagement.Bundle.TemplateBundle')}
        small
        addSpace
        isScroll
      >
        <div className="flex justify-end gap-2 flex-wrap">
          <div>
            <SearchComponent
              onSearch={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearch(e?.target?.value);
              }}
              value={search}
              placeholder={t('Table.tableSearchPlaceholder')}
              onClear={() => {
                setSearch('');
              }}
            />
          </div>

          <Button
            variants="primary"
            onClickHandler={() => {
              bundleModal.openModal();
            }}
          >
            <span className="w-5 h-5 inline-block me-2">
              <Image iconName="plusIcon" iconClassName="w-full h-full" />
            </span>
            {t('CoursesManagement.Bundle.createBundle')}
          </Button>
        </div>
      </PageHeader>
      <CustomCard minimal>
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 1200:grid-cols-3 1400:grid-cols-4 gap-5 3xl:col-span-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border border-solid border-borderColor rounded-lg p-4"
                >
                  <div className="lazy flex items-center pb-8 pt-4">
                    <div className="max-w-[calc(100%_-_40px)] ps-2">
                      <div className="text-xl font-semibold text-dark truncate" />
                    </div>
                  </div>

                  <div className="grid grid-cols-[repeat(auto-fill,_minmax(56px,_56px))] gap-3 mt-4">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="lazy bg-black/10 rounded-lg overflow-hidden aspect-square"
                      />
                    ))}
                  </div>
                  <div className="mt-12 flex items-center gap-2">
                    {[1, 2, 3].map((item) => (
                      <Button
                        key={item}
                        className="lazy bg-black/10 rounded-lg overflow-hidden w-10 h-10"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            ''
          )}
          {!isLoading && (response?.data?.data ?? []).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 1200:grid-cols-3 1400:grid-cols-4 gap-5 3xl:col-span-5">
              {(response?.data?.data ?? []).map((item: Bundle) => (
                <BundleCard
                  deleteAccess={deleteAccess}
                  editAccess={editAccess}
                  key={item.id}
                  bundle={item}
                  refetch={refetch}
                  isEditing={isEditing === item.id}
                  setIsEditing={setIsEditing}
                />
              ))}
            </div>
          ) : (
            ''
          )}
          {!isLoading && (response?.data?.data ?? []).length === 0 ? (
            <NoDataFound message={t('Table.noDataFound')} />
          ) : (
            ''
          )}
          {limit && response?.data?.lastPage ? (
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
        </>
      </CustomCard>
    </>
  );
};

export default TemplateBundle;
