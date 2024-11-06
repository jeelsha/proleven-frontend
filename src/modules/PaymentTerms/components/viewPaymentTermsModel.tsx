import { Modal } from 'components/Modal/Modal';
import { useTranslation } from 'react-i18next';
import { PaymentTermsProps, customType, paymentDue } from '../types';

type propsType = {
  modal: {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
  };
  selectedViewData: PaymentTermsProps | null;
};

const ViewPaymentTermsModel = ({ modal, selectedViewData }: propsType) => {
  const { t } = useTranslation();
  const parsedSelectedData =
    typeof selectedViewData?.custom === 'string'
      ? JSON.parse(selectedViewData?.custom)
      : selectedViewData?.custom;

  return (
    <Modal
      modal={modal}
      closeOnOutsideClick
      width="!max-w-[800px]"
      headerTitle={t('Payment.view')}
    >
      <div className="flex flex-wrap">
        <div className="w-full pe-5 max-w-[calc(100%_-_450px)] flex flex-col gap-y-4">
          <div className="">
            <span className="text-xs text-navText inline-block mb-1">
              {t('Payment.name')}
            </span>
            <p className="text-base font-semibold">{selectedViewData?.name}</p>
          </div>
          <div className="">
            <span className="text-xs text-navText inline-block mb-1">
              {t('Payment.mode')}
            </span>
            <div className="text-base font-semibold">
              {selectedViewData?.payment_mode}
            </div>
          </div>
        </div>
        <div className=" bg-primaryLight py-5 px-6 rounded-xl w-full max-w-[450px]">
          <div className="mb-3">
            <span className="text-xs text-navText inline-block mb-1">
              {t('Payment.due')}
            </span>
            <p className="text-base font-semibold">
              {selectedViewData?.payment_due}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {selectedViewData?.custom && selectedViewData?.custom.length > 0 ? (
              (parsedSelectedData ?? [])?.map((item: customType, index: number) => {
                return (
                  <div
                    className="grid grid-cols-2 gap-3"
                    key={`custom_${index + 1}`}
                  >
                    <div className="bg-white p-4 rounded-lg min-h-[82px] flex flex-col">
                      <span className="text-xs text-navText inline-block mb-1 flex-auto">
                        {t('Payment.days')}
                      </span>
                      <p className="text-base font-semibold">{item?.days}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg min-h-[82px] flex flex-col">
                      <span className="text-xs text-navText inline-block mb-1 flex-auto">
                        {t('Payment.percentage')}
                      </span>
                      <p className="text-base font-semibold">
                        {item?.payment_percentage}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg col-span-2 min-h-[82px] flex flex-col">
                      <span className="text-xs text-navText inline-block mb-1 flex-auto">
                        {t('payment.endOfMonth')}
                      </span>
                      <p className="text-base font-semibold">
                        {item?.custom_due_days}
                        {t('payment.dueAfterDue')}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedViewData?.days && (
                  <div className="bg-white py-1.5 px-2.5 rounded-lg w-full max-w-[60px]">
                    <span className="text-xs text-navText inline-block mb-1">
                      {t('Payment.days')}
                    </span>
                    <p className="text-base font-semibold">
                      {selectedViewData?.days}
                    </p>
                  </div>
                )}
                {selectedViewData?.payment_percentage && (
                  <div className="bg-white py-1.5 px-2.5 rounded-lg flex-[1_0_0%]">
                    <span className="text-xs text-navText inline-block mb-1">
                      {t('Payment.percentage')}
                    </span>
                    <p className="text-base font-semibold">
                      {selectedViewData?.payment_percentage}
                    </p>
                  </div>
                )}
                {selectedViewData?.payment_due !== paymentDue.IMMEDIATE && (
                  <div className="bg-white py-1.5 px-2.5 rounded-lg flex-[1_0_0%]">
                    <span className="text-xs text-navText inline-block mb-1">
                      {t('payment.endOfMonth')}
                    </span>
                    <p className="text-base font-semibold">
                      {selectedViewData?.due_days}
                      {t('payment.dueAfterDue')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewPaymentTermsModel;
