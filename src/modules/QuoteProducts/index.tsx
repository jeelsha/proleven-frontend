import Button from 'components/Button/Button';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import SearchComponent from 'components/Table/search';

import CustomCard from 'components/Card';
import { IconTypes } from 'components/Icon/types';
import TabComponent from 'components/Tabs';
import useUpdateQueryParameters from 'hooks/useSearchQuery';
import { useTitle } from 'hooks/useTitle';
import _ from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { currentPageCount } from 'redux-toolkit/slices/paginationSlice';
import AcademicProducts from './components/AcademicProducts';
import PrivateProducts from './components/PrivateProducts';
import ProductFilter from './components/ProductFilter';
import { ProductFilterType } from './types';

type tabProps = {
  title: string;
  component: JSX.Element;
  icon?: IconTypes;
};

const PARAM_MAPPING = {
  status: 'status',
  productType: 'productType',
};

const QuoteProducts = () => {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle()
  updateTitle(t('completedCourses'))

  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('id');
  const [search, setSearch] = useState<string>('');
  const [filterModal, setFilterModal] = useState(false);
  const dispatch = useDispatch();
  const [productFilters, setProductFilters] = useState<ProductFilterType>({
    status: params.getAll('status') ?? [],
    productType: params.getAll('productType') ?? [],
  });
  const modalRef: React.RefObject<HTMLDivElement> = useRef(null);
  const isTemplateCheck = useCallback((filters: Record<string, string>) => {
    return Object.values(filters).some((value) => {
      return typeof value === 'object'
        ? Object.values(value).some((item) => !_.isEmpty(item))
        : !_.isEmpty(value);
    });
  }, []);

  useUpdateQueryParameters(
    productFilters,
    PARAM_MAPPING,
    'isProduct',
    isTemplateCheck
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setFilterModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const tabs: tabProps[] = [
    {
      title: 'privateCourses',
      component: (
        <PrivateProducts
          sort={sort}
          limit={limit}
          setSort={setSort}
          setLimit={setLimit}
          setProductFilters={setProductFilters}
          t={t}
          filterModal={filterModal}
          setFilterModal={setFilterModal}
          search={search}
        />
      ),
      icon: 'bookIcon',
    },
    {
      title: 'academyCourses',
      component: (
        <AcademicProducts
          sort={sort}
          limit={limit}
          setSort={setSort}
          setLimit={setLimit}
          setProductFilters={setProductFilters}
          t={t}
          filterModal={filterModal}
          setFilterModal={setFilterModal}
          search={search}
        />
      ),
      icon: 'bookIcon',
    },
  ];
  const [activeTab, setActiveTab] = useState(0);
  return (
    <>
      <PageHeader small text={t('completedCourses')}>
        <div className="flex flex-wrap justify-end gap-2 items-center">
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
          <div className="relative">
            <Button
              variants="primary"
              className="gap-1 !flex !py-2.5 !px-3.5"
              onClickHandler={() => {
                setFilterModal(!filterModal);
              }}
            >
              <Image iconName="filterIcon2" iconClassName="w-4 h-4" />
              {t('Calendar.filterButton')}
            </Button>
            {filterModal && (
              <div
                ref={modalRef}
                className={`${
                  filterModal && 'z-1'
                } absolute  top-full mt-2 right-0 before:absolute transition-all duration-300`}
              >
                <div className="bg-white rounded-xl shadow-xl w-[340px]">
                  <div className="px-5 py-3.5 border-b border-solid border-offWhite">
                    <h5 className="text-base leading-5 font-semibold text-dark">
                      {t('ProjectManagement.Header.filter')}
                    </h5>
                  </div>
                  <div className="px-5 py-3">
                    <div className="flex flex-col gap-y-3 mt-4">
                      <ProductFilter
                        setFilterModal={setFilterModal}
                        setProductFilters={setProductFilters}
                        productFilters={productFilters}
                        t={t}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageHeader>
      <CustomCard minimal>
        <TabComponent
          current={activeTab}
          onTabChange={(status) => {
            dispatch(currentPageCount({ currentPage: 1 }));
            setActiveTab(status);
          }}
        >
          {tabs.map(({ title, component, icon }, index) => (
            <TabComponent.Tab key={`TAB_${index + 1}`} title={t(title)} icon={icon}>
              {activeTab === index && component}
            </TabComponent.Tab>
          ))}
        </TabComponent>
      </CustomCard>
    </>
  );
};

export default QuoteProducts;
