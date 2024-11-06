import Button from 'components/Button/Button';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';
import { t } from 'i18next';
import { AddAttendeeEnum } from 'modules/CompanyManager/constants';
import { SelectionModalProps } from 'modules/CompanyManager/types';

const SelectionModal = ({
  modal,
  selectedOption,
  setSelectedOption,
  attendeeModal,
  existingAttendeeModal,
}: SelectionModalProps) => {
  const handleOptionChange = (option: AddAttendeeEnum) => {
    setSelectedOption(option);
  };

  const onNext = async () => {
    if (AddAttendeeEnum.newAttendee === selectedOption) {
      attendeeModal?.openModal?.();
      modal.closeModal();
    }
    if (AddAttendeeEnum.existingAttendee === selectedOption) {
      existingAttendeeModal?.openModal?.();
      modal.closeModal();
    }
  };

  return (
    <Modal
      headerTitle={t('CompanyManager.AttendeeList.addAttendee')}
      width="!max-w-[650px]"
      modal={modal}
    >
      <>
        <div className="grid grid-cols-2 gap-5">
          <div className="h-[213px] w-full">
            <div
              className={`bg-authBG/30 p-5  text-primary rounded-xl h-full flex items-center flex-col justify-center transition-all duration-300 ${
                selectedOption === AddAttendeeEnum.newAttendee
                  ? ' bg-primary text-white'
                  : ' text-dark'
              }`}
            >
              <label
                htmlFor={AddAttendeeEnum.newAttendee}
                className="flex items-center flex-col justify-center"
              >
                <Image iconName="drawPadIcon" iconClassName="w-[70px] h-[70px]" />
                <p className="text-current text-xl font-semibold mb-5 mt-2.5 text-center leading-[1.2]">
                  {t('CompanyManager.AttendeeList.addNewAttendeeTitle')}
                </p>
              </label>
              <span
                className={`cursor-pointer inline-flex items-center justify-center relative w-5 h-5 border-2 border-solid border-grayText rounded  ${
                  selectedOption === AddAttendeeEnum.newAttendee
                    ? ' bg-primary2 border-primary2'
                    : ''
                }`}
              >
                {selectedOption === AddAttendeeEnum.newAttendee ? (
                  <span className="absolute bottom-1 w-1.5 h-2.5 border-b-2 border-r-2 border-solid border-dark inline-block rotate-45" />
                ) : (
                  ''
                )}
                <input
                  type="radio"
                  className="appearance-none cursor-pointer opacity-0 w-full h-full"
                  id={AddAttendeeEnum.newAttendee}
                  name={AddAttendeeEnum.newAttendee}
                  checked={selectedOption === AddAttendeeEnum.newAttendee}
                  onChange={() => {
                    handleOptionChange(AddAttendeeEnum.newAttendee);
                  }}
                />
              </span>
            </div>
          </div>
          <div className="h-[213px] w-full">
            <div
              className={`bg-authBG/30 p-5  text-primary rounded-xl h-full flex items-center flex-col justify-center transition-all duration-300 ${
                selectedOption === AddAttendeeEnum.existingAttendee
                  ? ' bg-primary text-white'
                  : ' text-dark'
              }`}
            >
              <label
                htmlFor={AddAttendeeEnum.existingAttendee}
                className="flex items-center flex-col justify-center"
              >
                <Image iconName="drawPadIcon" iconClassName="w-[70px] h-[70px]" />
                <p className="text-current text-xl font-semibold mb-5 mt-2.5 text-center leading-[1.2]">
                  {t('CompanyManager.AttendeeList.addExistingAttendeeTitle')}
                </p>
              </label>
              <span
                className={`cursor-pointer inline-flex items-center justify-center relative w-5 h-5 border-2 border-solid border-grayText rounded  ${
                  selectedOption === AddAttendeeEnum.existingAttendee
                    ? ' bg-primary2 border-primary2'
                    : ''
                }`}
              >
                {selectedOption === AddAttendeeEnum.existingAttendee ? (
                  <span className="absolute bottom-1 w-1.5 h-2.5 border-b-2 border-r-2 border-solid border-dark inline-block rotate-45" />
                ) : (
                  ''
                )}
                <input
                  type="radio"
                  className="appearance-none cursor-pointer opacity-0 w-full h-full"
                  id={AddAttendeeEnum.existingAttendee}
                  name={AddAttendeeEnum.existingAttendee}
                  checked={selectedOption === AddAttendeeEnum.existingAttendee}
                  onChange={() => {
                    handleOptionChange(AddAttendeeEnum.existingAttendee);
                  }}
                />
              </span>
            </div>
          </div>
        </div>
        <Button
          variants="primary"
          className="w-fit mx-auto mt-7 gap-2"
          type="submit"
          disabled={!selectedOption}
          onClickHandler={onNext}
        >
          {t('CoursesManagement.nextTitle')}

          <Image iconName="arrowRightIcon" iconClassName="w-4 h-4" />
        </Button>
      </>
    </Modal>
  );
};

export default SelectionModal;
