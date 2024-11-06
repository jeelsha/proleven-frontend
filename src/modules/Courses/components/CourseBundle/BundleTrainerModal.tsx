// ** Components **
import NoDataFound from 'components/NoDataFound';
import TrainersList from 'modules/Courses/components/Common/TrainersList';
import SearchComponent from 'components/Table/search';

// ** Formik **
import { useField } from 'formik';

// ** Types **
import { ICourseTrainer } from 'modules/Courses/types';
import { Trainer } from 'modules/Courses/types/TrainersAndRooms';

// ** Hooks **
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BundleTrainerModalProps {
  response: Array<Trainer>;
  name: string;
  selectedValues?: Array<ICourseTrainer> | null;
}
const BundleTrainerModal = ({
  response,
  name,
  selectedValues,
}: BundleTrainerModalProps) => {
  const { t } = useTranslation();
  // ** Formik
  const [field, , helpers] = name ? useField(name) : [];

  // ** States
  const [filteredData, setFilteredData] = useState<Array<Trainer>>(response);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<
    Array<ICourseTrainer>
  >(selectedValues ?? []);
  const [search, setSearch] = useState('');

  const filterDataWithSearchString = () => {
    setFilteredData(() =>
      (response ?? []).filter((item) =>
        item?.name?.toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  // ** useEffects
  useEffect(() => {
    helpers?.setValue(selectedCheckboxes);
  }, [selectedCheckboxes]);

  useEffect(() => {
    filterDataWithSearchString();
  }, [search]);
  return (
    <div className="w-full bg-white rounded-lg shadow-lg shadow-black/20 border absolute">
      <div className="p-5 rounded-b-lg">
        <SearchComponent
          placeholder={t('ProjectManagement.CustomCardModal.memberSearch')}
          onSearch={(e) => setSearch(e.target.value)}
          parentClass="min-w-[100%]"
          value={search}
          onClear={() => setSearch('')}
        />
        {Array.isArray(filteredData) && filteredData?.length > 0 ? (
          <TrainersList
            filteredData={filteredData}
            selectedCheckboxes={selectedCheckboxes}
            setSelectedCheckboxes={setSelectedCheckboxes}
            field={field}
          />
        ) : (
          <NoDataFound />
        )}
      </div>
    </div>
  );
};

export default BundleTrainerModal;
