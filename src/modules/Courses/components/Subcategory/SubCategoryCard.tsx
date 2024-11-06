import Button from 'components/Button/Button';
import Image from 'components/Image';
import { FeaturesEnum, PermissionEnum } from 'constants/common.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useRolePermission } from 'hooks/useRolePermission';
import { SubCategoryCardProps } from 'modules/Courses/types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';

const SubCategoryCard = ({
  data,
  setData,
  addModal,
  deleteModal,
}: SubCategoryCardProps) => {
  const { t } = useTranslation();
  const CurrentUser = useSelector(getCurrentUser);

  const deleteAccess = useRolePermission(
    FeaturesEnum.CourseInvitations,
    PermissionEnum.Delete
  );

  const editAccess = useRolePermission(
    FeaturesEnum.CourseInvitations,
    PermissionEnum.Update
  );
  return (
    <div>
      <div className="flex items-center gap-2 p-4 rounded-xl border border-solid border-navText/20 hover:bg-primary/10 transition-all duration-300 h-full">
        <p className="text-sm leading-5 text-dark font-medium w-full max-w-[calc(100%_-_60px)]">
          {data?.name as string}
        </p>
        <div className="flex items-center gap-1.5 w-[55px]">
          {data &&
            ((editAccess &&
              data?.created_by &&
              CurrentUser?.id === data?.created_by) ||
              CurrentUser?.role_name === ROLES.Admin) && (
              <Button
                onClickHandler={() => {
                  setData(data);
                  addModal.openModal();
                }}
                className="flex-[1_0_0%] inline-block active:scale-95 transition-all duration-300 p-0.5 pe-0 w-6 h-6"
                tooltipText={t('Tooltip.Edit')}
              >
                <Image iconName="editIcon" iconClassName="w-full h-full" />
              </Button>
            )}
          {data &&
            ((deleteAccess &&
              data?.created_by &&
              CurrentUser?.id === data?.created_by) ||
              CurrentUser?.role_name === ROLES.Admin) && (
              <Button
                onClickHandler={() => {
                  setData(data);
                  deleteModal.openModal();
                }}
                className="flex-[1_0_0%] inline-block active:scale-95 transition-all duration-300 text-red-600 w-6 h-6"
                tooltipText={t('Tooltip.Delete')}
              >
                <Image iconName="deleteIcon" iconClassName="w-full h-full" />
              </Button>
            )}
        </div>
      </div>
    </div>
  );
};

export default SubCategoryCard;
