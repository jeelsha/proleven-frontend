import PageHeader from 'components/PageHeader/PageHeader';
import { REACT_APP_API_BASE_URL } from 'config';
import { ROLES } from 'constants/roleAndPermission.constant';
import _ from 'lodash';
import { CourseFundedDocsProps } from 'modules/CompanyManager/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { getPresignedImageUrl } from 'services/aws.service';

const CourseFundedDocument = (props: {
  courseFundedDocs: CourseFundedDocsProps[];
  header?: string;
  className?: string;
}) => {
  const { courseFundedDocs, header, className } = props;
  const user = useSelector(getCurrentUser);

  const [preloadedUrls, setPreloadedUrls] = useState<Record<string, string>>({});

  const { t } = useTranslation();

  useEffect(() => {
    preloadUrls()
  }, [])

  const preloadUrls = async () => {
    const urls: Record<string, string> = {};
    const promises = (courseFundedDocs ?? [])?.map(async (docs) => {
      const url = await getPresignedImageUrl(
        docs.attachment_url,
        undefined,
        undefined,
        true
      );
      urls[docs.attachment_url] = url;
    });
    await Promise.all(promises);
    setPreloadedUrls(urls);
  }

  const renderComp = (docs: CourseFundedDocsProps, index: number) => {
    const fileName = docs?.attachment_url.split('/');
    const extension = fileName[fileName.length - 1].split('.');
    const url = preloadedUrls[docs?.attachment_url];

    if (user?.role_name === ROLES.Trainer && docs?.show_trainer) {
      return (
        <div
          key={`attachment_${index + 1}`}
          className="flex flex-wrap items-center mb-2"
        >
          <div className="h-auto min-h-[80px] w-32 flex items-center rounded-l-lg justify-center bg-gray-200 border border-solid border-gray-200 font-semibold text-xl text-gray-600">
            {extension[extension.length - 1]}
          </div>
          <div className="w-[calc(100%_-_128px)] ps-4 rounded-r-lg  border border-solid border-gray-200 border-l-0 min-h-[80px] flex flex-col items-start justify-center">
            <p className="text-sm text-dark font-medium truncate">
              <Link
                to={url}
                target="_blank"
                className="w-24 h-16 overflow-hidden"
              >
                {`${fileName[fileName.length - 1]}`}
              </Link>
            </p>
          </div>
        </div>
      );
    }
    if (user?.role_name === ROLES.CompanyManager && docs?.show_company_manager) {
      return (
        <div
          key={`attachment_${index + 1}`}
          className="flex flex-wrap items-center mb-2"
        >
          <div className="h-auto min-h-[80px] w-32 flex items-center rounded-l-lg justify-center bg-gray-200 border border-solid border-gray-200 font-semibold text-xl text-gray-600">
            {extension[extension.length - 1]}
          </div>
          <div className="w-[calc(100%_-_128px)] ps-4 rounded-r-lg  border border-solid border-gray-200 border-l-0 min-h-[80px] flex flex-col items-start justify-center">
            <p className="text-sm text-dark font-medium truncate">
              <Link
                to={url}
                target="_blank"
                className="w-24 h-16 overflow-hidden"
              >
                {`${fileName[fileName.length - 1]}`}
              </Link>
            </p>
          </div>
        </div>
      );
    }
    return (
      <div
        key={`attachment_${index + 1}`}
        className="flex flex-wrap items-center mb-2"
      >
        <div className="h-auto min-h-[80px] w-32 flex items-center rounded-l-lg justify-center bg-gray-200 border border-solid border-gray-200 font-semibold text-xl text-gray-600">
          {extension[extension.length - 1]}
        </div>
        <div className="w-[calc(100%_-_128px)] ps-4 rounded-r-lg  border border-solid border-gray-200 border-l-0 min-h-[80px] flex flex-col items-start justify-center">
          <p className="text-sm text-dark font-medium truncate">
            <Link
              to={`${REACT_APP_API_BASE_URL}/${docs?.attachment_url}`}
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

  return (
    <div className={className}>
      <PageHeader
        text={header ?? t('CompanyManager.courseDetails.courseFundedDocs')}
        small
      />
      {!_.isEmpty(courseFundedDocs) &&
        courseFundedDocs?.map((docs, index) => {
          return renderComp(docs, index);
        })}
    </div>
  );
};

export default CourseFundedDocument;
