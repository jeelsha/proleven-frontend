import { Modal } from 'components/Modal/Modal';
import { REACT_APP_DATE_FORMAT_EUROPEAN } from 'config';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { ReminderDateModalProps } from '../types';

const PurchaseOrderReminderModal = ({
  modal,
  data,
}: ReminderDateModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      width="max-w-[400px]"
      modal={modal}
      headerTitle={t('clientPurchaseOrderDateTitle')}
    >
      <div>
        {data?.purchase_reminder && data?.purchase_reminder?.length > 0 && (<>
          <div className="text-md font-semibold mb-2"><p>Date</p></div>
          <div className="grid gap-1 grid-cols-3">
            {data?.purchase_reminder?.map((reminderDateData, index: number) => {
              return (
                <span key={`${data?.id}_${index + 1}`}>
                  {format(
                    new Date(reminderDateData),
                    REACT_APP_DATE_FORMAT_EUROPEAN as string
                  )}
                  {/* {reminderDateData} */}
                </span>
              );
            })}
          </div>
        </>)}
      </div>
    </Modal>
  );
};

export default PurchaseOrderReminderModal;
