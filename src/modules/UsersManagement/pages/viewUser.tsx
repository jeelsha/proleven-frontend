// ** Components ***
import StatusLabel from 'components/StatusLabel';
import DescriptionDetails from 'modules/UsersManagement/pages/descriptionDetails';
import { Link } from 'react-router-dom';
import { Rating } from 'react-simple-star-rating';

// ** Hooks
import { useAxiosGet } from 'hooks/useAxios';
import { useTitle } from 'hooks/useTitle';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// ** Types ***
import _ from 'lodash';
import { User } from 'modules/UsersManagement/types';

// ** Slice ***
import { useLanguage } from 'redux-toolkit/slices/languageSlice';

// ** Utils
import { getPresignedImageUrl } from 'services/aws.service';
import { displayUsers, formatCurrency, getCurrencySymbol } from 'utils';

interface UserInfoProps {
  user: User | null;
  refetch?: () => void;
  roleName: string /* For Dyanmic Title */;
}

export const getStarRating = (user: User, trainerRating?: number) => {
  if (_.isUndefined(trainerRating)) {
    return Number(user?.trainer?.rate_by_admin).toFixed(2);
  }
  if (Number.isNaN(Number(trainerRating))) {
    return 0;
  }
  return trainerRating;
};

const UserInfo = ({ user, refetch, roleName }: UserInfoProps) => {
  const { t } = useTranslation();

  const updateTitle = useTitle();

  const [trainerRating, setTrainerRating] = useState<number>();
  const [preloadedUrls, setPreloadedUrls] = useState<Record<string, string>>({});
  const [getRating] = useAxiosGet();
  const { language } = useSelector(useLanguage);

  const preloadUrls = async () => {
    const urls: Record<string, string> = {};
    const promises = user?.trainer?.trainerAttachment?.map(async (data) => {
      const url = await getPresignedImageUrl(
        data?.attachment_url,
        undefined,
        undefined,
        true
      );
      urls[data.attachment_url] = url;
    });
    if (promises) {
      await Promise.all(promises);
      setPreloadedUrls(urls);
    }
  };

  useEffect(() => {
    preloadUrls();
  }, [user]);

  const findDisplayLabel = (roleName: string) => {
    const user = displayUsers.find((user) => user.value === roleName);
    return user ? user.label : roleName;
  };

  updateTitle(
    `${findDisplayLabel(roleName ?? '')} ${t(
      'CoursesManagement.ViewCourse.Details'
    )}`
  );

  const getTrainerRating = async () => {
    const { data } = await getRating(`/dashboard/trainer-rate`, {
      params: {
        user_id: user?.id,
      },
    });
    if (data) setTrainerRating(data);
  };

  useEffect(() => {
    if (user?.id) getTrainerRating();
  }, [user?.id]);
  const statusRender = (item: string) => {
    const getStatusClass = () => {
      switch (item) {
        case `${t('Status.active')?.toUpperCase()}`:
          return 'completed';
        case `${t('Status.inactive')?.toUpperCase()}`:
          return 'cancelled';
        default:
          return 'pending';
      }
    };

    const statusClasses = ` ${getStatusClass()}`;

    return (
      <StatusLabel
        text={item}
        variants={getStatusClass()}
        className={`${statusClasses ?? ''}`}
      />
    );
  };

  const renderDetail = (label: string, value: string) => {
    return (
      <span className="flex gap-1 items-center w-full">
        <span className="text-sm leading-4 text-grayText max-w-[50%]">{label}</span>
        &nbsp;
        <span className="text-sm leading-5 text-dark font-medium">
          {label === 'Status' || label === 'Stato'
            ? statusRender(value)
            : value || '-'}
        </span>
      </span>
    );
  };

  const getText = (text: string) => {
    if (text) {
      return text.replace(/([A-Z])/g, ' $1');
    }
    return '';
  };
  const renderComp = (docs: { attachment_url: string }, index: number) => {
    const fileName = docs?.attachment_url.split('/');
    const extension = fileName[fileName.length - 1].split('.');

    return (
      <div
        key={`attachment_${index + 1}`}
        className="flex flex-wrap items-center mb-2"
      >
        <div className="h-auto min-h-[30px] w-16 flex items-center rounded-l-lg justify-center bg-gray-200 border border-solid border-gray-200 font-semibold text-[12px] text-gray-600">
          {extension[extension.length - 1]}
        </div>
        <div className="w-[calc(100%_-_64px)] px-4 rounded-r-lg  border border-solid border-gray-200 border-l-0 min-h-[30px] flex flex-col items-start justify-center">
          <p className="text-[12px] text-dark font-medium truncate">
            <Link
              to={preloadedUrls[docs?.attachment_url]}
              target="_blank"
              className="w-24 h-16 overflow-hidden"
            >
              {`${fileName[fileName.length - 1]}`}
            </Link>
          </p>
        </div>
      </div>
    );
  };

  const renderSubCategories = () => {
    return (
      user?.trainer?.trainerSubCategory &&
      user.trainer.trainerSubCategory.length > 0 && (
        <div>
          <p className="text-sm leading-4 text-grayText mb-2">
            {t('coursesOffered')}
          </p>
          <div className="flex flex-wrap gap-5">
            {user.trainer.trainerSubCategory.map((subCategory, index) => (
              <div
                key={`subCategory_${index + 1}`}
                className="flex flex-col items-start justify-center"
              >
                <StatusLabel
                  text={subCategory.sub_category.name}
                  variants="secondary"
                />
              </div>
            ))}
          </div>
        </div>
      )
    );
  };

  const categoryNames = (data: User) => {
    if (_.isEmpty(data.trainer?.trainerSubCategory)) {
      return '-';
    }
    const categoryName =
      data?.trainer?.trainerSubCategory?.map((item) => {
        return item?.sub_category?.category?.name;
      }) || [];
    const uniqueCategoryNames = [...new Set(categoryName)];
    return !_.isEmpty(uniqueCategoryNames) && uniqueCategoryNames.length > 0
      ? uniqueCategoryNames.join(',').toString()
      : '-';
  };

  const subCategoryName = user?.trainer?.trainerSubCategory?.map(
    (item) => item?.sub_category?.name
  );

  const getStatus = () => {
    switch (user?.active) {
      case 'ACTIVE':
        return t('Status.active')?.toUpperCase();
      case 'INACTIVE':
        return t('Status.inactive')?.toUpperCase();
      default:
        return '';
    }
  };

  useEffect(() => {
    refetch?.();
  }, [language]);

  return (
    <div className="flex flex-wrap ">
      <div className="w-full">
        {user && (
          <ul>
            <div className="grid grid-cols-1 gap-x-10 gap-y-6 1024:grid-cols-2">
              {renderDetail(
                t('UserManagement.addEditUser.fullName'),
                user?.full_name
              )}
              {renderDetail(t('UserManagement.addEditUser.email'), user?.email)}
              {renderDetail(t('UserManagement.addEditUser.contact'), user?.contact)}
              {renderDetail(
                t('UserManagement.addEditUser.role'),
                getText(user?.role?.name)
              )}
              {renderDetail(t('UserManagement.addEditUser.status'), getStatus())}

              {user.trainer && (
                <>
                  {renderDetail(
                    t('Trainer.invoice.trainerLocation'),
                    user?.trainer?.location
                  )}
                  {renderDetail(
                    t('UserManagement.addEditUser.hourlyRate'),
                    `${getCurrencySymbol('EUR')} ${formatCurrency(
                      Number(user.trainer.hourly_rate ?? 0),
                      'EUR'
                    )}`
                  )}
                  {user.trainer?.travel_reimbursement_fee &&
                    renderDetail(
                      t('UserManagement.addEditUser.travelReimbursement'),
                      `${getCurrencySymbol('EUR')} ${formatCurrency(
                        Number(user.trainer?.travel_reimbursement_fee),
                        'EUR'
                      )}/km`
                    )}
                  {Number(user.trainer?.reimbursement_threshold) !== 0 &&
                    renderDetail(
                      t('trainer.threshold'),
                      `${user.trainer?.reimbursement_threshold ?? '0'} km`
                    )}
                  {user.trainer?.codice_fiscale &&
                    renderDetail(
                      t('ClientManagement.clientForm.fieldInfos.codiceFiscale'),
                      `${user.trainer?.codice_fiscale ?? '0'}`
                    )}
                  {user.trainer?.vat_number &&
                    renderDetail(
                      t('ClientManagement.clientForm.fieldInfos.vatNumber'),
                      `${user.trainer?.vat_number ?? '0'}`
                    )}
                  {renderDetail(
                    t('CoursesManagement.CreateCourse.category'),
                    categoryNames(user)
                  )}
                  {renderDetail(
                    t('CoursesManagement.CreateCourse.subCategory'),
                    subCategoryName ? subCategoryName?.join(', ') : '-'
                  )}
                </>
              )}

              {!_.isEmpty(trainerRating) || user.trainer?.rate_by_admin ? (
                <div>
                  <span className="block w-full text-sm leading-4 text-grayText mb-2.5">
                    {t('surveyRating')}
                  </span>
                  <div className="flex gap-2 items-center">
                    <Rating
                      size={25}
                      initialValue={Number(getStarRating(user, trainerRating))}
                      transition
                      readonly
                      allowFraction
                      SVGstyle={{ display: 'inline' }}
                    />
                    <div className="text-sm leading-5 text-dark font-medium">
                      {getStarRating(user, trainerRating)}/5
                    </div>
                  </div>
                </div>
              ) : (
                ''
              )}

              {!_.isEmpty(user?.trainer?.trainerAttachment) && (
                <div>
                  <p className="text-sm leading-4 text-grayText mb-2">
                    {t('Auth.RegisterTrainer.trainerAttachment')}
                  </p>
                  <div className="flex flex-wrap gap-x-5 gap-y-6">
                    {user?.trainer?.trainerAttachment?.map((data, index) =>
                      renderComp(data, index)
                    )}
                  </div>
                </div>
              )}
              {renderSubCategories()}
            </div>
          </ul>
        )}
        <div className="mt-5">
          <DescriptionDetails t={t} user={user} />
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
