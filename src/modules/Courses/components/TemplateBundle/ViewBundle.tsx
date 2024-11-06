import Button from 'components/Button/Button';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import Table from 'components/Table/Table';
import { CellProps, ITableHeaderProps } from 'components/Table/types';
import { useAxiosDelete, useAxiosGet } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { Bundle, CourseBundle } from 'modules/Courses/types/TemplateBundle';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setToast } from 'redux-toolkit/slices/toastSlice';
import { ModalProps } from 'types/common';
import { customRandomNumberGenerator } from 'utils';

const AddEditTemplateBundle = React.lazy(
  () => import('modules/Courses/components/TemplateBundle/AddEditTemplateBundle')
);

type propTypes = {
  bundleModal?: ModalProps;
  setCurrentTabTitle?: React.Dispatch<React.SetStateAction<string>>;
  setCourseBundleId?: React.Dispatch<React.SetStateAction<number | null>>;
};
const ViewBundle = ({
  bundleModal,
  setCurrentTabTitle,
  setCourseBundleId,
}: propTypes) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const currentURL = new URL(window.location.href);
  const bundleSlug = currentURL.searchParams.get('slug');

  const [getBundleById, { isLoading }] = useAxiosGet();
  const [deleteBundleOrTemplateById, { isLoading: deletingBundle }] =
    useAxiosDelete();

  const modal = useModal();
  const dispatch = useDispatch();
  const [bundleData, setBundleData] = useState<Bundle>();
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [idToDelete, setIdToDelete] = useState<CourseBundle>();

  const actionRender = (item: CellProps) => {
    return (
      <div className="flex gap-2 items-center justify-center">
        <Button
          onClickHandler={() => {
            navigate(
              `/courses/template/view/${
                (item as unknown as CourseBundle)?.courseTemplate?.slug
              }`,
              {
                state: { isTemplateBundle: true, bundleSlug },
              }
            );
          }}
          parentClass="h-fit"
          className="action-button green-btn relative group"
          tooltipText={t('Tooltip.View')}
        >
          <Image
            iconName="eyeIcon"
            iconClassName=" w-5 h-5"
            width={24}
            height={24}
          />
        </Button>
        {bundleData && bundleData?.course_bundle?.length > 2 && (
          <Button
            onClickHandler={() => {
              setIdToDelete(item as unknown as CourseBundle);
              modal.openModal();
            }}
            parentClass="h-fit"
            className="action-button red-btn relative group"
            tooltipText={t('Tooltip.Delete')}
          >
            <Image iconName="crossRoundIcon" iconClassName=" w-5 h-5" />
          </Button>
        )}
      </div>
    );
  };

  const templateRender = (item: CellProps) => {
    return (
      <div className="flex">
        <div className="w-[100px] h-[70px]">
          <Image
            src={(item as unknown as CourseBundle).courseTemplate.image}
            width={100}
            height={100}
            imgClassName="w-full h-full object-cover rounded-lg"
            serverPath
          />
        </div>
        <div className="max-w-[220px] min-w-[200px] ps-2 flex flex-col justify-center flex-1">
          <p className="text-base text-dark leading-[1.3] mb-1">
            {(item as unknown as CourseBundle).courseTemplate.title}
          </p>
        </div>
      </div>
    );
  };

  const columnData: ITableHeaderProps[] = [
    {
      header: t('CoursesManagement.columnHeader.No'),
      name: 'no',
      option: {
        sort: false,
        hasFilter: false,
        isIndex: true,
      },
    },
    {
      header: t('CoursesManagement.columnHeader.Templates'),
      cell: (props) => templateRender(props),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('CoursesManagement.columnHeader.CourseCode'),
      name: 'courseTemplate.code',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('CoursesManagement.columnHeader.Category'),
      name: 'courseTemplate.courseCategory.name',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('CoursesManagement.columnHeader.SubCategory'),
      name: 'courseTemplate.courseSubCategory.name',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('CoursesManagement.columnHeader.Actions'),
      cell: (props) => actionRender(props),
      option: {
        sort: false,
        hasFilter: false,
      },
    },
  ];

  const fetchBundleData = async () => {
    const { data } = await getBundleById('/bundle', {
      params: { bundle_slug: bundleSlug },
    });
    setBundleData?.(data?.data?.[0]);
    setCurrentTabTitle?.(data?.data?.[0]?.title);
    setCourseBundleId?.(data?.data?.[0]?.id);
  };

  const handleDelete = async () => {
    if (bundleData && bundleData?.course_bundle?.length > 2) {
      if (idToDelete) {
        await deleteBundleOrTemplateById(
          '/bundle',
          {},
          { params: { bundle_id: bundleData?.id, template_id: idToDelete.id } }
        );
        modal.closeModal();
        fetchBundleData();
      }
    } else {
      dispatch(
        setToast({
          variant: 'Error',
          message: `${t('courseBundle.minimumError')}`,
          type: 'error',
          id: customRandomNumberGenerator(),
        })
      );
      modal.closeModal();
    }
  };

  useEffect(() => {
    if (bundleSlug) fetchBundleData();
  }, [bundleSlug]);

  return (
    <>
      {modal.isOpen && (
        <ConfirmationPopup
          modal={modal}
          bodyText={t('Bundle.deleteText', {
            BUNDLE: idToDelete?.courseTemplate?.title,
          })}
          confirmButtonText={t('Button.deleteButton')}
          confirmButtonVariant="danger"
          deleteTitle={t('Button.deleteTitle')}
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={modal.closeModal}
          confirmButtonFunction={handleDelete}
          isLoading={deletingBundle}
        />
      )}

      {bundleModal?.isOpen && (
        <AddEditTemplateBundle
          modal={bundleModal}
          bundle={bundleData}
          refetch={fetchBundleData}
        />
      )}

      <Table
        headerData={columnData}
        bodyData={bundleData?.course_bundle ?? []}
        loader={isLoading}
        pagination
        dataPerPage={limit}
        setLimit={setLimit}
        dataCount={bundleData?.course_bundle?.length}
        setSort={setSort}
        sort={sort}
      />
    </>
  );
};

export default ViewBundle;
