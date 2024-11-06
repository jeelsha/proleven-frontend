// ** Components **
import Button from 'components/Button/Button';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import PageHeader from 'components/PageHeader/PageHeader';
import CategoryCard from 'modules/Courses/components/Category/CategoryCard';
import SubCategoryCard from 'modules/Courses/components/Subcategory/SubCategoryCard';

// ** Pages **
import AddEditCategory from 'modules/Courses/pages/Category/AddEditCategory';
import AddEditSubCategory from 'modules/Courses/pages/SubCategory/AddEditSubCategory';

// ** Constants **
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';

// ** Types **
import { CourseCategory } from 'modules/Courses/types';

// **  Hooks **
import { useAxiosDelete, useAxiosGet } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

// ** slices **
import InfiniteScroll from 'components/InfiniteScroll/infiniteScroll';
import { useTitle } from 'hooks/useTitle';
import { ApiResponse, DataItem } from 'modules/Courses/types/subCategoryType';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';

const ViewCategory = () => {
  const { t } = useTranslation();

  // ** Dynamic Title
  const updateTitle = useTitle();

  // ** Modals
  const modal = useModal();
  const subCategoryModal = useModal();
  const deleteCategoryModal = useModal();
  const deleteSubCategoryModal = useModal();

  const navigate = useNavigate();

  // ** States
  const [selectedData, setSelectedData] = useState<CourseCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<DataItem | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [subCategories, setSubCategories] = useState<ApiResponse>();
  const { language } = useSelector(useLanguage);

  // ** CONSTs
  const location = useLocation();
  const matchResult = /\/category\/([^/]+)/.exec(location.pathname);
  const slug = matchResult ? matchResult[1] : null;
  const user = useSelector(getCurrentUser);

  // ** APIs
  const [categoryDeleteApi] = useAxiosDelete();
  const [getSubCategoryApi, { isLoading: isSubCategoryLoading }] = useAxiosGet();
  const {
    response,
    refetch: refetchCategory,
    isLoading: isCategoryLoading,
  } = useQueryGetFunction(`/course-category`, { option: { getByParentSlug: slug } });

  const resetSubCategories = () => {
    setPage(1);
    setSubCategories(undefined);
  };

  const fetchSubCategories = async (refetch = false) => {
    const { data } = await getSubCategoryApi('/course-sub-category', {
      params: {
        category_id: selectedData?.id,
        page,
        limit: 20,
      },
    });
    if (data) {
      // setSubCategories(data)
      setSubCategories((prevSubCategories) => {
        // If prevSubCategories is undefined or null, initialize it with the new data
        if (!prevSubCategories) {
          return data;
        }
        if (refetch) {
          return data;
        }

        // Combine the old data with the new data
        return {
          ...prevSubCategories,
          data: [...(prevSubCategories?.data ?? []), ...data.data],
          lastPage: data.lastPage,
          count: data.count,
        };
      });
    }
  };
  const handleCategoryDelete = async () => {
    if (selectedData) {
      const { error } = await categoryDeleteApi(
        `/course-category/${selectedData?.slug}`
      );
      if (!error) {
        setSelectedData(null);
        navigate(PRIVATE_NAVIGATION.coursesManagement.view.path);
      }
      deleteCategoryModal.closeModal();
    }
  };
  const handleSubCategoryDelete = async () => {
    if (selectedSubCategory) {
      const { error } = await categoryDeleteApi(
        `/course-sub-category/${String(selectedSubCategory?.slug)}`
      );
      if (!error) {
        fetchSubCategories(true);
        setSelectedSubCategory(null);
      }
      deleteSubCategoryModal.closeModal();
    }
  };

  // ** UseEffects
  useEffect(() => {
    if (Array.isArray(response?.data?.data) && response?.data?.data.length > 0) {
      setSelectedData(response?.data?.data?.[0]);
    }
  }, [response]);
  useEffect(() => {
    if (selectedData) {
      fetchSubCategories(false);
    }
  }, [selectedData, page]);

  const subCategoryCallBack = useCallback(async () => {
    if (subCategories && page < subCategories?.lastPage) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [subCategories?.lastPage]);

  useEffect(() => {
    resetSubCategories();
  }, [language]);
  updateTitle(
    selectedData?.name
      ? selectedData?.name
      : t('CompanyManager.AttendeeList.courseCategoryDetailsTitle')
  );
  return (
    <>
      <PageHeader
        parentClass="mb-12"
        small
        url="/courses"
        text={selectedData?.name}
      />

      <div className="flex flex-wrap gap-7">
        {isCategoryLoading ? (
          <div className="lazy w-[375px]" />
        ) : (
          <div className="w-[375px]">
            {selectedData && (
              <CategoryCard
                setSelectedData={setSelectedData}
                data={selectedData}
                addModal={modal}
                deleteModal={deleteCategoryModal}
                isView={false}
              />
            )}
          </div>
        )}

        <div className="flex-[1_0_0%] ">
          <div className="bg-white p-5 rounded-xl h-[75dvh]">
            {/* {isCategoryLoading || isSubCategoryLoading ? (
              <div className="lazy h-12 mb-3" />
            ) : ( */}
            <div className="flex justify-between items-center py-5">
              <p className="text-base font-semibold leading-5">
                {t('CoursesManagement.CourseCategory.subCategories')}
              </p>
              {user?.role_name === ROLES.Admin && (
                <Button
                  className="gap-1"
                  variants="primaryBordered"
                  onClickHandler={() => {
                    setSelectedSubCategory(null);
                    subCategoryModal.openModal();
                  }}
                >
                  <Image iconClassName="w-4 h-4" iconName="plusIcon" />
                  <span>
                    {t(
                      'CoursesManagement.CourseCategory.AddEditSubCategory.addSubCategory'
                    )}
                  </span>
                </Button>
              )}
            </div>

            <InfiniteScroll
              showLoading={isSubCategoryLoading}
              callBack={subCategoryCallBack}
              hasMoreData={
                subCategories
                  ? subCategories?.data.length < subCategories.count
                  : false
              }
              className=" max-h-[calc(100%_-_100px)]  overflow-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 gap-7">
                {/* {isCategoryLoading || isSubCategoryLoading
                  ? loaderArray.map((item) => (
                      <div key={item} className="lazy w-[250px] h-12" />
                    ))
                  : ''} */}
                {/* !isCategoryLoading &&
                !isSubCategoryLoading && */}
                {subCategories &&
                Array.isArray(subCategories?.data) &&
                subCategories?.data?.length > 0
                  ? (subCategories?.data ?? []).map((item: DataItem) => (
                      <SubCategoryCard
                        key={item.id}
                        data={item}
                        addModal={subCategoryModal}
                        deleteModal={deleteSubCategoryModal}
                        setData={setSelectedSubCategory}
                      />
                    ))
                  : ''}

                {!isCategoryLoading &&
                  !isSubCategoryLoading &&
                  (subCategories?.data ?? []).length === 0 && (
                    <div className="py-4 text-center rounded-10px border mt-4 border-black/[0.08] col-span-1 lg:col-span-2 xl:col-span-3 3xl:col-span-4">
                      <Image
                        src={`https://cdn-icons-png.flaticon.com/512/7486/7486754.png `}
                        imgClassName="w-[100px] m-auto mb-4"
                        alt=""
                      />
                      <span className="text-black">{t('Table.noDataFound')}</span>
                    </div>
                  )}
              </div>
            </InfiniteScroll>
          </div>
        </div>
        {modal?.isOpen && (
          <AddEditCategory
            modal={modal}
            data={selectedData}
            setData={setSelectedData}
            refetch={refetchCategory}
            isView={false}
          />
        )}
        {subCategoryModal.isOpen && (
          <AddEditSubCategory
            modal={subCategoryModal}
            data={selectedSubCategory}
            setData={setSelectedSubCategory}
            slug={selectedData?.slug}
            is_legislation_included={Boolean(selectedData?.is_legislation_included)}
            refetch={() => {
              if (page !== 1) {
                resetSubCategories();
              } else if (page === 1) {
                fetchSubCategories(true);
              }
            }}
            // setPage={setPage}
          />
        )}
        {deleteCategoryModal?.isOpen && (
          <ConfirmationPopup
            modal={deleteCategoryModal}
            bodyText={t(
              'CoursesManagement.CourseCategory.AddEditCategory.deleteText',
              {
                CATEGORY: selectedData?.name,
              }
            )}
            variants="primary"
            confirmButtonText={t('Button.deleteButton')}
            confirmButtonVariant="primary"
            cancelButtonText={t('Button.cancelButton')}
            cancelButtonFunction={deleteCategoryModal.closeModal}
            confirmButtonFunction={handleCategoryDelete}
          />
        )}
        {deleteSubCategoryModal?.isOpen && (
          <ConfirmationPopup
            modal={deleteSubCategoryModal}
            bodyText={t(
              'CoursesManagement.CourseCategory.AddEditSubCategory.deleteText',
              {
                SUBCATEGORY: selectedSubCategory?.name,
              }
            )}
            variants="primary"
            confirmButtonText={t('Button.deleteButton')}
            confirmButtonVariant="primary"
            cancelButtonText={t('Button.cancelButton')}
            cancelButtonFunction={deleteSubCategoryModal.closeModal}
            confirmButtonFunction={handleSubCategoryDelete}
          />
        )}
      </div>
    </>
  );
};

export default ViewCategory;
