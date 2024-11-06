import Image from 'components/Image';
import NoDataFound from 'components/NoDataFound';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { formatCurrency, getCurrencySymbol } from 'utils';
import { ITrainerInvoice } from '../types';

const TrainerDetail = (props: {
  trainerData: ITrainerInvoice['trainer'] | null;
}) => {
  const { trainerData } = props;
  const { t } = useTranslation();

  const trainerDetail =
    trainerData !== null
      ? [
          {
            label: t('Trainer.invoice.trainerName'),
            value: trainerData?.full_name ?? '-',
          },
          {
            label: t('Trainer.invoice.trainerPhone'),
            value: trainerData?.contact ?? '-',
          },
          {
            label: t('Trainer.invoice.trainerLocation'),
            value: trainerData?.trainer?.location ?? '-',
          },
          {
            label: t('Trainer.invoice.trainerEmail'),
            value: trainerData?.email ?? '-',
          },
        ]
      : [];
  const trainerPriceAndCourse =
    trainerData !== null
      ? [
          {
            label: t('Trainer.invoice.trainerHourlyRate'),
            value:
              trainerData?.trainer?.hourly_rate != null
                ? `${getCurrencySymbol('EUR')} ${formatCurrency(
                    Number(trainerData.trainer.hourly_rate),
                    'EUR'
                  )}`
                : '-',
          },
          {
            label: t('Trainer.invoice.trainerReimbursementFee'),
            value:
              trainerData?.trainer?.travel_reimbursement_fee != null
                ? `${getCurrencySymbol('EUR')} ${formatCurrency(
                    Number(trainerData.trainer.travel_reimbursement_fee),
                    'EUR'
                  )}/km`
                : '-',
          },
          {
            label: t('Trainer.invoice.trainerReimbursementThreshold'),
            value: trainerData?.trainer?.reimbursement_threshold
              ? `${trainerData?.trainer?.reimbursement_threshold} km`
              : '-',
          },
        ]
      : [];

  return (
    <div className="flex items-center">
      {trainerData !== null ? (
        <>
          <div className="h-24 w-24 p-1 border border-solid border-borderColor rounded-full">
            <Image
              src={trainerData?.profile_image ?? '/images/no-image.png'}
              imgClassName="block block w-full h-full rounded-full"
              serverPath
            />
          </div>
          <div className="ps-6 max-w-[calc(100%_-_100px)] w-full">
            <div className="group grid grid-cols-2 1200:grid-cols-4 gap-4">
              {!_.isEmpty(trainerDetail) &&
                trainerDetail?.map((data) => (
                  <div className="">
                    <span className="block text-sm text-dark/50 mb-1 font-medium">
                      {data?.label}
                    </span>
                    <p className="text-sm text-dark font-semibold">{data?.value}</p>
                  </div>
                ))}
            </div>
            <div className="group grid grid-cols-2 1200:grid-cols-4 gap-4">
              {!_.isEmpty(trainerPriceAndCourse) &&
                trainerPriceAndCourse?.map((data) => (
                  <div className="border-t border-solid border-borderColor pt-5 mt-5">
                    <span className="block text-sm text-dark/50 mb-1 font-medium">
                      {data?.label}
                    </span>
                    <p className="text-sm text-dark font-semibold">{data?.value}</p>
                  </div>
                ))}
            </div>
          </div>
        </>
      ) : (
        <div className="mx-auto ">
          <NoDataFound />
        </div>
      )}
    </div>
  );
};

export default TrainerDetail;
