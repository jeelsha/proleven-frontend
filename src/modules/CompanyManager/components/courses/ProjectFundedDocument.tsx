import PageHeader from 'components/PageHeader/PageHeader';
import { REACT_APP_API_BASE_URL } from 'config';
import _ from 'lodash';
import { CourseDetailProps } from 'modules/CompanyManager/types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const ProjectFundedDocument = (props: {
  projectFundedDocs: CourseDetailProps['project_funded_docs'];
}) => {
  const { projectFundedDocs } = props;
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader text={t('CompanyManager.courseDetails.projectFundedDocs')} small />
      {!_.isEmpty(projectFundedDocs) &&
        projectFundedDocs?.map((docs, index) => {
          const fileName = docs?.attachment_url.split('/');
          const extension = fileName[fileName.length - 1].split('.');
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
        })}
    </div>
  );
};

export default ProjectFundedDocument;
