// This component not in use
import InputField from 'components/FormElement/InputField';
import TextArea from 'components/FormElement/TextArea';
import Image from 'components/Image';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

export const Trainer = () => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <InputField
        placeholder="Enter fees"
        type="text"
        label="Travel Reimbursement Fees"
        name="travel_fees"
      />
      <InputField
        placeholder="$ | 000"
        isCompulsory
        type="text"
        label="Hourly Rate"
        name="travel_fees"
      />
      <div className="bg-gray-200 p-4 rounded-md flex items-center cursor-pointer">
        <span className="w-6 h-6 inline-block text-primary">
          <Image iconName="linkIcon" imgClassName="w-full h-full" />
        </span>
        <input type="file" ref={fileInputRef} className="hidden" />
        {t('UserProfile.settings.chooseFileTitle')}
      </div>
      <div className="flex">
        <TextArea
          parentClass="xl:col-span-2"
          rows={5}
          placeholder="Address"
          label={"Trainer's Location"}
          name="description"
        />
        <div className="flex items-center gap-x-2.5 px-4 py-2 border border-solid border-primary/50 rounded-lg h-fit cursor-pointer">
          <span className="w-6 h-6 inline-block text-primary/50">
            <Image iconName="locationIcon" imgClassName="w-full h-full" />
          </span>
          <span className="inline-block flex-[1_0_0%] truncate text-sm leading-4 text-primary font-medium">
            {t('UserProfile.settings.googleMapTitle')}
          </span>
          <button className="w-5 h-5 inline-block text-primary transition-all duration-300 active:scale-90">
            <Image iconName="arrowRightIcon" imgClassName="w-full h-full" />
          </button>
        </div>
      </div>
      <div className="bg-primary/10 p-4">
        <p>{t('UserProfile.settings.connectCalendar')}</p>
        <div className="flex gap-4">
          <Image iconName="googleCalendar" imgClassName="w-full h-full" />
          <Image iconName="outlookIcon" imgClassName="w-full h-full" />
          <Image iconName="icalIcon" imgClassName="w-full h-full" />
        </div>
      </div>
    </>
  );
};
