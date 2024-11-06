// **components**
import Button from 'components/Button/Button';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import NoDataFound from 'components/NoDataFound';
import AddEditAcademyModal from './components/AddEditAcademyModal';

// **constants**
import { FeaturesEnum, PermissionEnum } from 'constants/common.constant';

// **hooks**
import { UserModalType } from 'hooks/types';
import { useAxiosDelete } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useRolePermission } from 'hooks/useRolePermission';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// **types**
import { IAcademy } from './types';

export type academyProps = {
  addAddress?: UserModalType;
};
const Academies = ({ addAddress }: academyProps) => {
  const [DeleteAcademy] = useAxiosDelete();
  const { t } = useTranslation();
  const deleteModal = useModal();
  const [academies, setAcademies] = useState<null | IAcademy[]>(null);
  const [selectedData, setSelectedData] = useState<IAcademy | null>(null);
  const EditAcademy = useRolePermission(FeaturesEnum.Academy, PermissionEnum.Update);

  const {
    response,
    refetch: refetchAcademies,
    isLoading,
  } = useQueryGetFunction('/academy');
  useEffect(() => {
    setAcademies(response?.data?.data);
  }, [response]);

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <Image loaderType="Spin" />
      </div>
    );
  }
  const handleDelete = async () => {
    if (selectedData) {
      const { error } = await DeleteAcademy(`/academy?slug=${selectedData?.slug}`);

      if (!error) {
        setSelectedData(null);
        refetchAcademies();
      }
      deleteModal.closeModal();
    }
  };
  return (
    <div>
      <div className="flex flex-col gap-2.5 mt-5">
        {academies && academies?.length > 0 ? (
          academies?.map((item: IAcademy) => {
            return (
              <div key={item?.id} className="bg-primaryLight px-7 py-5 rounded-xl">
                <div className="flex flex-wrap">
                  <div className="max-w-[350px] w-full">
                    <p className="text-base font-semibold text-dark">{item?.name}</p>
                  </div>
                  <div className="max-w-[calc(100%_-_350px)] w-full">
                    <div className="bg-white p-5 pe-12 flex flex-col gap-1 relative">
                      <p className="text-base font-medium text-navText uppercase">
                        {t('AccountSetting.Address')} :
                      </p>
                      <p className="text-lg text-dark">{item?.location}</p>
                      {EditAcademy && (
                        <div className="flex gap-2 absolute top-4 right-4 ">
                          <Button
                            onClickHandler={() => {
                              setSelectedData?.(item);
                              addAddress?.openModal();
                            }}
                            className="w-6 h-6 inline-block text-primary   cursor-pointer select-none"
                          >
                            <Image
                              iconName="editPen"
                              iconClassName="w-full h-full"
                            />
                          </Button>
                          <Button
                            onClickHandler={() => {
                              if (deleteModal) {
                                if (item) {
                                  setSelectedData?.(item);
                                  deleteModal?.openModal();
                                }
                              }
                            }}
                            className="w-6 h-6 inline-block text-danger   top-4 right-0 cursor-pointer select-none"
                          >
                            <Image
                              iconName="deleteIcon"
                              iconClassName="w-full h-full"
                            />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <NoDataFound message="No academies found" />
        )}
      </div>
      {addAddress?.isOpen && (
        <AddEditAcademyModal
          modal={addAddress}
          data={selectedData}
          setData={setSelectedData}
          refetch={refetchAcademies}
          isView
        />
      )}
      {deleteModal && (
        <ConfirmationPopup
          modal={deleteModal}
          bodyText={t('Academy.DeleteBodyText', { NAME: selectedData?.name })}
          variants="primary"
          confirmButtonText={t('absentModal.confirm')}
          deleteTitle={t('Button.deleteTitle')}
          confirmButtonFunction={handleDelete}
          confirmButtonVariant="primary"
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={() => {
            deleteModal.closeModal();
          }}
        />
      )}
    </div>
  );
};
export default Academies;
