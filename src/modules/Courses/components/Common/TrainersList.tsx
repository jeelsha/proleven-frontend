// ** Components **
import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import Image from 'components/Image';

// ** Types **
import { FieldInputProps } from 'formik';
import { TrainerSelected } from 'modules/Courses/Constants';
import { ICourseTrainer } from 'modules/Courses/types';
import { Trainer } from 'modules/Courses/types/TrainersAndRooms';
import { Link } from 'react-router-dom';

interface TrainersListProps {
  filteredData: Array<Trainer>;
  selectedCheckboxes: Array<ICourseTrainer>;
  setSelectedCheckboxes: React.Dispatch<React.SetStateAction<Array<ICourseTrainer>>>;
  field?: FieldInputProps<string>;
  formLanguage?: string;
}

const TrainersList = ({
  filteredData,
  selectedCheckboxes,
  setSelectedCheckboxes,
  field,
}: TrainersListProps) => {
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value: checkboxValue, checked: isChecked } = event.target;
    const trainerId = Number(checkboxValue);
    if (isChecked && trainerId)
      setSelectedCheckboxes([
        ...selectedCheckboxes,
        { assigned_to: trainerId, is_lesson_trainer: false },
      ]);
    else
      setSelectedCheckboxes(
        selectedCheckboxes.filter(({ assigned_to }) => assigned_to !== trainerId)
      );
  };
  return (
    <div className="my-4 flex flex-col gap-y-2">
      <div className="flex justify-center items-center gap-1.5">
        <div className="w-full">
          <div className="max-h-[300px] overflow-auto px-px">
            <div className="flex flex-col w-full gap-2.5 first:mt-0 mt-5">
              {(filteredData ?? []).map((member, index) => {
                return (
                  <div
                    key={`member_${index + 1}`}
                    className="flex w-full gap-3 items-center justify-between"
                  >
                    <div className="flex gap-2 items-center w-full max-w-[calc(100%_-_30px)]">
                      <div className="w-8 h-8 rounded-full">
                        <Image
                          src={member?.profile_image ?? undefined}
                          firstName={
                            !member?.profile_image ? member?.username : undefined
                          }
                          imgClassName="w-full h-full object-cover rounded-full"
                          showImageLoader
                          serverPath
                        />
                      </div>
                      <label
                        htmlFor={String(member?.id)}
                        className="cursor-pointer flex items-center gap-1"
                      >
                        {member?.name}
                        <Link
                          target="_blank"
                          to={`/users/trainer/${member?.username}`}
                        >
                          <Button className="w-5 h-5 bg-transparent p-0.5 text-primary flex items-center justify-center -rotate-45 hover:rotate-0 transition-all duration-300">
                            <Image iconName="arrowRight" iconClassName="" />
                          </Button>
                        </Link>
                      </label>

                      <div className="ml-auto flex items-center gap-1 bg-primary/20 text-primary text-sm px-1.5 py-0.5 rounded font-semibold">
                        {member?.suggested ? (
                          <Image
                            iconName="doubleUpArrow"
                            iconClassName="w-4 h-4"
                            width={24}
                            height={24}
                          />
                        ) : (
                          ''
                        )}
                        <span>{member?.rate}</span>
                        <Image
                          iconName="starIcon"
                          iconClassName="w-4 h-4"
                          width={24}
                          height={24}
                        />

                        {member?.selected_status === TrainerSelected.Unavailable ? (
                          <span className="error">
                            <Image
                              iconName="redExclamationMarkIcon"
                              iconClassName="w-5 h-5"
                              width={24}
                              height={24}
                            />
                          </span>
                        ) : (
                          ''
                        )}
                      </div>
                    </div>
                    <div className="mr-[2px]">
                      <Checkbox
                        {...field}
                        parentClass="h-fit"
                        value={member?.id}
                        id={String(member?.id)}
                        check={selectedCheckboxes
                          .map((item) => item.assigned_to)
                          .includes(member?.id)}
                        showError={false}
                        onChange={(e) => handleCheckboxChange(e)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainersList;
