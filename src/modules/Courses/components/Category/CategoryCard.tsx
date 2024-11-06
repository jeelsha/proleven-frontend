import Button from 'components/Button/Button';
import Image from 'components/Image';
import { FeaturesEnum, PermissionEnum } from 'constants/common.constant';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useRolePermission } from 'hooks/useRolePermission';
import { CategoryCardProps } from 'modules/Courses/types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';

const CategoryCard = ({ deleteModal, data, isView, ...rest }: CategoryCardProps) => {
  const navigate = useNavigate();
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
    <div className="bg-white border border-solid border-borderColor rounded-xl">
      <div className="img-wrapper h-[242px] w-full overflow-hidden rounded-t-xl">
        <Image
          src={data ? data.image : `/images/no-image.png`}
          width={375}
          height={242}
          imgClassName="w-full h-full object-cover"
          serverPath
        />
      </div>
      <div className="flex px-4 py-3.5 justify-between">
        <div className="max-w-[calc(100%_-_150px)] w-full pe-2">
          <p className="text-lg font-medium text-dark">{data?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {isView && (
            <Button
              onClickHandler={() =>
                navigate(
                  `${PRIVATE_NAVIGATION.coursesManagement.category.path}/${data?.slug}`
                )
              }
              className="flex items-center gap-2.5 w-6 h-6 text-ic_1 active:scale-95 transition-all duration-300"
              tooltipText={t('Tooltip.View')}
            >
              <Image iconName="eyeIcon" iconClassName="w-full h-full" />
            </Button>
          )}
          {data &&
            ((editAccess && CurrentUser?.id === data.created_by) ||
              CurrentUser?.role_name === ROLES.Admin) && (
              <Button
                onClickHandler={() => {
                  if (rest.addModal) {
                    if (data) {
                      rest?.setSelectedData?.(data);
                      rest.addModal.openModal();
                    }
                  }
                }}
                className="flex items-center gap-2.5 w-6 h-6 active:scale-95 transition-all duration-300 p-0.5"
                tooltipText={t('Tooltip.Edit')}
              >
                <Image iconName="editIcon" iconClassName="w-full h-full" />
              </Button>
            )}
          {data &&
            ((deleteAccess && CurrentUser?.id === data.created_by) ||
              CurrentUser?.role_name === ROLES.Admin) && (
              <Button
                onClickHandler={() => {
                  if (deleteModal) {
                    if (data) {
                      rest?.setSelectedData?.(data);
                      deleteModal.openModal();
                    }
                  }
                }}
                className="flex items-center gap-2.5 w-6 h-6 active:scale-95 transition-all duration-300 text-red-600"
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

export default CategoryCard;
