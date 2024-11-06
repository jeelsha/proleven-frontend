import Button from 'components/Button/Button';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useAxiosDelete, useAxiosPut } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { accessFunc } from 'modules/Courses/helper';
import { Bundle } from 'modules/Courses/types/TemplateBundle';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';

interface BundleCardType {
  bundle: Bundle;
  refetch: () => void;
  deleteAccess: boolean;
  editAccess: boolean;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<number | null>>;
}
const BundleCard = ({
  bundle,
  refetch,
  deleteAccess,
  editAccess,
  isEditing,
  setIsEditing,
}: BundleCardType) => {
  const { t } = useTranslation();


  const navigate = useNavigate();
  const user = useSelector(getCurrentUser);
  const inputRef = useRef<HTMLInputElement>(null);
  const modal = useModal();

  const [deleteBundleOrTemplateById, { isLoading }] = useAxiosDelete();
  const [updateBundleApi] = useAxiosPut();

  const [value, setValue] = useState(bundle.title);

  const handleDelete = async () => {
    if (bundle) {
      await deleteBundleOrTemplateById(
        '/bundle',
        {},
        { params: { bundle_id: bundle.id } }
      );
      modal.closeModal();
      refetch();
    }
  };
  const handleUpdate = async () => {
    if (value) {
      const formData = new FormData();
      formData.append('title', value);
      formData.append('id', JSON.stringify(bundle.id));
      await updateBundleApi('/bundle', formData);
      setIsEditing(null);
      refetch();
    }
  };
  const toggleIsEditing = () => {
    setIsEditing(null);
    setValue(bundle.title);
  };
  const handleIsEditing = (e: MouseEvent) => {
    const targetNode = e.target as HTMLElement;
    if (
      targetNode?.nodeName === 'INPUT' ||
      targetNode?.nodeName === 'BUTTON' ||
      targetNode?.nodeName === 'svg'
    )
      return;

    setIsEditing(null);
    setValue(bundle.title);
  };

  const rolePermission = accessFunc(bundle?.access ?? [], user?.id);

  useEffect(() => {
    if (inputRef) inputRef.current?.select();
    if (isEditing) document.addEventListener('mousedown', handleIsEditing);
    return () => document.removeEventListener('mousedown', handleIsEditing);
  }, [isEditing]);

  return (
    <>
      <div className="border border-solid border-borderColor rounded-lg p-4">
        <div className="flex items-center pb-4 border-b border-solid border-borderColor">
          <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center p-3">
            <Image iconName="bookIcon" iconClassName="w-full h-full" />
          </div>
          <div className="max-w-[calc(100%_-_40px)] ps-2">
            {!isEditing ? (
              <h5 className="text-xl font-semibold text-dark truncate">
                {bundle.title}
              </h5>
            ) : (
              <div className="flex justify-between">
                <input
                  ref={inputRef}
                  className="text-xl font-semibold text-dark truncate"
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdate();
                    if (e.key === 'Escape') toggleIsEditing();
                  }}
                  // onBlur={toggleIsEditing}
                  autoComplete="off"
                />
                <Button
                  onClickHandler={() => {
                    handleUpdate();
                  }}
                >
                  <Image iconName="checkRoundIcon" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,_minmax(56px,_56px))] gap-3 mt-4">
          {(bundle.course_bundle ?? []).map((item) => (
            <div
              key={item?.id}
              className="bg-black/10 rounded-lg overflow-hidden aspect-square"
            >
              <Image
                src={item?.courseTemplate?.image}
                imgClassName="w-full h-full object-cover"
                serverPath
              />
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-center gap-2">
          <Button
            className="action-button green-btn"
            onClickHandler={() =>
              navigate(
                `${PRIVATE_NAVIGATION.coursesManagement.templateBundle.path}/view?slug=${bundle?.slug}`
              )
            }
            tooltipText={t('Tooltip.View')}
          >
            <Image iconClassName=" w-5 h-5" iconName="eyeIcon" />
          </Button>

          {!isEditing &&
            (rolePermission?.edit ||
              (editAccess && user?.id === String(bundle?.created_by)) ||
              user?.role_name === ROLES.Admin) ? (
            <Button
              className="action-button primary-btn"
              onClickHandler={() => {
                setValue(bundle.title);
                setIsEditing(bundle?.id);
              }}
              tooltipText={t('Tooltip.Edit')}
            >
              <Image iconClassName=" w-5 h-5" iconName="editIcon" />
            </Button>
          ) : (
            ''
          )}

          {rolePermission?.delete ||
            (deleteAccess && user?.id === String(bundle?.created_by)) ||
            user?.role_name === ROLES.Admin ? (
            <Button
              className="action-button red-btn"
              onClickHandler={() => {
                setIsEditing(null);
                modal.openModal();
              }}
              tooltipText={t('Tooltip.Delete')}
            >
              <Image iconClassName=" w-5 h-5" iconName="deleteIcon" />
            </Button>
          ) : (
            ''
          )}
        </div>
      </div>
      {modal.isOpen && (
        <ConfirmationPopup
          modal={modal}
          bodyText={t('Bundle.deleteText', {
            BUNDLE: bundle.title,
          })}
          confirmButtonText={t('Button.deleteButton')}
          confirmButtonVariant="danger"
          deleteTitle={t('Button.deleteTitle')}
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={modal.closeModal}
          confirmButtonFunction={handleDelete}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default BundleCard;
