import { SuggestedTrainer } from 'modules/Courses/types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Rating } from 'react-simple-star-rating';

interface ISuggestedTrainerList {
  data: Array<SuggestedTrainer>;
  isLoading?: boolean;
}

const SuggestedTrainerList = ({ data, isLoading }: ISuggestedTrainerList) => {
  const { t } = useTranslation();

  const renderTrainer = (
    label: string,
    value: string | number | null,
    className?: string
  ) => {
    return (
      <p>
        <span
          className={`lg:hidden text-sm font-semibold text-dark mr-1 ${className}`}
        >
          {label} :
        </span>
        <span>{value ?? '-'}</span>
      </p>
    );
  };

  return (
    <div className="bg-offWhite3 rounded-lg p-4 w-full ">
      <h2 className='text-dark font-bold leading-[1.5] me-auto text-xl mb-5'>
        {t("CoursesManagement.CreateCourse.suggestedTrainer")}
      </h2>
      <div className="hidden lg:grid gap-3 lg:grid-cols-[32%_57%_15%] items-center w-full px-4 mb-4">
        <span className="text-sm font-semibold text-dark">
          {t('CoursesManagement.Resources.name')}
        </span>
        <span className="text-sm font-semibold text-dark">
          {t('CoursesManagement.CreateCourse.address')}
        </span>
        <span className="text-sm font-semibold text-dark">
          {t('CoursesManagement.CreateCourse.ratingTitle')}
        </span>
      </div>
      <div className="grid gap-4 max-h-[240px] overflow-auto w-full">
        {isLoading
          ? [1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="grid lg:grid-cols-[32%_60%_6%] gap-3 py-2 px-4 "
            >
              <p className="lazy h-7" />
              <p className="lazy h-7" />
              <p className="lazy h-7" />
            </div>
          ))
          : ''}
        {!isLoading &&
          data?.map((item) => {
            return (
              <Link
                key={item?.username}
                target="_blank"
                to={`/users/trainer/${item?.username}`}
                className="grid lg:grid-cols-[20%_60%_18%] gap-3 items-center bg-white shadow-sm rounded-md py-3 px-4 text-sm group transition duration-300 ease-in-out hover:shadow-lg"
              >
                {renderTrainer(t('CoursesManagement.Resources.name'), item?.name)}
                {renderTrainer(
                  t('CoursesManagement.CreateCourse.address'),
                  item?.address
                )}
                <p className="flex gap-2 items-center justify-end">
                  <Rating
                    size={25}
                    initialValue={item?.rate ?? 0}
                    transition
                    readonly
                    allowFraction
                    SVGstyle={{ display: 'inline' }}
                  />
                  <span className="text-sm leading-5 text-dark font-medium">{item?.rate ?? 0}/5</span>
                </p>

              </Link>
            );
          })}
      </div>
    </div>
  );
};

export default SuggestedTrainerList;