import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Image from 'components/Image';
import StatusLabel from 'components/StatusLabel';
import { REACT_APP_DATE_FORMAT } from 'config';
import {
  FilteredSlot,
  IAssignedBundleTrainer,
} from 'modules/Courses/types/assignedBundleTrainer';
import { useTranslation } from 'react-i18next';
import { formatToUTC } from 'utils/date';

type IBundleAssignProps = {
  showAssignedBundleTrainers: IAssignedBundleTrainer;
};
const AssignedBundleTrainers = ({
  showAssignedBundleTrainers,
}: IBundleAssignProps) => {
  const { t } = useTranslation();

  const getTrainerType = (item: FilteredSlot) => {
    if (!item.is_full_course) return t('ExtraTrainer');
    if (item.is_optional) return t('OptionalTrainer');
    return t('MainTrainer');
  };
  return (
    <div className="bg-[#F3F3F5] p-5 rounded-xl mb-5">
      <CustomCard
        cardClass="!shadow-none border border-solid border-gray-300/70"
        title={t('assignedTrainers')}
        minimal
      >
        <div>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(showAssignedBundleTrainers?.filteredSlots)?.map(
              ([date, slots], k) => {
                return (
                  <div
                    key={`${k + 1}_item`}
                    className="p-4 rounded-lg bg-[#F3F3F5] text-sm grid content-start gap-4 shadow-md"
                  >
                    <div>
                      <p className="font-bold">{formatToUTC(date, (REACT_APP_DATE_FORMAT as string))}</p>
                    </div>

                    <div>
                      {slots?.map((item, index) => (
                        <div
                          key={index}
                          className="w-full flex items-center gap-2 mt-2"
                        >
                          {item.available ? (
                            ''
                          ) : (
                            <Button
                              parentClass="h-fit"
                              tooltipText={t('trainerAbsent')}
                            >
                              <Image
                                iconName="redExclamationMarkIcon"
                                iconClassName="shrink-0 w-5 h-5"
                              />
                            </Button>
                          )}
                          <p>{item?.assignedToUser?.full_name}</p>

                          <StatusLabel
                            className="ml-auto shrink-0"
                            text={getTrainerType(item)}
                            variants="secondary"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </CustomCard>
    </div>
  );
};

export default AssignedBundleTrainers;
